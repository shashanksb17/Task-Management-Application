import { message } from 'antd';
import React from 'react';
import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("userToken");

    if (!token) {
        message.error("Please Login First")
        return <Navigate to="/" />;
    }

    return children;
};
