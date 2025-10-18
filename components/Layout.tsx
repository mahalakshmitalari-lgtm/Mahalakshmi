import React, { useState, useEffect, useRef } from 'react';
import { useSessionStore, useTicketStore } from '../store';
import { Role } from '../types';
import { ICONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  page: string;
  activePage: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, page, activePage, onClick }) => {
  const isActive = activePage === page;
  return (
    <li
      onClick={onClick}
      className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-sky-100 text-sky-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </li>
  );
};

const Sidebar: React.FC<{ activePage: string, setActivePage: (page: string) => void }> = ({ activePage, setActivePage }) => {
  const { user } = useSessionStore();
  const showAdminNav = user?.role === Role.ADMIN || user?.role === Role.DATACR;
  const showManagerNav = user?.role === Role.ASM || user?.role === Role.BDM;

  const adminNavItems = [
    { page: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard },
    { page: 'error-analytics', label: 'Error Analytics', icon: ICONS.analytics },
    { page: 'detailed-analytics', label: 'Detailed Analytics', icon: ICONS.analytics },
    { page: 'pre-management', label: 'User Management', icon: ICONS.users },
    { page: 'feedback', label: 'Feedback', icon: ICONS.messages },
    { page: 'error-types', label: 'Error Types', icon: ICONS.errors },
    { page: 'messages', label: 'Messages', icon: ICONS.messages },
    { page: 'logs', label: 'Audit Logs', icon: ICONS.logs },
  ];

  const managerNavItems = [
    { page: 'dashboard', label: 'Team Dashboard', icon: ICONS.dashboard },
    { page: 'error-analytics', label: 'Error Analytics', icon: ICONS.analytics },
    { page: 'detailed-analytics', label: 'Detailed Analytics', icon: ICONS.analytics },
  ];
  
  const preNavItems = [
    { page: 'dashboard', label: 'My Dashboard', icon: ICONS.dashboard },
    { page: 'feedback', label: 'Submit Feedback', icon: ICONS.messages },
  ];

  let navItems = preNavItems;
  if (showAdminNav) {
    navItems = adminNavItems;
  } else if (showManagerNav) {
    navItems = managerNavItems;
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-4 shadow-soft">
      <div className="flex items-center mb-8 px-2">
        <div className="p-2 bg-sky-600 rounded-lg mr-3">
            <TicketIcon className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Support Dashboard</h1>
      </div>
      <nav>
        <ul className="space-y-2">
          {navItems.map(item => (
            <NavItem 
              key={item.page}
              icon={item.icon}
              label={item.label}
              page={item.page}
              activePage={activePage}
              onClick={() => setActivePage(item.page)}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

function TicketIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v3.193c.34.225.626.53.829.894.202.364.303.773.303 1.188s-.101.824-.303 1.188a2.64 2.64 0 01-.83.894v3.193c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 17.625v-3.193a2.64 2.64 0 01-.83-.894 2.633 2.633 0 01-.303-1.188c0-.415.101-.824.303-1.188.203-.364.49-.669.83-.894V6.375zM3 15.563v2.062c0 .207.168.375.375.375h17.25a.375.375 0 00.375-.375v-2.063a3.354 3.354 0 00-1.01-2.312 3.336 3.336 0 00-1.99-1.042 3.354 3.354 0 00-1.01 2.312c0 .96-.328 1.821-.958 2.457a.375.375 0 01-.52.028.375.375 0 01-.028-.52 1.875 1.875 0 00-.97-2.61c0-1.22.52-2.31 1.34-3.048a.375.375 0 01.52-.028.375.375 0 01.028.52 1.875 1.875 0 00.97 2.61c0 .96.328 1.821.958 2.457a.375.375 0 01-.52.028.375.375 0 01-.028-.52 1.875 1.875 0 00-.97-2.61c0-1.22.52-2.31 1.34-3.048a.375.375 0 01.52-.028.375.375 0 01.028.52 1.875 1.875 0 00.97 2.61c0 .96.328 1.821.958 2.457a.375.375 0 01-.52.028.375.375 0 01-.028-.52 1.875 1.875 0 00-.97-2.61c0-1.22.52-2.31 1.34-3.048a.375.375 0 01.52-.028.375.375 0 01.028.52c-.82 1.002-.82 2.45 0 3.452a3.375 3.375 0 005.67 0c.82-1.002.82-2.45 0-3.452a.375.375 0 01.548-.548c.82 1.002.82 2.45 0 3.452a3.375 3.375 0 00-2.835 1.726 3.375 3.375 0 00-2.835-1.726 3.375 3.375 0 00-2.835 1.726 3.375 3.375 0 00-2.835-1.726 3.375 3.375 0 00-2.835 1.726c-.82-1.002-.82-2.45 0-3.452a.375.375 0 01.548-.548c.82 1.002.82 2.45 0 3.452z" clipRule="evenodd" />
    </svg>
  );
}

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "min ago";
    return Math.floor(seconds) + "s ago";
};

const PreNotifications: React.FC = () => {
    const { user } = useSessionStore();
    const { notifications, fetchNotifications, markSystemNotificationAsRead } = useTicketStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);
    
    const myNotifications = notifications.filter(n => n.preId === user?.id);
    const unreadCount = myNotifications.filter(n => !n.isRead).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="relative text-slate-500 hover:text-sky-600">
                {ICONS.bell}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
                    <div className="p-3 border-b border-slate-200">
                        <h4 className="font-semibold text-slate-800">Notifications</h4>
                    </div>
                    <ul className="py-2 max-h-96 overflow-y-auto">
                        {myNotifications.length > 0 ? (
                             myNotifications.map(n => (
                                <li key={n.id} onClick={() => markSystemNotificationAsRead(n.id)} className={`px-4 py-2 hover:bg-slate-50 cursor-pointer ${!n.isRead ? 'font-semibold' : 'font-normal'}`}>
                                    <div className="flex items-start">
                                        {!n.isRead && <span className="flex-shrink-0 h-2 w-2 rounded-full bg-sky-500 mt-1.5 mr-3"></span>}
                                        <div className={`flex-grow ${n.isRead ? 'pl-5' : ''}`}>
                                          <p className={`text-sm ${!n.isRead ? 'text-slate-800' : 'text-slate-500'}`}>{n.message}</p>
                                          <p className="text-xs text-slate-400 mt-1">{timeSince(n.timestamp)}</p>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-3 text-sm text-center text-slate-500">No notifications found.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};


const AdminNotifications: React.FC = () => {
    const { adminNotifications, fetchAdminNotifications, markAdminNotificationAsRead } = useTicketStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchAdminNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const unreadCount = adminNotifications.filter(n => !n.isRead).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="relative text-slate-500 hover:text-sky-600">
                {ICONS.bell}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
                    <div className="p-3 border-b border-slate-200">
                        <h4 className="font-semibold text-slate-800">Notifications</h4>
                    </div>
                    <ul className="py-2 max-h-96 overflow-y-auto">
                        {adminNotifications.length > 0 ? (
                             adminNotifications.map(n => (
                                <li key={n.id} onClick={() => markAdminNotificationAsRead(n.id)} className={`px-4 py-2 hover:bg-slate-50 cursor-pointer ${!n.isRead ? 'font-semibold' : 'font-normal'}`}>
                                    <div className="flex items-start">
                                        {!n.isRead && <span className="flex-shrink-0 h-2 w-2 rounded-full bg-sky-500 mt-1.5 mr-3"></span>}
                                        <div className={`flex-grow ${n.isRead ? 'pl-5' : ''}`}>
                                          <p className={`text-sm ${!n.isRead ? 'text-slate-800' : 'text-slate-500'}`}>{n.message}</p>
                                          <p className="text-xs text-slate-400 mt-1">{timeSince(n.timestamp)}</p>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-3 text-sm text-center text-slate-500">No notifications found.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

const Header: React.FC = () => {
    const { user, logout, team } = useSessionStore();
    const isPre = user?.role === Role.PRE;
    const isAdminOrManager = user?.role === Role.ADMIN || user?.role === Role.DATACR || user?.role === Role.ASM || user?.role === Role.BDM;

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
            <h2 className="text-lg font-semibold text-slate-700">
                Welcome, {user?.name} {team ? <span className="text-sm font-normal text-slate-500 ml-2">({team})</span> : ''}
            </h2>
            <div className="flex items-center gap-6">
                {isAdminOrManager && <AdminNotifications />}
                {isPre && <PreNotifications />}
                <button onClick={logout} className="flex items-center text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">
                    {ICONS.logout}
                    <span className="ml-2">Logout</span>
                </button>
            </div>
        </header>
    );
};

export const AppLayout: React.FC<LayoutProps> = ({ children, activePage, setActivePage }) => {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};