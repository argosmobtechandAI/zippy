import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import Dashboard from "../pages/dashboard";
import Inventory from "../pages/inventory";
import StableManagement from "../pages/stableManagement";
import Lessons from "../pages/lessons";
import { RouteProtector } from "./routeProtector";
import Login from "../pages/login";
import ChooseStable from "../pages/chooseStable";
import TrainerManagement from "../pages/trainerManagement";
import SlotManagement from "../pages/slotManagement";

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
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/stable-management" element={<StableManagement />} />
                <Route path="/trainer-management" element={<TrainerManagement />} />
                <Route path="/slot-management" element={<SlotManagement />} />
                <Route path="/lessons" element={<Lessons />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/choose-stable" element={<ChooseStable />} />
        </Routes>
    );
};