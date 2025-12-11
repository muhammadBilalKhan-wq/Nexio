import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "@/components/ThemedText";
import { UserAvatar } from "@/components/UserAvatar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Post, User } from "@shared/schema";

interface PostCardProps {
  post: Post;
  author: User;
  onUpvote?: () => void;
  onSave?: () => void;
  isUpvoted?: boolean;
  isSaved?: boolean;
}

export function PostCard({
  post,
  author,
  onUpvote,
  onSave,
  isUpvoted = false,
  isSaved = false,
}: PostCardProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    navigation.navigate("PostDetail", { postId: post.id });
  };

  const handleAuthorPress = () => {
    navigation.navigate("UserProfile", { userId: author.id });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {post.coverImageUrl ? (
        <Image
          source={{ uri: post.coverImageUrl }}
          style={styles.coverImage}
          contentFit="cover"
        />
      ) : null}

      <View style={styles.content}>
        <Pressable style={styles.authorRow} onPress={handleAuthorPress}>
          <UserAvatar uri={author.profilePicUrl} size="small" />
          <View style={styles.authorInfo}>
            <ThemedText type="small" style={styles.authorName}>
              {author.name}
            </ThemedText>
            <ThemedText
              type="caption"
              style={{ color: theme.textSecondary }}
            >
              {formatDate(post.createdAt)}
            </ThemedText>
          </View>
        </Pressable>

        <ThemedText type="h4" style={styles.title} numberOfLines={2}>
          {post.title}
        </ThemedText>

        <ThemedText
          type="body"
          style={[styles.snippet, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {post.content}
        </ThemedText>

        <View style={styles.footer}>
          <CategoryBadge category={post.category} size="small" />

          <View style={styles.stats}>
            <Pressable
              style={styles.statItem}
              onPress={(e) => {
                e.stopPropagation();
                onUpvote?.();
              }}
            >
              <Feather
                name={isUpvoted ? "arrow-up" : "arrow-up"}
                size={18}
                color={isUpvoted ? theme.primary : theme.textSecondary}
              />
              <ThemedText
                type="small"
                style={{ color: isUpvoted ? theme.primary : theme.textSecondary }}
              >
                {post.upvotesCount}
              </ThemedText>
            </Pressable>

            <View style={styles.statItem}>
              <Feather
                name="message-circle"
                size={18}
                color={theme.textSecondary}
              />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {post.commentsCount}
              </ThemedText>
            </View>

            <Pressable
              style={styles.statItem}
              onPress={(e) => {
                e.stopPropagation();
                onSave?.();
              }}
            >
              <Feather
                name={isSaved ? "bookmark" : "bookmark"}
                size={18}
                color={isSaved ? theme.primary : theme.textSecondary}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  coverImage: {
    width: "100%",
    height: 160,
  },
  content: {
    padding: Spacing.md,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  authorInfo: {
    marginLeft: Spacing.sm,
  },
  authorName: {
    fontWeight: "600",
  },
  title: {
    marginBottom: Spacing.xs,
  },
  snippet: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
});
