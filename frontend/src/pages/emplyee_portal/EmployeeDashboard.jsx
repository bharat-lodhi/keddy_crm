import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../components/emp_base";
import { apiRequest } from "../../services/api";

const Icons = {
    UserPlus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>,
    Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Buildings: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="10" width="20" height="12" rx="2"/><path d="M7 10V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6"/></svg>,

    Client: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
    ),

    Vendor: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
        <circle cx="18" cy="8" r="3"/><path d="M18 11v5"/>
    </svg>
    ),

    Pipeline: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
    ),

    Send: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    Remark: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9B51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
};

function EmployeeDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [todayCandidates, setTodayCandidates] = useState([]);
    const [verifiedCandidates, setVerifiedCandidates] = useState([]);
    const [pipelineCandidates, setPipelineCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, msg: "", type: "" });

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [selectedCand, setSelectedCand] = useState(null);
    const [editForm, setEditForm] = useState({ main_status: "", sub_status: "", remark: "" });

    const fetchAllData = async () => {
        try {
            const [sData, tData, vData, pData] = await Promise.all([
                apiRequest("/employee-portal/dashboard/stats/"),
                apiRequest("/employee-portal/dashboard/today-candidates/"),
                apiRequest("/employee-portal/dashboard/today-verified-candidates/"),
                apiRequest("/employee-portal/dashboard/active-pipeline-candidates/")
            ]);
            setStats(sData);
            setTodayCandidates(tData);
            setVerifiedCandidates(vData);
            setPipelineCandidates(pData);
        } catch (err) { notify("Failed to load dashboard data", "error"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAllData(); }, []);

    const notify = (msg, type = "success") => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
    };

    const handleEditClick = (e, candidate) => {
        e.stopPropagation();
        setSelectedCand(candidate);
        setEditForm({ main_status: candidate.main_status, sub_status: candidate.sub_status, remark: candidate.remark || "" });
        setShowModal(true);
    };

    const handleUpdateSubmit = async () => {
        try {
            await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", editForm);
            notify("Status updated successfully!");
            setShowModal(false);
            fetchAllData();
        } catch (err) { notify("Update failed", "error"); }
    };

    const handleVerify = async (e, id) => {
        e.stopPropagation();
        try {
            await apiRequest(`/employee-portal/candidates/${id}/update/`, "PUT", { verification_status: true });
            notify("Candidate profile submitted!");
            fetchAllData();
        } catch (err) { notify("Submission failed", "error"); }
    };

    const truncate = (text, limit) => (text?.length > limit ? text.substring(0, limit) + "..." : text);

    if (loading) return <BaseLayout><div style={styles.loading}>Loading Dashboard...</div></BaseLayout>;

    return (
        <BaseLayout>
            {/* Toast Notification */}
            {toast.show && (
                <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#E74C3C' : '#27AE60'}}>
                    {toast.msg}
                </div>
            )}


            <div style={styles.header}>
                <div>
                    <h2 style={styles.welcome}>Welcome, {stats.user_name || "Recruiter"}</h2>
                    <p style={styles.subText}>Here is your recruitment pipeline overview for today.</p>
                </div>
                
                {/* Dono buttons ko is div ke andar rakhein taaki wo ek saath rahein */}
                <div style={styles.btnGroup}>
                    <button style={styles.actionBtn} onClick={() => navigate("/employee/candidates/add")}>
                        <Icons.UserPlus /> Add Profile
                    </button>

                    <button style={styles.actionBtn} onClick={() => navigate("/employee/vendor/add")}>
                        <Icons.UserPlus /> Add Vendor
                    </button>
                </div>
            </div>



            <div style={styles.statsGrid}>
                {[
                    { label: "Total Pipeline", val: stats.total_pipelines, icon: <Icons.Pipeline />, col: "#25343F", url: "/employee" },
                    { label: "Today's Profiles", val: stats.today_profiles, icon: <Icons.UserPlus />, col: "#25343F", url: "/employee" },
                    { label: "Today Submitted", val: stats.today_submitted_profiles, icon: <Icons.Send />, col: "#FF9B51", url: "/employee" },
                    { label: "Total Vendors", val: stats.total_vendors, icon: <Icons.Vendor />, col: "#25343F", url: "/employee/user-vendors" },
                    { label: "Total Clients", val: stats.total_clients, icon: <Icons.Client />, col: "#25343F", url: "/employee/clients" },
                    { label: "Total Profiles", val: stats.total_profiles, icon: <Icons.Users />, col: "#25343F", url: "/employee/user-candidates" },
                ].map((s, i) => (
                    <div
                        key={i}
                        style={{ ...styles.statCard, cursor: "pointer" }}
                        onClick={() => navigate(s.url)}
                    >
                        <div>
                            <p style={styles.statLabel}>{s.label}</p>
                            <h3 style={{ ...styles.statValue, color: s.col }}>{s.val || 0}</h3>
                        </div>
                        <div
                            style={{
                                ...styles.iconCircle,
                                color: s.col,
                                backgroundColor: s.col === '#FF9B51'
                                    ? 'rgba(255,155,81,0.1)'
                                    : 'rgba(37,52,63,0.05)'
                            }}
                        >
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>


            {/* Table 1: Active Pipelines */}
            <Section title="Active Pipeline Candidates">
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
                            <th style={styles.th}>Client</th>
                            <th style={styles.th}>Vendor & Contact</th>
                            <th style={styles.th}>Vendor Rate</th>
                            <th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pipelineCandidates.map((c, i) => (
                            <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
                                <td style={styles.td}><b>{c.candidate_name}</b></td>
                                <td style={styles.td} title={c.technology}>{truncate(c.technology, 100)}</td>
                                <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
                                <td style={styles.td}>{c.client || "N/A"}</td>
                                <td style={styles.td}><b>{truncate(c.vendor, 15)}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
                                <td style={styles.td}>₹{c.vendor_rate}</td>
                                <td style={styles.td}>
                                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                        <span style={styles.badge}>{c.main_status}</span>
                                        {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
                                    </div>
                                    <small style={styles.subStatus}>{c.sub_status}</small>
                                </td>
                                <td style={styles.td}><button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* Table 2: Submitted Profiles */}
            <Section title="Submitted Profiles Table">
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
                            <th style={styles.th}>Client</th>
                            <th style={styles.th}>Vendor & Contact</th>
                            <th style={styles.th}>Vendor Rate</th>
                            
                            <th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {verifiedCandidates.map((c, i) => (
                            <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
                                <td style={styles.td}><b>{c.candidate_name}</b></td>
                                <td style={styles.td}>{truncate(c.technology, 100)}</td>
                                <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
                                <td style={styles.td}>{c.client || "N/A"}</td>
                                <td style={styles.td}><b>{truncate(c.vendor, 15)}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
                                <td style={styles.td}>₹{c.vendor_rate}</td>
                                <td style={styles.td}>
                                    
                                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                        <span style={{...styles.badge, background:'#E3F2FD', color:'#1976D2'}}>{c.main_status}</span>
                                        {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
                                    </div>
                                    <small style={styles.subStatus}>{c.sub_status}</small>
                                </td>
                                <td style={styles.td}><button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* Table 3: Today's New Profiles */}
            <Section title="Today's New Profiles">
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
                            <th style={styles.th}>Client</th>
                            <th style={styles.th}>Vendor & Contact</th>
                            <th style={styles.th}>Vendor Rate</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {todayCandidates.map((c, i) => (
                            <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
                                <td style={styles.td}><b>{c.candidate_name}</b></td>
                                <td style={styles.td}>{truncate(c.technology, 100)}</td>
                                <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>

                                <td style={styles.td}>{c.client || "N/A"}</td>
                                <td style={styles.td}><b>{truncate(c.vendor, 15)}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
                                <td style={styles.td}>₹{c.vendor_rate}</td>
                                <td style={styles.td}>
                                    {!c.verification_status ? (
                                        <button style={styles.submitBtn} onClick={(e) => handleVerify(e, c.id)}>Submit</button>
                                    ) : (
                                        <span style={{color:'#27AE60', fontWeight:'700', fontSize:'12px'}}>✓ Submitted</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* Update Modal */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={{color:'#25343F', marginBottom:'20px'}}>Update Status</h3>
                        <div style={styles.inputGroup}>
                            <label style={styles.modalLabel}>Main Status</label>
                            <select style={styles.select} value={editForm.main_status} onChange={e => setEditForm({...editForm, main_status: e.target.value})}>


                                <option value="SCREENING">Screening</option>
                                <option value="L1">L1</option>
                                <option value="L2">L2</option>
                                <option value="L3">L3</option>
                                <option value="OTHER">Other</option>
                                <option value="SELECTED">Selected</option>
                                <option value="HOLD">Hold</option>
                                <option value="NOT_MATCHED">Not Matched</option>
                                <option value="REJECTED">Rejected</option>

                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.modalLabel}>Sub Status</label>
                            <select style={styles.select} value={editForm.sub_status} onChange={e => setEditForm({...editForm, sub_status: e.target.value})}>
                                {/* <option value="PENDING">PENDING</option><option value="DONE">DONE</option><option value="NONE">NONE</option> */}
                               
                                <option value="NONE">None</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="DONE_WAIT_FOR_THE_UPDATE">Done,Wait For The Update</option>
                                {/* <option value="WAIT_FOR_THE_UPDATE">Wait For The Update</option> */}
                                
                                <option value="SELECTED_WAIT_FOR_NEXT_ROUND">Selected, Wait for Next Round</option>
                                
                                <option value="FINAL_SELECTED">Final Selected</option>
                                <option value="HOLD">Hold</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="POSTPONED">Postponed</option>
                            
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.modalLabel}>Remark</label>
                            <textarea style={styles.textarea} value={editForm.remark} onChange={e => setEditForm({...editForm, remark: e.target.value})} placeholder="Internal notes..." />
                        </div>
                        <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                            <button style={styles.saveBtn} onClick={handleUpdateSubmit}>Save Changes</button>
                            <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </BaseLayout>
    );
}

const Section = ({ title, children }) => (
    <div style={styles.sectionContainer}>
        <div style={styles.sectionHeader}><h3 style={styles.sectionTitle}>{title}</h3></div>
        <div style={styles.tableWrapper}><div style={{overflowX:'auto'}}>{children}</div></div>
    </div>
);

const styles = {
    loading: { padding: '100px', textAlign: 'center', fontWeight: '800', color: '#25343F' },
    toast: { position: 'fixed', top: '85px', right: '20px', color: '#fff', padding: '12px 25px', borderRadius: '8px', zIndex: 9999, fontWeight: '700', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" },
    btnGroup: { display: "flex", gap: "10px", alignItems: "center"},
    welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
    subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
    actionBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", boxShadow: "0 4px 10px rgba(255,155,81,0.2)" },
    // statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" },
    statsGrid: { 
    display: "grid", 
    // Desktop (badi screens) ke liye 6 columns, aur mobile ke liye automatic wrap
    gridTemplateColumns: "repeat(6, 1fr)", 
    gap: "15px", 
    marginBottom: "30px",
    // Agar screen choti ho toh cards overlap na ho, isliye horizontal scroll ya wrapping handle karein
    overflowX: "auto", 
    paddingBottom: "10px" 
},
    statCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4" },
    statLabel: { margin: 0, color: "#7F8C8D", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" },
    statValue: { margin: "4px 0", fontSize: "24px", fontWeight: "800" },
    iconCircle: { width: "44px", height: "44px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
    sectionContainer: { marginBottom: "35px" },
    sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
    sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #FF9B51", paddingLeft: "12px" },
    tableWrapper: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
    th: { padding: "14px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
    tableRow: { borderBottom: "1px solid #F1F5F9", transition: "0.2s" },
    td: { padding: "14px 18px", fontSize: "14px", color: "#334155" },
    badge: { background: "rgba(255, 155, 81, 0.12)", color: "#FF9B51", padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
    subStatus: { fontSize: '12px', color: '#7f8c8d', display: 'block' },
    remarkIcon: { display: 'flex', cursor: 'help', padding: '4px', borderRadius: '4px', background: '#FFF5EB' },
    editBtn: { border: 'none', background: '#F1F5F9', padding: '6px', borderRadius: '6px', cursor: 'pointer' },
    submitBtn: { background: '#25343F', color: '#fff', border: 'none', padding: '6px 15px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '12px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' },
    modalContent: { background: '#fff', padding: '30px', borderRadius: '15px', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' },
    inputGroup: { marginBottom: '15px' },
    modalLabel: { fontSize: '11px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '5px', textTransform: 'uppercase' },
    select: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' },
    textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', height: '80px', resize: 'none' },
    saveBtn: { flex: 1, background: '#FF9B51', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },
    cancelBtn: { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }
};

export default EmployeeDashboard;





// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import BaseLayout from "../components/emp_base";
// import { apiRequest } from "../../services/api"; 

// const Icons = {
//     UserPlus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>,
//     Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
//     Buildings: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="10" width="20" height="12" rx="2"/><path d="M7 10V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6"/></svg>,
//     Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
//     Note: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9B51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
//     Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
// };

// function EmployeeDashboard() {
//     const navigate = useNavigate();
//     const [stats, setStats] = useState({});
//     const [todayCandidates, setTodayCandidates] = useState([]);
//     const [verifiedCandidates, setVerifiedCandidates] = useState([]);
//     const [pipelineCandidates, setPipelineCandidates] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [toast, setToast] = useState({ show: false, msg: "", type: "" });

//     // Modal state for Edit Status
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [selectedCandidate, setSelectedCandidate] = useState(null);
//     const [editForm, setEditForm] = useState({ main_status: "", sub_status: "", remark: "" });

//     const showNotify = (msg, type = "success") => {
//         setToast({ show: true, msg, type });
//         setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
//     };

//     const fetchAllData = async () => {
//         try {
//             const [sData, tData, vData, pData] = await Promise.all([
//                 apiRequest("/employee-portal/dashboard/stats/"),
//                 apiRequest("/employee-portal/dashboard/today-candidates/"),
//                 apiRequest("/employee-portal/dashboard/today-verified-candidates/"),
//                 apiRequest("/employee-portal/dashboard/active-pipeline-candidates/")
//             ]);
//             setStats(sData);
//             setTodayCandidates(tData);
//             setVerifiedCandidates(vData);
//             setPipelineCandidates(pData);
//         } catch (err) { showNotify("Data fetch failed", "error"); } 
//         finally { setLoading(false); }
//     };

//     useEffect(() => { fetchAllData(); }, []);

//     const handleQuickVerify = async (e, id) => {
//         e.stopPropagation();
//         try {
//             await apiRequest(`/employee-portal/candidates/${id}/update//`, "PUT", { verification_status: true });
//             showNotify("Profile Submitted Successfully");
//             fetchAllData();
//         } catch (err) { showNotify("Submission failed", "error"); }
//     };

//     const openEditModal = (e, candidate) => {
//         e.stopPropagation();
//         setSelectedCandidate(candidate);
//         setEditForm({
//             main_status: candidate.main_status,
//             sub_status: candidate.sub_status,
//             remark: candidate.remark || ""
//         });
//         setShowEditModal(true);
//     };

//     const handleUpdateStatus = async () => {
//         try {
//             await apiRequest(`/employee-portal/candidates/${selectedCandidate.id}/update/`, "PUT", editForm);
//             showNotify("Status Updated!");
//             setShowEditModal(false);
//             fetchAllData();
//         } catch (err) { showNotify("Update failed", "error"); }
//     };

//     const truncate = (str, n) => (str?.length > n ? str.substr(0, n - 1) + "..." : str);

//     if (loading) return <BaseLayout><div style={styles.loading}>Loading Dashboard...</div></BaseLayout>;

//     return (
//         <BaseLayout>
//             {/* Notification Toast */}
//             {toast.show && (
//                 <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#FF4D4D' : '#27AE60'}}>
//                     {toast.msg}
//                 </div>
//             )}

//             <div style={styles.header}>
//                 <div>
//                     <h2 style={styles.welcome}>Welcome, {stats.user_name}</h2>
//                     <p style={styles.subText}>Insights and recruitment funnel overview.</p>
//                 </div>
//                 <button style={styles.actionBtn} onClick={() => navigate("/employee/candidates/add")}>
//                     <Icons.UserPlus /> Add Profile
//                 </button>
//             </div>

//             {/* Stats Grid */}
//             <div style={styles.statsGrid}>
//                 {[
//                     { label: "Total Profiles", val: stats.total_profiles, icon: <Icons.Users />, col: "#25343F" },
//                     { label: "Total Vendors", val: stats.total_vendors, icon: <Icons.Users />, col: "#25343F" },
//                     { label: "Total Clients", val: stats.total_clients, icon: <Icons.Buildings />, col: "#25343F" },
//                     { label: "Today's Profiles", val: stats.today_profiles, icon: <Icons.UserPlus />, col: "#25343F" },
//                     { label: "Today Submitted", val: stats.today_submitted_profiles, icon: <Icons.Send />, col: "#FF9B51" }
//                 ].map((s, i) => (
//                     <div key={i} style={styles.statCard}>
//                         <div><p style={styles.statLabel}>{s.label}</p><h3 style={{...styles.statValue, color: s.col}}>{s.val || 0}</h3></div>
//                         <div style={{...styles.iconCircle, color: s.col, backgroundColor: s.col === '#FF9B51' ? 'rgba(255,155,81,0.1)' : 'rgba(37,52,63,0.05)'}}>{s.icon}</div>
//                     </div>
//                 ))}
//             </div>

//             {/* Table 1: Active Pipelines */}
//             <Section title="Active Pipeline Candidates">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th><th style={styles.th}>Client</th><th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th></tr>
//                     </thead>
//                     <tbody>
//                         {pipelineCandidates.map((c, i) => (
//                             <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                 <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                 <td style={styles.td} title={c.technology}>{truncate(c.technology, 15)}</td>
//                                 <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                 <td style={styles.td}>{c.client || "N/A"}</td>
//                                 <td style={styles.td}>
//                                     <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
//                                         <span style={styles.badge}>{c.main_status}</span>
//                                         {c.remark && <div style={styles.remarkBox} title={c.remark}><Icons.Note /></div>}
//                                     </div>
//                                     <small style={styles.subStatus}>{c.sub_status}</small>
//                                 </td>
//                                 <td style={styles.td}><button style={styles.editBtn} onClick={(e) => openEditModal(e, c)}><Icons.Edit /></button></td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>

//             {/* Table 2: Submitted Profiles */}
//             <Section title="Submitted Profiles Table">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th><th style={styles.th}>Vendor & No.</th><th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th></tr>
//                     </thead>
//                     <tbody>
//                         {verifiedCandidates.map((c, i) => (
//                             <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                 <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                 <td style={styles.td}>{truncate(c.technology, 12)}</td>
//                                 <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                 <td style={styles.td}><b>{c.vendor_company_name}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
//                                 <td style={styles.td}>
//                                     <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
//                                         <span style={{...styles.badge, background: '#E3F2FD', color: '#1976D2'}}>{c.main_status}</span>
//                                         {c.remark && <div style={styles.remarkBox} title={c.remark}><Icons.Note /></div>}
//                                     </div>
//                                     <small style={styles.subStatus}>{c.sub_status}</small>
//                                 </td>
//                                 <td style={styles.td}><button style={styles.editBtn} onClick={(e) => openEditModal(e, c)}><Icons.Edit /></button></td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>

//             {/* Table 3: Today's New Profiles */}
//             <Section title="Today's New Profiles">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th><th style={styles.th}>Vendor & No.</th><th style={styles.th}>Action</th></tr>
//                     </thead>
//                     <tbody>
//                         {todayCandidates.map((c, i) => (
//                             <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                 <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                 <td style={styles.td}>{truncate(c.technology, 15)}</td>
//                                 <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                 <td style={styles.td}><b>{c.vendor_company_name}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
//                                 <td style={styles.td}>
//                                     {!c.verification_status ? (
//                                         <button style={styles.submitBtn} onClick={(e) => handleQuickVerify(e, c.id)}>Submit</button>
//                                     ) : (
//                                         <span style={{color:'#27AE60', fontWeight:'700', fontSize:'12px'}}>✓ Submitted</span>
//                                     )}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>

//             {/* Edit Status Modal */}
//             {showEditModal && (
//                 <div style={styles.modalOverlay}>
//                     <div style={styles.modalContent}>
//                         <h3 style={{color:'#25343F', marginBottom:'20px'}}>Update Profile Status</h3>
//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Main Status</label>
//                             <select style={styles.select} value={editForm.main_status} onChange={e => setEditForm({...editForm, main_status: e.target.value})}>
//                                 <option value="SCREENING">SCREENING</option><option value="L1">L1</option><option value="L2">L2</option><option value="CLIENT_ROUND">CLIENT ROUND</option><option value="SELECTED">SELECTED</option><option value="REJECTED">REJECTED</option>
//                             </select>
//                         </div>
//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Sub Status</label>
//                             <select style={styles.select} value={editForm.sub_status} onChange={e => setEditForm({...editForm, sub_status: e.target.value})}>
//                                 <option value="PENDING">PENDING</option><option value="DONE">DONE</option><option value="NONE">NONE</option>
//                             </select>
//                         </div>
//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Internal Remark</label>
//                             <textarea style={styles.textarea} value={editForm.remark} onChange={e => setEditForm({...editForm, remark: e.target.value})} placeholder="Add notes..." />
//                         </div>
//                         <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
//                             <button style={styles.saveBtn} onClick={handleUpdateStatus}>Save Changes</button>
//                             <button style={styles.cancelBtn} onClick={() => setShowEditModal(false)}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </BaseLayout>
//     );
// }

// // Sub-component for sections to keep code clean
// const Section = ({ title, children }) => (
//     <div style={styles.sectionContainer}>
//         <div style={styles.sectionHeader}><h3 style={styles.sectionTitle}>{title}</h3></div>
//         <div style={styles.tableWrapper}><div style={{overflowX:'auto'}}>{children}</div></div>
//     </div>
// );

// const styles = {
//     header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" },
//     welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
//     subText: { color: "#7F8C8D", fontSize: "14px" },
//     actionBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 10px rgba(255,155,81,0.2)" },
//     statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" },
//     statCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4" },
//     statLabel: { margin: 0, color: "#7F8C8D", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" },
//     statValue: { margin: "4px 0", fontSize: "24px", fontWeight: "800" },
//     iconCircle: { width: "44px", height: "44px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
//     sectionContainer: { marginBottom: "35px" },
//     sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #FF9B51", paddingLeft: "12px" },
//     tableWrapper: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
//     th: { padding: "14px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
//     tableRow: { borderBottom: "1px solid #F1F5F9", cursor: 'pointer' },
//     td: { padding: "14px 18px", fontSize: "14px", color: "#334155" },
//     badge: { background: "rgba(255, 155, 81, 0.12)", color: "#FF9B51", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//     subStatus: { display: 'block', color: '#7f8c8d', fontSize: '12px' },
//     remarkBox: { padding: '4px', borderRadius: '4px', background: '#FFF5EB', display: 'flex', cursor: 'help' },
//     editBtn: { border: 'none', background: '#F1F5F9', padding: '6px', borderRadius: '6px', cursor: 'pointer' },
//     submitBtn: { background: '#25343F', color: '#fff', border: 'none', padding: '6px 15px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '12px' },
//     loading: { padding: '50px', textAlign: 'center', color: '#25343F', fontWeight: '700' },
//     toast: { position: 'fixed', top: '20px', right: '20px', color: '#fff', padding: '12px 25px', borderRadius: '8px', zIndex: 9999, boxShadow: '0 5px 15px rgba(0,0,0,0.2)', fontWeight: '600' },
    
//     // Modal
//     modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000 },
//     modalContent: { background: '#fff', padding: '30px', borderRadius: '15px', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' },
//     inputGroup: { marginBottom: '15px' },
//     modalLabel: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '5px' },
//     select: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' },
//     textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', height: '80px', resize: 'none' },
//     saveBtn: { flex: 1, background: '#FF9B51', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },
//     cancelBtn: { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }
// };

// export default EmployeeDashboard;





// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import BaseLayout from "../components/emp_base";
// import { apiRequest } from "../../services/api";

// const Icons = {
//     UserPlus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>,
//     Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
//     Briefcase: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
//     Send: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
//     Buildings: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="10" width="20" height="12" rx="2"/><path d="M7 10V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6"/></svg>,
//     CheckCircle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'5px'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
// };

// function EmployeeDashboard() {
//     const navigate = useNavigate();
//     const [stats, setStats] = useState({});
//     const [todayCandidates, setTodayCandidates] = useState([]);
//     const [verifiedCandidates, setVerifiedCandidates] = useState([]);
//     const [pipelineCandidates, setPipelineCandidates] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const fetchDashboardData = async () => {
//         try {
//             const [sData, tData, vData, pData] = await Promise.all([
//                 apiRequest("/employee-portal/dashboard/stats/"),
//                 apiRequest("/employee-portal/dashboard/today-candidates/"),
//                 apiRequest("/employee-portal/dashboard/today-verified-candidates/"),
//                 apiRequest("/employee-portal/dashboard/active-pipeline-candidates/")
//             ]);
//             setStats(sData);
//             setTodayCandidates(tData);
//             setVerifiedCandidates(vData);
//             setPipelineCandidates(pData);
//         } catch (error) {
//             console.error("Error:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchDashboardData();
//     }, []);

//     const handleVerify = async (e, id) => {
//         e.stopPropagation(); // Table row click prevent karne ke liye
//         if (window.confirm("Do you want to submit this profile for verification?")) {
//             try {
//                 await apiRequest(`/employee-portal/candidates/${id}/update/`, "PUT", { verification_status: true });
//                 alert("✅ Profile Submitted Successfully!");
//                 fetchDashboardData(); // Refresh list
//             } catch (error) {
//                 alert("❌ Verification failed.");
//             }
//         }
//     };

//     const truncate = (text, limit) => (text && text.length > limit ? text.substring(0, limit) + "..." : text);

//     const statCards = [
//         { label: "Total Profiles", value: stats.total_profiles || 0, icon: <Icons.Users />, color: "#25343F" },
//         { label: "Total Vendors", value: stats.total_vendors || 0, icon: <Icons.Users />, color: "#25343F" },
//         { label: "Total Clients", value: stats.total_clients || 0, icon: <Icons.Buildings />, color: "#25343F" },
//         { label: "Today's Profiles", value: stats.today_profiles || 0, icon: <Icons.UserPlus />, color: "#25343F" },
//         { label: "Today Submitted", value: stats.today_submitted_profiles || 0, icon: <Icons.Send />, color: "#FF9B51" },
//     ];

//     if (loading) return <BaseLayout><p>Loading Dashboard...</p></BaseLayout>;

//     return (
//         <BaseLayout>
//             <div style={styles.header}>
//                 <div>
//                     <h2 style={styles.welcome}>Welcome, {stats.user_name || "Recruiter"}</h2>
//                     <p style={styles.subText}>Here is what's happening in your recruitment funnel today.</p>
//                 </div>
//                 <div style={styles.actionGroup}>
//                     <button style={styles.actionBtn} onClick={() => navigate("/employee/candidates/add")}>
//                         <Icons.UserPlus /> Add Profile
//                     </button>
//                 </div>
//             </div>

//             <div style={styles.statsGrid}>
//                 {statCards.map((item, index) => (
//                     <div key={index} style={styles.statCard}>
//                         <div>
//                             <p style={styles.statLabel}>{item.label}</p>
//                             <h3 style={{...styles.statValue, color: item.color}}>{item.value}</h3>
//                         </div>
//                         <div style={{...styles.iconCircle, color: item.color === '#FF9B51' ? '#FF9B51' : '#25343F', backgroundColor: item.color === '#FF9B51' ? "rgba(255,155,81,0.1)" : "rgba(37,52,63,0.05)"}}>
//                             {item.icon}
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Other Tables remain similar... (Active Pipelines & Submitted) */}

//             {/* Table 3: Today's New Profiles */}
//             <div style={styles.sectionContainer}>
//                 <div style={styles.sectionHeader}>
//                     <h3 style={styles.sectionTitle}>Today's New Profiles</h3>
//                 </div>
//                 <div style={styles.tableWrapper}>
//                     <table style={styles.table}>
//                         <thead style={styles.tableHeader}>
//                             <tr>
//                                 <th style={styles.th}>Candidate</th>
//                                 <th style={styles.th}>Tech</th>
//                                 <th style={styles.th}>Exp</th>
//                                 <th style={styles.th}>Vendor & Contact</th>
//                                 <th style={styles.th}>Action</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {todayCandidates.length > 0 ? todayCandidates.map((c, i) => (
//                                 <tr key={i} style={{...styles.tableRow, cursor: 'pointer'}} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                     <td style={styles.td}><b>{c.candidate_name}</b><br/><small style={{color:'#7f8c8d'}}>{c.candidate_email}</small></td>
//                                     <td style={styles.td} title={c.technology}>{truncate(c.technology, 15)}</td>
//                                     <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                     <td style={styles.td}>
//                                         <b>{truncate(c.vendor_company_name, 15)}</b>
//                                         <small style={{display:'block', color:'#7f8c8d'}}>{c.vendor_number || "No Contact"}</small>
//                                     </td>
//                                     <td style={styles.td}>
//                                         {!c.verification_status ? (
//                                             <button 
//                                                 style={styles.verifyBtn} 
//                                                 onClick={(e) => handleVerify(e, c.id)}
//                                             >
//                                                 <Icons.CheckCircle /> Submit
//                                             </button>
//                                         ) : (
//                                             <span style={{color:'#27AE60', fontWeight:'700', fontSize:'12px'}}>✓ Submitted</span>
//                                         )}
//                                     </td>
//                                 </tr>
//                             )) : (
//                                 <tr><td colSpan="5" style={{padding:'20px', textAlign:'center', color:'#7f8c8d'}}>No new profiles today.</td></tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </BaseLayout>
//     );
// }

// const styles = {
//     header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" },
//     welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
//     subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
//     actionGroup: { display: "flex", gap: "10px" },
//     actionBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", boxShadow: "0 4px 10px rgba(255,155,81,0.2)" },
//     statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" },
//     statCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4" },
//     statLabel: { margin: 0, color: "#7F8C8D", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" },
//     statValue: { margin: "4px 0", fontSize: "24px", fontWeight: "800" },
//     iconCircle: { width: "44px", height: "44px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
//     sectionContainer: { marginBottom: "35px" },
//     sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
//     sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #FF9B51", paddingLeft: "12px" },
//     tableWrapper: { background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
//     th: { padding: "14px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
//     tableRow: { borderBottom: "1px solid #F1F5F9", transition:'0.2s' },
//     td: { padding: "14px 18px", fontSize: "14px", color: "#334155" },
//     badge: { background: "rgba(255, 155, 81, 0.12)", color: "#FF9B51", padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//     verifyBtn: { 
//         background: "#25343F", 
//         color: "#fff", 
//         border: "none", 
//         padding: "6px 14px", 
//         borderRadius: "6px", 
//         fontSize: "12px", 
//         fontWeight: "700", 
//         cursor: "pointer",
//         display: "flex",
//         alignItems: "center",
//         boxShadow: "0 2px 6px rgba(37, 52, 63, 0.2)"
//     }
// };

// export default EmployeeDashboard;





// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import BaseLayout from "../components/emp_base";
// import { apiRequest } from "../../services/api";

// const Icons = {
//     UserPlus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>,
//     Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
//     Briefcase: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
//     Send: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
//     Buildings: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="10" width="20" height="12" rx="2"/><path d="M7 10V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6"/></svg>,
//     Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
//     Message: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
// };

// function EmployeeDashboard() {
//     const navigate = useNavigate();
//     const [stats, setStats] = useState({});
//     const [todayCandidates, setTodayCandidates] = useState([]);
//     const [verifiedCandidates, setVerifiedCandidates] = useState([]);
//     const [pipelineCandidates, setPipelineCandidates] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // Modal States
//     const [showModal, setShowModal] = useState(false);
//     const [selectedCandidate, setSelectedCandidate] = useState(null);
//     const [updateForm, setUpdateForm] = useState({ main_status: "", sub_status: "", remark: "" });

//     const fetchDashboardData = async () => {
//         try {
//             const [sData, tData, vData, pData] = await Promise.all([
//                 apiRequest("/employee-portal/dashboard/stats/"),
//                 apiRequest("/employee-portal/dashboard/today-candidates/"),
//                 apiRequest("/employee-portal/dashboard/today-verified-candidates/"),
//                 apiRequest("/employee-portal/dashboard/active-pipeline-candidates/")
//             ]);
//             setStats(sData);
//             setTodayCandidates(tData);
//             setVerifiedCandidates(vData);
//             setPipelineCandidates(pData);
//         } catch (error) { console.error(error); } 
//         finally { setLoading(false); }
//     };

//     useEffect(() => { fetchDashboardData(); }, []);

//     const handleEditClick = (e, cand) => {
//         e.stopPropagation();
//         setSelectedCandidate(cand);
//         setUpdateForm({
//             main_status: cand.main_status,
//             sub_status: cand.sub_status,
//             remark: cand.remark || ""
//         });
//         setShowModal(true);
//     };

//     const handleUpdateSubmit = async () => {
//         try {
//             await apiRequest(`/employee-portal/candidates/${selectedCandidate.id}/update/`, "PUT", updateForm);
//             alert("✅ Successfully Updated!");
//             setShowModal(false);
//             fetchDashboardData();
//         } catch (error) { alert("❌ Update failed."); }
//     };

//     const truncate = (text, limit) => {
//         if (!text) return "N/A";
//         return text.length > limit ? text.substring(0, limit) + "..." : text;
//     };

//     const statCards = [
//         { label: "Total Profiles", value: stats.total_profiles || 0, icon: <Icons.Users />, color: "#25343F" },
//         { label: "Total Vendors", value: stats.total_vendors || 0, icon: <Icons.Users />, color: "#25343F" },
//         { label: "Total Clients", value: stats.total_clients || 0, icon: <Icons.Buildings />, color: "#25343F" },
//         { label: "Today's Profiles", value: stats.today_profiles || 0, icon: <Icons.UserPlus />, color: "#25343F" },
//         { label: "Today Submitted", value: stats.today_submitted_profiles || 0, icon: <Icons.Send />, color: "#FF9B51" },
//     ];

//     if (loading) return <BaseLayout><p>Loading Dashboard...</p></BaseLayout>;

//     return (
//         <BaseLayout>
//             <div style={styles.header}>
//                 <div>
//                     <h2 style={styles.welcome}>Welcome, {stats.user_name || "Recruiter"}</h2>
//                     <p style={styles.subText}>Monitor your daily recruitment funnel activities.</p>
//                 </div>
//                 <div style={styles.actionGroup}>
//                     <button style={styles.actionBtn} onClick={() => navigate("/employee/candidates/add")}>
//                         <Icons.UserPlus /> Add Profile
//                     </button>
//                 </div>
//             </div>

//             <div style={styles.statsGrid}>
//                 {statCards.map((item, index) => (
//                     <div key={index} style={styles.statCard}>
//                         <div><p style={styles.statLabel}>{item.label}</p><h3 style={{...styles.statValue, color: item.color}}>{item.value}</h3></div>
//                         <div style={{...styles.iconCircle, color: item.color === '#FF9B51' ? '#FF9B51' : '#25343F', backgroundColor: item.color === '#FF9B51' ? "rgba(255,155,81,0.1)" : "rgba(37,52,63,0.05)"}}>{item.icon}</div>
//                     </div>
//                 ))}
//             </div>

//             {/* Table 1: Active Pipelines */}
//             <div style={styles.sectionContainer}>
//                 <div style={styles.sectionHeader}><h3 style={styles.sectionTitle}>Active Pipeline Candidates</h3></div>
//                 <div style={styles.tableWrapper}>
//                     <table style={styles.table}>
//                         <thead style={styles.tableHeader}>
//                             <tr><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th><th style={styles.th}>Client</th><th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th></tr>
//                         </thead>
//                         <tbody>
//                             {pipelineCandidates.map((c, i) => (
//                                 <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                     <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                     <td style={styles.td} title={c.technology}>{truncate(c.technology, 15)}</td>
//                                     <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                     <td style={styles.td}>{c.client || "N/A"}</td>
//                                     <td style={styles.td}>
//                                         <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
//                                             <span style={styles.badge}>{c.main_status}</span>
//                                             {c.remark && <div style={styles.remarkIcon} title={`Remark: ${c.remark}`}><Icons.Message /></div>}
//                                         </div>
//                                         <small style={{display:'block', color:'#7f8c8d'}}>{c.sub_status}</small>
//                                     </td>
//                                     <td style={styles.td}><button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button></td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Table 2: Submitted Profiles (Verified) */}
//             <div style={styles.sectionContainer}>
//                 <div style={styles.sectionHeader}><h3 style={styles.sectionTitle}>Submitted Profiles Table</h3></div>
//                 <div style={styles.tableWrapper}>
//                     <table style={styles.table}>
//                         <thead style={styles.tableHeader}>
//                             <tr><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th><th style={styles.th}>Vendor & Contact</th><th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th></tr>
//                         </thead>
//                         <tbody>
//                             {verifiedCandidates.map((c, i) => (
//                                 <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                     <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                     <td style={styles.td} title={c.technology}>{truncate(c.technology, 15)}</td>
//                                     <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                     <td style={styles.td}><b>{truncate(c.vendor_company_name, 12)}</b><small style={{display:'block', color:'#7f8c8d'}}>{c.vendor_number || "No Contact"}</small></td>
//                                     <td style={styles.td}>
//                                         <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
//                                             <span style={{...styles.badge, background: '#E3F2FD', color: '#1976D2'}}>{c.main_status}</span>
//                                             {c.remark && <div style={styles.remarkIcon} title={`Remark: ${c.remark}`}><Icons.Message /></div>}
//                                         </div>
//                                         <small style={{display:'block', color:'#7f8c8d'}}>{c.sub_status}</small>
//                                     </td>
//                                     <td style={styles.td}><button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button></td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* UPDATE MODAL */}
//             {showModal && (
//                 <div style={styles.modalOverlay}>
//                     <div style={styles.modalContent}>
//                         <div style={styles.modalHeader}><h3 style={{margin:0, color:'#25343F'}}>Update Candidate Status</h3><button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button></div>
//                         <div style={styles.modalBody}>
//                             <div style={styles.inputGroup}><label style={styles.modalLabel}>Main Status</label>
//                                 <select style={styles.select} value={updateForm.main_status} onChange={(e) => setUpdateForm({...updateForm, main_status: e.target.value})}>
//                                     <option value="SCREENING">SCREENING</option><option value="L1">L1</option><option value="L2">L2</option><option value="CLIENT_ROUND">CLIENT ROUND</option><option value="SELECTED">SELECTED</option><option value="REJECTED">REJECTED</option>
//                                 </select>
//                             </div>
//                             <div style={styles.inputGroup}><label style={styles.modalLabel}>Sub Status</label>
//                                 <select style={styles.select} value={updateForm.sub_status} onChange={(e) => setUpdateForm({...updateForm, sub_status: e.target.value})}>
//                                     <option value="PENDING">PENDING</option><option value="DONE">DONE</option><option value="SELECTED">SELECTED</option><option value="REJECTED">REJECTED</option><option value="NONE">NONE</option>
//                                 </select>
//                             </div>
//                             <div style={styles.inputGroup}><label style={styles.modalLabel}>Remark</label><textarea style={styles.textarea} value={updateForm.remark} onChange={(e) => setUpdateForm({...updateForm, remark: e.target.value})} placeholder="Internal notes..."/></div>
//                         </div>
//                         <div style={styles.modalFooter}><button style={styles.saveBtn} onClick={handleUpdateSubmit}>Save Changes</button></div>
//                     </div>
//                 </div>
//             )}
//         </BaseLayout>
//     );
// }

// const styles = {
//     header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" },
//     welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
//     subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
//     actionGroup: { display: "flex", gap: "10px" },
//     actionBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", boxShadow: "0 4px 10px rgba(255, 155, 81, 0.2)" },
//     statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" },
//     statCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4" },
//     statLabel: { margin: 0, color: "#7F8C8D", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" },
//     statValue: { margin: "4px 0", fontSize: "24px", fontWeight: "800" },
//     iconCircle: { width: "44px", height: "44px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
//     sectionContainer: { marginBottom: "35px" },
//     sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
//     sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #FF9B51", paddingLeft: "12px" },
//     tableWrapper: { background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
//     th: { padding: "14px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
//     tableRow: { borderBottom: "1px solid #F1F5F9", cursor: 'pointer', transition: '0.2s' },
//     td: { padding: "14px 18px", fontSize: "14px", color: "#334155" },
//     badge: { background: "rgba(255, 155, 81, 0.12)", color: "#FF9B51", padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//     remarkIcon: { color: "#FF9B51", cursor: "help", display: "flex", padding: "4px", borderRadius: "4px", background: "rgba(255, 155, 81, 0.05)" },
//     editBtn: { background: "rgba(37, 52, 63, 0.05)", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer", color: "#25343F", display: "flex", alignItems: "center" },
//     modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' },
//     modalContent: { background: '#fff', padding: '24px', borderRadius: '16px', width: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
//     modalHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px' },
//     closeBtn: { background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#94A3B8' },
//     modalLabel: { fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '6px', display: 'block', textTransform: 'uppercase' },
//     inputGroup: { marginBottom: '16px' },
//     select: { width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', outline: 'none', background: '#F8FAFB' },
//     textarea: { width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', minHeight: '100px', outline: 'none', resize: 'none', background: '#F8FAFB' },
//     modalFooter: { marginTop: '20px' },
//     saveBtn: { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: '#FF9B51', color: '#fff', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 12px rgba(255, 155, 81, 0.3)' }
// };

// export default EmployeeDashboard;






// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import BaseLayout from "../components/emp_base";
// import { apiRequest } from "../../services/api";

// const Icons = {
//     UserPlus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>,
//     Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
//     Briefcase: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
//     Send: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
//     Buildings: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="10" width="20" height="12" rx="2"/><path d="M7 10V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6"/></svg>,
//     Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
//     Message: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
// };

// function EmployeeDashboard() {
//     const navigate = useNavigate();
//     const [stats, setStats] = useState({});
//     const [todayCandidates, setTodayCandidates] = useState([]);
//     const [verifiedCandidates, setVerifiedCandidates] = useState([]);
//     const [pipelineCandidates, setPipelineCandidates] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // Modal States
//     const [showModal, setShowModal] = useState(false);
//     const [selectedCandidate, setSelectedCandidate] = useState(null);
//     const [updateForm, setUpdateForm] = useState({ main_status: "", sub_status: "", remark: "" });

//     const fetchDashboardData = async () => {
//         try {
//             const [sData, tData, vData, pData] = await Promise.all([
//                 apiRequest("/employee-portal/dashboard/stats/"),
//                 apiRequest("/employee-portal/dashboard/today-candidates/"),
//                 apiRequest("/employee-portal/dashboard/today-verified-candidates/"),
//                 apiRequest("/employee-portal/dashboard/active-pipeline-candidates/")
//             ]);
//             setStats(sData);
//             setTodayCandidates(tData);
//             setVerifiedCandidates(vData);
//             setPipelineCandidates(pData);
//         } catch (error) {
//             console.error(error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchDashboardData();
//     }, []);

//     const handleEditClick = (e, cand) => {
//         e.stopPropagation();
//         setSelectedCandidate(cand);
//         setUpdateForm({
//             main_status: cand.main_status,
//             sub_status: cand.sub_status,
//             remark: cand.remark || ""
//         });
//         setShowModal(true);
//     };

//     const handleUpdateSubmit = async () => {
//         try {
//             await apiRequest(`/employee-portal/candidates/${selectedCandidate.id}/update/`, "PUT", updateForm);
//             alert("✅ Successfully Updated!");
//             setShowModal(false);
//             fetchDashboardData();
//         } catch (error) {
//             alert("❌ Update failed.");
//         }
//     };

//     // Helper to truncate text
//     const truncate = (text, limit) => {
//         if (!text) return "N/A";
//         return text.length > limit ? text.substring(0, limit) + "..." : text;
//     };

//     const statCards = [
//         { label: "Total Profiles", value: stats.total_profiles || 0, icon: <Icons.Users />, color: "#25343F" },
//         { label: "Total Vendors", value: stats.total_vendors || 0, icon: <Icons.Users />, color: "#25343F" },
//         { label: "Total Clients", value: stats.total_clients || 0, icon: <Icons.Buildings />, color: "#25343F" },
//         { label: "Today's Profiles", value: stats.today_profiles || 0, icon: <Icons.UserPlus />, color: "#25343F" },
//         { label: "Today Submitted", value: stats.today_submitted_profiles || 0, icon: <Icons.Send />, color: "#FF9B51" },
//     ];

//     if (loading) return <BaseLayout><p>Loading Dashboard...</p></BaseLayout>;

//     return (
//         <BaseLayout>
//             <div style={styles.header}>
//                 <div>
//                     <h2 style={styles.welcome}>Welcome, {stats.user_name || "Recruiter"}</h2>
//                     <p style={styles.subText}>Here is what's happening in your recruitment funnel today.</p>
//                 </div>
//                 <div style={styles.actionGroup}>
//                     <button style={styles.actionBtn} onClick={() => navigate("/employee/candidates/add")}>
//                         <Icons.UserPlus /> Add Profile
//                     </button>
//                 </div>
//             </div>

//             <div style={styles.statsGrid}>
//                 {statCards.map((item, index) => (
//                     <div key={index} style={styles.statCard}>
//                         <div>
//                             <p style={styles.statLabel}>{item.label}</p>
//                             <h3 style={{...styles.statValue, color: item.color}}>{item.value}</h3>
//                         </div>
//                         <div style={{...styles.iconCircle, color: item.color === '#FF9B51' ? '#FF9B51' : '#25343F', backgroundColor: item.color === '#FF9B51' ? "rgba(255,155,81,0.1)" : "rgba(37,52,63,0.05)"}}>
//                             {item.icon}
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Table 1: Active Pipelines */}
//             <div style={styles.sectionContainer}>
//                 <div style={styles.sectionHeader}>
//                     <h3 style={styles.sectionTitle}>Active Pipeline Candidates</h3>
//                 </div>
//                 <div style={styles.tableWrapper}>
//                     <table style={styles.table}>
//                         <thead style={styles.tableHeader}>
//                             <tr>
//                                 <th style={styles.th}>Candidate</th>
//                                 <th style={styles.th}>Tech</th>
//                                 <th style={styles.th}>Exp</th>
//                                 <th style={styles.th}>Vendor</th>
//                                 <th style={styles.th}>Status & Remark</th>
//                                 <th style={styles.th}>Action</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {pipelineCandidates.map((c, i) => (
//                                 <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                     <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                     <td style={styles.td} title={c.technology}>{truncate(c.technology, 70)}</td>
//                                     <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                     <td style={styles.td}>{c.vendor_company_name || "N/A"}</td>
//                                     <td style={styles.td}>
//                                         <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
//                                             <span style={styles.badge}>{c.main_status}</span>
//                                             {c.remark && (
//                                                 <div style={styles.remarkIcon} title={`Remark: ${c.remark}`}>
//                                                     <Icons.Message />
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <small style={{display:'block', color:'#7f8c8d'}}>{c.sub_status}</small>
//                                     </td>
//                                     <td style={styles.td}>
//                                         <button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}>
//                                             <Icons.Edit />
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Same logic for Table 2 and Table 3... (Verified and Today's Profiles) */}

//             {/* UPDATE MODAL */}
//             {showModal && (
//                 <div style={styles.modalOverlay}>
//                     <div style={styles.modalContent}>
//                         <div style={styles.modalHeader}>
//                             <h3 style={{margin:0, color:'#25343F'}}>Update Status</h3>
//                             <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
//                         </div>
                        
//                         <div style={styles.modalBody}>
//                             <div style={styles.inputGroup}>
//                                 <label style={styles.modalLabel}>Main Status</label>
//                                 <select 
//                                     style={styles.select}
//                                     value={updateForm.main_status}
//                                     onChange={(e) => setUpdateForm({...updateForm, main_status: e.target.value})}
//                                 >
//                                     <option value="SCREENING">SCREENING</option>
//                                     <option value="L1">L1</option>
//                                     <option value="L2">L2</option>
//                                     <option value="CLIENT_ROUND">CLIENT ROUND</option>
//                                     <option value="SELECTED">SELECTED</option>
//                                     <option value="REJECTED">REJECTED</option>
//                                 </select>
//                             </div>

//                             <div style={styles.inputGroup}>
//                                 <label style={styles.modalLabel}>Sub Status</label>
//                                 <select 
//                                     style={styles.select}
//                                     value={updateForm.sub_status}
//                                     onChange={(e) => setUpdateForm({...updateForm, sub_status: e.target.value})}
//                                 >
//                                     <option value="PENDING">PENDING</option>
//                                     <option value="DONE">DONE</option>
//                                     <option value="SELECTED">SELECTED</option>
//                                     <option value="REJECTED">REJECTED</option>
//                                     <option value="NONE">NONE</option>
//                                 </select>
//                             </div>

//                             <div style={styles.inputGroup}>
//                                 <label style={styles.modalLabel}>Remark</label>
//                                 <textarea 
//                                     style={styles.textarea}
//                                     value={updateForm.remark}
//                                     onChange={(e) => setUpdateForm({...updateForm, remark: e.target.value})}
//                                     placeholder="Write internal notes here..."
//                                 />
//                             </div>
//                         </div>

//                         <div style={styles.modalFooter}>
//                             <button style={styles.saveBtn} onClick={handleUpdateSubmit}>Save Changes</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </BaseLayout>
//     );
// }

// const styles = {
//     header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" },
//     welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
//     subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
//     actionGroup: { display: "flex", gap: "10px" },
//     actionBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", boxShadow: "0 4px 10px rgba(255,155,81,0.2)" },
//     statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" },
//     statCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4" },
//     statLabel: { margin: 0, color: "#7F8C8D", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" },
//     statValue: { margin: "4px 0", fontSize: "24px", fontWeight: "800" },
//     iconCircle: { width: "44px", height: "44px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
//     sectionContainer: { marginBottom: "35px" },
//     sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
//     sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #FF9B51", paddingLeft: "12px" },
//     tableWrapper: { background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
//     th: { padding: "14px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
//     tableRow: { borderBottom: "1px solid #F1F5F9", cursor: 'pointer', transition: '0.2s' },
//     td: { padding: "14px 18px", fontSize: "14px", color: "#334155" },
//     badge: { background: "rgba(255, 155, 81, 0.12)", color: "#FF9B51", padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//     remarkIcon: { color: "#FF9B51", cursor: "help", display: "flex", padding: "4px", borderRadius: "4px", background: "rgba(255, 155, 81, 0.05)" },
//     editBtn: { background: "rgba(37, 52, 63, 0.05)", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer", color: "#25343F", display: "flex", alignItems: "center" },

//     // Modal Styles
//     modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' },
//     modalContent: { background: '#fff', padding: '24px', borderRadius: '16px', width: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
//     modalHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '20px' },
//     closeBtn: { background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#94A3B8' },
//     modalLabel: { fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '6px', display: 'block', textTransform: 'uppercase' },
//     inputGroup: { marginBottom: '16px' },
//     select: { width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', outline: 'none', background: '#F8FAFB' },
//     textarea: { width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', minHeight: '100px', outline: 'none', resize: 'none', background: '#F8FAFB' },
//     modalFooter: { marginTop: '20px' },
//     saveBtn: { width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: '#FF9B51', color: '#fff', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 12px rgba(255, 155, 81, 0.3)' }
// };

// export default EmployeeDashboard;






// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import BaseLayout from "../components/emp_base";
// import { apiRequest } from "../../services/api"; 

// const Icons = {
//     UserPlus: () => < svg width = "18"
//     height = "18"
//     viewBox = "0 0 24 24"
//     fill = "none"
//     stroke = "currentColor"
//     strokeWidth = "2.5"
//     strokeLinecap = "round"
//     strokeLinejoin = "round" > < path d = "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" / > < circle cx = "8.5"
//     cy = "7"
//     r = "4" / > < line x1 = "20"
//     y1 = "8"
//     x2 = "20"
//     y2 = "14" / > < line x1 = "17"
//     y1 = "11"
//     x2 = "23"
//     y2 = "11" / > < /svg>,
//     Users: () => < svg width = "22"
//     height = "22"
//     viewBox = "0 0 24 24"
//     fill = "none"
//     stroke = "currentColor"
//     strokeWidth = "2"
//     strokeLinecap = "round"
//     strokeLinejoin = "round" > < path d = "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" / > < circle cx = "9"
//     cy = "7"
//     r = "4" / > < path d = "M23 21v-2a4 4 0 0 0-3-3.87" / > < path d = "M16 3.13a4 4 0 0 1 0 7.75" / > < /svg>,
//     Briefcase: () => < svg width = "22"
//     height = "22"
//     viewBox = "0 0 24 24"
//     fill = "none"
//     stroke = "currentColor"
//     strokeWidth = "2"
//     strokeLinecap = "round"
//     strokeLinejoin = "round" > < rect x = "2"
//     y = "7"
//     width = "20"
//     height = "14"
//     rx = "2"
//     ry = "2" / > < path d = "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" / > < /svg>,
//     Send: () => < svg width = "22"
//     height = "22"
//     viewBox = "0 0 24 24"
//     fill = "none"
//     stroke = "currentColor"
//     strokeWidth = "2"
//     strokeLinecap = "round"
//     strokeLinejoin = "round" > < line x1 = "22"
//     y1 = "2"
//     x2 = "11"
//     y2 = "13" / > < polygon points = "22 2 15 22 11 13 2 9 22 2" / > < /svg>,
//     Buildings: () => < svg width = "22"
//     height = "22"
//     viewBox = "0 0 24 24"
//     fill = "none"
//     stroke = "currentColor"
//     strokeWidth = "2"
//     strokeLinecap = "round"
//     strokeLinejoin = "round" > < rect x = "2"
//     y = "10"
//     width = "20"
//     height = "12"
//     rx = "2" / > < path d = "M7 10V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6" / > < /svg>
// };

// function EmployeeDashboard() {
//     const navigate = useNavigate();
//     const [stats, setStats] = useState({});
//     const [todayCandidates, setTodayCandidates] = useState([]);
//     const [verifiedCandidates, setVerifiedCandidates] = useState([]);
//     const [pipelineCandidates, setPipelineCandidates] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchDashboardData = async() => {
//             try {
//                 const [sData, tData, vData, pData] = await Promise.all([
//                     apiRequest("/employee-portal/dashboard/stats/"),
//                     apiRequest("/employee-portal/dashboard/today-candidates/"),
//                     apiRequest("/employee-portal/dashboard/today-verified-candidates/"),
//                     apiRequest("/employee-portal/dashboard/active-pipeline-candidates/")
//                 ]);
//                 setStats(sData);
//                 setTodayCandidates(tData);
//                 setVerifiedCandidates(vData);
//                 setPipelineCandidates(pData);
//             } catch (error) {
//                 console.error("Error fetching dashboard data:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchDashboardData();
//     }, []);

//     const statCards = [
//         { label: "Total Profiles", value: stats.total_profiles || 0, icon: < Icons.Users / > , color: "#25343F" },
//         { label: "Total Vendors", value: stats.total_vendors || 0, icon: < Icons.Users / > , color: "#25343F" },
//         { label: "Total Clients", value: stats.total_clients || 0, icon: < Icons.Buildings / > , color: "#25343F" },
//         { label: "Today's Profiles", value: stats.today_profiles || 0, icon: < Icons.UserPlus / > , color: "#25343F" },
//         { label: "Today Submitted", value: stats.today_submitted_profiles || 0, icon: < Icons.Send / > , color: "#FF9B51" },
//     ];

//     if (loading) return <BaseLayout > < p > Loading Dashboard... < /p></BaseLayout > ;

//     return ( <
//         BaseLayout >
//         <
//         div style = { styles.header } >
//         <
//         div >
//         <
//         h2 style = { styles.welcome } > Welcome, { stats.user_name || "Recruiter" } < /h2> <
//         p style = { styles.subText } > Here is what 's happening in your recruitment funnel today.</p> < /
//         div > <
//         div style = { styles.actionGroup } >
//         <
//         button style = { styles.actionBtn }
//         onClick = {
//             () => navigate("/employee/candidates/add")
//         } >
//         <
//         Icons.UserPlus / > Add Profile <
//         /button> < /
//         div > <
//         /div>

//         { /* 5 Stats Cards */ } <
//         div style = { styles.statsGrid } > {
//             statCards.map((item, index) => ( <
//                 div key = { index }
//                 style = { styles.statCard } >
//                 <
//                 div >
//                 <
//                 p style = { styles.statLabel } > { item.label } < /p> <
//                 h3 style = {
//                     {...styles.statValue, color: item.color }
//                 } > { item.value } < /h3> < /
//                 div > <
//                 div style = {
//                     {...styles.iconCircle, color: item.color === '#FF9B51' ? '#FF9B51' : '#25343F', backgroundColor: item.color === '#FF9B51' ? "rgba(255,155,81,0.1)" : "rgba(37,52,63,0.05)" }
//                 } > { item.icon } <
//                 /div> < /
//                 div >
//             ))
//         } <
//         /div>

//         { /* Table 1: Active Pipelines */ } <
//         div style = { styles.sectionContainer } >
//         <
//         div style = { styles.sectionHeader } >
//         <
//         h3 style = { styles.sectionTitle } > Active Pipeline Candidates < /h3> < /
//         div > <
//         div style = { styles.tableWrapper } >
//         <
//         table style = { styles.table } >
//         <
//         thead style = { styles.tableHeader } >
//         <
//         tr >
//         <
//         th style = { styles.th } > Candidate < /th> <
//         th style = { styles.th } > Technology < /th> <
//         th style = { styles.th } > Vendor < /th> <
//         th style = { styles.th } > Client < /th> <
//         th style = { styles.th } > Status(Main / Sub) < /th> < /
//         tr > <
//         /thead> <
//         tbody > {
//             pipelineCandidates.map((c, i) => ( <
//                 tr key = { i }
//                 style = {
//                     {...styles.tableRow, cursor: 'pointer' }
//                 }
//                 onClick = {
//                     () => navigate(`/employee/candidate/view/${c.id}`)
//                 } >

//                 <
//                 td style = { styles.td } > < b > { c.candidate_name } < /b></td >
//                 <
//                 td style = { styles.td } > { c.technology } < /td> <
//                 td style = { styles.td } > { c.vendor_company_name } < /td> <
//                 td style = { styles.td } > { c.client || "N/A" } < /td> <
//                 td style = { styles.td } >
//                 <
//                 span style = { styles.badge } > { c.main_status } < /span> <
//                 small style = {
//                     { display: 'block', color: '#7f8c8d' }
//                 } > { c.sub_status } < /small> < /
//                 td > <
//                 /tr>
//             ))
//         } <
//         /tbody> < /
//         table > <
//         /div> < /
//         div >

//         { /* Table 2: Submitted Profiles (Verified) */ } <
//         div style = { styles.sectionContainer } >
//         <
//         div style = { styles.sectionHeader } >
//         <
//         h3 style = { styles.sectionTitle } > Submitted Profiles Table < /h3> < /
//         div > <
//         div style = { styles.tableWrapper } >
//         <
//         table style = { styles.table } >
//         <
//         thead style = { styles.tableHeader } >
//         <
//         tr >
//         <
//         th style = { styles.th } > Candidate < /th> <
//         th style = { styles.th } > Technology < /th> <
//         th style = { styles.th } > Vendor < /th> <
//         th style = { styles.th } > Vendor Rate < /th> <
//         th style = { styles.th } > Status < /th> < /
//         tr > <
//         /thead> <
//         tbody > {
//             verifiedCandidates.map((c, i) => ( <
//                 tr key = { i }
//                 style = {
//                     {...styles.tableRow, cursor: 'pointer' }
//                 }
//                 onClick = {
//                     () => navigate(`/employee/candidate/view/${c.id}`)
//                 } >
//                 <
//                 td style = { styles.td } > < b > { c.candidate_name } < /b></td >
//                 <
//                 td style = { styles.td } > { c.technology } < /td> <
//                 td style = { styles.td } > { c.vendor_company_name } < /td> <
//                 td style = { styles.td } > ₹{ c.vendor_rate } < /td> <
//                 td style = { styles.td } > < span style = {
//                     {...styles.badge, background: '#E3F2FD', color: '#1976D2' }
//                 } > { c.main_status } < /span></td >
//                 <
//                 /tr>
//             ))
//         } <
//         /tbody> < /
//         table > <
//         /div> < /
//         div >

//         { /* Table 3: Today's Candidates */ } <
//         div style = { styles.sectionContainer } >
//         <
//         div style = { styles.sectionHeader } >
//         <
//         h3 style = { styles.sectionTitle } > Today 's New Profiles</h3> < /
//         div > <
//         div style = { styles.tableWrapper } >
//         <
//         table style = { styles.table } >
//         <
//         thead style = { styles.tableHeader } >
//         <
//         tr >
//         <
//         th style = { styles.th } > Candidate < /th> <
//         th style = { styles.th } > Technology < /th> <
//         th style = { styles.th } > Vendor < /th> <
//         th style = { styles.th } > Vendor Rate < /th> <
//         th style = { styles.th } > Status < /th> < /
//         tr > <
//         /thead> <
//         tbody > {
//             todayCandidates.map((c, i) => ( <
//                 tr key = { i }
//                 style = {
//                     {...styles.tableRow, cursor: 'pointer' }
//                 }
//                 onClick = {
//                     () => navigate(`/employee/candidate/view/${c.id}`)
//                 } >
//                 <
//                 td style = { styles.td } > < b > { c.candidate_name } < /b></td >
//                 <
//                 td style = { styles.td } > { c.technology } < /td> <
//                 td style = { styles.td } > { c.vendor_company_name } < /td> <
//                 td style = { styles.td } > ₹{ c.vendor_rate } < /td> <
//                 td style = { styles.td } > < span style = { styles.badge } > { c.main_status } < /span></td >
//                 <
//                 /tr>
//             ))
//         } <
//         /tbody> < /
//         table > <
//         /div> < /
//         div > <
//         /BaseLayout>
//     );
// }

// const styles = {
//     header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" },
//     welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
//     subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
//     actionGroup: { display: "flex", gap: "10px" },
//     actionBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", boxShadow: "0 4px 10px rgba(255,155,81,0.2)" },
//     statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" },
//     statCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4" },
//     statLabel: { margin: 0, color: "#7F8C8D", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" },
//     statValue: { margin: "4px 0", fontSize: "24px", fontWeight: "800" },
//     iconCircle: { width: "44px", height: "44px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
//     sectionContainer: { marginBottom: "35px" },
//     sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
//     sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #FF9B51", paddingLeft: "12px" },
//     tableWrapper: { background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
//     th: { padding: "14px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
//     tableRow: { borderBottom: "1px solid #F1F5F9" },
//     td: { padding: "14px 18px", fontSize: "14px", color: "#334155" },
//     badge: { background: "rgba(255, 155, 81, 0.12)", color: "#FF9B51", padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }
// };

// export default EmployeeDashboard;