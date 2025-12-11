import React from "react";
import { View, StyleSheet, Pressable, Switch } from "react-native";
import { ThemedIcon } from "@/components/ThemedIcon";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface SettingsRowProps {
  icon?: React.ComponentProps<typeof ThemedIcon>["name"];
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  danger?: boolean;
}

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
  danger = false,
}: SettingsRowProps) {
  const { theme } = useTheme();

  const content = (
    <View style={styles.container}>
      {icon ? (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: danger
                ? theme.error + "15"
                : theme.primary + "15",
            },
          ]}
        >
          <ThemedIcon
            set="Feather"
            name={icon}
            size={20}
            color={danger ? theme.error : theme.primary}
          />
        </View>
      ) : null}

      <View style={styles.content}>
        <ThemedText
          type="body"
          style={[danger && { color: theme.error }]}
        >
          {label}
        </ThemedText>
      </View>

      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <>
          {value ? (
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {value}
            </ThemedText>
          ) : null}
          {showChevron ? (
            <ThemedIcon
              set="Feather"
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />
          ) : null}
        </>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
});
