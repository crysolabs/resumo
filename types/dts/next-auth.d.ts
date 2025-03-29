import { LoginAttempt, User as DbUser } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";
import { AdapterSession } from "next-auth/adapters";

declare module "next-auth/adapters" {
  interface AdapterSession extends AdapterSession {
    sessionId: String;
  }
}

/**
 * This module declaration extends the `next-auth` module to include additional types and interfaces.
 * It provides a way to extend the default session object with additional properties, such as `sessionId`.
 */
declare module "next-auth" {
  /**
   * Extends the `DbUser` type from the `@prisma/client` package to include any additional properties or methods that may be needed for the application's user model.
   */
  interface User extends DbUser {}

  /**
   * Extends the default NextAuth.js session object to include additional properties, such as `sessionId`.
   * The `Session` interface represents the session data that is stored and retrieved during the authentication process.
   */
  interface Session extends DefaultSession {
    user: User;
    sessionId: string;
  }
}
