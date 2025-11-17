import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { auth } from "../config/firebase";
import { sendEmailVerification } from "firebase/auth";
import "../styles/QRLogin.css";
import "../styles/GradientBackground.css";

export default function VerificationPage({ user, onVerified }) {
  const [method, setMethod] = useState(null);
  const [qrData, setQrData] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [qrToken, setQrToken] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (method === "qr") {
      const generateQR = async () => {
        const token = btoa(`${user.uid}:${Date.now()}`);
        setQrToken(token);
        const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://sia-login-system.vercel.app';
        setQrData(`${BASE_URL}/verify?token=${token}`);
        
        try {
          const API_URL = process.env.REACT_APP_API_URL || 'https://striking-essence-production-ca78.up.railway.app';
          await fetch(`${API_URL}/api/qr/store`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, userId: user.uid })
          });
        } catch (err) {
          console.error('Failed to store QR token:', err);
        }
      };
      generateQR();
    }
  }, [method, user.uid]);

  useEffect(() => {
    if (method === "qr" && qrToken) {
      const pollInterval = setInterval(async () => {
        try {
          const API_URL = process.env.REACT_APP_API_URL || 'https://striking-essence-production-ca78.up.railway.app';
          const res = await fetch(`${API_URL}/api/qr/check/${qrToken}`);
          const data = await res.json();
          if (data.verified) {
            clearInterval(pollInterval);
            setMessage("QR verified successfully!");
            // Reload user to get updated emailVerified status from Firebase
            try {
              await auth.currentUser.reload();
              const updatedUser = auth.currentUser;
              if (updatedUser.emailVerified) {
                setTimeout(() => onVerified(), 1500);
              } else {
                setError("Verification failed. Please try again.");
              }
            } catch (reloadErr) {
              console.error('Failed to reload user:', reloadErr);
              setTimeout(() => onVerified(), 1500);
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);
      return () => clearInterval(pollInterval);
    }
  }, [method, qrToken, onVerified]);

  useEffect(() => {
    if (method === "qr") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            const token = btoa(`${user.uid}:${Date.now()}`);
            setQrToken(token);
            const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://sia-login-system.vercel.app';
            setQrData(`${BASE_URL}/verify?token=${token}`);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [method, user.uid]);



  const handleSendEmail = async () => {
    try {
      await sendEmailVerification(user);
      setEmailSent(true);
      setMessage("Verification email sent!");
      setError(null);
    } catch (err) {
      setError("Failed to send email. Try again.");
    }
  };

  const handleResendEmail = async () => {
    try {
      await sendEmailVerification(user);
      setMessage("Verification email sent!");
      setError(null);
    } catch (err) {
      setError("Failed to send email. Try again.");
    }
  };

  const handleCheckVerification = async () => {
    try {
      await user.reload();
      if (user.emailVerified) {
        onVerified();
      } else {
        setError("Email not verified yet. Please check your inbox.");
      }
    } catch (err) {
      setError("Failed to check verification status.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 animated-gradient-bg">
      <video className="video-bg" autoPlay loop muted playsInline>
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="gradient-overlay" />

      <div className="qr-container">
        <div className="qr-card" style={{ maxWidth: "500px" }}>
          <div className="qr-header">
            <h1 className="qr-title">Verify Your Account</h1>
            <p className="qr-subtitle">Choose your verification method</p>
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={() => {
                setMethod("email");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                method === "email"
                  ? "bg-white text-black"
                  : "bg-[#2a2d31] text-white/70 hover:bg-[#3a3d42]"
              }`}
            >
              Email Link
            </button>
            <button
              onClick={() => {
                setMethod("qr");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                method === "qr"
                  ? "bg-white text-black"
                  : "bg-[#2a2d31] text-white/70 hover:bg-[#3a3d42]"
              }`}
            >
              QR Code
            </button>
          </div>

          {method === "email" && (
            <div className="space-y-4">
              {!emailSent ? (
                <>
                  <p className="text-white/70 text-sm">
                    Click below to send a verification link to <strong>{user.email}</strong>
                  </p>
                  <button
                    onClick={handleSendEmail}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d9d9d9] to-[#e7e7e7] text-black font-medium hover:opacity-90 transition"
                  >
                    Send Verification Email
                  </button>
                </>
              ) : (
                <>
                  <p className="text-white/70 text-sm">
                    We sent a verification link to <strong>{user.email}</strong>
                  </p>
                  <button
                    onClick={handleCheckVerification}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d9d9d9] to-[#e7e7e7] text-black font-medium hover:opacity-90 transition"
                  >
                    I've Verified My Email
                  </button>
                  <button
                    onClick={handleResendEmail}
                    className="w-full py-3 rounded-xl bg-[#2a2d31] text-white/85 hover:bg-[#3a3d42] transition"
                  >
                    Resend Email
                  </button>
                </>
              )}
            </div>
          )}

          {method === "qr" && (
            <div className="space-y-6">
              <p className="text-white/70 text-sm text-center">
                Scan this code with your mobile device
              </p>
              <div className="qr-code-box mx-auto" style={{ width: "fit-content" }}>
                <div className="corner corner-tl"></div>
                <div className="corner corner-tr"></div>
                <div className="corner corner-bl"></div>
                <div className="corner corner-br"></div>
                <QRCodeSVG
                  value={qrData}
                  size={200}
                  level="H"
                  fgColor="#1e1f22"
                  bgColor="#ffffff"
                  className="qr-code-svg"
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-full max-w-xs">
                  <div className="timer-bar-bg">
                    <div
                      className="timer-bar-fill"
                      style={{ width: `${(countdown / 60) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="timer-text">{countdown}s</span>
              </div>
              <div className="text-center mt-4">
                <p className="text-white/50 text-xs mb-1">QR URL:</p>
                <p className="text-white/70 text-xs break-all">{qrData}</p>
              </div>
            </div>
          )}

          {method === null && (
            <div className="text-center py-8">
              <p className="text-white/70 text-sm">
                Please select a verification method above to continue
              </p>
            </div>
          )}

          {message && (
            <div className="mt-4 text-sm text-green-400 p-3 bg-green-900/30 rounded-xl border border-green-700">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 text-sm text-red-400 p-3 bg-red-900/30 rounded-xl border border-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
