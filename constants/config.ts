import { Platform } from "react-native";

/**
 * AntiGravity Downloader - Central Configuration
 * Ganti IP_ADDRESS dengan IP lokal mesin Anda jika menggunakan perangkat fisik.
 */

const DEV_IP = "192.168.1.92"; // Ganti dengan IP laptop Anda
const OLLAMA_IP = Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const Config = {
  API_URL: `http://${DEV_IP}:8000`,
  OLLAMA_URL: `http://${OLLAMA_IP}:11434/api/chat`,
  OLLAMA_MODEL: "llama3",
  
  // App Info
  VERSION: "2.0.0-PRO",
  DEVELOPER: "X AR Team",
  CONTACT_EMAIL: "support@xdwn.app",
  WA_SUPPORT: "https://wa.me/6281234567890",
  PLAY_STORE_URL: "https://play.google.com/store/apps/details?id=com.xdwn.app",
  APP_STORE_URL: "https://apps.apple.com/app/idXXXXXXXXX",
  
  // Features
  TIMEOUT_MS: 15000, // 15 detik
  MAX_HISTORY: 50,
};
