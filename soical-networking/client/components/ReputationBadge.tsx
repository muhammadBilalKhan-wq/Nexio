import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ReputationColors, Spacing, BorderRadius } from "@/constants/theme";

type ReputationLevel = "Beginner" | "Rising" | "Skilled" | "Expert" | "Master";

interface ReputationBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: "small" | "medium";
}

export function getReputationLevel(score: number): ReputationLevel {
  if (score >= 1000) return "Master";
  if (score >= 500) return "Expert";
  if (score >= 200) return "Skilled";
  if (score >= 50) return "Rising";
  return "Beginner";
}

export function ReputationBadge({
  score,
  showLabel = true,
  size = "medium",
}: ReputationBadgeProps) {
  const level = getReputationLevel(score);
  const color = ReputationColors[level];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          size === "small" && styles.badgeSmall,
          { backgroundColor: color + "20" },
        ]}
      >
        <Feather
          name="shield"
          size={size === "small" ? 12 : 16}
          color={color}
        />
        {showLabel ? (
          <ThemedText
            type={size === "small" ? "caption" : "small"}
            style={[styles.label, { color }]}
          >
            {level}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  badgeSmall: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  label: {
    fontWeight: "600",
  },
});
