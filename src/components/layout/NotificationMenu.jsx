import { Bell, CheckCircle2, Download, Info, Layers, Send, XCircle, WifiOff } from 'lucide-react';
import { Menu } from '../ui/Menu';
import EmptyState from '../ui/EmptyState';
import { useNotifications } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/format';

const ICON = { requestCompleted: Send, testPassed: CheckCircle2, testFailed: XCircle, collectionImported: Download, environmentChanged: Layers, systemNotification: Info };
const TONE = { testPassed: 'ok', testFailed: 'err', requestCompleted: 'info', collectionImported: 'ok' };
const STATUS_TEXT = { connected: 'Live updates on', connecting: 'Reconnecting…', disconnected: 'Live updates off' };

export default function NotificationMenu() {
  const { notifications, unreadCount, status, markRead, markAllRead } = useNotifications();
  return (
    <Menu label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} align="right" panelClassName="notif-panel"
      button={{ className: 'icon-btn icon-btn-lg bell', content: <><Bell size={18} />{unreadCount > 0 && <span className="bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}</> }}>
      {() => (
        <>
          <div className="notif-head">
            <strong>Notifications</strong>
            <button className="link-btn" onClick={markAllRead} disabled={!unreadCount}>Mark all as read</button>
          </div>
          <div className={`notif-status notif-status-${status}`}>{status === 'disconnected' ? <WifiOff size={13} /> : <span className="live-dot" />}{STATUS_TEXT[status]}</div>
          <div className="notif-list">
            {notifications.length === 0 && <EmptyState compact icon={Bell} title="No notifications" description="Request, test and import events will show up here." />}
            {notifications.map((n) => {
              const Icon = ICON[n.type] || Info;
              return (
                <button key={n.id} className={`notif ${n.read ? '' : 'unread'}`} onClick={() => markRead(n.id)} aria-label={`${n.read ? '' : 'Unread: '}${n.message}`}>
                  <span className={`notif-icon tone-${TONE[n.type] || 'neutral'}`}><Icon size={15} /></span>
                  <span className="notif-body"><span className="notif-msg">{n.message}</span><span className="notif-time">{timeAgo(n.createdAt)}</span></span>
                  {!n.read && <span className="unread-dot" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </Menu>
  );
}
