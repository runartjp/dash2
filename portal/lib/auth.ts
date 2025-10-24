import { NextAuthOptions } from 'next-auth';
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
              fields: 'id,email,first_name,last_name,avatar,username',
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
              image: user.avatar ? `${directusUrl}/assets/${user.avatar}` : undefined,
              username: user.username,
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.username = (user as any).username;
      }

      // セッション更新時にDirectusから最新のユーザー情報を取得
      if (trigger === 'update' && token.id) {
        try {
          const axios = require('axios');
          const loginResponse = await axios.post(`${directusUrl}/auth/login`, {
            email: 'admin@example.com',
            password: 'dash2admin',
          });
          const adminToken = loginResponse.data.data.access_token;

          const userResponse = await axios.get(`${directusUrl}/users/${token.id}`, {
            params: {
              fields: 'id,email,first_name,last_name,avatar,username',
            },
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          });

          const userData = userResponse.data.data;
          token.name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email;
          token.email = userData.email;
          token.picture = userData.avatar ? `${directusUrl}/assets/${userData.avatar}` : undefined;
          token.username = userData.username;
        } catch (error) {
          console.error('Failed to update session:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        (session.user as any).username = token.username as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
};
