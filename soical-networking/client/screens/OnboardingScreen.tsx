import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const { width } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    icon: "book-open",
    title: "Share Knowledge",
    description:
      "Share your expertise with the world. Write articles, guides, and insights that help others learn and grow.",
  },
  {
    id: "2",
    icon: "award",
    title: "Build Reputation",
    description:
      "Earn reputation points as your content gets upvoted. Rise through the ranks from Beginner to Master.",
  },
  {
    id: "3",
    icon: "users",
    title: "Join the Community",
    description:
      "Connect with like-minded learners and experts. Follow topics and people you care about.",
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  const renderItem = ({ item }: { item: typeof onboardingData[0] }) => (
    <View style={[styles.slide, { width }]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.primary + "15" },
        ]}
      >
        <Feather name={item.icon as any} size={80} color={theme.primary} />
      </View>
      <ThemedText type="h2" style={styles.title}>
        {item.title}
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.description, { color: theme.textSecondary }]}
      >
        {item.description}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Pressable
        style={[styles.skipButton, { top: insets.top + Spacing.md }]}
        onPress={onComplete}
      >
        <ThemedText type="body" style={{ color: theme.primary }}>
          Skip
        </ThemedText>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex ? theme.primary : theme.border,
                },
              ]}
            />
          ))}
        </View>

        <Button onPress={handleNext} style={styles.button}>
          {currentIndex === onboardingData.length - 1
            ? "Get Started"
            : "Next"}
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    marginTop: Spacing.md,
  },
});
