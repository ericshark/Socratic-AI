import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import nodemailer from "nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { env } from "@/env";
import { prisma } from "@/lib/prisma";

const hasEmailConfig =
  Boolean(env.EMAIL_SERVER_HOST) &&
  Boolean(env.EMAIL_SERVER_USER) &&
  Boolean(env.EMAIL_SERVER_PASSWORD) &&
  Boolean(env.EMAIL_FROM);

const emailProvider = Email({
  id: "email",
  name: "Email",
  from: env.EMAIL_FROM ?? "coach@socratic.local",
  maxAge: 24 * 60 * 60,
  async sendVerificationRequest({ identifier, url }) {
    if (!hasEmailConfig) {
      throw new Error(
        "Missing EMAIL_SERVER_* (PLACEHOLDER). Set .env or disable Email magic link in settings.",
      );
    }

    const transport = nodemailer.createTransport({
      host: env.EMAIL_SERVER_HOST,
      port: env.EMAIL_SERVER_PORT ?? 587,
      auth: {
        user: env.EMAIL_SERVER_USER,
        pass: env.EMAIL_SERVER_PASSWORD,
      },
    });

    const result = await transport.sendMail({
      to: identifier,
      from: env.EMAIL_FROM,
      subject: "Your Socratic magic link",
      text: `Sign in to Socratic by clicking this link: ${url}`,
      html:
        `<p>Click the magic link to sign in:</p><p><a href="${url}">${url}</a></p>` +
        "<p>This link will expire in 24 hours.</p>",
    });

    const failed = result.rejected.filter(Boolean);
    if (failed.length) {
      throw new Error(`Email(s) ${failed.join(", ")} rejected by the SMTP server.`);
    }
  },
});

const providers: Parameters<typeof NextAuth>[0]["providers"] = [];
if (hasEmailConfig) {
  providers.push(emailProvider);
} else {
  console.warn("Email magic link login disabled: missing EMAIL_SERVER_* env values");
}

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  );
} else {
  console.warn("Google OAuth disabled: missing GOOGLE_CLIENT_* env values");
}


export const {
  handlers: authHandlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  trustHost: true,
  secret: env.NEXTAUTH_SECRET,
  providers,
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.name = user.name;
        session.user.image = user.image;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  events: {
    async createUser({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: {},
      });
    },
  },
});

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
    };
  }
}
