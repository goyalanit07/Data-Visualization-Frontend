import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../services/api";

const Login: React.FC = () => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async () => {
        try {
            await login(email, password);

            const redirectParam = new URLSearchParams(location.search).get("redirect");
            if (redirectParam) {
                navigate(decodeURIComponent(redirectParam));
            } else {
                navigate("/");
            }
        } catch (error: any) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h1>
                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

                    />
                    <button onClick={handleLogin}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Login
                    </button>
                </div>
                <p className="mt-4 text-center text-gray-600">
                    Not have any account?{" "}
                    <a href="/signup" className="text-blue-500 hover:underline">
                        Signup here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
