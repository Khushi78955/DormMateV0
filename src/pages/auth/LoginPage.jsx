import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate("/");
    } catch (err) {
      setError(err?.message || "Failed to sign in.");
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
            label="Email"
            type="email"
            required
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="text-center text-white/50 text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-primary-300 hover:text-primary-200">
            Sign up →
          </Link>
        </p>
      </div>
    </div>
  );
}
