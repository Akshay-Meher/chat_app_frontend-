import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ isAuthenticated: false, token: null });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        // const loggedInUser = localStorage.getItem('loggedInUser');
        if (token) {
            setAuth({ isAuthenticated: true, token, loggedInUser });
        }
    }, []);

    const login = async (email, password) => {
        try {

            const { data } = await axios.post('http://localhost:5000/users/login', { email, password });
            console.log("data token", data);
            localStorage.setItem('token', data.token);
            localStorage.setItem('loggedInUser', JSON.stringify(data.user));

            setAuth({ isAuthenticated: true, token: data.token, loggedInUser: data?.user });
            navigate('/chat');
        } catch (error) {
            console.log("error", error);
            console.error('Error logging in', error);
            return (error);
        }
    };

    const register = async (username, email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5000/users/register', { name: username, email, password });
            navigate('/login');
        } catch (error) {
            console.error('Error registering', error);
            return (error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        setAuth({ isAuthenticated: false, token: null, loggedInUser: null });
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ auth, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
