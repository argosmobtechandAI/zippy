import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import Dashboard from "../pages/dashboard";
import Inventory from "../pages/inventory";
import Lessons from "../pages/lessons";
import { RouteProtector } from "./routeProtector";
import Login from "../pages/login";
import ChooseStable from "../pages/chooseStable";
import TrainerManagement from "../pages/trainerManagement";
import SlotManagement from "../pages/slotManagement";
import BookingRequests from "../pages/bookingRequests";
import UserManagement from "../pages/userManagement";
import AttendanceReport from "../pages/attendanceReport";
import Revenue from "../pages/revenue";
import Categories from "../pages/categories";
import MedicalRecords from "../pages/medicalRecords";
import LeaveRequests from "../pages/leaveRequests";
import Marketing from "../pages/Marketing";
import Coupons from "../pages/coupons";
import Payments from "../pages/payments";
import HelpCenter from "../pages/HelpCenter";
import HorseHealth from "../pages/horseHealth";

const Layout = () => {
    return (
        <div className="flex h-screen w-full font-sans bg-[#F9EEE5]">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Header />
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<RouteProtector><Layout /></RouteProtector>}>
                <Route index element={<Dashboard />} />
                <Route path="/bookingRequests" element={<BookingRequests />} />
                <Route path="/userManagement" element={<UserManagement />} />
                <Route path="/attendanceReport" element={<AttendanceReport />} />
                <Route path="/revenue" element={<Revenue />} />
                <Route path="/slot-management" element={<SlotManagement />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/medical-records" element={<MedicalRecords />} />
                <Route path="/leaveRequests" element={<LeaveRequests />} />
                <Route path="/marketing" element={<Marketing />} />
                <Route path="/help-center" element={<HelpCenter />} />
                <Route path="/coupons" element={<Coupons />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/trainer-management" element={<TrainerManagement />} />
                <Route path="/lessons" element={<Lessons />} />
                <Route path="/horse-health" element={<HorseHealth />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/choose-stable" element={<ChooseStable />} />
        </Routes>
    );
};