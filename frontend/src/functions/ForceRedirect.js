import React from "react";
import {Navigate} from "react-router-dom";

const ForceRedirect = ({isConnected, children}) => {
    if (isConnected) {
        const currentPage = window.location.pathname;
        return (currentPage === "/signin" | currentPage === "/") ?
            <Navigate to={"/activity"} replace/>
            :
            <Navigate to={currentPage} replace/>
    }
    return children;
};

export default ForceRedirect;
