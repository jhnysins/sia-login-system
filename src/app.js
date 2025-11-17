import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoginForm from './pages/LoginForm';
import Dashboard from './pages/Dashboard';
import VerificationPage from './pages/VerificationPage';
import QRVerifyMobile from './pages/QRVerifyMobile';
import TermsAndConditions from './pages/TermsAndConditions';
import './styles/GradientBackground.css';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    // This listener is the core of the auth system.
    // It fires when the user logs in or logs out.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Will be null if logged out, or a user object if logged in
        setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
    }, []);

  // Show a loading screen while Firebase checks the auth status
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center animated-gradient-bg text-white text-2xl font-semibold">
                Loading...
            </div>
    );
    }


    return (
        <GoogleReCaptchaProvider reCaptchaKey="6LdQrQ4sAAAAAMfvAtgN5W32P3ocUgQziHHWJ_rs">
            <Routes>
                <Route path="/verify" element={<QRVerifyMobile />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="*" element={
                    <div>
                        {!user ? (
                            <LoginForm />
                        ) : !user.emailVerified ? (
                            <VerificationPage user={user} onVerified={async () => {
                                await auth.currentUser.reload();
                                setUser({...auth.currentUser});
                            }} />
                        ) : (
                            <Dashboard user={user} />
                        )}
                    </div>
                } />
            </Routes>
        </GoogleReCaptchaProvider>
    );
}