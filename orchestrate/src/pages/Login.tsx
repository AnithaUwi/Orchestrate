import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import api from '../api/api.client';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return { hours, minutes, seconds };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const { hours, minutes, seconds } = formatTime(time);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      const role = response.data.user.role;
      if (role === 'ADMIN') {
        navigate({ to: '/dashboard/users' as any });
      } else {
        navigate({ to: '/dashboard' as any });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side: Form */}
      <div className="w-full lg:w-5/12 flex flex-col justify-between py-12 px-12 xl:px-24">
        <div />
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Log In to Orchestrate</h1>
          <p className="text-gray-500 mb-8 font-medium">
            Contact your administrator for account access.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-sm mb-6 text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email or Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-12 h-12 bg-[#f9fafb] border-[#e5e7eb] border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#f24d12] focus:border-[#f24d12] transition-all"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-12 pr-12 h-12 bg-[#f9fafb] border-[#e5e7eb] border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-[#f24d12] focus:border-[#f24d12] transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-semibold text-gray-900 hover:underline focus:outline-none"
                onClick={() => alert('Password reset functionality coming soon.')}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f36a5] hover:bg-[#0d2e8c] text-white h-12 rounded-sm font-bold transition-colors shadow-sm"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>

        <div className="text-center space-y-4">
          <p className="text-xs text-gray-500 font-medium">© 2025 Orchestrate</p>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            A comprehensive management system for efficient project coordination and resource booking.
          </p>
        </div>
      </div>

      {/* Right Side: Image/Branding */}
      <div className="hidden lg:block lg:w-7/12 relative overflow-hidden">
        <img
          src="/login_bg_office_1766404759573.png"
          alt="Office Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Floating Clock/Date */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="bg-black/60 backdrop-blur-md px-8 py-5 rounded-2xl border border-white/10 flex flex-col items-center space-y-4 shadow-2xl">
            <div className="flex items-baseline space-x-3">
              <span className="text-6xl font-black tracking-tight">{hours} : {minutes}</span>
              <span className="text-2xl font-bold opacity-80 self-start mt-2">:{seconds}</span>
            </div>

            <div className="bg-white/10 px-5 py-1.5 rounded-full border border-white/20">
              <p className="text-base font-semibold tracking-wide">{formatDate(time)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;