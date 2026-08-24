import { createClient } from "@/lib/supabase/server";
import { InvitationsService } from "@/lib/services/invitations.service";
import InvitationClient from "./invitation-client";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Aceptar Invitación | BackRoom",
  description: "Únete a una organización en BackRoom",
};

export default async function InvitationPage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    // Attempt to get the public info for this invitation
    const invitationInfo = await InvitationsService.getInvitationInfo(params.token);

    return (
      <InvitationClient
        token={params.token}
        email={invitationInfo.email}
        role={invitationInfo.role}
        organization={invitationInfo.organization as { name: string; logo_url: string | null }}
        currentUserEmail={user?.email}
      />
    );
  } catch (error: any) {
    // Si la invitación no existe, expiró o ya fue aceptada
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-destructive/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl">Invitación no válida</CardTitle>
            <CardDescription className="mt-2 text-base">
              {error.message || "La invitación a la que intentas acceder no existe o ha expirado."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground pb-6">
            Si crees que esto es un error, pídele al administrador de la organización que te envíe una nueva invitación.
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardFooter>
        </Card>
      </Card>
    );
  }
}
