import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import FeedScreen from "@/screens/FeedScreen";
import ExploreScreen from "@/screens/ExploreScreen";
import NotificationsScreen from "@/screens/NotificationsScreen";
import MyProfileScreen from "@/screens/MyProfileScreen";
import { ThemedIcon } from "@/components/ThemedIcon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Shadows } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export type MainTabParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  CreateTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function EmptyScreen() {
  return <View />;
}

function CreateTabButton() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View
      style={[
        styles.fabContainer,
        { bottom: insets.bottom + Spacing.md },
      ]}
    >
      <Pressable
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate("CreatePost")}
      >
        <ThemedIcon set="Feather" name="plus" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tab.Navigator
        initialRouteName="HomeTab"
        screenOptions={{
          tabBarActiveTintColor: theme.tabIconSelected,
          tabBarInactiveTintColor: theme.tabIconDefault,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: Platform.select({
              ios: "transparent",
              android: theme.backgroundRoot,
            }),
            borderTopWidth: 0,
            elevation: 0,
            height: 50 + insets.bottom,
            paddingBottom: insets.bottom,
          },
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView
                intensity={100}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : null,
          headerShown: false,
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={FeedScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <ThemedIcon set="Feather" name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ExploreTab"
          component={ExploreScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <ThemedIcon
                set="Feather"
                name="compass"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="CreateTab"
          component={EmptyScreen}
          options={{
            tabBarButton: () => null,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
            },
          }}
        />
        <Tab.Screen
          name="NotificationsTab"
          component={NotificationsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <ThemedIcon set="Feather" name="bell" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={MyProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <ThemedIcon set="Feather" name="user" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <CreateTabButton />
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "box-none",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.fab,
  },
});
