import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuBell, LuCheck, LuTrash2, LuBellOff } from 'react-icons/lu';
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
    <div className="space-y-8 min-h-screen pb-12 bg-[#FAF7FF] dark:bg-dark-bg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display">Notifications</h1>
          <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Stay updated with reviews, bookmarks, planned trip events, and AI recommendations logs.</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleReadAll} className="btn bg-primary-100/50 hover:bg-primary-100 text-accent font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1">
            <LuCheck /> Mark All Read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 skeleton w-full animate-pulse rounded-2xl" />
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
                className={`card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-4 flex justify-between items-center gap-4 border-l-4 rounded-2xl shadow-sm ${
                  item.isRead ? 'border-l-primary-200' : 'border-l-accent bg-primary-50/30 dark:bg-primary-950/10'
                }`}
              >
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-sm text-primary-900 dark:text-white font-display">{item.title}</h3>
                  <p className="text-xs text-primary-900/60 dark:text-dark-muted font-semibold">{item.message}</p>
                  <p className="text-[10px] text-primary-900/40 dark:text-dark-muted/50 font-bold">{new Date(item.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex gap-1 shrink-0">
                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(item._id)}
                      className="p-2 text-accent hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-xl cursor-pointer transition-colors"
                      aria-label="Mark read"
                    >
                      <LuCheck className="text-lg" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl cursor-pointer transition-colors"
                    aria-label="Delete"
                  >
                    <LuTrash2 className="text-lg" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted space-y-4 rounded-2xl">
          <LuBellOff className="text-6xl text-primary-200 dark:text-dark-muted mx-auto animate-float" />
          <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">All caught up!</h3>
          <p className="text-xs max-w-sm mx-auto leading-relaxed font-semibold">No new updates or alerts logs for you at this time.</p>
        </div>
      )}
    </div>
  );
}
