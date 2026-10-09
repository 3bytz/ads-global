import "server-only";
import { z } from "zod";
import { blankToUndefined } from "./env";

const optionalString = z.preprocess(blankToUndefined, z.string().trim().min(1).optional());

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  TURNSTILE_SECRET_KEY: optionalString,
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
});

/** Server-only secrets. Every value is optional; blank means "not set". Never throws. */
export const serverEnv = serverSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
});

export const isServiceRoleConfigured = Boolean(serverEnv.SUPABASE_SERVICE_ROLE_KEY);
export const isEmailConfigured = Boolean(serverEnv.RESEND_API_KEY && serverEnv.EMAIL_FROM);
export const isCloudinaryConfigured = Boolean(
  serverEnv.CLOUDINARY_CLOUD_NAME && serverEnv.CLOUDINARY_API_KEY && serverEnv.CLOUDINARY_API_SECRET,
);
