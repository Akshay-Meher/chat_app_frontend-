import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { auth, logout } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">

                <Link className="navbar-brand fw-bold" to="/">
                    ChatApp
                </Link>


                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">
                        {auth.isAuthenticated ? (
                            <li className="nav-item">
                                <button
                                    onClick={logout}
                                    className="btn btn-outline-danger d-flex align-items-center"
                                >
                                    <i
                                        className="fas fa-sign-out-alt me-2"
                                        style={{ fontSize: '1rem' }}
                                    ></i>
                                    Logout
                                </button>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;



// import React from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// const Navbar = () => {
//     const { auth, logout } = useAuth();

//     return (
//         <nav className="navbar navbar-expand-lg navbar-light bg-light">
//             <div className="container-fluid">
//                 <Link className="navbar-brand" to="/">
//                     ChatApp
//                 </Link>
//                 <div className="collapse navbar-collapse" id="navbarNav">
//                     <ul className="navbar-nav ml-auto">
//                         {auth.isAuthenticated ? (
//                             <li className="nav-item">
//                                 <button onClick={logout} className="btn btn-danger">
//                                     Logout
//                                 </button>
//                             </li>
//                         ) : (
//                             <>
//                                 <li className="nav-item">
//                                     <Link className="nav-link" to="/login">
//                                         Login
//                                     </Link>
//                                 </li>
//                                 <li className="nav-item">
//                                     <Link className="nav-link" to="/register">
//                                         Register
//                                     </Link>
//                                 </li>
//                             </>
//                         )}
//                     </ul>
//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default Navbar;
