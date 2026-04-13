import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInRight, SlideInRight } from "react-native-reanimated";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { useAppStore } from "@/services/store";
import { Config } from "@/constants/config";

const { width } = Dimensions.get("window");
const OLLAMA_URL = Config.OLLAMA_URL;
const OLLAMA_MODEL = Config.OLLAMA_MODEL;
const SYSTEM_PROMPT = `Anda Xdwn AI, asisten download video. Berikan saran video. 
Format saran WAJIB di akhir: SUGGESTION_JSON:{"title":"..","url":"..","thumbnail":".."}`;

interface Message {
  id: string;
  type: "user" | "ai";
  text: string;
  suggestion?: {
    title: string;
    url: string;
    thumbnail?: string;
  };
}

export default function AIScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      text: "Halo! Saya Xdwn AI. Ada video menarik yang ingin kamu unduh hari ini?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const { aiFireLevel, addExperience, isDarkMode } = useAppStore();

  const theme = {
    bg: isDarkMode ? ["#020617", "#0f172a", "#083344"] : ["#f8fafc", "#f1f5f9", "#cbd5e1"],
    text: isDarkMode ? "#fff" : "#0f172a",
    subText: isDarkMode ? "#64748b" : "#475569",
    aiBubble: isDarkMode ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.9)",
    userBubble: isDarkMode ? "#06b6d4" : "rgba(6, 182, 212, 0.15)",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 41, 0.1)",
    inputAreaBg: isDarkMode ? "rgba(15, 23, 42, 0.6)" : "rgba(255, 255, 255, 0.6)",
    blur: isDarkMode ? "dark" : ("light" as any),
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), type: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    addExperience(10);

    // Ollama Local AI Logic
    try {
      const chatHistory = [
        { role: "system", content: SYSTEM_PROMPT }
      ];

      messages.forEach(msg => {
        chatHistory.push({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.text
        });
      });

      // Tambahkan pesan user terbaru
      chatHistory.push({ role: "user", content: input });

      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: chatHistory,
          stream: false
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Gagal menghubungi Ollama");

      const aiText = data.message.content;

      // Parsing Suggestion JSON jika ada
      const jsonMatch = aiText.match(/SUGGESTION_JSON:({.*})/);
      let suggestion = undefined;
      let cleanText = aiText;

      if (jsonMatch) {
        try {
          suggestion = JSON.parse(jsonMatch[1]);
          cleanText = aiText.replace(/SUGGESTION_JSON:{.*}/, "").trim();
        } catch (e) {
          console.error("Failed to parse suggestion JSON", e);
        }
      }

      const aiResponse: Message = {
        id: Date.now().toString(),
        type: "ai",
        text: cleanText,
        suggestion
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        type: "ai",
        text: "Maaf, gagal terhubung ke Ollama. Pastikan Ollama sudah berjalan di komputer Anda dan alamat IP benar. 🛰️",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (url: string) => {
    router.push({ pathname: "/", params: { url } });
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg[0] }]}>
      <LinearGradient
        colors={theme.bg as any}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={styles.header}>
          <View style={[styles.aiBadge, { backgroundColor: isDarkMode ? "rgba(34, 211, 238, 0.1)" : "rgba(34, 211, 238, 0.05)" }]}>
            <Ionicons name="flash" size={14} color="#22d3ee" />
            <ThemedText style={styles.aiBadgeText}>LVL {aiFireLevel} Assistant</ThemedText>
          </View>
          <ThemedText type="title" style={[styles.title, { color: theme.text }]}>Xdwn AI</ThemedText>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messageList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => (
            <Animated.View
              key={msg.id}
              entering={msg.type === "ai" ? FadeInUp.springify() : SlideInRight.springify()}
              style={[
                styles.messageWrapper,
                msg.type === "user" ? styles.userWrapper : styles.aiWrapper,
              ]}
            >
              {msg.type === "ai" && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="infinite" size={16} color="#fff" />
                </View>
              )}

              <View style={styles.bubbleContainer}>
                <BlurView
                  intensity={msg.type === "ai" ? 15 : 0}
                  tint={theme.blur}
                  style={[
                    styles.messageBubble,
                    msg.type === "user" ? { backgroundColor: theme.userBubble, borderBottomRightRadius: 4 } : { backgroundColor: theme.aiBubble, borderColor: theme.border, borderWidth: 1, borderBottomLeftRadius: 4 },
                  ]}
                >
                  <ThemedText style={[styles.messageText, { color: msg.type === "user" && isDarkMode ? "#fff" : theme.text }]}>{msg.text}</ThemedText>
                </BlurView>

                {msg.suggestion && (
                  <TouchableOpacity
                    onPress={() => handleSuggestionClick(msg.suggestion!.url)}
                    activeOpacity={0.8}
                    style={[styles.suggestionCard, { borderColor: theme.border }]}
                  >
                    <BlurView intensity={30} tint={theme.blur} style={styles.suggestionBlur}>
                      <Image
                        source={{ uri: msg.suggestion.thumbnail }}
                        style={styles.suggestionThumb}
                      />
                      <View style={styles.suggestionInfo}>
                        <ThemedText type="defaultSemiBold" numberOfLines={1} style={[styles.suggestionTitle, { color: theme.text }]}>
                          {msg.suggestion.title}
                        </ThemedText>
                        <View style={styles.suggestionAction}>
                          <ThemedText style={styles.suggestionLink}>Download Now</ThemedText>
                          <Ionicons name="arrow-forward-circle" size={16} color="#22d3ee" />
                        </View>
                      </View>
                    </BlurView>
                  </TouchableOpacity>
                )}

                {msg.type === "user" && msg.text.match(/(https?:\/\/[^\s]+)/) && (
                  <TouchableOpacity
                    onPress={() => {
                      const url = msg.text.match(/(https?:\/\/[^\s]+)/)?.[0];
                      if (url) handleSuggestionClick(url);
                    }}
                    activeOpacity={0.8}
                    style={[styles.urlActionCard, { borderColor: theme.border }]}
                  >
                    <BlurView intensity={30} tint={isDarkMode ? "light" : "dark"} style={styles.urlActionBlur}>
                      <Ionicons name="search" size={14} color="#fff" />
                      <ThemedText style={styles.urlActionText}>Analisis Video Ini</ThemedText>
                    </BlurView>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          ))}
          {isTyping && (
            <Animated.View entering={FadeInUp} style={styles.typingContainer}>
              <BlurView intensity={10} tint="dark" style={styles.typingBlur}>
                <ActivityIndicator size="small" color="#22d3ee" />
                <ThemedText style={styles.typingText}>AI is thinking...</ThemedText>
              </BlurView>
            </Animated.View>
          )}
        </ScrollView>

        <BlurView intensity={25} tint={theme.blur} style={[styles.inputArea, { borderColor: theme.border }]}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.inputAreaBg, borderColor: theme.border }]}>
            <TextInput
              placeholder="Type your question..."
              placeholderTextColor={isDarkMode ? "#475569" : "#94a3b8"}
              value={input}
              onChangeText={setInput}
              style={[styles.input, { color: theme.text }]}
              onFocus={() => {
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
              }}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <LinearGradient
                colors={["#06b6d4", "#0891b2"]}
                style={styles.sendGradient}
              >
                <Ionicons name="arrow-up" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
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
    paddingBottom: 16,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 211, 238, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(34, 211, 238, 0.2)",
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#22d3ee",
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "900",
    letterSpacing: -1,
  },
  messageList: {
    padding: 24,
    paddingBottom: 60,
  },
  messageWrapper: {
    marginBottom: 24,
    flexDirection: "row",
    gap: 12,
  },
  userWrapper: {
    flexDirection: "row-reverse",
  },
  aiWrapper: {
    flexDirection: "row",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#06b6d4",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  bubbleContainer: {
    maxWidth: width * 0.75,
  },
  messageBubble: {
    padding: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  userBubble: {
    backgroundColor: "#06b6d4",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  suggestionCard: {
    marginTop: 12,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  suggestionBlur: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  suggestionThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  suggestionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  suggestionAction: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  suggestionLink: {
    color: "#22d3ee",
    fontSize: 12,
    fontWeight: "800",
  },
  typingContainer: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  typingBlur: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  typingText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
  inputArea: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 110 : 90,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: 30,
    paddingLeft: 20,
    paddingRight: 6,
    height: 56,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  input: {
    flex: 1,
    color: "#fff",
    marginRight: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  sendGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  urlActionCard: {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  urlActionBlur: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(6, 182, 212, 0.3)",
  },
  urlActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});

