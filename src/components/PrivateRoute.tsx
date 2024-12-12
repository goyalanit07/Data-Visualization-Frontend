import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

interface PrivateRouteProps {
    redirectTo: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ redirectTo }) => {
    const isAuthenticated = Boolean(Cookies.get("auth_token"));
    const location = useLocation();

    if (!isAuthenticated) {
        const urlParams = new URLSearchParams(location.search);

        const chartParams = {
            startDate: urlParams.get("startDate"),
            endDate: urlParams.get("endDate"),
            ageGroup: urlParams.get("ageGroup"),
            gender: urlParams.get("gender"),
        };

        if (Object.values(chartParams).some((value) => value)) {
            Cookies.set("dashboardFilters", JSON.stringify(chartParams), { expires: 0.5 });
        }

        return (
            <Navigate
                to={`${redirectTo}?redirect=${encodeURIComponent(location.pathname + location.search)}`}
            />
        );
    }

    return <Outlet />;
};

export default PrivateRoute;
