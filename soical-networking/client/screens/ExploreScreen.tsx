import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { PostCard } from "@/components/PostCard";
import { CategoryBadge } from "@/components/CategoryBadge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest } from "@/lib/query-client";
import { Spacing, Categories } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Post, User } from "@shared/schema";

interface PostWithAuthor extends Post {
  author: User;
  isUpvoted: boolean;
  isSaved: boolean;
}

const allCategories = ["Trending", ...Categories];

export default function ExploreScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabBarHeight = useBottomTabBarHeight();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("Trending");
  const [refreshing, setRefreshing] = useState(false);

  const queryKey =
    selectedCategory === "Trending"
      ? ["/api/posts/trending"]
      : ["/api/posts", { category: selectedCategory }];

  const { data: posts, isLoading, refetch } = useQuery<PostWithAuthor[]>({
    queryKey,
  });

  const upvoteMutation = useMutation({
    mutationFn: async ({ postId, isUpvoted }: { postId: string; isUpvoted: boolean }) => {
      if (isUpvoted) {
        await apiRequest("DELETE", `/api/posts/${postId}/upvote`);
      } else {
        await apiRequest("POST", `/api/posts/${postId}/upvote`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ postId, isSaved }: { postId: string; isSaved: boolean }) => {
      if (isSaved) {
        await apiRequest("DELETE", `/api/posts/${postId}/save`);
      } else {
        await apiRequest("POST", `/api/posts/${postId}/save`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText type="h2">Explore</ThemedText>
      <Pressable
        onPress={() => navigation.navigate("Search")}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Feather name="search" size={24} color={theme.text} />
      </Pressable>
    </View>
  );

  const renderCategories = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categories}
    >
      {allCategories.map((category) => (
        <CategoryBadge
          key={category}
          category={category}
          selected={selectedCategory === category}
          onPress={() => setSelectedCategory(category)}
        />
      ))}
    </ScrollView>
  );

  const renderItem = ({ item }: { item: PostWithAuthor }) => (
    <PostCard
      post={item}
      author={item.author}
      isUpvoted={item.isUpvoted}
      isSaved={item.isSaved}
      onUpvote={() =>
        upvoteMutation.mutate({ postId: item.id, isUpvoted: item.isUpvoted })
      }
      onSave={() =>
        saveMutation.mutate({ postId: item.id, isSaved: item.isSaved })
      }
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={posts || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderCategories()}
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingSpinner />
          ) : (
            <EmptyState
              icon="compass"
              title="No Posts Found"
              description={`No posts in ${selectedCategory} category yet. Check back later!`}
            />
          )
        }
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: tabBarHeight + Spacing.xxl,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xxl + 20,
    paddingBottom: Spacing.md,
  },
  categories: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.md,
    flexGrow: 1,
  },
});
