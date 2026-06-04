import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

export const RouteProtector = ({ children }) => {
    const { selectedStable } = useSelector((state) => state.getDataReducer);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const isValidToken = token && token !== "undefined" && token !== "null";

    useEffect(() => {
        if (!isValidToken) {
            navigate("/login");
        } else if (!selectedStable) {
            navigate("/choose-stable");
        }
    }, [isValidToken, selectedStable, navigate]);

    if (!isValidToken || !selectedStable) {
        return null;
    }

    return children;
};