import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import BaseLayout from "../components/SubAdminLayout";

function UserManagement() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // 1. Fetch Users logic
    const fetchUsers = async () => {
        setLoading(true);
        try {
            // URL check: Django trailing slash zaroori hota hai
            const response = await apiRequest("/sub-admin/api/users/", "GET");
            
            console.log("Response from API:", response); // Console mein structure check karein

            // Agar Django paginated response bhej raha hai (.results ke andar)
            if (response && response.results) {
                setUsers(response.results);
            } 
            // Agar Django direct list bhej raha hai
            else if (Array.isArray(response)) {
                setUsers(response);
            } 
            else {
                setUsers([]);
            }
        } catch (error) {
            console.error("API Call failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. Delete Logic
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await apiRequest(`/sub-admin/api/users/${id}/`, "DELETE");
                // Local state update karein taaki user list se turant hat jaye
                setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
            } catch (error) {
                alert("Error deleting user. Please try again.");
            }
        }
    };

    // 3. Filter Logic (Name or Email search)
    const filteredUsers = (users || []).filter(user => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query);
    });

    return (
        <BaseLayout>
            {/* Header section with theme colors */}
            <div style={styles.topBar}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
                <div style={styles.searchContainer}>
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        style={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button onClick={() => navigate("/sub-admin/add-user")} style={styles.addBtn}>
                    + Add Member
                </button>
            </div>

            <div style={styles.section}>
                <h2 style={styles.pageTitle}>Employee Management</h2>

                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Full Name</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Phone</th>
                                <th style={styles.th}>Role</th>
                                <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={styles.statusText}>Loading data from server...</td>
                                </tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} style={styles.tableRow}>
                                        <td style={styles.td}>#{user.id}</td>
                                        <td style={styles.td}>
                                            <div style={styles.userName}>
                                                {user.first_name} {user.last_name}
                                            </div>
                                        </td>
                                        <td style={styles.td}>{user.email}</td>
                                        <td style={styles.td}>{user.number || "N/A"}</td>
                                        <td style={styles.td}>
                                            <span style={styles.roleBadge}>{user.role}</span>
                                        </td>
                                        <td style={styles.actionTd}>
                                            <button onClick={() => navigate(`/sub-admin/users/view/${user.id}`)} style={styles.viewBtn}>View</button>
                                            <button onClick={() => navigate(`/sub-admin/users/edit/${user.id}`)} style={styles.editBtn}>Edit</button>
                                            <button onClick={() => handleDelete(user.id)} style={styles.deleteBtn}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={styles.statusText}>No employees matching your search.</td>
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
    searchInput: { width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid #BFC9D1", outline: "none", fontSize: "14px" },
    addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 155, 81, 0.3)" },
    section: { padding: "10px", borderRadius: "12px" },
    pageTitle: { fontSize: "22px", color: "#25343F", marginBottom: "20px", fontWeight: "800" },
    tableWrapper: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(37, 52, 63, 0.08)", border: "1px solid #BFC9D1" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { background: "#BFC9D1" },
    th: { padding: "16px", textAlign: "left", color: "#25343F", fontSize: "14px", fontWeight: "700" },
    tableRow: { borderBottom: "1px solid #EAEFEF" },
    td: { padding: "16px", color: "#25343F", fontSize: "14px" },
    userName: { fontWeight: "700", color: "#25343F" },
    roleBadge: { background: "#EAEFEF", color: "#25343F", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" },
    actionTd: { display: "flex", gap: "8px", padding: "16px", justifyContent: "center" },
    viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #BFC9D1", background: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
    editBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#25343F", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
    deleteBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#ff4d4d", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
    statusText: { textAlign: "center", padding: "40px", color: "#BFC9D1", fontWeight: "600" }
};

export default UserManagement;
