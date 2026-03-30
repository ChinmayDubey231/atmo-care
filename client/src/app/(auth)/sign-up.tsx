import { useAuth, useSignUp } from "@clerk/expo";
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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import useSocialAuth from "../../hooks/useSocialAuth";

const COLORS = {
  primary: "#006944",
  primaryDim: "#005c3b",
  onSurface: "#2b302f",
  outline: "#737876",
  emerald400: "#34d399",
  emerald300: "#6ee7b7",
};

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const { handleSocialAuth, loadingStrategy } = useSocialAuth();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const [emailFocused, setEmailFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [codeFocused, setCodeFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = async () => {
    const { error } = await signUp.password({
      emailAddress,
      password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    });
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          const url = decorateUrl("/");
          router.push(url as Href);
        },
      });
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  // ─── VERIFICATION SCREEN ──────────────────────────────────────────────────
  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address")
  ) {
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
            <Header />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.kav}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.heroSection}>
                  <Text style={styles.heroTitle}>Verify Account</Text>
                  <Text style={styles.heroSubtitle}>
                    We sent a code to your email.
                  </Text>
                </View>

                <View style={styles.glassCard}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Verification Code</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        codeFocused && styles.inputWrapperFocused,
                      ]}
                    >
                      <MaterialIcons
                        name="security"
                        size={20}
                        color={COLORS.primary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        value={code}
                        placeholder="· · · · · ·"
                        placeholderTextColor="rgba(115, 120, 118, 0.5)"
                        onChangeText={setCode}
                        keyboardType="numeric"
                        onFocus={() => setCodeFocused(true)}
                        onBlur={() => setCodeFocused(false)}
                      />
                    </View>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.primaryButtonPressed,
                    ]}
                    onPress={handleVerify}
                  >
                    <Text style={styles.primaryButtonText}>Verify</Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={20}
                      color="white"
                    />
                  </Pressable>

                  <Pressable
                    style={styles.ghostButton}
                    onPress={() => signUp.verifications.sendEmailCode()}
                  >
                    <Text style={styles.ghostButtonText}>
                      I need a new code
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }

  // ─── MAIN SIGN UP SCREEN ──────────────────────────────────────────────────
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
          <Header />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.kav}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>Start Your Journey</Text>
                <Text style={styles.heroSubtitle}>
                  Join a community dedicated to global air clarity and conscious
                  living.
                </Text>
              </View>

              <View style={styles.glassCard}>
                <View style={styles.ssoRow}>
                  <Pressable
                    style={styles.ssoButton}
                    onPress={() => handleSocialAuth("oauth_google")}
                    disabled={!!loadingStrategy}
                  >
                    {loadingStrategy === "oauth_google" ? (
                      <ActivityIndicator
                        size="small"
                        color={COLORS.onSurface}
                      />
                    ) : (
                      <>
                        <AntDesign
                          name="google"
                          size={18}
                          color={COLORS.onSurface}
                        />
                        <Text style={styles.ssoButtonText}>Google</Text>
                      </>
                    )}
                  </Pressable>
                  <Pressable
                    style={styles.ssoButton}
                    onPress={() => handleSocialAuth("oauth_apple")}
                    disabled={!!loadingStrategy}
                  >
                    {loadingStrategy === "oauth_apple" ? (
                      <ActivityIndicator
                        size="small"
                        color={COLORS.onSurface}
                      />
                    ) : (
                      <>
                        <AntDesign
                          name="apple"
                          size={18}
                          color={COLORS.onSurface}
                        />
                        <Text style={styles.ssoButtonText}>Apple</Text>
                      </>
                    )}
                  </Pressable>
                </View>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR WITH EMAIL</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Email */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      emailFocused && styles.inputWrapperFocused,
                    ]}
                  >
                    <MaterialIcons
                      name="alternate-email"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      autoCapitalize="none"
                      value={emailAddress}
                      placeholder="name@example.com"
                      placeholderTextColor="rgba(115, 120, 118, 0.5)"
                      onChangeText={setEmailAddress}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      passwordFocused && styles.inputWrapperFocused,
                    ]}
                  >
                    <MaterialIcons
                      name="lock"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
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
                      style={styles.visibilityIcon}
                    >
                      <MaterialIcons
                        name={showPassword ? "visibility" : "visibility-off"}
                        size={22}
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
                  ]}
                  onPress={handleSubmit}
                  disabled={!emailAddress || !password}
                >
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="white" />
                </Pressable>
              </View>

              <View style={styles.footer}>
                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>
                    Already have an account?{" "}
                  </Text>
                  <Link href="/sign-in" asChild>
                    <Pressable>
                      <Text style={styles.footerLink}>Sign In</Text>
                    </Pressable>
                  </Link>
                </View>
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

const Header = () => {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="white" />
      </Pressable>
      <Text style={styles.headerTitle}>Breathe</Text>
      <View style={{ width: 40 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  backgroundImage: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  safeArea: { flex: 1 },
  kav: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.emerald400,
    letterSpacing: -1,
  },
  heroSection: { alignItems: "center", marginBottom: 18, maxWidth: 320 },
  heroTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 36,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 46,
  },
  heroSubtitle: {
    fontFamily: "BeVietnamPro-Medium",
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
  glassCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 40,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  ssoRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  ssoButton: {
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
  ssoButtonText: {
    fontFamily: "BeVietnamPro-SemiBold",
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: "600",
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
  fieldContainer: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(43, 48, 47, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginLeft: 16,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontFamily: "BeVietnamPro-Medium",
    fontSize: 15,
    color: COLORS.onSurface,
  },
  visibilityIcon: { padding: 8 },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: COLORS.primaryDim,
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  guestButton: { marginTop: 16, alignItems: "center", paddingVertical: 8 },
  guestButtonText: {
    fontFamily: "BeVietnamPro-Bold",
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  ghostButton: { marginTop: 12, alignItems: "center", paddingVertical: 12 },
  ghostButtonText: {
    fontFamily: "BeVietnamPro-Bold",
    fontSize: 14,
    color: COLORS.primary,
  },
  footer: { marginTop: 32, alignItems: "center", gap: 16 },
  footerRow: { flexDirection: "row", alignItems: "center" },
  footerText: {
    fontFamily: "BeVietnamPro-Medium",
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
  },
  footerLink: {
    fontFamily: "BeVietnamPro-Bold",
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.emerald300,
  },
  legalRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  legalText: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.4)",
    letterSpacing: 2,
  },
  legalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});
