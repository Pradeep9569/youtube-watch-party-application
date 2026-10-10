import { createContext, useState, useEffect } from "react";
import { meRequest } from "../../services/api/authApi";

export const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        // No token found
        if (!token) {
            setLoading(false);
            return;
        }

        meRequest()
            .then((res) => {
                setUser(res.data.user);
            })
            .catch((err) => {
                const status = err.response?.status;

                // Only discard the token when the server says it is invalid.
                // A network error / cold-starting server must not log the user out.
                if (status === 401 || status === 403 || status === 404) {
                    localStorage.removeItem("token");
                }
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = (token, user) => {
        localStorage.setItem("token", token);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
