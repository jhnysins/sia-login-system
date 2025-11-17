import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/QRLogin.css";
import "../styles/GradientBackground.css";

const API_URL = process.env.REACT_APP_API_URL || 'https://striking-essence-production-ca78.up.railway.app';

export default function QRVerifyMobile() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`${API_URL}/api/qr/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animated-gradient-bg">
      <div className="qr-card text-center" style={{ maxWidth: "400px", width: "100%", minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        {status === "loading" && (
          <>
            <div className="mb-4" style={{ animation: "spin 1s linear infinite" }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/70">
                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="32" strokeDashoffset="8" />
              </svg>
            </div>
            <h1 className="text-white text-2xl font-semibold mb-3">Verifying...</h1>
            <p className="text-white/70 text-base">Please wait while we confirm your login</p>
          </>
        )}
        {status === "success" && (
          <div style={{ animation: "popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)" }}>
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-500/20 p-4">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-white text-2xl font-semibold mb-3">Verified!</h1>
            <p className="text-white/70 text-base">You can close this page and return to your computer</p>
          </div>
        )}
        {status === "error" && (
          <div style={{ animation: "popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)" }}>
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-500/20 p-4">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
            </div>
            <h1 className="text-white text-2xl font-semibold mb-3">Verification Failed</h1>
            <p className="text-white/70 text-base">This QR code is invalid or expired</p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes popIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
