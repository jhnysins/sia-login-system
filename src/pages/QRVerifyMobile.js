import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/QRLogin.css";
import "../styles/GradientBackground.css";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
      <div className="qr-card text-center" style={{ maxWidth: "400px" }}>
        {status === "loading" && (
          <>
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-white text-2xl font-semibold mb-2">Verifying...</h1>
            <p className="text-white/70">Please wait</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-white text-2xl font-semibold mb-2">Verified!</h1>
            <p className="text-white/70">You can close this page and return to your computer</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-white text-2xl font-semibold mb-2">Verification Failed</h1>
            <p className="text-white/70">This QR code is invalid or expired</p>
          </>
        )}
      </div>
    </div>
  );
}
