import React, { useState } from 'react';
import {
  Activity,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { healthApi } from '../../services/healthApi';

interface LoginPageProps {
  onSwitchToSignup: () => void;
  onLoginSuccess: (user: any) => void;
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSwitchToSignup,
  onLoginSuccess,
  onBackToLanding,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await healthApi.login(email, password);
      localStorage.setItem('medinova_token', res.access_token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      setEmail('demo@medinova.ai');
      setPassword('Medinova2026!');
      const res = await healthApi.login('demo@medinova.ai', 'Medinova2026!');
      localStorage.setItem('medinova_token', res.access_token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
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
          Welcome Back
        </h1>
        <p className="text-xs text-[#9BAAB6]">
          Sign in to your MEDINOVA-AI Personal Health Copilot
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
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Copilot</span>}
        </button>
      </form>

      {/* Demo 1-Click Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full btn-secondary-dark text-xs !py-2.5 font-bold flex items-center justify-center gap-2 border border-[#21E6C1]/30 hover:border-[#21E6C1]/60 text-[#21E6C1]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>1-Click Demo Account (Alex Chen)</span>
        </button>
      </div>

      {/* Switcher & Back */}
      <div className="text-center space-y-2 pt-2 border-t border-[#203039] text-xs text-[#9BAAB6]">
        <p>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-[#00D084] font-bold hover:underline"
          >
            Create Account
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
