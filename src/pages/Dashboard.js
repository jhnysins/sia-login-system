import React, { useState } from 'react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import '../styles/GradientBackground.css'; 

export default function Dashboard({ user }) {
  const [showModal, setShowModal] = useState(true);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const username = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen animated-gradient-bg">
      {/* Dashboard Content */}
      <div className="min-h-screen p-8">
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-white/70 mt-2">Welcome to your dashboard, {username}</p>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#1e1f22]/95 backdrop-blur-xl rounded-2xl shadow-[0_40px_120px_rgba(0,0,0,0.65)] p-8 border border-[#3a3d42] text-white relative">
            
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[#2a2d31] hover:bg-[#3a3d42] text-white/70 hover:text-white transition"
              title="Close"
            >
              ✕
            </button>
            
            <h1 className="text-3xl font-semibold mb-2">Welcome back, {username}!</h1>
            <p className="text-lg text-white/70 mb-8 break-words">
              You are signed in as:
              <br />
              <span className="font-medium text-white">{user.email}</span>
            </p>
            
            <button
              onClick={handleLogout}
              className="w-full rounded-xl bg-gradient-to-r from-[#d9d9d9] via-[#b8bcc2] to-[#e7e7e7] hover:from-[#cfcfcf] hover:via-[#b4b8be] hover:to-[#dcdcdc] active:from-[#c5c5c5] active:via-[#aab0b6] active:to-[#d2d2d2] transition font-medium text-sm text-[#222629] py-3 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}