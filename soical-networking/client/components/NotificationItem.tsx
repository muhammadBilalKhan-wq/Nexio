import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { UserAvatar } from "@/components/UserAvatar";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { Notification, User } from "@shared/schema";

interface NotificationItemProps {
  notification: Notification;
  fromUser?: User | null;
  onPress?: () => void;
}

const getNotificationIcon = (type: string): keyof typeof Feather.glyphMap => {
  switch (type) {
    case "follow":
      return "user-plus";
    case "upvote":
      return "arrow-up";
    case "comment":
      return "message-circle";
    case "mention":
      return "at-sign";
    case "level_up":
      return "award";
    default:
      return "bell";
  }
};

export function NotificationItem({
  notification,
  fromUser,
  onPress,
}: NotificationItemProps) {
  const { theme } = useTheme();

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString();
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: notification.isRead
            ? theme.backgroundRoot
            : theme.backgroundDefault,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {!notification.isRead ? (
        <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
      ) : null}

      <View style={styles.iconContainer}>
        {fromUser ? (
          <UserAvatar uri={fromUser.profilePicUrl} size="medium" />
        ) : (
          <View
            style={[
              styles.iconBg,
              { backgroundColor: theme.primary + "15" },
            ]}
          >
            <Feather
              name={getNotificationIcon(notification.type)}
              size={20}
              color={theme.primary}
            />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <ThemedText type="body" style={styles.title}>
          {notification.title}
        </ThemedText>
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary }}
          numberOfLines={2}
        >
          {notification.message}
        </ThemedText>
      </View>

      <ThemedText type="caption" style={{ color: theme.textSecondary }}>
        {formatTime(notification.createdAt)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  unreadDot: {
    position: "absolute",
    left: Spacing.xs,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: "500",
    marginBottom: 2,
  },
});
