'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

export default function NewContactPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactName, setContactName] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:8000/api/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // In the backend, 'contact' takes a list of profile IDs or handles mapping.
        // Wait, looking at contact models, we map a profile to a contact name. 
        // For simplicity, we just pass the raw data expected by the API.
        body: JSON.stringify({ 
          name: contactName,
          contact: [username] // Depending on backend handling, might need profile ID, but we try username first
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard`);
      } else {
        // Display exact backend error for debugging
        setError(JSON.stringify(data));
      }
    } catch (e) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 flex flex-col items-center justify-center">
      <div className="glass-panel max-w-md w-full p-8 rounded-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
            <UserPlus className="text-accent" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Add Contact</h2>
            <p className="text-slate-400 text-sm">Add a new user to your contacts</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAddContact} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Display Name</label>
            <input
              required
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm focus:border-accent"
              placeholder="e.g. John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">Username of User</label>
            <input
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm focus:border-accent"
              placeholder="Their exact username"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mt-6 text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #c084fc 100%)' }}
          >
            {loading ? 'Adding...' : 'Add Contact'}
          </button>
        </form>
      </div>
    </div>
  );
}
