import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ClimaScoreLogo from '../components/ClimaScoreLogo.jsx'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserIcon, EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/solid'

export default function Register() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'', firstName:'', lastName:'', role:'farmer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function setField(k,v){ setForm(prev=>({ ...prev, [k]: v })) }
  const isValid = !!form.firstName.trim() && !!form.lastName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.password.length >= 6

  async function onSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    try {
      setLoading(true); setError('')
      await register(form)
      const role = (user?.role) || form.role || 'farmer'
      const dest = role === 'lender' ? '/dashboard/lender' : role === 'cold_storage_owner' ? '/dashboard/cold-storage' : '/dashboard/farmer'
      navigate(dest, { replace: true })
    } catch (e) {
      setError(e.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(900px_400px_at_-10%_-10%,rgba(56,189,248,0.12),transparent),radial-gradient(900px_400px_at_110%_0%,rgba(34,197,94,0.10),transparent),linear-gradient(180deg,rgba(14,20,34,0.9),rgba(14,20,34,0.95))] flex items-center justify-center p-4">
      <div className="pointer-events-none absolute -top-24 -left-24 size-[360px] rounded-full bg-sky-500/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-[320px] rounded-full bg-emerald-500/10 blur-3xl animate-pulse [animation-duration:5s]" />

      <div className="relative w-full max-w-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-slate-200 font-semibold">
            <ClimaScoreLogo />
            <span>ClimaScore</span>
          </div>
          <h2 className="mt-3 text-xl text-slate-100 font-semibold">Create your account</h2>
          <p className="text-slate-400 text-sm">Join ClimaScore and unlock AI-driven insights</p>
        </div>

        <Card className="border border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-slate-200">Sign up</CardTitle>
            <CardDescription className="text-slate-300">Fill in the details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-200">First Name</Label>
                <div className="relative">
                  <Input id="firstName" placeholder="Jane" value={form.firstName} onChange={e=>setField('firstName', e.target.value)} className="pl-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-200">Last Name</Label>
                <div className="relative">
                  <Input id="lastName" placeholder="Doe" value={form.lastName} onChange={e=>setField('lastName', e.target.value)} className="pl-8" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <div className="relative">
                  <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setField('email', e.target.value)} className="pl-8" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword? 'text':'password'} placeholder="Create password" value={form.password} onChange={e=>setField('password', e.target.value)} className="pl-8 pr-10" />
                  <button type="button" className="text-slate-300 hover:text-slate-100 absolute right-2 top-1/2 -translate-y-1/2 text-xs underline decoration-dotted" onClick={()=>setShowPassword(v=>!v)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="role" className="text-slate-200">Account Type</Label>
                <select id="role" value={form.role} onChange={e=>setField('role', e.target.value)} className="h-9 w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 text-sm text-slate-200 focus-visible:border-sky-500 focus-visible:ring-sky-500/30 focus-visible:ring-[3px] outline-none">
                  <option value="farmer">Farmer</option>
                  <option value="lender">Lender</option>
                  <option value="cold_storage_owner">Cold Storage Owner</option>
                </select>
              </div>

              {error && <div className="md:col-span-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">{error}</div>}
              <div className="md:col-span-2 flex items-center justify-end">
                <Button type="submit" disabled={!isValid || loading} className="group">
                  {loading ? 'Creating' : 'Create Account'}
                  <ArrowRightIcon className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform"/>
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-sm text-slate-300">
            Already have an account?
            <Button asChild variant="link" className="ml-1 p-0 h-auto text-slate-200">
              <Link to="/signin">Sign in</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
