import { Route, Routes, Outlet, Navigate } from "react-router-dom"
import Dashboard from "../pages/dashboard"
import Revenue from "../pages/revenue"
import Centers from "../pages/centers"
import UserManagement from "../pages/userManagement"
import Sidebar from "../components/sidebar"
import SlotManagement from "../pages/slotManagement"

const Layout = () => {
    return (
        <div className="flex h-screen w-full bg-[#fcfaf8] font-sans">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    )
}

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />} >
                <Route index element={<Dashboard />} />
                <Route path="revenue" element={<Revenue />} />
                <Route path="slotManagement" element={<SlotManagement />} />
                <Route path="centers" element={<Centers />} />
                <Route path="userManagement" element={<UserManagement />} />
            </Route>
        </Routes>
    )
}

export default AppRoutes
