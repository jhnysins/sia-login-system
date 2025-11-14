import { useState, useEffect } from "react";
import "./LoginForm.css";
import "./GradientBackground.css";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/552778/pexels-photo-552778.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/1439226/pexels-photo-1439226.jpeg?auto=compress&cs=tinysrgb&w=1200"
    
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsSignUp(!isSignUp);
    }, 250);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 950);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 animated-gradient-bg">
      <video className="video-bg" autoPlay loop muted playsInline>
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="gradient-overlay" />
      <div className="w-full max-w-7xl h-[90vh] bg-[#1e1f22]/95 backdrop-blur-xl rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.65)] border border-[#3a3d42] auth-container">
        {/* Image / hero section */}
        <div className={`hidden sm:block image-panel ${isSignUp ? 'right' : 'left'}`}>
          <div className="absolute inset-4 rounded-3xl overflow-hidden">
            <img
              src={images[currentImage]}
              alt="Mountain landscape"
              className="w-full h-full object-cover transition-opacity duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            <div className="absolute top-6 left-6 flex items-center gap-2 text-white text-xl font-semibold tracking-[0.25em]">
              <span>Login</span>
            </div>

            <div className="absolute bottom-10 left-8 text-white">
              <p className="text-lg font-medium leading-snug">
                Capturing Moments,
                <br />
                Creating Memories
              </p>

              <div className="mt-6 flex items-center gap-2">
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={`h-[3px] rounded-full transition-all duration-300 ${
                      index === currentImage ? 'w-8 bg-white' : 'w-6 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form section */}
        <div className={`px-7 py-8 md:px-10 md:py-12 flex items-center form-panel ${isSignUp ? 'left' : 'right'}`}>
          <div className={`w-full transition-opacity duration-[250ms] ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <h1 className="text-white text-3xl md:text-4xl font-semibold tracking-tight">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h1>

            <form className="mt-8 space-y-4">
              <div className={`transition-all duration-500 ease-in-out ${isSignUp ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                <div className="space-y-4 mb-4">
                  <div className="flex flex-col md:flex-row md:space-x-3 space-y-4 md:space-y-0">
                    <div className="flex-1">
                      <label className="block text-xs text-white/70 mb-1">First name</label>
                      <input
                        type="text"
                        placeholder="First name"
                        className="w-full rounded-xl bg-[#2a2d31] border border-[#3a3d42] px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d9d9d9] focus:border-transparent transition"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-white/70 mb-1">Last name</label>
                      <input
                        type="text"
                        placeholder="Last name"
                        className="w-full rounded-xl bg-[#2a2d31] border border-[#3a3d42] px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d9d9d9] focus:border-transparent transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Username</label>
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full rounded-xl bg-[#2a2d31] border border-[#3a3d42] px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d9d9d9] focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">{isSignUp ? 'Email' : 'Username or Email'}</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-[#2a2d31] border border-[#3a3d42] px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d9d9d9] focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full rounded-xl bg-[#2a2d31] border border-[#3a3d42] px-3.5 py-3 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#d9d9d9] focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-white/40 text-xs uppercase tracking-wide hover:text-white/70 transition"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {isSignUp && (
                  <p className="mt-1 text-[11px] text-white/40">
                    Use 8+ characters with a mix of letters, numbers & symbols.
                  </p>
                )}
              </div>

              {isSignUp ? (
                <div className="flex items-start gap-2 text-xs text-white/70">
                  <input
                    id="terms"
                    type="checkbox"
                    defaultChecked
                    className="mt-0.5 h-4 w-4 rounded border-[#3a3d42] bg-[#2a2d31] text-[#d9d9d9] focus:ring-[#d9d9d9]"
                  />
                  <label htmlFor="terms" className="leading-snug">
                    I agree to the{" "}
                    <button className="underline underline-offset-2 hover:text-white/80">
                      Terms & Conditions
                    </button>
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#3a3d42] bg-[#2a2d31] text-[#d9d9d9] focus:ring-[#d9d9d9]"
                    />
                    <label htmlFor="remember" className="text-white/70">
                      Remember me
                    </label>
                  </div>
                  <button className="text-[#d9d9d9] hover:text-white transition">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#d9d9d9] via-[#b8bcc2] to-[#e7e7e7] hover:from-[#cfcfcf] hover:via-[#b4b8be] hover:to-[#dcdcdc] active:from-[#c5c5c5] active:via-[#aab0b6] active:to-[#d2d2d2] transition font-medium text-sm text-[#222629] py-3 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
              >
                {isSignUp ? 'Create account' : 'Sign in'}
              </button>
            </form>

            {!isSignUp && (
              <>
                <div className="mt-6 flex items-center gap-4 text-xs text-white/40">
                  <div className="flex-1 h-px bg-white/10" />
                  <span>Or continue with</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-[#3a3d42] bg-[#2a2d31]/70 py-2.5 text-sm text-white/85 hover:bg-[#3a3f47] hover:border-[#5a636e] transition">
                    <span className="text-base">G</span>
                    <span>Google</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-[#3a3d42] bg-[#2a2d31]/70 py-2.5 text-sm text-white/85 hover:bg-[#3a3f47] hover:border-[#5a636e] transition">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <rect x="7" y="7" width="3" height="3" />
                      <rect x="14" y="7" width="3" height="3" />
                      <rect x="7" y="14" width="3" height="3" />
                      <rect x="14" y="14" width="3" height="3" />
                    </svg>
                    <span>Login QR</span>
                  </button>
                </div>
              </>
            )}

            <div className="mt-6 text-sm text-white/70 text-center select-none">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <span 
                className="text-[#d9d9d9] font-bold underline-offset-4 hover:underline hover:text-white transition cursor-pointer select-none"
                onClick={handleToggle}
                onMouseDown={(e) => e.preventDefault()}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleToggle()}
              >
                {isSignUp ? 'Log in' : 'Sign up'}
              </span>
            </div>

            {isSignUp && (
              <p className="mt-6 text-[11px] text-white/40">
                By creating an account you agree to receive product updates and
                occasional emails. You can unsubscribe anytime.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
