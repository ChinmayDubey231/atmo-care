import { useAuth, useSignUp } from "@clerk/expo";
import { type Href, useRouter } from "expo-router";
import React from "react";
import type { TextInput } from "react-native";

import {
  AuthFooter,
  AuthScreen,
  LinkRow,
  SocialSignIn,
} from "@/components/AuthKit";
import {
  Field,
  FieldGroup,
  FormError,
  PrimaryButton,
  TextLink,
} from "@/components/ui";

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");

  const passwordRef = React.useRef<TextInput>(null);

  const errorMessage =
    errors.fields.emailAddress?.message ??
    errors.fields.password?.message ??
    errors.fields.code?.message ??
    errors.global?.[0]?.message ??
    null;

  const handleSubmit = async () => {
    const { error } = await signUp.password({
      emailAddress,
      password,
    });
    if (error) return;

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

  const busy = fetchStatus === "fetching";
  const canSubmit = !!emailAddress && !!password;
  const goBack = router.canGoBack() ? () => router.back() : undefined;

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address")
  ) {
    return (
      <AuthScreen
        title="Verify account"
        subtitle="We sent a code to your email."
        onBack={goBack}
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
        </FieldGroup>

        <FormError message={errorMessage} />

        <PrimaryButton
          label="Verify"
          onPress={handleVerify}
          disabled={!code}
          loading={busy}
        />

        <LinkRow>
          <TextLink
            label="I need a new code"
            onPress={() => signUp.verifications.sendEmailCode()}
          />
        </LinkRow>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Start your journey"
      subtitle="Join a community dedicated to global air clarity and conscious living."
      onBack={goBack}
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
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={() => {
            if (canSubmit && !busy) handleSubmit();
          }}
          concealable
        />
      </FieldGroup>

      <FormError message={errorMessage} />

      <PrimaryButton
        label="Create account"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={busy}
      />

      <SocialSignIn />

      <AuthFooter
        prompt="Already have an account?"
        linkLabel="Sign in"
        href="/sign-in"
      />
    </AuthScreen>
  );
}
