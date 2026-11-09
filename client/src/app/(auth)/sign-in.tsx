import { useSignIn } from "@clerk/expo";
import { type Href, useRouter } from "expo-router";
import React from "react";
import type { TextInput } from "react-native";

import {
  AuthFooter,
  AuthScreen,
  Field,
  FieldGroup,
  FormError,
  LinkRow,
  PrimaryButton,
  SocialSignIn,
  TextLink,
} from "../../components/AuthKit";

export default function Page() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  // "verify" = email code for a new device, "reset" = forgot-password flow
  const [mode, setMode] = React.useState<"signIn" | "verify" | "reset">(
    "signIn",
  );
  const [notice, setNotice] = React.useState<string | null>(null);

  const passwordRef = React.useRef<TextInput>(null);

  const errorMessage =
    notice ??
    errors.fields.identifier?.message ??
    errors.fields.password?.message ??
    errors.fields.code?.message ??
    errors.global?.[0]?.message ??
    null;

  const finalize = () =>
    signIn.finalize({
      navigate: ({ decorateUrl }) => router.push(decorateUrl("/") as Href),
    });

  const handleSubmit = async () => {
    setNotice(null);
    const { error } = await signIn.password({ emailAddress, password });
    if (error) return;

    if (signIn.status === "complete") {
      await finalize();
    } else if (
      signIn.status === "needs_client_trust" ||
      signIn.status === "needs_second_factor"
    ) {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        const sent = await signIn.mfa.sendEmailCode();
        if (!sent.error) setMode("verify");
      } else {
        setNotice(
          "This account needs a sign-in method the app doesn't support yet.",
        );
      }
    }
  };

  const handleVerify = async () => {
    setNotice(null);
    const { error } = await signIn.mfa.verifyEmailCode({ code });
    if (error) return;
    if (signIn.status === "complete") await finalize();
  };

  const handleForgot = async () => {
    if (!emailAddress) {
      setNotice("Enter your email address first, then tap Forgot password.");
      return;
    }
    setNotice(null);
    const created = await signIn.create({ identifier: emailAddress });
    if (created.error) return;
    const sent = await signIn.resetPasswordEmailCode.sendCode();
    if (sent.error) return;
    setCode("");
    setMode("reset");
  };

  const handleReset = async () => {
    setNotice(null);
    // On a retry (e.g. the new password was too weak) the code is already verified
    if (signIn.status !== "needs_new_password") {
      const verified = await signIn.resetPasswordEmailCode.verifyCode({ code });
      if (verified.error) return;
    }
    const submitted = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
    });
    if (submitted.error) return;
    if (signIn.status === "complete") await finalize();
  };

  const backToSignIn = async () => {
    await signIn.reset();
    setMode("signIn");
    setCode("");
    setNewPassword("");
    setNotice(null);
  };

  const resendCode = () =>
    mode === "verify"
      ? signIn.mfa.sendEmailCode()
      : signIn.resetPasswordEmailCode.sendCode();

  const busy = fetchStatus === "fetching";
  const canSignIn = !!emailAddress && !!password;
  const canConfirm = !!code && (mode !== "reset" || !!newPassword);

  if (mode !== "signIn") {
    return (
      <AuthScreen
        title={mode === "verify" ? "Check your email" : "Reset password"}
        subtitle={`We sent a code to ${emailAddress}`}
      >
        <FieldGroup>
          <Field
            label="Verification code"
            value={code}
            onChangeText={setCode}
            placeholder="······"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            autoFocus
            spaced
          />
          {mode === "reset" ? (
            <Field
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              concealable
            />
          ) : null}
        </FieldGroup>

        <FormError message={errorMessage} />

        <PrimaryButton
          label={mode === "verify" ? "Verify" : "Set new password"}
          onPress={mode === "verify" ? handleVerify : handleReset}
          disabled={!canConfirm}
          loading={busy}
        />

        <LinkRow>
          <TextLink label="Send a new code" onPress={resendCode} />
          <TextLink label="Back to sign in" onPress={backToSignIn} />
        </LinkRow>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Breathe deep and monitor your world."
    >
      <FieldGroup>
        <Field
          label="Email"
          value={emailAddress}
          onChangeText={setEmailAddress}
          placeholder="name@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <Field
          label="Password"
          inputRef={passwordRef}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={() => {
            if (canSignIn && !busy) handleSubmit();
          }}
          concealable
          action={{ label: "Forgot password?", onPress: handleForgot }}
        />
      </FieldGroup>

      <FormError message={errorMessage} />

      <PrimaryButton
        label="Sign in"
        onPress={handleSubmit}
        disabled={!canSignIn}
        loading={busy}
      />

      <SocialSignIn />

      <AuthFooter
        prompt="New to Breathe?"
        linkLabel="Create account"
        href="/sign-up"
      />
    </AuthScreen>
  );
}
