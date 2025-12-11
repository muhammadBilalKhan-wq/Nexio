module.exports = () => {
  const host = process.env.REPLIT_DEV_DOMAIN;
  if (!host) {
    // This will happen if not running in the Replit dev environment.
    // Let's try to be helpful in the error message.
    throw new Error('REPLIT_DEV_DOMAIN environment variable is not set. Are you running the app using "npm run expo:dev"?');
  }

  const backendDomain = `${host}:5000`;

  return {
    expo: {
      name: "Nexio",
      slug: "nexio",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/images/icon.png",
      scheme: "nexio",
      userInterfaceStyle: "automatic",
      newArchEnabled: true,
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.nexio.app",
      },
      android: {
        adaptiveIcon: {
          backgroundColor: "#007AFF",
          foregroundImage: "./assets/images/icon.png",
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        package: "com.nexio.app",
      },
      web: {
        output: "single",
        favicon: "./assets/images/favicon.png",
      },
      plugins: [
        [
          "expo-splash-screen",
          {
            image: "./assets/images/splash-icon.png",
            imageWidth: 200,
            resizeMode: "contain",
            backgroundColor: "#007AFF",
            dark: {
              backgroundColor: "#0A84FF",
            },
          },
        ],
        "expo-web-browser",
      ],
      experiments: {
        reactCompiler: true,
      },
      extra: {
        EXPO_PUBLIC_DOMAIN: backendDomain,
      },
    },
  };
};
