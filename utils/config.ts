// utils/config.ts
import Constants from "expo-constants";

export const BASE_URL: string =
  Constants?.expoConfig?.extra?.BASE_URL ??
  Constants?.manifest?.extra?.BASE_URL ??
  Constants?.manifest2?.extra?.BASE_URL 
 ;
export const GOOGLE_CLIENT_ID: string =
  Constants?.expoConfig?.extra?.GOOGLE_CLIENT_ID ??
  Constants?.manifest?.extra?.GOOGLE_CLIENT_ID ??
  Constants?.manifest2?.extra?.GOOGLE_CLIENT_ID ??
  "";
  export const STRIPE_PUBLISHABLE_KEY: string =
  Constants?.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY ??
  Constants?.manifest?.extra?.STRIPE_PUBLISHABLE_KEY ??
  "";