import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Role } from './types/enums'
import { DashboardPage } from './pages/DashboardPage'
import { ForbiddenPage, NotFoundPage } from './pages/ErrorPages'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { VerifyOtpPage } from './pages/VerifyOtpPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { CategoriesPage } from './pages/categories/CategoriesPage'
import { AdminComplaintsPage } from './pages/complaints/AdminComplaintsPage'
import { ComplaintDetailPage } from './pages/complaints/ComplaintDetailPage'
import { ComplaintsPage } from './pages/complaints/ComplaintsPage'
import { MyWorkerReviewsPage } from './pages/reviews/MyWorkerReviewsPage'
import { ReviewFormPage } from './pages/reviews/ReviewFormPage'
import { ServiceRequestDetailPage } from './pages/service-requests/ServiceRequestDetailPage'
import { ServiceRequestsPage } from './pages/service-requests/ServiceRequestsPage'
import { WorkerApplicationDetailPage } from './pages/workers/WorkerApplicationDetailPage'
import { WorkerApplicationsPage } from './pages/workers/WorkerApplicationsPage'
import { WorkerApplyPage } from './pages/workers/WorkerApplyPage'
import { WorkerProfilePage } from './pages/workers/WorkerProfilePage'
import { WorkerSearchPage } from './pages/workers/WorkerSearchPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="workers" element={<WorkerSearchPage />} />
          <Route path="service-requests" element={<ServiceRequestsPage />} />
          <Route path="service-requests/new" element={<ServiceRequestsPage />} />
          <Route path="service-requests/:id" element={<ServiceRequestDetailPage />} />
          <Route path="complaints" element={<ComplaintsPage />} />
          <Route path="complaints/:id" element={<ComplaintDetailPage />} />
          <Route path="reviews/new" element={<ReviewFormPage />} />
          <Route element={<ProtectedRoute roles={[Role.WORKER]} />}>
            <Route path="my-reviews" element={<MyWorkerReviewsPage />} />
          </Route>
          <Route path="worker/apply" element={<WorkerApplyPage />} />
          <Route path="worker-profile" element={<WorkerProfilePage />} />

          <Route element={<ProtectedRoute roles={[Role.ADMIN]} />}>
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="worker-applications" element={<WorkerApplicationsPage />} />
            <Route path="worker-applications/:id" element={<WorkerApplicationDetailPage />} />
            <Route path="admin/complaints" element={<AdminComplaintsPage />} />
            <Route path="admin/complaints/:id" element={<ComplaintDetailPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              },
            }}
          />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
