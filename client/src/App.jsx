import './App.css'
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ClimaScoreLogo from './components/ClimaScoreLogo.jsx'
import FarmerHome from './pages/FarmerHome.jsx'
import FarmerFieldsPage from './pages/FarmerFieldsPage.jsx'
import FarmerApplications from './pages/FarmerApplications.jsx'
import FarmerAdvisory from './pages/FarmerAdvisory.jsx'
import FarmerResources from './pages/FarmerResources.jsx'
import LenderExecutive from './pages/LenderExecutive.jsx'
import LenderQueue from './pages/LenderQueue.jsx'
import LenderApplication from './pages/LenderApplication.jsx'
import LenderPortfolio from './pages/LenderPortfolio.jsx'
import LenderAdmin from './pages/LenderAdmin.jsx'
import ColdStorageDashboard from './pages/ColdStorageDashboard.jsx'
import AuthLanding from './pages/AuthLanding.jsx'
import SignIn from './pages/SignIn.jsx'
import Register from './pages/Register.jsx'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="container"><div className="card">Loading...</div></div>
  if (!user) return <Navigate to="/signin" replace />
  if (roles && roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function ColdStorageLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const items = [
    { to: '/dashboard/cold-storage/overview', label: 'Overview', icon: 'overview' },
  ]
  return (
    <div className="min-h-screen bg-[radial-gradient(600px_300px_at_10%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(600px_300px_at_120%_10%,rgba(34,197,94,0.12),transparent),linear-gradient(180deg,rgba(14,20,34,0.9),rgba(14,20,34,0.95))]">
      <header className="fixed top-0 inset-x-0 h-14 z-40 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <ClimaScoreLogo />
          <span>Cold Storage</span>
        </div>
      </header>
      <Sidebar items={items} title="Cold Storage" collapsed={collapsed} onToggle={()=>setCollapsed(v=>!v)} />
      <main className={`pt-14 ${collapsed ? 'ml-16' : ''}`}>
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function NavBar() {
  const { user } = useAuth()
  return (
    <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <div>
        <Link to="/" className="link">Home</Link>
        {user && <>
          <span style={{margin:'0 8px'}}>|</span>
          <Link to={user.role === 'lender' ? '/dashboard/lender' : user.role === 'cold_storage_owner' ? '/dashboard/cold-storage' : '/dashboard/farmer'} className="link">Dashboard</Link>
        </>}
      </div>
      <div>
        {!user && (
          <>
            <Link to="/signin" className="link">Sign in</Link>
            <span style={{margin:'0 8px'}}>|</span>
            <Link to="/register" className="link">Register</Link>
          </>
        )}
      </div>
    </div>
  )
}

// Removed old Home, Login, and Register inline components in favor of isolated pages

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
            <button 
              onClick={logout} 
              className={`btn-logout inline-flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-2'} px-3 py-2 rounded`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/>
                <path d="M16 17l5-5-5-5"/>
                <path d="M21 12H9"/>
              </svg>
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
    { to: '/dashboard/farmer/fields', label: 'My Fields & Financing', icon: 'fields' },
    { to: '/dashboard/farmer/applications', label: 'My Applications', icon: 'application' },
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
        <Routes>
          <Route path="/" element={<AuthLanding />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/farmer" element={<ProtectedRoute roles={["farmer"]}><FarmerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<FarmerHome />} />
            <Route path="fields" element={<FarmerFieldsPage />} />
            <Route path="applications" element={<FarmerApplications />} />
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
          <Route path="/dashboard/cold-storage" element={<ProtectedRoute roles={["cold_storage_owner"]}><ColdStorageLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<ColdStorageDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

function ConditionalNavBar() {
  const location = useLocation()
  const isAuth = location.pathname === '/signin' || location.pathname === '/register'
  const isDash = location.pathname.startsWith('/dashboard')
  if (isAuth || isDash) return null
  return <NavBar />
}

export default App
