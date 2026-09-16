import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { useEvents } from '../../lib/events'
import { Button, Field, Input, Meta } from '../../components/Primitives'

const steps = [
  'Create a project at supabase.com. Under Authentication → Providers → Email, turn off "Allow new users to sign up". Under Authentication → Users, add the admin user.',
  'Open the SQL editor, paste supabase/schema.sql from this repo and run it.',
  'Set VITE_SUPABASE_URL (https://<project-id>.supabase.co) and VITE_SUPABASE_PUBLISHABLE (the sb_publishable_ key, never the secret key) in .env.local and in the Vercel project\'s environment variables.',
  'Redeploy, open /admin, sign in and choose "Import built-in events".',
]

function NotConfigured() {
  return (
    <div className="card mx-auto max-w-2xl p-8">
      <h1 className="t-h2 text-ink">Admin is not set up yet</h1>
      <p className="mt-3 text-muted">
        The site is running on its built-in event list. To add and edit shows, connect a Supabase project:
      </p>
      <ol className="mt-6 space-y-4">
        {steps.map((s, i) => (
          <li key={s} className="flex gap-4 text-sm text-ink">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-blue-light text-xs font-semibold text-blue">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(undefined)
    const { error } = await supabase!.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError(error.message)
  }

  return (
    <form onSubmit={submit} className="card mx-auto max-w-sm space-y-4 p-8">
      <div>
        <h1 className="t-h3 text-ink">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">Use the account created in the Supabase dashboard.</p>
      </div>
      <Field label="Email" id="admin-email">
        <Input id="admin-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" id="admin-password">
        <Input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" loading={busy} className="w-full">
        Sign in
      </Button>
    </form>
  )
}

export default function AdminLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const { source, error } = useEvents()

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  return (
    <div className="wrap page-top pb-24">
      <Meta title="Admin" description="Manage shows on Dry Tickets." />
      {!supabase ? (
        <NotConfigured />
      ) : session === undefined ? (
        <div className="skeleton mx-auto h-64 max-w-sm rounded-xl" aria-hidden />
      ) : !session ? (
        <Login />
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
            <div>
              <span className="t-label text-blue">Admin</span>
              <h1 className="t-h2 mt-2 text-ink">
                <Link to="/admin" className="hover:text-blue">
                  Shows
                </Link>
              </h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <span className="hidden sm:inline">{session.user.email}</span>
              <Button variant="outline" size="sm" onClick={() => supabase!.auth.signOut()}>
                Sign out
              </Button>
            </div>
          </div>
          {source === 'seed' && (
            <p role="alert" className="mb-6 rounded-lg border border-warning/20 bg-warning-light px-4 py-3 text-sm text-warning">
              Showing the built-in list because Supabase could not be read{error ? `: ${error}` : ''}. Run supabase/schema.sql and check the env vars.
            </p>
          )}
          <Outlet />
        </>
      )}
    </div>
  )
}
