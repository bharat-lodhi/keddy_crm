import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import BaseLayout from "../components/emp_base";

// Shared Components Import
import { getStatusStyles } from "../../utils/statusHelper";
import StatusUpdateModal from "../../components/StatusUpdateModal";

const Icons = {
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    Remark: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9B51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    External: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>,
    Delete: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
};

function CandidateList() {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedCand, setSelectedCand] = useState(null);
    const [editForm, setEditForm] = useState({ main_status: "", sub_status: "", remark: "" });
    const [toast, setToast] = useState({ show: false, msg: "", type: "" });

    useEffect(() => { fetchCandidates(currentPage, searchTerm); }, [currentPage, searchTerm]);

    const fetchCandidates = async (page, search) => {
        setLoading(true);
        try {
            let url = `/employee-portal/api/user/candidates/list/?page=${page}${search ? `&search=${search}` : ''}`;
            const res = await apiRequest(url, "GET");
            if (res && res.results) { setCandidates(res.results); setCount(res.count || 0); }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const notify = (msg, type = "success") => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
    };

    const handleQuickEdit = (e, cand) => {
        e.stopPropagation();
        setSelectedCand(cand);
        setEditForm({ main_status: cand.main_status || "SUBMITTED", sub_status: cand.sub_status || "NONE", remark: cand.remark || "" });
        setShowModal(true);
    };

    const handleSoftDelete = async (e, id) => {
            e.stopPropagation();
            if (window.confirm("Are you sure you want to delete this profile?")) {
                try {
                    await apiRequest(`/employee-portal/api/candidates/${id}/soft-delete/`, "DELETE");
                    notify("Candidate deleted successfully!");
                    
                } catch (err) { notify("Delete failed", "error"); }
            }
        };

    const handleUpdateSubmit = async () => {
        try {
            await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", editForm);
            notify("Status updated successfully!");
            setShowModal(false);
            fetchCandidates(currentPage, searchTerm);
        } catch (err) { notify("Update failed", "error"); }
    };

    const truncate = (text, limit) => (text?.length > limit ? text.substring(0, limit) + "..." : text);

    const renderRows = () => {
        let lastDate = "";
        return candidates.map((c) => {
            const currentDate = new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            let dateSeparator = currentDate !== lastDate ? (<tr key={`d-${c.id}`}><td colSpan="8" style={styles.dateSeparator}>{currentDate}</td></tr>) : null;
            if (currentDate !== lastDate) lastDate = currentDate;

            const statusStyle = getStatusStyles(c.main_status || "SUBMITTED");

            return (
                <React.Fragment key={c.id}>
                    {dateSeparator}
                    <tr style={{ ...styles.tableRow, backgroundColor: statusStyle.bg }} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
                        {/* 1. Submitted To/By */}
                        <td style={styles.td}>
                            <div>To: <b>{c.submitted_to_name || ''}</b></div>
                            <div>By: <b style={{color: "#27AE60"}}>{c.created_by_name || ''}</b></div>
                        </td>
                        {/* 2. Candidate */}
                        <td style={styles.td}>
                            <div style={{fontWeight: '700'}}>{c.candidate_name || ''}</div>
                            <div style={{fontSize: '11px', color: '#7F8C8D'}}>{c.candidate_email || ''}</div>
                        </td>
                        {/* 3. Tech */}
                        <td style={styles.td}>{truncate(c.technology, 30) || ''}</td>
                        {/* 4. Exp */}
                        <td style={styles.td}>{c.years_of_experience_manual || ''} {c.years_of_experience_manual ? 'Yrs' : ''}</td>
                        {/* 5. Vendor */}
                        <td style={styles.td}><b>{truncate(c.vendor_company_name || c.vendor_name, 15) || ''}</b></td>
                        {/* 6. Rate */}
                        <td style={styles.td}>
                            <div>{c.vendor_rate ? `₹${c.vendor_rate}` : ''}</div>
                            <small style={{color: '#94A3B8'}}>{c.vendor_rate_type || ''}</small>
                        </td>
                        {/* 7. Status */}
                        <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ ...styles.badge, color: statusStyle.text, fontWeight: '800' }}>{c.main_status || ''}</span>
                                {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
                            </div>
                            <small style={{ ...styles.subStatusText, color: statusStyle.text, fontWeight: '700' }}>{c.sub_status || ''}</small>
                        </td>
                        {/* 8. Action */}
                        <td style={styles.td}>
                            <div style={styles.actionGroup}>
                                <button onClick={(e) => handleQuickEdit(e, c)} style={styles.editBtn} title="Update Status"><Icons.Edit /></button>
                                <button onClick={(e) => { e.stopPropagation(); navigate(`/employee/candidate/edit/${c.id}`); }} style={styles.editBtn} title="Full Edit"><Icons.External /></button>
                                <button onClick={(e) => handleSoftDelete(e, c.id)} style={styles.trashBtn} title="Delete"><Icons.Delete /></button>
                            </div>
                        </td>
                    </tr>
                </React.Fragment>
            );
        });
    };

    return (
        <BaseLayout>
            {toast.show && <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#E74C3C' : '#27AE60'}}>{toast.msg}</div>}

            <div style={styles.header}>
                <div>
                    <h2 style={styles.welcome}>All - Profiles ({count})</h2>
                    <p style={styles.subText}>Recruitment pipeline overview for team.</p>
                </div>
                <div style={styles.headerActions}>
                    <input placeholder="Search..." style={styles.searchInput} value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
                    <button onClick={() => navigate("/employee/candidates/add")} style={styles.actionBtn}>+ Add Candidate</button>
                </div>
            </div>

            <div style={styles.tableWrapper}>
                <div style={{overflowX:'auto'}}>
                    <table style={styles.table}>
                        <thead style={styles.tableHeader}>
                            <tr>
                                <th style={styles.th}>Submitted To/By</th>
                                <th style={styles.th}>Candidate</th>
                                <th style={styles.th}>Tech</th>
                                <th style={styles.th}>Exp</th>
                                <th style={styles.th}>Vendor</th>
                                <th style={styles.th}>Rate</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>{loading ? <tr><td colSpan="8" style={styles.loadingTd}>Loading...</td></tr> : renderRows()}</tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Logic here... */}

            <StatusUpdateModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                formData={editForm} 
                setFormData={setEditForm} 
                onSave={handleUpdateSubmit} 
            />
        </BaseLayout>
    );
}

const styles = {
    toast: { position: 'fixed', top: '85px', right: '20px', color: '#fff', padding: '12px 25px', borderRadius: '8px', zIndex: 9999, fontWeight: '700', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" },
    welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
    subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
    headerActions: { display: "flex", gap: "10px", alignItems: "center" },
    searchInput: { padding: "10px 15px", borderRadius: "10px", border: "1px solid #F0F2F4", width: "250px", outline: "none", fontSize: '13px' },
    actionBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" },
    tableWrapper: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
    th: { padding: "14px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
    tableRow: { borderBottom: "1px solid #F1F5F9", transition: "0.2s", cursor: "pointer" },
    td: { padding: "14px 18px", fontSize: "13px", color: "#334155" },
    dateSeparator: { padding: "12px 20px", background: "#f8fafc", color: "#475569", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", borderBottom: '1px solid #e2e8f0' },
    badge: { background: "rgba(255, 155, 81, 0.12)", color: "#FF9B51", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
    subStatusText: { fontSize: '11px', color: '#7f8c8d', display: 'block', marginTop: "2px" },
    remarkIcon: { display: 'flex', cursor: 'help', padding: '4px', borderRadius: '4px', background: '#FFF5EB' },
    editBtn: { border: 'none', background: '#F1F5F9', padding: '6px', borderRadius: '6px', cursor: 'pointer' },
    actionGroup: { display: "flex", gap: "8px" },
    loadingTd: { textAlign: 'center', padding: '40px', fontWeight: '800', color: '#25343F' },
    trashBtn: { border: 'none', background: '#FFF5F5', padding: '6px', borderRadius: '6px', cursor: 'pointer' },
};

export default CandidateList;





// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/emp_base";

// // Shared Components Import
// import { getStatusStyles } from "../../utils/statusHelper";
// import StatusUpdateModal from "../../components/StatusUpdateModal";

// const Icons = {
//     Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
//     Remark: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9B51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
//     External: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
// };

// function CandidateList() {
//     const navigate = useNavigate();
//     const [candidates, setCandidates] = useState([]);
//     const [count, setCount] = useState(0);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState("");

//     // Modal & Toast states
//     const [showModal, setShowModal] = useState(false);
//     const [selectedCand, setSelectedCand] = useState(null);
//     const [editForm, setEditForm] = useState({ main_status: "", sub_status: "", remark: "" });
//     const [toast, setToast] = useState({ show: false, msg: "", type: "" });

//     useEffect(() => { fetchCandidates(currentPage, searchTerm); }, [currentPage, searchTerm]);

//     const fetchCandidates = async (page, search) => {
//         setLoading(true);
//         try {
//             let url = `/employee-portal/api/user/candidates/list/?page=${page}${search ? `&search=${search}` : ''}`;
//             const res = await apiRequest(url, "GET");
//             if (res && res.results) { setCandidates(res.results); setCount(res.count || 0); }
//         } catch (err) { console.error(err); } finally { setLoading(false); }
//     };

//     const notify = (msg, type = "success") => {
//         setToast({ show: true, msg, type });
//         setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
//     };

//     const handleQuickEdit = (e, cand) => {
//         e.stopPropagation();
//         setSelectedCand(cand);
//         setEditForm({ main_status: cand.main_status || "SUBMITTED", sub_status: cand.sub_status || "NONE", remark: "" });
//         setShowModal(true);
//     };

//     const handleUpdateSubmit = async () => {
//         try {
//             await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", editForm);
//             notify("Status updated successfully!");
//             setShowModal(false);
//             fetchCandidates(currentPage, searchTerm);
//         } catch (err) { notify("Update failed", "error"); }
//     };

//     const truncate = (text, limit) => (text?.length > limit ? text.substring(0, limit) + "..." : text);

//     const renderRows = () => {
//         let lastDate = "";
//         return candidates.map((c) => {
//             const currentDate = new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
//             let dateSeparator = currentDate !== lastDate ? (<tr key={`d-${c.id}`}><td colSpan="9" style={styles.dateSeparator}>{currentDate}</td></tr>) : null;
//             if (currentDate !== lastDate) lastDate = currentDate;

//             const statusStyle = getStatusStyles(c.main_status || "SUBMITTED");

//             return (
//                 <React.Fragment key={c.id}>
//                     {dateSeparator}
//                     <tr style={{ ...styles.tableRow, backgroundColor: statusStyle.bg }} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                         <td style={styles.td}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
//                         <td style={styles.td}>To: <b>{c.submitted_to_name}</b><br/><small style={{color:'#27AE60'}}>By: {c.created_by_name}</small></td>
//                         <td style={styles.td}><b>{c.candidate_name}</b><br/><small>{c.candidate_email}</small></td>
//                         <td style={styles.td}><span style={styles.techBadge}>{c.technology || "N/A"}</span></td>
//                         <td style={styles.td}>{c.years_of_experience_manual} Yrs</td>
//                         <td style={styles.td}>{truncate(c.vendor_company_name, 15)}</td>
//                         <td style={styles.td}>₹{c.vendor_rate}</td>
//                         <td style={styles.td}>
//                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//                                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                                     <span style={{ ...styles.statusBadge, color: statusStyle.text }}>{c.main_status || "SUBMITTED"}</span>
//                                     {c.remark && <div title={c.remark}><Icons.Remark /></div>}
//                                 </div>
//                                 {c.sub_status && c.sub_status !== "NONE" && (
//                                     <div style={{ ...styles.subStatusBadge, color: statusStyle.text }}>• {c.sub_status}</div>
//                                 )}
//                             </div>
//                         </td>
//                         <td style={styles.td}>
//                             <div style={styles.actionGroup}>
//                                 <button onClick={(e) => handleQuickEdit(e, c)} style={styles.iconBtn} title="Update Status"><Icons.Edit /></button>
//                                 <button onClick={(e) => { e.stopPropagation(); navigate(`/employee/candidate/edit/${c.id}`); }} style={styles.iconBtn} title="Full Edit"><Icons.External /></button>
//                             </div>
//                         </td>
//                     </tr>
//                 </React.Fragment>
//             );
//         });
//     };

//     return (
//         <BaseLayout>
//             {toast.show && <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#E74C3C' : '#27AE60'}}>{toast.msg}</div>}

//             <div style={styles.header}>
//                 <div style={styles.titleSection}>
//                     <h2 style={styles.title}>Team Candidates ({count})</h2>
//                 </div>
//                 <div style={styles.headerActions}>
//                     <input placeholder="Search..." style={styles.searchInput} value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
//                     <button onClick={() => navigate("/employee/candidates/add")} style={styles.addBtn}>+ Add Candidate</button>
//                 </div>
//             </div>

//             <div style={styles.tableWrapper}>
//                 <table style={styles.table}>
//                     <thead>
//                         <tr style={styles.tableHeader}>
//                             <th style={styles.th}>Time</th><th style={styles.th}>Team Info</th><th style={styles.th}>Candidate</th>
//                             <th style={styles.th}>Tech</th><th style={styles.th}>Exp</th><th style={styles.th}>Vendor</th>
//                             <th style={styles.th}>Rate</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>{loading ? <tr><td colSpan="9" style={styles.loadingTd}>Loading...</td></tr> : renderRows()}</tbody>
//                 </table>
//             </div>

//             {/* Pagination remains same... */}

//             {/* REUSABLE MODAL CALL */}
//             <StatusUpdateModal 
//                 isOpen={showModal} 
//                 onClose={() => setShowModal(false)} 
//                 formData={editForm} 
//                 setFormData={setEditForm} 
//                 onSave={handleUpdateSubmit} 
//             />
//         </BaseLayout>
//     );
// }

// const styles = {
//     // Styles wahi hain jo aapne diye the...
//     toast: { position: 'fixed', top: '85px', right: '20px', color: '#fff', padding: '12px 25px', borderRadius: '8px', zIndex: 9999, fontWeight: '700', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
//     header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "25px", flexWrap: "wrap", gap: "20px" },
//     titleSection: { flex: 1 },
//     title: { margin: 0, color: "#25343F", fontWeight: "800", fontSize: "24px" },
//     headerActions: { display: "flex", gap: "10px", alignItems: "center" },
//     searchInput: { padding: "10px 15px", borderRadius: "10px", border: "1px solid #CBD5E1", width: "250px", outline: "none" },
//     addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 155, 81, 0.2)" },
//     tableWrapper: { background: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F8FAFC", borderBottom: "2px solid #F1F5F9" },
//     th: { padding: "14px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" },
//     tableRow: { borderBottom: "1px solid #F1F5F9", transition: "0.2s", cursor: "pointer" },
//     td: { padding: "14px 18px", fontSize: "13px", color: "#334155", verticalAlign: "middle" },
//     dateSeparator: { padding: "10px 20px", background: "#F1F5F9", color: "#475569", fontWeight: "800", fontSize: "12px", textTransform: "uppercase" },
//     timeText: { fontWeight: "600", color: "#64748B" },
//     techBadge: { background: "#fff", border: "1px solid #CBD5E1", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//     statusBadge: { padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" },
//     subStatusBadge: { fontSize: "10px", fontWeight: "700", marginLeft: "4px", textTransform: "capitalize", opacity: 0.8 },
//     actionGroup: { display: "flex", gap: "8px" },
//     iconBtn: { border: "1px solid #E2E8F0", background: "#fff", padding: "6px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" },
//     loadingTd: { textAlign: "center", padding: "40px", color: "#64748B", fontWeight: "600" }
// };

// export default CandidateList;







// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/emp_base";

// const Icons = {
//     Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
//     Remark: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9B51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
//     External: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
// };

// const getStatusStyles = (status) => {
//     switch (status) {
//         case "SUBMITTED": return { bg: "#E8F4FD", text: "#1976D2" };
//         case "SCREENING": return { bg: "#FFF9C4", text: "#827717" };
//         case "L1": case "L2": case "L3": return { bg: "#E8EAF6", text: "#3F51B5" };
//         case "OFFERED": return { bg: "#E8F5E9", text: "#2E7D32" };
//         case "REJECTED": return { bg: "#FFEBEE", text: "#C62828" };
//         case "ON_HOLD": return { bg: "#FFF3E0", text: "#E65100" };
//         default: return { bg: "#F8FAFC", text: "#64748B" };
//     }
// };

// function CandidateList() {
//     const navigate = useNavigate();
//     const [candidates, setCandidates] = useState([]);
//     const [count, setCount] = useState(0);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState("");

//     // --- MODAL & TOAST STATES ---
//     const [showModal, setShowModal] = useState(false);
//     const [selectedCand, setSelectedCand] = useState(null);
//     const [editForm, setEditForm] = useState({ main_status: "", sub_status: "", remark: "" });
//     const [toast, setToast] = useState({ show: false, msg: "", type: "" });

//     useEffect(() => {
//         fetchCandidates(currentPage, searchTerm);
//     }, [currentPage, searchTerm]);

//     const fetchCandidates = async (page, search) => {
//         setLoading(true);
//         try {
//             let url = `/employee-portal/api/user/candidates/list/?page=${page}`;
//             if (search) url += `&search=${search}`;
//             const res = await apiRequest(url, "GET");
//             if (res && res.results) {
//                 setCandidates(res.results);
//                 setCount(res.count || 0);
//             }
//         } catch (err) {
//             console.error("Error fetching candidates:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const notify = (msg, type = "success") => {
//         setToast({ show: true, msg, type });
//         setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
//     };

//     // Quick Update Logic
//     const handleQuickEdit = (e, cand) => {
//         e.stopPropagation(); // Redirect rokne ke liye
//         setSelectedCand(cand);
//         setEditForm({
//             main_status: cand.main_status || "SUBMITTED",
//             sub_status: cand.sub_status || "NONE",
//             remark: "" 
//         });
//         setShowModal(true);
//     };

//     const handleUpdateSubmit = async () => {
//         try {
//             await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", editForm);
//             notify("Status updated successfully!");
//             setShowModal(false);
//             fetchCandidates(currentPage, searchTerm);
//         } catch (err) {
//             notify("Update failed", "error");
//         }
//     };

//     const truncate = (text, limit) => (text?.length > limit ? text.substring(0, limit) + "..." : text);

//     const renderRows = () => {
//         let lastDate = "";
//         return candidates.map((c) => {
//             const currentDate = new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
//             let dateSeparator = null;
//             if (currentDate !== lastDate) {
//                 lastDate = currentDate;
//                 dateSeparator = (
//                     <tr key={`date-${c.id}`}>
//                         <td colSpan="9" style={styles.dateSeparator}>{currentDate}</td>
//                     </tr>
//                 );
//             }

//             const statusStyle = getStatusStyles(c.main_status || "SUBMITTED");

//             return (
//                 <React.Fragment key={c.id}>
//                     {dateSeparator}
//                     <tr style={{ ...styles.tableRow, backgroundColor: statusStyle.bg }} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                         <td style={styles.td}>
//                             <div style={styles.timeText}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
//                         </td>
//                         <td style={styles.td}>
//                             <div style={styles.teamInfo}>To: <b>{c.submitted_to_name}</b></div>
//                             <div style={styles.teamInfoBy}>By: <b>{c.created_by_name}</b></div>
//                         </td>
//                         <td style={styles.td}>
//                             <div style={styles.candName}>{c.candidate_name}</div>
//                             <div style={styles.candEmail}>{c.candidate_email}</div>
//                         </td>
//                         <td style={styles.td}><span style={styles.techBadge}>{c.technology || "N/A"}</span></td>
//                         <td style={styles.td}>{c.years_of_experience_manual} Yrs</td>
//                         <td style={styles.td}>
//                             <div style={styles.vendorName}>{truncate(c.vendor_company_name, 15)}</div>
//                             <div style={styles.vendorContact}>{c.vendor_number}</div>
//                         </td>
//                         <td style={styles.td}>
//                             <div style={styles.rateText}>₹{c.vendor_rate}</div>
//                             <div style={styles.rateType}>{c.vendor_rate_type}</div>
//                         </td>
//                         <td style={styles.td}>
//                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//                                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                                     <span style={{ ...styles.statusBadge, color: statusStyle.text }}>{c.main_status || "SUBMITTED"}</span>
//                                     {c.remark && <div title={c.remark}><Icons.Remark /></div>}
//                                 </div>
//                                 {c.sub_status && c.sub_status !== "NONE" && (
//                                     <div style={{ ...styles.subStatusBadge, color: statusStyle.text }}>• {c.sub_status}</div>
//                                 )}
//                             </div>
//                         </td>
//                         <td style={styles.td}>
//                             <div style={styles.actionGroup}>
//                                 <button onClick={(e) => handleQuickEdit(e, c)} style={styles.iconBtn} title="Update Status"><Icons.Edit /></button>
//                                 <button onClick={(e) => { e.stopPropagation(); navigate(`/employee/candidate/edit/${c.id}`); }} style={styles.iconBtn} title="Full Edit"><Icons.External /></button>
//                             </div>
//                         </td>
//                     </tr>
//                 </React.Fragment>
//             );
//         });
//     };

//     return (
//         <BaseLayout>
//             {toast.show && (
//                 <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#E74C3C' : '#27AE60'}}>
//                     {toast.msg}
//                 </div>
//             )}

//             <div style={styles.header}>
//                 <div style={styles.titleSection}>
//                     <h2 style={styles.title}>Team Candidates ({count})</h2>
//                     <p style={styles.subtitle}>Track and manage all submitted profiles</p>
//                 </div>
//                 <div style={styles.headerActions}>
//                     <input 
//                         placeholder="Search candidates..." 
//                         style={styles.searchInput}
//                         value={searchTerm}
//                         onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
//                     />
//                     <button onClick={() => navigate("/employee/candidates/add")} style={styles.addBtn}>+ Add Candidate</button>
//                 </div>
//             </div>

//             <div style={styles.tableWrapper}>
//                 <table style={styles.table}>
//                     <thead>
//                         <tr style={styles.tableHeader}>
//                             <th style={styles.th}>Time</th>
//                             <th style={styles.th}>Team Info</th>
//                             <th style={styles.th}>Candidate</th>
//                             <th style={styles.th}>Tech</th>
//                             <th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Vendor</th>
//                             <th style={styles.th}>Rate</th>
//                             <th style={styles.th}>Status</th>
//                             <th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {loading ? (
//                             <tr><td colSpan="9" style={styles.loadingTd}>Loading Candidates Data...</td></tr>
//                         ) : candidates.length > 0 ? renderRows() : (
//                             <tr><td colSpan="9" style={styles.loadingTd}>No candidates found.</td></tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Pagination */}
//             <div style={styles.pagination}>
//                 <button disabled={currentPage === 1 || loading} onClick={() => setCurrentPage(p => p - 1)} style={currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtn}>Previous</button>
//                 <div style={styles.pageIndicator}>Page {currentPage} of {Math.ceil(count / 10) || 1}</div>
//                 <button disabled={candidates.length < 10 || loading} onClick={() => setCurrentPage(p => p + 1)} style={candidates.length < 10 ? styles.pageBtnDisabled : styles.pageBtn}>Next</button>
//             </div>

//             {/* Status Modal */}
//             {showModal && (
//                 <div style={styles.modalOverlay}>
//                     <div style={styles.modalContent}>
//                         <h3 style={{color:'#25343F', marginBottom:'20px'}}>Update Status</h3>
//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Main Status</label>
//                             <select style={styles.select} value={editForm.main_status} onChange={e => setEditForm({...editForm, main_status: e.target.value})}>
//                                 <option value="SUBMITTED">Submitted</option><option value="SCREENING">Screening</option>
//                                 <option value="L1">L1</option><option value="L2">L2</option><option value="L3">L3</option>
//                                 <option value="OTHER">Other</option><option value="OFFERED">Offered</option>
//                                 <option value="ONBORD">Onbord</option><option value="ON_HOLD">On Hold</option>
//                                 <option value="REJECTED">Rejected</option><option value="WITHDRAWN">Withdrawn</option>
//                             </select>
//                         </div>
//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Sub Status</label>
//                             <select style={styles.select} value={editForm.sub_status} onChange={e => setEditForm({...editForm, sub_status: e.target.value})}>
//                                  <option value="NONE">None</option><option value="SCHEDULED">Scheduled</option>
//                                 <option value="COMPLETED">Completed</option><option value="FEEDBACK_PENDING">Feedback Pending</option>
//                                 <option value="CLEARED">Cleared</option><option value="REJECTED">Rejected</option>
//                                 <option value="ON_HOLD">On Hold</option><option value="POSTPONED">Postponed</option>
//                                 <option value="NO_SHOW">No Show</option><option value="INTERVIEW_PENDING">Interview Pending</option>
//                             </select>
//                         </div>
//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Remark</label>
//                             <textarea style={styles.textarea} value={editForm.remark} onChange={e => setEditForm({...editForm, remark: e.target.value})} placeholder="Add naya remark..." />
//                         </div>
//                         <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
//                             <button style={styles.saveBtn} onClick={handleUpdateSubmit}>Save Changes</button>
//                             <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </BaseLayout>
//     );
// }

// const styles = {
//     toast: { position: 'fixed', top: '85px', right: '20px', color: '#fff', padding: '12px 25px', borderRadius: '8px', zIndex: 9999, fontWeight: '700', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
//     header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "25px", flexWrap: "wrap", gap: "20px" },
//     titleSection: { flex: 1 },
//     title: { margin: 0, color: "#25343F", fontWeight: "800", fontSize: "24px" },
//     subtitle: { margin: "5px 0 0 0", color: "#64748B", fontSize: "14px" },
//     headerActions: { display: "flex", gap: "10px", alignItems: "center" },
//     searchInput: { padding: "10px 15px", borderRadius: "10px", border: "1px solid #CBD5E1", width: "250px", outline: "none" },
//     addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 155, 81, 0.2)" },
//     tableWrapper: { background: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F8FAFC", borderBottom: "2px solid #F1F5F9" },
//     th: { padding: "14px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" },
//     tableRow: { borderBottom: "1px solid #F1F5F9", transition: "0.2s", cursor: "pointer" },
//     td: { padding: "14px 18px", fontSize: "13px", color: "#334155", verticalAlign: "middle" },
//     dateSeparator: { padding: "10px 20px", background: "#F1F5F9", color: "#475569", fontWeight: "800", fontSize: "12px", textTransform: "uppercase" },
//     timeText: { fontWeight: "600", color: "#64748B" },
//     teamInfo: { fontSize: "12px", color: "#475569" },
//     teamInfoBy: { fontSize: "11px", color: "#27AE60", marginTop: "2px" },
//     candName: { fontWeight: "700", color: "#1E293B" },
//     candEmail: { fontSize: "11px", color: "#64748B" },
//     techBadge: { background: "#fff", border: "1px solid #CBD5E1", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//     vendorName: { fontWeight: "600", color: "#334155" },
//     vendorContact: { fontSize: "11px", color: "#64748B" },
//     rateText: { fontWeight: "700", color: "#1E293B" },
//     rateType: { fontSize: "10px", color: "#94A3B8", fontWeight: "700" },
//     statusBadge: { padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" },
//     subStatusBadge: { fontSize: "10px", fontWeight: "700", marginLeft: "4px", textTransform: "capitalize", opacity: 0.8 },
//     actionGroup: { display: "flex", gap: "8px" },
//     iconBtn: { border: "1px solid #E2E8F0", background: "#fff", padding: "6px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" },
//     pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "25px", marginTop: "30px" },
//     pageBtn: { padding: "10px 20px", background: "#25343F", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
//     pageBtnDisabled: { padding: "10px 20px", background: "#E2E8F0", color: "#94A3B8", border: "none", borderRadius: "10px", cursor: "not-allowed" },
//     pageIndicator: { fontWeight: "700", color: "#475569", fontSize: "14px" },
//     loadingTd: { textAlign: "center", padding: "40px", color: "#64748B", fontWeight: "600" },
//     modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' },
//     modalContent: { background: '#fff', padding: '30px', borderRadius: '15px', width: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' },
//     inputGroup: { marginBottom: '15px' },
//     modalLabel: { fontSize: '11px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '5px', textTransform: 'uppercase' },
//     select: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' },
//     textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', height: '80px', resize: 'none' },
//     saveBtn: { flex: 1, background: '#FF9B51', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },
//     cancelBtn: { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }
// };

// export default CandidateList;






// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/emp_base";

// const Icons = {
//     Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
//     Remark: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9B51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
//     External: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
// };

// const getStatusStyles = (status) => {
//     switch (status) {
//         case "SUBMITTED": return { bg: "#E8F4FD", text: "#1976D2" };
//         case "SCREENING": return { bg: "#FFF9C4", text: "#827717" };
//         case "L1": case "L2": case "L3": return { bg: "#E8EAF6", text: "#3F51B5" };
//         case "OFFERED": return { bg: "#E8F5E9", text: "#2E7D32" };
//         case "REJECTED": return { bg: "#FFEBEE", text: "#C62828" };
//         case "ON_HOLD": return { bg: "#FFF3E0", text: "#E65100" };
//         default: return { bg: "#F8FAFC", text: "#64748B" };
//     }
// };

// function CandidateList() {
//     const navigate = useNavigate();
//     const [candidates, setCandidates] = useState([]);
//     const [count, setCount] = useState(0);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState("");

//     useEffect(() => {
//         fetchCandidates(currentPage, searchTerm);
//     }, [currentPage, searchTerm]);

//     // const fetchCandidates = async (page, search) => {
//     //     setLoading(true);
//     //     try {
//     //         let url = `/employee-portal/api/user/candidates/list/?page=${page}`;
//     //         if (search) url += `&search=${search}`;
//     //         const res = await apiRequest(url, "GET");
//     //         setCandidates(res.results || []);
//     //         setCount(res.count || 0);
//     //     } catch (err) {
//     //         console.error("Error fetching candidates:", err);
//     //     } finally {
//     //         setLoading(false);
//     //     }
//     // };

//     const fetchCandidates = async (page, search) => {
//         setLoading(true);
//         try {
//             let url = `/employee-portal/api/user/candidates/list/?page=${page}`;
//             if (search) url += `&search=${search}`;
            
//             console.log("Fetching from URL:", url); // Debugging line
//             const res = await apiRequest(url, "GET");
//             console.log("API Response:", res); // Debugging line

//             // Check karein ki res.results exist karta hai ya nahi
//             if (res && res.results) {
//                 setCandidates(res.results);
//                 setCount(res.count || 0);
//             } else {
//                 setCandidates([]);
//                 setCount(0);
//             }
//         } catch (err) {
//             console.error("Error fetching candidates:", err);
//             setCandidates([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const truncate = (text, limit) => (text?.length > limit ? text.substring(0, limit) + "..." : text);

//     // Grouping by Date logic
//     const renderRows = () => {
//         let lastDate = "";
//         return candidates.map((c) => {
//             const currentDate = new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
//             let dateSeparator = null;
//             if (currentDate !== lastDate) {
//                 lastDate = currentDate;
//                 dateSeparator = (
//                     <tr key={`date-${c.id}`}>
//                         <td colSpan="9" style={styles.dateSeparator}>{currentDate}</td>
//                     </tr>
//                 );
//             }

//             const statusStyle = getStatusStyles(c.main_status || "SUBMITTED");

//             return (
//                 <React.Fragment key={c.id}>
//                     {dateSeparator}
//                     <tr style={{ ...styles.tableRow, backgroundColor: statusStyle.bg }}>
//                         <td style={styles.td}>
//                             <div style={styles.timeText}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
//                         </td>
//                         <td style={styles.td}>
//                             <div style={styles.teamInfo}>To: <b>{c.submitted_to_name}</b></div>
//                             <div style={styles.teamInfoBy}>By: <b>{c.created_by_name}</b></div>
//                         </td>
//                         <td style={styles.td}>
//                             <div style={styles.candName}>{c.candidate_name}</div>
//                             <div style={styles.candEmail}>{c.candidate_email}</div>
//                         </td>
//                         <td style={styles.td}>
//                             <span style={styles.techBadge}>{c.technology || "N/A"}</span>
//                         </td>
//                         <td style={styles.td}>{c.years_of_experience_manual} Yrs</td>
//                         <td style={styles.td}>
//                             <div style={styles.vendorName}>{truncate(c.vendor_company_name, 15)}</div>
//                             <div style={styles.vendorContact}>{c.vendor_number}</div>
//                         </td>
//                         <td style={styles.td}>
//                             <div style={styles.rateText}>₹{c.vendor_rate}</div>
//                             <div style={styles.rateType}>{c.vendor_rate_type}</div>
//                         </td>
//                         {/* <td style={styles.td}>
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//                                 <span style={{ ...styles.statusBadge, color: statusStyle.text }}>{c.main_status || "SUBMITTED"}</span>
//                                 <span style={{ ...styles.statusBadge, color: statusStyle.text }}>{c.sub_status || "NONE"}</span>
//                                 {c.remark && <Icons.Remark />}
//                             </div>
//                         </td> */}
//                         <td style={styles.td}>
//                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
//                                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                                     {/* Main Status Badge */}
//                                     <span style={{ ...styles.statusBadge, backgroundColor: statusStyle.bg, color: statusStyle.text }}>
//                                         {c.main_status || "SUBMITTED"}
//                                     </span>

//                                     {/* Remark Icon with Hover Tooltip */}
//                                     {c.remark && (
//                                         <div 
//                                             style={styles.remarkWrapper} 
//                                             title={c.remark} // Simple browser tooltip
//                                         >
//                                             <Icons.Remark />
//                                             {/* Custom Tooltip (Optional: CSS se handle hoga) */}
//                                             {/* <span className="remark-tooltip">{c.remark}</span> */}
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Sub Status - Thoda chota aur subtle display */}
//                                 {c.sub_status && c.sub_status !== "NONE" && (
//                                     <div style={{ ...styles.subStatusBadge, color: statusStyle.text }}>
//                                         • {c.sub_status}
//                                     </div>
//                                 )}
//                             </div>
//                         </td>
//                         <td style={styles.td}>
//                             <div style={styles.actionGroup}>
//                                 <button onClick={() => navigate(`/employee/candidate/view/${c.id}`)} style={styles.iconBtn} title="View Detail"><Icons.External /></button>
//                                 <button onClick={() => navigate(`/employee/candidate/edit/${candidate.id}`)} style={styles.iconBtn} title="Edit"><Icons.Edit /></button>
//                             </div>
//                         </td>
//                     </tr>
//                 </React.Fragment>
//             );
//         });
//     };

//     return (
//         <BaseLayout>
//             <div style={styles.header}>
//                 <div style={styles.titleSection}>
//                     <h2 style={styles.title}>Team Candidates ({count})</h2>
//                     <p style={styles.subtitle}>Track and manage all submitted profiles</p>
//                 </div>
//                 <div style={styles.headerActions}>
//                     <input 
//                         placeholder="Search candidates..." 
//                         style={styles.searchInput}
//                         value={searchTerm}
//                         onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
//                     />
//                     <button onClick={() => navigate("/employee/candidates/add")} style={styles.addBtn}>+ Add Candidate</button>
//                 </div>
//             </div>

//             <div style={styles.tableWrapper}>
//                 <table style={styles.table}>
//                     <thead>
//                         <tr style={styles.tableHeader}>
//                             <th style={styles.th}>Time</th>
//                             <th style={styles.th}>Team Info</th>
//                             <th style={styles.th}>Candidate</th>
//                             <th style={styles.th}>Tech</th>
//                             <th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Vendor</th>
//                             <th style={styles.th}>Rate</th>
//                             <th style={styles.th}>Status</th>
//                             <th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {loading ? (
//                             <tr><td colSpan="9" style={styles.loadingTd}>Loading Candidates Data...</td></tr>
//                         ) : candidates.length > 0 ? renderRows() : (
//                             <tr><td colSpan="9" style={styles.loadingTd}>No candidates found.</td></tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Pagination */}
//             <div style={styles.pagination}>
//                 <button 
//                     disabled={currentPage === 1 || loading} 
//                     onClick={() => setCurrentPage(p => p - 1)}
//                     style={currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtn}
//                 >Previous</button>
//                 <div style={styles.pageIndicator}>Page {currentPage} of {Math.ceil(count / 10) || 1}</div>
//                 <button 
//                     disabled={candidates.length < 10 || loading} 
//                     onClick={() => setCurrentPage(p => p + 1)}
//                     style={candidates.length < 10 ? styles.pageBtnDisabled : styles.pageBtn}
//                 >Next</button>
//             </div>
//         </BaseLayout>
//     );
// }

// const styles = {
//     header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "25px", flexWrap: "wrap", gap: "20px" },
//     titleSection: { flex: 1 },
//     title: { margin: 0, color: "#25343F", fontWeight: "800", fontSize: "24px" },
//     subtitle: { margin: "5px 0 0 0", color: "#64748B", fontSize: "14px" },
//     headerActions: { display: "flex", gap: "10px", alignItems: "center" },
//     searchInput: { padding: "10px 15px", borderRadius: "10px", border: "1px solid #CBD5E1", width: "250px", outline: "none" },
//     addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 155, 81, 0.2)" },
//     tableWrapper: { background: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F8FAFC", borderBottom: "2px solid #F1F5F9" },
//     th: { padding: "14px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" },
//     tableRow: { borderBottom: "1px solid #F1F5F9", transition: "0.2s" },
//     td: { padding: "14px 18px", fontSize: "13px", color: "#334155", verticalAlign: "middle" },
//     dateSeparator: { padding: "10px 20px", background: "#F1F5F9", color: "#475569", fontWeight: "800", fontSize: "12px", textTransform: "uppercase" },
//     timeText: { fontWeight: "600", color: "#64748B" },
//     teamInfo: { fontSize: "12px", color: "#475569" },
//     teamInfoBy: { fontSize: "11px", color: "#27AE60", marginTop: "2px" },
//     candName: { fontWeight: "700", color: "#1E293B" },
//     candEmail: { fontSize: "11px", color: "#64748B" },
//     techBadge: { background: "#fff", border: "1px solid #CBD5E1", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//     vendorName: { fontWeight: "600", color: "#334155" },
//     vendorContact: { fontSize: "11px", color: "#64748B" },
//     rateText: { fontWeight: "700", color: "#1E293B" },
//     rateType: { fontSize: "10px", color: "#94A3B8", fontWeight: "700" },
//     statusBadge: { padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" },
//     actionGroup: { display: "flex", gap: "8px" },
//     iconBtn: { border: "1px solid #E2E8F0", background: "#fff", padding: "6px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center" },
//     pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "25px", marginTop: "30px" },
//     pageBtn: { padding: "10px 20px", background: "#25343F", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
//     pageBtnDisabled: { padding: "10px 20px", background: "#E2E8F0", color: "#94A3B8", border: "none", borderRadius: "10px", cursor: "not-allowed" },
//     pageIndicator: { fontWeight: "700", color: "#475569", fontSize: "14px" },
//     loadingTd: { textAlign: "center", padding: "40px", color: "#64748B", fontWeight: "600" }
// };

// export default CandidateList;







// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/emp_base";

// function CandidateList() {
//     const navigate = useNavigate();
//     const [candidates, setCandidates] = useState([]);
//     const [count, setCount] = useState(0);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [loading, setLoading] = useState(true);
    
//     // Search aur Filter States
//     const [searchTerm, setSearchTerm] = useState("");
//     const [techFilter, setTechFilter] = useState("");

//     useEffect(() => {
//         fetchCandidates(currentPage, searchTerm, techFilter);
//     }, [currentPage, searchTerm, techFilter]);

//     const fetchCandidates = async (page, search, tech) => {
//         setLoading(true);
//         try {
//             // API call with params
//             let url = `/employee-portal/api/user/candidates/list/?page=${page}`;
//             if (search) url += `&search=${search}`;
//             if (tech) url += `&technology=${tech}`;

//             const res = await apiRequest(url, "GET");
//             setCandidates(res.results || []);
//             setCount(res.count || 0);
//         } catch (err) {
//             console.error("Error fetching candidates:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <BaseLayout>
//             {/* Header Section */}
//             <div style={styles.header}>
//                 <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
//                     <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
//                     <h2 style={styles.title}>Candidates ({count})</h2>
//                 </div>
//                 <button onClick={() => navigate("/employee/candidates/add")} style={styles.addBtn}>+ Add Candidate</button>
//             </div>

//             {/* Filter Bar */}
//             <div style={styles.filterBar}>
//                 <input 
//                     placeholder="Search by name or email..." 
//                     style={styles.searchInput}
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//                 <input 
//                     placeholder="Filter by Tech (AI, ML, React...)" 
//                     style={styles.filterInput}
//                     value={techFilter}
//                     onChange={(e) => setTechFilter(e.target.value)}
//                 />
//             </div>

//             {/* Candidates Table */}
//             <div style={styles.tableCard}>
//                 <table style={styles.table}>
//                     <thead>
//                         <tr style={styles.tableHeader}>
//                             <th style={styles.th}>Submitted To & Submitted By</th>
//                             <th style={styles.th}>Candidate</th>
//                             <th style={styles.th}>Tech / Skills</th>
//                             <th style={styles.th}>Experience</th>
//                             <th style={styles.th}>Vendor</th>
//                             <th style={styles.th}>Resume</th>
//                             <th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {loading ? (
//                             <tr><td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>Loading candidates...</td></tr>
//                         ) : candidates.map(can => (
//                             <tr key={can.id} style={styles.tr}>
//                                 <td style={styles.td}>{can.submitted_to_name} & {can.created_by_name}</td>

//                                 <td style={styles.td}>
//                                     <div style={{ fontWeight: "bold", color: "#25343F" }}>{can.candidate_name}</div>
//                                     <div style={{ fontSize: "11px", color: "#666" }}>{can.candidate_email || "No Email"}</div>
//                                 </td>
//                                 <td style={styles.td}>
//                                     <span style={styles.techBadge}>{can.technology || "N/A"}</span>
//                                     <div style={styles.skillText}>{can.skills?.substring(0, 30)}...</div>
//                                 </td>
//                                 <td style={styles.td}>
//                                     <div>Manual: {can.years_of_experience_manual}</div>
//                                     <div style={{ fontSize: "11px", color: "#FF9B51" }}>System: {can.years_of_experience_calculated} yrs</div>
//                                 </td>
//                                 <td style={styles.td}>
//                                     <div style={{fontWeight: "600"}}>{can.vendor_company_name}</div>
//                                     <div style={{fontSize: "11px"}}>{can.vendor_name}</div>
//                                 </td>
                                
//                                 <td style={styles.td}>
//                                     <a href={can.resume} target="_blank" rel="noreferrer" style={styles.resumeLink}>View Resume</a>
//                                 </td>
//                                 <td style={styles.td}>
//                                     <button onClick={() => navigate(`/employee/candidate/view/${can.id}`)} style={styles.viewBtn}>View</button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Pagination */}
//             <div style={styles.pagination}>
//                 <button 
//                     disabled={currentPage === 1} 
//                     onClick={() => setCurrentPage(p => p - 1)}
//                     style={currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtn}
//                 >Previous</button>
                
//                 <span style={styles.pageInfo}>Page {currentPage} of {Math.ceil(count / 10)}</span>
                
//                 <button 
//                     disabled={candidates.length < 10 && currentPage * 10 >= count} 
//                     onClick={() => setCurrentPage(p => p + 1)}
//                     style={candidates.length < 10 ? styles.pageBtnDisabled : styles.pageBtn}
//                 >Next</button>
//             </div>
//         </BaseLayout>
//     );
// }

// const styles = {
//     header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
//     backBtn: { background: "#25343F", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer" },
//     title: { margin: 0, color: "#25343F", fontWeight: "800" },
//     addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" },
//     filterBar: { display: "flex", gap: "15px", marginBottom: "20px" },
//     searchInput: { flex: 2, padding: "12px", borderRadius: "10px", border: "1px solid #BFC9D1", outline: "none" },
//     filterInput: { flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #BFC9D1", outline: "none" },
//     tableCard: { background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" },
//     table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
//     tableHeader: { background: "#F5F7F9", borderBottom: "2px solid #EAEFEF" },
//     th: { padding: "15px", fontSize: "13px", color: "#25343F", textTransform: "uppercase", fontWeight: "800" },
//     tr: { borderBottom: "1px solid #F0F0F0", transition: "0.2s" },
//     td: { padding: "15px", fontSize: "14px", verticalAlign: "top" },
//     techBadge: { background: "#FFFBF8", color: "#FF9B51", padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "bold", border: "1px solid #FFE6D5" },
//     skillText: { fontSize: "11px", color: "#888", marginTop: "5px" },
//     resumeLink: { color: "#25343F", fontWeight: "bold", textDecoration: "underline", fontSize: "12px" },
//     viewBtn: { background: "#EAEFEF", border: "none", padding: "5px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "12px" },
//     pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginTop: "25px" },
//     pageBtn: { padding: "8px 20px", background: "#25343F", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
//     pageBtnDisabled: { padding: "8px 20px", background: "#BFC9D1", color: "#fff", border: "none", borderRadius: "8px", cursor: "not-allowed" },
//     pageInfo: { fontWeight: "bold", color: "#25343F" }
// };

// export default CandidateList;