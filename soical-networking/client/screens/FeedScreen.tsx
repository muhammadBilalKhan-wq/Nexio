import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ThemedView } from "@/components/ThemedView";
import { ThemedIcon } from "@/components/ThemedIcon";
import { ThemedText } from "@/components/ThemedText";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest } from "@/lib/query-client";
import { Spacing } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Post, User } from "@shared/schema";

interface PostWithAuthor extends Post {
  author: User;
  isUpvoted: boolean;
  isSaved: boolean;
}

export default function FeedScreen() {
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: posts,
    isLoading,
    refetch,
  } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/posts");
      return res.json();
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const upvoteMutation = useMutation({
    mutationFn: async ({
      postId,
      isUpvoted,
    }: {
      postId: string;
      isUpvoted: boolean;
    }) => {
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
    mutationFn: async ({
      postId,
      isSaved,
    }: {
      postId: string;
      isSaved: boolean;
    }) => {
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

  const renderItem = ({ item }: { item: PostWithAuthor }) => (
    <PostCard
      post={item}
      author={item.author}
      isUpvoted={item.isUpvoted}
      isSaved={item.isSaved}
      onUpvote={() =>
        upvoteMutation.mutate({ postId: item.id, isUpvoted: item.isUpvoted })
      }
      onSave={() => saveMutation.mutate({ postId: item.id, isSaved: item.isSaved })}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.md,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <ThemedText style={styles.title}>
            Nexio
          </ThemedText>
        </View>
        <Pressable
          onPress={() => navigation.navigate("Search")}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <ThemedIcon set="Feather" name="search" size={24} color={theme.text} />
        </Pressable>
      </View>
      <FlatList
        data={posts || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          isLoading ? (
            <LoadingSpinner fullScreen />
          ) : (
            <EmptyState
              icon="book-open"
              title="No Posts Yet"
              description="Be the first to share your knowledge with the community!"
              actionLabel="Create Post"
              onAction={() => navigation.navigate("CreatePost")}
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
    paddingBottom: Spacing.md,
    backgroundColor: "white",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontFamily: "Orbitron-Bold",
    fontSize: 32,
    fontWeight: "bold",
  },
  list: {
    paddingHorizontal: Spacing.md,
    flexGrow: 1,
  },
});
