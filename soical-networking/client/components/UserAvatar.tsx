import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { AvatarSizes, BorderRadius } from "@/constants/theme";

interface UserAvatarProps {
  uri?: string | null;
  size?: "small" | "medium" | "large" | "profile";
  style?: any;
}

export function UserAvatar({ uri, size = "medium", style }: UserAvatarProps) {
  const { theme } = useTheme();
  const dimension = AvatarSizes[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.avatar,
          { width: dimension, height: dimension, borderRadius: dimension / 2 },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: theme.backgroundSecondary,
        },
        style,
      ]}
    >
      <Feather
        name="user"
        size={dimension * 0.5}
        color={theme.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    resizeMode: "cover",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
});
