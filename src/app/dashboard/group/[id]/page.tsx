'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Send, Users, Info, Settings, UserPlus } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function GroupPage() {
  const { id } = useParams();
  const { token, profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => {
    if (token && id) {
      fetchGroupDetails();
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [token, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchGroupDetails = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/group/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setGroupDetails(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/group/chat/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`http://localhost:8000/api/group/chat/${id}/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ message: newMessage })
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/api/group/member/${id}/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ add_user: newMemberName })
      });
      if (res.ok) {
        setNewMemberName('');
        setShowAddMember(false);
        fetchGroupDetails();
      } else {
        alert("Failed to add member. Ensure username is correct.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xl">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">{groupDetails?.name || `Group #${id}`}</h2>
            <p className="text-slate-400 text-xs">
              {groupDetails?.about || 'Group Chat'}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-slate-400">
          <button onClick={() => setShowAddMember(true)} className="hover:text-primary transition" title="Add Member"><UserPlus size={20} /></button>
          <button className="hover:text-primary transition"><Info size={20} /></button>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="absolute top-20 right-6 z-20 glass-panel p-4 rounded-xl w-64 shadow-2xl border border-white/20">
          <h3 className="text-white text-sm font-semibold mb-2">Add New Member</h3>
          <form onSubmit={addMember} className="flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="Username" 
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="glass-input px-3 py-2 text-sm rounded-lg"
              required
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAddMember(false)} className="flex-1 py-2 text-xs text-slate-400 hover:text-white transition">Cancel</button>
              <button type="submit" className="flex-1 py-2 text-xs btn-primary rounded-lg">Add</button>
            </div>
          </form>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => {
          // The backend serializer wraps the user inside sent_by.user.user due to the Profile model
          const senderUsername = msg.sent_by?.user?.user?.username;
          const isMe = senderUsername === profile?.user?.username;
          
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${isMe ? 'bg-secondary text-white rounded-br-none' : 'bg-slate-700 text-white rounded-bl-none'}`}>
                {!isMe && <p className="text-xs text-blue-300 font-semibold mb-1">{senderUsername || 'Unknown'}</p>}
                <p>{msg.message}</p>
                <p className="text-[10px] opacity-60 text-right mt-1">
                  {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        <form onSubmit={sendMessage} className="flex gap-2 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message to the group..."
            className="flex-1 bg-slate-800/80 border border-slate-700 rounded-full px-6 py-3 text-white focus:outline-none focus:border-secondary transition"
          />
          <button type="submit" className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white hover:bg-blue-600 transition shrink-0">
            <Send size={20} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
