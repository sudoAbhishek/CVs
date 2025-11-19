import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

    useEffect(() => {
        // Check token on mount
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);

        // Listen for storage changes (logout from other tabs/windows or programmatic changes)
        const handleStorageChange = () => {
            const updatedToken = localStorage.getItem("token");
            setIsLoggedIn(!!updatedToken);
        };

        window.addEventListener("storage", handleStorageChange);

        // Also create a custom event listener for same-tab changes
        window.addEventListener("tokenChanged", () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        });

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("tokenChanged", handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event("tokenChanged"));
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">CVs</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {isLoggedIn && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/">
                                        Dashboard
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <button
                                        className="nav-link btn btn-link "
                                        onClick={handleLogout}
                                        style={{
                                            cursor: "pointer",
                                            border: "none",
                                            background: "none",
                                            textDecoration: "none"
                                        }}
                                    >
                                        Logout
                                    </button>
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
