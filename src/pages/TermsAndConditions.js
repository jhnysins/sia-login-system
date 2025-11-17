import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GradientBackground.css';

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen animated-gradient-bg p-8">
      <div className="max-w-4xl mx-auto bg-[#1e1f22]/95 backdrop-blur-xl rounded-2xl shadow-[0_40px_120px_rgba(0,0,0,0.65)] p-8 border border-[#3a3d42] text-white">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-lg bg-[#2a2d31] hover:bg-[#3a3d42] text-white/85 transition"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-bold mb-6">Terms and Conditions</h1>
        <p className="text-white/70 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-white/85">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Use License</h2>
            <p>Permission is granted to temporarily access the materials on this application for personal, non-commercial transitory viewing only.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. User Account</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. Privacy Policy</h2>
            <p>Your use of our service is also governed by our Privacy Policy. We collect and use your personal information in accordance with applicable data protection laws.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Prohibited Uses</h2>
            <p>You may not use our service for any illegal or unauthorized purpose. You must not violate any laws in your jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Limitation of Liability</h2>
            <p>In no event shall we be liable for any damages arising out of the use or inability to use our service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Contact Information</h2>
            <p>If you have any questions about these Terms, please contact us at support@example.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
