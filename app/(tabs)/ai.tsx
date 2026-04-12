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

const { width } = Dimensions.get("window");

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
      text: "Halo! Saya AntiGravity AI. Butuh saran video keren untuk didownload hari ini?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  
  const { aiFireLevel, aiFireType, addExperience } = useAppStore();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), type: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    addExperience(10);

    // Simulasi AI Logic
    setTimeout(() => {
      let aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        text: "Tentu! Ini beberapa video yang sedang trending dan mungkin kamu suka:",
      };

      const lowerInput = input.toLowerCase();
      if (lowerInput.includes("lucu") || lowerInput.includes("funny")) {
        aiResponse.text = "Ini video lucu yang bisa bikin kamu tertawa:";
        aiResponse.suggestion = {
          title: "Top 10 Funny Cats 2026",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnail: "https://placedog.net/500/280",
        };
      } else {
        aiResponse.suggestion = {
            title: "Exploring the Galaxy - Premium 4K",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            thumbnail: "https://placedog.net/500/280",
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (url: string) => {
    router.push({ pathname: "/", params: { url } });
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#020617", "#0f172a", "#1e1b4b"]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={styles.header}>
            <View style={styles.aiBadge}>
                <Ionicons name={aiFireType as any} size={14} color="#f59e0b" />
                <ThemedText style={styles.aiBadgeText}>LVL {aiFireLevel} Assistant</ThemedText>
            </View>
            <ThemedText type="title" style={styles.title}>AntiGravity AI</ThemedText>
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
                  tint="dark"
                  style={[
                    styles.messageBubble,
                    msg.type === "user" ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <ThemedText style={styles.messageText}>{msg.text}</ThemedText>
                </BlurView>

                {msg.suggestion && (
                  <TouchableOpacity
                    onPress={() => handleSuggestionClick(msg.suggestion!.url)}
                    activeOpacity={0.8}
                    style={styles.suggestionCard}
                  >
                    <BlurView intensity={30} tint="dark" style={styles.suggestionBlur}>
                        <Image 
                          source={{ uri: msg.suggestion.thumbnail }} 
                          style={styles.suggestionThumb} 
                        />
                        <View style={styles.suggestionInfo}>
                          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.suggestionTitle}>
                              {msg.suggestion.title}
                          </ThemedText>
                          <View style={styles.suggestionAction}>
                              <ThemedText style={styles.suggestionLink}>Download Now</ThemedText>
                              <Ionicons name="arrow-forward-circle" size={16} color="#818cf8" />
                          </View>
                        </View>
                    </BlurView>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          ))}
          {isTyping && (
             <Animated.View entering={FadeInUp} style={styles.typingContainer}>
                <BlurView intensity={10} tint="dark" style={styles.typingBlur}>
                  <ActivityIndicator size="small" color="#818cf8" />
                  <ThemedText style={styles.typingText}>AI is thinking...</ThemedText>
                </BlurView>
             </Animated.View>
          )}
        </ScrollView>

        <BlurView intensity={25} tint="dark" style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Type your question..."
              placeholderTextColor="#475569"
              value={input}
              onChangeText={setInput}
              style={styles.input}
              onFocus={() => {
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
              }}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <LinearGradient
                colors={["#6366f1", "#4f46e5"]}
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
    backgroundColor: "rgba(129, 140, 248, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.2)",
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#818cf8",
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
    backgroundColor: "#6366f1",
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
    backgroundColor: "#6366f1",
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
    color: "#818cf8",
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
  }
});

