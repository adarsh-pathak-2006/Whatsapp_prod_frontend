'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Send, Phone, Video, Info } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const { id } = useParams();
  const { token, profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token && id) {
      fetchMessages();
      // Polling for new messages
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [token, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/chat/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
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
      const res = await fetch(`http://localhost:8000/api/chat/${id}/`, {
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

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Chat #{id}</h2>
            <p className="text-green-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Online
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-slate-400">
          <button className="hover:text-primary transition"><Phone size={20} /></button>
          <button className="hover:text-primary transition"><Video size={20} /></button>
          <button className="hover:text-primary transition"><Info size={20} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.sent_by?.user?.username === profile?.user?.username;
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-slate-700 text-white rounded-bl-none'}`}>
                {!isMe && <p className="text-xs text-slate-400 mb-1">{msg.sent_by?.user?.username}</p>}
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
            placeholder="Type a message..."
            className="flex-1 bg-slate-800/80 border border-slate-700 rounded-full px-6 py-3 text-white focus:outline-none focus:border-primary transition"
          />
          <button type="submit" className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-hover transition shrink-0">
            <Send size={20} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
