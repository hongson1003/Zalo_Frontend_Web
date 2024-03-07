import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { STATE } from "../redux/types/type.app";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
    const state = useSelector(state => state?.appReducer);
    const navigate = useNavigate();
    useEffect(() => {
        if (state.error === false) {
            navigate('/');
        }
    }, [state.error])
    return (
        <div>
            <h1>Error Page</h1>
        </div>
    );
}

export default ErrorPage;