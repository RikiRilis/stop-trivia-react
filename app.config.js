export default {
  expo: {
    name: "Stop Trivia Online",
    slug: "stop-trivia",
    version: "2.2.1",
    orientation: "portrait",
    icon: "./assets/ic_brand.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    scheme: "stoptrivia",
    splash: {
      resizeMode: "contain",
      backgroundColor: "#000B0A",
    },
    platforms: ["android", "ios", "web"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.rilisentertainment.stoptriviaonline",
      googleServicesFile: "./GoogleService-Info.plist",
    },
    android: {
        adaptiveIcon: {
          foregroundImage: "./assets/ic_brand.png",
          backgroundColor: "#000B0A",
        },
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
        package: "com.rilisentertainment.stoptriviaonline",
        googleServicesFile: "./google-services.json",
        versionCode: 8,
        version: "2.2.1",
        minSdkVersion: 24,
        ndkVersion: "29.0.14206865"
    },
    web: {
        favicon: "./assets/ic_brand.png",
    },
    plugins: [
        "@react-native-firebase/app",
        "expo-router",
        "expo-font",
        [
          "expo-image-picker",
          {
            photosPermission:
              "The game accesses your photos to let you pick an image for your profile picture.",
          },
        ],
        [
          "expo-splash-screen",
          {
            backgroundColor: "#000B0A",
          },
        ],
        [
          "expo-build-properties",
          {
            ios: {
              useFrameworks: "static",
            },
            android: {
              targetSdkVersion: 36,
              compileSdk: 36,
              compileSdkVersion: 36,
              ndkVersion: "29.0.14206865"
            },
          },
        ],
    ],
    extra: {
        router: {},
        eas: {
          projectId: "efcde181-f82b-437a-910b-94b2e117ac25",
        },
    },
  },
}
