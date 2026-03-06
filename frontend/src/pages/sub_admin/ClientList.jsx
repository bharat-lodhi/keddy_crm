import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import BaseLayout from "../components/SubAdminLayout";

function ClientList() {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // States
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedClients, setSelectedClients] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState({ show: false, clientId: null });
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

    const fetchClients = async () => {
        setLoading(true);
        try {
            // Range filter ke liye backend field name check karein (start_date/end_date ya created_at__gte)
            let url = "/sub-admin/api/clients/";
            const params = new URLSearchParams();
            if (startDate) params.append("start_date", startDate);
            if (endDate) params.append("end_date", endDate);
            
            const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
            const response = await apiRequest(fullUrl, "GET", null, getAuthHeaders());
            setClients(response.results || response || []);
        } catch (error) {
            console.error("Fetch error:", error);
            notify("Error loading clients", "error");
        } finally { setLoading(false); }
    };

    const fetchEmployees = async () => {
        try {
            const response = await apiRequest("/sub-admin/api/users/", "GET", null, getAuthHeaders());
            setEmployees(response.results || []);
        } catch (error) { console.error("Employee fetch error:", error); }
    };

    useEffect(() => {
        fetchClients();
        fetchEmployees();
    }, [startDate, endDate]);

    const handleAssignSubmit = async () => {
        if (selectedClients.length === 0 || selectedEmployees.length === 0) {
            return notify("Select clients and employees first", "error");
        }
        try {
            const promises = selectedClients.map(clientId => 
                apiRequest("/sub-admin/api/clients/assign/", "POST", {
                    client_id: clientId,
                    employee_ids: selectedEmployees
                }, getAuthHeaders())
            );
            await Promise.all(promises);
            notify(`Assigned successfully`);
            setShowAssignModal(false);
            setSelectedClients([]);
            setSelectedEmployees([]);
            fetchClients();
        } catch (error) { notify("Assignment Failed", "error"); }
    };

    const handleDelete = async (type) => {
        const clientId = showDeleteModal.clientId;
        const endpoint = type === 'soft' 
            ? `/sub-admin/api/clients/${clientId}/soft-delete/` 
            : `/sub-admin/api/clients/${clientId}/hard-delete/`;
        
        try {
            await apiRequest(endpoint, "DELETE", null, getAuthHeaders());
            notify(type === 'soft' ? "Client moved to trash" : "Client deleted permanently");
            setShowDeleteModal({ show: false, clientId: null });
            fetchClients();
        } catch (error) {
            notify("Delete failed", "error");
        }
    };

    const filteredClients = clients.filter(c => 
        (c.client_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <BaseLayout>
            {toast.show && <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#E74C3C' : '#27AE60'}}>{toast.msg}</div>}

            <div style={styles.topBar}>
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                    <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.dateInput} />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.dateInput} />
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                    {selectedClients.length > 0 && <button style={styles.assignBtn} onClick={() => setShowAssignModal(true)}>Assign ({selectedClients.length})</button>}
                    <button onClick={() => navigate("/sub-admin/client/add")} style={styles.addBtn}>+ Add Client</button>
                </div>
            </div>

            <div style={styles.section}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                    <h2 style={styles.pageTitle}>Clients</h2>
                    <input placeholder="Search..." style={styles.searchInput} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>

                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}><input type="checkbox" onChange={() => setSelectedClients(selectedClients.length === filteredClients.length ? [] : filteredClients.map(c => c.id))} checked={selectedClients.length === filteredClients.length && filteredClients.length > 0} /></th>
                                <th style={styles.th}>Client & Status</th>
                                <th style={styles.th}>Contact</th>
                                <th style={styles.th}>Profiles</th>
                                <th style={styles.th}>Created By</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{textAlign:'center', padding:'40px'}}>Loading...</td></tr>
                            ) : filteredClients.map(client => (
                                <tr key={client.id} style={{...styles.tableRow, background: selectedClients.includes(client.id) ? '#F1F5F9' : 'transparent'}}>
                                    <td style={styles.td}><input type="checkbox" checked={selectedClients.includes(client.id)} onChange={() => setSelectedClients(p => p.includes(client.id) ? p.filter(x => x !== client.id) : [...p, client.id])} /></td>
                                    <td style={styles.td}>
                                        <div style={{fontWeight:'700'}}>{client.client_name}</div>
                                        <div style={{display:'flex', gap:'5px', marginTop:'4px'}}>
                                            <small style={{color:'#64748B'}}>{client.company_name}</small>
                                            {client.is_verified ? 
                                                <span style={{color:'green', fontSize:'10px'}}>● Verified</span> : 
                                                <span style={{color:'orange', fontSize:'10px'}}>● Unverified</span>
                                            }
                                        </div>
                                    </td>
                                    <td style={styles.td}>{client.phone_number || 'N/A'}<br/><small>{client.email}</small></td>
                                    <td style={styles.td}><span style={styles.profileBadge}>{client.profile_count} Profiles</span></td>
                                    <td style={styles.td}>{client.created_by_name}</td>
                                    <td style={styles.td}>{new Date(client.created_at).toLocaleDateString()}</td>
                                    <td style={styles.td}>
                                        <div style={{display:'flex', gap:'5px'}}>
                                            <button style={styles.viewBtn} onClick={() => navigate(`/sub-admin/client/view/${client.id}`)}>View</button>
                                            <button style={styles.editBtn} onClick={() => navigate(`/sub-admin/client/edit/${client.id}`)}>Edit</button>
                                            <button style={styles.deleteBtn} onClick={() => setShowDeleteModal({show: true, clientId: client.id})}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal.show && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={{marginTop:0}}>Delete Client?</h3>
                        <p style={{fontSize:'14px', color:'#64748B'}}>Choose delete type for Client ID: {showDeleteModal.clientId}</p>
                        <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'20px'}}>
                            <button style={styles.softDelBtn} onClick={() => handleDelete('soft')}>Move to Trash (Soft Delete)</button>
                            <button style={styles.hardDelBtn} onClick={() => handleDelete('hard')}>Delete Permanently (Hard Delete)</button>
                            <button style={styles.cancelBtn} onClick={() => setShowDeleteModal({show:false, clientId:null})}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal (Same as before) */}
            {showAssignModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3>Assign to Employees</h3>
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
    topBar: { display: "flex", justifyContent: "space-between", marginBottom: "20px", gap: "10px" },
    dateInput: { padding: '6px', borderRadius: '6px', border: '1px solid #BFC9D1', fontSize:'12px' },
    backBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" },
    addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
    assignBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
    searchInput: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #E2E8F0" },
    pageTitle: { fontSize: "20px", fontWeight: "800", color: "#1E293B" },
    tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { background: "#F8FAFC" },
    th: { padding: "12px", textAlign: "left", fontSize: "11px", color: "#64748B", textTransform: "uppercase" },
    tableRow: { borderBottom: "1px solid #F1F5F9" },
    td: { padding: "12px", fontSize: "13px" },
    profileBadge: { background: "#E0F2FE", color: "#0369A1", padding: "3px 8px", borderRadius: "4px", fontWeight: "700", fontSize: '11px' },
    viewBtn: { background: "#F1F5F9", color: "#1E293B", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize:'11px' },
    editBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize:'11px' },
    deleteBtn: { background: "#FEE2E2", color: "#EF4444", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", fontSize:'11px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
    modalContent: { background: '#fff', padding: '25px', borderRadius: '15px', width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
    softDelBtn: { background: '#64748B', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight:'600' },
    hardDelBtn: { background: '#EF4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight:'600' },
    empList: { maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' },
    empItem: { display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '13px' },
    saveBtn: { flex: 1, background: '#FF9B51', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700' },
    cancelBtn: { flex: 1, background: '#eee', color: '#333', border: 'none', padding: '10px', borderRadius: '8px', cursor:'pointer' }
};

export default ClientList;





// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/SubAdminLayout";

// function ClientList() {
//     const navigate = useNavigate();
//     const [clients, setClients] = useState([]);
//     const [employees, setEmployees] = useState([]);
//     const [loading, setLoading] = useState(true);
    
//     // States
//     const [searchQuery, setSearchQuery] = useState("");
//     const [startDate, setStartDate] = useState("");
//     const [endDate, setEndDate] = useState("");
//     const [selectedClients, setSelectedClients] = useState([]);
//     const [showAssignModal, setShowAssignModal] = useState(false);
//     const [selectedEmployees, setSelectedEmployees] = useState([]);
//     const [empSearch, setEmpSearch] = useState("");
//     const [toast, setToast] = useState({ show: false, msg: "", type: "" });

//     // Utility: Har request ke liye fresh token lena
//     const getAuthHeaders = () => {
//         const token = localStorage.getItem("access_token") || localStorage.getItem("token");
//         return {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json"
//         };
//     };

//     const notify = (msg, type = "success") => {
//         setToast({ show: true, msg, type });
//         setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
//     };

//     const fetchClients = async () => {
//         setLoading(true);
//         try {
//             let url = "/sub-admin/api/clients/";
//             const params = new URLSearchParams();
//             if (startDate) params.append("start_date", startDate);
//             if (endDate) params.append("end_date", endDate);
//             if (params.toString()) url += `?${params.toString()}`;

//             const response = await apiRequest(url, "GET", null, getAuthHeaders());
//             setClients(Array.isArray(response) ? response : response.results || []);
//         } catch (error) {
//             console.error("Client fetch error:", error);
//             if(error.message.includes("403")) notify("Session Expired - Login Again", "error");
//         } finally { setLoading(false); }
//     };

//     const fetchEmployees = async () => {
//         try {
//             const response = await apiRequest("/sub-admin/api/users/", "GET", null, getAuthHeaders());
//             setEmployees(response.results || []);
//         } catch (error) { console.error("Employee fetch error:", error); }
//     };

//     useEffect(() => {
//         fetchClients();
//         fetchEmployees();
//     }, [startDate, endDate]);

//     // Assignment Logic (Refined)
//     const handleAssignSubmit = async () => {
//         if (selectedClients.length === 0 || selectedEmployees.length === 0) {
//             return notify("Select clients and employees first", "error");
//         }

//         try {
//             // Hum ek hi payload bhejenge kyunki aapne kaha client_id (single) aur employee_ids (list)
//             // Agar multiple clients hain, toh humein loop chalana hoga
//             const promises = selectedClients.map(clientId => 
//                 apiRequest("/sub-admin/api/clients/assign/", "POST", {
//                     client_id: clientId,
//                     employee_ids: selectedEmployees
//                 }, getAuthHeaders())
//             );
            
//             const results = await Promise.all(promises);
            
//             // Check if backend actually processed it
//             notify(`Successfully assigned to ${selectedEmployees.length} employees`);
//             setShowAssignModal(false);
//             setSelectedClients([]);
//             setSelectedEmployees([]);
//             fetchClients();
//         } catch (error) {
//             console.error("Assignment Error:", error);
//             notify("403 Forbidden: Token Missing or Invalid", "error");
//         }
//     };

//     // Filters
//     const filteredClients = clients.filter(c => 
//         (c.client_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (c.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     const toggleClient = (id) => setSelectedClients(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

//     return (
//         <BaseLayout>
//             {toast.show && <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#E74C3C' : '#27AE60'}}>{toast.msg}</div>}

//             <div style={styles.topBar}>
//                 <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
//                     <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
//                     <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.dateInput} />
//                     <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.dateInput} />
//                 </div>
//                 <div style={{display:'flex', gap:'10px'}}>
//                     {selectedClients.length > 0 && <button style={styles.assignBtn} onClick={() => setShowAssignModal(true)}>Assign Selected ({selectedClients.length})</button>}
//                     <button onClick={() => navigate("/sub-admin/client/add")} style={styles.addBtn}>+ Add Client</button>
//                 </div>
//             </div>

//             <div style={styles.section}>
//                 <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
//                     <h2 style={styles.pageTitle}>Client Directory</h2>
//                     <input placeholder="Search..." style={styles.searchInput} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
//                 </div>

//                 <div style={styles.tableWrapper}>
//                     <table style={styles.table}>
//                         <thead>
//                             <tr style={styles.tableHeader}>
//                                 <th style={styles.th}><input type="checkbox" onChange={() => setSelectedClients(selectedClients.length === filteredClients.length ? [] : filteredClients.map(c => c.id))} checked={selectedClients.length === filteredClients.length && filteredClients.length > 0} /></th>
//                                 <th style={styles.th}>Client & Company</th>
//                                 <th style={styles.th}>Contact</th>
//                                 <th style={styles.th}>Profiles</th>
//                                 <th style={styles.th}>Created By</th>
//                                 <th style={styles.th}>Date</th>
//                                 <th style={styles.th}>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {loading ? (
//                                 <tr><td colSpan="7" style={{textAlign:'center', padding:'40px'}}>Loading...</td></tr>
//                             ) : filteredClients.map(client => (
//                                 <tr key={client.id} style={{...styles.tableRow, background: selectedClients.includes(client.id) ? '#F1F5F9' : 'transparent'}}>
//                                     <td style={styles.td}><input type="checkbox" checked={selectedClients.includes(client.id)} onChange={() => toggleClient(client.id)} /></td>
//                                     <td style={styles.td}>
//                                         <div style={{fontWeight:'700'}}>{client.client_name}</div>
//                                         <small style={{color:'#64748B'}}>{client.company_name}</small>
//                                     </td>
//                                     <td style={styles.td}>{client.phone_number}<br/><small>{client.email}</small></td>
//                                     <td style={styles.td}><span style={styles.profileBadge}>{client.profile_count} Profiles</span></td>
//                                     <td style={styles.td}><div style={{fontSize:'12px'}}>{client.created_by_name}</div></td>
//                                     <td style={styles.td}>{new Date(client.created_at).toLocaleDateString()}</td>
//                                     <td style={styles.td}>
//                                         <button style={styles.editBtn} onClick={() => navigate(`/sub-admin/client/edit/${client.id}`)}>Edit</button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Assignment Modal */}
//             {showAssignModal && (
//                 <div style={styles.modalOverlay}>
//                     <div style={styles.modalContent}>
//                         <h3>Assign to Employees</h3>
//                         <input placeholder="Search employee..." style={{...styles.searchInput, width:'100%', marginBottom:'10px'}} onChange={e => setEmpSearch(e.target.value)} />
//                         <div style={styles.empList}>
//                             {employees.filter(e => `${e.first_name} ${e.last_name}`.toLowerCase().includes(empSearch.toLowerCase())).map(emp => (
//                                 <div key={emp.id} style={styles.empItem}>
//                                     <input type="checkbox" checked={selectedEmployees.includes(emp.id)} onChange={() => setSelectedEmployees(prev => prev.includes(emp.id) ? prev.filter(x => x !== emp.id) : [...prev, emp.id])} />
//                                     <span style={{marginLeft:'10px'}}>{emp.first_name} {emp.last_name} <br/> <small>{emp.email}</small></span>
//                                 </div>
//                             ))}
//                         </div>
//                         <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
//                             <button style={styles.saveBtn} onClick={handleAssignSubmit}>Assign Now</button>
//                             <button style={styles.cancelBtn} onClick={() => setShowAssignModal(false)}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </BaseLayout>
//     );
// }

// const styles = {
//     toast: { position: 'fixed', top: '85px', right: '20px', color: '#fff', padding: '12px 25px', borderRadius: '8px', zIndex: 10001, fontWeight: '700' },
//     topBar: { display: "flex", justifyContent: "space-between", marginBottom: "20px", gap: "10px" },
//     dateInput: { padding: '6px', borderRadius: '6px', border: '1px solid #BFC9D1', fontSize:'12px' },
//     backBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" },
//     addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//     assignBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//     searchInput: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #BFC9D1" },
//     pageTitle: { fontSize: "20px", fontWeight: "800", color: "#1E293B" },
//     tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F8FAFC" },
//     th: { padding: "12px", textAlign: "left", fontSize: "12px", color: "#64748B", textTransform: "uppercase" },
//     tableRow: { borderBottom: "1px solid #F1F5F9" },
//     td: { padding: "12px", fontSize: "13px" },
//     profileBadge: { background: "#E0F2FE", color: "#0369A1", padding: "3px 8px", borderRadius: "4px", fontWeight: "700" },
//     editBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" },
//     modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
//     modalContent: { background: '#fff', padding: '25px', borderRadius: '15px', width: '350px' },
//     empList: { maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' },
//     empItem: { display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '13px' },
//     saveBtn: { flex: 1, background: '#FF9B51', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700' },
//     cancelBtn: { flex: 1, background: '#eee', color: '#333', border: 'none', padding: '10px', borderRadius: '8px' }
// };

// export default ClientList;




// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/SubAdminLayout";

// function ClientList() {
//     const navigate = useNavigate();
//     const [clients, setClients] = useState([]);
//     const [employees, setEmployees] = useState([]);
//     const [loading, setLoading] = useState(true);
    
//     // Filters State
//     const [searchQuery, setSearchQuery] = useState("");
//     const [startDate, setStartDate] = useState("");
//     const [endDate, setEndDate] = useState("");

//     // Selection States
//     const [selectedClients, setSelectedClients] = useState([]);
//     const [showAssignModal, setShowAssignModal] = useState(false);
//     const [selectedEmployees, setSelectedEmployees] = useState([]);
//     const [empSearch, setEmpSearch] = useState("");
//     const [toast, setToast] = useState({ show: false, msg: "", type: "" });

//     const notify = (msg, type = "success") => {
//         setToast({ show: true, msg, type });
//         setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
//     };

//     // 1. Fetch Clients with Date Filters
//     const fetchClients = async () => {
//         setLoading(true);
//         try {
//             let url = "/sub-admin/api/clients/";
//             const params = new URLSearchParams();
//             if (startDate) params.append("start_date", startDate);
//             if (endDate) params.append("end_date", endDate);
            
//             const queryString = params.toString();
//             if (queryString) url += `?${queryString}`;

//             const response = await apiRequest(url, "GET");
//             setClients(Array.isArray(response) ? response : response.results || []);
//         } catch (error) {
//             console.error("Error fetching clients:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // 2. Fetch Employees for Assignment
//     const fetchEmployees = async () => {
//         try {
//             const response = await apiRequest("/sub-admin/api/users/", "GET");
//             setEmployees(response.results || []);
//         } catch (error) {
//             console.error("Error fetching employees:", error);
//         }
//     };

//     useEffect(() => {
//         fetchClients();
//         fetchEmployees();
//     }, [startDate, endDate]);

//     // Checkbox Logic
//     const toggleClientSelection = (id) => {
//         setSelectedClients(prev => 
//             prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
//         );
//     };

//     const toggleAll = () => {
//         if (selectedClients.length === filteredClients.length) setSelectedClients([]);
//         else setSelectedClients(filteredClients.map(c => c.id));
//     };

//     // Filtered Clients (Frontend Search)
//     const filteredClients = clients.filter(client => 
//         client.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         client.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     // 3. Assign Logic
//     const handleAssignSubmit = async () => {
//         if (selectedClients.length === 0 || selectedEmployees.length === 0) {
//             return notify("Please select both clients and employees", "error");
//         }

//         try {
//             // Bulk assignment logic
//             const promises = selectedClients.map(clientId => 
//                 apiRequest("/sub-admin/api/clients/assign/", "POST", {
//                     client_id: clientId,
//                     employee_ids: selectedEmployees
//                 })
//             );
            
//             await Promise.all(promises);
//             notify(`Assigned ${selectedClients.length} clients successfully!`);
//             setShowAssignModal(false);
//             setSelectedClients([]);
//             setSelectedEmployees([]);
//             fetchClients();
//         } catch (error) {
//             notify("Assignment failed", "error");
//         }
//     };

//     return (
//         <BaseLayout>
//             {toast.show && (
//                 <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#E74C3C' : '#27AE60'}}>
//                     {toast.msg}
//                 </div>
//             )}

//             <div style={styles.topBar}>
//                 <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
//                     <button onClick={() => navigate("/sub-admin")} style={styles.backBtn}>← Dashboard</button>
//                     <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.dateInput} />
//                     <span style={{color:'#64748B'}}>to</span>
//                     <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.dateInput} />
//                 </div>
                
//                 <div style={styles.actionGroup}>
//                     {selectedClients.length > 0 && (
//                         <button style={styles.assignBtn} onClick={() => setShowAssignModal(true)}>
//                             Assign Selected ({selectedClients.length})
//                         </button>
//                     )}
//                     <button onClick={() => navigate("/sub-admin/client/add")} style={styles.addBtn}>+ Add Client</button>
//                 </div>
//             </div>

//             <div style={styles.section}>
//                 <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
//                     <h2 style={styles.pageTitle}>Client Directory</h2>
//                     <input 
//                         type="text" 
//                         placeholder="Search clients..." 
//                         style={styles.searchInput}
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                 </div>

//                 <div style={styles.tableWrapper}>
//                     <table style={styles.table}>
//                         <thead>
//                             <tr style={styles.tableHeader}>
//                                 <th style={styles.th}><input type="checkbox" onChange={toggleAll} checked={selectedClients.length === filteredClients.length && filteredClients.length > 0} /></th>
//                                 <th style={styles.th}>Client & Company</th>
//                                 <th style={styles.th}>Contact</th>
//                                 <th style={styles.th}>Profiles</th>
//                                 <th style={styles.th}>Assigned To</th>
//                                 <th style={styles.th}>Date</th>
//                                 <th style={{ ...styles.th, textAlign: "center" }}>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {loading ? (
//                                 <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>Loading...</td></tr>
//                             ) : filteredClients.map((client) => (
//                                 <tr key={client.id} style={{...styles.tableRow, background: selectedClients.includes(client.id) ? '#F1F5F9' : 'transparent'}}>
//                                     <td style={styles.td}>
//                                         <input type="checkbox" checked={selectedClients.includes(client.id)} onChange={() => toggleClientSelection(client.id)} />
//                                     </td>
//                                     <td style={styles.td}>
//                                         <div style={{ fontWeight: "700", color: "#1E293B" }}>{client.client_name}</div>
//                                         <div style={{ fontSize: "12px", color: "#64748B" }}>{client.company_name}</div>
//                                     </td>
//                                     <td style={styles.td}>
//                                         <div>{client.phone_number}</div>
//                                         <div style={{ fontSize: "12px", color: "#64748B" }}>{client.email}</div>
//                                     </td>
//                                     <td style={styles.td}><span style={styles.profileBadge}>{client.profile_count || 0} Profiles</span></td>
//                                     <td style={styles.td}>
//                                         <div style={{fontSize:'12px', fontWeight:'600'}}>{client.created_by_name}</div>
//                                     </td>
//                                     <td style={styles.td}>{new Date(client.created_at).toLocaleDateString('en-GB')}</td>
//                                     <td style={styles.actionTd}>
//                                         <button style={styles.viewBtn} onClick={() => navigate(`/sub-admin/client/view/${client.id}`)}>View</button>
//                                         <button style={styles.editBtn} onClick={() => navigate(`/sub-admin/client/edit/${client.id}`)}>Edit</button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* ASSIGN EMPLOYEE MODAL */}
//             {showAssignModal && (
//                 <div style={styles.modalOverlay}>
//                     <div style={styles.modalContent}>
//                         <h3 style={{marginBottom:'10px'}}>Assign Clients to Employees</h3>
//                         <p style={{fontSize:'12px', color:'#64748B', marginBottom:'15px'}}>Selected Clients: {selectedClients.length}</p>
                        
//                         <input 
//                             type="text" 
//                             placeholder="Search employees by name..." 
//                             style={{...styles.searchInput, marginBottom:'15px'}}
//                             onChange={(e) => setEmpSearch(e.target.value)}
//                         />

//                         <div style={styles.empList}>
//                             {employees.filter(e => `${e.first_name} ${e.last_name}`.toLowerCase().includes(empSearch.toLowerCase()))
//                             .map(emp => (
//                                 <div key={emp.id} style={styles.empItem}>
//                                     <input 
//                                         type="checkbox" 
//                                         id={`emp-${emp.id}`}
//                                         checked={selectedEmployees.includes(emp.id)}
//                                         onChange={() => setSelectedEmployees(prev => 
//                                             prev.includes(emp.id) ? prev.filter(x => x !== emp.id) : [...prev, emp.id]
//                                         )}
//                                     />
//                                     <label htmlFor={`emp-${emp.id}`} style={{marginLeft:'10px', cursor:'pointer'}}>
//                                         <div style={{fontWeight:'600', fontSize:'14px'}}>{emp.first_name} {emp.last_name}</div>
//                                         <div style={{fontSize:'11px', color:'#64748B'}}>{emp.email}</div>
//                                     </label>
//                                 </div>
//                             ))}
//                         </div>

//                         <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
//                             <button style={styles.saveBtn} onClick={handleAssignSubmit}>Confirm Assignment</button>
//                             <button style={styles.cancelBtn} onClick={() => setShowAssignModal(false)}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </BaseLayout>
//     );
// }

// const styles = {
//     toast: { position: 'fixed', top: '85px', right: '20px', color: '#fff', padding: '12px 25px', borderRadius: '8px', zIndex: 9999, fontWeight: '700' },
//     topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", gap: "15px", flexWrap:'wrap' },
//     backBtn: { background: "transparent", color: "#1E293B", border: "none", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
//     dateInput: { padding: '8px', borderRadius: '8px', border: '1px solid #BFC9D1', fontSize:'13px' },
//     actionGroup: { display: 'flex', gap: '10px' },
//     assignBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
//     addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
//     searchInput: { width: "300px", padding: "10px 15px", borderRadius: "10px", border: "1px solid #BFC9D1", outline: "none" },
//     pageTitle: { fontSize: "22px", color: "#1E293B", fontWeight: "800", margin:0 },
//     tableWrapper: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #E2E8F0" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" },
//     th: { padding: "16px", textAlign: "left", color: "#64748B", fontSize: "13px", fontWeight: "800", textTransform: "uppercase" },
//     tableRow: { borderBottom: "1px solid #F1F5F9", transition:'0.2s' },
//     td: { padding: "16px", color: "#334155", fontSize: "14px" },
//     profileBadge: { background: "#E0F2FE", color: "#0369A1", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" },
//     actionTd: { display: "flex", gap: "8px", padding: "16px" },
//     viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
//     editBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#1E293B", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
//     // Modal
//     modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
//     modalContent: { background: '#fff', padding: '30px', borderRadius: '20px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
//     empList: { maxHeight: '250px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px' },
//     empItem: { display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #F1F5F9' },
//     saveBtn: { flex: 1, background: '#FF9B51', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },
//     cancelBtn: { background: 'transparent', color: '#64748B', border: 'none', padding: '10px', fontWeight: '600', cursor: 'pointer' }
// };

// export default ClientList;




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
//             const response = await apiRequest("/sub-admin/api/admin-clients/", "GET");
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

//     // Filter Logic
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
//                                 <th style={styles.th}>Client & Company</th>
//                                 <th style={styles.th}>Contact</th>
//                                 <th style={styles.th}>Profiles</th> {/* Naya Column */}
//                                 <th style={styles.th}>Created By</th> {/* Naya Column */}
//                                 <th style={styles.th}>Date</th>
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
//                                         <td style={styles.td}>#{client.id}</td>
//                                         <td style={styles.td}>
//                                             <div style={{ fontWeight: "700", color: "#25343F" }}>{client.client_name}</div>
//                                             <div style={{ fontSize: "12px", color: "#BFC9D1" }}>{client.company_name}</div>
//                                         </td>
//                                         <td style={styles.td}>
//                                             <div>{client.phone_number}</div>
//                                             <div style={{ fontSize: "12px", color: "#BFC9D1" }}>{client.email || "No Email"}</div>
//                                         </td>
                                        
//                                         {/* Profile Count Badge */}
//                                         <td style={styles.td}>
//                                             <span style={styles.profileBadge}>
//                                                 {client.profile_count} Profiles
//                                             </span>
//                                         </td>

//                                         {/* Created By Info */}
//                                         <td style={styles.td}>
//                                             <div style={{ fontWeight: "600", fontSize: "13px" }}>{client.created_by_name}</div>
//                                             <div style={{ fontSize: "11px", color: "#BFC9D1" }}>{client.created_by_email}</div>
//                                         </td>

//                                         <td style={styles.td}>
//                                             {new Date(client.created_at).toLocaleDateString()}
//                                         </td>
                                        
//                                         <td style={styles.actionTd}>
//                                             <button style={styles.viewBtn} onClick={() => navigate(`/sub-admin/client/view/${client.id}`)}>View</button>
//                                             <button style={styles.editBtn} onClick={() => navigate(`/sub-admin/client/edit/${client.id}`)}>Edit</button>
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
//     profileBadge: { 
//         background: "#EAEFEF", 
//         color: "#25343F", 
//         padding: "5px 12px", 
//         borderRadius: "20px", 
//         fontSize: "12px", 
//         fontWeight: "700",
//         border: "1px solid #BFC9D1"
//     },
//     actionTd: { display: "flex", gap: "8px", padding: "16px", justifyContent: "center" },
//     viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #BFC9D1", background: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
//     editBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#25343F", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
// };

// export default ClientList;




