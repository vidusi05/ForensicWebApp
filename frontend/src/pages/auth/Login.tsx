import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { Activity } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const googleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setError(null);
      setLoading(true);
      try {
        await login(email, password);
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleCredential = async (credential?: string) => {
    if (!credential) {
      setError('Google Sign-In did not return a credential');
      return;
    }

    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle(credential);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Activity className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            FourCells Login
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Forensic Medicine Department Database
          </p>
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm text-center font-medium border border-red-200">
              {error}
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="doctor@hospital.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500">or</span>
          </div>
        </div>

        <div className="flex justify-center">
          {googleConfigured ? (
            <div className={googleLoading ? 'pointer-events-none opacity-60' : ''}>
              <GoogleLogin
                onSuccess={(credentialResponse) => handleGoogleCredential(credentialResponse.credential)}
                onError={() => setError('Google Sign-In failed')}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="320"
              />
            </div>
          ) : (
            <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm font-medium text-amber-700">
              Google Sign-In is not configured.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
