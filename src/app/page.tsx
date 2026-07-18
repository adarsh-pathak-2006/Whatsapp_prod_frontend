'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, UserPlus, LogIn, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: '',
    mobile_no: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch('http://localhost:8000/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });
        
        const data = await res.json();
        
        if (res.ok) {
          login(data.access, data.refresh);
        } else {
          setError(data.detail || 'Invalid credentials');
        }
      } else {
        const res = await fetch('http://localhost:8000/register/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const data = await res.json();
        
        if (res.ok) {
          // Auto login after register
          const loginRes = await fetch('http://localhost:8000/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: formData.username,
              password: formData.password
            })
          });
          const loginData = await loginRes.json();
          if (loginRes.ok) login(loginData.access, loginData.refresh);
        } else {
          setError(data.message || 'Registration failed. Check your inputs.');
        }
      }
    } catch (err) {
      setError('Network error. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-8 animate-fade-in relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <MessageCircle size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join WhatsApp Clone'}
          </h1>
          <p className="text-slate-400 text-center text-sm">
            {isLogin ? 'Sign in to continue your conversations' : 'Create an account to start chatting with friends'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="first_name"
                  placeholder="First Name"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  onChange={handleChange}
                />
                <input
                  name="last_name"
                  placeholder="Last Name"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  onChange={handleChange}
                />
              </div>
            )}
            
            <input
              name="username"
              placeholder="Username"
              required
              className="glass-input w-full px-4 py-3 rounded-xl text-sm"
              onChange={handleChange}
            />
            
            {!isLogin && (
              <>
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  required
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  onChange={handleChange}
                />
                <input
                  name="mobile_no"
                  placeholder="Mobile Number (10 digits)"
                  required
                  pattern=".{10,10}"
                  title="Must be exactly 10 digits"
                  className="glass-input w-full px-4 py-3 rounded-xl text-sm"
                  onChange={handleChange}
                />
              </>
            )}

            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="glass-input w-full px-4 py-3 rounded-xl text-sm"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mt-6"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-slate-400 hover:text-primary transition-colors text-sm font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
