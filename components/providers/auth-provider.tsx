"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserProfile {
  id: string;
  username: string;
  nombre_completo: string;
  correo: string;
  es_superadmin: boolean;
  activo: boolean;
  created_at: string;
  avatar_url: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  refreshSession: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
        if (res.status !== 401) {
          console.error("Error al obtener sesión:", await res.text());
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error desconocido"));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    // Requisito SENA #6: Validador de todas las ventanas
    // Escuchar el evento de 'storage' permite reaccionar si el usuario cierra sesión o entra en otra pestaña
    const handleStorageChange = (e: StorageEvent) => {
      // Usamos una clave 'auth_sync' para emitir eventos de sincronización si es necesario,
      // porque los cambios directos a HttpOnly cookies no disparan eventos de storage.
      if (e.key === "auth_sync") {
        fetchSession();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, refreshSession: fetchSession }}>
      {children}
    </AuthContext.Provider>
  );
}
