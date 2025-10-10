import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { env } from "@/env";
import { prisma } from "@/lib/prisma";

const adapter = PrismaAdapter(prisma);

const providers: Parameters<typeof NextAuth>[0]["providers"] = [];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub ?? profile.id ?? profile.email,
          name: profile.name ?? profile.given_name ?? profile.email?.split("@")[0] ?? "",
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
        };
      },
    }),
  );
} else {
  console.warn("Google OAuth disabled: missing GOOGLE_CLIENT_* env values");
}

type ProviderSummary = {
  id: string;
  name: string;
  type: (typeof providers)[number]["type"];
};

export const authProviders: ProviderSummary[] = providers.map((provider) => ({
  id: provider.id,
  name: provider.name ?? provider.options?.name ?? provider.id,
  type: provider.type,
}));

export const {
  handlers: authHandlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter,
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  secret: env.NEXTAUTH_SECRET,
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.picture = user.image ?? token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.id;
        if (token.email) {
          session.user.email = token.email;
        }
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        if (typeof token.picture === "string") {
          session.user.image = token.picture;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
});

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
    };
  }
}
