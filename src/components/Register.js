import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
    const { register } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!username.trim()) {
            newErrors.username = 'Username is required';
        } else if (username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters long';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (!passwordRegex.test(password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 6 characters long';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Returns true if no errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            const res = await register(username, email, password);
            const newErrors = {};
            if (res?.status != 201) {

                newErrors.email = res?.response?.data?.errors[0];
                setErrors(newErrors)
            }
            console.log("register respose", res?.response?.data?.errors[0]);
        }
    };

    return (
        <div className="container mt-5 p-4 border rounded shadow-sm" style={{ maxWidth: '400px' }}>
            <h2 className="text-center mb-4">Register</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                        type="text"
                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;














// import React, { useState } from 'react';
// import { useAuth } from '../contexts/AuthContext';

// const Register = () => {
//     const { register } = useAuth();
//     const [username, setUsername] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         register(username, email, password);
//     };

//     return (
//         <div className="container">
//             <h2 className="my-3">Register</h2>
//             <form onSubmit={handleSubmit}>
//                 <div className="mb-3">
//                     <label htmlFor="username" className="form-label">
//                         Username
//                     </label>
//                     <input
//                         type="text"
//                         className="form-control"
//                         id="username"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                     />
//                 </div>
//                 <div className="mb-3">
//                     <label htmlFor="email" className="form-label">
//                         Email address
//                     </label>
//                     <input
//                         type="email"
//                         className="form-control"
//                         id="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                     />
//                 </div>
//                 <div className="mb-3">
//                     <label htmlFor="password" className="form-label">
//                         Password
//                     </label>
//                     <input
//                         type="password"
//                         className="form-control"
//                         id="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                     />
//                 </div>
//                 <button type="submit" className="btn btn-primary">
//                     Register
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default Register;
