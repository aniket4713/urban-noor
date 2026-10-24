import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { siteUrl } from "@/lib/utils";
import { loginSchema, registerSchema, resetSchema } from "@/lib/validators";
import type { SessionUser } from "@/lib/jwt";
import { emailService } from "./emailService";

const toSession = (u: { id: string; name: string; email: string; role: "CUSTOMER" | "ADMIN" }): SessionUser => ({
  sub: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
});

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

export const authService = {
  async register(input: z.infer<typeof registerSchema>) {
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw new ApiError(409, "An account with this email already exists. Try logging in.");
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        passwordHash: await bcrypt.hash(input.password, 10),
      },
    });
    emailService.welcome(user.email, user.name).catch(() => {});
    return toSession(user);
  },

  async login(input: z.infer<typeof loginSchema>, opts: { adminOnly?: boolean } = {}) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    // same message for "no user" and "wrong password" so emails can't be probed
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new ApiError(401, "Incorrect email or password");
    }
    if (opts.adminOnly && user.role !== "ADMIN") throw new ApiError(403, "This account is not an admin");
    return toSession(user);
  },

  async me(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });
  },

  async updateProfile(userId: string, data: { name: string; phone?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: data.name, phone: data.phone || null },
    });
    return toSession(user);
  },

  /** Creates a 30-min reset token. Always resolves (never reveals whether the email exists). */
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
    });
    const link = `${siteUrl()}/reset-password?token=${token}`;
    if (!process.env.RESEND_API_KEY) console.log(`\n🔑 [DEV] Password reset link for ${email}: ${link}\n`);
    await emailService.passwordReset(user.email, user.name, link);
  },

  async resetPassword(input: z.infer<typeof resetSchema>) {
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(input.token) } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new ApiError(400, "This reset link is invalid or has expired. Please request a new one.");
    }
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: await bcrypt.hash(input.password, 10) },
      }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);
  },
};
