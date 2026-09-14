import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Traer las ltimas 50 notificaciones del usuario
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ data: notifications }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/notifications]", error);
    return NextResponse.json({ error: "Error obteniendo notificaciones" }, { status: 500 });
  }
}
