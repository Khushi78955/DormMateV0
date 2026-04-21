import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { registerUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const getStrength = (pwd) => {
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  if (pwd.length < 6) return { label: "Weak", color: "text-red-400" };
  if (pwd.length < 10 || !hasSpecial)
    return { label: "Medium", color: "text-yellow-400" };
  return { label: "Strong", color: "text-green-400" };
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = getStrength(password);

  const blobs = useMemo(
    () => [
      {
        className:
          "bg-gradient-to-br from-primary-500/40 to-cyan-500/30 top-[-120px] left-[-120px]",
        delay: 0,
      },
      {
        className:
          "bg-gradient-to-br from-pink-500/25 to-purple-500/30 bottom-[-140px] right-[-120px]",
        delay: 0.2,
      },
      {
        className:
          "bg-gradient-to-br from-cyan-500/25 to-primary-500/30 top-[30%] right-[-160px]",
        delay: 0.4,
      },
    ],
    []
  );

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerUser(email, password, name);
      navigate("/onboarding");
    } catch (err) {
      setError(err?.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {blobs.map((b, idx) => (
        <motion.div
          key={idx}
          className={`absolute w-[320px] h-[320px] rounded-full blur-3xl ${b.className}`}
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
        />
      ))}

      <div className="glass-card w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">🏠</span>
            <span className="font-display font-bold text-2xl neon-text">DormMate</span>
          </div>
          <p className="text-white/50 text-sm mt-2">Smart Shared Living</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Name"
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            required
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div>
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {password && (
              <p className={`text-xs mt-2 ${strength.color}`}>
                Strength: {strength.label}
              </p>
            )}
          </div>
          <Input
            label="Confirm Password"
            type="password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-white/50 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-300 hover:text-primary-200">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}

