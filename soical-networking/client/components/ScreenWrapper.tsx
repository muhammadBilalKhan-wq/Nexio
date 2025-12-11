
import React from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from "react-native";
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";

type ScreenWrapperProps = {
  children: React.ReactNode;
  withScrollView?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  safeAreaEdges?: SafeAreaViewProps["edges"];
  keyboardVerticalOffset?: number;
};

export function ScreenWrapper({
  children,
  withScrollView = true,
  style,
  contentContainerStyle,
  safeAreaEdges = ["top", "bottom"],
  keyboardVerticalOffset = 0,
}: ScreenWrapperProps) {
  const { theme } = useTheme();

  const Container = withScrollView ? ScrollView : React.Fragment;
  const containerProps = withScrollView
    ? {
        contentContainerStyle: [
          styles.contentContainer,
          contentContainerStyle,
        ],
        keyboardShouldPersistTaps: "handled",
      }
    : {};

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: theme.background }]}
      edges={safeAreaEdges}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.flex, style]}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <Container {...containerProps}>{children}</Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
