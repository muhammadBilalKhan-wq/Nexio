import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme as useSystemColorScheme,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SettingsRow } from "@/components/SettingsRow";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const systemColorScheme = useSystemColorScheme();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Confirm Delete",
              "Please confirm you want to permanently delete your account and all your data.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete Forever",
                  style: "destructive",
                  onPress: () => {
                    logout();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Account
          </ThemedText>
          <View style={[styles.sectionContent, { backgroundColor: theme.backgroundDefault }]}>
            <SettingsRow
              icon="user"
              label="Edit Profile"
              onPress={() => navigation.navigate("EditProfile")}
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <SettingsRow
              icon="lock"
              label="Change Password"
              onPress={() => Alert.alert("Coming Soon", "Password change will be available soon.")}
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <SettingsRow
              icon="shield"
              label="Privacy"
              onPress={() => Alert.alert("Coming Soon", "Privacy settings will be available soon.")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Preferences
          </ThemedText>
          <View style={[styles.sectionContent, { backgroundColor: theme.backgroundDefault }]}>
            <SettingsRow
              icon="moon"
              label="Dark Mode"
              value={isDark ? "On" : "Off"}
              showChevron={false}
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <SettingsRow
              icon="globe"
              label="Language"
              value="English"
              onPress={() => Alert.alert("Coming Soon", "Language settings will be available soon.")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            About
          </ThemedText>
          <View style={[styles.sectionContent, { backgroundColor: theme.backgroundDefault }]}>
            <SettingsRow
              icon="file-text"
              label="Privacy Policy"
              onPress={() => Alert.alert("Privacy Policy", "Privacy policy will be available soon.")}
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <SettingsRow
              icon="file"
              label="Terms of Service"
              onPress={() => Alert.alert("Terms", "Terms of service will be available soon.")}
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <SettingsRow
              icon="info"
              label="Version"
              value="1.0.0"
              showChevron={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Danger Zone
          </ThemedText>
          <View style={[styles.sectionContent, { backgroundColor: theme.backgroundDefault }]}>
            <SettingsRow
              icon="trash-2"
              label="Delete Account"
              onPress={handleDeleteAccount}
              showChevron={false}
              danger
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionContent, { backgroundColor: theme.backgroundDefault }]}>
            <SettingsRow
              icon="log-out"
              label="Log Out"
              onPress={handleLogout}
              showChevron={false}
              danger
            />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginLeft: Spacing.md,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  sectionContent: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    marginLeft: Spacing.md + 36 + Spacing.md,
  },
});
