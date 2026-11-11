
import { useState } from "react";
import { X, Plane, Eye, EyeOff, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { supabase } from "@/lib/supabase";

type AuthMode = "login" | "register";

type AuthModalProps = {
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthModal({
  mode,
  onClose,
  onModeChange,
}: AuthModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isRegister = mode === "register";

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const switchMode = (newMode: AuthMode) => {
    resetMessages();
    setPassword("");
    setConfirmPassword("");
    onModeChange(newMode);
  };

  // Normalize Kenyan phone numbers.
  // 0712345678 -> +254712345678
  // +254712345678 -> +254712345678
  const normalizeKenyanPhone = (value: string) => {
    const cleaned = value.trim().replace(/[\s-]/g, "");

    if (/^07\d{8}$/.test(cleaned)) {
      return `+254${cleaned.substring(1)}`;
    }

    if (/^\+2547\d{8}$/.test(cleaned)) {
      return cleaned;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();

    const normalizedEmail = email.trim().toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    let normalizedPhone = "";

    if (isRegister) {
      normalizedPhone = normalizeKenyanPhone(phone) || "";

      if (!username.trim()) {
        setError("Please enter a username.");
        return;
      }

      if (!normalizedPhone) {
        setError(
          "Enter a valid Kenyan phone number, e.g. 0712345678 or +254712345678."
        );
        return;
      }

      if (password !== confirmPassword) {
        setError("Your passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegister) {
        const { data, error: signUpError } =
          await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              data: {
                username: username.trim(),
                email: normalizedEmail,
                phone_number: normalizedPhone,
              },
            },
          });

        if (signUpError) throw signUpError;

        if (data.session) {
          setSuccess("Account created successfully!");
          setTimeout(onClose, 700);
        } else {
          setSuccess(
            "Account registration started. Check your email for a verification link if email confirmation is enabled."
          );
        }
      } else {
        const { error: loginError } =
          await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

        if (loginError) throw loginError;

        setSuccess("Signed in successfully!");
        setTimeout(onClose, 500);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="relative my-auto w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          {/* Top accent */}
          <div className="h-1.5 w-full bg-[image:var(--gradient-red)]" />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="absolute right-4 top-5 grid size-9 place-items-center rounded-lg border border-border bg-background/70 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          <div className="px-6 pb-7 pt-8 sm:px-8">
            {/* Branding */}
            <div className="mb-7 text-center">
              <span className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-[image:var(--gradient-red)] red-glow">
                <Plane className="size-6 -rotate-45 text-primary-foreground" />
              </span>

              <h2
                id="auth-title"
                className="font-display text-2xl font-bold tracking-wide"
              >
                SHABIKIA{" "}
                <span className="text-primary text-glow">BET</span>
              </h2>

              <p className="mt-2 text-xs text-muted-foreground">
                {isRegister
                  ? "Create your account to access the demo"
                  : "Welcome back. Sign in to continue"}
              </p>
            </div>

            {/* Mode switch */}
            <div className="mb-6 grid grid-cols-2 rounded-xl border border-border bg-background/60 p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  !isRegister
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  isRegister
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  {/* Username */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Username
                    </label>
                    <input
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className={inputClass}
                      required
                      maxLength={30}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712345678 or +254712345678"
                      className={inputClass}
                      required
                    />
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                      Enter your Kenyan number starting with 07 or +254.
                    </p>
                  </div>
                </>
              )}

              {/* Login Email */}
              {!isRegister && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={inputClass}
                    required
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      isRegister ? "new-password" : "current-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`${inputClass} pr-12`}
                    required
                    minLength={6}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>

                {isRegister && (
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    Minimum 6 characters.
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              {isRegister && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Confirm your password"
                      className={`${inputClass} pr-12`}
                      required
                      minLength={6}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((v) => !v)
                      }
                      aria-label="Toggle confirm password visibility"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-3 text-xs text-destructive"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-3 text-xs text-green-500"
                >
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-red)] py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Please wait...
                  </>
                ) : isRegister ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Backlink */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isRegister ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                onClick={() =>
                  switchMode(isRegister ? "login" : "register")
                }
                className="font-bold text-primary transition-colors hover:underline"
              >
                {isRegister ? "Sign In" : "Create Account"}
              </button>
            </p>

            <p className="mt-5 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
              Virtual play only
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
