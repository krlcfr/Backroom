import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isAuthRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/registro') || url.pathname.startsWith('/recuperar')
  const isProtectedRoute = url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/demo/backroom') || url.pathname.startsWith('/demo/limites')

  // Si no hay usuario y es una ruta protegida, redirigir a login
  if (!user && isProtectedRoute) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si hay usuario, necesitamos saber su rol y si tiene un backroom para el redireccionamiento correcto post-login o si intenta acceder a rutas de auth
  if (user) {
    if (isAuthRoute) {
      // Obtener el perfil para saber a dónde mandarlo
      const { data: profile } = await supabase.from('usuarios').select('id, es_superadmin').eq('auth_id', user.id).single()
      
      if (profile?.es_superadmin) {
        url.pathname = '/admin'
        url.search = ''
        return NextResponse.redirect(url)
      }

      // Si el usuario tiene organización, mandarlo al dashboard org (RLS restringe al owner/miembro activo)
      const { data: org } = await supabase.from('organizations').select('id').limit(1).maybeSingle()

      if (org) {
        url.pathname = '/dashboard'
        url.search = ''
        return NextResponse.redirect(url)
      }

      const { data: member } = await supabase.from('backroom_miembros').select('backroom_id').eq('usuario_id', profile?.id).limit(1).maybeSingle()
      const { data: owner } = await supabase.from('backrooms').select('id').eq('propietario_id', profile?.id).limit(1).maybeSingle()

      if (member || owner) {
        url.pathname = '/dashboard'
      } else {
        url.pathname = '/demo/backroom'
      }
      url.search = ''
      return NextResponse.redirect(url)
    }

    // Proteger /admin solo para superadmins
    if (url.pathname.startsWith('/admin')) {
      const { data: profile } = await supabase.from('usuarios').select('es_superadmin').eq('auth_id', user.id).single()
      if (!profile?.es_superadmin) {
        url.pathname = '/dashboard' // o /forbidden
        url.search = ''
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
