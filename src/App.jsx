import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { PropertyHomePage } from './pages/property/PropertyHomePage';
import PropertyDetailPage from './pages/property/PropertyDetailPage';
import UnitDetailPage from './pages/property/UnitDetailPage';
import { PropertiesPage } from './pages/management/PropertiesPage';
import { PropertyFormPage } from './pages/management/PropertyFormPage';
import { PropertyManagerAssignment } from './pages/management/PropertyManagerAssignment';
import { UnitsPage } from './pages/management/UnitsPage';
import { UnitFormPage } from './pages/management/UnitFormPage';
import { CoordinateVisualizerPage } from './pages/management/CoordinateVisualizerPage';
import { TicketsPage } from './pages/tickets/TicketsPage';
import { CreateTicketPage } from './pages/tickets/CreateTicketPage';
import { TicketDetailPage } from './pages/tickets/TicketDetailPage';
import { ServicesPage } from './pages/services/ServicesPage';
import { ContractsPage } from './pages/contracts/ContractsPage';
import { ContractFormPage } from './pages/contracts/ContractFormPage';
import { ContractDetailPage } from './pages/contracts/ContractDetailPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { BillsManagementPage } from './pages/billing/BillsManagementPage';
import { CreateBillPage } from './pages/billing/CreateBillPage';
import { MyBillsPage } from './pages/billing/MyBillsPage';
import { BillDetailPage } from './pages/billing/BillDetailPage';
import { PaymentCheckoutPage } from './pages/billing/PaymentCheckoutPage';
import { BillingSettingsPage } from './pages/billing/BillingSettingsPage';
import UsersPage from './pages/management/UsersPage';
import UserDetailPage from './pages/management/UserDetailPage';
import MyPermitsPage from './pages/permits/MyPermitsPage';
import RequestPermitPage from './pages/permits/RequestPermitPage';
import ManagePermitsPage from './pages/permits/ManagePermitsPage';
import PermitDetailPage from './pages/permits/PermitDetailPage';
import PublicDirectoryPage from './pages/public/PublicDirectoryPage';
import PublicUnitDetailPage from './pages/public/PublicUnitDetailPage';
import { FilesManagementPage } from './pages/files/FilesManagementPage';
import { MyUnitsPage } from './pages/units/MyUnitsPage';
import { MyRentalPage } from './pages/rental/MyRentalPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsOfServicePage from './pages/legal/TermsOfServicePage';
import { MyBookingsPage } from './pages/bookings/MyBookingsPage';
import { CreateBookingPage } from './pages/bookings/CreateBookingPage';
import { ManageBookingsPage } from './pages/bookings/ManageBookingsPage';
import { BookingDetailPage } from './pages/bookings/BookingDetailPage';
import ReportsPage from './pages/reports/ReportsPage';
import TicketReportPage from './pages/reports/TicketReportPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import './lib/i18n';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              <Route path="/public/directory" element={<PublicDirectoryPage />} />
              <Route path="/public/directory/unit/:unitId" element={<PublicUnitDetailPage />} />

              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/property/:propertyId" element={<PropertyHomePage />} />
              <Route path="/property/:propertyId/unit/:unitId" element={<UnitDetailPage />} />
              <Route path="/property-details/:id" element={<PropertyDetailPage />} />

              <Route
                path="/properties"
                element={
                  <ProtectedRoute>
                    <PropertiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/create"
                element={
                  <ProtectedRoute>
                    <PropertyFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/edit/:propertyId"
                element={
                  <ProtectedRoute>
                    <PropertyFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/assign-managers"
                element={
                  <ProtectedRoute>
                    <PropertyManagerAssignment />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/units"
                element={
                  <ProtectedRoute>
                    <UnitsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-units"
                element={
                  <ProtectedRoute>
                    <MyUnitsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/units/create"
                element={
                  <ProtectedRoute>
                    <UnitFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/units/edit/:unitId"
                element={
                  <ProtectedRoute>
                    <UnitFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/units/visualizer"
                element={
                  <ProtectedRoute>
                    <CoordinateVisualizerPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tickets"
                element={
                  <ProtectedRoute>
                    <TicketsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets/create"
                element={
                  <ProtectedRoute>
                    <CreateTicketPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets/:ticketId"
                element={
                  <ProtectedRoute>
                    <TicketDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/services"
                element={
                  <ProtectedRoute>
                    <ServicesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/contracts"
                element={
                  <ProtectedRoute>
                    <ContractsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contracts/create"
                element={
                  <ProtectedRoute>
                    <ContractFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contracts/edit/:contractId"
                element={
                  <ProtectedRoute>
                    <ContractFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contracts/:contractId"
                element={
                  <ProtectedRoute>
                    <ContractDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payments"
                element={
                  <ProtectedRoute>
                    <PaymentsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-rental"
                element={
                  <ProtectedRoute>
                    <MyRentalPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/billing/manage"
                element={
                  <ProtectedRoute>
                    <BillsManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing/create"
                element={
                  <ProtectedRoute>
                    <CreateBillPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing/my-bills"
                element={
                  <ProtectedRoute>
                    <MyBillsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing/:billId"
                element={
                  <ProtectedRoute>
                    <BillDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing/payment/:billId"
                element={
                  <ProtectedRoute>
                    <PaymentCheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing/settings"
                element={
                  <ProtectedRoute>
                    <BillingSettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/:userId"
                element={
                  <ProtectedRoute>
                    <UserDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/permits"
                element={
                  <ProtectedRoute>
                    <MyPermitsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/permits/request"
                element={
                  <ProtectedRoute>
                    <RequestPermitPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/permits/manage"
                element={
                  <ProtectedRoute>
                    <ManagePermitsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/permits/:permitId"
                element={
                  <ProtectedRoute>
                    <PermitDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/files"
                element={
                  <ProtectedRoute>
                    <FilesManagementPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/create"
                element={
                  <ProtectedRoute>
                    <CreateBookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/manage"
                element={
                  <ProtectedRoute>
                    <ManageBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/:bookingId"
                element={
                  <ProtectedRoute>
                    <BookingDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports/tickets"
                element={
                  <ProtectedRoute>
                    <TicketReportPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
