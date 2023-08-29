import React from "react";
import {Navigate} from "react-router-dom";

const ProtectedRoute = ({isConnected, children}) => {
    if (!isConnected) {
        return <Navigate to="/signin" replace/>;
    }
    return children;
};

export default ProtectedRoute;
