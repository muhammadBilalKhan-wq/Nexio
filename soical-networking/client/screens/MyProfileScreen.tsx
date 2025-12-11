import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
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
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Post, User } from "@shared/schema";

interface PostWithAuthor extends Post {
  author: User;
  isUpvoted: boolean;
  isSaved: boolean;
}

type Tab = "posts" | "saved";

export default function MyProfileScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabBarHeight = useBottomTabBarHeight();
  const [activeTab, setActiveTab] = useState<Tab>("posts");

  const { data: myPosts, isLoading: loadingPosts } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/users", user?.id, "posts"],
    enabled: !!user?.id,
  });

  const { data: savedPosts, isLoading: loadingSaved } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/users", user?.id, "saved"],
    enabled: !!user?.id && activeTab === "saved",
  });

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <LoadingSpinner fullScreen />
      </ThemedView>
    );
  }

  const currentPosts = activeTab === "posts" ? myPosts : savedPosts;
  const isLoading = activeTab === "posts" ? loadingPosts : loadingSaved;

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <ThemedText type="h3">Profile</ThemedText>
        <Pressable
          onPress={() => navigation.navigate("Settings")}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Feather name="settings" size={24} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.profileSection}>
        <UserAvatar uri={user.profilePicUrl} size="profile" />
        <ThemedText type="h3" style={styles.name}>
          {user.name}
        </ThemedText>
        {user.expertise ? (
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {user.expertise}
          </ThemedText>
        ) : null}
        {user.bio ? (
          <ThemedText
            type="body"
            style={[styles.bio, { color: theme.textSecondary }]}
          >
            {user.bio}
          </ThemedText>
        ) : null}

        <ReputationBadge score={user.reputationScore} />

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <ThemedText type="h4">{user.postsCount}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Posts
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="h4">{user.followersCount}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Followers
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="h4">{user.followingCount}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Following
            </ThemedText>
          </View>
        </View>

        <Button
          onPress={() => navigation.navigate("EditProfile")}
          style={styles.editButton}
        >
          Edit Profile
        </Button>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "posts" && {
              borderBottomColor: theme.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("posts")}
        >
          <ThemedText
            type="body"
            style={{
              color: activeTab === "posts" ? theme.primary : theme.textSecondary,
              fontWeight: activeTab === "posts" ? "600" : "400",
            }}
          >
            Posts
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === "saved" && {
              borderBottomColor: theme.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("saved")}
        >
          <ThemedText
            type="body"
            style={{
              color: activeTab === "saved" ? theme.primary : theme.textSecondary,
              fontWeight: activeTab === "saved" ? "600" : "400",
            }}
          >
            Saved
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: PostWithAuthor }) => (
    <PostCard post={item} author={item.author} />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={currentPosts || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? (
            <LoadingSpinner />
          ) : (
            <EmptyState
              icon={activeTab === "posts" ? "edit-3" : "bookmark"}
              title={activeTab === "posts" ? "No Posts Yet" : "No Saved Posts"}
              description={
                activeTab === "posts"
                  ? "Share your knowledge with the community!"
                  : "Save posts to read them later."
              }
              actionLabel={activeTab === "posts" ? "Create Post" : undefined}
              onAction={
                activeTab === "posts"
                  ? () => navigation.navigate("CreatePost")
                  : undefined
              }
            />
          )
        }
        contentContainerStyle={[
          styles.list,
          { paddingBottom: tabBarHeight + Spacing.xxl },
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
    paddingTop: Spacing.xxl + 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
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
  editButton: {
    minWidth: 150,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  list: {
    paddingHorizontal: Spacing.md,
    flexGrow: 1,
  },
});
