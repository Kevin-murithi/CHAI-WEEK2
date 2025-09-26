import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ClimaScoreLogo from '../components/ClimaScoreLogo.jsx'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EyeIcon, EyeSlashIcon, ArrowRightIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/solid'

export default function SignIn() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !!password

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!isValid) return
    try {
      setLoading(true)
      await login({ email, password })
      const role = (user?.role) || 'farmer'
      const dest = role === 'lender' ? '/dashboard/lender' : role === 'cold_storage_owner' ? '/dashboard/cold-storage' : '/dashboard/farmer'
      navigate(dest, { replace: true })
    } catch (e) {
      setError(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(900px_400px_at_-10%_-10%,rgba(56,189,248,0.12),transparent),radial-gradient(900px_400px_at_110%_0%,rgba(34,197,94,0.10),transparent),linear-gradient(180deg,rgba(14,20,34,0.9),rgba(14,20,34,0.95))] flex items-center justify-center p-4">
      <div className="pointer-events-none absolute -top-24 -left-24 size-[360px] rounded-full bg-sky-500/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-[320px] rounded-full bg-emerald-500/10 blur-3xl animate-pulse [animation-duration:5s]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-slate-200 font-semibold">
            <ClimaScoreLogo />
            <span>ClimaScore</span>
          </div>
          <h2 className="mt-3 text-xl text-slate-100 font-semibold">Sign in</h2>
          <p className="text-slate-400 text-sm">Access your dashboard</p>
        </div>

        <Card className="border border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-slate-200">Welcome back</CardTitle>
            <CardDescription className="text-slate-300">Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <div className="relative">
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} className="pl-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword? 'text':'password'} placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} className="pl-8 pr-10" />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors" onClick={()=>setShowPassword(v=>!v)} aria-label="Toggle password">
                    {showPassword ? <EyeSlashIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                  </button>
                </div>
              </div>
              {error && <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">{error}</div>}
              <div className="flex items-center justify-end">
                <Button type="submit" disabled={!isValid || loading} className="group">
                  {loading ? 'Logging in' : 'Login'}
                  <ArrowRightIcon className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform"/>
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-sm text-slate-300">
            Don't have an account?
            <Button asChild variant="link" className="ml-1 p-0 h-auto text-slate-200">
              <Link to="/register">Create one</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
