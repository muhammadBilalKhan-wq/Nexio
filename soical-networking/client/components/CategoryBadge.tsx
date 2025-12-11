import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface CategoryBadgeProps {
  category: string;
  selected?: boolean;
  onPress?: () => void;
  size?: "small" | "medium";
}

export function CategoryBadge({
  category,
  selected = false,
  onPress,
  size = "medium",
}: CategoryBadgeProps) {
  const { theme } = useTheme();

  const content = (
    <View
      style={[
        styles.badge,
        size === "small" && styles.badgeSmall,
        {
          backgroundColor: selected
            ? theme.primary
            : theme.primary + "15",
        },
      ]}
    >
      <ThemedText
        type={size === "small" ? "caption" : "small"}
        style={[
          styles.text,
          { color: selected ? "#FFFFFF" : theme.primary },
        ]}
      >
        {category}
      </ThemedText>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontWeight: "500",
  },
});
