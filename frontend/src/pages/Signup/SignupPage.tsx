import React, { useState } from 'react';
import {
  Activity,
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { healthApi } from '../../services/healthApi';

interface SignupPageProps {
  onSwitchToLogin: () => void;
  onSignupComplete: (user: any) => void;
  onBackToLanding?: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onSwitchToLogin,
  onSignupComplete,
  onBackToLanding,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await healthApi.register(email, password, fullName);
      localStorage.setItem('medinova_token', res.access_token);
      onSignupComplete(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 sm:p-8 glass-panel-dark rounded-3xl space-y-6 shadow-2xl border border-[#203039]">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D084] via-[#21E6C1] to-emerald-400 flex items-center justify-center text-[#05090D] mx-auto shadow-lg shadow-[#00D084]/25">
          <Activity className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight">
          Create Account
        </h1>
        <p className="text-xs text-[#9BAAB6]">
          Register for MEDINOVA-AI Personal Health Copilot
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#FF5C68]/10 border border-[#FF5C68]/30 text-[#FF5C68] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="text-[#9BAAB6] block mb-1 font-semibold">Full Legal Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-[#9BAAB6] absolute left-3 top-2.5" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Chen"
              className="w-full glass-input-dark rounded-xl pl-9 pr-3 py-2 text-xs outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[#9BAAB6] block mb-1 font-semibold">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#9BAAB6] absolute left-3 top-2.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com"
              className="w-full glass-input-dark rounded-xl pl-9 pr-3 py-2 text-xs outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[#9BAAB6] block mb-1 font-semibold">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#9BAAB6] absolute left-3 top-2.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full glass-input-dark rounded-xl pl-9 pr-3 py-2 text-xs outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-emerald text-xs !py-3 font-bold shadow-lg shadow-[#00D084]/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Complete Registration</span>}
        </button>
      </form>

      {/* Switcher & Back */}
      <div className="text-center space-y-2 pt-2 border-t border-[#203039] text-xs text-[#9BAAB6]">
        <p>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#00D084] font-bold hover:underline"
          >
            Sign In
          </button>
        </p>

        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="text-[11px] text-[#9BAAB6] hover:text-[#F4F7FA] block mx-auto pt-1"
          >
            ← Return to Home
          </button>
        )}
      </div>
    </div>
  );
};
