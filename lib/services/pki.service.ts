import forge from 'node-forge';

export class PKIService {
  /**
   * Lee un archivo .p12 desde un buffer, lo desencripta usando la contraseña
   * y retorna la llave privada (Private Key) en formato node-forge, así como
   * el certificado (para extraer datos como el serial).
   */
  static extractPrivateKeyFromP12(p12Buffer: ArrayBuffer, password: string) {
    // Convert ArrayBuffer to binary string
    const p12Der = forge.util.createBuffer(new Uint8Array(p12Buffer)).getBytes();
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    
    // Parse PKCS#12
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
    
    // Extraer llave y certificado
    let privateKey = null;
    let certificate = null;
    let serial = null;

    // Obtener los SafeBags
    for (const safeContents of p12.safeContents) {
      for (const safeBag of safeContents.safeBags) {
        if (safeBag.type === forge.pki.oids.keyBag || safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
          privateKey = safeBag.key;
        } else if (safeBag.type === forge.pki.oids.certBag) {
          certificate = safeBag.cert;
          // @ts-ignore
          serial = certificate.serialNumber;
        }
      }
    }

    if (!privateKey) {
      throw new Error("No se pudo extraer la llave privada del certificado .p12");
    }

    return { privateKey, certificate, serial };
  }

  /**
   * Toma el contenido (HTML o cualquier texto/binario), genera su Hash SHA-256
   * y lo firma digitalmente usando la Private Key extraída.
   */
  static signContent(content: string, privateKey: any) {
    // 1. Crear el Hash SHA-256
    const md = forge.md.sha256.create();
    md.update(content, 'utf8');
    const hashHex = md.digest().toHex();

    // 2. Firmar el Hash
    // @ts-ignore
    const signature = privateKey.sign(md);
    const signatureBase64 = forge.util.encode64(signature);

    return {
      contentHash: hashHex,
      signatureBase64
    };
  }
}
