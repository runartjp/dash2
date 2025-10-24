import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Directus',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // axiosで直接Directus APIを呼び出す
          const axios = require('axios');

          // ログイン
          const loginResponse = await axios.post(`${directusUrl}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          const token = loginResponse.data.data.access_token;

          if (!token) {
            return null;
          }

          // ユーザー情報を取得
          const userResponse = await axios.get(`${directusUrl}/users/me`, {
            params: {
              fields: 'id,email,first_name,last_name,avatar',
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const user = userResponse.data.data;

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
              image: user.avatar ? `${directusUrl}/assets/${user.avatar}` : null,
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
