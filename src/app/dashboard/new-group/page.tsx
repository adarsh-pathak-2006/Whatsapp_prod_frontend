'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';

export default function NewGroupPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupData, setGroupData] = useState({ name: '', about: '' });
  const router = useRouter();

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/group/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(groupData)
      });
      
      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/group/${data.id}`);
      } else {
        setError(data.message || 'Failed to create group. Name might already be taken.');
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
          <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
            <Users className="text-secondary" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Create Group</h2>
            <p className="text-slate-400 text-sm">Start a new group conversation</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Group Name</label>
            <input
              required
              value={groupData.name}
              onChange={e => setGroupData({...groupData, name: e.target.value})}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm focus:border-secondary"
              placeholder="e.g. Weekend Plans"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">About (Optional)</label>
            <input
              value={groupData.about}
              onChange={e => setGroupData({...groupData, about: e.target.value})}
              className="glass-input w-full px-4 py-3 rounded-xl text-sm focus:border-secondary"
              placeholder="What is this group about?"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mt-6 text-white"
            style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, #2563eb 100%)' }}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
}
