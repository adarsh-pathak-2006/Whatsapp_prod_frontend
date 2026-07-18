'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, MessageSquare, Users, UserPlus, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { profile, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'chats' | 'groups' | 'contacts'>('chats');
  const [items, setItems] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    setItems([]);
    if (token) fetchItems();
  }, [activeTab, token, pathname]);

  const fetchItems = async () => {
    let url = '';
    if (activeTab === 'chats') url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/`;
    if (activeTab === 'groups') url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/group/`;
    if (activeTab === 'contacts') url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/contact/`;

    try {
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <aside className="w-80 glass-panel rounded-3xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
            {profile?.user?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-semibold">{profile?.user?.username}</h3>
            <p className="text-slate-400 text-xs">{profile?.user?.mobile_no}</p>
          </div>
        </div>
        <button onClick={logout} className="text-slate-400 hover:text-red-400 transition">
          <LogOut size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-4 gap-2">
        <button 
          onClick={() => setActiveTab('chats')}
          className={`flex-1 pb-3 text-sm font-medium border-b-2 transition ${activeTab === 'chats' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center justify-center gap-2"><MessageSquare size={16} /> Chats</div>
        </button>
        <button 
          onClick={() => setActiveTab('groups')}
          className={`flex-1 pb-3 text-sm font-medium border-b-2 transition ${activeTab === 'groups' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center justify-center gap-2"><Users size={16} /> Groups</div>
        </button>
        <button 
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 pb-3 text-sm font-medium border-b-2 transition ${activeTab === 'contacts' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center justify-center gap-2"><UserPlus size={16} /> Contacts</div>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.length === 0 ? (
          <p className="text-center text-slate-500 text-sm mt-10">No {activeTab} found</p>
        ) : (
          items.map((item: any, i: number) => {
            const isChat = activeTab === 'chats';
            const isGroup = activeTab === 'groups';
            const isContact = activeTab === 'contacts';
            
            // Derive display name based on item type
            let name = 'Unknown';
            let href = '';
            
            if (isChat) {
              const otherUser = item.user1?.user?.username === profile?.user?.username ? item.user2?.[0]?.user?.username : item.user1?.user?.username;
              name = otherUser || 'Empty Chat';
              href = `/dashboard/chat/${item.id}`;
            } else if (isGroup) {
              name = item.name || 'Unnamed Group';
              href = `/dashboard/group/${item.id}`;
            } else if (isContact) {
              name = item.name || 'Unnamed Contact';
              href = `/dashboard/contact/${item.name}`;
            }

            const isActive = pathname === href;
            
            // Final fallback to ensure it's a string
            const displayName = String(name || 'Unknown');

            return (
              <Link href={href} key={i}>
                <div className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${isActive ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}>
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-semibold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className={`font-medium ${isActive ? 'text-primary-100' : 'text-white'}`}>{displayName}</h4>
                    {isGroup && <p className="text-xs text-slate-400">{item.about || 'No description'}</p>}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
      
      {/* New Button */}
      <div className="p-4 border-t border-white/10">
        <Link href={`/dashboard/new-${activeTab.slice(0, -1)}`} className="btn-primary w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
          {activeTab === 'chats' && <><MessageSquare size={18} /> New Chat</>}
          {activeTab === 'groups' && <><Users size={18} /> Create Group</>}
          {activeTab === 'contacts' && <><UserPlus size={18} /> Add Contact</>}
        </Link>
      </div>
    </aside>
  );
}
