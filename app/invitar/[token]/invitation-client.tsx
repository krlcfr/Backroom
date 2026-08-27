"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, ArrowRight, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface InvitationClientProps {
  token: string;
  email: string;
  role: string;
  organization: {
    name: string;
    logo_url: string | null;
  };
  currentUserEmail?: string;
}

export default function InvitationClient({
  token,
  email,
  role,
  organization,
  currentUserEmail,
}: InvitationClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isEmailMismatch = currentUserEmail && currentUserEmail.toLowerCase() !== email.toLowerCase();

  const handleAccept = async () => {
    setIsLoading(true);
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

      toast.success("¡Bienvenido a " + organization.name + "!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Algo salió mal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Refresh page to show login/register options
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          {organization.logo_url ? (
            <div className="mx-auto h-16 w-16 overflow-hidden rounded-md border bg-muted mb-4">
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md border bg-muted mb-4">
              <span className="text-2xl font-bold">{organization.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <CardTitle className="text-2xl">Has sido invitado</CardTitle>
          <CardDescription className="text-base mt-2">
            Únete a la organización <strong className="text-foreground">{organization.name}</strong> como {role === 'admin' ? 'Administrador' : 'Miembro'}.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {!currentUserEmail ? (
            <div className="text-sm text-muted-foreground text-center bg-muted/50 p-4 rounded-lg">
              <p>Esta invitación fue enviada a <strong>{email}</strong>.</p>
              <p className="mt-2">Inicia sesión o crea una cuenta con este correo para aceptar.</p>
            </div>
          ) : isEmailMismatch ? (
            <div className="text-sm text-destructive text-center bg-destructive/10 p-4 rounded-lg border border-destructive/20">
              <p>Has iniciado sesión como <strong>{currentUserEmail}</strong>, pero esta invitación es para <strong>{email}</strong>.</p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center bg-muted/50 p-4 rounded-lg">
              Estás conectado como <strong>{currentUserEmail}</strong>.
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {!currentUserEmail ? (
            <>
              <Button 
                className="w-full" 
                onClick={() => router.push(`/login?invite=${token}`)}
              >
                Iniciar sesión para aceptar
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/registro?invite=${token}`)}
              >
                Crear cuenta
              </Button>
            </>
          ) : isEmailMismatch ? (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión y cambiar cuenta
            </Button>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleAccept} 
              disabled={isLoading}
            >
              {isLoading ? "Aceptando..." : "Aceptar Invitación"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
