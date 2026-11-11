import { useUser } from "@clerk/expo";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SkyScreen } from "@/components/Sky";
import {
  Field,
  FieldGroup,
  FormError,
  PrimaryButton,
} from "@/components/ui";
import { BRAND_SKY, COLORS, FONTS, withAlpha } from "@/constants/theme";
import { getUserName } from "@/utils/userUtils";

const EditUser = () => {
  const { user } = useUser();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await user?.update({ firstName, lastName });
      router.back();
    } catch (e) {
      console.error("Failed to update user:", e);
      setError("Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async () => {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      // Construct the base64 data string
      const base64 = `data:${asset.mimeType};base64,${asset.base64}`;

      setUploading(true);
      // Pass the base64 string directly to Clerk
      await user?.setProfileImage({
        file: base64,
      });
    } catch (e) {
      console.error("Failed to upload image:", e);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SkyScreen
      heroHeight={300}
      skyScale={0.7}
      liftForKeyboard
      sheetStyle={styles.sheet}
      hero={
        <>
          <View style={styles.top}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={() => router.back()}
              style={styles.back}
            >
              <MaterialIcons
                name="arrow-back"
                size={20}
                color={BRAND_SKY.mist}
              />
            </Pressable>
            <Text accessibilityRole="header" style={styles.title}>
              Edit profile
            </Text>
          </View>

          <View style={styles.identity}>
            <View style={styles.avatarWrap}>
              {user?.hasImage ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.initial}>
                    {getUserName(user).charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
                accessibilityState={{ busy: uploading }}
                disabled={uploading}
                hitSlop={8}
                onPress={uploadImage}
                style={styles.camera}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={COLORS.onPrimary} />
                ) : (
                  <MaterialIcons
                    name="photo-camera"
                    size={16}
                    color={COLORS.onPrimary}
                  />
                )}
              </Pressable>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {getUserName(user)}
            </Text>
          </View>
        </>
      }
    >
      <FieldGroup>
        <Field
          label="First name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          autoComplete="given-name"
          textContentType="givenName"
        />
        <Field
          label="Last name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          autoComplete="family-name"
          textContentType="familyName"
        />
        <Field
          label="Email"
          value={user?.emailAddresses?.[0]?.emailAddress ?? ""}
          editable={false}
        />
      </FieldGroup>

      <FormError message={error} />

      <PrimaryButton
        label="Save changes"
        loading={saving}
        onPress={handleSave}
      />
    </SkyScreen>
  );
};

const styles = StyleSheet.create({
  sheet: { gap: 20 },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: withAlpha(BRAND_SKY.mist, 0.28),
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
    color: COLORS.onPrimary,
  },
  identity: { alignItems: "center", gap: 10, marginTop: 16 },
  avatarWrap: { width: 96, height: 96 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: withAlpha(BRAND_SKY.mist, 0.5),
    backgroundColor: COLORS.primarySoft,
  },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  initial: {
    fontFamily: FONTS.heading,
    fontSize: 36,
    lineHeight: 44,
    color: COLORS.primary,
  },
  camera: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  name: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
    color: COLORS.onPrimary,
  },
});

export default EditUser;
