import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { UserAvatar } from "@/components/UserAvatar";
import { ReputationBadge } from "@/components/ReputationBadge";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Post, User } from "@shared/schema";

interface UserProfile extends User {
  isFollowing: boolean;
}

interface PostWithAuthor extends Post {
  author: User;
  isUpvoted: boolean;
  isSaved: boolean;
}

export default function UserProfileScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "UserProfile">>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { userId } = route.params;

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: userPosts, isLoading: loadingPosts } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/users", userId, "posts"],
    enabled: !!userId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (profile?.isFollowing) {
        await apiRequest("DELETE", `/api/users/${userId}/follow`);
      } else {
        await apiRequest("POST", `/api/users/${userId}/follow`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
    },
  });

  if (isLoading || !profile) {
    return (
      <ThemedView style={styles.container}>
        <LoadingSpinner fullScreen />
      </ThemedView>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.profileSection}>
        <UserAvatar uri={profile.profilePicUrl} size="profile" />
        <ThemedText type="h3" style={styles.name}>
          {profile.name}
        </ThemedText>
        {profile.expertise ? (
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {profile.expertise}
          </ThemedText>
        ) : null}
        {profile.bio ? (
          <ThemedText
            type="body"
            style={[styles.bio, { color: theme.textSecondary }]}
          >
            {profile.bio}
          </ThemedText>
        ) : null}

        <ReputationBadge score={profile.reputationScore} />

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <ThemedText type="h4">{profile.postsCount}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Posts
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="h4">{profile.followersCount}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Followers
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="h4">{profile.followingCount}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Following
            </ThemedText>
          </View>
        </View>

        {!isOwnProfile ? (
          <Button
            onPress={() => followMutation.mutate()}
            style={[
              styles.followButton,
              profile.isFollowing && {
                backgroundColor: "transparent",
                borderWidth: 1,
                borderColor: theme.primary,
              },
            ]}
          >
            {profile.isFollowing ? "Following" : "Follow"}
          </Button>
        ) : null}
      </View>

      <ThemedText type="h4" style={styles.postsTitle}>
        Posts
      </ThemedText>
    </View>
  );

  const renderItem = ({ item }: { item: PostWithAuthor }) => (
    <PostCard post={item} author={item.author} />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={userPosts || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          loadingPosts ? (
            <LoadingSpinner />
          ) : (
            <EmptyState
              icon="edit-3"
              title="No Posts Yet"
              description={`${profile.name} hasn't shared any knowledge yet.`}
            />
          )
        }
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Spacing.lg,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  name: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  bio: {
    textAlign: "center",
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  stats: {
    flexDirection: "row",
    gap: Spacing.xl,
    marginVertical: Spacing.lg,
  },
  statItem: {
    alignItems: "center",
  },
  followButton: {
    minWidth: 150,
  },
  postsTitle: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  list: {
    paddingHorizontal: Spacing.md,
    flexGrow: 1,
  },
});
