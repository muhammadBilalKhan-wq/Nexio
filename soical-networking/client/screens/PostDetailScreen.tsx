import React, { useState, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HeaderButton } from "@react-navigation/elements";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedIcon } from "@/components/ThemedIcon";
import { UserAvatar } from "@/components/UserAvatar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Button } from "@/components/Button";
import { TextInput } from "@/components/TextInput";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/query-client";
import { Spacing, Shadows } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Post, User, Comment, PostImage } from "@shared/schema";

interface PostDetail extends Post {
  author: User;
  isUpvoted: boolean;
  isSaved: boolean;
  images?: PostImage[];
}

interface CommentWithAuthor extends Comment {
  author: User;
}

export default function PostDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "PostDetail">>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { postId } = route.params;

  const [newComment, setNewComment] = useState("");

  const { data: post, isLoading } = useQuery<PostDetail>({
    queryKey: ["/api/posts", postId],
  });

  const { data: comments } = useQuery<CommentWithAuthor[]>({
    queryKey: ["/api/posts", postId, "comments"],
  });

  const upvoteMutation = useMutation({
    mutationFn: async () => {
      if (post?.isUpvoted) {
        await apiRequest("DELETE", `/api/posts/${postId}/upvote`);
      } else {
        await apiRequest("POST", `/api/posts/${postId}/upvote`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (post?.isSaved) {
        await apiRequest("DELETE", `/api/posts/${postId}/save`);
      } else {
        await apiRequest("POST", `/api/posts/${postId}/save`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${postId}/comments`, {
        content: newComment.trim(),
        authorId: user?.id,
      });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({
        queryKey: ["/api/posts", postId, "comments"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (reason: string) => {
      await apiRequest("POST", "/api/reports", {
        postId,
        reporterId: user?.id,
        reason,
      });
    },
    onSuccess: () => {
      Alert.alert(
        "Reported",
        "Thank you for your report. We'll review it shortly."
      );
    },
  });
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => apiRequest("DELETE", `/api/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
    },
  });


  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: Spacing.md }}>
          <HeaderButton
            onPress={() => {
              Alert.alert("Report Post", "Why are you reporting this post?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Spam",
                  onPress: () => reportMutation.mutate("Spam"),
                },
                {
                  text: "Inappropriate",
                  onPress: () => reportMutation.mutate("Inappropriate content"),
                },
                {
                  text: "Misinformation",
                  onPress: () => reportMutation.mutate("Misinformation"),
                },
              ]);
            }}
          >
            <ThemedIcon set="Feather" name="flag" size={20} color={theme.textSecondary} />
          </HeaderButton>
        </View>
      ),
    });
  }, [navigation, theme]);

  if (isLoading || !post) {
    return (
      <ThemedView style={styles.container}>
        <LoadingSpinner fullScreen />
      </ThemedView>
    );
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 80 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {post.coverImageUrl ? (
          <Image
            source={{ uri: post.coverImageUrl }}
            style={styles.coverImage}
            contentFit="cover"
          />
        ) : null}

        <View style={styles.main}>
          <Pressable
            style={styles.authorRow}
            onPress={() =>
              navigation.navigate("UserProfile", { userId: post.authorId })
            }
          >
            <UserAvatar uri={post.author.profilePicUrl} size="medium" />
            <View style={styles.authorInfo}>
              <ThemedText type="body" style={styles.authorName}>
                {post.author.name}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {post.author.expertise || "Knowledge Sharer"}
              </ThemedText>
            </View>
            <Button onPress={() => {}} style={styles.followButton}>
              Follow
            </Button>
          </Pressable>

          <ThemedText type="h2" style={styles.title}>
            {post.title}
          </ThemedText>

          <View style={styles.meta}>
            <CategoryBadge category={post.category} size="small" />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {formatDate(post.createdAt)}
            </ThemedText>
          </View>

          <ThemedText type="body" style={styles.body}>
            {post.content}
          </ThemedText>

          {post.images && post.images.length > 0 ? (
            <View style={styles.imagesSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imagesScroll}
              >
                {post.images.map((img, index) => (
                  <Image
                    key={img.id || index}
                    source={{ uri: img.imageUrl }}
                    style={styles.postImage}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {post.tags ? (
            <View style={styles.tags}>
              {post.tags.split(",").map((tag, index) => (
                <ThemedText
                  key={index}
                  type="small"
                  style={{ color: theme.primary }}
                >
                  #{tag.trim()}
                </ThemedText>
              ))}
            </View>
          ) : null}

          <View style={styles.interactions}>
            <Pressable
              style={styles.interactionItem}
              onPress={() => upvoteMutation.mutate()}
            >
              <ThemedIcon
                set="Feather"
                name="arrow-up"
                size={24}
                color={post.isUpvoted ? theme.primary : theme.text}
              />
              <ThemedText
                type="body"
                style={{
                  color: post.isUpvoted ? theme.primary : theme.text,
                }}
              >
                {post.upvotesCount}
              </ThemedText>
            </Pressable>

            <View style={styles.interactionItem}>
              <ThemedIcon
                set="Feather"
                name="message-circle"
                size={24}
                color={theme.text}
              />
              <ThemedText type="body">{post.commentsCount}</ThemedText>
            </View>

            <Pressable
              style={styles.interactionItem}
              onPress={() => saveMutation.mutate()}
            >
              <ThemedIcon
                set="Feather"
                name="bookmark"
                size={24}
                color={post.isSaved ? theme.primary : theme.text}
              />
            </Pressable>

            <Pressable style={styles.interactionItem}>
              <ThemedIcon set="Feather" name="share" size={24} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.commentsSection}>
            <ThemedText type="h4" style={styles.commentsTitle}>
              Comments ({comments?.length || 0})
            </ThemedText>

            {comments?.map((comment) => (
              <View key={comment.id} style={styles.comment}>
                <UserAvatar uri={comment.author.profilePicUrl} size="small" />
                <View style={styles.commentContent}>
                  <ThemedText type="small" style={styles.commentAuthor}>
                    {comment.author.name}
                  </ThemedText>
                  <ThemedText type="body">{comment.content}</ThemedText>
                </View>
                 {user?.id === comment.authorId && (
                  <Pressable
                    onPress={() => deleteCommentMutation.mutate(comment.id)}
                    style={styles.deleteButton}
                  >
                    <ThemedIcon name="trash" size={18} color={theme.textSecondary} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.commentInput,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.sm,
            borderTopColor: theme.border,
          },
        ]}
      >
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          style={styles.input}
        />
        <Pressable
          onPress={() => newComment.trim() && commentMutation.mutate()}
          disabled={!newComment.trim() || commentMutation.isPending}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <ThemedIcon
            set="Feather"
            name="send"
            size={24}
            color={newComment.trim() ? theme.primary : theme.textSecondary}
          />
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  coverImage: {
    width: "100%",
    height: 200,
  },
  main: {
    padding: Spacing.md,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  authorInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  authorName: {
    fontWeight: "600",
  },
  followButton: {
    paddingHorizontal: Spacing.lg,
    height: 36,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  body: {
    marginBottom: Spacing.lg,
  },
  imagesSection: {
    marginBottom: Spacing.lg,
  },
  imagesScroll: {
    gap: Spacing.sm,
  },
  postImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  interactions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E5EA",
  },
  interactionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  commentsSection: {
    marginTop: Spacing.lg,
  },
  commentsTitle: {
    marginBottom: Spacing.md,
  },
  comment: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  commentContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  commentAuthor: {
    fontWeight: "600",
    marginBottom: 2,
  },
  commentInput: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
    ...Shadows.floatingInput,
  },
  input: {
    flex: 1,
    marginBottom: 0,
  },
   deleteButton: {
    marginLeft: Spacing.sm,
    justifyContent: "center",
  },
});
