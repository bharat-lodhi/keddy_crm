import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../components/emp_base";
import { apiRequest } from "../../services/api";
import StatusUpdateModal from "../../components/StatusUpdateModal";
import SubmissionModal from "../../components/SubmissionModal";
import { getStatusStyles } from "../../utils/statusHelper";

const Icons = {
    UserPlus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>,
    Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Client: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
    Vendor: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><circle cx="18" cy="8" r="3"/><path d="M18 11v5"/></svg>,
    Pipeline: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    Send: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    Remark: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9B51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
    Requirement: () => (
        <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
</svg>),
};


function EmployeeDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({});
    const [todayCandidates, setTodayCandidates] = useState([]);
    const [verifiedCandidates, setVerifiedCandidates] = useState([]);
    const [pipelineCandidates, setPipelineCandidates] = useState([]);
    const [teamSubmissions, setTeamSubmissions] = useState([]);
    const [last7Verified, setLast7Verified] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, msg: "", type: "" });
    const [showModal, setShowModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedCand, setSelectedCand] = useState(null);
    const [editForm, setEditForm] = useState({ main_status: "", sub_status: "", remark: "" });
    const [submissionModalProps, setSubmissionModalProps] = useState({});

    const fetchAllData = async () => {
        try {
            const [sData, tData, vData, pData, teamData, last7Data] = await Promise.all([
                apiRequest("/employee-portal/dashboard/stats/"),
                apiRequest("/employee-portal/dashboard/today-candidates/"),
                apiRequest("/employee-portal/dashboard/today-verified-candidates/"),
                apiRequest("/employee-portal/dashboard/active-pipeline-candidates/"),
                apiRequest("/employee-portal/dashboard/team/today-submissions/"),
                apiRequest("/employee-portal/dashboard/last-7-days-verified/")
            ]);
            setStats(sData); setTodayCandidates(tData); setVerifiedCandidates(vData); setPipelineCandidates(pData); setTeamSubmissions(teamData); setLast7Verified(Array.isArray(last7Data) ? last7Data : []);
        } catch (err) { notify("Failed to load dashboard data", "error"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAllData(); }, []);

    const notify = (msg, type = "success") => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
    };

    const handleEditClick = (e, candidate) => {
        e.stopPropagation(); setSelectedCand(candidate);
        setEditForm({ main_status: candidate.main_status, sub_status: candidate.sub_status, remark: candidate.remark || "" });
        setShowModal(true);
    };

    const handleUpdateSubmit = async () => {
        try {
            await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", editForm);
            notify("Status updated!"); setShowModal(false); fetchAllData();
        } catch (err) { notify("Update failed", "error"); }
    };

    const truncate = (text, limit) => (text?.length > limit ? text.substring(0, limit) + "..." : text);

    const handleOpenSubmitModal = (e, candidate, isTeamSubmission) => {
        e.stopPropagation();
        setSelectedCand(candidate);
        if (isTeamSubmission) {
            setSubmissionModalProps({ initialSubmitType: "CLIENT", hideInternalOption: true });
        } else {
            setSubmissionModalProps({});
        }
        setShowSubmitModal(true);
    };

    const renderRow = (c, i, showSubmitBtn = false, showSubmitToClientBtn = false) => {
        const statusStyle = getStatusStyles(c.main_status || 'SUBMITTED');
        
        return (
            <tr key={c.id || i} style={{ ...styles.tableRow, backgroundColor: statusStyle.bg }} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
                <td style={styles.td}>
                    <div>To: <b>{c.submitted_to_name || '-'}</b></div>
                    <div>By: <b style={{color: "#27AE60"}}>{c.created_by_name || ''}</b></div>
                </td>
                <td style={styles.td}><b>{c.candidate_name}</b></td>
                <td style={styles.td}>{truncate(c.technology, 30)}</td>
                <td style={styles.td}>{c.years_of_experience_manual || '0'} Yrs</td>
                <td style={styles.td}>{c.client_name || ''}
                    <small style={styles.subStatusText}>{c.client_company_name || '-'}</small>
                </td>
                <td style={styles.td}>
                    <b>{truncate(c.vendor_name || c.vendor_company_name || c.vendor, 15)}</b><br/>
                    <small style={styles.subStatusText}>{c.vendor_company_name || '-'}</small>
                    <small style={styles.subStatusText}>{c.vendor_number || ''}</small>
                </td>
                <td style={styles.td}>
                   Vendor: ₹{c.vendor_rate} {c.vendor_rate_type || ''}
                    
                    <br/><small style={styles.subStatusText}>Client: ₹{c.client_rate} {c.vendor_rate_type  || '-'}</small>
                </td>
                <td style={styles.td}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <span style={{...styles.badge, color: statusStyle.text, fontWeight: '800'}}>{c.main_status}</span>
                        {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
                    </div>
                    <small style={{ ...styles.subStatusText, color: statusStyle.text, fontWeight: '700' }}>{c.sub_status}</small>
                </td>
                <td style={styles.td}>
                    <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                        <button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button>
                        
                        {showSubmitBtn && (
                            c.verification_status ? (
                                c.client_name || c.client ? (
                                    <span style={{color:'#27AE60', fontWeight:'700', fontSize:'11px', whiteSpace:'nowrap'}}>✓ Client Submitted</span>
                                ) : (
                                    <span style={{color:'#27AE60', fontWeight:'700', fontSize:'11px', whiteSpace:'nowrap'}}>✓ Internal Submitted</span>
                                )
                            ) : (
                                <button style={styles.submitBtn} onClick={(e) => handleOpenSubmitModal(e, c, false)}>Submit</button>
                            )
                        )}

                        {showSubmitToClientBtn && (
                            c.client_name || c.client ? (
                                <span style={{color:'#27AE60', fontWeight:'700', fontSize:'11px', whiteSpace:'nowrap'}}>✓ Client Submitted</span>
                            ) : (
                                <button style={styles.submitBtn} onClick={(e) => handleOpenSubmitModal(e, c, true)}>Submit to Client</button>
                            )
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    const renderGroupedRows = (list = [], showSubmit = false, showSubmitClient = false) => {
        let lastDate = "";
        return list.map((c, i) => {
            const currentDate = new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            let dateSeparator = currentDate !== lastDate ? (
                <tr key={`date-sep-${i}`}><td colSpan="9" style={styles.dateSeparator}>{currentDate}</td></tr>
            ) : null;
            lastDate = currentDate;
            return <React.Fragment key={c.id || i}>{dateSeparator}{renderRow(c, i, showSubmit, showSubmitClient)}</React.Fragment>;
        });
    };

    if (loading) return <BaseLayout><div style={styles.loading}>Loading Dashboard...</div></BaseLayout>;

    return (
        <BaseLayout>
            {toast.show && <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#E74C3C' : '#27AE60'}}>{toast.msg}</div>}

            <div style={styles.header}>
                <div><h2 style={styles.welcome}>Welcome, {stats.user_name || "Recruiter"}</h2><p style={styles.subText}>Recruitment pipeline overview for today.</p></div>
                <div style={styles.btnGroup}>
                    <button style={styles.actionBtn} onClick={() => navigate("/employee/candidates/add")}><Icons.UserPlus /> Add Profile</button>
                    <button style={styles.actionBtn} onClick={() => navigate("/employee/vendor/add")}><Icons.UserPlus /> Add Vendor</button>
                    <button style={styles.actionBtn} onClick={() => navigate("/employee/requirement/create")}><Icons.Requirement /> Add Requirement</button>
                </div>
            </div>

            <div style={styles.statsGrid}>
                {[
                    { label: "Total Pipeline", val: stats.total_pipelines, icon: <Icons.Pipeline />, col: "#25343F", url: "/employee" },
                    { label: "Today's Profiles", val: stats.today_profiles, icon: <Icons.UserPlus />, col: "#25343F", url: "/employee" },
                    { label: "Today Submitted", val: stats.today_submitted_profiles, icon: <Icons.Send />, col: "#FF9B51", url: "/employee" },
                    { label: "Total Requirements", val: stats.today_requirements, icon: <Icons.Requirement />, col: "#25343F", url: "/employee/requirements" },
                    { label: "Total Vendors", val: stats.total_vendors, icon: <Icons.Vendor />, col: "#25343F", url: "/employee/user-vendors" },
                    { label: "Total Clients", val: stats.total_clients, icon: <Icons.Client />, col: "#25343F", url: "/employee/clients" },
                    { label: "Total Profiles", val: stats.total_profiles, icon: <Icons.Users />, col: "#25343F", url: "/employee/user-candidates" },
                ].map((s, i) => (
                    <div key={i} style={styles.statCard} onClick={() => navigate(s.url)}>
                        <div style={{overflow:'hidden'}}><p style={styles.statLabel}>{s.label}</p><h3 style={{...styles.statValue, color: s.col}}>{s.val || 0}</h3></div>
                        <div style={{...styles.iconCircle, color: s.col, backgroundColor: 'rgba(37,52,63,0.05)'}}>{s.icon}</div>
                    </div>
                ))}
            </div>

            <Section title="Active Pipeline Candidates"><table style={styles.table}><thead style={styles.tableHeader}><tr><th style={styles.th}>To/By</th><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th><th style={styles.th}>Client</th><th style={styles.th}>Vendor</th><th style={styles.th}>Rate</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th></tr></thead><tbody>{renderGroupedRows(pipelineCandidates)}</tbody></table></Section>
            <Section title="Submitted Profiles Table"><table style={styles.table}><thead style={styles.tableHeader}><tr><th style={styles.th}>Team</th><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th><th style={styles.th}>Client</th><th style={styles.th}>Vendor</th><th style={styles.th}>Rates</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th></tr></thead><tbody>{renderGroupedRows(verifiedCandidates)}</tbody></table></Section>
            <Section title="Today's Team Submissions"><table style={styles.table}><thead style={styles.tableHeader}><tr><th style={styles.th}>By</th><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th><th style={styles.th}>Client</th><th style={styles.th}>Vendor</th><th style={styles.th}>Rate</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th></tr></thead><tbody>{renderGroupedRows(teamSubmissions, false, true)}</tbody></table></Section>
            <Section title="Today's New Profiles"><table style={styles.table}><thead style={styles.tableHeader}><tr><th style={styles.th}>To/By</th><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th><th style={styles.th}>Client</th><th style={styles.th}>Vendor</th><th style={styles.th}>Rate</th><th style={styles.th}>Action</th></tr></thead><tbody>{renderGroupedRows(todayCandidates, true, false)}</tbody></table></Section>

            <StatusUpdateModal isOpen={showModal} onClose={() => setShowModal(false)} formData={editForm} setFormData={setEditForm} onSave={handleUpdateSubmit} />
            
            <SubmissionModal 
                isOpen={showSubmitModal} 
                onClose={() => setShowSubmitModal(false)} 
                selectedCand={selectedCand} 
                notify={notify} 
                refreshData={fetchAllData}
                {...submissionModalProps}
            />
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
    welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
    subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
    btnGroup: { display: "flex", gap: "10px", alignItems: "center"},
    actionBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "30px" },
    statCard: { background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4", cursor: 'pointer' },
    statLabel: { margin: 0, color: "#7F8C8D", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" },
    statValue: { margin: "4px 0", fontSize: "20px", fontWeight: "800" },
    iconCircle: { width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
    sectionContainer: { marginBottom: "35px" },
    sectionHeader: { marginBottom: "10px" },
    sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #FF9B51", paddingLeft: "12px" },
    tableWrapper: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4", marginTop: '5px' },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
    th: { padding: "12px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
    tableRow: { borderBottom: "1px solid #F1F5F9", transition: "0.2s", cursor: "pointer" },
    td: { padding: "12px 18px", fontSize: "13px", color: "#334155" },
    dateSeparator: { padding: "10px 20px", background: "#f8fafc", color: "#475569", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", borderBottom: '1px solid #e2e8f0' },
    badge: { background: "rgba(255, 155, 81, 0.12)", color: "#FF9B51", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
    subStatusText: { fontSize: '11px', color: '#7f8c8d', display: 'block', marginTop: "2px" },
    remarkIcon: { display: 'flex', cursor: 'help', padding: '4px', borderRadius: '4px', background: '#FFF5EB' },
    editBtn: { border: 'none', background: '#F1F5F9', padding: '6px', borderRadius: '6px', cursor: 'pointer' },
    submitBtn: { background: '#25343F', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '11px' }
};

export default EmployeeDashboard;







// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import BaseLayout from "../components/emp_base";
// import { apiRequest } from "../../services/api";
// import StatusUpdateModal from "../../components/StatusUpdateModal";
// import { getStatusStyles } from "../../utils/statusHelper";

// const Icons = {
//     UserPlus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>,
//     Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
//     Client: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
//     Vendor: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><circle cx="18" cy="8" r="3"/><path d="M18 11v5"/></svg>,
//     Pipeline: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
//     Send: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
//     Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
//     Remark: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9B51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
// };

// function EmployeeDashboard() {
//     const navigate = useNavigate();
//     const [stats, setStats] = useState({});
//     const [todayCandidates, setTodayCandidates] = useState([]);
//     const [verifiedCandidates, setVerifiedCandidates] = useState([]);
//     const [pipelineCandidates, setPipelineCandidates] = useState([]);
//     const [teamSubmissions, setTeamSubmissions] = useState([]);
//     const [last7Verified, setLast7Verified] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [toast, setToast] = useState({ show: false, msg: "", type: "" });
//     const [showClientSubmitModal, setShowClientSubmitModal] = useState(false);
//     const [showModal, setShowModal] = useState(false);
//     const [showSubmitModal, setShowSubmitModal] = useState(false);
//     const [selectedCand, setSelectedCand] = useState(null);
//     const [editForm, setEditForm] = useState({ main_status: "", sub_status: "", remark: "" });
//     const [submitType, setSubmitType] = useState("INTERNAL"); 
//     const [employees, setEmployees] = useState([]);
//     const [clientsList, setClientsList] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [submitData, setSubmitData] = useState({ target_id: "", client_rate: "", client_rate_type: "" });

//         // ... aapki purani states ke neeche
//     const [jdList, setJdList] = useState([]); // JD Dropdown ke liye
//     const [jdSearchTerm, setJdSearchTerm] = useState(""); // JD search ke liye
//     const [selectedJdId, setSelectedJdId] = useState(""); // Selected JD ID ke liye

//     const fetchAllData = async () => {
//         try {
//             const [sData, tData, vData, pData, teamData, last7Data] = await Promise.all([
//                 apiRequest("/employee-portal/dashboard/stats/"),
//                 apiRequest("/employee-portal/dashboard/today-candidates/"),
//                 apiRequest("/employee-portal/dashboard/today-verified-candidates/"),
//                 apiRequest("/employee-portal/dashboard/active-pipeline-candidates/"),
//                 apiRequest("/employee-portal/dashboard/team/today-submissions/"),
//                 apiRequest("/employee-portal/dashboard/last-7-days-verified/")
//             ]);
//             setStats(sData); setTodayCandidates(tData); setVerifiedCandidates(vData); setPipelineCandidates(pData); setTeamSubmissions(teamData); setLast7Verified(Array.isArray(last7Data) ? last7Data : []);
//         } catch (err) { notify("Failed to load dashboard data", "error"); }
//         finally { setLoading(false); }
//     };

//     const fetchDropdowns = async () => {
//         try {
//             const [empData, clientData] = await Promise.all([
//                 apiRequest("/employee-portal/api/employees/"),
//                 apiRequest("/employee-portal/clients/list/")
//             ]);
//             setEmployees(Array.isArray(empData) ? empData : []);
//             setClientsList(clientData?.results || (Array.isArray(clientData) ? clientData : []));
//         } catch (err) { console.error("Dropdown loading failed"); }
//     };

//     const fetchEmployeesForModal = async (search = "") => {
//             try {
//                 // Aapne jo URL batayi uske mutabik search query pass kar rahe hain
//                 const response = await apiRequest(`/employee-portal/api/employees/?search=${search}`);
//                 // Response direct array mil rahi hai ya results mein, uske hisaab se set karein
//                 setEmployees(Array.isArray(response) ? response : response.results || []);
//             } catch (err) {
//                 console.error("Employee search failed", err);
//             }
//         };

//     const [isSearching, setIsSearching] = useState(false);
//     const fetchClients = async (search = "") => {
//             setIsSearching(true);
//             try {
//                 const response = await apiRequest(`/employee-portal/clients/list/?search=${search}`);
//                 // Response handle karein standard DRF format ke hisaab se
//                 setClientsList(response.results || response || []);
//             } catch (err) {
//                 console.error("Client search failed");
//             } finally {
//                 setIsSearching(false);
//             }
//         };

//     const fetchClientsForModal = async (search = "") => {
//                 try {
//                     // Backend API ko search query ke saath hit karenge
//                     const response = await apiRequest(`/employee-portal/clients/list/?search=${search}`);
//                     // Agar response results format mein hai toh use set karein
//                     setClientsList(response.results || response || []);
//                 } catch (err) {
//                     console.error("Client search failed", err);
//                 }
//             };
    
//     useEffect(() => {
//             // Agar Modal open hai aur Search term 2 chars se bada hai
//             if (showClientSubmitModal && submitType === 'CLIENT') {
//                 const delayDebounceFn = setTimeout(() => {
//                     fetchClientsForModal(searchTerm);
//                 }, 500); // 500ms ka wait
//                 return () => clearTimeout(delayDebounceFn);
//             } else if (showClientSubmitModal && searchTerm === "") {
//                 fetchClientsForModal(""); // Khali search par default list
//             }
//         }, [searchTerm, showClientSubmitModal, submitType]);

//     useEffect(() => {
//         if (submitType === 'CLIENT' && searchTerm.length > 2) {
//             const delayDebounceFn = setTimeout(() => {
//                 fetchClients(searchTerm);
//             }, 500);
//             return () => clearTimeout(delayDebounceFn);
//         } else if (submitType === 'CLIENT' && searchTerm.length === 0) {
//             fetchClients(""); // Reset list
//         }
//     }, [searchTerm, submitType]);

//     useEffect(() => { fetchAllData(); fetchDropdowns(); }, []);

//     useEffect(() => {
//         if (showSubmitModal || showClientSubmitModal) {
//             const delayDebounceFn = setTimeout(() => {
//                 if (submitType === 'INTERNAL') {
//                     fetchEmployeesForModal(searchTerm);
//                 } else if (submitType === 'CLIENT') {
//                     fetchClientsForModal(searchTerm);
//                 }
//                 // JD search wala logic agar pehle se hai toh rehne dein
//             }, 500);
//             return () => clearTimeout(delayDebounceFn);
//         }
//     }, [searchTerm, showSubmitModal, showClientSubmitModal, submitType]);

//     // ==========JD =============================
//     useEffect(() => {
//         const fetchJDs = async () => {
//             try {
//                 const response = await apiRequest(`/jd-mapping/api/requirements/list/?search=${jdSearchTerm}`);
//                 setJdList(response.results || response || []);
//             } catch (err) { console.error("JD search failed"); }
//         };

//         if (showSubmitModal || showClientSubmitModal) {
//             const delayDebounceFn = setTimeout(() => {
//                 fetchJDs();
//             }, 500);
//             return () => clearTimeout(delayDebounceFn);
//         }
//     }, [jdSearchTerm, showSubmitModal, showClientSubmitModal]);

//     // =========================================================

//     const notify = (msg, type = "success") => {
//         setToast({ show: true, msg, type });
//         setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
//     };

//     const handleEditClick = (e, candidate) => {
//         e.stopPropagation(); setSelectedCand(candidate);
//         setEditForm({ main_status: candidate.main_status, sub_status: candidate.sub_status, remark: candidate.remark || "" });
//         setShowModal(true);
//     };

//     const handleTeamSubmitClick = (e, candidate) => {
//         e.stopPropagation(); setSelectedCand(candidate); setSubmitData({ target_id: "" });
//         setSubmitType("CLIENT"); setSearchTerm(""); setShowClientSubmitModal(true);
//     };

//     const handleUpdateSubmit = async () => {
//         try {
//             await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", editForm);
//             notify("Status updated!"); setShowModal(false); fetchAllData();
//         } catch (err) { notify("Update failed", "error"); }
//     };

//     const handleSubmitClick = (e, candidate) => {
//         e.stopPropagation(); setSelectedCand(candidate); setSubmitData({ target_id: "" });
//         setSubmitType("INTERNAL"); setSearchTerm(""); setShowSubmitModal(true);
//     };

//     // const handleFinalSubmission = async () => {
//     //     if (!submitData.target_id) return notify("Please select a target", "error");
//     //     const payload = { verification_status: true };
//     //     if (submitType === "INTERNAL") { payload.submitted_to = submitData.target_id; } 
//     //     else {
//     //         if (!submitData.client_rate || !submitData.client_rate_type) return notify("Rate details required", "error");
//     //         payload.client = submitData.target_id; payload.client_rate = submitData.client_rate; payload.client_rate_type = submitData.client_rate_type;
//     //     }
//     //     try {
//     //         await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", payload);
//     //         notify("Profile submitted!"); setShowSubmitModal(false); setShowClientSubmitModal(false); fetchAllData(); 
//     //     } catch (err) { notify("Submission failed", "error"); }
//     // };

//     const handleFinalSubmission = async () => {
//         if (!submitData.target_id) return notify("Please select a target", "error");
//         if (!selectedJdId) return notify("Please select a JD/Requirement", "error");

//         const payload = { verification_status: true };
//         if (submitType === "INTERNAL") { 
//             payload.submitted_to = submitData.target_id; 
//         } else {
//             if (!submitData.client_rate || !submitData.client_rate_type) return notify("Rate details required", "error");
//             payload.client = submitData.target_id; 
//             payload.client_rate = submitData.client_rate; 
//             payload.client_rate_type = submitData.client_rate_type;
//         }

//         try {
//             // 1. Profile Update (Jo pehle ho raha tha)
//             await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", payload);
            
//             // 2. JD Submission (Nayi API call)
//             await apiRequest("/jd-mapping/api/submissions/create/", "POST", {
//                 candidate_id: selectedCand.id,
//                 requirement_id: selectedJdId
//             });

//             notify("Profile & JD submitted successfully!");
//             setShowSubmitModal(false); 
//             setShowClientSubmitModal(false); 
//             setSelectedJdId(""); // Reset JD
//             fetchAllData(); 
//         } catch (err) { notify("Submission failed", "error"); }
//     };


//     const truncate = (text, limit) => (text?.length > limit ? text.substring(0, limit) + "..." : text);

//     // --- REFACTORED ROW RENDERING ---
//     const renderRow = (c, i, showSubmitBtn = false, showSubmitToClientBtn = false) => {
//         const statusStyle = getStatusStyles(c.main_status || 'SUBMITTED');
//         return (
//             <tr key={c.id || i} style={{ ...styles.tableRow, backgroundColor: statusStyle.bg }} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                 <td style={styles.td}>
//                     <div>To: <b>{c.submitted_to_name || '-'}</b></div>
//                     <div>By: <b style={{color: "#27AE60"}}>{c.created_by_name || '-'}</b></div>
//                 </td>
//                 <td style={styles.td}><b>{c.candidate_name}</b></td>
//                 <td style={styles.td}>{truncate(c.technology, 30)}</td>
//                 <td style={styles.td}>{c.years_of_experience_manual || '0'} Yrs</td>
//                 <td style={styles.td}>{c.client_name || c.client_company_name || 'N/A'}</td>
//                 <td style={styles.td}>
//                     <b>{truncate(c.vendor_name || c.vendor_company_name || c.vendor, 15)}</b><br/>
//                     <small style={styles.subStatusText}>{c.vendor_number || 'N/A'}</small>
//                 </td>
//                 <td style={styles.td}>
//                     ₹{c.vendor_rate} {c.vendor_rate_type || ''}
//                     <br/><small style={styles.subStatusText}>Client: ₹{c.client_rate || '-'}</small>
//                 </td>
//                 <td style={styles.td}>
//                     <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
//                         <span style={{...styles.badge, color: statusStyle.text, fontWeight: '800'}}>{c.main_status}</span>
//                         {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
//                     </div>
//                     <small style={{ ...styles.subStatusText, color: statusStyle.text, fontWeight: '700' }}>{c.sub_status}</small>
//                 </td>
//                 <td style={styles.td}>
//                     <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
//                         <button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button>
                        
//                         {/* 1. Only for New Profiles Table */}
//                         {showSubmitBtn && !c.verification_status && (
//                             <button style={styles.submitBtn} onClick={(e) => handleSubmitClick(e, c)}>Submit</button>
//                         )}
//                         {showSubmitBtn && c.verification_status && (
//                              <span style={{color:'#27AE60', fontWeight:'700', fontSize:'11px'}}>✓ Submitted</span>
//                         )}

//                         {/* 2. Only for Team Submissions Table */}
//                         {showSubmitToClientBtn && (
//                             c.client_name || c.client ? (
//                                 <span style={{color:'#27AE60', fontWeight:'700', fontSize:'11px', whiteSpace:'nowrap'}}>✓ Submitted</span>
//                             ) : (
//                                 <button style={styles.submitBtn} onClick={(e) => handleTeamSubmitClick(e, c)}>Submit to Client</button>
//                             )
//                         )}
//                     </div>
//                 </td>
//             </tr>
//         );
//     };

//     const renderGroupedRows = (list = [], showSubmit = false, showSubmitClient = false) => {
//         let lastDate = "";
//         return list.map((c, i) => {
//             const currentDate = new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
//             let dateSeparator = currentDate !== lastDate ? (
//                 <tr key={`date-sep-${i}`}><td colSpan="9" style={styles.dateSeparator}>{currentDate}</td></tr>
//             ) : null;
//             lastDate = currentDate;
//             return <React.Fragment key={c.id || i}>{dateSeparator}{renderRow(c, i, showSubmit, showSubmitClient)}</React.Fragment>;
//         });
//     };

//     if (loading) return <BaseLayout><div style={styles.loading}>Loading Dashboard...</div></BaseLayout>;

//     return (
//         <BaseLayout>
//             {toast.show && <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#E74C3C' : '#27AE60'}}>{toast.msg}</div>}

//             <div style={styles.header}>
//                 <div><h2 style={styles.welcome}>Welcome, {stats.user_name || "Recruiter"}</h2><p style={styles.subText}>Recruitment pipeline overview for today.</p></div>
//                 <div style={styles.btnGroup}>
//                     <button style={styles.actionBtn} onClick={() => navigate("/employee/candidates/add")}><Icons.UserPlus /> Add Profile</button>
//                     <button style={styles.actionBtn} onClick={() => navigate("/employee/vendor/add")}><Icons.UserPlus /> Add Vendor</button>
//                 </div>
//             </div>

//             <div style={styles.statsGrid}>
//                 {[
//                     { label: "Total Pipeline", val: stats.total_pipelines, icon: <Icons.Pipeline />, col: "#25343F", url: "/employee" },
//                     { label: "Today's Profiles", val: stats.today_profiles, icon: <Icons.UserPlus />, col: "#25343F", url: "/employee" },
//                     { label: "Today Submitted", val: stats.today_submitted_profiles, icon: <Icons.Send />, col: "#FF9B51", url: "/employee" },
//                     { label: "Total Vendors", val: stats.total_vendors, icon: <Icons.Vendor />, col: "#25343F", url: "/employee/user-vendors" },
//                     { label: "Total Clients", val: stats.total_clients, icon: <Icons.Client />, col: "#25343F", url: "/employee/clients" },
//                     { label: "Total Profiles", val: stats.total_profiles, icon: <Icons.Users />, col: "#25343F", url: "/employee/user-candidates" },
//                 ].map((s, i) => (
//                     <div key={i} style={styles.statCard} onClick={() => navigate(s.url)}>
//                         <div style={{overflow:'hidden'}}><p style={styles.statLabel}>{s.label}</p><h3 style={{...styles.statValue, color: s.col}}>{s.val || 0}</h3></div>
//                         <div style={{...styles.iconCircle, color: s.col, backgroundColor: 'rgba(37,52,63,0.05)'}}>{s.icon}</div>
//                     </div>
//                 ))}
//             </div>

//             <Section title="Active Pipeline Candidates">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Submitted To/By</th><th style={styles.th}>Candidate</th>
//                             <th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th><th style={styles.th}>Vendor</th>
//                             <th style={styles.th}>Rate</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>{renderGroupedRows(pipelineCandidates)}</tbody>
//                 </table>
//             </Section>

//             <Section title="Submitted Profiles Table">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Team</th><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th><th style={styles.th}>Vendor & Contact</th>
//                             <th style={styles.th}>Rates</th><th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>{renderGroupedRows(verifiedCandidates)}</tbody>
//                 </table>
//             </Section>

//             <Section title="Today's Team Submissions">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Submitted By</th><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th><th style={styles.th}>Vendor & Contact</th><th style={styles.th}>Rate</th>
//                             <th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>{renderGroupedRows(teamSubmissions, false, true)}</tbody>
//                 </table>
//             </Section>


//              <Section title="Last 7 Days Submitted Profiles">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Team</th><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th><th style={styles.th}>Vendor</th>
//                             <th style={styles.th}>Rate</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>{renderGroupedRows(last7Verified)}</tbody>
//                 </table>
//             </Section> 


//             <Section title="Today's New Profiles">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>To/By</th><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th><th style={styles.th}>Vendor & Contact</th><th style={styles.th}>Rate</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>{renderGroupedRows(todayCandidates, true, false)}</tbody>
//                 </table>
//             </Section>

//             <StatusUpdateModal isOpen={showModal} onClose={() => setShowModal(false)} formData={editForm} setFormData={setEditForm} onSave={handleUpdateSubmit} />

//             {(showSubmitModal || showClientSubmitModal) && (
//                 <div style={styles.modalOverlay} onClick={() => {setShowSubmitModal(false); setShowClientSubmitModal(false);}}>
//                     <div style={styles.modalContent} onClick={e => e.stopPropagation() }>
//                         <h3 style={{color:'#25343F', marginBottom:'15px', fontWeight: '800'}}>Complete Submission</h3>
//                         <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
//                             <button style={{...styles.typeBtn, border: submitType === 'INTERNAL' ? '2px solid #FF9B51' : '1px solid #F0F2F4'}} onClick={() => { setSubmitType('INTERNAL'); setSubmitData({target_id: ""}); }}>Internal Team</button>
//                             <button style={{...styles.typeBtn, border: submitType === 'CLIENT' ? '2px solid #FF9B51' : '1px solid #F0F2F4'}} onClick={() => { setSubmitType('CLIENT'); setSubmitData({target_id: ""}); }}>Client</button>
//                         </div>
                        

//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Select {submitType}</label>
//                             <input 
//                                 type="text" 
//                                 placeholder={`Search ${submitType}...`} 
//                                 style={styles.modalInput} 
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                             />
                            
//                             {isSearching && <small style={{color: '#FF9B51'}}>Searching...</small>}

//                             <select 
//                                 style={styles.modalSelect} 
//                                 size="5" 
//                                 value={submitData.target_id} 
//                                 onChange={(e) => setSubmitData({...submitData, target_id: e.target.value})}
//                             >
//                                 <option value="">-- Choose --</option>
//                                 { (submitType === 'INTERNAL' ? employees : clientsList).map((item) => {
//                                     const name = submitType === 'INTERNAL' 
//                                         ? `${item.first_name} ${item.last_name}` 
//                                         : (item.company_name || item.client_name);
                                    
//                                     // Note: Agar API se filter ho raha hai toh .includes() check hatane ki zarurat nahi, 
//                                     // par API results ko direct map karein
//                                     return <option key={item.id} value={item.id}>{name}</option>;
//                                 })}
//                             </select>
//                         </div>
//                         {submitType === "CLIENT" && (
//                             <div style={{display:'flex', gap:'10px'}}>
//                                 <input type="number" placeholder="Rate" style={styles.modalInput} onChange={e => setSubmitData({...submitData, client_rate: e.target.value})} />
//                                 <select style={styles.modalInput} onChange={e => setSubmitData({...submitData, client_rate_type: e.target.value})}>
//                                     <option value="">Type</option><option value="LPM">LPM</option><option value="KPM">KPM</option><option value="PHR">PHR</option>
//                                 </select>
//                             </div>
//                         )}

//                         {/* --- Naya JD Search Section --- */}
//                         <div style={{...styles.inputGroup, marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
//                             <label style={styles.modalLabel}>Choose JD (Required) *</label>
//                             <input 
//                                 type="text" 
//                                 placeholder="Search JD / Requirement ID..." 
//                                 style={styles.modalInput} 
//                                 value={jdSearchTerm}
//                                 onChange={(e) => setJdSearchTerm(e.target.value)} 
//                             />
//                             <select 
//                                 style={styles.modalSelect} 
//                                 size="4" 
//                                 value={selectedJdId} 
//                                 onChange={(e) => setSelectedJdId(e.target.value)}
//                             >
//                                 <option value="">-- Select JD --</option>
//                                 {jdList.map((jd) => (
//                                     <option key={jd.id} value={jd.id}>
//                                         {jd.requirement_id} - {jd.title}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
//                             <button style={styles.saveBtn} onClick={handleFinalSubmission}>Confirm</button>
//                             <button style={styles.cancelBtn} onClick={() => {setShowSubmitModal(false); setShowClientSubmitModal(false);}}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </BaseLayout>
//     );
// }

// const Section = ({ title, children }) => (
//     <div style={styles.sectionContainer}>
//         <div style={styles.sectionHeader}><h3 style={styles.sectionTitle}>{title}</h3></div>
//         <div style={styles.tableWrapper}><div style={{overflowX:'auto'}}>{children}</div></div>
//     </div>
// );

// const styles = {
//     loading: { padding: '100px', textAlign: 'center', fontWeight: '800', color: '#25343F' },
//     toast: { position: 'fixed', top: '85px', right: '20px', color: '#fff', padding: '12px 25px', borderRadius: '8px', zIndex: 9999, fontWeight: '700', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
//     header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" },
//     welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
//     subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
//     btnGroup: { display: "flex", gap: "10px", alignItems: "center"},
//     actionBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" },
//     statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "15px", marginBottom: "30px" },
//     statCard: { background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4", cursor: 'pointer' },
//     statLabel: { margin: 0, color: "#7F8C8D", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" },
//     statValue: { margin: "4px 0", fontSize: "20px", fontWeight: "800" },
//     iconCircle: { width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
//     sectionContainer: { marginBottom: "35px" },
//     sectionHeader: { marginBottom: "10px" },
//     sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #FF9B51", paddingLeft: "12px" },
//     tableWrapper: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4", marginTop: '5px' },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
//     th: { padding: "12px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
//     tableRow: { borderBottom: "1px solid #F1F5F9", transition: "0.2s", cursor: "pointer" },
//     td: { padding: "12px 18px", fontSize: "13px", color: "#334155" },
//     dateSeparator: { padding: "10px 20px", background: "#f8fafc", color: "#475569", fontWeight: "800", fontSize: "12px", textTransform: "uppercase", borderBottom: '1px solid #e2e8f0' },
//     badge: { background: "rgba(255, 155, 81, 0.12)", color: "#FF9B51", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//     subStatusText: { fontSize: '11px', color: '#7f8c8d', display: 'block', marginTop: "2px" },
//     remarkIcon: { display: 'flex', cursor: 'help', padding: '4px', borderRadius: '4px', background: '#FFF5EB' },
//     editBtn: { border: 'none', background: '#F1F5F9', padding: '6px', borderRadius: '6px', cursor: 'pointer' },
//     submitBtn: { background: '#25343F', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '11px' },
//     // modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(37, 52, 63, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' },
//     // modalContent: { background: '#fff', padding: '30px', borderRadius: '20px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
//     modalLabel: { fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' },
//     modalInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #F0F2F4', marginBottom: '10px', outline: 'none', fontSize: '13px' },
//     // modalSelect: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #F0F2F4', outline: 'none', fontSize: '13px', height: '120px' },
//     typeBtn: { flex: 1, padding: '10px', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#25343F' },
//     saveBtn: { flex: 1, background: '#FF9B51', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },
//     cancelBtn: { flex: 1, background: '#F1F5F9', color: '#7F8C8D', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },

//     modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(37, 52, 63, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(4px)',padding: '20px' },
//     modalContent: { background: '#fff', padding: '30px', borderRadius: '20px',  width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',position: 'relative',msOverflowStyle: 'none',scrollbarWidth: 'none' },
//     modalSelect: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #F0F2F4', outline: 'none', fontSize: '13px', height: '110px'}, 
// };

// export default EmployeeDashboard;







// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import BaseLayout from "../components/emp_base";
// import { apiRequest } from "../../services/api";
// import StatusUpdateModal from "../../components/StatusUpdateModal";
// import { getStatusStyles } from "../../utils/statusHelper";

// const Icons = {
//     UserPlus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>,
//     Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
//     Client: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
//     Vendor: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><circle cx="18" cy="8" r="3"/><path d="M18 11v5"/></svg>,
//     Pipeline: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
//     Send: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
//     Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
//     Remark: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9B51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
// };

// function EmployeeDashboard() {
//     const navigate = useNavigate();
//     const [stats, setStats] = useState({});
//     const [todayCandidates, setTodayCandidates] = useState([]);
//     const [verifiedCandidates, setVerifiedCandidates] = useState([]);
//     const [pipelineCandidates, setPipelineCandidates] = useState([]);
//     const [teamSubmissions, setTeamSubmissions] = useState([]);
//     const [last7Verified, setLast7Verified] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [toast, setToast] = useState({ show: false, msg: "", type: "" });
//     const [showClientSubmitModal, setShowClientSubmitModal] = useState(false);
//     const [showModal, setShowModal] = useState(false);
//     const [showSubmitModal, setShowSubmitModal] = useState(false);
//     const [selectedCand, setSelectedCand] = useState(null);
//     const [editForm, setEditForm] = useState({ main_status: "", sub_status: "", remark: "" });
//     const [submitType, setSubmitType] = useState("INTERNAL"); 
//     const [employees, setEmployees] = useState([]);
//     const [clientsList, setClientsList] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [submitData, setSubmitData] = useState({ target_id: "", client_rate: "", client_rate_type: "" });

//     const fetchAllData = async () => {
//         try {
//             const [sData, tData, vData, pData, teamData, last7Data] = await Promise.all([
//                 apiRequest("/employee-portal/dashboard/stats/"),
//                 apiRequest("/employee-portal/dashboard/today-candidates/"),
//                 apiRequest("/employee-portal/dashboard/today-verified-candidates/"),
//                 apiRequest("/employee-portal/dashboard/active-pipeline-candidates/"),
//                 apiRequest("/employee-portal/dashboard/team/today-submissions/"),
//                 apiRequest("/employee-portal/dashboard/last-7-days-verified/")
//             ]);
//             setStats(sData); setTodayCandidates(tData); setVerifiedCandidates(vData); setPipelineCandidates(pData); setTeamSubmissions(teamData); setLast7Verified(Array.isArray(last7Data) ? last7Data : []);
//         } catch (err) { notify("Failed to load dashboard data", "error"); }
//         finally { setLoading(false); }
//     };

//     const fetchDropdowns = async () => {
//         try {
//             const [empData, clientData] = await Promise.all([
//                 apiRequest("/employee-portal/api/employees/"),
//                 apiRequest("/employee-portal/clients/list/")
//             ]);
//             setEmployees(Array.isArray(empData) ? empData : []);
//             setClientsList(clientData?.results || (Array.isArray(clientData) ? clientData : []));
//         } catch (err) { console.error("Dropdown loading failed"); }
//     };

//     useEffect(() => { fetchAllData(); fetchDropdowns(); }, []);

//     const notify = (msg, type = "success") => {
//         setToast({ show: true, msg, type });
//         setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
//     };

//     const handleEditClick = (e, candidate) => {
//         e.stopPropagation(); setSelectedCand(candidate);
//         setEditForm({ main_status: candidate.main_status, sub_status: candidate.sub_status, remark: candidate.remark || "" });
//         setShowModal(true);
//     };

//     const handleTeamSubmitClick = (e, candidate) => {
//         e.stopPropagation(); setSelectedCand(candidate); setSubmitData({ target_id: "" });
//         setSubmitType("CLIENT"); setSearchTerm(""); setShowClientSubmitModal(true);
//     };

//     const handleUpdateSubmit = async () => {
//         try {
//             await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", editForm);
//             notify("Status updated!"); setShowModal(false); fetchAllData();
//         } catch (err) { notify("Update failed", "error"); }
//     };

//     const handleSubmitClick = (e, candidate) => {
//         e.stopPropagation(); setSelectedCand(candidate); setSubmitData({ target_id: "" });
//         setSubmitType("INTERNAL"); setSearchTerm(""); setShowSubmitModal(true);
//     };

//     const handleFinalSubmission = async () => {
//         if (!submitData.target_id) return notify("Please select a target", "error");
//         const payload = { verification_status: true };
//         if (submitType === "INTERNAL") { payload.submitted_to = submitData.target_id; } 
//         else {
//             if (!submitData.client_rate || !submitData.client_rate_type) return notify("Rate details required", "error");
//             payload.client = submitData.target_id; payload.client_rate = submitData.client_rate; payload.client_rate_type = submitData.client_rate_type;
//         }
//         try {
//             await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", payload);
//             notify("Profile submitted!"); setShowSubmitModal(false); setShowClientSubmitModal(false); fetchAllData(); 
//         } catch (err) { notify("Submission failed", "error"); }
//     };

//     const truncate = (text, limit) => (text?.length > limit ? text.substring(0, limit) + "..." : text);

//     const renderRows = (list = [], showSubmitBtn = false, showSubmitToClientBtn = false) => {
//         return list.map((c, i) => {
//             const currentDate = new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
//             const statusStyle = getStatusStyles(c.main_status || 'SUBMITTED');
//             return (
//                 <tr key={c.id || i} style={{ ...styles.tableRow, backgroundColor: statusStyle.bg }} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                     <td style={styles.td}><b>{currentDate}</b></td>
//                     <td style={styles.td}>
//                         <div>To: <b>{truncate(c.submitted_to_name, 15) || '-'}</b></div>
//                         <div>By: <b style={{color: "#27AE60"}}>{truncate(c.created_by_name, 15) || '-'}</b></div>
//                     </td>
//                     <td style={styles.td}><b>{c.candidate_name}</b></td>
//                     <td style={styles.td}>{truncate(c.technology, 30)}</td>
//                     <td style={styles.td}>{c.years_of_experience_manual || '0'} Yrs</td>
//                     <td style={styles.td}>{truncate(c.client_name || c.client_company_name || 'N/A', 20)}</td>
//                     <td style={styles.td}>
//                         <b>{truncate(c.vendor_name || c.vendor_company_name || c.vendor, 15)}</b><br/>
//                         <small style={styles.subStatusText}>{c.vendor_number || 'N/A'}</small>
//                     </td>
//                     <td style={styles.td}>
//                         ₹{c.vendor_rate} {c.vendor_rate_type || ''}
//                         <br/><small style={styles.subStatusText}>Client: ₹{c.client_rate || '-'}</small>
//                     </td>
//                     <td style={styles.td}>
//                         <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
//                             <span style={{...styles.badge, color: statusStyle.text, fontWeight: '800'}}>{c.main_status}</span>
//                             {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
//                         </div>
//                         <small style={{ ...styles.subStatusText, color: statusStyle.text, fontWeight: '700' }}>{c.sub_status}</small>
//                     </td>
//                     <td style={styles.td}>
//                         <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
//                             <button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button>
//                             {showSubmitBtn && !c.verification_status && (
//                                 <button style={styles.submitBtn} onClick={(e) => handleSubmitClick(e, c)}>Submit</button>
//                             )}
//                             {showSubmitBtn && c.verification_status && (
//                                  <span style={{color:'#27AE60', fontWeight:'700', fontSize:'11px'}}>✓ Submitted</span>
//                             )}
//                             {showSubmitToClientBtn && (
//                                 (c.client_name || c.client) ? (
//                                     <span style={{color:'#27AE60', fontWeight:'700', fontSize:'11px', whiteSpace:'nowrap'}}>✓ Submitted</span>
//                                 ) : (
//                                     <button style={styles.submitBtn} onClick={(e) => handleTeamSubmitClick(e, c)}>Submit to Client</button>
//                                 )
//                             )}
//                         </div>
//                     </td>
//                 </tr>
//             );
//         });
//     };

//     if (loading) return <BaseLayout><div style={styles.loading}>Loading Dashboard...</div></BaseLayout>;

//     return (
//         <BaseLayout>
//             {toast.show && <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#E74C3C' : '#27AE60'}}>{toast.msg}</div>}

//             <div style={styles.header}>
//                 <div><h2 style={styles.welcome}>Welcome, {stats.user_name || "Recruiter"}</h2><p style={styles.subText}>Recruitment pipeline overview for today.</p></div>
//                 <div style={styles.btnGroup}>
//                     <button style={styles.actionBtn} onClick={() => navigate("/employee/candidates/add")}><Icons.UserPlus /> Add Profile</button>
//                     <button style={styles.actionBtn} onClick={() => navigate("/employee/vendor/add")}><Icons.UserPlus /> Add Vendor</button>
//                 </div>
//             </div>

//             <div style={styles.statsGrid}>
//                 {[
//                     { label: "Total Pipeline", val: stats.total_pipelines, icon: <Icons.Pipeline />, col: "#4834D4", url: "/employee" },
//                     { label: "Today's Profiles", val: stats.today_profiles, icon: <Icons.UserPlus />, col: "#25343F", url: "/employee" },
//                     { label: "Today Submitted", val: stats.today_submitted_profiles, icon: <Icons.Send />, col: "#FF9B51", url: "/employee" },
//                     { label: "Total Submitted", val: stats.total_submitted_profiles, icon: <Icons.Send />, col: "#27AE60", url: "/employee" },
//                     { label: "Total Vendors", val: stats.total_vendors, icon: <Icons.Vendor />, col: "#25343F", url: "/employee/user-vendors" },
//                     { label: "Total Clients", val: stats.total_clients, icon: <Icons.Client />, col: "#25343F", url: "/employee/clients" },
//                     { label: "Total Profiles", val: stats.total_profiles, icon: <Icons.Users />, col: "#25343F", url: "/employee/user-candidates" },
//                 ].map((s, i) => (
//                     <div key={i} style={styles.statCard} onClick={() => navigate(s.url)}>
//                         <div style={{overflow:'hidden'}}><p style={styles.statLabel}>{s.label}</p><h3 style={{...styles.statValue, color: s.col}}>{s.val || 0}</h3></div>
//                         <div style={{...styles.iconCircle, color: s.col, backgroundColor: 'rgba(37,52,63,0.05)'}}>{s.icon}</div>
//                     </div>
//                 ))}
//             </div>

//             <Section title="Active Pipeline Candidates">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Date</th>
//                             <th style={styles.th}>Submitted To/By</th><th style={styles.th}>Candidate</th>
//                             <th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th><th style={styles.th}>Vendor</th>
//                             <th style={styles.th}>Rate</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>{renderRows(pipelineCandidates)}</tbody>
//                 </table>
//             </Section>

//             <Section title="Submitted Profiles Table">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Date</th>
//                             <th style={styles.th}>Team</th><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th><th style={styles.th}>Vendor & Contact</th>
//                             <th style={styles.th}>Rates</th><th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>{renderRows(verifiedCandidates)}</tbody>
//                 </table>
//             </Section>

//             <Section title="Today's Team Submissions">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Date</th>
//                             <th style={styles.th}>Submitted By</th><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th><th style={styles.th}>Vendor & Contact</th><th style={styles.th}>Rate</th>
//                             <th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>{renderRows(teamSubmissions, false, true)}</tbody>
//                 </table>
//             </Section>

//             <Section title="Today's New Profiles">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Date</th>
//                             <th style={styles.th}>To/By</th><th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th><th style={styles.th}>Vendor & Contact</th><th style={styles.th}>Rate</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>{renderRows(todayCandidates, true, false)}</tbody>
//                 </table>
//             </Section>

//             <StatusUpdateModal isOpen={showModal} onClose={() => setShowModal(false)} formData={editForm} setFormData={setEditForm} onSave={handleUpdateSubmit} />

//             {(showSubmitModal || showClientSubmitModal) && (
//                 <div style={styles.modalOverlay} onClick={() => {setShowSubmitModal(false); setShowClientSubmitModal(false);}}>
//                     <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
//                         <h3 style={{color:'#25343F', marginBottom:'15px', fontWeight: '800'}}>Complete Submission</h3>
//                         <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
//                             <button style={{...styles.typeBtn, border: submitType === 'INTERNAL' ? '2px solid #FF9B51' : '1px solid #F0F2F4'}} onClick={() => { setSubmitType('INTERNAL'); setSubmitData({target_id: ""}); }}>Internal Team</button>
//                             <button style={{...styles.typeBtn, border: submitType === 'CLIENT' ? '2px solid #FF9B51' : '1px solid #F0F2F4'}} onClick={() => { setSubmitType('CLIENT'); setSubmitData({target_id: ""}); }}>Client</button>
//                         </div>
//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Select {submitType}</label>
//                             <input type="text" placeholder="Search..." style={styles.modalInput} onChange={(e) => setSearchTerm(e.target.value)} />
//                             <select style={styles.modalSelect} size="5" value={submitData.target_id} onChange={(e) => setSubmitData({...submitData, target_id: e.target.value})}>
//                                 <option value="">-- Choose --</option>
//                                 {(submitType === 'INTERNAL' ? employees : clientsList).map((item) => {
//                                     const name = submitType === 'INTERNAL' ? `${item.first_name} ${item.last_name}` : (item.company_name || item.client_name);
//                                     return name.toLowerCase().includes(searchTerm.toLowerCase()) ? <option key={item.id} value={item.id}>{name}</option> : null;
//                                 })}
//                             </select>
//                         </div>
//                         {submitType === "CLIENT" && (
//                             <div style={{display:'flex', gap:'10px'}}>
//                                 <input type="number" placeholder="Rate" style={styles.modalInput} onChange={e => setSubmitData({...submitData, client_rate: e.target.value})} />
//                                 <select style={styles.modalInput} onChange={e => setSubmitData({...submitData, client_rate_type: e.target.value})}>
//                                     <option value="">Type</option><option value="LPM">LPM</option><option value="KPM">KPM</option><option value="PHR">PHR</option>
//                                 </select>
//                             </div>
//                         )}
//                         <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
//                             <button style={styles.saveBtn} onClick={handleFinalSubmission}>Confirm</button>
//                             <button style={styles.cancelBtn} onClick={() => {setShowSubmitModal(false); setShowClientSubmitModal(false);}}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </BaseLayout>
//     );
// }

// const Section = ({ title, children }) => (
//     <div style={styles.sectionContainer}>
//         <div style={styles.sectionHeader}><h3 style={styles.sectionTitle}>{title}</h3></div>
//         <div style={styles.tableWrapper}><div style={{overflowX:'auto'}}>{children}</div></div>
//     </div>
// );

// const styles = {
//     loading: { padding: '100px', textAlign: 'center', fontWeight: '800', color: '#25343F' },
//     toast: { position: 'fixed', top: '85px', right: '20px', color: '#fff', padding: '12px 25px', borderRadius: '8px', zIndex: 9999, fontWeight: '700', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
//     header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" },
//     welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
//     subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
//     btnGroup: { display: "flex", gap: "10px", alignItems: "center"},
//     actionBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" },
//     statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "30px" },
//     statCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4", cursor: 'pointer' },
//     statLabel: { margin: 0, color: "#7F8C8D", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" },
//     statValue: { margin: "4px 0", fontSize: "24px", fontWeight: "800" },
//     iconCircle: { width: "44px", height: "44px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
//     sectionContainer: { marginBottom: "35px" },
//     sectionHeader: { marginBottom: "15px" },
//     sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #FF9B51", paddingLeft: "12px" },
//     tableWrapper: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
//     th: { padding: "14px 18px", textAlign: "left", fontSize: "11px", color: "#626b77", fontWeight: "800", textTransform: "uppercase" },
//     tableRow: { borderBottom: "1px solid #F1F5F9", transition: "0.2s", cursor: "pointer" },
//     td: { padding: "14px 18px", fontSize: "13px", color: "#334155" },
//     badge: { background: "rgba(255, 155, 81, 0.12)", color: "#FF9B51", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//     subStatusText: { fontSize: '11px', color: '#7f8c8d', display: 'block', marginTop: "2px" },
//     remarkIcon: { display: 'flex', cursor: 'help', padding: '4px', borderRadius: '4px', background: '#FFF5EB' },
//     editBtn: { border: 'none', background: '#F1F5F9', padding: '6px', borderRadius: '6px', cursor: 'pointer' },
//     submitBtn: { background: '#25343F', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '11px' },
//     modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(37, 52, 63, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' },
//     modalContent: { background: '#fff', padding: '30px', borderRadius: '20px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
//     modalLabel: { fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' },
//     modalInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #F0F2F4', marginBottom: '10px', outline: 'none', fontSize: '13px' },
//     modalSelect: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #F0F2F4', outline: 'none', fontSize: '13px', height: '120px' },
//     typeBtn: { flex: 1, padding: '10px', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#25343F' },
//     saveBtn: { flex: 1, background: '#FF9B51', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },
//     cancelBtn: { flex: 1, background: '#F1F5F9', color: '#7F8C8D', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }
// };

// export default EmployeeDashboard;
