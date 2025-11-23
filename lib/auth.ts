import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail } from "./db";
import { sendWelcomeEmail } from "./email";

// Admin emails - add your admin emails here
const ADMIN_EMAILS = [
  "admin@pixelift.pl",
  "michalchmielarz00@gmail.com",
  // Add more admin emails as needed
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Check if this is a new user (first time sign in)
      if (user.email && user.name) {
        const existingUser = getUserByEmail(user.email);

        if (!existingUser) {
          // This is a new user - send welcome email (non-blocking)
          sendWelcomeEmail({
            userName: user.name,
            userEmail: user.email,
            freeCredits: 3, // Default free credits for new users
          }).catch(err => console.error('Welcome email failed:', err));
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        // Add isAdmin property to session
        session.user.isAdmin = ADMIN_EMAILS.includes(session.user.email || "");
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        // Add isAdmin to token
        token.isAdmin = ADMIN_EMAILS.includes(user.email || "");
      }
      return token;
    },
  },
});

// Helper function to check if user is admin
export async function isAdmin() {
  const session = await auth();
  return session?.user?.isAdmin === true;
}
