
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getUsuarioInterno } from "@/lib/auth/rbac";
import { OrganizationsService } from "@/lib/services/organizations.service";
import { v4 as uuidv4 } from "uuid";
import forge from "node-forge";

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await params;
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const authId = sessionData.session?.user?.id;

    if (!authId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const org = await OrganizationsService.getOrgForUser(authId);
    const perfil = await getUsuarioInterno(authId);

    if (!org || org.id !== orgId || org.ownerId !== perfil?.id) {
      return NextResponse.json({ error: "Prohibido. Solo el propietario puede generar el certificado." }, { status: 403 });
    }

    // 1. Generar PKCS12 en memoria
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();
    
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 2); // 2 years valid
    
    const attrs = [{
      name: 'commonName',
      value: `${org.name} Auto-Generated Certificate`
    }, {
      name: 'organizationName',
      value: org.name
    }];
    
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(keys.privateKey);

    const generatedPassword = uuidv4().substring(0, 12);
    
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
      keys.privateKey, [cert], generatedPassword,
      { generateLocalKeyId: true, friendlyName: `${org.name}-cert` }
    );
    const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
    const buffer = Buffer.from(p12Der, 'binary');

    // 2. Upload to Supabase Storage
    const supabaseAdmin = createAdminClient();
    const fileName = `${orgId}/${uuidv4()}.p12`;

    const { error: storageError } = await supabaseAdmin.storage
      .from("certificates")
      .upload(fileName, buffer, {
        contentType: "application/x-pkcs12",
        upsert: false
      });

    if (storageError) {
      return NextResponse.json({ error: "Error guardando el certificado" }, { status: 500 });
    }

    // 3. Save to DB
    const { error: dbError } = await supabaseAdmin
      .from("organizations")
      .update({
        certificate_path: fileName,
        certificate_password: generatedPassword
      })
      .eq("id", orgId);

    if (dbError) {
      return NextResponse.json({ error: "Error actualizando DB" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Certificado generado con éxito" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

