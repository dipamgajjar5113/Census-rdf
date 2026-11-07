import type { SessionOptions } from "iron-session";

export interface AdminSession {
  isAdmin?: boolean;
}

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_PASSWORD ||
    "dev-only-insecure-password-change-me-32chars-min",
  cookieName: "smhf-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
  },
};

/** The shared admin password (per core.md). Override with env in production. */
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Community";
