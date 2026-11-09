import { useAuth } from "@clerk/expo";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { apiRequest, type RequestOptions } from "./http";
import type {
  Leaderboard,
  LeaderboardPeriod,
  LogResult,
  LogsPage,
  NewLog,
  Profile,
  ProfileUpdate,
  Stats,
} from "./types";

/** `fetch` for the Atmo-Care API with the signed-in user's Clerk token. */
export function useApi() {
  const { getToken } = useAuth();
  return useCallback(
    async <T>(path: string, options?: RequestOptions) =>
      apiRequest<T>(path, await getToken(), options),
    [getToken],
  );
}

export const queryKeys = {
  me: ["me"] as const,
  stats: ["stats"] as const,
  logs: ["logs"] as const,
  favorites: ["favorites"] as const,
  leaderboard: (period: LeaderboardPeriod) => ["leaderboard", period] as const,
};

// ── Profile & settings ───────────────────────────────────────────────────────
export function useMe() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => api<Profile>("/me"),
  });
}

/** Optimistic, so switches flip instantly and roll back if the save fails. */
export function useUpdateMe() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: ProfileUpdate) =>
      api<Profile>("/me", { method: "PATCH", body: changes }),
    onMutate: async (changes) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.me });
      const previous = queryClient.getQueryData<Profile>(queryKeys.me);
      if (previous) {
        const { displayName, imageUrl, timezone, ...settings } = changes;
        queryClient.setQueryData<Profile>(queryKeys.me, {
          ...previous,
          ...(displayName !== undefined && { displayName }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(timezone !== undefined && { timezone }),
          settings: { ...previous.settings, ...settings },
        });
      }
      return { previous };
    },
    onError: (_err, _changes, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.me, context.previous);
    },
    onSuccess: (profile, changes) => {
      queryClient.setQueryData(queryKeys.me, profile);
      if ("showOnLeaderboard" in changes || "displayName" in changes) {
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      }
    },
  });
}

// ── Stats & logs ─────────────────────────────────────────────────────────────
export function useStats() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => api<Stats>("/me/stats"),
  });
}

export function useLogs(limit = 20) {
  const api = useApi();
  return useQuery({
    queryKey: [...queryKeys.logs, limit],
    queryFn: () => api<LogsPage>(`/logs?limit=${limit}`),
  });
}

export function useLogActivity() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (log: NewLog) =>
      api<LogResult>("/logs", { method: "POST", body: log }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.logs });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

// ── Plant wiki favorites ─────────────────────────────────────────────────────
export function useFavorites() {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: async () =>
      new Set((await api<{ plantKeys: string[] }>("/favorites")).plantKeys),
  });
}

export function useToggleFavorite() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ plantKey, favorite }: { plantKey: string; favorite: boolean }) =>
      api<void>(`/favorites/${encodeURIComponent(plantKey)}`, {
        method: favorite ? "PUT" : "DELETE",
      }),
    onMutate: async ({ plantKey, favorite }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites });
      const previous = queryClient.getQueryData<Set<string>>(queryKeys.favorites);
      const next = new Set(previous);
      if (favorite) next.add(plantKey);
      else next.delete(plantKey);
      queryClient.setQueryData(queryKeys.favorites, next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKeys.favorites, context?.previous);
    },
  });
}

// ── Leaderboard ──────────────────────────────────────────────────────────────
export function useLeaderboard(period: LeaderboardPeriod) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.leaderboard(period),
    queryFn: () => api<Leaderboard>(`/leaderboard?period=${period}`),
  });
}
