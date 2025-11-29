"use client";

import { useState } from 'react';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'feature_request' | 'bug' | 'other';
  userId: string;
  userName: string;
  userEmail: string;
  assignedTo?: string;
  messages: { id: string; author: string; isStaff: boolean; message: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface TicketsClientProps {
  tickets: Ticket[];
  stats: { total: number; open: number; in_progress: number; resolved: number; closed: number };
}

export default function TicketsClient({ tickets, stats }: TicketsClientProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const handleStatusChange = async (id: string, status: string) => {
    await fetch('/api/admin/tickets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates: { status } }),
    });
    window.location.reload();
  };

  const handleReply = async () => {
    if (!viewingTicket || !replyMessage) return;

    await fetch('/api/admin/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_message',
        ticketId: viewingTicket.id,
        message: replyMessage,
      }),
    });

    setReplyMessage('');
    window.location.reload();
  };

  const filteredTickets = filterStatus !== 'all' ? tickets.filter(t => t.status === filterStatus) : tickets;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Support Tickets</h1>
          <p className="text-gray-400 text-lg">Manage customer support requests</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {[
          { label: 'Total', value: stats.total, color: 'blue' },
          { label: 'Open', value: stats.open, color: 'yellow' },
          { label: 'In Progress', value: stats.in_progress, color: 'purple' },
          { label: 'Resolved', value: stats.resolved, color: 'green' },
          { label: 'Closed', value: stats.closed, color: 'gray' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/20 border border-${stat.color}-500/30 rounded-xl p-6`}>
            <div className={`text-sm text-${stat.color}-400 font-semibold mb-2`}>{stat.label}</div>
            <div className="text-4xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
      >
        <option value="all">All Statuses</option>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </select>

      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{ticket.subject}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                    ticket.status === 'in_progress' ? 'bg-purple-500/20 text-purple-400' :
                    ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {ticket.status.toUpperCase().replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                    ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-400 mb-3">{ticket.description.substring(0, 150)}...</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>{ticket.userName} ({ticket.userEmail})</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  <span>{ticket.messages.length} messages</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewingTicket(ticket)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  View
                </button>
                {ticket.status !== 'closed' && (
                  <button
                    onClick={() => handleStatusChange(ticket.id, ticket.status === 'open' ? 'in_progress' : ticket.status === 'in_progress' ? 'resolved' : 'closed')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                  >
                    {ticket.status === 'open' ? 'Start' : ticket.status === 'in_progress' ? 'Resolve' : 'Close'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewingTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-4xl w-full my-8">
            <h2 className="text-2xl font-bold mb-6">{viewingTicket.subject}</h2>

            <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-2">{viewingTicket.userName} - {new Date(viewingTicket.createdAt).toLocaleString()}</div>
                <p className="text-white">{viewingTicket.description}</p>
              </div>

              {viewingTicket.messages.map((msg) => (
                <div key={msg.id} className={`rounded-lg p-4 ${msg.isStaff ? 'bg-blue-900/30 ml-8' : 'bg-gray-900 mr-8'}`}>
                  <div className="text-sm text-gray-500 mb-2">{msg.author} - {new Date(msg.createdAt).toLocaleString()}</div>
                  <p className="text-white">{msg.message}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply..."
                rows={4}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReply}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  Send Reply
                </button>
                <button
                  onClick={() => { setViewingTicket(null); setReplyMessage(''); }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
