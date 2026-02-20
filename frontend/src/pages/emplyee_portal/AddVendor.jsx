import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import BaseLayout from "../components/emp_base";

function AddVendor() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [benchListFile, setBenchListFile] = useState(null);

    const [form, setForm] = useState({
        name: "",
        number: "",
        company_name: "",
        email: "",
        company_website: "",
        company_pan_or_reg_no: "",
        poc1_name: "",
        poc1_number: "",
        poc2_name: "",
        poc2_number: "",
        top_3_clients: "",
        no_of_bench_developers: 0,
        provide_onsite: false,
        onsite_location: "",
        specialized_tech_developers: "",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : (type === "number" ? parseInt(value) || 0 : value)
        });
    };

    const handleFileChange = (e) => {
        setBenchListFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        Object.keys(form).forEach((key) => {
            formData.append(key, form[key]);
        });

        if (benchListFile) {
            formData.append("bench_list", benchListFile);
        }

        try {
            await apiRequest("/employee-portal/api/vendors/create/", "POST", formData);
            alert("Vendor created successfully!");
            navigate("/employee/vendor/add"); // Navigating to list after success
        } catch (error) {
            alert("Error creating vendor. Please check all fields.");
            console.error(error);
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
                <h2 style={styles.pageTitle}>Create New Vendor</h2>
            </div>

            <form onSubmit={handleSubmit} style={styles.card}>
                <div style={styles.formGrid}>
                    <div style={styles.sectionHeader}>Required Information</div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Vendor Name *</label>
                        <input style={styles.input} name="name" onChange={handleChange} required placeholder="Enter full name" />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Phone Number *</label>
                        <input style={styles.input} name="number" onChange={handleChange} required placeholder="+91..." />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Company Name *</label>
                        <input style={styles.input} name="company_name" onChange={handleChange} required placeholder="Company Pvt Ltd" />
                    </div>

                    <div style={styles.sectionHeader}>Company Details</div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input style={styles.input} type="email" name="email" onChange={handleChange} placeholder="vendor@example.com" />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Website URL</label>
                        <input style={styles.input} name="company_website" onChange={handleChange} placeholder="https://..." />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>PAN / Reg No.</label>
                        <input style={styles.input} name="company_pan_or_reg_no" onChange={handleChange} placeholder="ABCDE1234F" />
                    </div>

                    <div style={styles.sectionHeader}>Point of Contact (POC)</div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>POC 1 Name</label>
                        <input style={styles.input} name="poc1_name" onChange={handleChange} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>POC 1 Number</label>
                        <input style={styles.input} name="poc1_number" onChange={handleChange} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>POC 2 Name</label>
                        <input style={styles.input} name="poc2_name" onChange={handleChange} />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>POC 2 Number</label>
                        <input style={styles.input} name="poc2_number" onChange={handleChange} />
                    </div>

                    <div style={styles.sectionHeader}>Developer & Bench Info</div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Top 3 Clients</label>
                        <input style={styles.input} name="top_3_clients" onChange={handleChange} placeholder="Client A, Client B, Client C" />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Bench Developers Count</label>
                        <input style={styles.input} type="number" name="no_of_bench_developers" onChange={handleChange} min="0" />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Specialized Technologies</label>
                        <input style={styles.input} name="specialized_tech_developers" onChange={handleChange} placeholder="e.g. React, Java, Python" />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Bench List (Upload File)</label>
                        <input style={styles.fileInput} type="file" onChange={handleFileChange} />
                    </div>
                </div>

                <div style={styles.checkboxWrapper}>
                    <input type="checkbox" id="onsite" name="provide_onsite" onChange={handleChange} style={styles.checkbox} />
                    <label htmlFor="onsite" style={styles.checkLabel}>Provide Onsite Support?</label>
                </div>

                {form.provide_onsite && (
                    <div style={{ ...styles.inputGroup, marginTop: '15px', maxWidth: '400px' }}>
                        <label style={styles.label}>Onsite Location</label>
                        <input style={styles.input} name="onsite_location" onChange={handleChange} placeholder="Enter city or office" />
                    </div>
                )}

                <div style={styles.footer}>
                    <button type="submit" disabled={loading} style={styles.submitBtn}>
                        {loading ? "Processing..." : "Save Vendor Details"}
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
        maxWidth: "1000px",
        margin: "0 auto",
        border: "1px solid #E2E8F0"
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px"
    },
    sectionHeader: {
        gridColumn: "1 / -1",
        fontSize: "15px",
        fontWeight: "800",
        color: "#FF9B51", // Orange accents for headers
        marginTop: "30px",
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
        transition: "all 0.2s ease",
        focus: { border: "1px solid #FF9B51" }
    },
    fileInput: {
        padding: "8px",
        fontSize: "14px",
        color: "#475569"
    },
    checkboxWrapper: { display: "flex", alignItems: "center", gap: "12px", marginTop: "30px" },
    checkbox: { width: "18px", height: "18px", cursor: "pointer", accentColor: "#FF9B51" },
    checkLabel: { fontWeight: "700", color: "#25343F", fontSize: "15px", cursor: "pointer" },
    footer: { marginTop: "40px", textAlign: "right", borderTop: "1px solid #F1F5F9", paddingTop: "25px" },
    submitBtn: { 
        background: "#FF9B51", 
        color: "#fff", 
        border: "none", 
        padding: "14px 45px", 
        borderRadius: "10px", 
        fontSize: "16px",
        fontWeight: "700", 
        cursor: "pointer", 
        boxShadow: "0 4px 15px rgba(255, 155, 81, 0.3)",
        transition: "transform 0.2s"
    }
};

export default AddVendor;



// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/emp_base";

// function AddVendor() {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);
//     const [benchListFile, setBenchListFile] = useState(null);

//     const [form, setForm] = useState({
//         name: "",
//         number: "",
//         company_name: "",
//         email: "",
//         company_website: "",
//         company_pan_or_reg_no: "",
//         poc1_name: "",
//         poc1_number: "",
//         poc2_name: "",
//         poc2_number: "",
//         top_3_clients: "",
//         no_of_bench_developers: 0,
//         provide_onsite: false,
//         onsite_location: "",
//         specialized_tech_developers: "",
//     });

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setForm({
//             ...form,
//             [name]: type === "checkbox" ? checked : (type === "number" ? parseInt(value) || 0 : value)
//         });
//     };

//     const handleFileChange = (e) => {
//         setBenchListFile(e.target.files[0]);
//     };

//     const handleSubmit = async(e) => {
//         e.preventDefault();
//         setLoading(true);

//         // --- FILE UPLOAD LOGIC START ---
//         const formData = new FormData();

//         // Append all text fields from state to FormData
//         Object.keys(form).forEach((key) => {
//             formData.append(key, form[key]);
//         });

//         // Append the file if selected
//         if (benchListFile) {
//             formData.append("bench_list", benchListFile);
//         }
//         // --- FILE UPLOAD LOGIC END ---

//         try {
//             // Ab hum 'form' ki jagah 'formData' bhejenge
//             await apiRequest("/employee-portal/api/vendors/create/", "POST", formData);
//             alert("Vendor created successfully !");
//             navigate("/employee/vendor/add");
//         } catch (error) {
//             alert("Error creating vendor. Please check all fields.");
//             console.error(error);
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
//         h2 style = { styles.pageTitle } > Add New Vendor < /h2> < /
//         div >

//         <
//         form onSubmit = { handleSubmit }
//         style = { styles.card } >
//         <
//         div style = { styles.formGrid } >
//         <
//         div style = { styles.sectionHeader } > Required Info < /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Vendor Name * < /label> <
//         input style = { styles.input }
//         name = "name"
//         onChange = { handleChange }
//         required / >
//         <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Phone Number * < /label> <
//         input style = { styles.input }
//         name = "number"
//         onChange = { handleChange }
//         required / >
//         <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Company Name * < /label> <
//         input style = { styles.input }
//         name = "company_name"
//         onChange = { handleChange }
//         required / >
//         <
//         /div>

//         <
//         div style = { styles.sectionHeader } > Company Details < /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Email < /label> <
//         input style = { styles.input }
//         type = "email"
//         name = "email"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Website < /label> <
//         input style = { styles.input }
//         name = "company_website"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > PAN / Reg No. < /label> <
//         input style = { styles.input }
//         name = "company_pan_or_reg_no"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.sectionHeader } > Point of Contact(POC) < /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > POC 1 Name < /label> <
//         input style = { styles.input }
//         name = "poc1_name"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > POC 1 Number < /label> <
//         input style = { styles.input }
//         name = "poc1_number"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > POC 2 Name < /label> <
//         input style = { styles.input }
//         name = "poc2_name"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > POC 2 Number < /label> <
//         input style = { styles.input }
//         name = "poc2_number"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.sectionHeader } > Developer & Bench Info < /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Top 3 Clients < /label> <
//         input style = { styles.input }
//         name = "top_3_clients"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Bench Developers Count < /label> <
//         input style = { styles.input }
//         type = "number"
//         name = "no_of_bench_developers"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Specialized Technologies < /label> <
//         input style = { styles.input }
//         name = "specialized_tech_developers"
//         onChange = { handleChange }
//         placeholder = "e.g. React, Java, Python" / >
//         <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Bench List(File Upload) < /label> <
//         input style = { styles.input }
//         type = "file"
//         onChange = { handleFileChange }
//         /> < /
//         div > <
//         /div>

//         <
//         div style = { styles.checkboxWrapper } >
//         <
//         input type = "checkbox"
//         id = "onsite"
//         name = "provide_onsite"
//         onChange = { handleChange }
//         /> <
//         label htmlFor = "onsite"
//         style = { styles.checkLabel } > Provide Onsite Support ? < /label> < /
//         div >

//         {
//             form.provide_onsite && ( <
//                 div style = {
//                     {...styles.inputGroup, marginTop: '15px' }
//                 } >
//                 <
//                 label style = { styles.label } > Onsite Location < /label> <
//                 input style = { styles.input }
//                 name = "onsite_location"
//                 onChange = { handleChange }
//                 /> < /
//                 div >
//             )
//         }

//         <
//         div style = { styles.footer } >
//         <
//         button type = "submit"
//         disabled = { loading }
//         style = { styles.submitBtn } > { loading ? "Saving..." : "Save Vendor" } <
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
//         background: "#BFC9D1",
//         borderRadius: "15px",
//         padding: "25px",
//         boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
//         maxWidth: "850px",
//         margin: "0 auto"
//     },
//     formGrid: {
//         display: "grid",
//         gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
//         gap: "15px"
//     },
//     sectionHeader: {
//         gridColumn: "1 / -1",
//         fontSize: "14px",
//         fontWeight: "700",
//         color: "#25343F",
//         marginTop: "20px",
//         borderBottom: "1px solid rgba(37, 52, 63, 0.1)",
//         paddingBottom: "5px",
//         textTransform: "uppercase"
//     },
//     inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
//     label: { fontSize: "13px", fontWeight: "700", color: "#25343F" },
//     input: { padding: "10px", borderRadius: "8px", border: "1px solid rgba(37, 52, 63, 0.2)", fontSize: "14px", backgroundColor: "#EAEFEF", color: "#25343F", outline: "none" },
//     checkboxWrapper: { display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" },
//     checkLabel: { fontWeight: "700", color: "#25343F", fontSize: "14px", cursor: "pointer" },
//     footer: { marginTop: "25px", textAlign: "right" },
//     submitBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "12px 35px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 10px rgba(255, 155, 81, 0.2)" }
// };

// export default AddVendor;







// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/emp_base";

// function AddVendor() {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);
//     const [benchListFile, setBenchListFile] = useState(null); // File state alag rakhi hai

//     const [form, setForm] = useState({
//         name: "",
//         number: "",
//         company_name: "",
//         email: "",
//         company_website: "",
//         company_pan_or_reg_no: "",
//         poc1_name: "",
//         poc1_number: "",
//         poc2_name: "",
//         poc2_number: "",
//         top_3_clients: "",
//         no_of_bench_developers: 0,
//         provide_onsite: false,
//         onsite_location: "",
//         specialized_tech_developers: "",
//     });

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setForm({
//             ...form,
//             [name]: type === "checkbox" ? checked : (type === "number" ? parseInt(value) || 0 : value)
//         });
//     };

//     const handleFileChange = (e) => {
//         setBenchListFile(e.target.files[0]); // File select logic
//     };

//     const handleSubmit = async(e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             // Note: bench_list file sirf tabhi jayegi jab api.js update hoga.
//             // Abhi ye sirf text data bhej raha hai.
//             await apiRequest("/employee-portal/api/vendors/create/", "POST", form);
//             alert("Vendor created successfully!");
//             navigate("/employee/vendors");
//         } catch (error) {
//             alert("Error creating vendor. Please try again.");
//             console.error(error);
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
//             () => navigate(-1) }
//         style = { styles.backBtn } > ←Back < /button> <
//         h2 style = { styles.pageTitle } > Add New Vendor < /h2> <
//         /div>

//         <
//         form onSubmit = { handleSubmit }
//         style = { styles.card } >
//         <
//         div style = { styles.formGrid } >
//         <
//         div style = { styles.sectionHeader } > Required Info < /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Vendor Name * < /label> <
//         input style = { styles.input }
//         name = "name"
//         onChange = { handleChange }
//         required / >
//         <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Phone Number * < /label> <
//         input style = { styles.input }
//         name = "number"
//         onChange = { handleChange }
//         required / >
//         <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Company Name * < /label> <
//         input style = { styles.input }
//         name = "company_name"
//         onChange = { handleChange }
//         required / >
//         <
//         /div>

//         <
//         div style = { styles.sectionHeader } > Company Details < /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Email < /label> <
//         input style = { styles.input }
//         type = "email"
//         name = "email"
//         onChange = { handleChange }
//         /> <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Website < /label> <
//         input style = { styles.input }
//         name = "company_website"
//         onChange = { handleChange }
//         /> <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > PAN / Reg No. < /label> <
//         input style = { styles.input }
//         name = "company_pan_or_reg_no"
//         onChange = { handleChange }
//         /> <
//         /div>

//         <
//         div style = { styles.sectionHeader } > Point of Contact(POC) < /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > POC 1 Name < /label> <
//         input style = { styles.input }
//         name = "poc1_name"
//         onChange = { handleChange }
//         /> <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > POC 1 Number < /label> <
//         input style = { styles.input }
//         name = "poc1_number"
//         onChange = { handleChange }
//         /> <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > POC 2 Name < /label> <
//         input style = { styles.input }
//         name = "poc2_name"
//         onChange = { handleChange }
//         /> <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > POC 2 Number < /label> <
//         input style = { styles.input }
//         name = "poc2_number"
//         onChange = { handleChange }
//         /> <
//         /div>

//         <
//         div style = { styles.sectionHeader } > Developer & Bench Info < /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Top 3 Clients < /label> <
//         input style = { styles.input }
//         name = "top_3_clients"
//         onChange = { handleChange }
//         /> <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Bench Developers Count < /label> <
//         input style = { styles.input }
//         type = "number"
//         name = "no_of_bench_developers"
//         onChange = { handleChange }
//         /> <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Specialized Technologies < /label> <
//         input style = { styles.input }
//         name = "specialized_tech_developers"
//         onChange = { handleChange }
//         placeholder = "e.g. React, Java, Python" / >
//         <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Bench List(File Upload) < /label> <
//         input style = { styles.input }
//         type = "file"
//         onChange = { handleFileChange }
//         /> <
//         small style = {
//             { color: '#666', fontSize: '11px' } } >
//         File will be selected but upload requires API update <
//         /small> <
//         /div> <
//         /div>

//         <
//         div style = { styles.checkboxWrapper } >
//         <
//         input type = "checkbox"
//         id = "onsite"
//         name = "provide_onsite"
//         onChange = { handleChange }
//         /> <
//         label htmlFor = "onsite"
//         style = { styles.checkLabel } > Provide Onsite Support ? < /label> <
//         /div>

//         {
//             form.provide_onsite && ( <
//                 div style = {
//                     {...styles.inputGroup, marginTop: '15px' } } >
//                 <
//                 label style = { styles.label } > Onsite Location < /label> <
//                 input style = { styles.input }
//                 name = "onsite_location"
//                 onChange = { handleChange }
//                 /> <
//                 /div>
//             )
//         }

//         <
//         div style = { styles.footer } >
//         <
//         button type = "submit"
//         disabled = { loading }
//         style = { styles.submitBtn } > { loading ? "Creating..." : "Save Vendor" } <
//         /button> <
//         /div> <
//         /form> <
//         /BaseLayout>
//     );
// }

// const styles = {
//     topBar: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" },
//     backBtn: { background: "none", border: "none", color: "#25343F", fontWeight: "700", cursor: "pointer", fontSize: "15px" },
//     pageTitle: { fontSize: "22px", color: "#25343F", fontWeight: "800", margin: 0 },
//     card: {
//         background: "#BFC9D1",
//         borderRadius: "15px",
//         padding: "25px",
//         boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
//         maxWidth: "850px",
//         margin: "0 auto"
//     },
//     formGrid: {
//         display: "grid",
//         gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
//         gap: "15px"
//     },
//     sectionHeader: {
//         gridColumn: "1 / -1",
//         fontSize: "14px",
//         fontWeight: "700",
//         color: "#25343F",
//         marginTop: "20px",
//         borderBottom: "1px solid rgba(37, 52, 63, 0.1)",
//         paddingBottom: "5px",
//         textTransform: "uppercase"
//     },
//     inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
//     label: { fontSize: "13px", fontWeight: "700", color: "#25343F" },
//     input: { padding: "10px", borderRadius: "8px", border: "1px solid rgba(37, 52, 63, 0.2)", fontSize: "14px", backgroundColor: "#EAEFEF", color: "#25343F", outline: "none" },
//     checkboxWrapper: { display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" },
//     checkLabel: { fontWeight: "700", color: "#25343F", fontSize: "14px", cursor: "pointer" },
//     footer: { marginTop: "25px", textAlign: "right" },
//     submitBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "12px 35px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 10px rgba(255, 155, 81, 0.2)" }
// };

// export default AddVendor;



// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/emp_base";

// function AddVendor() {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);
//     const [form, setForm] = useState({
//         name: "",
//         number: "",
//         company_name: "",
//         email: "",
//         company_website: "",
//         company_pan_or_reg_no: "",
//         poc1_name: "",
//         poc1_number: "",
//         poc2_name: "",
//         poc2_number: "",
//         top_3_clients: "",
//         no_of_bench_developers: 0,
//         provide_onsite: false,
//         onsite_location: "",
//         specialized_tech_developers: "",
//     });

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setForm({
//             ...form,
//             [name]: type === "checkbox" ? checked : (type === "number" ? parseInt(value) || 0 : value)
//         });
//     };

//     const handleSubmit = async(e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             // Note: bench_list file JSON format mein support nahi hogi bina api.js change kiye
//             await apiRequest("/employee-portal/api/vendors/create/", "POST", form);
//             alert("Vendor created successfully!");
//             navigate("/employee/vendors");
//         } catch (error) {
//             alert("Error creating vendor. Please try again.");
//             console.error(error);
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
//         h2 style = { styles.pageTitle } > Add New Vendor < /h2> < /
//         div >

//         <
//         form onSubmit = { handleSubmit }
//         style = { styles.card } >
//         <
//         div style = { styles.formGrid } >
//         <
//         div style = { styles.sectionHeader } > Required Info < /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Vendor Name * < /label> <
//         input style = { styles.input }
//         name = "name"
//         onChange = { handleChange }
//         required / >
//         <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Phone Number * < /label> <
//         input style = { styles.input }
//         name = "number"
//         onChange = { handleChange }
//         required / >
//         <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Company Name * < /label> <
//         input style = { styles.input }
//         name = "company_name"
//         onChange = { handleChange }
//         required / >
//         <
//         /div>

//         <
//         div style = { styles.sectionHeader } > Company Details < /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Email < /label> <
//         input style = { styles.input }
//         type = "email"
//         name = "email"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Website < /label> <
//         input style = { styles.input }
//         name = "company_website"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > PAN / Reg No. < /label> <
//         input style = { styles.input }
//         name = "company_pan_or_reg_no"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.sectionHeader } > Point of Contact(POC) < /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > POC 1 Name < /label> <
//         input style = { styles.input }
//         name = "poc1_name"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > POC 1 Number < /label> <
//         input style = { styles.input }
//         name = "poc1_number"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > POC 2 Name < /label> <
//         input style = { styles.input }
//         name = "poc2_name"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > POC 2 Number < /label> <
//         input style = { styles.input }
//         name = "poc2_number"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.sectionHeader } > Developer & Bench Info < /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Top 3 Clients < /label> <
//         input style = { styles.input }
//         name = "top_3_clients"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Bench Developers Count < /label> <
//         input style = { styles.input }
//         type = "number"
//         name = "no_of_bench_developers"
//         onChange = { handleChange }
//         /> < /
//         div >

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Specialized Technologies < /label> <
//         input style = { styles.input }
//         name = "specialized_tech_developers"
//         onChange = { handleChange }
//         placeholder = "e.g. React, Java, Python" / >
//         <
//         /div>

//         <
//         div style = { styles.inputGroup } >
//         <
//         label style = { styles.label } > Bench List(File Upload) < /label> <
//         input style = { styles.input }
//         type = "file"
//         disabled / >
//         <
//         small style = {
//             { color: '#666', fontSize: '11px' }
//         } > File upload requires API update < /small> < /
//         div > <
//         /div>

//         <
//         div style = { styles.checkboxWrapper } >
//         <
//         input type = "checkbox"
//         id = "onsite"
//         name = "provide_onsite"
//         onChange = { handleChange }
//         /> <
//         label htmlFor = "onsite"
//         style = { styles.checkLabel } > Provide Onsite Support ? < /label> < /
//         div >

//         {
//             form.provide_onsite && ( <
//                 div style = {
//                     {...styles.inputGroup, marginTop: '15px' }
//                 } >
//                 <
//                 label style = { styles.label } > Onsite Location < /label> <
//                 input style = { styles.input }
//                 name = "onsite_location"
//                 onChange = { handleChange }
//                 /> < /
//                 div >
//             )
//         }

//         <
//         div style = { styles.footer } >
//         <
//         button type = "submit"
//         disabled = { loading }
//         style = { styles.submitBtn } > { loading ? "Creating..." : "Save Vendor" } <
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
//         background: "#BFC9D1",
//         borderRadius: "15px",
//         padding: "25px",
//         boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
//         maxWidth: "850px",
//         margin: "0 auto"
//     },
//     formGrid: {
//         display: "grid",
//         gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
//         gap: "15px"
//     },
//     sectionHeader: {
//         gridColumn: "1 / -1",
//         fontSize: "14px",
//         fontWeight: "700",
//         color: "#25343F",
//         marginTop: "20px",
//         borderBottom: "1px solid rgba(37, 52, 63, 0.1)",
//         paddingBottom: "5px",
//         textTransform: "uppercase"
//     },
//     inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
//     label: { fontSize: "13px", fontWeight: "700", color: "#25343F" },
//     input: {
//         padding: "10px",
//         borderRadius: "8px",
//         border: "1px solid rgba(37, 52, 63, 0.2)",
//         fontSize: "14px",
//         backgroundColor: "#EAEFEF",
//         color: "#25343F",
//         outline: "none"
//     },
//     checkboxWrapper: { display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" },
//     checkLabel: { fontWeight: "700", color: "#25343F", fontSize: "14px", cursor: "pointer" },
//     footer: { marginTop: "25px", textAlign: "right" },
//     submitBtn: {
//         background: "#FF9B51",
//         color: "#fff",
//         border: "none",
//         padding: "12px 35px",
//         borderRadius: "8px",
//         fontWeight: "700",
//         cursor: "pointer",
//         boxShadow: "0 4px 10px rgba(255, 155, 81, 0.2)"
//     }
// };

// export default AddVendor;