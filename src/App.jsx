// src/App.jsx
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { SkeletonCard, SkeletonChart, SkeletonInsight } from "./components/SkeletonCard";
import ProtectedRoute from "./components/ProtectedRoute";
import "./components/index.css";

// Lazy-load page components so the initial bundle is tiny.
const Login         = lazy(() => import("./pages/Login"));
const Dashboard     = lazy(() => import("./pages/Dashboard"));
const Boutbira1     = lazy(() => import("./pages/Boutbira1"));
const Boutbira2     = lazy(() => import("./pages/Boutbira2"));
const Boutbira3     = lazy(() => import("./pages/Boutbira3"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));

function DashboardFallback() {
  return (
    <div style={{ padding: "2rem" }}>
      <div className="cards-grid-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonChart />
      <SkeletonInsight />
    </div>
  );
}

function PageFallback() {
  return (
    <div style={{ padding: "2rem" }}>
      <SkeletonCard />
    </div>
  );
}

function AppLayout({ children }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/boutbira/1" element={
          <ProtectedRoute>
            <AppLayout>
              <Boutbira1 />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/boutbira/2" element={
          <ProtectedRoute>
            <AppLayout>
              <Boutbira2 />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/boutbira/3" element={
          <ProtectedRoute>
            <AppLayout>
              <Boutbira3 />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AppLayout>
              <AdminSettings />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
