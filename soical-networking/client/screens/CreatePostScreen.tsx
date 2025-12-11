import React, { useState, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { TextInput } from "@/components/TextInput";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/query-client";
import { Spacing, Categories } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_MB = 5;

export default function CreatePostScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const isValid =
    title.trim().length > 0 && content.trim().length > 0 && category;

  const pickImages = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Info", "Image picker works best in Expo Go on your device");
      return;
    }

    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert("Limit Reached", `Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to upload images"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - selectedImages.length,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const newImages: string[] = [];
      for (const asset of result.assets) {
        if (asset.base64) {
          const mimeType = asset.mimeType || "image/jpeg";
          if (!["image/jpeg", "image/png", "image/gif"].includes(mimeType)) {
            Alert.alert("Invalid Format", "Only JPG, PNG, and GIF images are allowed");
            continue;
          }
          const base64Size = (asset.base64.length * 3) / 4;
          if (base64Size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            Alert.alert("Image Too Large", `Images must be under ${MAX_IMAGE_SIZE_MB}MB`);
            continue;
          }
          newImages.push(`data:${mimeType};base64,${asset.base64}`);
        }
      }
      setSelectedImages((prev) => [...prev, ...newImages].slice(0, MAX_IMAGES));
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/posts", {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags.trim() || null,
        authorId: user?.id,
        images: selectedImages.length > 0 ? selectedImages : undefined,
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          errorData = { message: res.statusText };
        }
        throw new Error(errorData.message || "Failed to create post");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      Alert.alert("Success", "Your post has been published!");
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to create post");
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <ScreenWrapper withScrollView={false} safeAreaEdges={["bottom"]}>
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.border,
            paddingTop: insets.top + Spacing.sm,
            paddingBottom: Spacing.sm,
          },
        ]}
      >
        <View style={styles.headerButton}>
            <Pressable onPress={() => navigation.goBack()}>
              <ThemedText type="body" style={{ color: theme.primary }}>
                Cancel
              </ThemedText>
            </Pressable>
        </View>
        <View style={styles.headerTitle}>
            <ThemedText type="body" style={styles.titleText}>
              New Post
            </ThemedText>
        </View>
        <View style={styles.headerButton}>
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                createPostMutation.mutate();
              }}
              disabled={!isValid || createPostMutation.isPending}
            >
              {createPostMutation.isPending ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <ThemedText
                  type="body"
                  style={{
                    color: isValid ? theme.primary : theme.textSecondary,
                    fontWeight: "600",
                  }}
                >
                  Publish
                </ThemedText>
              )}
            </Pressable>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="What's your knowledge about?"
          maxLength={100}
        />

        <View>
          <ThemedText type="small" style={styles.label}>
            Category
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {Categories.map((cat) => (
              <CategoryBadge
                key={cat}
                category={cat}
                selected={category === cat}
                onPress={() => setCategory(cat)}
              />
            ))}
          </ScrollView>
        </View>

        <View>
          <ThemedText type="small" style={styles.label}>
            Content
          </ThemedText>
          <View
            style={[
              styles.contentInput,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Share your knowledge, insights, or guide..."
              multiline
              maxLength={2000}
              style={styles.textArea}
            />
          </View>
          <ThemedText
            type="caption"
            style={[styles.charCount, { color: theme.textSecondary }]}
          >
            {content.length}/2000
          </ThemedText>
        </View>

        <View>
          <View style={styles.labelRow}>
            <ThemedText type="small" style={styles.label}>
              Images (optional)
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {selectedImages.length}/{MAX_IMAGES}
            </ThemedText>
          </View>
          
          <View style={styles.imagesContainer}>
            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri }}
                  style={styles.imagePreview}
                  contentFit="cover"
                />
                <Pressable
                  style={[styles.removeButton, { backgroundColor: theme.error }]}
                  onPress={() => removeImage(index)}
                >
                  <Feather name="x" size={14} color="#fff" />
                </Pressable>
              </View>
            ))}
            
            {selectedImages.length < MAX_IMAGES ? (
              <Pressable
                style={[
                  styles.addImageButton,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.border,
                  },
                ]}
                onPress={pickImages}
              >
                <Feather name="plus" size={24} color={theme.textSecondary} />
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Add
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        </View>

        <TextInput
          label="Tags (optional)"
          value={tags}
          onChangeText={setTags}
          placeholder="e.g., programming, tips, tutorial"
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 80,
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
  },
  titleText: {
    fontWeight: "600",
    textAlign: 'center',
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
    flexGrow: 1,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  categories: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 200,
  },
  textArea: {
    height: "100%",
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  imageWrapper: {
    position: "relative",
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
});
