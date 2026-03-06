import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import BaseLayout from "../components/SubAdminLayout";

function VendorList() {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [employees, setEmployees] = useState([]); // For assignment
    const [loading, setLoading] = useState(true);

    // States
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);

    // Interaction States
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState({ show: false, vendorId: null });
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [empSearch, setEmpSearch] = useState("");
    const [toast, setToast] = useState({ show: false, msg: "", type: "" });

    const getAuthHeaders = () => {
        const token = localStorage.getItem("access_token") || localStorage.getItem("token");
        return {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    };

    const notify = (msg, type = "success") => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
    };

    const fetchVendors = async (page = 1, search = "") => {
        setLoading(true);
        try {
            const url = `/sub-admin/api/admin-vendors/?page=${page}&search=${search}`;
            const response = await apiRequest(url, "GET", null, getAuthHeaders());
            setVendors(response.results || []);
            setTotalCount(response.count || 0);
            setHasNext(!!response.next);
            setHasPrev(!!response.previous);
        } catch (error) {
            console.error("Error fetching vendors:", error);
        } finally { setLoading(false); }
    };

    const fetchEmployees = async () => {
        try {
            const response = await apiRequest("/sub-admin/api/users/", "GET", null, getAuthHeaders());
            setEmployees(response.results || []);
        } catch (error) { console.error("Employee fetch error:", error); }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchVendors(currentPage, searchQuery);
        }, 500);
        fetchEmployees();
        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, searchQuery]);

    // Handle Assign
    const handleAssignSubmit = async () => {
        if (selectedVendors.length === 0 || selectedEmployees.length === 0) {
            return notify("Select vendors and employees first", "error");
        }
        try {
            const promises = selectedVendors.map(vendorId => 
                apiRequest("/sub-admin/api/vendors/assign/", "POST", {
                    vendor_id: vendorId,
                    employee_ids: selectedEmployees
                }, getAuthHeaders())
            );
            await Promise.all(promises);
            notify(`Successfully assigned to ${selectedEmployees.length} employees`);
            setShowAssignModal(false);
            setSelectedVendors([]);
            setSelectedEmployees([]);
            fetchVendors(currentPage, searchQuery);
        } catch (error) { notify("Assignment Failed", "error"); }
    };

    // Handle Delete (Soft/Hard)
    const handleDelete = async (type) => {
        const vendorId = showDeleteModal.vendorId;
        const endpoint = type === 'soft' 
            ? `/sub-admin/api/vendors/${vendorId}/soft-delete/` 
            : `/sub-admin/api/vendors/${vendorId}/hard-delete/`;
        
        try {
            await apiRequest(endpoint, "DELETE", null, getAuthHeaders());
            notify(type === 'soft' ? "Vendor moved to trash" : "Vendor deleted permanently");
            setShowDeleteModal({ show: false, vendorId: null });
            fetchVendors(currentPage, searchQuery);
        } catch (error) { notify("Delete failed", "error"); }
    };

    const toggleVendorSelection = (id) => {
        setSelectedVendors(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
    };

    return (
        <BaseLayout>
            {toast.show && <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#E74C3C' : '#27AE60'}}>{toast.msg}</div>}

            <div style={styles.topBar}>
                <button onClick={() => navigate("/sub-admin")} style={styles.backBtn}>← Back</button>
                <div style={styles.searchContainer}>
                    <input 
                        type="text" 
                        placeholder="Search vendors..." 
                        style={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    {selectedVendors.length > 0 && (
                        <button style={styles.assignBtn} onClick={() => setShowAssignModal(true)}>
                            Assign Selected ({selectedVendors.length})
                        </button>
                    )}
                    <button onClick={() => navigate("/sub-admin/add-vendor")} style={styles.addBtn}>+ Add Vendor</button>
                </div>
            </div>

            <div style={styles.section}>
                <h2 style={styles.pageTitle}>Vendors</h2>

                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>
                                    <input 
                                        type="checkbox" 
                                        onChange={() => setSelectedVendors(selectedVendors.length === vendors.length ? [] : vendors.map(v => v.id))}
                                        checked={selectedVendors.length === vendors.length && vendors.length > 0}
                                    />
                                </th>
                                <th style={styles.th}>Vendor & Company</th>
                                <th style={styles.th}>Contact Info</th>
                                <th style={styles.th}>Profiles</th>
                                <th style={styles.th}>Created By</th>
                                <th style={styles.th}>Onsite</th>
                                <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ textAlign: "center", padding: "60px" }}>Loading...</td></tr>
                            ) : vendors.map((vendor) => (
                                <tr key={vendor.id} style={{...styles.tableRow, background: selectedVendors.includes(vendor.id) ? '#F1F5F9' : 'transparent'}}>
                                    <td style={styles.td}>
                                        <input type="checkbox" checked={selectedVendors.includes(vendor.id)} onChange={() => toggleVendorSelection(vendor.id)} />
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.primaryText}>{vendor.name}</div>
                                        <div style={styles.secondaryText}>{vendor.company_name}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.primaryText}>{vendor.number}</div>
                                        <div style={styles.secondaryText}>{vendor.email || "No Email"}</div>
                                    </td>
                                    <td style={styles.td}><div style={styles.profileBadge}>{vendor.profile_count} Profiles</div></td>
                                    <td style={styles.td}>{vendor.created_by_name}</td>
                                    <td style={styles.td}>
                                        <span style={vendor.provide_onsite ? styles.badgeYes : styles.badgeNo}>
                                            {vendor.provide_onsite ? "YES" : "NO"}
                                        </span>
                                    </td>
                                    <td style={styles.actionTd}>
                                        <button style={styles.viewBtn} onClick={() => navigate(`/sub-admin/vendor/view/${vendor.id}`)}>View</button>
                                        <button style={styles.editBtn} onClick={() => navigate(`/sub-admin/edit-vendor/${vendor.id}`)}>Edit</button>
                                        <button style={styles.deleteBtn} onClick={() => setShowDeleteModal({show: true, vendorId: vendor.id})}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={styles.pagination}>
                    <button disabled={!hasPrev || loading} onClick={() => setCurrentPage(prev => prev - 1)} style={{ ...styles.pageStep, opacity: hasPrev ? 1 : 0.5 }}>Previous</button>
                    <button style={{ ...styles.pageNum, ...styles.activePage }}>{currentPage}</button>
                    <button disabled={!hasNext || loading} onClick={() => setCurrentPage(prev => prev + 1)} style={{ ...styles.pageStep, opacity: hasNext ? 1 : 0.5 }}>Next</button>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal.show && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={{marginTop:0}}>Delete Vendor?</h3>
                        <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'20px'}}>
                            <button style={styles.softDelBtn} onClick={() => handleDelete('soft')}>Move to Trash (Soft Delete)</button>
                            <button style={styles.hardDelBtn} onClick={() => handleDelete('hard')}>Delete Permanently (Hard Delete)</button>
                            <button style={styles.cancelBtn} onClick={() => setShowDeleteModal({show:false, vendorId:null})}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3>Assign Vendors to Employees</h3>
                        <input placeholder="Search employee..." style={{...styles.searchInput, width:'100%', marginBottom:'10px'}} onChange={e => setEmpSearch(e.target.value)} />
                        <div style={styles.empList}>
                            {employees.filter(e => `${e.first_name} ${e.last_name}`.toLowerCase().includes(empSearch.toLowerCase())).map(emp => (
                                <div key={emp.id} style={styles.empItem}>
                                    <input type="checkbox" checked={selectedEmployees.includes(emp.id)} onChange={() => setSelectedEmployees(prev => prev.includes(emp.id) ? prev.filter(x => x !== emp.id) : [...prev, emp.id])} />
                                    <span style={{marginLeft:'10px'}}>{emp.first_name} {emp.last_name}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                            <button style={styles.saveBtn} onClick={handleAssignSubmit}>Assign Now</button>
                            <button style={styles.cancelBtn} onClick={() => setShowAssignModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </BaseLayout>
    );
}

const styles = {
    toast: { position: 'fixed', top: '85px', right: '20px', color: '#fff', padding: '12px 25px', borderRadius: '8px', zIndex: 10001, fontWeight: '700' },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", gap: "15px" },
    backBtn: { background: "transparent", color: "#25343F", border: "none", fontSize: "15px", fontWeight: "700", cursor: "pointer" },
    searchContainer: { flex: 1, maxWidth: "400px" },
    searchInput: { width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid #BFC9D1", outline: "none" },
    addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
    assignBtn: { background: "#25343F", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
    pageTitle: { fontSize: "24px", color: "#25343F", marginBottom: "15px", fontWeight: "800" },
    tableWrapper: { background: "#fff", borderRadius: "16px", overflow: "hidden", border: "1px solid #EAEFEF" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { background: "#BFC9D1" },
    th: { padding: "16px", textAlign: "left", color: "#25343F", fontSize: "14px", fontWeight: "700" },
    tableRow: { borderBottom: "1px solid #EAEFEF" },
    td: { padding: "16px", color: "#25343F", fontSize: "14px" },
    primaryText: { fontWeight: "700" },
    secondaryText: { fontSize: "12px", color: "#BFC9D1" },
    profileBadge: { background: "#EAEFEF", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
    actionTd: { display: "flex", gap: "8px", padding: "16px", justifyContent: "center" },
    badgeYes: { padding: "4px 8px", background: "#dcfce7", color: "#166534", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" },
    badgeNo: { padding: "4px 8px", background: "#fee2e2", color: "#991b1b", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" },
    viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #BFC9D1", background: "#fff", cursor: "pointer" },
    editBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#25343F", color: "#fff", cursor: "pointer" },
    deleteBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#fee2e2", color: "#991b1b", cursor: "pointer" },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
    modalContent: { background: '#fff', padding: '25px', borderRadius: '15px', width: '350px' },
    softDelBtn: { background: '#64748B', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight:'600' },
    hardDelBtn: { background: '#EF4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight:'600' },
    pagination: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: "30px", gap: "20px" },
    pageStep: { padding: "8px 16px", background: "#fff", border: "1px solid #BFC9D1", borderRadius: "8px", cursor: "pointer" },
    pageNum: { width: "35px", height: "35px", borderRadius: "8px", border: "1px solid #BFC9D1", background: "#fff" },
    activePage: { background: "#FF9B51", color: "#fff", borderColor: "#FF9B51" },
    empList: { maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' },
    empItem: { display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '13px' },
    saveBtn: { flex: 1, background: '#FF9B51', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700' },
    cancelBtn: { flex: 1, background: '#eee', color: '#333', border: 'none', padding: '10px', borderRadius: '8px', cursor:'pointer' }
};

export default VendorList;





// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/SubAdminLayout";

// function VendorList() {
//     const navigate = useNavigate();
//     const [vendors, setVendors] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // Pagination & Filter States
//     const [currentPage, setCurrentPage] = useState(1);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [totalCount, setTotalCount] = useState(0);
//     const [hasNext, setHasNext] = useState(false);
//     const [hasPrev, setHasPrev] = useState(false);

//     // Fetch Vendors from API
//     const fetchVendors = async (page = 1, search = "") => {
//         setLoading(true);
//         try {
//             const url = `/sub-admin/api/admin-vendors/?page=${page}&search=${search}`;
//             const response = await apiRequest(url, "GET");

//             setVendors(response.results || []);
//             setTotalCount(response.count || 0);
//             setHasNext(!!response.next);
//             setHasPrev(!!response.previous);
//         } catch (error) {
//             console.error("Error fetching vendors:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         const delayDebounceFn = setTimeout(() => {
//             fetchVendors(currentPage, searchQuery);
//         }, 500);
//         return () => clearTimeout(delayDebounceFn);
//     }, [currentPage, searchQuery]);

//     // Handle Delete
//     const handleDelete = async (id, name) => {
//         const confirmDelete = window.confirm(`Are you sure you want to delete vendor: ${name}?`);
//         if (confirmDelete) {
//             try {
//                 await apiRequest(`/employee-portal/api/vendors/${id}/delete/`, "DELETE");
//                 alert("Vendor deleted successfully!");
//                 fetchVendors(currentPage, searchQuery);
//             } catch (error) {
//                 console.error("Delete failed:", error);
//                 alert("Could not delete vendor.");
//             }
//         }
//     };

//     return (
//         <BaseLayout>
//             {/* Top Navigation & Actions */}
//             <div style={styles.topBar}>
//                 <button onClick={() => navigate("/sub-admin")} style={styles.backBtn}>← Back to Dashboard</button>
//                 <div style={styles.searchContainer}>
//                     <input 
//                         type="text" 
//                         placeholder="Search vendors (name, tech, company...)" 
//                         style={styles.searchInput}
//                         value={searchQuery}
//                         onChange={(e) => {
//                             setSearchQuery(e.target.value);
//                             setCurrentPage(1);
//                         }}
//                     />
//                 </div>
//                 <button onClick={() => navigate("/sub-admin/add-vendor")} style={styles.addBtn}>
//                     + Add Vendor
//                 </button>
//             </div>

//             <div style={styles.section}>
//                 <div style={styles.headerRow}>
//                     <h2 style={styles.pageTitle}>Vendor Pool ({totalCount})</h2>
//                 </div>

//                 <div style={styles.tableWrapper}>
//                     <table style={styles.table}>
//                         <thead>
//                             <tr style={styles.tableHeader}>
//                                 <th style={styles.th}>ID</th>
//                                 <th style={styles.th}>Vendor & Company</th>
//                                 <th style={styles.th}>Contact Info</th>
//                                 <th style={styles.th}>Profiles</th>
//                                 <th style={styles.th}>Created By</th>
//                                 <th style={styles.th}>Onsite</th>
//                                 <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {loading ? (
//                                 <tr>
//                                     <td colSpan="7" style={{ textAlign: "center", padding: "60px", color: "#BFC9D1" }}>
//                                         Loading Vendor Data...
//                                     </td>
//                                 </tr>
//                             ) : vendors.length > 0 ? (
//                                 vendors.map((vendor) => (
//                                     <tr key={vendor.id} style={styles.tableRow}>
//                                         <td style={styles.td}>#{vendor.id}</td>
//                                         <td style={styles.td}>
//                                             <div style={styles.primaryText}>{vendor.name}</div>
//                                             <div style={styles.secondaryText}>{vendor.company_name}</div>
//                                         </td>
//                                         <td style={styles.td}>
//                                             <div style={styles.primaryText}>{vendor.number}</div>
//                                             <div style={styles.secondaryText}>{vendor.email || "No Email"}</div>
//                                         </td>
//                                         <td style={styles.td}>
//                                             <div style={styles.profileBadge}>{vendor.profile_count} Profiles</div>
//                                         </td>
//                                         <td style={styles.td}>
//                                             <div style={styles.primaryText}>{vendor.created_by_name}</div>
//                                             <div style={{...styles.secondaryText, fontSize: '11px', textTransform: 'uppercase'}}>{vendor.created_by?.role}</div>
//                                         </td>
//                                         <td style={styles.td}>
//                                             <span style={vendor.provide_onsite ? styles.badgeYes : styles.badgeNo}>
//                                                 {vendor.provide_onsite ? "YES" : "NO"}
//                                             </span>
//                                         </td>
//                                         <td style={styles.actionTd}>
//                                             <button style={styles.viewBtn} onClick={() => navigate(`/sub-admin/vendor/view/${vendor.id}`)}>View</button>
//                                             <button style={styles.editBtn} onClick={() => navigate(`/sub-admin/edit-vendor/${vendor.id}`)}>Edit</button>
//                                             <button style={styles.deleteBtn} onClick={() => handleDelete(vendor.id, vendor.name)}>Delete</button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#25343F" }}>No vendors found.</td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Dynamic Pagination Section */}
//                 <div style={styles.pagination}>
//                     <button 
//                         disabled={!hasPrev || loading} 
//                         onClick={() => setCurrentPage(prev => prev - 1)}
//                         style={{ ...styles.pageStep, opacity: hasPrev ? 1 : 0.5 }}
//                     >
//                         Previous
//                     </button>

//                     <div style={styles.pageNumbers}>
//                         <button style={{ ...styles.pageNum, ...styles.activePage }}>{currentPage}</button>
//                     </div>

//                     <button 
//                         disabled={!hasNext || loading} 
//                         onClick={() => setCurrentPage(prev => prev + 1)}
//                         style={{ ...styles.pageStep, opacity: hasNext ? 1 : 0.5 }}
//                     >
//                         Next
//                     </button>
//                 </div>
//             </div>
//         </BaseLayout>
//     );
// }

// const styles = {
//     topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", gap: "15px" },
//     backBtn: { background: "transparent", color: "#25343F", border: "none", fontSize: "15px", fontWeight: "700", cursor: "pointer", padding: "0" },
//     searchContainer: { flex: 1, maxWidth: "400px" },
//     searchInput: { width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid #BFC9D1", outline: "none", background: "#fff", fontSize: "14px" },
//     addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 155, 81, 0.3)" },
//     section: { background: "transparent" },
//     headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
//     pageTitle: { fontSize: "24px", color: "#25343F", margin: 0, fontWeight: "800" },
//     tableWrapper: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(37, 52, 63, 0.08)", border: "1px solid #EAEFEF" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#BFC9D1" },
//     th: { padding: "16px", textAlign: "left", color: "#25343F", fontSize: "14px", fontWeight: "700" },
//     tableRow: { borderBottom: "1px solid #EAEFEF" },
//     td: { padding: "16px", color: "#25343F", fontSize: "14px", verticalAlign: "middle" },
//     primaryText: { fontWeight: "700", color: "#25343F" },
//     secondaryText: { fontSize: "12px", color: "#BFC9D1", marginTop: "2px" },
//     profileBadge: { background: "#EAEFEF", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", border: "1px solid #BFC9D1", textAlign: "center", display: "inline-block" },
//     actionTd: { display: "flex", gap: "8px", padding: "16px", justifyContent: "center" },
//     badgeYes: { padding: "4px 8px", background: "#dcfce7", color: "#166534", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" },
//     badgeNo: { padding: "4px 8px", background: "#fee2e2", color: "#991b1b", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" },
//     viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #BFC9D1", background: "#fff", color: "#25343F", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
//     editBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#25343F", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
//     deleteBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#fee2e2", color: "#991b1b", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
//     pagination: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: "30px", gap: "20px" },
//     pageStep: { padding: "8px 16px", background: "#fff", border: "1px solid #BFC9D1", borderRadius: "8px", color: "#25343F", cursor: "pointer", fontWeight: "600" },
//     pageNumbers: { display: "flex", gap: "8px" },
//     pageNum: { width: "35px", height: "35px", borderRadius: "8px", border: "1px solid #BFC9D1", background: "#fff", cursor: "pointer", fontWeight: "600", color: "#25343F" },
//     activePage: { background: "#FF9B51", borderColor: "#FF9B51", color: "#fff" }
// };

// export default VendorList;





// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/SubAdminLayout";

// function VendorList() {
//     const navigate = useNavigate();
//     const [vendors, setVendors] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // Pagination & Filter States
//     const [currentPage, setCurrentPage] = useState(1);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [totalCount, setTotalCount] = useState(0);
//     const [hasNext, setHasNext] = useState(false);
//     const [hasPrev, setHasPrev] = useState(false);

//     // Fetch Vendors from API
//     const fetchVendors = async(page = 1, search = "") => {
//         setLoading(true);
//         try {
//             // API: /vendors/?page=1&search=query
//             const url = `/sub-admin/api/admin-vendors/?page=${page}&search=${search}`;
//             const response = await apiRequest(url, "GET");

//             setVendors(response.results || []);
//             setTotalCount(response.count || 0);
//             setHasNext(!!response.next);
//             setHasPrev(!!response.previous);
//         } catch (error) {
//             console.error("Error fetching vendors:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         // Debounce search logic (wait 500ms after typing)
//         const delayDebounceFn = setTimeout(() => {
//             fetchVendors(currentPage, searchQuery);
//         }, 500);

//         return () => clearTimeout(delayDebounceFn);
//     }, [currentPage, searchQuery]);

//     // Handle Delete
//     const handleDelete = async(id, name) => {
//         const confirmDelete = window.confirm(`Are you sure you want to delete vendor: ${name}?`);
//         if (confirmDelete) {
//             try {
//                 await apiRequest(`/employee-portal/api/vendors/${id}/delete/`, "DELETE");
//                 alert("Vendor deleted successfully!");
//                 // Refresh list
//                 fetchVendors(currentPage, searchQuery);
//             } catch (error) {
//                 console.error("Delete failed:", error);
//                 alert("Could not delete vendor.");
//             }
//         }
//     };

//     return ( <
//         BaseLayout > { /* Top Navigation & Actions */ } <
//         div style = { styles.topBar } >
//         <
//         button onClick = {
//             () => navigate("/sub-admin")
//         }
//         style = { styles.backBtn } > ←Back to Dashboard < /button> <
//         div style = { styles.searchContainer } >
//         <
//         input type = "text"
//         placeholder = "Search vendors (name, tech...)"
//         style = { styles.searchInput }
//         value = { searchQuery }
//         onChange = {
//             (e) => {
//                 setSearchQuery(e.target.value);
//                 setCurrentPage(1); // Reset to page 1 on new search
//             }
//         }
//         /> < /
//         div > <
//         button onClick = {
//             () => navigate("/sub-admin/add-vendor")
//         }
//         style = { styles.addBtn } >
//         +Add Vendor <
//         /button> < /
//         div >

//         <
//         div style = { styles.section } >
//         <
//         h2 style = { styles.pageTitle } > Vendor Pool({ totalCount }) < /h2>

//         <
//         div style = { styles.tableWrapper } >
//         <
//         table style = { styles.table } >
//         <
//         thead >
//         <
//         tr style = { styles.tableHeader } >
//         <
//         th style = { styles.th } > ID < /th> <
//         th style = { styles.th } > Vendor Name < /th> <
//         th style = { styles.th } > Contact < /th> <
//         th style = { styles.th } > Company < /th> <
//         th style = { styles.th } > Specialized Tech < /th> <
//         th style = { styles.th } > Onsite < /th> <
//         th style = {
//             {...styles.th, textAlign: "center" }
//         } > Actions < /th> < /
//         tr > <
//         /thead> <
//         tbody > {
//             loading ? ( <
//                 tr >
//                 <
//                 td colSpan = "7"
//                 style = {
//                     { textAlign: "center", padding: "40px" }
//                 } > Loading vendors... < /td> < /
//                 tr >
//             ) : vendors.length > 0 ? (
//                 vendors.map((vendor) => ( <
//                     tr key = { vendor.id }
//                     style = { styles.tableRow } >
//                     <
//                     td style = { styles.td } > { vendor.id } < /td> <
//                     td style = { styles.td } > < strong > { vendor.name } < /strong></td >
//                     <
//                     td style = { styles.td } > { vendor.number } < /td> <
//                     td style = { styles.td } > { vendor.company_name } < /td> <
//                     td style = { styles.td } > { vendor.specialized_tech_developers || "N/A" } < /td> <
//                     td style = { styles.td } >
//                     <
//                     span style = { vendor.provide_onsite ? styles.badgeYes : styles.badgeNo } > { vendor.provide_onsite ? "YES" : "NO" } <
//                     /span> < /
//                     td > <
//                     td style = { styles.actionTd } >
//                     <
//                     button style = { styles.viewBtn }
//                     onClick = {
//                         () => navigate(`/sub-admin/vendor/view/${vendor.id}`)
//                     } >
//                     View < /button> <
//                     button style = { styles.editBtn }
//                     onClick = {
//                         () => navigate(`/sub-admin/edit-vendor/${vendor.id}`)
//                     } >
//                     Edit < /button> <
//                     button style = { styles.deleteBtn }
//                     onClick = {
//                         () => handleDelete(vendor.id, vendor.name)
//                     } >
//                     Delete < /button> < /
//                     td > <
//                     /tr>
//                 ))
//             ) : ( <
//                 tr >
//                 <
//                 td colSpan = "7"
//                 style = {
//                     { textAlign: "center", padding: "40px" }
//                 } > No vendors found. < /td> < /
//                 tr >
//             )
//         } </tbody> < /
//         table > <
//         /div>

//         { /* Dynamic Pagination Section */ } <
//         div style = { styles.pagination } >
//         <
//         button disabled = {!hasPrev || loading }
//         onClick = {
//             () => setCurrentPage(prev => prev - 1)
//         }
//         style = {
//             {...styles.pageStep, opacity: hasPrev ? 1 : 0.5 }
//         } >
//         Previous < /button>

//         <
//         div style = { styles.pageNumbers } >
//         <
//         button style = {
//             {...styles.pageNum, ...styles.activePage }
//         } > { currentPage } < /button> < /
//         div >

//         <
//         button disabled = {!hasNext || loading }
//         onClick = {
//             () => setCurrentPage(prev => prev + 1)
//         }
//         style = {
//             {...styles.pageStep, opacity: hasNext ? 1 : 0.5 }
//         } >
//         Next < /button> < /
//         div > <
//         /div> < /
//         BaseLayout >
//     );
// }

// const styles = {
//     topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", gap: "15px" },
//     backBtn: { background: "transparent", color: "#25343F", border: "none", fontSize: "15px", fontWeight: "700", cursor: "pointer", padding: "0" },
//     searchContainer: { flex: 1, maxWidth: "400px" },
//     searchInput: { width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid #BFC9D1", outline: "none", background: "#fff" },
//     addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 155, 81, 0.3)" },
//     pageTitle: { fontSize: "24px", color: "#25343F", marginBottom: "20px", fontWeight: "800" },
//     tableWrapper: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(37, 52, 63, 0.08)", border: "1px solid #EAEFEF" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#BFC9D1" },
//     th: { padding: "16px", textAlign: "left", color: "#25343F", fontSize: "14px", fontWeight: "700" },
//     tableRow: { borderBottom: "1px solid #EAEFEF" },
//     td: { padding: "16px", color: "#25343F", fontSize: "14px" },
//     actionTd: { display: "flex", gap: "8px", padding: "16px", justifyContent: "center" },
//     badgeYes: { padding: "4px 8px", background: "#dcfce7", color: "#166534", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" },
//     badgeNo: { padding: "4px 8px", background: "#fee2e2", color: "#991b1b", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" },
//     viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #BFC9D1", background: "#fff", color: "#25343F", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
//     editBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#25343F", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
//     deleteBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#fee2e2", color: "#991b1b", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
//     pagination: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: "30px", gap: "20px" },
//     pageStep: { padding: "8px 16px", background: "#fff", border: "1px solid #BFC9D1", borderRadius: "8px", color: "#25343F", cursor: "pointer", fontWeight: "600" },
//     pageNumbers: { display: "flex", gap: "8px" },
//     pageNum: { width: "35px", height: "35px", borderRadius: "8px", border: "1px solid #BFC9D1", background: "#fff", cursor: "pointer", fontWeight: "600", color: "#25343F" },
//     activePage: { background: "#FF9B51", borderColor: "#FF9B51", color: "#fff" }
// };

// export default VendorList;



