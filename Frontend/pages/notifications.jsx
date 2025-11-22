import React, { useState } from 'react';
import { useAuth } from '@lib/auth-context';
import { Bell, Check, Trash2 } from 'lucide-react';

const Notifications = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Low Stock Alert',
      message: 'SKU-001 is below reorder level',
      timestamp: '2024-01-15 14:30',
      read: false,
      type: 'warning',
    },
    {
      id: 2,
      title: 'Receipt Completed',
      message: 'REC-001 has been completed',
      timestamp: '2024-01-15 13:15',
      read: true,
      type: 'success',
    },
  ]);

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Notifications</h1>
          <p className="text-neutral-600 mt-1">Stay updated with system events</p>
        </div>
        <button className="btn btn-outline">Mark all as read</button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="card p-8 text-center">
            <Bell size={32} className="mx-auto text-neutral-400 mb-4" />
            <p className="text-neutral-600">No notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`card p-4 flex items-start gap-4 ${
                !notif.read ? 'bg-primary/5 border-l-4 border-primary' : ''
              }`}
            >
              <div className="flex-1">
                <h3 className="font-medium text-neutral-900">{notif.title}</h3>
                <p className="text-sm text-neutral-600 mt-1">{notif.message}</p>
                <p className="text-xs text-neutral-500 mt-2">{notif.timestamp}</p>
              </div>
              <div className="flex gap-2">
                {!notif.read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-2 text-neutral-400 hover:text-primary transition-colors"
                  >
                    <Check size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-2 text-neutral-400 hover:text-danger transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
