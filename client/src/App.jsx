import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
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
          <div className="brand" style={{marginBottom:12}}><div className="brand-badge">CS</div><span>ClimaScore</span></div>
          <div className="auth-title">Welcome back</div>
          <div className="auth-sub">ClimaScore is an AI-powered platform that serves farmers and lenders with actionable climate intelligence.</div>
          <ul className="hero-points" aria-label="Platform benefits">
            <li><span className="dot" aria-hidden="true"></span><span><strong>For Farmers</strong>: Track field risk, get localized advisories, and unlock financing when you need it.</span></li>
            <li><span className="dot" aria-hidden="true"></span><span><strong>For Lenders</strong>: Assess loan risk with transparent climate scores and portfolio insights.</span></li>
          </ul>
          <span className="hero-caption">Secure. Transparent. Built for agriculture.</span>
          <div className="cta mobile-only">
            <button className="btn btn-primary" onClick={()=>setShowForm(true)}>Sign in</button>
            <Link to="/register" className="btn btn-secondary">Create account</Link>
          </div>
        </div>
      </section>
      <section className={`auth-card ${!showForm ? 'auth-section-hidden' : ''}`}>
        <div className="auth-panel">
          <h2 style={{marginBottom:12}}>Sign in</h2>
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
                  <button type="button" className="password-toggle" onClick={()=>setShowPassword(v=>!v)}>{showPassword?'Hide':'Show'}</button>
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
          <div className="brand" style={{marginBottom:12}}><div className="brand-badge">CS</div><span>ClimaScore</span></div>
          <div className="auth-title">Create your account</div>
          <div className="auth-sub">Join ClimaScore to put AI-driven climate intelligence to work.</div>
          <ul className="hero-points" aria-label="Platform benefits">
            <li><span className="dot" aria-hidden="true"></span><span><strong>For Farmers</strong>: Personalized advisories, field monitoring, and financing access.</span></li>
            <li><span className="dot" aria-hidden="true"></span><span><strong>For Lenders</strong>: Objective climate scoring and portfolio risk visibility.</span></li>
          </ul>
          <span className="hero-caption">Built for resilience. Powered by data.</span>
          <div className="cta mobile-only">
            <button className="btn btn-primary" onClick={()=>setShowForm(true)}>Get started</button>
            <Link to="/login" className="btn btn-secondary">Sign in</Link>
          </div>
        </div>
      </section>
      <section className={`auth-card ${!showForm ? 'auth-section-hidden' : ''}`}>
        <div className="auth-panel">
          <h2 style={{marginBottom:12}}>Sign up</h2>
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
                  <input type={showPassword? 'text':'password'} placeholder="Create a strong password" value={form.password} onChange={e=>setField('password', e.target.value)} aria-invalid={!!fieldErrors.password} />
                  <button type="button" className="password-toggle" onClick={()=>setShowPassword(v=>!v)}>{showPassword?'Hide':'Show'}</button>
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

function Sidebar({ items, title }) {
  const { user, logout } = useAuth()
  return (
    <aside className="sidebar">
      {title && <div className="brand" style={{marginBottom:8}}><div className="brand-badge">CS</div> <span>{title}</span></div>}
      <nav className="nav">
        {items.map(i => (
          <NavLink key={i.to} to={i.to} className={({isActive})=> (isActive ? 'active' : '')}>
            {i.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        {user && (
          <>
            <div className="sidebar-user">
              <div className="user-name">{user.firstName} {user.lastName}</div>
              <div className="user-role">{user.role}</div>
            </div>
            <button className="btn btn-logout" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </aside>
  )
}

function FarmerLayout() {
  const items = [
    { to: '/dashboard/farmer/home', label: 'Home / Field Overview' },
    { to: '/dashboard/farmer/fields', label: 'My Fields & Crops' },
    { to: '/dashboard/farmer/financing', label: 'Financing Center' },
    { to: '/dashboard/farmer/advisory', label: 'Advisory Feed' },
    { to: '/dashboard/farmer/resources', label: 'Resources & Learning' },
  ]
  return (
    <div>
      <Sidebar items={items} title="Grow Portal" />
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

function LenderLayout() {
  const items = [
    { to: '/dashboard/lender/overview', label: 'Executive Overview' },
    { to: '/dashboard/lender/queue', label: 'Loan Application Queue' },
    { to: '/dashboard/lender/application', label: 'Application Detail' },
    { to: '/dashboard/lender/portfolio', label: 'Portfolio Management' },
    { to: '/dashboard/lender/admin', label: 'Admin & Reporting' },
  ]
  return (
    <div>
      <Sidebar items={items} title="Risk Console" />
      <main className="content">
        <Outlet />
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
  if (isAuth) return null
  return <NavBar />
}

function RoleRouter() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'lender' ? '/dashboard/lender' : '/dashboard/farmer'} replace />
}

export default App
