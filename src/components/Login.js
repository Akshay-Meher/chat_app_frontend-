import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const Login = () => {

    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('token from login useEffect', token);
        if (token) {
            navigate('/chat');
        }
    }, []);

    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginErr, setLoginErr] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const err = await login(email, password);
        // console.log("Login err", err.response.status);
        if (err?.response?.status) {
            console.log("Login err", err?.response?.data?.errors[0]);
            setLoginErr(err?.response?.data?.errors[0]);
        } else {
            setLoginErr(null);
        }
    };

    return (


        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card shadow p-4" style={{ width: "100%", maxWidth: "400px" }}>
                <h2 className="text-center mb-4">Login</h2>
                <form onSubmit={handleSubmit}>
                    {loginErr && (
                        <div className="alert alert-danger text-center p-2" role="alert">
                            {loginErr}
                        </div>
                    )}
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="form-control shadow-sm"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-control shadow-sm"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-100 shadow-sm"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>

    );
};

export default Login;


// <div className="container">
//     <h2 className="my-3">Login</h2>
//     <form onSubmit={handleSubmit}>
//         {loginErr && (
//             <h4 className="alert alert-danger text-center p-2" role="alert">
//                 {loginErr}
//             </h4>
//         )}
//         <div className="mb-3">
//             <label htmlFor="email" className="form-label">
//                 Email address
//             </label>
//             <input
//                 type="email"
//                 className="form-control"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//             />
//         </div>
//         <div className="mb-3">
//             <label htmlFor="password" className="form-label">
//                 Password
//             </label>
//             <input
//                 type="password"
//                 className="form-control"
//                 id="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//             />
//         </div>
//         <button type="submit" className="btn btn-primary">
//             Login
//         </button>
//     </form>
// </div>