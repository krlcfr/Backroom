"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"

const SCRIPT_URL = "https://www.google.com/recaptcha/api.js?render=explicit"

type RecaptchaWindow = Window & {
  grecaptcha?: {
    ready: (cb: () => void) => void
    render: (el: string | HTMLElement, opts: Record<string, unknown>) => number
    reset: (widgetId?: number) => void
  }
}

export interface CaptchaWidgetHandle {
  reset: () => void
}

interface CaptchaWidgetProps {
  onChange: (token: string | null) => void
}

export default forwardRef<CaptchaWidgetHandle, CaptchaWidgetProps>(function CaptchaWidget(
  { onChange },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    if (!siteKey) return

    const renderWidget = () => {
      const grecaptcha = (window as RecaptchaWindow).grecaptcha
      if (!grecaptcha || !containerRef.current || widgetIdRef.current !== null) return
      widgetIdRef.current = grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => onChange(token),
        "expired-callback": () => onChange(null),
        "error-callback": () => onChange(null),
      })
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-recaptcha]")

    if (existing) {
      if ((window as RecaptchaWindow).grecaptcha) {
        renderWidget()
      } else {
        existing.addEventListener("load", renderWidget)
      }
      return
    }

    const script = document.createElement("script")
    script.src = SCRIPT_URL
    script.async = true
    script.defer = true
    script.dataset.recaptcha = "true"
    script.addEventListener("load", renderWidget)
    document.head.appendChild(script)
  }, [onChange])

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        const grecaptcha = (window as RecaptchaWindow).grecaptcha
        if (grecaptcha && widgetIdRef.current !== null) {
          grecaptcha.reset(widgetIdRef.current)
        }
        onChange(null)
      },
    }),
    [onChange]
  )

  return (
    <div className="mb-2 flex items-center justify-center rounded-lg border border-[#4a4455]/50 bg-[#121414]/50 p-3">
      {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
        <div ref={containerRef} />
      ) : (
        <p className="text-[11px] text-[#ccc3d8]/60">reCAPTCHA no configurado</p>
      )}
    </div>
  )
})
