import { clerkMiddleware, getAuth } from "@clerk/express";
import type { Request, RequestHandler } from "express";
import type { Db } from "./db/client.js";
import { users } from "./db/schema.js";
import { HttpError } from "./lib/http.js";

/** Pluggable so tests can authenticate without real Clerk sessions. */
export interface AuthProvider {
  middleware: RequestHandler;
  getUserId(req: Request): string | null;
}

export function clerkAuth(opts: { publishableKey: string; secretKey: string }): AuthProvider {
  return {
    middleware: clerkMiddleware(opts),
    getUserId: (req) => getAuth(req).userId ?? null,
  };
}

/**
 * Rejects unauthenticated requests and makes sure a `users` row exists for
 * the caller, so every route can rely on it.
 */
export function requireUser(db: Db, auth: AuthProvider): RequestHandler {
  const known = new Set<string>();
  return async (req, res, next) => {
    const userId = auth.getUserId(req);
    if (!userId) throw new HttpError(401, "Not signed in");
    if (!known.has(userId)) {
      await db.insert(users).values({ id: userId }).onConflictDoNothing();
      if (known.size > 10_000) known.clear();
      known.add(userId);
    }
    res.locals.userId = userId;
    next();
  };
}
