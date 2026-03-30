import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";

import useSocialAuth from "../../hooks/useSocialAuth";

// Redesign Constants
const COLORS = {
  primary: "#006944",
  primaryDim: "#005c3b",
  onSurface: "#2b302f",
  outline: "#737876",
  emerald400: "#34d399",
  emerald300: "#6ee7b7",
};

export default function Page() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [emailFocused, setEmailFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = async () => {
    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          const url = decorateUrl("/");
          router.push(url as Href);
        },
      });
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) await signIn.mfa.sendEmailCode();
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) =>
          router.push(decorateUrl("/") as Href),
      });
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwSNU_8BKkL5Jk59_WqhBChjIFQz2UrHFNLLfm4ylOV1MLZ2NFeW6UJjFsR146w-RqSmw8K1y75Ki8XSvylwHg9VIPslp8usGFe1bmDgRMKzDWXa1ls9lk1ZPcnsfilJKmTvNUOF5Un4vSxTN8m1KSL9bIiVbcxejVG2vvFcdNlnJAW59VnoA8844TR6v-AH7IA8vZHTg9EQNMLDM2k_799SUS6g-FSKMw2ZdTtEFmXEVWDB-92dS_R3iw_pODHlXgabcdt_BEjmmf",
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerBrand}>Breathe</Text>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.kav}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Hero Text */}
              <View style={styles.heroContainer}>
                <Text style={styles.heroTitle}>Welcome Back</Text>
                <Text style={styles.heroSubtitle}>
                  Breathe deep and monitor your world.
                </Text>
              </View>

              {/* High-Contrast Glass Card */}
              <View style={styles.glassPanel}>
                {/* SSO Section */}
                <View style={styles.ssoRow}>
                  <Pressable
                    style={styles.glassButton}
                    onPress={() => handleSocialAuth("oauth_google")}
                    disabled={!!loadingStrategy}
                  >
                    <AntDesign
                      name="google"
                      size={18}
                      color={COLORS.onSurface}
                    />
                    <Text style={styles.ssoText}>Google</Text>
                  </Pressable>
                  <Pressable
                    style={styles.glassButton}
                    onPress={() => handleSocialAuth("oauth_apple")}
                    disabled={!!loadingStrategy}
                  >
                    <AntDesign
                      name="apple"
                      size={18}
                      color={COLORS.onSurface}
                    />
                    <Text style={styles.ssoText}>Apple</Text>
                  </Pressable>
                </View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        emailFocused && styles.inputFocused,
                      ]}
                    >
                      <MaterialIcons
                        name="alternate-email"
                        size={20}
                        color={COLORS.primary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={emailAddress}
                        placeholder="name@example.com"
                        placeholderTextColor="rgba(115, 120, 118, 0.5)"
                        onChangeText={setEmailAddress}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* Password */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>Password</Text>
                      <Pressable>
                        <Text style={styles.forgotText}>Forgot?</Text>
                      </Pressable>
                    </View>
                    <View
                      style={[
                        styles.inputWrapper,
                        passwordFocused && styles.inputFocused,
                      ]}
                    >
                      <MaterialIcons
                        name="lock"
                        size={20}
                        color={COLORS.primary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={password}
                        placeholder="••••••••"
                        placeholderTextColor="rgba(115, 120, 118, 0.5)"
                        secureTextEntry={!showPassword}
                        onChangeText={setPassword}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                      >
                        <MaterialIcons
                          name={showPassword ? "visibility" : "visibility-off"}
                          size={20}
                          color={COLORS.outline}
                        />
                      </Pressable>
                    </View>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryButton,
                      (!emailAddress || !password) &&
                        styles.primaryButtonDisabled,
                      pressed && styles.primaryButtonPressed,
                      fetchStatus === "fetching" &&
                        styles.primaryButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!emailAddress || !password}
                  >
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={20}
                      color="white"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerBaseText}>
                  Don't have an account?
                  <Link href="/sign-up">
                    <Text style={styles.footerLinkText}> Create Account</Text>
                  </Link>
                </Text>

                <View style={styles.legalRow}>
                  <Text style={styles.legalText}>PRIVACY POLICY</Text>
                  <View style={styles.legalDot} />
                  <Text style={styles.legalText}>TERMS OF SERVICE</Text>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  backgroundImage: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  safeArea: { flex: 1 },
  header: { paddingTop: 20, alignItems: "center", zIndex: 20 },
  headerBrand: {
    fontFamily: "PlusJakartaSans-ExtraBold",
    fontSize: 24,
    color: COLORS.emerald400,
    fontWeight: "900",
    letterSpacing: -1,
  },
  kav: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: "center",
  },

  heroContainer: { alignItems: "center", marginBottom: 40 },
  heroTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 40,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: "BeVietnamPro-Medium",
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 8,
  },

  glassPanel: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 40,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  ssoRow: { flexDirection: "row", gap: 12 },
  glassButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    borderRadius: 999,
  },
  ssoText: {
    fontFamily: "BeVietnamPro-SemiBold",
    fontSize: 14,
    color: COLORS.onSurface,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(43, 48, 47, 0.1)" },
  dividerText: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(43, 48, 47, 0.5)",
    marginHorizontal: 16,
    letterSpacing: 1.5,
  },

  formContainer: { gap: 20 },
  inputGroup: { gap: 6 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(43, 48, 47, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginLeft: 16,
  },
  forgotText: { fontSize: 11, fontWeight: "700", color: COLORS.primary },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 56,
  },
  inputFocused: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  inputIcon: { marginRight: 12 },
  textInput: {
    flex: 1,
    fontFamily: "BeVietnamPro-Medium",
    fontSize: 15,
    color: COLORS.onSurface,
  },
  eyeButton: { padding: 4 },

  primaryButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
  primaryButtonPressed: {
    backgroundColor: COLORS.primaryDim,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans-Bold",
  },

  footer: { marginTop: 40, alignItems: "center", gap: 20 },
  footerBaseText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
    fontSize: 13,
  },
  footerLinkText: { color: COLORS.emerald300, fontWeight: "700" },
  legalRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  legalText: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 2,
  },
  legalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
