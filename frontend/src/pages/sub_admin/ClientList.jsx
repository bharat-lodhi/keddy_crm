import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import BaseLayout from "../components/SubAdminLayout";

function ClientList() {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Clients from API
    const fetchClients = async () => {
        setLoading(true);
        try {
            const response = await apiRequest("/sub-admin/api/admin-clients/", "GET");
            setClients(Array.isArray(response) ? response : response.results || []);
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    // Filter Logic
    const filteredClients = clients.filter(client => 
        client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <BaseLayout>
            {/* Top Navigation & Actions */}
            <div style={styles.topBar}>
                <button onClick={() => navigate("/employee")} style={styles.backBtn}>← Back to Dashboard</button>
                <div style={styles.searchContainer}>
                    <input 
                        type="text" 
                        placeholder="Search clients or companies..." 
                        style={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button onClick={() => navigate("/sub-admin/client/add")} style={styles.addBtn}>
                    + Add Client
                </button>
            </div>

            <div style={styles.section}>
                <h2 style={styles.pageTitle}>Client Directory</h2>

                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Client & Company</th>
                                <th style={styles.th}>Contact</th>
                                <th style={styles.th}>Profiles</th> {/* Naya Column */}
                                <th style={styles.th}>Created By</th> {/* Naya Column */}
                                <th style={styles.th}>Date</th>
                                <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>Loading clients...</td>
                                </tr>
                            ) : filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <tr key={client.id} style={styles.tableRow}>
                                        <td style={styles.td}>#{client.id}</td>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: "700", color: "#25343F" }}>{client.client_name}</div>
                                            <div style={{ fontSize: "12px", color: "#BFC9D1" }}>{client.company_name}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div>{client.phone_number}</div>
                                            <div style={{ fontSize: "12px", color: "#BFC9D1" }}>{client.email || "No Email"}</div>
                                        </td>
                                        
                                        {/* Profile Count Badge */}
                                        <td style={styles.td}>
                                            <span style={styles.profileBadge}>
                                                {client.profile_count} Profiles
                                            </span>
                                        </td>

                                        {/* Created By Info */}
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: "600", fontSize: "13px" }}>{client.created_by_name}</div>
                                            <div style={{ fontSize: "11px", color: "#BFC9D1" }}>{client.created_by_email}</div>
                                        </td>

                                        <td style={styles.td}>
                                            {new Date(client.created_at).toLocaleDateString()}
                                        </td>
                                        
                                        <td style={styles.actionTd}>
                                            <button style={styles.viewBtn} onClick={() => navigate(`/sub-admin/client/view/${client.id}`)}>View</button>
                                            <button style={styles.editBtn} onClick={() => navigate(`/sub-admin/client/edit/${client.id}`)}>Edit</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>No clients found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </BaseLayout>
    );
}

const styles = {
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", gap: "15px" },
    backBtn: { background: "transparent", color: "#25343F", border: "none", fontSize: "15px", fontWeight: "700", cursor: "pointer" },
    searchContainer: { flex: 1, maxWidth: "400px" },
    searchInput: { width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid #BFC9D1", outline: "none" },
    addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 155, 81, 0.3)" },
    pageTitle: { fontSize: "24px", color: "#25343F", marginBottom: "20px", fontWeight: "800" },
    tableWrapper: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(37, 52, 63, 0.08)", border: "1px solid #EAEFEF" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { background: "#BFC9D1" },
    th: { padding: "16px", textAlign: "left", color: "#25343F", fontSize: "14px", fontWeight: "700" },
    tableRow: { borderBottom: "1px solid #EAEFEF" },
    td: { padding: "16px", color: "#25343F", fontSize: "14px" },
    profileBadge: { 
        background: "#EAEFEF", 
        color: "#25343F", 
        padding: "5px 12px", 
        borderRadius: "20px", 
        fontSize: "12px", 
        fontWeight: "700",
        border: "1px solid #BFC9D1"
    },
    actionTd: { display: "flex", gap: "8px", padding: "16px", justifyContent: "center" },
    viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #BFC9D1", background: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
    editBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#25343F", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
};

export default ClientList;





// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/SubAdminLayout";

// function ClientList() {
//     const navigate = useNavigate();
//     const [clients, setClients] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchQuery, setSearchQuery] = useState("");

//     // Fetch Clients from API
//     const fetchClients = async () => {
//         setLoading(true);
//         try {
//             // Note: Agar pagination chahiye toh URL badal sakte hain
//             const response = await apiRequest("/sub-admin/api/admin-clients/", "GET");
//             // Direct array aa raha hai toh seedhe set karenge
//             setClients(Array.isArray(response) ? response : response.results || []);
//         } catch (error) {
//             console.error("Error fetching clients:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchClients();
//     }, []);

//     // Filter Logic (Frontend Search)
//     const filteredClients = clients.filter(client => 
//         client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         client.company_name.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     return (
//         <BaseLayout>
//             {/* Top Navigation & Actions */}
//             <div style={styles.topBar}>
//                 <button onClick={() => navigate("/employee")} style={styles.backBtn}>← Back to Dashboard</button>
//                 <div style={styles.searchContainer}>
//                     <input 
//                         type="text" 
//                         placeholder="Search clients or companies..." 
//                         style={styles.searchInput}
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                 </div>
//                 <button onClick={() => navigate("/sub-admin/client/add")} style={styles.addBtn}>
//                     + Add Client
//                 </button>
//             </div>

//             <div style={styles.section}>
//                 <h2 style={styles.pageTitle}>Client Directory</h2>

//                 <div style={styles.tableWrapper}>
//                     <table style={styles.table}>
//                         <thead>
//                             <tr style={styles.tableHeader}>
//                                 <th style={styles.th}>ID</th>
//                                 <th style={styles.th}>Client Name</th>
//                                 <th style={styles.th}>Company</th>
//                                 <th style={styles.th}>Phone</th>
//                                 <th style={styles.th}>Email</th>
//                                 <th style={styles.th}>Created At</th>
//                                 <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {loading ? (
//                                 <tr>
//                                     <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>Loading clients...</td>
//                                 </tr>
//                             ) : filteredClients.length > 0 ? (
//                                 filteredClients.map((client) => (
//                                     <tr key={client.id} style={styles.tableRow}>
//                                         <td style={styles.td}>{client.id}</td>
//                                         <td style={styles.td}><strong>{client.client_name}</strong></td>
//                                         <td style={styles.td}>{client.company_name}</td>
//                                         <td style={styles.td}>{client.phone_number}</td>
//                                         <td style={styles.td}>{client.email}</td>
//                                         <td style={styles.td}>
//                                             {new Date(client.created_at).toLocaleDateString()}
//                                         </td>
//                                         <td style={styles.actionTd}>
//                                             <button style={styles.viewBtn}>View</button>
//                                             <button style={styles.editBtn}>Edit</button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>No clients found.</td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </BaseLayout>
//     );
// }

// const styles = {
//     topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", gap: "15px" },
//     backBtn: { background: "transparent", color: "#25343F", border: "none", fontSize: "15px", fontWeight: "700", cursor: "pointer" },
//     searchContainer: { flex: 1, maxWidth: "400px" },
//     searchInput: { width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid #BFC9D1", outline: "none" },
//     addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 155, 81, 0.3)" },
//     pageTitle: { fontSize: "24px", color: "#25343F", marginBottom: "20px", fontWeight: "800" },
//     tableWrapper: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(37, 52, 63, 0.08)", border: "1px solid #EAEFEF" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#BFC9D1" },
//     th: { padding: "16px", textAlign: "left", color: "#25343F", fontSize: "14px", fontWeight: "700" },
//     tableRow: { borderBottom: "1px solid #EAEFEF" },
//     td: { padding: "16px", color: "#25343F", fontSize: "14px" },
//     actionTd: { display: "flex", gap: "8px", padding: "16px", justifyContent: "center" },
//     viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #BFC9D1", background: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
//     editBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#25343F", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
// };

// export default ClientList;