'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { User, MessageSquare, Trash2 } from 'lucide-react';

export default function ContactPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (token && id) {
      fetchContactDetails();
    }
  }, [token, id]);

  const fetchContactDetails = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/contact/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setContact(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async () => {
    try {
      // Create or get chat with this contact's primary user
      const username = contact?.contact?.[0];
      if (!username) return;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user2: username })
      });
      
      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/chat/${data.id}`);
      } else {
        alert(data.message || 'Failed to start chat');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteContact = async () => {
    if (!confirm('Are you sure you want to remove this contact?')) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/contact/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Failed to delete contact');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center text-slate-400">Loading...</div>;
  if (!contact) return <div className="flex-1 flex items-center justify-center text-slate-400">Contact not found.</div>;

  return (
    <div className="flex-1 p-8 flex flex-col items-center justify-center">
      <div className="glass-panel max-w-md w-full p-8 rounded-2xl flex flex-col items-center animate-fade-in relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-purple-500"></div>

        <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mb-6 border border-accent/30">
          <User className="text-accent" size={48} />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">{contact.name}</h2>
        <p className="text-slate-400 mb-8 text-sm">
          Username: {contact.contact?.join(', ') || 'Unknown'}
        </p>

        <div className="flex gap-4 w-full">
          <button
            onClick={startChat}
            className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-white bg-primary hover:bg-blue-600 transition shadow-lg shadow-primary/20"
          >
            <MessageSquare size={18} /> Message
          </button>
          
          <button
            onClick={deleteContact}
            className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition"
          >
            <Trash2 size={18} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
