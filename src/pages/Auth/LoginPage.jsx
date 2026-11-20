import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('priyanshupm9@gmail.com');
  const [password, setPassword] = useState('Priya@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both administrator email and password.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      addToast('Welcome back, Administrator!', 'success');
      navigate('/');
    } else {
      setErrorMsg(res.message || 'Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-light-main text-light-text transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="rounded-3xl border border-light-border bg-light-card p-8 sm:p-10 shadow-xl transition-all">
          {/* Logo & Heading */}
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-md font-bold text-2xl font-serif mb-4">
              G
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-light-text flex items-center justify-center gap-2">
              GharKaSwad
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange border border-brand-orange/30">
                Admin
              </span>
            </h1>
            <p className="text-xs text-light-muted mt-1.5">
              Secure Platform Control & Financial Administration
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-light-text mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-light-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gharkaswad.com"
                  className="w-full rounded-xl border border-light-border bg-light-secondary/50 pl-10 pr-4 py-2.5 text-xs text-light-text placeholder-light-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-text mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-light-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-light-border bg-light-secondary/50 pl-10 pr-10 py-2.5 text-xs text-light-text placeholder-light-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-light-muted hover:text-light-text"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3 px-4 text-xs font-bold text-white shadow-md hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-60 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Security footnote */}
          <div className="mt-8 pt-6 border-t border-light-border text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-light-muted font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>TLS Encrypted & RBAC Authenticated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
