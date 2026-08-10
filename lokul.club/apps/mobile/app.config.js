/**
 * Expo Config - Environment Variables
 * 
 * This loads environment variables from .env and makes them available
 * to the mobile app via Constants.expoConfig.extra
 */

export default {
  expo: {
    name: "Lokul",
    slug: "lokul",
    scheme: "lokul",
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    },
  },
}
