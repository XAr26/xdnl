import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { useAppStore, HistoryItem } from "@/services/store";

const { width } = Dimensions.get("window");

export default function HistoryScreen() {
  const { history, clearHistory, removeFromHistory } = useAppStore();

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
      <BlurView intensity={25} tint="dark" style={styles.historyCard}>
        <View style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.thumbnail}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(15, 23, 42, 0.4)"]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.cardInfo}>
          <View>
            <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.itemTitle}>
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
          
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.reDownloadBtn}>
               <LinearGradient
                colors={["#6366f1", "#4f46e5"]}
                style={styles.reDownloadGradient}
              >
                <Ionicons name="cloud-download-outline" size={16} color="#fff" />
                <ThemedText style={styles.actionText}>Check Again</ThemedText>
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
        </View>
      </BlurView>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#020617", "#0f172a", "#1e1b4b"]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <View>
          <ThemedText type="title" style={styles.title}>Riwayat</ThemedText>
          <ThemedText style={styles.subtitle}>Media yang dilingkari AntiGravity</ThemedText>
        </View>
        
        {history.length > 0 && (
          <TouchableOpacity 
            onPress={handleClearHistory}
            style={styles.clearButton}
          >
            <BlurView intensity={20} tint="dark" style={styles.clearBlur}>
              <Ionicons name="trash-bin-outline" size={20} color="#94a3b8" />
            </BlurView>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View entering={FadeInDown} style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="journal-outline" size={60} color="rgba(129, 140, 248, 0.2)" />
            </View>
            <ThemedText style={styles.emptyText}>Belum ada jejak media</ThemedText>
            <ThemedText style={styles.emptySub}>Ayo eksplorasi media favoritmu!</ThemedText>
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
});


