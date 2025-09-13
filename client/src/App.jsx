import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ClimaScoreLogo from './components/ClimaScoreLogo.jsx'
import ClimaPanel from './components/ClimaPanel.jsx'
import FarmerMap from './components/FarmerMap.jsx'
import FarmerFields from './components/FarmerFields.jsx'
import LenderConsole from './components/LenderConsole.jsx'
import FarmerHome from './pages/FarmerHome.jsx'
import FarmerFieldsPage from './pages/FarmerFieldsPage.jsx'
import FarmerFinancing from './pages/FarmerFinancing.jsx'
import FarmerAdvisory from './pages/FarmerAdvisory.jsx'
import FarmerResources from './pages/FarmerResources.jsx'
import LenderExecutive from './pages/LenderExecutive.jsx'
import LenderQueue from './pages/LenderQueue.jsx'
import LenderApplication from './pages/LenderApplication.jsx'
import LenderPortfolio from './pages/LenderPortfolio.jsx'
import LenderAdmin from './pages/LenderAdmin.jsx'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="container"><div className="card">Loading...</div></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function NavBar() {
  const { user } = useAuth()
  return (
    <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <div>
        <Link to="/" className="link">Home</Link>
        {user && <>
          <span style={{margin:'0 8px'}}>|</span>
          <Link to={user.role === 'lender' ? '/dashboard/lender' : '/dashboard/farmer'} className="link">Dashboard</Link>
        </>}
      </div>
      <div>
        {!user && (
          <>
            <Link to="/login" className="link">Login</Link>
            <span style={{margin:'0 8px'}}>|</span>
            <Link to="/register" className="link">Register</Link>
          </>
        )}
      </div>
    </div>
  )
}

function Home() {
  // This component is no longer used as a public landing; kept for reference.
  return null
}

function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showForm, setShowForm] = useState(true)

  // Responsive: on mobile start with hero first, hide the form until CTA tap
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setShowForm(!mq.matches ? true : false)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  function validate() {
    const errs = { email: '', password: '' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address'
    if (!password) errs.password = 'Password is required'
    setFieldErrors(errs)
    return !errs.email && !errs.password
  }
  async function onSubmit(e) {
    e.preventDefault()
    try { 
      setLoading(true); setError('');
      if (!validate()) return
      await login({ email, password })
      // navigate after login based on role
      const role = (user?.role) || 'farmer'
      navigate(role === 'lender' ? '/dashboard/lender' : '/dashboard/farmer', { replace: true })
    } catch(e) { 
      setError(e.message) 
    } finally { setLoading(false) }
  }
  useEffect(() => {
    if (user?.role) {
      navigate(user.role === 'lender' ? '/dashboard/lender' : '/dashboard/farmer', { replace: true })
    }
  }, [user, navigate])
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !!password
  return (
    <div className="auth-wrapper">
      <section className={`auth-hero ${showForm ? 'auth-section-hidden' : ''}`}>
        <div className="auth-hero-inner">
          <div style={{textAlign:'center'}}>
            <ClimaScoreLogo size={56} className="mb-3" />
            <div className="auth-title">Welcome back</div>
          </div>
          <div className="auth-sub">ClimaScore is an AI-powered platform that serves farmers and lenders with actionable climate intelligence.</div>
          <ul className="hero-points" aria-label="Platform benefits">
            <li>
              <span className="dot" aria-hidden="true"></span>
              <span><strong>For Farmers</strong>: Track field risk, get localized advisories, and unlock financing when you need it.</span>
            </li>
            
            <li>
              <span className="dot" aria-hidden="true"></span>
              <span>
                <strong>For Lenders</strong>: Assess loan risk with transparent climate scores and portfolio insights.
              </span>
            </li>
          </ul>

          <span className="hero-caption">Secure. Transparent. Built for agriculture.</span>
          <div className="cta">
            {!showForm && <button className="btn btn-primary" onClick={()=>setShowForm(true)}>Sign in</button>}
            <Link to="/register" className="btn btn-secondary">Create account</Link>
          </div>
        </div>
      </section>
      
      <section className={`auth-card ${!showForm ? 'auth-section-hidden' : ''}`}>
        <div className="auth-panel">
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:12}}>
            <ClimaScoreLogo size={40} />
            <h2 style={{margin:0}}>Sign in</h2>
          </div>
          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="row">
              <div className="col">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} aria-invalid={!!fieldErrors.email} />
                {fieldErrors.email && <div className="input-error">{fieldErrors.email}</div>}
              </div>
            </div>
            <div className="row">
              <div className="col">
                <label>Password</label>
                <div className="password-field">
                  <input type={showPassword? 'text':'password'} placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} aria-invalid={!!fieldErrors.password} />
                  <button type="button" className="password-toggle" aria-label={showPassword? 'Hide password':'Show password'} title={showPassword? 'Hide password':'Show password'} onClick={()=>setShowPassword(v=>!v)}>
                    {showPassword ? (
                      // Eye-off icon
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.02-2.78 2.98-5.02 5.5-6.41"/>
                        <path d="M1 1l22 22"/>
                        <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.66 11.66 0 0 1-2.17 3.19"/>
                      </svg>
                    ) : (
                      // Eye icon
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && <div className="input-error">{fieldErrors.password}</div>}
              </div>
            </div>
            {error && <div className="error">{error}</div>}
            <div className="form-actions">
              <button className={`btn btn-primary${loading ? ' loading' : ''}`} aria-busy={loading} disabled={!isValid || loading}>
                {loading ? 'Logging in' : 'Login'}{loading && <span className="spinner" />}
              </button>
            </div>
          </form>
          <div className="auth-footer">Don't have an account? <Link to="/register">Create one</Link></div>
        </div>
      </section>
    </div>
  )
}

function Register() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'', firstName:'', lastName:'', role:'farmer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ firstName:'', lastName:'', email:'', password:'' })
  const [showPassword, setShowPassword] = useState(false)
  const [showForm, setShowForm] = useState(true)
  function setField(k,v){ setForm(prev=>({ ...prev, [k]: v })) }
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setShowForm(!mq.matches ? true : false)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  function validate(){
    const errs = { firstName:'', lastName:'', email:'', password:'' }
    if (!form.firstName.trim()) errs.firstName = 'First name is required'
    if (!form.lastName.trim()) errs.lastName = 'Last name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address'
    if (form.password.length < 6) errs.password = 'Password should be at least 6 characters'
    setFieldErrors(errs)
    return !errs.firstName && !errs.lastName && !errs.email && !errs.password
  }
  async function onSubmit(e) { 
    e.preventDefault(); 
    try { 
      setLoading(true); setError('');
      if (!validate()) return
      await register(form) 
      const role = (user?.role) || form.role || 'farmer'
      navigate(role === 'lender' ? '/dashboard/lender' : '/dashboard/farmer', { replace: true })
    } catch(e){ 
      setError(e.message) 
    } finally { setLoading(false) } 
  }
  useEffect(() => {
    if (user?.role) {
      navigate(user.role === 'lender' ? '/dashboard/lender' : '/dashboard/farmer', { replace: true })
    }
  }, [user, navigate])
  const isValid = !!form.firstName.trim() && !!form.lastName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.password.length >= 6
  return (
    <div className="auth-wrapper">
      <section className={`auth-hero ${showForm ? 'auth-section-hidden' : ''}`}>
        <div className="auth-hero-inner">
          <div style={{textAlign:'center'}}>
            <ClimaScoreLogo size={96} className="mb-3" />
            <div className="auth-title">Create your account</div>
          </div>
          <div className="auth-sub">Join ClimaScore to put AI-driven climate intelligence to work.</div>
          <ul className="hero-points" aria-label="Platform benefits">
            <li><span className="dot" aria-hidden="true"></span><span><strong>For Farmers</strong>: Personalized advisories, field monitoring, and financing access.</span></li>
            <li><span className="dot" aria-hidden="true"></span><span><strong>For Lenders</strong>: Objective climate scoring and portfolio risk visibility.</span></li>
          </ul>
          <span className="hero-caption">Built for resilience. Powered by data.</span>
          <div className="cta">
            {!showForm && <button className="btn btn-primary" onClick={()=>setShowForm(true)}>Get started</button>}
            <Link to="/login" className="btn btn-secondary">Sign in</Link>
          </div>
        </div>
      </section>

      <section className={`auth-card ${!showForm ? 'auth-section-hidden' : ''}`}>
        <div className="auth-panel">
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:12}}>
            <ClimaScoreLogo size={48} />
            <h2 style={{margin:0}}>Sign up</h2>
          </div>
          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="row">
              <div className="col">
                <label>First Name</label>
                <input placeholder="Jane" value={form.firstName} onChange={e=>setField('firstName', e.target.value)} aria-invalid={!!fieldErrors.firstName} />
                {fieldErrors.firstName && <div className="input-error">{fieldErrors.firstName}</div>}
              </div>
              <div className="col">
                <label>Last Name</label>
                <input placeholder="Doe" value={form.lastName} onChange={e=>setField('lastName', e.target.value)} aria-invalid={!!fieldErrors.lastName} />
                {fieldErrors.lastName && <div className="input-error">{fieldErrors.lastName}</div>}
              </div>
            </div>
            <div className="row">
              <div className="col">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setField('email', e.target.value)} aria-invalid={!!fieldErrors.email} />
                {fieldErrors.email && <div className="input-error">{fieldErrors.email}</div>}
              </div>
              <div className="col">
                <label>Password</label>
                <div className="password-field">
                  <input type={showPassword? 'text':'password'} placeholder="Create password" value={form.password} onChange={e=>setField('password', e.target.value)} aria-invalid={!!fieldErrors.password} />
                  <button type="button" className="password-toggle" aria-label={showPassword? 'Hide password':'Show password'} title={showPassword? 'Hide password':'Show password'} onClick={()=>setShowPassword(v=>!v)}>
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.02-2.78 2.98-5.02 5.5-6.41"/>
                        <path d="M1 1l22 22"/>
                        <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.66 11.66 0 0 1-2.17 3.19"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && <div className="input-error">{fieldErrors.password}</div>}
              </div>
            </div>
            <div className="row"><div className="col"><label>Account Type</label><select value={form.role} onChange={e=>setField('role', e.target.value)}><option value="farmer">Farmer</option><option value="lender">Lender</option></select></div></div>
            {error && <div className="error">{error}</div>}
            <div className="form-actions">
              <button className={`btn btn-primary${loading ? ' loading' : ''}`} aria-busy={loading} disabled={!isValid || loading}>
                {loading ? 'Creating' : 'Create Account'}{loading && <span className="spinner" />}
              </button>
            </div>
          </form>
          <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
        </div>
      </section>
    </div>
  )
}

function Icon({ name, className }) {
  const props = { className: `w-5 h-5 ${className||''}`, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 }
  switch (name) {
    case 'home': return (<svg {...props} viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h5v-4h4v4h5v-9.5"/></svg>)
    case 'fields': return (<svg {...props} viewBox="0 0 24 24"><path d="M3 20h18"/><path d="M3 15l6-3 6 3 6-3"/><path d="M3 10l6-3 6 3 6-3"/></svg>)
    case 'finance': return (<svg {...props} viewBox="0 0 24 24"><path d="M4 20h16"/><rect x="6" y="10" width="12" height="6" rx="1"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>)
    case 'advisory': return (<svg {...props} viewBox="0 0 24 24"><path d="M4 5h16v11H7l-3 3z"/></svg>)
    case 'resources': return (<svg {...props} viewBox="0 0 24 24"><path d="M4 19.5V6a2 2 0 0 1 2-2h10l4 4v11.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M16 4v4h4"/></svg>)
    case 'overview': return (<svg {...props} viewBox="0 0 24 24"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>)
    case 'queue': return (<svg {...props} viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h6"/></svg>)
    case 'application': return (<svg {...props} viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>)
    case 'portfolio': return (<svg {...props} viewBox="0 0 24 24"><path d="M4 7h16v12H4z"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>)
    case 'admin': return (<svg {...props} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 3.3l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .69.41 1.3 1.02 1.58.62.29.98.92.98 1.61s-.36 1.32-.98 1.61A1.99 1.99 0 0 0 19.4 15z"/></svg>)
    default: return null
  }
}

function Sidebar({ items, collapsed, onToggle }) {
  const { user, logout } = useAuth()
  return (
    <aside className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] border-r border-slate-800 bg-slate-900/80 backdrop-blur z-200 transition-[width] duration-200 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-end'} px-3 py-2`}> 
        <button aria-label="Toggle sidebar" onClick={onToggle} className="ml-auto inline-flex items-center justify-center w-8 h-8 rounded border border-slate-700 text-slate-300 hover:bg-slate-800">
          {collapsed ? '›' : '‹'}
        </button>
      </div>
      <nav className="mt-2 px-1 space-y-1">
        {items.map(i => (
          <NavLink key={i.to} to={i.to} className={(nav)=> `group flex items-center ${collapsed ? 'justify-center gap-0 px-0' : 'gap-3 px-2'} py-2 rounded-md text-sm font-medium ${nav.isActive ? 'bg-blue-500/15 text-blue-200 border border-blue-500/30' : 'text-slate-300 hover:bg-slate-800/60'}`}>
            {({ isActive }) => (
              <>
                <Icon name={i.icon} className={`${isActive ? 'text-blue-300' : 'text-slate-300'} shrink-0`} />
                <span className={`${collapsed ? 'hidden' : 'block'}`}>{i.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-0 inset-x-0 p-3 border-t border-slate-800">
        {user && (
          <>
            {!collapsed && (
              <div className="mb-2">
                <div className="text-slate-200 text-sm font-semibold">{user.firstName} {user.lastName}</div>
                <div className="text-slate-400 text-xs capitalize">{user.role}</div>
              </div>
            )}
            <button onClick={logout} className="w-full text-left inline-flex items-center justify-center gap-2 text-rose-300 border border-rose-600/40 hover:bg-rose-900/30 px-3 py-2 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
              {!collapsed && <span>Logout</span>}
            </button>
          </>
        )}
      </div>
    </aside>
  )
}

function FarmerLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const items = [
    { to: '/dashboard/farmer/home', label: 'Home / Field Overview', icon: 'home' },
    { to: '/dashboard/farmer/fields', label: 'My Fields & Crops', icon: 'fields' },
    { to: '/dashboard/farmer/financing', label: 'Financing Center', icon: 'finance' },
    { to: '/dashboard/farmer/advisory', label: 'Advisory Feed', icon: 'advisory' },
    { to: '/dashboard/farmer/resources', label: 'Resources & Learning', icon: 'resources' },
  ]
  return (
    <div className="min-h-screen bg-[radial-gradient(600px_300px_at_10%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(600px_300px_at_120%_10%,rgba(34,197,94,0.12),transparent),linear-gradient(180deg,rgba(14,20,34,0.9),rgba(14,20,34,0.95))]">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-14 z-40 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <ClimaScoreLogo />
          <span>Grow Portal</span>
        </div>
      </header>
      {/* Sidebar */}
      <Sidebar items={items} title="Grow Portal" collapsed={collapsed} onToggle={()=>setCollapsed(v=>!v)} />
      {/* Main content */}
      <main className={`pt-14 ${collapsed ? 'ml-16' : ''}`}>
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function LenderLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const items = [
    { to: '/dashboard/lender/overview', label: 'Executive Overview', icon: 'overview' },
    { to: '/dashboard/lender/queue', label: 'Loan Application Queue', icon: 'queue' },
    { to: '/dashboard/lender/application', label: 'Application Detail', icon: 'application' },
    { to: '/dashboard/lender/portfolio', label: 'Portfolio Management', icon: 'portfolio' },
    { to: '/dashboard/lender/admin', label: 'Admin & Reporting', icon: 'admin' },
  ]
  return (
    <div className="min-h-screen bg-[radial-gradient(600px_300px_at_10%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(600px_300px_at_120%_10%,rgba(34,197,94,0.12),transparent),linear-gradient(180deg,rgba(14,20,34,0.9),rgba(14,20,34,0.95))]">
      <header className="fixed top-0 inset-x-0 h-14 z-40 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <ClimaScoreLogo />
          <span>Risk Console</span>
        </div>
      </header>
      <Sidebar items={items} title="Risk Console" collapsed={collapsed} onToggle={()=>setCollapsed(v=>!v)} />
      <main className={`pt-14 ${collapsed ? 'ml-16' : ''}`}>
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConditionalNavBar />
        <Routes>
          <Route path="/" element={<ProtectedRoute><RoleRouter /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/farmer" element={<ProtectedRoute roles={["farmer"]}><FarmerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<FarmerHome />} />
            <Route path="fields" element={<FarmerFieldsPage />} />
            <Route path="financing" element={<FarmerFinancing />} />
            <Route path="advisory" element={<FarmerAdvisory />} />
            <Route path="resources" element={<FarmerResources />} />
          </Route>
          <Route path="/dashboard/lender" element={<ProtectedRoute roles={["lender"]}><LenderLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<LenderExecutive />} />
            <Route path="queue" element={<LenderQueue />} />
            <Route path="application" element={<LenderApplication />} />
            <Route path="portfolio" element={<LenderPortfolio />} />
            <Route path="admin" element={<LenderAdmin />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

function ConditionalNavBar() {
  const location = useLocation()
  const isAuth = location.pathname === '/login' || location.pathname === '/register'
  const isDash = location.pathname.startsWith('/dashboard')
  if (isAuth || isDash) return null
  return <NavBar />
}

function RoleRouter() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'lender' ? '/dashboard/lender' : '/dashboard/farmer'} replace />
}

export default App
