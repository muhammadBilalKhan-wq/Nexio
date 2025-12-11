import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    textSecondary: "#8E8E93",
    buttonText: "#FFFFFF",
    tabIconDefault: "#8E8E93",
    tabIconSelected: "#007AFF",
    link: "#007AFF",
    primary: "#007AFF",
    secondary: "#5856D6",
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F8F9FA",
    backgroundSecondary: "#F2F2F7",
    backgroundTertiary: "#E5E5EA",
    border: "#E5E5EA",
    cardShadow: "rgba(0, 0, 0, 0.10)",
    overlay: "rgba(0, 0, 0, 0.5)",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#98989D",
    buttonText: "#FFFFFF",
    tabIconDefault: "#98989D",
    tabIconSelected: "#0A84FF",
    link: "#0A84FF",
    primary: "#0A84FF",
    secondary: "#5E5CE6",
    success: "#30D158",
    warning: "#FF9F0A",
    error: "#FF453A",
    backgroundRoot: "#000000",
    backgroundDefault: "#1C1C1E",
    backgroundSecondary: "#2C2C2E",
    backgroundTertiary: "#38383A",
    border: "#38383A",
    cardShadow: "rgba(0, 0, 0, 0.30)",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

export const ReputationColors = {
  Beginner: "#8E8E93",
  Rising: "#007AFF",
  Skilled: "#5856D6",
  Expert: "#FF9500",
  Master: "#FF3B30",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  inputHeight: 50,
  buttonHeight: 50,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: "700" as const,
  },
  title1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  title2: {
    fontSize: 22,
    fontWeight: "700" as const,
  },
  title3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h1: {
    fontSize: 34,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 22,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 17,
    fontWeight: "400" as const,
  },
  callout: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  subhead: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
  footnote: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 17,
    fontWeight: "400" as const,
  },
};

export const Shadows = Platform.select({
  ios: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    fab: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    floatingInput: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
  },
  android: {
    card: { elevation: 3 },
    fab: { elevation: 4 },
    floatingInput: { elevation: 2 },
  },
  default: {
    card: {},
    fab: {},
    floatingInput: {},
  },
})!

export const AvatarSizes = {
  small: 32,
  medium: 48,
  large: 80,
  profile: 120,
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Categories = [
  "Science",
  "Technology",
  "Health",
  "Business",
  "Arts",
  "History",
  "Philosophy",
  "Mathematics",
  "Language",
  "Psychology",
];
