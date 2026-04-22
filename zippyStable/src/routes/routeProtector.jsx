import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

export const RouteProtector = ({ children }) => {
    const { selectedStable } = useSelector((state) => state.getDataReducer);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else if (!selectedStable) {
            navigate("/choose-stable");
        }
    }, [token, selectedStable, navigate]);

    if (!token || !selectedStable) {
        return null;
    }

    return children;
};