
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginRequest } from "../services/api/authApi";
import { AuthContext } from "../components/context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setLoading(true);

        try {
            const res = await loginRequest({
                email: form.email.trim(),
                password: form.password,
            });

            if (!res.data?.token || !res.data?.user) {
                throw new Error("Invalid login response from server");
            }

            login(res.data.token, res.data.user);

            setForm({
                email: "",
                password: "",
            });

            navigate("/home", { replace: true });
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                "Login Failed";

            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px",
                boxSizing: "border-box",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "380px",
                    background: "#fff",
                    padding: "35px",
                    borderRadius: "15px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                }}
            >
                <h1
                    style={{
                        textAlign: "center",
                        marginBottom: "10px",
                        color: "#333",
                    }}
                >
                    Welcome Back 👋
                </h1>

                <p
                    style={{
                        textAlign: "center",
                        color: "#666",
                        marginBottom: "25px",
                    }}
                >
                    Login to your Watch Party account
                </p>

                <form onSubmit={handleSubmit}>
                    <label
                        htmlFor="email"
                        style={{ fontWeight: "bold", color: "#444" }}
                    >
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginTop: "8px",
                            marginBottom: "20px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "16px",
                            boxSizing: "border-box",
                        }}
                    />

                    <label
                        htmlFor="password"
                        style={{ fontWeight: "bold", color: "#444" }}
                    >
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginTop: "8px",
                            marginBottom: "25px",
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            fontSize: "16px",
                            boxSizing: "border-box",
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px",
                            background: loading ? "#999" : "#667eea",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "17px",
                            fontWeight: "bold",
                            cursor: loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p
                    style={{
                        marginTop: "20px",
                        textAlign: "center",
                        color: "#555",
                    }}
                >
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        style={{
                            color: "#667eea",
                            fontWeight: "bold",
                            textDecoration: "none",
                        }}
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
