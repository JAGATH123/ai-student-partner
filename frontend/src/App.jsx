import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import CyberpunkBackground from './components/CosmicBackground';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Join from './pages/Join';
import UserDashboard from './pages/user/Dashboard';
import UserQuiz from './pages/user/Quiz';
import UserProgress from './pages/user/Progress';
import UserProfile from './pages/user/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminUserDetail from './pages/admin/UserDetail';
import AdminAnalytics from './pages/admin/Analytics';
import AdminInviteLinks from './pages/admin/InviteLinks';

function App() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CyberpunkBackground />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/join/:inviteCode" element={!user ? <Join /> : <Navigate to="/dashboard" />} />

        {/* User routes */}
        <Route path="/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
        <Route path="/quiz/:topicId?" element={<ProtectedRoute role="user"><UserQuiz /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute role="user"><UserProgress /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute role="user"><UserProfile /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/users/:userId" element={<ProtectedRoute role="admin"><AdminUserDetail /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/invites" element={<ProtectedRoute role="admin"><AdminInviteLinks /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
      </Routes>
    </div>
  );
}

export default App;
