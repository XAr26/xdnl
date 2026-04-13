import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
} from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { useAppStore, HistoryItem } from "@/services/store";

const { width } = Dimensions.get("window");

export default function HistoryScreen() {
  const { history, clearHistory, removeFromHistory, isDarkMode } = useAppStore();
  const [search, setSearch] = useState("");

  const theme = {
    bg: isDarkMode ? ["#020617", "#0f172a", "#083344"] : ["#f8fafc", "#f1f5f9", "#dee2e6"],
    text: isDarkMode ? "#fff" : "#0f172a",
    subText: isDarkMode ? "#64748b" : "#475569",
    cardBg: isDarkMode ? "rgba(15, 23, 42, 0.4)" : "rgba(255, 255, 255, 0.9)",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 41, 0.1)",
    inputBg: isDarkMode ? "rgba(15, 23, 42, 0.4)" : "rgba(255, 255, 255, 0.5)",
    blur: isDarkMode ? "dark" : ("light" as any),
  };

  const filteredHistory = history.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleClearHistory = () => {
    if (history.length === 0) return;
    
    Alert.alert(
      "Hapus History",
      "Apakah Anda yakin ingin menghapus semua riwayat download?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive", 
          onPress: clearHistory 
        },
      ]
    );
  };

  const renderItem = ({ item, index }: { item: HistoryItem; index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()} 
      layout={Layout.springify()}
    >
      <BlurView intensity={25} tint={theme.blur} style={[styles.historyCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.thumbnail}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", isDarkMode ? "rgba(15, 23, 42, 0.4)" : "rgba(255, 255, 255, 0.1)"]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.cardInfo}>
          <View>
            <ThemedText type="defaultSemiBold" numberOfLines={2} style={[styles.itemTitle, { color: theme.text }]}>
              {item.title}
            </ThemedText>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={12} color="#475569" />
              <ThemedText style={styles.itemDate}>
                {new Date(item.date).toLocaleDateString("id-ID", {
                   day: 'numeric',
                   month: 'short',
                   year: 'numeric'
                })}
              </ThemedText>
            </View>
          </View>
          
            {item.status === 'downloading' ? (
              <View style={styles.downloadingContainer}>
                <View style={[styles.statusBadge, { backgroundColor: "rgba(34, 211, 238, 0.1)" }]}>
                  <Ionicons name="sync-outline" size={10} color="#22d3ee" />
                  <ThemedText style={[styles.statusText, { color: "#22d3ee" }]}>MENGUNDUH</ThemedText>
                </View>
                <View style={styles.miniProgressContainer}>
                  <ThemedText style={styles.miniProgressText}>{Math.round(item.progress * 100)}%</ThemedText>
                  <View style={styles.miniProgressBarTrack}>
                    <View style={[styles.miniProgressBarFill, { width: `${item.progress * 100}%` }]} />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.reDownloadBtn}>
                  <LinearGradient
                    colors={item.status === 'done' ? ["#10b981", "#059669"] : ["#06b6d4", "#0891b2"]}
                    style={styles.reDownloadGradient}
                  >
                    <Ionicons 
                      name={item.status === 'done' ? "checkmark-circle-outline" : "cloud-download-outline"} 
                      size={16} 
                      color="#fff" 
                    />
                    <ThemedText style={styles.actionText}>
                      {item.status === 'done' ? "Tersimpan" : "Download"}
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => removeFromHistory(item.id)}
                  style={styles.deleteButton}
                >
                  <BlurView intensity={20} tint="light" style={styles.deleteBlur}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </BlurView>
                </TouchableOpacity>
              </View>
            )}
        </View>
      </BlurView>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg[0] }]}>
      <LinearGradient
        colors={theme.bg as any}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <View>
          <ThemedText type="title" style={[styles.title, { color: theme.text }]}>Riwayat</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.subText }]}>Arsip media pilihan dalam satu genggaman.</ThemedText>
        </View>
        
        {history.length > 0 && (
          <TouchableOpacity 
            onPress={handleClearHistory}
            style={styles.clearButton}
          >
            <BlurView intensity={20} tint={theme.blur} style={[styles.clearBlur, { borderColor: theme.border }]}>
              <Ionicons name="trash-bin-outline" size={20} color={theme.subText} />
            </BlurView>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <BlurView intensity={25} tint={theme.blur} style={[styles.searchBlur, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color="#22d3ee" style={styles.searchIcon} />
          <TextInput
            placeholder="Cari koleksi media Anda..."
            placeholderTextColor={isDarkMode ? "#475569" : "#94a3b8"}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={theme.subText} />
            </TouchableOpacity>
          )}
        </BlurView>
      </View>

      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View entering={FadeInDown} style={styles.emptyContainer}>
            <View style={[styles.emptyIconWrapper, { backgroundColor: isDarkMode ? "rgba(129, 140, 248, 0.05)" : "rgba(15, 23, 42, 0.05)" }]}>
              <Ionicons 
                name={search ? "search-outline" : "journal-outline"} 
                size={60} 
                color="rgba(34, 211, 238, 0.2)" 
              />
            </View>
            <ThemedText style={[styles.emptyText, { color: theme.text }]}>
              {search ? "Tidak ditemukan" : "Belum ada jejak media"}
            </ThemedText>
            <ThemedText style={[styles.emptySub, { color: theme.subText }]}>
              {search ? "Coba kata kunci lain" : "Ayo eksplorasi media favoritmu!"}
            </ThemedText>
          </Animated.View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  clearButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  clearBlur: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  listContent: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 150,
  },
  historyCard: {
    flexDirection: "row",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    height: 140,
  },
  thumbnailWrapper: {
    width: 120,
    height: "100%",
    backgroundColor: "#1e293b",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  cardInfo: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  itemTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  itemDate: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reDownloadBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    overflow: "hidden",
  },
  reDownloadGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  deleteButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  deleteBlur: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 120,
  },
  emptyIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(129, 140, 248, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.1)",
  },
  emptyText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  emptySub: {
    color: "#475569",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  searchBlur: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    overflow: "hidden",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  downloadingContainer: {
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  miniProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  miniProgressText: {
    color: "#22d3ee",
    fontSize: 12,
    fontWeight: "800",
    width: 35,
  },
  miniProgressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 3,
    overflow: "hidden",
  },
  miniProgressBarFill: {
    height: "100%",
    backgroundColor: "#22d3ee",
    borderRadius: 3,
  },
});


