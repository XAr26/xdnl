import React, { useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue, 
  withTiming,
  FadeInUp
} from 'react-native-reanimated';


import { IconSymbol } from '@/components/ui/icon-symbol';
import { MaterialTopTabs } from '@/components/SwipeableTabs';
import { useAppStore } from '@/services/store';

const { width } = Dimensions.get('window');

function AnimatedTabIcon({ focused, name, color }: { focused: boolean; name: any; color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.3 : 1, { damping: 12, stiffness: 120 });
    opacity.value = withTiming(focused ? 1 : 0.6, { duration: 250 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <IconSymbol size={26} name={name} color={color} />
      {focused && (
        <Animated.View 
          entering={FadeInUp.duration(400)}
          style={[styles.activeIndicator, { backgroundColor: color }]} 
        />
      )}
    </Animated.View>
  );
}

export default function TabLayout() {
  const { isDarkMode } = useAppStore();

  const theme = {
    tabBg: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    tabBorder: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 41, 0.1)',
    containerBg: isDarkMode ? '#020617' : '#f8fafc',
    activeTint: '#22d3ee',
    inactiveTint: isDarkMode ? '#64748b' : '#94a3b8',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.containerBg }]}>
      <MaterialTopTabs
        tabBarPosition="bottom"
        keyboardDismissMode="on-drag"
        screenOptions={{
          tabBarActiveTintColor: theme.activeTint,
          tabBarInactiveTintColor: theme.inactiveTint,
          tabBarIndicatorStyle: { height: 0 },
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 34 : 20,
            left: 20,
            right: 20,
            elevation: 8,
            height: 64,
            borderRadius: 32,
            backgroundColor: theme.tabBg,
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: theme.tabBorder,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 8,
          },
          tabBarShowIcon: true,
        }}>


        <MaterialTopTabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon focused={focused} name="house.fill" color={color} />
            ),
          }}
        />
        <MaterialTopTabs.Screen
          name="explore"
          options={{
            title: 'History',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon focused={focused} name="clock.fill" color={color} />
            ),
          }}
        />
        <MaterialTopTabs.Screen
          name="ai"
          options={{
            title: 'AI',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon focused={focused} name="bolt.fill" color={color} />
            ),
          }}
        />
        <MaterialTopTabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon focused={focused} name="person.fill" color={color} />
            ),
          }}
        />
      </MaterialTopTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    width: 48,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});

