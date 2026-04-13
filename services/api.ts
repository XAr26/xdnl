import { Config } from "../constants/config";

const API_URL = Config.API_URL;

export async function fetchMediaInfo(url: string) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), Config.TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Gagal mengambil data dari server");
    }

    return await res.json();
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error("Request timeout. Server mungkin mati.");
    }
    console.error("API ERROR:", error);
    throw error;
  }
}