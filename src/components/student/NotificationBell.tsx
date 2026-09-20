import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, BellOff, RefreshCw } from 'lucide-react';
import { notificationApi } from '../../api/notificationApi';
import type { NotificationResponse } from '../../api/types';
import './NotificationBell.css';

interface NotificationBellProps {
  studentId: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ studentId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getNotifications(studentId);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkViewed = async (id: number) => {
    try {
      await notificationApi.markViewed(id);
      // Remove from current unread list upon successful response from backend
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.warn('Failed to mark notification viewed:', err);
    }
  };

  const formatTimestamp = (createdAt?: string | null) => {
    if (!createdAt) return '';
    try {
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) return createdAt;
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return createdAt;
    }
  };

  const getBadgeLabel = (type?: string) => {
    switch (type) {
      case 'NEW_JOB':
        return 'Placement Drive';
      case 'APPLICATION_SUBMITTED':
        return 'Application Submitted';
      case 'APPLICATION_SHORTLISTED':
        return 'Shortlisted';
      case 'APPLICATION_REJECTED':
        return 'Application Rejected';
      case 'ROUND_SCHEDULED':
        return 'Interview Scheduled';
      case 'ROUND_SELECTED':
        return 'Round Passed';
      case 'ROUND_REJECTED':
        return 'Round Rejected';
      case 'FINAL_SELECTED':
        return 'Final Selection';
      case 'FINAL_REJECTED':
        return 'Final Rejected';
      case 'PLACEMENT_EVENT':
        return 'Placement Event';
      default:
        return 'Notification';
    }
  };

  return (
    <div className="notif-bell-container" ref={containerRef}>
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="notif-bell-btn"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="notif-badge">{notifications.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="notif-popover">
          <div className="notif-header">
            <div className="notif-title-group">
              <h4 className="notif-header-title">Notifications</h4>
              {notifications.length > 0 && (
                <span className="notif-header-count">{notifications.length}</span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="notif-close-btn"
              title="Close"
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>

          <div className="notif-body">
            {loading && notifications.length === 0 ? (
              <div className="notif-loading">
                <div className="notif-spinner" />
                <span>Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="notif-error">
                <span>{error}</span>
                <button onClick={fetchNotifications} className="notif-retry-btn">
                  <RefreshCw size={12} className="inline mr-1" /> Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <BellOff size={28} className="text-slate-500" />
                <span className="notif-empty-text">No notifications yet.</span>
              </div>
            ) : (
              notifications.map((item) => (
                <div key={item.id} className="notif-item">
                  <div className="notif-item-top">
                    <span className={`notif-type-tag ${item.type || 'GENERAL'}`}>
                      {getBadgeLabel(item.type)}
                    </span>
                    {item.createdAt && (
                      <span className="notif-time">{formatTimestamp(item.createdAt)}</span>
                    )}
                  </div>
                  <h5 className="notif-heading">{item.title}</h5>
                  <p className="notif-message">{item.body}</p>
                  <div className="notif-action-row">
                    <button
                      onClick={() => handleMarkViewed(item.id)}
                      className="notif-dismiss-btn"
                    >
                      Mark as read ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
