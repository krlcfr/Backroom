"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"

const SCRIPT_URL = "https://www.google.com/recaptcha/api.js?render=explicit"

type RecaptchaWindow = Window & {
  grecaptcha?: {
    render: (el: string | HTMLElement, opts: Record<string, unknown>) => number
    execute: (widgetId?: number, opts?: Record<string, unknown>) => Promise<unknown>
    reset: (widgetId?: number) => void
  }
}

export interface CaptchaWidgetHandle {
  execute: () => Promise<string | null>
  reset: () => void
}

interface CaptchaWidgetProps {
  onChange: (token: string | null) => void
}

const EXECUTE_TIMEOUT_MS = 20000

export default forwardRef<CaptchaWidgetHandle, CaptchaWidgetProps>(function CaptchaWidget(
  { onChange },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const pendingRef = useRef<{
    resolve: (token: string | null) => void
    reject: (err: Error) => void
    timer: ReturnType<typeof setTimeout> | null
  } | null>(null)

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    if (!siteKey) return

    let disposed = false

    const handleToken = (token: string | null) => {
      onChangeRef.current(token)
      const pending = pendingRef.current
      if (!pending) return
      pendingRef.current = null
      if (pending.timer) clearTimeout(pending.timer)
      if (token) {
        pending.resolve(token)
      } else {
        pending.reject(new Error("captcha_failed"))
      }
    }

    const renderWidget = () => {
      if (disposed || widgetIdRef.current !== null) return
      const grecaptcha = (window as RecaptchaWindow).grecaptcha
      if (!grecaptcha || typeof grecaptcha.render !== "function") {
        setTimeout(renderWidget, 250)
        return
      }
      if (!containerRef.current) return
      widgetIdRef.current = grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => handleToken(token),
        "expired-callback": () => handleToken(null),
        "error-callback": () => handleToken(null),
      })
    }

    const existing = document.querySelector<HTMLScriptElement>("script[data-recaptcha]")
    if (existing) {
      renderWidget()
    } else {
      const script = document.createElement("script")
      script.src = SCRIPT_URL
      script.async = true
      script.defer = true
      script.dataset.recaptcha = "true"
      script.addEventListener("load", renderWidget)
      document.head.appendChild(script)
    }

    return () => {
      disposed = true
    }
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      execute: () =>
        new Promise<string | null>((resolve, reject) => {
          const grecaptcha = (window as RecaptchaWindow).grecaptcha
          if (!grecaptcha || widgetIdRef.current === null) {
            resolve(null)
            return
          }

          if (pendingRef.current) {
            const prev = pendingRef.current
            pendingRef.current = null
            if (prev.timer) clearTimeout(prev.timer)
            prev.reject(new Error("captcha_overlap"))
          }

          const timer = setTimeout(() => {
            pendingRef.current = null
            reject(new Error("captcha_timeout"))
          }, EXECUTE_TIMEOUT_MS)

          pendingRef.current = { resolve, reject, timer }

          try {
            grecaptcha.execute(widgetIdRef.current)
          } catch (err) {
            pendingRef.current = null
            clearTimeout(timer)
            reject(err instanceof Error ? err : new Error("captcha_execute_failed"))
          }
        }),
      reset: () => {
        const grecaptcha = (window as RecaptchaWindow).grecaptcha
        if (grecaptcha && widgetIdRef.current !== null) {
          grecaptcha.reset(widgetIdRef.current)
        }
        const pending = pendingRef.current
        if (pending) {
          pendingRef.current = null
          if (pending.timer) clearTimeout(pending.timer)
          pending.reject(new Error("captcha_reset"))
        }
        onChangeRef.current(null)
      },
    }),
    []
  )

  if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    return (
      <div className="mb-2 flex items-center justify-center rounded-lg border border-[#4a4455]/50 bg-[#121414]/50 p-3">
        <p className="text-[11px] text-[#ccc3d8]/60">reCAPTCHA no configurado</p>
      </div>
    )
  }

  return (
    <div className="mb-2 flex items-center justify-center rounded-lg border border-[#4a4455]/50 bg-[#121414]/50 p-3">
      <div ref={containerRef} />
    </div>
  )
})
