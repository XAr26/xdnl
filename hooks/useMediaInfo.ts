import { useState } from "react";
import { fetchMediaInfo } from "../services/api";

/**
 * Hook untuk ambil data media dari backend
 */
export function useMediaInfo() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getInfo = async (url: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMediaInfo(url);
            setLoading(false);
            return data;
        } catch (err: any) {
            const msg = err.message || "Terjadi kesalahan";
            setError(msg);
            setLoading(false);
            throw err;
        }
    };

    return { getInfo, loading, error };
}