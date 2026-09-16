import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from './PageLoader';

export default function RequireAuth({ admin = false }: { admin?: boolean }) {
    const { user, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) return <PageLoader />;
    if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    if (admin && !isAdmin) return <Navigate to="/" replace />;
    return <Outlet />;
}
