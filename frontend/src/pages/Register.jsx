import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerRequest } from "../services/api/authApi";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    // Clear form whenever Register page is opened
    useEffect(() => {
        setForm({
            username: "",
            email: "",
            password: "",
        });
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;
        setLoading(true);

        try {
            await registerRequest({
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
            });

            // Clear form after successful registration
            setForm({
                username: "",
                email: "",
                password: "",
            });

            alert("Registration Successful");

            navigate("/login");
        } catch (err) {
            alert(
                err.response?.data?.message || "Registration Failed"
            );
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
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <div
                style={{
                    width: "400px",
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
                    Create Account 🚀
                </h1>

                <p
                    style={{
                        textAlign: "center",
                        color: "#666",
                        marginBottom: "25px",
                    }}
                >
                    Join the YouTube Watch Party
                </p>

                <form
                    onSubmit={handleSubmit}
                    autoComplete="off"
                >
                    {/* Username */}
                    <label
                        style={{
                            fontWeight: "bold",
                            color: "#444",
                        }}
                    >
                        Username
                    </label>

                    <input
                        type="text"
                        name="username"
                        minLength={3}
                        maxLength={30}
                        placeholder="Enter your username"
                        value={form.username}
                        onChange={handleChange}
                        autoComplete="off"
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

                    {/* Email */}
                    <label
                        style={{
                            fontWeight: "bold",
                            color: "#444",
                        }}
                    >
                        Email
                    </label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="off"
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

                    {/* Password */}
                    <label
                        style={{
                            fontWeight: "bold",
                            color: "#444",
                        }}
                    >
                        Password
                    </label>

                    <input
                        type="password"
                        name="password"
                        minLength={6}
                        placeholder="Create a password (min 6 characters)"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="new-password"
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

                    {/* Register Button */}
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
                            cursor: "pointer",
                            transition: "0.3s",
                        }}
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p
                    style={{
                        marginTop: "20px",
                        textAlign: "center",
                        color: "#555",
                    }}
                >
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        style={{
                            color: "#667eea",
                            fontWeight: "bold",
                            textDecoration: "none",
                        }}
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;