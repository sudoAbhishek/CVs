// import './App.css'
import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage.jsx";
import ProtectedRoute from "./protectedRoute/Protected.jsx";
import SharedCV from "./pages/SharedCV.jsx";
import NotFound from "./pages/NotFound.jsx";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder.jsx'));

const LazyLoad = ({ children, fallback }) => (
  <Suspense fallback={<div style={{ textAlign: 'center', fontWeight: '900' }}>{fallback}</div>}>
    {children}
  </Suspense>
);

function App() {
  return (
    <>
      <Navbar />
      <div style={{ minHeight: "80vh" }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/shared/:shareToken" element={<SharedCV />} />
          <Route
            path="/resumebuilder"
            element={
              <ProtectedRoute>
                <LazyLoad fallback="Loading ResumeBuilder...">
                  <ResumeBuilder />
                </LazyLoad>
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LazyLoad fallback="Loading Dashboard...">
                  <Dashboard />
                </LazyLoad>
              </ProtectedRoute>
            }
          />
          {/* Catch-all 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;