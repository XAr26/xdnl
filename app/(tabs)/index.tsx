import { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  View,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  FadeInUp, 
  FadeInDown,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";


import { ThemedText } from "@/components/themed-text";
import { useMediaInfo } from "@/hooks/useMediaInfo";
import { useAppStore } from "@/services/store";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const [url, setUrl] = useState("");
  const { getInfo, loading } = useMediaInfo();
  const [mediaData, setMediaData] = useState<any>(null);
  const addToHistory = useAppStore((state) => state.addToHistory);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const glowOpacity = useSharedValue(0.2);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2000 }),
        withTiming(0.2, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleAnalyze = async () => {
    if (!url) {
      Alert.alert("URL Kosong", "Silakan tempel tautan media terlebih dahulu.");
      return;
    }

    try {
      const result = await getInfo(url);
      setMediaData(result);
      
      addToHistory({
        title: result.title || "Media Tanpa Judul",
        thumbnail: result.thumbnail || "",
        url: url
      });
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Gagal mengambil data media.");
    }
  };

  const handleDownload = async () => {
    if (!mediaData || !mediaData.url) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin Ditolak", "Dibutuhkan akses ke galeri untuk menyimpan media.");
        return;
      }

      setIsDownloading(true);
      setDownloadProgress(0);

      const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        setDownloadProgress(progress);
      };

      const sanitizedTitle = (mediaData.title || "download").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileUri = `${FileSystem.documentDirectory}${sanitizedTitle}.mp4`;

      const downloadResumable = FileSystem.createDownloadResumable(
        mediaData.url,
        fileUri,
        {},
        callback
      );

      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        await MediaLibrary.saveToLibraryAsync(result.uri);
        useAppStore.getState().addExperience(50);
        Alert.alert("Berhasil", "Video telah tersimpan di Galeri Anda!");
      }

    } catch (e: any) {
      Alert.alert("Download Gagal", e.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#020617", "#0f172a", "#1e1b4b"]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Animated Glow Effect */}
      <Animated.View style={[styles.glowBackground, glowStyle]}>
        <LinearGradient
          colors={["#6366f1", "transparent"]}
          style={styles.glowCircle}
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
            <View style={styles.logoWrapper}>
              <LinearGradient
                colors={["#818cf8", "#6366f1"]}
                style={styles.logoGradient}
              >
                <Ionicons name="infinite-outline" size={40} color="#fff" />
              </LinearGradient>
              <View style={styles.logoOrbit} />
            </View>
            <ThemedText type="title" style={styles.title}>
              AntiGravity
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Bebaskan media dari batas gravitasi platform apa pun
            </ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400)} style={styles.mainCardContainer}>
            <BlurView intensity={30} tint="dark" style={styles.glassCard}>
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <ThemedText style={styles.inputLabel}>MASUKKAN TAUTAN</ThemedText>
                  {loading && <ActivityIndicator size="small" color="#818cf8" />}
                </View>
                
                <View style={styles.inputWrapper}>
                  <Ionicons name="link-sharp" size={20} color="#818cf8" style={styles.inputIcon} />
                  <TextInput
                    placeholder="YouTube, TikTok, Instagram..."
                    placeholderTextColor="#475569"
                    value={url}
                    onChangeText={setUrl}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {url.length > 0 && (
                    <TouchableOpacity onPress={() => setUrl("")} style={styles.clearBtn}>
                      <Ionicons name="close-circle" size={20} color="#64748b" />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleAnalyze}
                  disabled={loading}
                  style={styles.actionBtn}
                >
                  <LinearGradient
                    colors={["#6366f1", "#4f46e5"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGradient}
                  >
                    <ThemedText style={styles.btnText}>
                      {loading ? "Menganalisis..." : "Cek Sekarang"}
                    </ThemedText>
                    {!loading && <Ionicons name="arrow-forward" size={18} color="#fff" />}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>

          {mediaData && (
            <Animated.View entering={FadeInUp.springify()} style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <ThemedText style={styles.sectionTitle}>HASIL ANALISIS</ThemedText>
              </View>
              <BlurView intensity={40} tint="dark" style={styles.resultCard}>
                <View style={styles.thumbnailContainer}>
                  <Image
                    source={{ uri: mediaData.thumbnail }}
                    style={styles.thumbnail}
                    contentFit="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(15, 23, 42, 0.8)"]}
                    style={styles.thumbnailOverlay}
                  />
                </View>
                
                <View style={styles.resultInfo}>
                  <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.mediaTitle}>
                    {mediaData.title}
                  </ThemedText>
                  
                  <View style={styles.platformBadge}>
                    <Ionicons name="play-circle-outline" size={14} color="#94a3b8" />
                    <ThemedText style={styles.platformText}>Media Detectable</ThemedText>
                  </View>

                  <View style={styles.divider} />

                  {isDownloading ? (
                    <View style={styles.progressContainer}>
                       <ThemedText style={styles.progressText}>
                         Downloading... {Math.round(downloadProgress * 100)}%
                       </ThemedText>
                       <View style={styles.progressBarTrack}>
                          <Animated.View style={[styles.progressBarFill, { width: `${downloadProgress * 100}%` }]} />
                       </View>
                    </View>
                  ) : (
                    <View style={styles.actionGrid}>
                      <TouchableOpacity onPress={handleDownload} style={styles.downloadOption} disabled={isDownloading}>
                         <LinearGradient
                          colors={["#10b981", "#059669"]}
                          style={styles.optionGradient}
                        >
                          <Ionicons name="videocam-outline" size={20} color="#fff" />
                          <ThemedText style={styles.optionText}>Video MP4</ThemedText>
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={styles.downloadOption} disabled={isDownloading}>
                         <LinearGradient
                          colors={["#f59e0b", "#d97706"]}
                          style={styles.optionGradient}
                        >
                          <Ionicons name="musical-notes-outline" size={20} color="#fff" />
                          <ThemedText style={styles.optionText}>Audio MP3</ThemedText>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </BlurView>
            </Animated.View>
          )}

          <View style={styles.footer}>
             <ThemedText style={styles.footerText}>Ready for lift-off 🚀</ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  glowBackground: {
    position: "absolute",
    top: -height * 0.2,
    right: -width * 0.2,
    width: width * 1.5,
    height: width * 1.5,
  },
  glowCircle: {
    flex: 1,
    borderRadius: width * 0.75,
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 100 : 80,
    paddingBottom: 120,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoWrapper: {
    position: "relative",
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  logoOrbit: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.2)",
    borderStyle: "dashed",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    maxWidth: "80%",
  },
  mainCardContainer: {
    marginBottom: 32,
  },
  glassCard: {
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  inputSection: {
    padding: 24,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#818cf8",
    letterSpacing: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 64,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  clearBtn: {
    padding: 4,
  },
  actionBtn: {
    width: "100%",
    height: 60,
    borderRadius: 20,
    overflow: "hidden",
  },
  btnGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  resultContainer: {
    marginTop: 16,
  },
  resultHeader: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 2,
  },
  resultCard: {
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  thumbnailContainer: {
    width: "100%",
    height: 220,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  resultInfo: {
    padding: 24,
  },
  mediaTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },
  platformBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  platformText: {
    color: "#64748b",
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginVertical: 20,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  downloadOption: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
  },
  optionGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  optionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  progressContainer: {
    paddingVertical: 10,
  },
  progressText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  footer: {
    marginTop: 50,
    alignItems: "center",
  },
  footerText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
  }
});