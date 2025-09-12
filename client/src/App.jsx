import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ClimaPanel from './components/ClimaPanel.jsx'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="container"><div className="card">Loading...</div></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function NavBar() {
  const { user, logout } = useAuth()
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
        {user ? (
          <>
            <span className="badge" style={{marginRight:8}}>{user.firstName} {user.lastName} ({user.role})</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
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
  const [loading, setLoading] = useState(false)
  async function onSubmit(e) {
    e.preventDefault()
    try { 
      setLoading(true); setError(''); 
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
  return (
    <div className="container">
      <h1>Login</h1>
      <form className="card form" onSubmit={onSubmit}>
        <div className="row"><div className="col"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div></div>
        <div className="row"><div className="col"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div></div>
        {error && <div className="error">{error}</div>}
        <div className="row"><div className="col end"><button disabled={loading}>{loading?'Logging in...':'Login'}</button></div></div>
      </form>
    </div>
  )
}

function Register() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'', firstName:'', lastName:'', role:'farmer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  function setField(k,v){ setForm(prev=>({ ...prev, [k]: v })) }
  async function onSubmit(e) { 
    e.preventDefault(); 
    try { 
      setLoading(true); setError(''); 
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
  return (
    <div className="container">
      <h1>Register</h1>
      <form className="card form" onSubmit={onSubmit}>
        <div className="row"><div className="col"><label>First Name</label><input value={form.firstName} onChange={e=>setField('firstName', e.target.value)} required/></div><div className="col"><label>Last Name</label><input value={form.lastName} onChange={e=>setField('lastName', e.target.value)} required/></div></div>
        <div className="row"><div className="col"><label>Email</label><input type="email" value={form.email} onChange={e=>setField('email', e.target.value)} required/></div><div className="col"><label>Password</label><input type="password" value={form.password} onChange={e=>setField('password', e.target.value)} required/></div></div>
        <div className="row"><div className="col"><label>Account Type</label><select value={form.role} onChange={e=>setField('role', e.target.value)}><option value="farmer">Farmer</option><option value="lender">Lender</option></select></div></div>
        {error && <div className="error">{error}</div>}
        <div className="row"><div className="col end"><button disabled={loading}>{loading?'Creating...':'Create Account'}</button></div></div>
      </form>
    </div>
  )
}

function FarmerDashboard() {
  const { user } = useAuth()
  return (
    <div className="container">
      <h1>Farmer Dashboard</h1>
      <div className="muted">Welcome, {user?.firstName}. Get your field risk insights below.</div>
      <ClimaPanel />
    </div>
  )
}

function LenderDashboard() {
  const { user } = useAuth()
  return (
    <div className="container">
      <h1>Lender Dashboard</h1>
      <div className="muted">Welcome, {user?.firstName}. Compare sources for due diligence.</div>
      <ClimaPanel defaultCompare={true} />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<ProtectedRoute><RoleRouter /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/farmer" element={<ProtectedRoute roles={["farmer"]}><FarmerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/lender" element={<ProtectedRoute roles={["lender"]}><LenderDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

function RoleRouter() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'lender' ? '/dashboard/lender' : '/dashboard/farmer'} replace />
}

export default App
