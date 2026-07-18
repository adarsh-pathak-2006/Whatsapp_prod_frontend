import { MessageSquare } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6">
        <MessageSquare size={48} className="text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">WhatsApp Clone Web</h2>
      <p className="text-slate-400 max-w-md">
        Select a chat from the sidebar or start a new conversation to begin messaging.
      </p>
    </div>
  );
}
