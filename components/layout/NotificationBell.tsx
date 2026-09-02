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
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();

    let channel: any = null;

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channelName = `notifications-${user.id}`;
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newNotif = payload.new as Notification;
              setNotifications((prev) => {
                if (prev.some((n) => n.id === newNotif.id)) return prev;
                return [newNotif, ...prev];
              });
              setUnreadCount((prev) => prev + 1);
              try {
                new Audio("/sounds/bell.mp3").play().catch(() => {});
              } catch (e) {}
            } else if (payload.eventType === "UPDATE") {
              const updated = payload.new as Notification;
              setNotifications((prev) => {
                const nextList = prev.map((n) => (n.id === updated.id ? updated : n));
                setUnreadCount(nextList.filter((n) => !n.read_at).length);
                return nextList;
              });
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
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
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  const handleAcceptInvitation = async (e: React.MouseEvent, notif: Notification) => {
    e.stopPropagation();
    const token = notif.action_data?.token || (notif.action_url?.startsWith("/invitaciones/") ? notif.action_url.replace("/invitaciones/", "") : null);
    
    if (!token) {
      alert("No se encontró el token de la invitación.");
      return;
    }

    setActionLoadingId(notif.id);
    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al aceptar la invitación");
      }

      await markAsRead(notif.id);
      setFeedbackMessage("¡Te has unido exitosamente!");
      setTimeout(() => setFeedbackMessage(null), 3500);

      // Redirigir o refrescar contexto para cargar la organización
      window.location.href = "/dashboard";
    } catch (err: any) {
      alert(err.message || "Error al procesar la invitación");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectInvitation = async (e: React.MouseEvent, notif: Notification) => {
    e.stopPropagation();
    const token = notif.action_data?.token || (notif.action_url?.startsWith("/invitaciones/") ? notif.action_url.replace("/invitaciones/", "") : null);

    setActionLoadingId(notif.id);
    try {
      if (token) {
        await fetch("/api/invitations/reject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      }
      await markAsRead(notif.id);
      setFeedbackMessage("Invitación rechazada");
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err: any) {
      console.error("Error al rechazar invitación:", err);
      await markAsRead(notif.id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.read_at) {
      markAsRead(notif.id);
    }

    setIsOpen(false);

    if (notif.type === "INVITATION") {
      const targetUrl = notif.action_url || (notif.action_data?.token ? `/invitaciones/${notif.action_data.token}` : null);
      if (targetUrl) {
        router.push(targetUrl);
      }
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
        aria-label="Notificaciones"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0c0f0f]"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 top-full w-80 md:w-96 bg-[#18181b] border border-[#3f3f46] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px]">
            <div className="p-4 border-b border-[#3f3f46] flex justify-between items-center bg-[#1a1c1c]">
              <h3 className="text-sm font-semibold text-[#e2e2e2]">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-[#7c3aed]/20 text-[#d2bbff] px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} {unreadCount === 1 ? "nueva" : "nuevas"}
                </span>
              )}
            </div>

            {feedbackMessage && (
              <div className="bg-[#7c3aed]/20 border-b border-[#7c3aed]/30 px-4 py-2 text-xs text-[#d2bbff] text-center font-medium">
                {feedbackMessage}
              </div>
            )}

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-[#958da1]">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_paused</span>
                  <p className="text-sm">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-[#3f3f46]/30">
                  {notifications.map((notif) => {
                    const isInvite = notif.type === "INVITATION";
                    const isUnread = !notif.read_at;
                    const isLoading = actionLoadingId === notif.id;

                    return (
                      <div 
                        key={notif.id} 
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 hover:bg-[#27272a] transition-colors cursor-pointer flex gap-3 ${isUnread ? "bg-[#7c3aed]/5" : ""}`}
                      >
                        <div className="mt-0.5">
                          <span className={`material-symbols-outlined text-[20px] ${isUnread ? "text-[#7c3aed]" : "text-[#958da1]"}`}>
                            {isInvite ? "mail" : "task_alt"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm ${isUnread ? "text-[#e2e2e2] font-semibold" : "text-[#d4d4d8] font-medium"}`}>
                            {notif.title}
                          </h4>
                          <p className="text-xs text-[#958da1] mt-1 leading-relaxed break-words">
                            {notif.message}
                          </p>
                          
                          {isInvite && isUnread && (
                            <div className="flex gap-2 mt-3">
                              <button 
                                disabled={isLoading}
                                className="px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50 flex items-center justify-center min-w-[65px]" 
                                onClick={(e) => handleAcceptInvitation(e, notif)}
                              >
                                {isLoading ? (
                                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                  "Aceptar"
                                )}
                              </button>
                              <button 
                                disabled={isLoading}
                                className="px-3 py-1.5 bg-[#3f3f46] hover:bg-[#52525b] text-[#e2e2e2] text-xs font-medium rounded-md transition-colors disabled:opacity-50" 
                                onClick={(e) => handleRejectInvitation(e, notif)}
                              >
                                Rechazar
                              </button>
                            </div>
                          )}
                          
                          <span className="text-[10px] text-[#958da1] opacity-60 block mt-2">
                            {new Date(notif.created_at).toLocaleString("es-CO")}
                          </span>
                        </div>
                        {isUnread && (
                          <div className="w-2 h-2 bg-[#7c3aed] rounded-full mt-1.5 shrink-0"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

