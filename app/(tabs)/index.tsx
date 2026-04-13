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
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from 'expo-notifications';
import Animated, { 
  FadeInUp, 
  FadeInDown,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { useRouter } from "expo-router";


import { ThemedText } from "@/components/themed-text";
import { useMediaInfo } from "@/hooks/useMediaInfo";
import { useAppStore } from "@/services/store";

const { width, height } = Dimensions.get("window");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function HomeScreen() {
  const [url, setUrl] = useState("");
  const { getInfo, loading } = useMediaInfo();
  const [mediaData, setMediaData] = useState<any>(null);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const { addToHistory, isDarkMode, updateHistoryProgress, updateHistoryStatus, isAlreadyDownloaded } = useAppStore();
  const router = useRouter();

  const theme = {
    bg: isDarkMode ? ["#020617", "#0f172a", "#083344"] : ["#f8fafc", "#f1f5f9", "#dee2e6"],
    text: isDarkMode ? "#fff" : "#0f172a",
    subText: isDarkMode ? "#64748b" : "#475569",
    cardBg: isDarkMode ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.8)",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 41, 0.1)",
    inputBg: isDarkMode ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.5)",
    blur: isDarkMode ? "dark" : ("light" as any),
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [quality, setQuality] = useState("720p");
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const [showClipboardBanner, setShowClipboardBanner] = useState(false);

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

    const requestPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };
    
    const checkClipboard = async () => {
      const content = await Clipboard.getStringAsync();
      if (content && (content.startsWith("http://") || content.startsWith("https://"))) {
        setClipboardUrl(content);
        setShowClipboardBanner(true);
      }
    };

    requestPermissions();
    checkClipboard();
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
      
      const historyId = addToHistory({
        title: result.title || "Media Tanpa Judul",
        thumbnail: result.thumbnail || "",
        url: url
      });
      setCurrentHistoryId(historyId);
    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Gagal mengambil data media.");
    }
  };

  const handleDownload = async () => {
    if (!mediaData || !mediaData.url) return;

    if (isAlreadyDownloaded(mediaData.url)) {
      Alert.alert(
        "Video Sudah Ada",
        "Video ini pernah kamu download sebelumnya. Mau download lagi?",
        [
          { text: "Batal", style: "cancel" },
          { text: "Lihat History", onPress: () => router.push("/explore") },
          { text: "Download Lagi", onPress: () => startDownload() },
        ]
      );
      return;
    }

    startDownload();
  };

  const startDownload = async () => {
    let downloadId: string | undefined;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin Ditolak", "Dibutuhkan akses ke galeri untuk menyimpan media.");
        return;
      }

      if (currentHistoryId) {
        updateHistoryStatus(currentHistoryId, 'downloading');
      }

      await Notifications.scheduleNotificationAsync({
        identifier: "download-progress",
        content: {
          title: "Memulai Download...",
          body: mediaData.title || "Menyiapkan file...",
        },
        trigger: null,
      });

      setIsDownloading(true);
      setDownloadProgress(0);

      let lastNotifiedStep = 0;
      const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        setDownloadProgress(progress);
        if (currentHistoryId) updateHistoryProgress(currentHistoryId, progress);

        const currentStep = Math.floor(progress * 10); // 10% steps
        if (currentStep > lastNotifiedStep) {
          lastNotifiedStep = currentStep;
          Notifications.scheduleNotificationAsync({
            identifier: "download-progress",
            content: {
              title: `Downloading... ${Math.round(progress * 100)}%`,
              body: mediaData.title || "Sedang mengunduh video...",
            },
            trigger: null,
          });
        }
      };

      const sanitizedTitle = (mediaData.title || "download").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileUri = `${FileSystem.documentDirectory}${sanitizedTitle}_${quality}.mp4`;

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
        if (currentHistoryId) updateHistoryStatus(currentHistoryId, 'done');
        
        await Notifications.scheduleNotificationAsync({
          identifier: "download-progress",
          content: {
            title: "Download Selesai ✅",
            body: `${mediaData.title || "Video"} tersimpan di Galeri`,
          },
          trigger: null,
        });

        Alert.alert("Berhasil", "Video telah tersimpan di Galeri Anda!");
      }

    } catch (e: any) {
      if (currentHistoryId) {
        updateHistoryStatus(currentHistoryId, 'failed');
      }
      
      await Notifications.scheduleNotificationAsync({
        identifier: "download-progress",
        content: {
          title: "Download Gagal ❌",
          body: "Terjadi kesalahan saat mengunduh",
        },
        trigger: null,
      });

      Alert.alert("Download Gagal", e.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg[0] }]}>
      <LinearGradient
        colors={theme.bg as any}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Animated Glow Effect */}
      <Animated.View style={[styles.glowBackground, glowStyle]}>
        <LinearGradient
          colors={["#06b6d4", "transparent"]}
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
                colors={["#22d3ee", "#06b6d4"]}
                style={styles.logoGradient}
              >
                <Ionicons name="infinite-outline" size={40} color="#fff" />
              </LinearGradient>
              <View style={styles.logoOrbit} />
            </View>
            <ThemedText type="title" style={[styles.title, { color: theme.text }]}>
              Xdwn
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.subText }]}>
              Solusi cerdas unduhan media tanpa batas.
            </ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400)} style={styles.mainCardContainer}>
            <BlurView intensity={30} tint={theme.blur} style={[styles.glassCard, { borderColor: theme.border }]}>
              <View style={styles.inputSection}>
                <View style={styles.inputHeader}>
                  <ThemedText style={styles.inputLabel}>MASUKKAN TAUTAN</ThemedText>
                  {loading && <ActivityIndicator size="small" color="#22d3ee" />}
                </View>
                
                <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                  <Ionicons name="link-sharp" size={20} color="#22d3ee" style={styles.inputIcon} />
                  <TextInput
                    placeholder="YouTube, TikTok, Instagram..."
                    placeholderTextColor={isDarkMode ? "#475569" : "#94a3b8"}
                    value={url}
                    onChangeText={setUrl}
                    style={[styles.input, { color: theme.text }]}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {url.length > 0 && (
                    <TouchableOpacity onPress={() => setUrl("")} style={styles.clearBtn}>
                      <Ionicons name="close-circle" size={20} color={theme.subText} />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleAnalyze}
                  disabled={loading}
                  style={styles.actionBtn}
                >
                  <LinearGradient
                    colors={["#06b6d4", "#0891b2"]}
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

          {showClipboardBanner && clipboardUrl && (
            <Animated.View entering={FadeInDown} style={styles.clipboardBannerContainer}>
              <BlurView intensity={40} tint={theme.blur} style={[styles.clipboardBanner, { borderColor: theme.border }]}>
                <View style={styles.bannerInfo}>
                  <Ionicons name="clipboard-outline" size={20} color="#22d3ee" />
                  <View style={styles.bannerTextContent}>
                    <ThemedText style={[styles.bannerTitle, { color: theme.text }]}>Link di clipboard</ThemedText>
                    <ThemedText numberOfLines={1} style={[styles.bannerUrl, { color: theme.subText }]}>{clipboardUrl}</ThemedText>
                  </View>
                </View>
                <View style={styles.bannerActions}>
                  <TouchableOpacity 
                    onPress={() => setShowClipboardBanner(false)}
                    style={styles.bannerAbaikan}
                  >
                    <ThemedText style={styles.bannerAbaikanText}>Abaikan</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      setUrl(clipboardUrl);
                      setShowClipboardBanner(false);
                    }}
                    style={styles.bannerTempel}
                  >
                    <ThemedText style={styles.bannerTempelText}>Tempel</ThemedText>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>
          )}

          {mediaData && (
            <Animated.View entering={FadeInUp.springify()} style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <ThemedText style={[styles.sectionTitle, { color: theme.subText }]}>HASIL ANALISIS</ThemedText>
              </View>
              <BlurView intensity={40} tint={theme.blur} style={[styles.resultCard, { borderColor: theme.border }]}>
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
                  <ThemedText type="defaultSemiBold" numberOfLines={2} style={[styles.mediaTitle, { color: theme.text }]}>
                    {mediaData.title}
                  </ThemedText>
                  
                  <View style={styles.platformBadge}>
                    <Ionicons name="play-circle-outline" size={14} color={theme.subText} />
                    <ThemedText style={[styles.platformText, { color: theme.subText }]}>Media Detectable</ThemedText>
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
                    <View>
                      <View style={[styles.qualityContainer, { backgroundColor: isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(15, 23, 42, 0.05)" }]}>
                        {["360p", "720p", "1080p"].map((q) => (
                          <TouchableOpacity 
                            key={q}
                            onPress={() => setQuality(q)}
                            style={[
                              styles.qualityOption, 
                              quality === q && styles.qualityOptionActive
                            ]}
                          >
                            <ThemedText style={[
                              styles.qualityText,
                              quality === q && styles.qualityTextActive
                            ]}>
                              {q}
                            </ThemedText>
                          </TouchableOpacity>
                        ))}
                      </View>

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
                    </View>
                  )}
                </View>
              </BlurView>
            </Animated.View>
          )}

          <View style={styles.footer}>
             <ThemedText style={styles.footerText}>Simplified downloads for everyone 🚀</ThemedText>
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
    borderColor: "rgba(34, 211, 238, 0.2)",
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
    color: "#22d3ee",
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
  qualityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 6,
    borderRadius: 14,
    marginBottom: 16,
    gap: 8,
  },
  qualityOption: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  qualityOptionActive: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    borderColor: "rgba(6, 182, 212, 0.4)",
  },
  qualityText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  qualityTextActive: {
    color: "#22d3ee",
  },
  footer: {
    marginTop: 50,
    alignItems: "center",
  },
  footerText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },
  clipboardBannerContainer: {
    marginBottom: 24,
  },
  clipboardBanner: {
    borderRadius: 24,
    overflow: "hidden",
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bannerTextContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  bannerUrl: {
    fontSize: 12,
    marginTop: 2,
  },
  bannerActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 12,
  },
  bannerAbaikan: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bannerAbaikanText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
  bannerTempel: {
    backgroundColor: "#06b6d4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bannerTempelText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});