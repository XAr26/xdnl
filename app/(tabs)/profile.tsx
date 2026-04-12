import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { useAppStore } from "@/services/store";

export default function ProfileScreen() {
  const { history, aiFireLevel, aiExperience, aiFireType, setFireType } = useAppStore();
  const xpNeeded = aiFireLevel * 100;
  const progress = (aiExperience / xpNeeded) * 100;

  const fireStyles = [
    { type: 'flame', icon: 'flame', color: '#f59e0b' },
    { type: 'bonfire', icon: 'bonfire', color: '#ef4444' },
    { type: 'flash', icon: 'flash', color: '#eab308' },
    { type: 'sparkles', icon: 'sparkles', color: '#818cf8' },
  ];
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#020617", "#0f172a", "#1b1a33"]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGlow} />
            <LinearGradient
              colors={["#818cf8", "#6366f1"]}
              style={styles.avatarGradient}
            >
              <Ionicons name="person" size={50} color="#fff" />
            </LinearGradient>
            <TouchableOpacity style={styles.editBadge}>
               <BlurView intensity={20} tint="light" style={styles.editBlur}>
                  <Ionicons name="camera-outline" size={16} color="#fff" />
               </BlurView>
            </TouchableOpacity>
          </View>
          
          <ThemedText type="title" style={styles.userName}>AntiGravity Voyager</ThemedText>
          <View style={styles.statusBadge}>
             <Ionicons name="shield-checkmark" size={12} color="#10b981" />
             <ThemedText style={styles.statusText}>PREMIUM MEMBER</ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(350).springify()} style={styles.xpCard}>
           <View style={styles.xpHeader}>
              <ThemedText style={styles.xpLabel}>FIRE PROGRESS</ThemedText>
              <ThemedText style={styles.xpValue}>{aiExperience} / {xpNeeded} XP</ThemedText>
           </View>
           <View style={styles.xpBarTrack}>
              <Animated.View style={[styles.xpBarFill, { width: `${progress}%` }]} />
           </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.statsRow}>
           <StatItem label="Downloads" value={history.length.toString()} />
           <StatItem label="Saved Data" value="4.2 GB" />
           <StatItem label="AI Rank" value={`LVL ${aiFireLevel}`} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.section}>
          <ThemedText style={styles.sectionTitle}>PENGATURAN</ThemedText>
          
          <BlurView intensity={20} tint="dark" style={styles.menuCard}>
            <MenuItem 
              icon="notifications" 
              title="Notifikasi Pintar" 
              right={<Switch value={true} trackColor={{ false: "#1e293b", true: "#6366f1" }} thumbColor="#fff" />} 
            />
            <Divider />
            <View style={styles.styleSelector}>
               <View style={styles.styleHeader}>
                  <View style={styles.menuIconWrapper}>
                    <LinearGradient colors={["rgba(129, 140, 248, 0.2)", "rgba(129, 140, 248, 0.05)"]} style={styles.menuIconGradient}>
                        <Ionicons name="color-palette" size={20} color="#818cf8" />
                    </LinearGradient>
                  </View>
                  <ThemedText style={styles.menuTitle}>AI Fire Style</ThemedText>
               </View>
               <View style={styles.styleOptions}>
                  {fireStyles.map((style) => (
                    <TouchableOpacity 
                      key={style.type}
                      onPress={() => setFireType(style.type)}
                      style={[
                        styles.styleOption,
                        aiFireType === style.type && styles.styleOptionActive
                      ]}
                    >
                      <Ionicons name={style.icon as any} size={24} color={style.color} />
                    </TouchableOpacity>
                  ))}
               </View>
            </View>
            <Divider />
            <MenuItem 
              icon="flash" 
              title="Turbo Download" 
              right={<Switch value={true} trackColor={{ false: "#1e293b", true: "#6366f1" }} thumbColor="#fff" />} 
            />
            <Divider />
            <MenuItem 
              icon="folder-open" 
              title="Lokasi Penyimpanan" 
              value="/AntiGravity/Files"
            />
          </BlurView>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.section}>
          <ThemedText style={styles.sectionTitle}>SUPPORT & INFO</ThemedText>
          <BlurView intensity={20} tint="dark" style={styles.menuCard}>
            <MenuItem icon="help-buoy" title="Pusat Bantuan" />
            <Divider />
            <MenuItem icon="star" title="Beri Rating AntiGravity" />
            <Divider />
            <MenuItem icon="information-circle" title="Tentang Aplikasi" />
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

        <ThemedText style={styles.versionText}>AntiGravity v1.5.0-PRO</ThemedText>
      </ScrollView>
    </View>
  );
}

function StatItem({ label, value }: any) {
  return (
    <BlurView intensity={10} tint="dark" style={styles.statItem}>
       <ThemedText style={styles.statLabel}>{label}</ThemedText>
       <ThemedText style={styles.statValue}>{value}</ThemedText>
    </BlurView>
  );
}

function MenuItem({ icon, title, right, value }: any) {
  return (
    <View style={styles.menuItem}>
      <View style={styles.menuIconWrapper}>
        <LinearGradient
          colors={["rgba(129, 140, 248, 0.2)", "rgba(129, 140, 248, 0.05)"]}
          style={styles.menuIconGradient}
        >
          <Ionicons name={icon} size={20} color="#818cf8" />
        </LinearGradient>
      </View>
      <ThemedText style={styles.menuTitle}>{title}</ThemedText>
      {value && <ThemedText style={styles.menuValue}>{value}</ThemedText>}
      {right ? right : <Ionicons name="chevron-forward" size={18} color="#475569" />}
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
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
    color: "#818cf8",
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
    backgroundColor: "#6366f1",
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
  }
});

