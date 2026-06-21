import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

googleProvider.setCustomParameters({
  prompt: "select_account"
});

const mapFirebaseUser = (firebaseUser) => ({
  uid: firebaseUser.uid,
  fullName:
    firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "PrepMaster User",
  email: firebaseUser.email || "",
  avatar: firebaseUser.photoURL || "",
  photoURL: firebaseUser.photoURL || "",
  loginTime: new Date().toISOString()
});

const syncUserToFirestore = async (user) => {
  if (!user?.uid) return;

  const userRef = doc(db, "users", user.uid);
  await setDoc(
    userRef,
    {
      uid: user.uid,
      name: user.fullName,
      fullName: user.fullName,
      email: user.email,
      photoURL: user.photoURL,
      avatar: user.avatar,
      loginTime: user.loginTime,
      lastLogin: serverTimestamp()
    },
    { merge: true }
  );
};

const getFriendlyAuthError = (authError) => {
  const code = authError?.code || "";

  if (code === "auth/unauthorized-domain") {
    const host = window.location.hostname;
    return `Google sign-in is blocked because "${host}" is not authorized in Firebase Authentication. Add ${host} to Firebase Console > Authentication > Settings > Authorized domains, without http:// or a port.`;
  }

  if (code === "auth/popup-closed-by-user") {
    return "Google sign-in was cancelled before it finished.";
  }

  if (code === "auth/popup-blocked") {
    return "The Google sign-in popup was blocked. Allow popups for this site and try again.";
  }

  return authError?.message || "Google sign-in failed. Please try again.";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let hasInitialized = false;
    let timeoutId = null;

    const clearInitTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const handleAuthStateChanged = async (firebaseUser) => {
      if (!isMounted) return;

      hasInitialized = true;
      clearInitTimeout();

      if (firebaseUser) {
        const mappedUser = mapFirebaseUser(firebaseUser);
        setUser(mappedUser);

        // Sync user profile to firestore asynchronously in the background.
        // This ensures the application is not blocked from initializing if Firestore is slow/offline.
        syncUserToFirestore(mappedUser).catch(() => {
          if (isMounted) {
            setError("Signed in, but your Firebase profile could not be synchronized.");
          }
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    const handleAuthError = () => {
      if (!isMounted) return;
      clearInitTimeout();
      setError("Authentication initialization failed. Please verify your Firebase configuration.");
      setUser(null);
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged, handleAuthError);

    timeoutId = window.setTimeout(() => {
      if (!hasInitialized && isMounted) {
        setError("Firebase authentication initialization timed out.");
        setLoading(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInitTimeout();
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    setAuthActionLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const authUser = mapFirebaseUser(result.user);
      setUser(authUser);
      toast.success(`Signed in as ${authUser.fullName}`);
      return authUser;
    } catch (signInError) {
      const message = getFriendlyAuthError(signInError);
      setError(message);
      toast.error(message);
      throw signInError;
    } finally {
      setAuthActionLoading(false);
    }
  };

  const signOut = async () => {
    setAuthActionLoading(true);
    setError("");

    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast.success("Logged out successfully.");
    } catch {
      const message = "Unable to sign out. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setAuthActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3 px-6 py-8 rounded-3xl bg-slate-900/90 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
          <p className="text-sm font-semibold">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, authActionLoading, error, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    return {
      user: null,
      loading: false,
      authActionLoading: false,
      error: "",
      signInWithGoogle: async () => {
        throw new Error("useAuth must be used within an AuthProvider.");
      },
      signOut: async () => {}
    };
  }

  return context;
};
