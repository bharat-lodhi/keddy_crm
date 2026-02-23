import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import BaseLayout from "../components/SubAdminLayout";

function AddClient() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        client_name: "",
        company_name: "",
        phone_number: "",
        email: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiRequest("/employee-portal/clients/create/", "POST", form);
            alert("Client created successfully!");
            navigate("/sub-admin/clients");
        } catch (error) {
            console.error("Error creating client:", error);
            alert("Error: Client is Not Created.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseLayout>
            <div style={styles.topBar}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                    <span style={{ fontSize: '18px' }}>←</span> Back
                </button>
                <h2 style={styles.pageTitle}>Add New Client</h2>
            </div>

            <form onSubmit={handleSubmit} style={styles.card}>
                <div style={styles.formGrid}>
                    <div style={styles.sectionHeader}>Client Information</div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Client Name *</label>
                        <input 
                            style={styles.input} 
                            name="client_name" 
                            value={form.client_name} 
                            onChange={handleChange} 
                            placeholder="e.g. John Doe" 
                            required 
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Company Name *</label>
                        <input 
                            style={styles.input} 
                            name="company_name" 
                            value={form.company_name} 
                            onChange={handleChange} 
                            placeholder="e.g. TCS / Google" 
                            required 
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Phone Number *</label>
                        <input 
                            style={styles.input} 
                            name="phone_number" 
                            value={form.phone_number} 
                            onChange={handleChange} 
                            placeholder="e.g. 9876543210" 
                            required 
                        />
                    </div>
<div style={styles.inputGroup}>
    {/* Asterisk (*) hata diya hai kyunki ye ab mandatory nahi hai */}
    <label style={styles.label}>Email Address</label> 
    <input 
        style={styles.input} 
        type="email" 
        name="email" 
        value={form.email} 
        onChange={handleChange} 
        placeholder="client@example.com (Optional)" 
        /* required attribute hata diya gaya hai */
    />
</div>
                </div>

                <div style={styles.footer}>
                    <button type="submit" disabled={loading} style={styles.submitBtn}>
                        {loading ? "Saving..." : "Create Client Profile"}
                    </button>
                </div>
            </form>
        </BaseLayout>
    );
}

const styles = {
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", padding: "0 10px" },
    backBtn: { background: "none", border: "none", color: "#25343F", fontWeight: "700", cursor: "pointer", fontSize: "15px", display: "flex", alignItems: "center", gap: "5px" },
    pageTitle: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
    card: {
        background: "#ffffff",
        borderRadius: "16px",
        padding: "35px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        maxWidth: "600px",
        margin: "0 auto",
        border: "1px solid #E2E8F0"
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "1fr", 
        gap: "20px"
    },
    sectionHeader: {
        fontSize: "15px",
        fontWeight: "800",
        color: "#FF9B51", 
        marginBottom: "10px",
        paddingBottom: "8px",
        borderBottom: "2px solid #F1F5F9",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
    label: { fontSize: "14px", fontWeight: "700", color: "#475569" },
    input: { 
        padding: "12px 16px", 
        borderRadius: "10px", 
        border: "1px solid #CBD5E1", 
        fontSize: "14px", 
        backgroundColor: "#F8FAFC", 
        color: "#1E293B", 
        outline: "none",
        transition: "all 0.2s ease"
    },
    footer: { marginTop: "30px", borderTop: "1px solid #F1F5F9", paddingTop: "20px" },
    submitBtn: { 
        background: "#FF9B51", 
        color: "#fff", 
        border: "none", 
        padding: "14px", 
        borderRadius: "10px", 
        fontSize: "16px",
        fontWeight: "700", 
        cursor: "pointer", 
        boxShadow: "0 4px 15px rgba(255, 155, 81, 0.3)",
        width: "100%",
        transition: "transform 0.2s"
    }
};

export default AddClient;



// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/emp_base";

// function AddClient() {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);

//     const [form, setForm] = useState({
//         client_name: "",
//         company_name: "",
//         phone_number: "",
//         email: "",
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setForm({
//             ...form,
//             [name]: value
//         });
//     };

//     const handleSubmit = async(e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             // POST request to create client
//             await apiRequest("/employee-portal/clients/create/", "POST", form);

//             alert("✅ Client created successfully!");
//             navigate("/employee/clients"); // Create hone ke baad list page par bhej dega
//         } catch (error) {
//             console.error("Error creating client:", error);
//             alert("❌ Error: Client create nahi ho paya. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return ( <
//         BaseLayout >
//         <
//         div style = { styles.topBar } >
//         <
//         button onClick = {
//             () => navigate(-1)
//         }
//         style = { styles.backBtn } > ←Back < /button> <
//         h2 style = { styles.pageTitle } > Add New Client < /h2> < /
//         div >

//         <
//         form onSubmit = { handleSubmit }
//         style = { styles.card } >
//         <
//         div style = { styles.formGrid } >
//         <
//         div style = { styles.sectionHeader } > Client Information < /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Client Name * < /label> <
//         input style = { styles.input }
//         name = "client_name"
//         value = { form.client_name }
//         onChange = { handleChange }
//         placeholder = "e.g. John Doe"
//         required /
//         >
//         <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Company Name * < /label> <
//         input style = { styles.input }
//         name = "company_name"
//         value = { form.company_name }
//         onChange = { handleChange }
//         placeholder = "e.g. TCS"
//         required /
//         >
//         <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Phone Number * < /label> <
//         input style = { styles.input }
//         name = "phone_number"
//         value = { form.phone_number }
//         onChange = { handleChange }
//         placeholder = "e.g. 9876543210"
//         required /
//         >
//         <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Email Address * < /label> <
//         input style = { styles.input }
//         type = "email"
//         name = "email"
//         value = { form.email }
//         onChange = { handleChange }
//         placeholder = "client@example.com"
//         required /
//         >
//         <
//         /div> < /
//         div >

//         <
//         div style = { styles.footer } >
//         <
//         button type = "submit"
//         disabled = { loading }
//         style = { styles.submitBtn } > { loading ? "Saving..." : "Create Client" } <
//         /button> < /
//         div > <
//         /form> < /
//         BaseLayout >
//     );
// }

// const styles = {
//     topBar: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" },
//     backBtn: { background: "none", border: "none", color: "#25343F", fontWeight: "700", cursor: "pointer", fontSize: "15px" },
//     pageTitle: { fontSize: "22px", color: "#25343F", fontWeight: "800", margin: 0 },
//     card: {
//         background: "#BFC9D1", // Dark Theme Gray
//         borderRadius: "15px",
//         padding: "30px",
//         boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
//         maxWidth: "600px", // Client form chota hai toh width kam rakhi hai
//         margin: "0 auto"
//     },
//     formGrid: {
//         display: "grid",
//         gridTemplateColumns: "1fr", // Simple single column layout
//         gap: "20px"
//     },
//     sectionHeader: {
//         fontSize: "14px",
//         fontWeight: "700",
//         color: "#25343F",
//         borderBottom: "1px solid rgba(37, 52, 63, 0.1)",
//         paddingBottom: "8px",
//         textTransform: "uppercase",
//         letterSpacing: "0.5px"
//     },
//     inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
//     label: { fontSize: "13px", fontWeight: "700", color: "#25343F" },
//     input: {
//         padding: "12px",
//         borderRadius: "8px",
//         border: "1px solid rgba(37, 52, 63, 0.2)",
//         fontSize: "14px",
//         backgroundColor: "#EAEFEF", // Light input background
//         color: "#25343F",
//         outline: "none"
//     },
//     footer: { marginTop: "30px", textAlign: "center" },
//     submitBtn: {
//         background: "#FF9B51",
//         color: "#fff",
//         border: "none",
//         padding: "12px 50px",
//         borderRadius: "8px",
//         fontWeight: "700",
//         cursor: "pointer",
//         boxShadow: "0 4px 10px rgba(255, 155, 81, 0.2)",
//         width: "100%"
//     }
// };

// export default AddClient;