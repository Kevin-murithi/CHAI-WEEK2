import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ClimaScoreLogo from '../components/ClimaScoreLogo.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { SparklesIcon, BanknotesIcon, BuildingStorefrontIcon } from '@heroicons/react/24/solid'

export default function AuthLanding() {
  const navigate = useNavigate()
  const roles = [
    {
      key: 'farmer',
      title: 'Farmers',
      icon: SparklesIcon,
      iconClass: 'text-sky-300',
      description: 'Track field risk, get AI advisories, access financing',
      bullets: [
        'Field risk with ClimaScore',
        'Personalized advisories',
        'Manage applications',
      ],
    },
    {
      key: 'lender',
      title: 'Lenders',
      icon: BanknotesIcon,
      iconClass: 'text-amber-300',
      description: 'Transparent climate scoring and portfolio risk',
      bullets: [
        'Risk console',
        'Application screening',
        'Portfolio monitoring',
      ],
    },
    {
      key: 'cold',
      title: 'Cold Storage',
      icon: BuildingStorefrontIcon,
      iconClass: 'text-violet-300',
      description: 'Facilities, monitoring and alerts',
      bullets: [
        'Facility & location tracking',
        'Temperature & humidity',
        'Utilization and alerts',
      ],
    },
  ]
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(900px_400px_at_-10%_-10%,rgba(56,189,248,0.12),transparent),radial-gradient(900px_400px_at_110%_0%,rgba(34,197,94,0.10),transparent),linear-gradient(180deg,rgba(14,20,34,0.9),rgba(14,20,34,0.95))] flex items-center justify-center p-4">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 size-[360px] rounded-full bg-sky-500/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-[320px] rounded-full bg-emerald-500/10 blur-3xl animate-pulse [animation-duration:5s]" />

      <div className="relative w-full max-w-6xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-slate-200 font-semibold mb-8">
            <ClimaScoreLogo size={52} />
            <span className="font-bold text-2xl sm:text-3xl">ClimaScore</span>
          </div>
          <h1 className="text-xl sm:text-2xl text-slate-300 font-semibold tracking-tight">
            AI-powered climate intelligence for agriculture
          </h1>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            Built for Farmers, Lenders and Cold Storage Operators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map(({ key, title, icon: IconComp, iconClass, description, bullets }) => (
            <Card key={key} className="border border-slate-800 bg-slate-900/80 hover:bg-slate-900/70 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-200">
                  {React.createElement(IconComp, { className: `w-10 h-10 ${iconClass}` })}
                  <span className="text-xl font-semibold">{title}</span>
                </CardTitle>
                <CardDescription className="text-slate-300">{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-slate-300 list-disc list-inside text-sm space-y-1">
                  {bullets.map((b, idx) => (
                    <li key={`${key}-b-${idx}`}>{b}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate('/register')} className="mx-auto w-[90%] bg-blue-400 text-gray-100 hover:bg-blue-600">Get Started</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 text-slate-300">
          <span className="mr-2">Already have an account?</span>
          <Button asChild variant="outline" className="">
            <Link to="/signin" className="text-gray-700">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
