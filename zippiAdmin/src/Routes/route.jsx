import { Route, Routes, Outlet, Navigate } from "react-router-dom"
import Dashboard from "../pages/dashboard"
import Revenue from "../pages/revenue"
import Centers from "../pages/centers"
import UserManagement from "../pages/userManagement"
import Sidebar from "../components/sidebar"
import Header from "../components/header"
import SlotManagement from "../pages/slotManagement"
import Horses from "../pages/horses"
import Inventory from "../pages/inventory"
import Login from "../pages/login"
import HelpCenter from "../Pages/HelpCenter"
import BookingRequests from "../pages/bookingRequests"
import LeaveRequests from "../pages/leaveRequests"
import AttendanceReport from "../pages/attendanceReport"
import Categories from "../pages/categories"
import MedicalRecords from "../pages/medicalRecords"
import Marketing from "../pages/Marketing"

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children ? children : <Outlet />;
}

const Layout = () => {
    return (
        <div className="flex h-screen w-full bg-[#fcfaf8] font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>} >
                <Route index element={<Dashboard />} />
                <Route path="revenue" element={<Revenue />} />
                <Route path="slotManagement" element={<SlotManagement />} />
                <Route path="bookingRequests" element={<BookingRequests />} />
                <Route path="centers" element={<Centers />} />
                <Route path="horses" element={<Horses />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="userManagement" element={<UserManagement />} />
                <Route path="leaveRequests" element={<LeaveRequests />} />
                <Route path="attendanceReport" element={<AttendanceReport />} />
                <Route path="help-center" element={<HelpCenter />} />
                <Route path="categories" element={<Categories />} />
                <Route path="medical-records" element={<MedicalRecords />} />
                <Route path="marketing" element={<Marketing />} />
            </Route>

            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default AppRoutes
