import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NotificationsContext = createContext(null);

export function useNotifications() {
  return useContext(NotificationsContext);
}

// Notification shape: { id, type: 'info'|'success'|'error'|'warn', message }
export function NotificationsProvider({ children }) {
  const [list, setList] = useState([]);

  const push = useCallback((notification) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
    const item = { id, type: notification.type || 'info', message: notification.message };
    setList((prev) => [item, ...prev]);
    // auto-dismiss after 4s
    setTimeout(() => {
      setList((prev) => prev.filter((n) => n.id !== id));
    }, notification.duration || 4000);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setList((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = { list, push, remove };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <NotificationPanel notifications={list} onDismiss={remove} />
    </NotificationsContext.Provider>
  );
}

function NotificationPanel({ notifications, onDismiss }) {
  return (
    <div className="notificationRoot" aria-live="polite">
      {notifications.map((n) => (
        <div key={n.id} className={`notification ${n.type} show`}>
          <div className="notificationMessage" style={{color: "#fff"}}>{n.message}</div>
          <button className="notificationClose" onClick={() => onDismiss(n.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

export default NotificationsProvider;
