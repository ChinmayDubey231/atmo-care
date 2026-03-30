export const getUserName = (
  user:
    | {
        firstName?: string | null;
        lastName?: string | null;
        emailAddresses?: { emailAddress: string }[];
      }
    | null
    | undefined,
): string => {
  if (user?.firstName && user?.lastName)
    return `${user.firstName} ${user.lastName}`;
  if (user?.firstName) return user.firstName;

  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (email)
    return email
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase());

  return "User";
};
