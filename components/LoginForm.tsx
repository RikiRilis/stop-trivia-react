// components/LoginForm.tsx
import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  AccessibilityInfo,
  Keyboard,
  ToastAndroid,
} from "react-native"
import { Theme } from "@/libs/consts"
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "@/components/ui/Icons"
import ic from "@/assets/lotties/ic_brand.json"
import LottieView from "lottie-react-native"
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { auth } from "@/libs/firebaseConfig"

export const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [btnScale] = useState(new Animated.Value(1))
  const [signInForm, setSignInForm] = useState(true)

  const validate = () => {
    setError(null)
    if (!email.trim()) return setError("Email is required")
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(email.trim())) return setError("Enter a valid email")
    if (password.length < 6)
      return setError("Password must be at least 6 characters")
    if (!signInForm) {
      if (password !== repeatPassword)
        return setError("Passwords must be equals")
    }
    return null
  }

  const handlePressIn = () =>
    Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start()
  const handlePressOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start()
  const handleChangeForm = async () => setSignInForm((prev) => !prev)

  const handleForgot = () => {
    if (!email && email === "") {
      setError("Please enter the email")
      return
    }

    if (email || email !== "") {
      sendPasswordResetEmail(auth, email).then(() => {
        ToastAndroid.showWithGravity(
          "Email sent!",
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        )
      })
      setError(null)
    }
  }

  const handleSignin = async () => {
    setLoading(true)
    setError(null)

    const err = validate()
    if (err) {
      setLoading(false)
      setError(err)
      AccessibilityInfo.announceForAccessibility(err)
      return
    }

    try {
      if (signInForm) {
        await signInWithEmailAndPassword(auth, email, password)
        console.log("Signed in!")
      } else {
        await createUserWithEmailAndPassword(auth, email, password).then(
          (res) => {
            updateProfile(res.user, {
              displayName: displayName.trim(),
            })
            sendEmailVerification(res.user)
            ToastAndroid.showWithGravity(
              "Verify email sent to your inbox!",
              ToastAndroid.SHORT,
              ToastAndroid.CENTER
            )
          }
        )
        console.log("Signed up!")
      }
    } catch (e: any) {
      let message = "Something went wrong. Please try again."

      switch (e.code) {
        case "auth/email-already-in-use":
          message = "This email is already in use. Please, sign in."
          break
        case "auth/invalid-email":
          message = "Please enter a valid email."
          break
        case "auth/user-not-found":
          message = "No user found with this email."
          break
        case "auth/wrong-password":
          message = "Incorrect password."
          break
        case "auth/weak-password":
          message = "Password must be at least 6 characters."
          break
        case "auth/too-many-requests":
          message = "Too many attempts. Try again later."
          break
      }

      setError(message)
      AccessibilityInfo.announceForAccessibility(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.wrapper}>
      <Pressable style={{ flex: 1 }} onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            <LottieView
              source={ic}
              autoPlay
              loop={false}
              duration={3000}
              style={{
                width: 42,
                height: 42,
              }}
            />

            <Text style={styles.title}>top Trivia</Text>
          </View>

          {!signInForm && (
            <View style={styles.field}>
              <View style={styles.iconLeft}>
                <UserIcon color={Theme.colors.gray} />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={Theme.colors.darkGray}
                keyboardType="default"
                autoCapitalize="none"
                autoComplete="name-given"
                value={displayName}
                onChangeText={setDisplayName}
                returnKeyType="next"
                accessibilityLabel="Username"
                importantForAutofill="yes"
                cursorColor={Theme.colors.accent}
              />
            </View>
          )}

          <View style={styles.field}>
            <View style={styles.iconLeft}>
              <MailIcon color={Theme.colors.gray} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Theme.colors.darkGray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
              accessibilityLabel="Email"
              importantForAutofill="yes"
              cursorColor={Theme.colors.accent}
            />
          </View>

          <View style={styles.field}>
            <View style={styles.iconLeft}>
              <LockIcon color={Theme.colors.gray} />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Theme.colors.darkGray}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSignin}
              accessibilityLabel="Password"
              cursorColor={Theme.colors.accent}
            />

            <Pressable
              onPress={() => setShowPassword((s) => !s)}
              style={styles.iconRight}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
            >
              {showPassword ? (
                <EyeOffIcon color={Theme.colors.gray} />
              ) : (
                <EyeIcon color={Theme.colors.gray} />
              )}
            </Pressable>
          </View>

          {!signInForm && (
            <View style={styles.field}>
              <View style={styles.iconLeft}>
                <LockIcon color={Theme.colors.gray} />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Repet password"
                placeholderTextColor={Theme.colors.darkGray}
                secureTextEntry={!showPassword}
                value={repeatPassword}
                onChangeText={setRepeatPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSignin}
                accessibilityLabel="Password"
                cursorColor={Theme.colors.accent}
              />

              <Pressable
                onPress={() => setShowPassword((s) => !s)}
                style={styles.iconRight}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOffIcon color={Theme.colors.gray} />
                ) : (
                  <EyeIcon color={Theme.colors.gray} />
                )}
              </Pressable>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.error}>{error}</Text>

            {signInForm && (
              <Pressable onPress={handleForgot}>
                <Text style={styles.forgotText}>Forgot?</Text>
              </Pressable>
            )}
          </View>

          <Animated.View
            style={{ transform: [{ scale: btnScale }], width: "100%" }}
          >
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleSignin}
              style={({ pressed }) => [
                styles.submit,
                pressed && { opacity: 0.9 },
                loading && { opacity: 0.8 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.text} />
              ) : (
                <Text style={styles.submitText}>
                  {signInForm ? "Sign in" : "Sign up"}
                </Text>
              )}
            </Pressable>
          </Animated.View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {signInForm
                ? "Don't have an account?"
                : "Already have an account?"}
            </Text>

            <Pressable onPress={handleChangeForm}>
              <Text style={styles.signupText}>
                {signInForm ? "Sign up" : "Sign in"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 350,
    backgroundColor: Theme.colors.background,
  },
  container: {
    padding: 12,
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontFamily: "OnestBold",
    fontSize: 42,
    color: Theme.colors.text,
    marginStart: -5,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.background2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
    padding: 6,
  },
  input: {
    flex: 1,
    color: Theme.colors.text,
    fontSize: 16,
    fontFamily: "Onest",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rememberBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  forgotText: {
    color: Theme.colors.primary,
    fontFamily: "Onest",
  },
  error: {
    color: Theme.colors.red,
    marginBottom: 8,
    fontFamily: "Onest",
  },
  submit: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 12,
  },
  submitText: {
    color: Theme.colors.text,
    fontSize: 16,
    fontFamily: "OnestBold",
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.background ?? Theme.colors.darkGray,
  },
  orText: {
    marginHorizontal: 8,
    color: Theme.colors.darkGray,
    fontFamily: "Onest",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 20,
  },
  socialBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Theme.colors.background2,
    alignItems: "center",
    marginHorizontal: 4,
  },
  socialText: {
    color: Theme.colors.text,
    fontFamily: "Onest",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 4,
  },
  footerText: {
    color: Theme.colors.gray,
    fontFamily: "Onest",
  },
  signupText: {
    color: Theme.colors.primary,
    fontFamily: "OnestBold",
  },
})
