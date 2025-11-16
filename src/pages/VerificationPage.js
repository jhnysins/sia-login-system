import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { auth } from "../config/firebase";
import { sendEmailVerification, RecaptchaVerifier, PhoneAuthProvider, linkWithCredential } from "firebase/auth";
import "../styles/QRLogin.css";
import "../styles/GradientBackground.css";

export default function VerificationPage({ user, onVerified }) {
  const [method, setMethod] = useState("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [qrData, setQrData] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [qrToken, setQrToken] = useState(null);

  useEffect(() => {
    if (method === "qr") {
      const generateQR = async () => {
        const token = btoa(`${user.uid}:${Date.now()}`);
        setQrToken(token);
        const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://sia-login-system-git-main-demesis221s-projects.vercel.app';
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
            setMessage("QR verified successfully!");
            setTimeout(() => onVerified(), 1500);
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
            const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://sia-login-system-git-main-demesis221s-projects.vercel.app';
            setQrData(`${BASE_URL}/verify?token=${token}`);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [method, user.uid]);

  useEffect(() => {
    if (method === "otp" && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      });
    }
  }, [method]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setError("Please enter your phone number");
      return;
    }
    try {
      setError(null);
      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(phoneNumber, window.recaptchaVerifier);
      setVerificationId(id);
      setIsOtpSent(true);
      setMessage("OTP sent to your phone!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    try {
      setError(null);
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await linkWithCredential(user, credential);
      setMessage("Phone verified successfully!");
      setTimeout(() => onVerified(), 1500);
    } catch (err) {
      setError("Invalid OTP. Please try again.");
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
              onClick={() => setMethod("email")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                method === "email"
                  ? "bg-white text-black"
                  : "bg-[#2a2d31] text-white/70 hover:bg-[#3a3d42]"
              }`}
            >
              Email Link
            </button>
            <button
              onClick={() => setMethod("otp")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                method === "otp"
                  ? "bg-white text-black"
                  : "bg-[#2a2d31] text-white/70 hover:bg-[#3a3d42]"
              }`}
            >
              OTP Code
            </button>
            <button
              onClick={() => setMethod("qr")}
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
            </div>
          )}

          {method === "otp" && (
            <div className="space-y-4">
              {!isOtpSent ? (
                <>
                  <p className="text-white/70 text-sm text-center">
                    Enter your phone number to receive OTP
                  </p>
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl bg-[#2a2d31] border border-[#3a3d42] text-white focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <div id="recaptcha-container"></div>
                  <button
                    onClick={handleSendOtp}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d9d9d9] to-[#e7e7e7] text-black font-medium hover:opacity-90 transition"
                  >
                    Send OTP
                  </button>
                </>
              ) : (
                <>
                  <p className="text-white/70 text-sm text-center">
                    Enter the 6-digit code sent to {phoneNumber}
                  </p>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        className="w-12 h-14 text-center text-2xl rounded-xl bg-[#2a2d31] border border-[#3a3d42] text-white focus:outline-none focus:ring-2 focus:ring-white"
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d9d9d9] to-[#e7e7e7] text-black font-medium hover:opacity-90 transition"
                  >
                    Verify OTP
                  </button>
                  <button
                    onClick={() => setIsOtpSent(false)}
                    className="w-full py-2 text-white/70 hover:text-white text-sm transition"
                  >
                    Change Phone Number
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
