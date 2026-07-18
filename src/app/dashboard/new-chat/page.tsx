'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus } from 'lucide-react';

export default function NewChatPage() {
  const { token, profile } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (token) {
      fetchContacts();
    }
  }, [token]);

  const fetchContacts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/contact/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startChat = async (contactName: string) => {
    setLoading(true);
    setError('');
    
    // We need the contact's username to start a chat.
    // The backend contact object holds `contact` which is a list of profiles.
    try {
      const res = await fetch('http://localhost:8000/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user2: contactName })
      });
      
      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/chat/${data.id}`);
      } else {
        setError(data.message || 'Failed to start chat. Ensure the user exists.');
      }
    } catch (e) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 flex flex-col items-center justify-center">
      <div className="glass-panel max-w-lg w-full p-8 rounded-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <MessageSquarePlus className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Start New Chat</h2>
            <p className="text-slate-400 text-sm">Select a contact to start messaging</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {contacts.length === 0 ? (
            <p className="text-slate-400 text-center py-4">You have no contacts yet.</p>
          ) : (
            contacts.map((contact, idx) => (
              <button
                key={idx}
                onClick={() => startChat(contact.name)}
                disabled={loading}
                className="w-full p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 border border-transparent hover:border-white/10 transition text-left"
              >
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-medium">{contact.name}</h3>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
