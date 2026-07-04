import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdNotifications, MdCheck, MdDelete, MdNotificationsNone } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to mark read');
    }
  };

  const handleReadAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((item) => item._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Stay updated with reviews, bookmarks, planned trip events, and AI recommendations logs.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleReadAll} className="btn-secondary btn-sm flex items-center gap-1">
            <MdCheck /> Mark All Read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 skeleton w-full animate-pulse" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`card p-4 flex justify-between items-center gap-4 border-l-4 ${
                  item.isRead ? 'border-slate-350 dark:border-slate-700 bg-white' : 'border-teal-500 bg-teal-500/5'
                }`}
              >
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-sm text-slate-850 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.message}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{new Date(item.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex gap-1">
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item._id)}
                      className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/10 rounded-xl"
                      aria-label="Mark read"
                    >
                      <MdCheck className="text-lg" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl"
                    aria-label="Delete"
                  >
                    <MdDelete className="text-lg" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card p-12 text-center text-slate-550 space-y-4">
          <MdNotificationsNone className="text-6xl text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">All caught up!</h3>
          <p className="text-sm max-w-sm mx-auto">No new updates or alerts logs for you at this time.</p>
        </div>
      )}
    </div>
  );
}
