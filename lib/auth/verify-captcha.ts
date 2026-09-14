// lib/auth/verify-captcha.ts
// Verificación server-side del token de Google reCAPTCHA v2

interface SiteVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

import fetchNode from "node-fetch";
import https from "https";

export async function verifyCaptchaToken(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    return false;
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  try {
    const agent = new https.Agent({ family: 4 });
    const res = await fetchNode("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      agent,
    });

    if (!res.ok) {
      return false;
    }

    const data = (await res.json()) as SiteVerifyResponse;
    return data.success === true;
  } catch {
    return false;
  }
}
