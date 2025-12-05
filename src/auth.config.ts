import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    // Callbacks removed to prevent middleware generation
    // Authorization will be handled in individual routes
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
