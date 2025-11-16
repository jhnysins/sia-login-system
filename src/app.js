import React, { useState, useEffect } from 'react';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LoginForm from './pages/LoginForm';
import Dashboard from './pages/Dashboard';
import VerificationPage from './pages/VerificationPage';
import './styles/GradientBackground.css'; // Using your existing background

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
        <div>
            {!user ? (
                <LoginForm />
            ) : !user.emailVerified ? (
                <VerificationPage user={user} onVerified={() => user.reload().then(() => setUser(auth.currentUser))} />
            ) : (
                <Dashboard user={user} />
            )}
        </div>
    );
}