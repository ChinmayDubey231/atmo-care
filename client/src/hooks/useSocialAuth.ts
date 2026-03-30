import { useClerk, useOAuth } from "@clerk/expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const useSocialAuth = () => {
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
  const { setActive } = useClerk();

  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });
  const { startOAuthFlow: githubAuth } = useOAuth({ strategy: "oauth_github" });

  const handleSocialAuth = async (
    strategy: "oauth_google" | "oauth_apple" | "oauth_github",
  ) => {
    if (loadingStrategy) return;

    setLoadingStrategy(strategy);

    try {
      const selectedFlow =
        strategy === "oauth_google"
          ? googleAuth
          : strategy === "oauth_apple"
            ? appleAuth
            : githubAuth;

      const result = await selectedFlow({
        redirectUrl: Linking.createURL("/"),
      });

      // fallback to signUp.createdSessionId if top-level is null
      const createdSessionId =
        result.createdSessionId ?? result.signUp?.createdSessionId;

      if (!createdSessionId) {
        Alert.alert(
          "Sign-In Incomplete",
          `There was an error authenticating with ${strategy.replace("oauth_", "")}. Please try again.`,
        );
        return;
      }

      await setActive!({ session: createdSessionId });
    } catch (error: any) {
      console.error("FULL OAUTH ERROR:", JSON.stringify(error, null, 2)); // Add this line
      console.error("OAUTH ERROR MESSAGE:", error.message); // Add this line

      if (error.message?.includes("canceled")) return;

      Alert.alert(
        "Sign-In Incomplete",
        `There was an error authenticating with ${strategy.replace("oauth_", "")}. Please try again.`,
      );
    } finally {
      setLoadingStrategy(null);
    }
  };

  return { handleSocialAuth, loadingStrategy };
};

export default useSocialAuth;
