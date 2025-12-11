import React, { useState, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderButton } from "@react-navigation/elements";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "@/components/ThemedText";
import { TextInput } from "@/components/TextInput";
import { UserAvatar } from "@/components/UserAvatar";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [expertise, setExpertise] = useState(user?.expertise || "");
  const [profilePicUrl, setProfilePicUrl] = useState(
    user?.profilePicUrl || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    name !== user?.name ||
    bio !== (user?.bio || "") ||
    expertise !== (user?.expertise || "") ||
    profilePicUrl !== (user?.profilePicUrl || "");

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setIsSaving(true);
    try {
      await updateUser({
        name: name.trim(),
        bio: bio.trim() || null,
        expertise: expertise.trim() || null,
        profilePicUrl: profilePicUrl.trim() || null,
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePicUrl(result.assets[0].uri);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButton onPress={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <ThemedText
              type="body"
              style={{
                color: hasChanges ? theme.primary : theme.textSecondary,
                fontWeight: "600",
              }}
            >
              Save
            </ThemedText>
          )}
        </HeaderButton>
      ),
    });
  }, [navigation, theme, hasChanges, isSaving, name, bio, expertise, profilePicUrl]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarSection}>
            <Pressable onPress={handlePickImage}>
              <UserAvatar uri={profilePicUrl} size="profile" />
              <View
                style={[
                  styles.changePhotoButton,
                  { backgroundColor: theme.primary },
                ]}
              >
                <ThemedText type="small" style={{ color: "#FFFFFF" }}>
                  Change
                </ThemedText>
              </View>
            </Pressable>
          </View>

          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoCapitalize="words"
          />

          <TextInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself..."
            multiline
            maxLength={160}
          />
          <ThemedText
            type="caption"
            style={[styles.charCount, { color: theme.textSecondary }]}
          >
            {bio.length}/160
          </ThemedText>

          <TextInput
            label="Expertise"
            value={expertise}
            onChangeText={setExpertise}
            placeholder="e.g., Software Engineering, Data Science"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 0,
    right: -10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  charCount: {
    textAlign: "right",
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
});
