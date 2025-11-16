import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import "../styles/LoginForm.css";
import "../styles/GradientBackground.css";

// Import Firebase services
import { auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  GoogleAuthProvider, // <-- NEW IMPORT
  signInWithPopup, // <-- NEW IMPORT
  sendPasswordResetEmail, // <-- ADDED FOR FORGOT PASSWORD
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // <-- ADDED getDoc

export default function LoginForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // --- NEW: Password Reset Modal State ---
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalMessage, setModalMessage] = useState(null);

  const images = [
    "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/552778/pexels-photo-552778.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/1439226/pexels-photo-1439226.jpeg?auto=compress&cs=tinysrgb&w=1200",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = () => {
    setIsTransitioning(true);
    // Clear form fields and messages on toggle
    setFirstName("");
    setLastName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setError(null);
    setMessage(null);
    setTimeout(() => {
      setIsSignUp(!isSignUp);
    }, 250);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 950);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    // Execute reCAPTCHA
    if (!executeRecaptcha) {
      setError('reCAPTCHA not loaded');
      setIsLoading(false);
      return;
    }

    try {
      const token = await executeRecaptcha(isSignUp ? 'signup' : 'login');
      console.log('reCAPTCHA token:', token);
    } catch (err) {
      setError('reCAPTCHA verification failed');
      setIsLoading(false);
      return;
    }

    // --- SIGN UP LOGIC ---
    if (isSignUp) {
      if (!firstName || !lastName || !username || !email || !password) {
        setError("Please fill in all fields.");
        setIsLoading(false);
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        setIsLoading(false);
        return;
      }

      try {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // 2. Send verification email
        await sendEmailVerification(user);

        // 3. Create user document in Firestore (like your screenshot)
        // We use the user's UID (user.uid) as the document ID
        await setDoc(doc(db, "users", user.uid), {
          fname: firstName,
          lname: lastName,
          middlename: "", // Added this field from your screenshot
          username: username,
          email: user.email,
        });

        // 4. Set success message and clear form
        setMessage(
          "Account created! Please check your email for a verification link."
        );
        setFirstName("");
        setLastName("");
        setUsername("");
        setEmail("");
        setPassword("");
      } catch (error) {
        // Handle Firebase errors
        if (error.code === "auth/email-already-in-use") {
          setError("This email is already in use. Please log in.");
        } else if (error.code === "auth/weak-password") {
          setError("Password is too weak. Please use at least 8 characters.");
        } else {
          setError("Failed to create account. Please try again.");
          console.error("Sign up error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // --- SIGN IN LOGIC ---
      if (!email || !password) {
        setError("Please enter your email and password.");
        setIsLoading(false);
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);

        // --- THIS IS THE FIX ---
        // After sign-in, auth.currentUser is populated.
        // We MUST force-reload it to get the latest emailVerified status.
        if (auth.currentUser) {
          await auth.currentUser.reload();
        }
        // Now that auth.currentUser is reloaded, the onAuthStateChanged
        // listener in app.js will fire with the *freshest* user data.

        const freshUser = auth.currentUser; // Get the reloaded user

        if (freshUser && !freshUser.emailVerified) {
          setError(
            "Your email is not verified. Please check your inbox for a verification link."
          );
        } else {
          // Success! Clear form. app.js will do the rest.
          setEmail("");
          setPassword("");
          // The App.js component will now automatically
          // show the dashboard.
        }
      } catch (error) {
        // Handle Firebase sign-in errors
        if (
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password" ||
          error.code === "auth/invalid-credential"
        ) {
          setError("Invalid email or password.");
        } else {
          setError("Failed to sign in. Please try again.");
          console.error("Sign in error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- NEW FUNCTION FOR GOOGLE SIGN-IN ---
  const handleGoogleSignIn = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if a document for this user already exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      // If the user document doesn't exist, create it (first time login)
      if (!userDoc.exists()) {
        const nameParts = user.displayName
          ? user.displayName.split(" ")
          : ["User"];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        await setDoc(userDocRef, {
          fname: firstName,
          lname: lastName,
          middlename: "",
          username: user.email.split("@")[0], // Use email prefix as default username
          email: user.email,
        });
      }

      // Sign-in is successful. The onAuthStateChanged listener in app.js
      // will see the user (who is already emailVerified) and show the dashboard.
      // We don't need to do anything else here.
    } catch (error) {
      // Handle Errors here.
      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please try again.");
      } else {
        setError("Failed to sign in with Google.");
        console.error("Google sign-in error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: Handle opening/closing the modal ---
  const openPasswordResetModal = () => {
    // Clear main form errors/messages when opening modal
    setError(null);
    setMessage(null);
    // Reset modal state
    setResetEmail("");
    setModalError(null);
    setModalMessage(null);
    setModalIsLoading(false);
    setShowPasswordResetModal(true);
  };

  const closePasswordResetModal = () => {
    setShowPasswordResetModal(false);
  };

  // --- NEW: Handle the password reset logic ---
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setModalIsLoading(true);
    setModalError(null);
    setModalMessage(null);

    if (!resetEmail) {
      setModalError("Please enter your email address.");
      setModalIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setModalMessage("Password reset link sent! Check your inbox.");
      setResetEmail(""); 
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setModalError("No account found with this email address.");
      } else if (error.code === "auth/invalid-email") {
        setModalError("Please enter a valid email address.");
      } else {
        setModalError("Failed to send reset link. Please try again.");
        console.error("Password reset error:", error);
      }
    } finally {
      setModalIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 py-10 animated-gradient-bg">
        <video className="video-bg" autoPlay loop muted playsInline>
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="gradient-overlay" />
        <div className="w-full max-w-7xl h-[90vh] bg-[#1e1f22]/95 backdrop-blur-xl rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.65)] border border-[#3a3d42] auth-container">
          {/* Image / hero section */}
          <div
            className={`hidden sm:block image-panel ${isSignUp ? "right" : "left"}`}
          >
            <div className="absolute inset-4 rounded-3xl overflow-hidden">
              <img
                src={images[currentImage]}
                alt="Mountain landscape"
                className="w-full h-full object-cover transition-opacity duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              <div className="absolute top-6 left-6 flex items-center gap-2 text-white text-xl font-semibold tracking-[0.25em]">
                <span>Login</span>
              </div>
              <div className="absolute bottom-10 left-8 text-white">
                <p className="text-lg font-medium leading-snug">
                  Capturing Moments,
                  <br />
                  Creating Memories
                </p>
                <div className="mt-6 flex items-center gap-2">
                  {images.map((_, index) => (
                    <span
                      key={index}
                      className={`h-[3px] rounded-full transition-all duration-300 ${
                        index === currentImage
                          ? "w-8 bg-white"
                          : "w-6 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form section */}
          <div
            className={`px-7 py-8 md:px-10 md:py-12 flex items-center form-panel ${
              isSignUp ? "left" : "right"
            }`}
          >
            <div
              className={`w-full transition-opacity duration-[250ms] ease-in-out ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              <h1 className="text-white text-3xl md:text-4xl font-semibold tracking-tight">
                {isSignUp ? "Create an account" : "Welcome back"}
              </h1>

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    isSignUp
                      ? "opacity-100 max-h-96"
                      : "opacity-0 max-h-0 overflow-hidden"
                  }`}
                >
                  <div className="space-y-4 mb-4">
                    <div className="flex flex-col md:flex-row md:space-x-3 space-y-4 md:space-y-0">
                      <div className="flex-1">
                        <label className="block text-xs text-white/70 mb-1">
                          First name
                        </label>
                        <input
                          type="text"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full rounded-xl bg-[#2a2d31] border border-[#3a3d42] px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d9d9d9] focus:border-transparent transition"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-white/70 mb-1">
                          Last name
                        </label>
                        <input
                          type="text"
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full rounded-xl bg-[#2a2d31] border border-[#3a3d42] px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d9d9d9] focus:border-transparent transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-xl bg-[#2a2d31] border border-[#3a3d42] px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d9d9d9] focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    {isSignUp ? "Email" : "Username or Email"}
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-[#2a2d31] border border-[#3a3d42] px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d9d9d9] focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl bg-[#2a2d31] border border-[#3a3d42] px-3.5 py-3 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d9d9d9] focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-white/40 text-xs uppercase tracking-wide hover:text-white/70 transition"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {isSignUp && (
                    <p className="mt-1 text-[11px] text-white/40">
                      Use 8+ characters with a mix of letters, numbers & symbols.
                    </p>
                  )}
                </div>

                {isSignUp ? (
                  <div className="flex items-start gap-2 text-xs text-white/70">
                    <input
                      id="terms"
                      type="checkbox"
                      defaultChecked
                      className="mt-0.5 h-4 w-4 rounded border-[#3a3d42] bg-[#2a2d31] text-[#d9d9d9] focus:ring-[#d9d9d9]"
                    />
                    <label htmlFor="terms" className="leading-snug">
                      I agree to the{" "}
                      <button
                        type="button"
                        className="underline underline-offset-2 hover:text-white/80"
                      >
                        Terms & Conditions
                      </button>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        id="remember"
                        type="checkbox"
                        className="h-4 w-4 rounded border-[#3a3d42] bg-[#2a2d31] text-[#d9d9d9] focus:ring-[#d9d9d9]"
                      />
                      <label htmlFor="remember" className="text-white/70">
                        Remember me
                      </label>
                    </div>
                    {/* --- UPDATED BUTTON --- */}
                    <button
                      type="button"
                      onClick={openPasswordResetModal} // <-- ATTACHED MODAL OPENER
                      className="text-[#d9d9d9] hover:text-white transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* --- Message & Error Display --- */}
                <div className="pt-2 space-y-3">
                  {message && (
                    <div className="text-sm text-green-400 p-3 bg-green-900/30 rounded-xl border border-green-700">
                      {message}
                    </div>
                  )}
                  {error && (
                    <div className="text-sm text-red-400 p-3 bg-red-900/30 rounded-xl border border-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-gradient-to-r from-[#d9d9d9] via-[#b8bcc2] to-[#e7e7e7] hover:from-[#cfcfcf] hover:via-[#b4b8be] hover:to-[#dcdcdc] active:from-[#c5c5c5] active:via-[#aab0b6] active:to-[#d2d2d2] transition font-medium text-sm text-[#222629] py-3 shadow-[0_18px_40px_rgba(0,0,0,0.55)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading
                      ? isSignUp
                        ? "Creating..."
                        : "Signing in..."
                      : isSignUp
                        ? "Create account"
                        : "Sign in"}
                  </button>
                </div>
              </form>

              {!isSignUp && (
                <>
                  <div className="mt-6 flex items-center gap-4 text-xs text-white/40">
                    <div className="flex-1 h-px bg-white/10" />
                    <span>Or continue with</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#3a3d42] bg-[#2a2d31]/70 py-2.5 text-sm text-white/85 hover:bg-[#3a3f47] hover:border-[#5a636e] transition disabled:opacity-50"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.45c1.61 0 3.06.55 4.2 1.69l3.16-3.16C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.46 6.16-4.46z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span>Google</span>
                    </button>
                  </div>
                </>
              )}

              <div className="mt-6 text-sm text-white/70 text-center select-none">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <span
                  className="text-[#d9d9d9] font-bold underline-offset-4 hover:underline hover:text-white transition cursor-pointer select-none"
                  onClick={handleToggle}
                  onMouseDown={(e) => e.preventDefault()}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === "Enter" && handleToggle()}
                >
                  {isSignUp ? "Log in" : "Sign up"}
                </span>
              </div>

              {isSignUp && (
                <p className="mt-6 text-[11px] text-white/40">
                  By creating an account you agree to receive product updates and
                  occasional emails. You can unsubscribe anytime.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW: Password Reset Modal --- */}
      {showPasswordResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closePasswordResetModal} // Close if clicking outside
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#2a2d31] border border-[#3a3d42] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <h2 className="text-2xl font-semibold text-white">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Enter the email address associated with your account, and we'll
              send you a link to reset your password.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handlePasswordReset}>
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-xs text-white/70 mb-1"
                >
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full rounded-xl bg-[#1e1f22] border border-[#3a3d42] px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d9d9d9] focus:border-transparent transition"
                />
              </div>

              {/* --- Modal Message & Error Display --- */}
              <div className="space-y-3">
                {modalMessage && (
                  <div className="text-sm text-green-400 p-3 bg-green-900/30 rounded-xl border border-green-700">
                    {modalMessage}
                  </div>
                )}
                {modalError && (
                  <div className="text-sm text-red-400 p-3 bg-red-900/30 rounded-xl border border-red-700">
                    {modalError}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:gap-3 sm:mt-6">
                <button
                  type="button"
                  onClick={closePasswordResetModal}
                  className="mt-3 sm:mt-0 w-full rounded-xl bg-transparent border border-[#3a3d42] py-2.5 text-sm font-medium text-white/70 hover:bg-[#3a3d42] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalIsLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#d9d9d9] to-[#e7e7e7] hover:to-[#dcdcdc] transition font-medium text-sm text-[#222629] py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modalIsLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}