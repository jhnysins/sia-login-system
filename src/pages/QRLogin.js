import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import "../styles/QRLogin.css";
import "../styles/GradientBackground.css";

export default function QRLogin({ onBack }) {
  const [qrData, setQrData] = useState("login-token-" + Date.now());
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Regenerate QR code
          setQrData("login-token-" + Date.now());
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setQrData("login-token-" + Date.now());
    setCountdown(60);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 animated-gradient-bg">
      <video className="video-bg" autoPlay loop muted playsInline>
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="gradient-overlay" />

      <div className="qr-container">
        <div className="qr-card qr-card-wide">
          <div className="qr-header">
            <h1 className="qr-title">Sign in with QR Code</h1>
            <p className="qr-subtitle">Scan this code with your mobile device</p>
          </div>

          <div className="qr-two-columns">
            <div className="qr-left-column">
              <div className="qr-instructions">
                <h3 className="instructions-title">How to sign in:</h3>
                <ol className="instructions-list">
                  <li>Open the app on your mobile device</li>
                  <li>Tap the QR code icon</li>
                  <li>Point your camera at this screen</li>
                </ol>
              </div>

              <div className="qr-divider">
                <span>or</span>
              </div>

              <button onClick={onBack} className="qr-back-link">
                Sign in with email instead
              </button>
            </div>

            <div className="qr-right-column">
              <div className="qr-code-box">
                <div className="corner corner-tl"></div>
                <div className="corner corner-tr"></div>
                <div className="corner corner-bl"></div>
                <div className="corner corner-br"></div>
                <QRCodeSVG 
                  value={qrData}
                  size={232}
                  level="H"
                  includeMargin={false}
                  fgColor="#1e1f22"
                  bgColor="#ffffff"
                  className="qr-code-svg"
                />
              </div>
              
              <div className="qr-timer-bar">
                <div className="timer-bar-bg">
                  <div 
                    className="timer-bar-fill" 
                    style={{ width: `${(countdown / 60) * 100}%` }}
                  />
                </div>
                <span className="timer-text">{countdown}s</span>
              </div>

              <button onClick={handleRefresh} className="qr-refresh-btn">
                <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
                Refresh Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
