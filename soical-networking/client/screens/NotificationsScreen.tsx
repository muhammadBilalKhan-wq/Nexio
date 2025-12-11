import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { NotificationItem } from "@/components/NotificationItem";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/query-client";
import { Spacing } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Notification, User } from "@shared/schema";

interface NotificationWithUser extends Notification {
  fromUser: User | null;
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabBarHeight = useBottomTabBarHeight();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: notifications, isLoading, refetch } = useQuery<NotificationWithUser[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest("POST", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleNotificationPress = (notification: NotificationWithUser) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }

    if (notification.postId) {
      navigation.navigate("PostDetail", { postId: notification.postId });
    } else if (notification.fromUserId) {
      navigation.navigate("UserProfile", { userId: notification.fromUserId });
    }
  };

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText type="h2">Notifications</ThemedText>
      {unreadCount > 0 ? (
        <Pressable
          onPress={() => markAllReadMutation.mutate()}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <ThemedText type="body" style={{ color: theme.primary }}>
            Mark all read
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );

  const renderItem = ({ item }: { item: NotificationWithUser }) => (
    <NotificationItem
      notification={item}
      fromUser={item.fromUser}
      onPress={() => handleNotificationPress(item)}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={notifications || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? (
            <LoadingSpinner />
          ) : (
            <EmptyState
              icon="bell"
              title="No Notifications"
              description="You're all caught up! Check back later for updates."
            />
          )
        }
        contentContainerStyle={[
          styles.list,
          { paddingBottom: tabBarHeight + Spacing.xxl },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
        )}
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
  list: {
    flexGrow: 1,
  },
  separator: {
    height: 1,
    marginLeft: Spacing.md + 48 + Spacing.md,
  },
});
