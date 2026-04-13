import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  Modal,
  TextInput,
  Linking,
} from "react-native";
import { useState, useEffect } from "react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { useAppStore } from "@/services/store";
import { Config } from "@/constants/config";

export default function ProfileScreen() {
  const { history, aiFireLevel, aiExperience, userName, updateUserName, isDarkMode, toggleDarkMode, turboDownload, toggleTurboDownload, avatarUri, setAvatarUri } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState(userName);

  const theme = {
    bg: isDarkMode ? ["#020617", "#0f172a", "#083344"] : ["#f8fafc", "#f1f5f9", "#cbd5e1"],
    text: isDarkMode ? "#fff" : "#0f172a",
    subText: isDarkMode ? "#64748b" : "#475569",
    card: isDarkMode ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.9)",
    border: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 41, 0.1)",
    blur: isDarkMode ? "dark" : ("light" as any),
  };

  const xpNeeded = aiFireLevel * 100;
  const progress = (aiExperience / xpNeeded) * 100;



  const handleEditName = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        "Ganti Nama",
        "Masukkan nama baru Anda",
        [
          { text: "Batal", style: "cancel" },
          { 
            text: "Simpan", 
            onPress: (name?: string) => {
              if (name && name.trim()) updateUserName(name.trim());
            } 
          }
        ],
        "plain-text",
        userName
      );
    } else {
      setNewName(userName);
      setModalVisible(true);
    }
  };

  const saveNameAndroid = () => {
    if (newName.trim()) {
      updateUserName(newName.trim());
      setModalVisible(false);
    }
  };

  const handleHelpCenter = () => {
    Linking.openURL(Config.WA_SUPPORT);
  };

  const handleRateApp = () => {
    const url = Platform.OS === 'ios' 
      ? Config.APP_STORE_URL
      : Config.PLAY_STORE_URL;

    Alert.alert(
      "Beri Rating",
      `Buka halaman rating di ${Platform.OS === 'ios' ? 'App Store' : 'Play Store'}?`,
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Buka", onPress: () => Linking.openURL(url) }
      ]
    );
  };

  const handleAboutApp = () => {
    Alert.alert(
      `Xdwn v${Config.VERSION}`,
      `Developer: ${Config.DEVELOPER}\nKontak: ${Config.CONTACT_EMAIL}\n\nXdwn adalah aplikasi download media terbaik untuk semua platform.`,
      [{ text: "Tutup" }]
    );
  };
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Izin Ditolak", "Dibutuhkan akses ke galeri untuk mengganti foto profil.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg[0] }]}>
      <LinearGradient
        colors={theme.bg as any}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarGlow, { backgroundColor: isDarkMode ? "rgba(99, 102, 241, 0.1)" : "rgba(6, 182, 212, 0.05)" }]} />
            
            {avatarUri ? (
              <Image 
                source={{ uri: avatarUri }} 
                style={styles.avatarGradient} 
                contentFit="cover"
              />
            ) : (
              <LinearGradient
                colors={["#22d3ee", "#06b6d4"]}
                style={styles.avatarGradient}
              >
                <Ionicons name="person" size={50} color="#fff" />
              </LinearGradient>
            )}

            <TouchableOpacity style={styles.editBadge} onPress={handlePickImage}>
               <BlurView intensity={20} tint={theme.blur} style={styles.editBlur}>
                  <Ionicons name="camera-outline" size={16} color="#fff" />
               </BlurView>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={handleEditName} activeOpacity={0.7}>
            <ThemedText type="title" style={[styles.userName, { color: theme.text }]}>{userName}</ThemedText>
          </TouchableOpacity>
          <View style={styles.statusBadge}>
             <Ionicons name="shield-checkmark" size={12} color="#10b981" />
             <ThemedText style={styles.statusText}>PREMIUM MEMBER</ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(350).springify()} style={[styles.xpCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
           <View style={styles.xpHeader}>
              <ThemedText style={styles.xpLabel}>FIRE PROGRESS</ThemedText>
              <ThemedText style={[styles.xpValue, { color: theme.subText }]}>{aiExperience} / {xpNeeded} XP</ThemedText>
           </View>
           <View style={styles.xpBarTrack}>
              <Animated.View style={[styles.xpBarFill, { width: `${progress}%` }]} />
           </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.statsRow}>
           <StatItem label="Downloads" value={history.length.toString()} theme={theme} />
           <StatItem label="Saved Data" value="4.2 GB" theme={theme} />
           <StatItem label="AI Rank" value={`LVL ${aiFireLevel}`} theme={theme} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.subText }]}>PENGATURAN</ThemedText>
          
          <BlurView intensity={20} tint={theme.blur} style={[styles.menuCard, { borderColor: theme.border }]}>
            <MenuItem 
              icon="contrast-outline" 
              title="Mode Gelap" 
              theme={theme}
              right={<Switch value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{ false: "#cbd5e1", true: "#06b6d4" }} thumbColor="#fff" />} 
            />
            <Divider theme={theme} />
            <MenuItem 
              icon="flash" 
              title="Turbo Download" 
              theme={theme}
              right={<Switch value={turboDownload} onValueChange={toggleTurboDownload} trackColor={{ false: "#cbd5e1", true: "#06b6d4" }} thumbColor="#fff" />} 
            />
            <Divider theme={theme} />
            <MenuItem 
              icon="folder-open" 
              title="Lokasi Penyimpanan" 
              value="/Xdwn/Files"
              theme={theme}
            />
          </BlurView>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.subText }]}>SUPPORT & INFO</ThemedText>
          <BlurView intensity={20} tint={theme.blur} style={[styles.menuCard, { borderColor: theme.border }]}>
            <MenuItem 
              icon="help-buoy" 
              title="Pusat Bantuan" 
              theme={theme} 
              onPress={handleHelpCenter} 
            />
            <Divider theme={theme} />
            <MenuItem 
              icon="star" 
              title="Beri Rating Xdwn" 
              theme={theme} 
              onPress={handleRateApp} 
            />
            <Divider theme={theme} />
            <MenuItem 
              icon="information-circle" 
              title="Tentang Aplikasi" 
              theme={theme} 
              onPress={handleAboutApp} 
            />
          </BlurView>
        </Animated.View>

        <TouchableOpacity style={styles.logoutButton}>
          <LinearGradient
            colors={["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.05)"]}
            style={styles.logoutGradient}
          >
            <ThemedText style={styles.logoutText}>Logout Session</ThemedText>
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          </LinearGradient>
        </TouchableOpacity>

        <ThemedText style={styles.versionText}>Xdwn v{Config.VERSION}</ThemedText>
      </ScrollView>

      {/* Android Name Edit Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>Ganti Nama</ThemedText>
              <TextInput
                style={styles.modalInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Masukkan nama baru..."
                placeholderTextColor="#475569"
                autoFocus
                maxLength={20}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancel} 
                  onPress={() => setModalVisible(false)}
                >
                  <ThemedText style={styles.cancelText}>Batal</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalSave} 
                  onPress={saveNameAndroid}
                >
                  <LinearGradient
                    colors={["#06b6d4", "#0891b2"]}
                    style={styles.saveGradient}
                  >
                    <ThemedText style={styles.saveText}>Simpan</ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

function StatItem({ label, value, theme }: any) {
  return (
    <BlurView intensity={10} tint={theme.blur} style={[styles.statItem, { borderColor: theme.border }]}>
       <ThemedText style={[styles.statLabel, { color: theme.subText }]}>{label}</ThemedText>
       <ThemedText style={[styles.statValue, { color: theme.text }]}>{value}</ThemedText>
    </BlurView>
  );
}

function MenuItem({ icon, title, right, value, theme, onPress }: any) {
  const content = (
    <View style={styles.menuItem}>
      <View style={styles.menuIconWrapper}>
        <LinearGradient
          colors={["rgba(34, 211, 238, 0.2)", "rgba(34, 211, 238, 0.05)"]}
          style={styles.menuIconGradient}
        >
          <Ionicons name={icon} size={20} color="#22d3ee" />
        </LinearGradient>
      </View>
      <ThemedText style={[styles.menuTitle, { color: theme.text }]}>{title}</ThemedText>
      {value && <ThemedText style={[styles.menuValue, { color: theme.subText }]}>{value}</ThemedText>}
      {right ? right : <Ionicons name="chevron-forward" size={18} color={theme.subText} />}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

function Divider({ theme }: any) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 100 : 80,
    paddingBottom: 150,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarWrapper: {
    position: "relative",
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  avatarGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },

  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 2,
  },
  editBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    zIndex: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  editBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(99, 102, 241, 0.8)",
  },
  userName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  statusText: {
    color: "#10b981",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  statItem: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
  },
  statLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 2,
    marginBottom: 16,
    marginLeft: 8,
  },
  xpCard: {
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  xpLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#22d3ee",
    letterSpacing: 1.5,
  },
  xpValue: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  xpBarTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 3,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: "#06b6d4",
    borderRadius: 3,
  },
  styleSelector: {
    padding: 18,
  },
  styleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  styleOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 12,
    borderRadius: 20,
    marginLeft: 60,
  },
  styleOption: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  styleOptionActive: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  menuCard: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  menuIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 16,
  },
  menuIconGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  menuValue: {
    fontSize: 13,
    color: "#475569",
    marginRight: 10,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    marginLeft: 76,
  },
  logoutButton: {
    height: 60,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
  },
  logoutGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "800",
  },
  versionText: {
    textAlign: "center",
    color: "#334155",
    fontSize: 12,
    marginTop: 40,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBlur: {
    width: "80%",
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalContent: {
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 20,
  },
  modalInput: {
    width: "100%",
    height: 56,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 16,
    paddingHorizontal: 20,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  cancelText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "700",
  },
  modalSave: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    overflow: "hidden",
  },
  saveGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});

