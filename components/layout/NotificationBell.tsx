"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  action_data?: any;
  read_at?: string;
  created_at: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();

    const fetchUserAndSubscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Suscribirse a Realtime
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as Notification;
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            // Sonido opcional
            try {
              new Audio('/sounds/bell.mp3').play().catch(() => {});
            } catch (e) {}
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    fetchUserAndSubscribe();
  }, [supabase]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        const data = json.data || [];
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read_at).length);
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.read_at) {
      markAsRead(notif.id);
    }

    if (notif.type === 'INVITATION' && notif.action_data?.invitation_id) {
      alert("Aquí se aceptaría la invitación: " + notif.action_data.invitation_id);
    } else if (notif.action_url) {
      router.push(notif.action_url);
    } else if (notif.action_data?.document_id) {
      router.push(`/dashboard/documents/${notif.action_data.document_id}`);
    }
  };

  return (
    <div className="relative flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-[#958da1] hover:text-[#e2e2e2] hover:bg-[#27272a] transition-colors flex items-center justify-center"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0c0f0f]"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-[#18181b] border border-[#3f3f46] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px]">
            <div className="p-4 border-b border-[#3f3f46] flex justify-between items-center bg-[#1a1c1c]">
              <h3 className="text-sm font-semibold text-[#e2e2e2]">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-[#7c3aed]/20 text-[#d2bbff] px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-[#958da1]">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_paused</span>
                  <p className="text-sm">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 border-b border-[#3f3f46]/50 hover:bg-[#27272a] transition-colors cursor-pointer flex gap-3 ${!notif.read_at ? 'bg-[#7c3aed]/5' : ''}`}
                    >
                      <div className="mt-0.5">
                        <span className={`material-symbols-outlined text-[20px] ${!notif.read_at ? 'text-[#7c3aed]' : 'text-[#958da1]'}`}>
                          {notif.type === 'INVITATION' ? 'mail' : 'task_alt'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm ${!notif.read_at ? 'text-[#e2e2e2] font-semibold' : 'text-[#e2e2e2] font-medium'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-[#958da1] mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        
                        {notif.type === 'INVITATION' && !notif.read_at && (
                          <div className="flex gap-2 mt-3">
                            <button className="px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-medium rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); alert('Invitación Aceptada'); markAsRead(notif.id); }}>
                              Aceptar
                            </button>
                            <button className="px-3 py-1.5 bg-[#3f3f46] hover:bg-[#52525b] text-[#e2e2e2] text-xs font-medium rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}>
                              Rechazar
                            </button>
                          </div>
                        )}
                        
                        <span className="text-[10px] text-[#958da1] opacity-60 block mt-2">
                          {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                      {!notif.read_at && (
                        <div className="w-2 h-2 bg-[#7c3aed] rounded-full mt-1.5"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
