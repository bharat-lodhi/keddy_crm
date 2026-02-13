import React, { useState } from "react";
import { apiRequest } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await apiRequest("/api/login/", "POST", form);
            console.log("Login Response:",res.access); 
            localStorage.setItem("token", res.access);

            if (res.role === "CENTRAL_ADMIN") navigate("/central-admin");
            else if (res.role === "SUB_ADMIN") navigate("/sub-admin");
            else if (res.role === "EMPLOYEE") navigate("/employee");
            else setError("Login failed. Please check your credentials.");
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return ( <
        div style = { styles.page } >
        <
        div style = { styles.card } >
        <
        h1 style = { styles.title } > Keddy CRM < /h1> <
        p style = { styles.subtitle } > Welcome back!Please login. < /p>

        {
            error && < div style = { styles.errorBox } > { error } < /div>}

            <
            form onSubmit = { handleSubmit }
            style = { styles.form } >
                <
                input
            style = { styles.input }
            name = "email"
            type = "email"
            placeholder = "Email Address"
            onChange = { handleChange }
            required
                /
                >
                <
                input
            style = { styles.input }
            name = "password"
            type = "password"
            placeholder = "Password"
            onChange = { handleChange }
            required
                /
                >
                <
                button
            style = { styles.button }
            type = "submit"
            disabled = { loading } > { loading ? "Logging in..." : "Login" } <
                /button> < /
            form >

                <
                p style = { styles.footerText } >
                Don 't have an account?{" "} <
            Link to = "/register"
            style = { styles.link } >
                Register here <
                /Link> < /
            p > <
                /div> < /
            div >
        );
    }

    const styles = {
        page: {
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#EAEFEF", // Updated: Light Mist
            fontFamily: "'Segoe UI', Roboto, sans-serif",
        },
        card: {
            width: "90%",
            maxWidth: 400,
            backgroundColor: "#BFC9D1", // Updated: Soft Blue-Gray
            borderRadius: 16,
            padding: "40px 32px",
            boxShadow: "0 10px 25px rgba(37, 52, 63, 0.1)", // Shadow adjusted to Dark Navy
            textAlign: "center",
        },
        title: {
            margin: 0,
            fontSize: 32,
            fontWeight: 700,
            color: "#25343F", // Updated: Dark Navy
            letterSpacing: "0.9px",
        },
        subtitle: {
            marginTop: 8,
            marginBottom: 24,
            color: "#25343F", // Updated: Dark Navy (matching heading)
            opacity: 0.8,
            fontSize: 15,
        },
        errorBox: {
            background: "#fee2e2",
            color: "#991b1b",
            padding: "10px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14,
            border: "1px solid #fecaca",
        },
        form: {
            display: "flex",
            flexDirection: "column",
            gap: 15,
        },
        input: {
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            border: "1px solid #25343F", // Updated: Dark Navy border
            fontSize: 15,
            outline: "none",
            backgroundColor: "#ffffff",
            color: "#25343F", // Updated: Dark Navy
            boxSizing: "border-box",
        },
        button: {
            marginTop: 5,
            padding: "14px",
            borderRadius: 10,
            border: "none",
            background: "#FF9B51", // Updated: Vibrant Orange
            color: "#ffffff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(255, 155, 81, 0.3)",
        },
        footerText: {
            marginTop: 20,
            fontSize: 14,
            color: "#25343F", // Updated: Dark Navy
        },
        link: {
            color: "#FF9B51", // Updated: Vibrant Orange
            textDecoration: "none",
            fontWeight: 700,
        },
    };

    export default Login;





    // // src/pages/Login.js

    // import React, { useState } from "react";
    // import { apiRequest } from "../services/api";
    // import { useNavigate, Link } from "react-router-dom";

    // function Login() {
    //     const navigate = useNavigate();
    //     const [form, setForm] = useState({
    //         email: "",
    //         password: "",
    //     });
    //     const [loading, setLoading] = useState(false);
    //     const [error, setError] = useState("");

    //     const handleChange = (e) => {
    //         setForm({...form, [e.target.name]: e.target.value });
    //     };

    //     const handleSubmit = async(e) => {
    //         e.preventDefault();
    //         setLoading(true);
    //         setError("");

    //         try {
    //             const res = await apiRequest("/api/login/", "POST", form);

    //             if (res.role === "CENTRAL_ADMIN") navigate("/central-admin");
    //             else if (res.role === "SUB_ADMIN") navigate("/sub-admin");
    //             else if (res.role === "EMPLOYEE") navigate("/employee");
    //             else setError("Login failed. Please check your credentials.");
    //         } catch (err) {
    //             setError("Something went wrong. Please try again.");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     return ( <
    //         div style = { styles.page } >
    //         <
    //         div style = { styles.card } >
    //         <
    //         h1 style = { styles.title } > Keddy CRM < /h1> <
    //         p style = { styles.subtitle } > Welcome back!Please login. < /p>

    //         {
    //             error && < div style = { styles.errorBox } > { error } < /div>}

    //             <
    //             form onSubmit = { handleSubmit }
    //             style = { styles.form } >
    //                 <
    //                 input
    //             style = { styles.input }
    //             name = "email"
    //             type = "email"
    //             placeholder = "Email Address"
    //             onChange = { handleChange }
    //             required
    //                 /
    //                 >
    //                 <
    //                 input
    //             style = { styles.input }
    //             name = "password"
    //             type = "password"
    //             placeholder = "Password"
    //             onChange = { handleChange }
    //             required
    //                 /
    //                 >
    //                 <
    //                 button
    //             style = { styles.button }
    //             type = "submit"
    //             disabled = { loading } > { loading ? "Logging in..." : "Login" } <
    //                 /button> < /
    //             form >

    //                 <
    //                 p style = { styles.footerText } >
    //                 Don 't have an account?{" "} <
    //             Link to = "/register"
    //             style = { styles.link } >
    //                 Register here <
    //                 /Link> < /
    //             p > <
    //                 /div> < /
    //             div >
    //         );
    //     }

    //     const styles = {
    //         page: {
    //             minHeight: "100vh",
    //             display: "flex",
    //             alignItems: "center",
    //             justifyContent: "center",
    //             backgroundColor: "#FAF3E1", // Theme Background
    //             fontFamily: "'Segoe UI', Roboto, sans-serif",
    //         },
    //         card: {
    //             width: "90%",
    //             maxWidth: 400,
    //             backgroundColor: "#F5E7C6", // Theme Card
    //             borderRadius: 16,
    //             padding: "40px 32px",
    //             boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    //             textAlign: "center",
    //         },
    //         title: {
    //             margin: 0,
    //             fontSize: 32,
    //             fontWeight: 700,
    //             color: "#222222",
    //             letterSpacing: "0.9px",
    //         },
    //         subtitle: {
    //             marginTop: 8,
    //             marginBottom: 24,
    //             color: "#555555",
    //             fontSize: 15,
    //         },
    //         errorBox: {
    //             background: "#fee2e2",
    //             color: "#991b1b",
    //             padding: "10px",
    //             borderRadius: 8,
    //             marginBottom: 16,
    //             fontSize: 14,
    //             border: "1px solid #fecaca",
    //         },
    //         form: {
    //             display: "flex",
    //             flexDirection: "column",
    //             gap: 15,
    //         },
    //         input: {
    //             width: "100%",
    //             padding: "14px",
    //             borderRadius: 10,
    //             border: "1px solid rgba(34, 34, 34, 0.15)",
    //             fontSize: 15,
    //             outline: "none",
    //             backgroundColor: "#ffffff",
    //             color: "#222222",
    //             boxSizing: "border-box",
    //         },
    //         button: {
    //             marginTop: 5,
    //             padding: "14px",
    //             borderRadius: 10,
    //             border: "none",
    //             background: "#FA8112", // Brand Orange
    //             color: "#ffffff",
    //             fontSize: 16,
    //             fontWeight: 700,
    //             cursor: "pointer",
    //             boxShadow: "0 4px 12px rgba(250, 129, 18, 0.3)",
    //         },
    //         footerText: {
    //             marginTop: 20,
    //             fontSize: 14,
    //             color: "#222222",
    //         },
    //         link: {
    //             color: "#FA8112",
    //             textDecoration: "none",
    //             fontWeight: 700,
    //         },
    //     };

    //     export default Login;