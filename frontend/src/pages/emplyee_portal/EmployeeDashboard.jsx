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
    
    // --- ALL STATES AT TOP ---
    const [stats, setStats] = useState({});
    const [todayCandidates, setTodayCandidates] = useState([]);
    const [verifiedCandidates, setVerifiedCandidates] = useState([]);
    const [pipelineCandidates, setPipelineCandidates] = useState([]);
    const [teamSubmissions, setTeamSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, msg: "", type: "" });

    const [showClientSubmitModal, setShowClientSubmitModal] = useState(false);
    
    // Modal & Selection States
    const [showModal, setShowModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedCand, setSelectedCand] = useState(null);
    const [editForm, setEditForm] = useState({ main_status: "", sub_status: "", remark: "" });
    
    const [submitType, setSubmitType] = useState("INTERNAL"); 
    const [employees, setEmployees] = useState([]);
    const [clientsList, setClientsList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    // const [submitData, setSubmitData] = useState({ target_id: "" });
    const [submitData, setSubmitData] = useState({
    target_id: "",
    client_rate: "",
    client_rate_type: ""
    });



    // --- DATA FETCHING ---
    const fetchAllData = async () => {
        try {
            const [sData, tData, vData, pData, teamData] = await Promise.all([
                apiRequest("/employee-portal/dashboard/stats/"),
                apiRequest("/employee-portal/dashboard/today-candidates/"),
                apiRequest("/employee-portal/dashboard/today-verified-candidates/"),
                apiRequest("/employee-portal/dashboard/active-pipeline-candidates/"),
                apiRequest("/employee-portal/dashboard/team/today-submissions/")
            ]);
            setStats(sData);
            setTodayCandidates(tData);
            setVerifiedCandidates(vData);
            setPipelineCandidates(pData);
            setTeamSubmissions(teamData);
        } catch (err) { notify("Failed to load dashboard data", "error"); }
        finally { setLoading(false); }
    };

    const fetchDropdowns = async () => {
    try {
        const [empData, clientData] = await Promise.all([
            apiRequest("/employee-portal/api/employees/"),
            apiRequest("/employee-portal/clients/list/")
        ]);

        // Employee list direct array hai
        setEmployees(Array.isArray(empData) ? empData : []);

        // Client list mein data "results" key ke andar hai
        if (clientData && clientData.results) {
            setClientsList(clientData.results);
        } else {
            setClientsList(Array.isArray(clientData) ? clientData : []);
        }
    } catch (err) { 
        console.error("Dropdown loading failed"); 
        setEmployees([]);
        setClientsList([]);
    }
    };

    useEffect(() => { 
        fetchAllData(); 
        fetchDropdowns(); 
    }, []);

    // --- HANDLERS ---
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

    const handleTeamSubmitClick = (e, candidate) => {
    e.stopPropagation();
    setSelectedCand(candidate);
    setSubmitData({ target_id: "" });
    setSubmitType("CLIENT"); 
    setSearchTerm("");
    setShowClientSubmitModal(true);
    };

    const handleUpdateSubmit = async () => {
        try {
            await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", editForm);
            notify("Status updated successfully!");
            setShowModal(false);
            fetchAllData();
        } catch (err) { notify("Update failed", "error"); }
    };


    const handleSubmitClick = (e, candidate) => {
        e.stopPropagation();
        setSelectedCand(candidate);
        setSubmitData({ target_id: "" });
        setSubmitType("INTERNAL");
        setSearchTerm("");
        setShowSubmitModal(true);
    };


    const handleFinalSubmission = async () => {
    if (!submitData.target_id) return notify("Please select a target", "error");

    // Naya dynamic payload logic
    const payload = {
        verification_status: true,
    };

    if (submitType === "INTERNAL") {
        payload.submitted_to = submitData.target_id;
        payload.client = null; // Internal submission hai toh client clear kar sakte hain
    } else if (submitType === "CLIENT") {

            if (!submitData.target_id)
                return notify("Please select client", "error");

            if (!submitData.client_rate)
                return notify("Client rate is required", "error");

            if (!submitData.client_rate_type)
                return notify("Client rate type is required", "error");

            payload.client = submitData.target_id;
            payload.client_rate = submitData.client_rate;
            payload.client_rate_type = submitData.client_rate_type;
        }


    try {
        await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", payload);
        notify("Profile submitted successfully!");
        setShowSubmitModal(false);
        setShowClientSubmitModal(false); // Dono modals close karein
        fetchAllData(); 
    } catch (err) { notify("Submission failed", "error"); }
};


const getStatusStyles = (status) => {
    switch (status) {
        case "SUBMITTED": return { bg: "#E8F4FD", text: "#1976D2" }; 
        case "SCREENING": return { bg: "#ffee005e", text: "#383333" }; 
        case "L1": return { bg: "#6365f146", text: "#1976D2" };       
        case "L2": return { bg: "#D6DBF0", text: "#101933" };        
        case "L3": return { bg: "#31df39a8", text: "#183f1a" };  
        case "OTHER": return { bg: "#00ff0da9", text: "#183f1a" };        
        case "OFFERED": return { bg: "#FFF9C4", text: "#F57F17" };   
        case "ONBORD": return { bg: "#C8E6C9", text: "#1B5E20" };    
        case "ON_HOLD": return { bg: "#FFF3E0", text: "#E65100" };   
        case "REJECTED": return { bg: "#FFEBEE", text: "#C62828" }; 
        case "WITHDRAWN": return { bg: "#ECEFF1", text: "#455A64" }; 
        default: return { bg: "#FFFFFF", text: "#334155" };      
    }
};


    const truncate = (text, limit) => (text?.length > limit ? text.substring(0, limit) + "..." : text);

    if (loading) return <BaseLayout><div style={styles.loading}>Loading Dashboard...</div></BaseLayout>;

    return (
        <BaseLayout>
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
                <div style={styles.btnGroup}>
                    <button style={styles.actionBtn} onClick={() => navigate("/employee/candidates/add")}><Icons.UserPlus /> Add Profile</button>
                    <button style={styles.actionBtn} onClick={() => navigate("/employee/vendor/add")}><Icons.UserPlus /> Add Vendor</button>
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
                    <div key={i} style={{ ...styles.statCard, cursor: "pointer" }} onClick={() => navigate(s.url)}>
                        <div>
                            <p style={styles.statLabel}>{s.label}</p>
                            <h3 style={{ ...styles.statValue, color: s.col }}>{s.val || 0}</h3>
                        </div>
                        <div style={{...styles.iconCircle, color: s.col, backgroundColor: s.col === '#FF9B51' ? 'rgba(255,155,81,0.1)' : 'rgba(37,52,63,0.05)'}}>
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            <Section title="Active Pipeline Candidates">
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
                            <th style={styles.th}>Client</th><th style={styles.th}>Vendor & Contact</th>
                            <th style={styles.th}>Vendor Rate</th><th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    {/* <tbody>
                        {pipelineCandidates.map((c, i) => (
                            
                            <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
                                <td style={styles.td}><b>{c.candidate_name}</b></td>
                                <td style={styles.td} title={c.technology}>{truncate(c.technology, 100)}</td>
                                <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
                                <td style={styles.td}>{c.client || "N/A"}</td>
                                <td style={styles.td}><b>{truncate(c.vendor, 15)}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
                                <td style={styles.td}>₹{c.vendor_rate} {c.vendor_rate_type || ""}</td>
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
                    </tbody> */}

                    <tbody>
                        {pipelineCandidates.map((c, i) => {
                            // Status ke base par style nikal rahe hain
                            const statusStyle = getStatusStyles(c.main_status);
                            
                            return (
                                <tr 
                                    key={i} 
                                    // Row ka background color dynamic kar diya
                                    style={{ ...styles.tableRow, backgroundColor: statusStyle.bg }} 
                                    onClick={() => navigate(`/employee/candidate/view/${c.id}`)}
                                >
                                    <td style={styles.td}><b>{c.candidate_name}</b></td>
                                    <td style={styles.td} title={c.technology}>{truncate(c.technology, 100)}</td>
                                    <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
                                    <td style={styles.td}>{c.client || "N/A"}</td>
                                    <td style={styles.td}>
                                        <b>{truncate(c.vendor, 15)}</b><br/>
                                        <small style={styles.subStatus}>{c.vendor_number || "N/A"}</small>
                                    </td>
                                    <td style={styles.td}>₹{c.vendor_rate} {c.vendor_rate_type || ""}</td>
                                    <td style={styles.td}>
                                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                            {/* Badge ka text color bhi status ke hisaab se dark rakha hai */}
                                            <span style={{...styles.badge, color: statusStyle.text, fontWeight: '800'}}>
                                                {c.main_status}
                                            </span>
                                            {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
                                        </div>
                                        {/* Sub status ka text color change kiya */}
                                        <small style={{ ...styles.subStatus, color: statusStyle.text, fontWeight: '700' }}>
                                            {c.sub_status}
                                        </small>
                                    </td>
                                    <td style={styles.td}>
                                        <button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}>
                                            <Icons.Edit />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Section>

            {/* <Section title="Submitted Profiles Table">
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
                            <th style={styles.th}>Client</th><th style={styles.th}>Vendor & Contact</th>
                            <th style={styles.th}>Vendor Rate</th><th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
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
                                <td style={styles.td}>₹{c.vendor_rate} {c.vendor_rate_type || ""}</td>
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
            </Section> */}

            <Section title="Submitted Profiles Table">
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
                            <th style={styles.th}>Client</th><th style={styles.th}>Vendor & Contact</th>
                            <th style={styles.th}>Vendor Rate</th><th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {verifiedCandidates.map((c, i) => {
                            // Status ke hisaab se styles nikal rahe hain
                            const statusStyle = getStatusStyles(c.main_status);

                            return (
                                <tr 
                                    key={i} 
                                    // Row ka background color change kiya
                                    style={{ ...styles.tableRow, backgroundColor: statusStyle.bg }} 
                                    onClick={() => navigate(`/employee/candidate/view/${c.id}`)}
                                >
                                    <td style={styles.td}><b>{c.candidate_name}</b></td>
                                    <td style={styles.td}>{truncate(c.technology, 100)}</td>
                                    <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
                                    <td style={styles.td}>{c.client || "N/A"}</td>
                                    <td style={styles.td}>
                                        <b>{truncate(c.vendor, 15)}</b><br/>
                                        <small style={styles.subStatus}>{c.vendor_number || "N/A"}</small>
                                    </td>
                                    <td style={styles.td}>₹{c.vendor_rate} {c.vendor_rate_type || ""}</td>
                                    <td style={styles.td}>
                                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                            {/* Badge ka color dynamic kiya */}
                                            <span style={{...styles.badge, background: 'rgba(0,0,0,0.05)', color: statusStyle.text, fontWeight: '800'}}>
                                                {c.main_status}
                                            </span>
                                            {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
                                        </div>
                                        {/* Sub status ka text color dynamic kiya */}
                                        <small style={{ ...styles.subStatus, color: statusStyle.text, fontWeight: '700' }}>
                                            {c.sub_status}
                                        </small>
                                    </td>
                                    <td style={styles.td}>
                                        <button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}>
                                            <Icons.Edit />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Section>

            <Section title="Today's Team Submissions">
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>Submitted By</th><th style={styles.th}>Candidate</th>
                            <th style={styles.th}>Tech</th><th style={styles.th}>Exp</th><th style={styles.th}>Client</th>
                            <th style={styles.th}>Vendor & Contact</th><th style={styles.th}>Vendor Rate</th>
                            <th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teamSubmissions.length > 0 ? teamSubmissions.map((c, i) => (
                            <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
                                <td style={styles.td}>{c.created_by_name}</td>
                                <td style={styles.td}><b>{c.candidate_name}</b></td>
                                <td style={styles.td}>{truncate(c.technology, 100)}</td>
                                <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
                                <td style={styles.td}>{c.client || "N/A"}</td>
                                <td style={styles.td}><b>{truncate(c.vendor, 15)}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
                                <td style={styles.td}>₹{c.vendor_rate} {c.vendor_rate_type || ""}</td>
                                <td style={styles.td}>
                                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                        <span style={{...styles.badge, background:'#E3F2FD', color:'#1976D2'}}>{c.main_status}</span>
                                        {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
                                    </div>
                                    <small style={styles.subStatus}>{c.sub_status}</small>
                                </td>
                            

                                <td style={styles.td}>
                                    <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                                        <button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button>
                                        
                                        {/* Sirf ye logic check karega ki client assigned hai ya nahi */}
                                        {!c.client ? (
                                            <button 
                                                style={styles.submitBtn} 
                                                onClick={(e) => handleTeamSubmitClick(e, c)}
                                            >
                                                Submit to Client
                                            </button>
                                        ) : (
                                            <span style={{color:'#27AE60', fontWeight:'700', fontSize:'11px', whiteSpace:'nowrap'}}>
                                                ✓ Submitted to Client
                                            </span>
                                        )}
                                    </div>
                                </td>

                            </tr>
                        )) : <tr><td colSpan="9" style={{textAlign:'center', padding:'20px'}}>No team submissions found.</td></tr>}
                    </tbody>
                </table>
            </Section>

            <Section title="Today's New Profiles">
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
                            <th style={styles.th}>Client</th><th style={styles.th}>Vendor & Contact</th>
                            <th style={styles.th}>Vendor Rate</th><th style={styles.th}>Action</th>
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
                                <td style={styles.td}>₹{c.vendor_rate} {c.vendor_rate_type || ""}</td>
                                <td style={styles.td}>
                                    {!c.verification_status ? (
                                        <button style={styles.submitBtn} onClick={(e) => handleSubmitClick(e, c)}>Submit</button>
                                    ) : <span style={{color:'#27AE60', fontWeight:'700', fontSize:'12px'}}>✓ Submitted</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* MODALS */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={{color:'#25343F', marginBottom:'20px'}}>Update Status</h3>
                        <div style={styles.inputGroup}>
                            <label style={styles.modalLabel}>Main Status</label>
                            <select style={styles.select} value={editForm.main_status} onChange={e => setEditForm({...editForm, main_status: e.target.value})}>
                                <option value="SUBMITTED">Submitted</option><option value="SCREENING">Screening</option>
                                <option value="L1">L1</option><option value="L2">L2</option><option value="L3">L3</option>
                                <option value="OTHER">Other</option><option value="OFFERED">Offered</option>
                                <option value="ONBORD">Onbord</option><option value="ON_HOLD">On Hold</option>
                                <option value="REJECTED">Rejected</option><option value="WITHDRAWN">Withdrawn</option>
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.modalLabel}>Sub Status</label>
                            <select style={styles.select} value={editForm.sub_status} onChange={e => setEditForm({...editForm, sub_status: e.target.value})}>
                                <option value="NONE">None</option><option value="SCHEDULED">Scheduled</option>
                                <option value="COMPLETED">Completed</option><option value="FEEDBACK_PENDING">Feedback Pending</option>
                                <option value="CLEARED">Cleared</option><option value="REJECTED">Rejected</option>
                                <option value="ON_HOLD">On Hold</option><option value="POSTPONED">Postponed</option>
                                <option value="NO_SHOW">No Show</option><option value="INTERVIEW_PENDING">Interview Pending</option>
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

            {/* ONLY CLIENT SUBMISSION MODAL */}

                {showClientSubmitModal && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modalContent}>
                            <h3 style={{color:'#25343F', marginBottom:'10px'}}>Submit to Client</h3>
                            <p style={{fontSize:'12px', color:'#7F8C8D', marginBottom:'15px'}}>Choose the client for final submission.</p>

                            <div style={styles.inputGroup}>
                                <label style={styles.modalLabel}>Search & Select Client</label>
                                <input 
                                    type="text" 
                                    placeholder="Search client name..." 
                                    style={{...styles.select, marginBottom:'10px'}} 
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <select 
                                    style={{...styles.select, height:'150px'}} 
                                    size="5" 
                                    value={submitData.target_id} 
                                    onChange={(e) => setSubmitData({target_id: e.target.value})}
                                >
                                    <option value="">-- Select Client --</option>
                                    {clientsList.map((item) => {
                                        const displayName = item.company_name || item.client_name || "N/A";
                                        if (displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
                                            return (
                                                <option key={item.id} value={item.id}>
                                                    {displayName}
                                                </option>
                                            );
                                        }
                                        return null;
                                    })}
                                </select>

                                <div style={styles.inputGroup}>
                                    <label style={styles.modalLabel}>Client Rate</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        style={styles.select}
                                        value={submitData.client_rate}
                                        onChange={(e) =>
                                            setSubmitData({ ...submitData, client_rate: e.target.value })
                                        }
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.modalLabel}>Client Rate Type</label>
                                    <select
                                        required
                                        style={styles.select}
                                        value={submitData.client_rate_type}
                                        onChange={(e) =>
                                            setSubmitData({ ...submitData, client_rate_type: e.target.value })
                                        }
                                    >
                                        <option value="">Select Type</option>
                                        <option value="LPM">LPM</option>
                                        <option value="KPM">KPM</option>
                                        <option value="PHR">PHR</option>
                                        <option value="LPA">LPA</option>
                                    </select>
                                </div>

                            </div>

                            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                                <button style={styles.saveBtn} onClick={handleFinalSubmission}>Submit to Client</button>
                                <button style={styles.cancelBtn} onClick={() => setShowClientSubmitModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

            {showSubmitModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={{color:'#25343F', marginBottom:'10px'}}>Complete Submission</h3>
                        <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                            <button style={{...styles.typeBtn, border: submitType === 'INTERNAL' ? '2px solid #FF9B51' : '1px solid #ddd'}} onClick={() => { setSubmitType('INTERNAL'); setSubmitData({target_id: ""}); }}>Internal Team</button>
                            <button style={{...styles.typeBtn, border: submitType === 'CLIENT' ? '2px solid #FF9B51' : '1px solid #ddd'}} onClick={() => { setSubmitType('CLIENT'); setSubmitData({target_id: ""}); }}>Client</button>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.modalLabel}>Search & Select</label>
                            <input type="text" placeholder="Search here..." style={{...styles.select, marginBottom:'10px'}} onChange={(e) => setSearchTerm(e.target.value)} />
                            <select 
                                style={{...styles.select, height:'150px'}} 
                                size="5" 
                                value={submitData.target_id} 
                                onChange={(e) => setSubmitData({target_id: e.target.value})}
                            >
                                <option value="">-- Select --</option>
                                {(submitType === 'INTERNAL' ? employees : clientsList).map((item) => {
                                    const displayName = submitType === 'INTERNAL' 
                                        ? `${item.first_name || ''} ${item.last_name || ''}`.trim()
                                        : (item.company_name || item.client_name || "N/A");

                                    if (displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
                                        return (
                                            <option key={item.id} value={item.id}>
                                                {displayName}
                                            </option>
                                        );
                                    }
                                    return null;
                                })}
                            </select>
                            {submitType === "CLIENT" && (
                                    <>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.modalLabel}>Client Rate</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                style={styles.select}
                                                value={submitData.client_rate}
                                                onChange={(e) =>
                                                    setSubmitData({ ...submitData, client_rate: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div style={styles.inputGroup}>
                                            <label style={styles.modalLabel}>Client Rate Type</label>
                                            <select
                                                style={styles.select}
                                                value={submitData.client_rate_type}
                                                onChange={(e) =>
                                                    setSubmitData({ ...submitData, client_rate_type: e.target.value })
                                                }
                                            >
                                                <option value="">Select Type</option>
                                                <option value="LPM">LPM</option>
                                                <option value="KPM">KPM</option>
                                                <option value="PHR">PHR</option>
                                                <option value="LPA">LPA</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                        </div>

                        <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                            <button style={styles.saveBtn} onClick={handleFinalSubmission}>Confirm Submission</button>
                            <button style={styles.cancelBtn} onClick={() => setShowSubmitModal(false)}>Cancel</button>
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
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "15px", marginBottom: "30px", overflowX: "auto", paddingBottom: "10px" },
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
    tableRow: { borderBottom: "1.9px solid #d1d5da", transition: "0.2s" },
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
    cancelBtn: { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },
    typeBtn: { flex: 1, padding: '10px', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
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
//     Client: () => (
//         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
//             <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
//         </svg>
//     ),
//     Vendor: () => (
//         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
//         <circle cx="18" cy="8" r="3"/><path d="M18 11v5"/>
//     </svg>
//     ),
//     Pipeline: () => (
//         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
//         </svg>
//     ),
//     Send: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
//     Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
//     Remark: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9B51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
// };

// function EmployeeDashboard() {
//     const navigate = useNavigate();
    
//     // --- ALL STATES AT TOP ---
//     const [stats, setStats] = useState({});
//     const [todayCandidates, setTodayCandidates] = useState([]);
//     const [verifiedCandidates, setVerifiedCandidates] = useState([]);
//     const [pipelineCandidates, setPipelineCandidates] = useState([]);
//     const [teamSubmissions, setTeamSubmissions] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [toast, setToast] = useState({ show: false, msg: "", type: "" });

//     const [showClientSubmitModal, setShowClientSubmitModal] = useState(false);
    
//     // Modal & Selection States
//     const [showModal, setShowModal] = useState(false);
//     const [showSubmitModal, setShowSubmitModal] = useState(false);
//     const [selectedCand, setSelectedCand] = useState(null);
//     const [editForm, setEditForm] = useState({ main_status: "", sub_status: "", remark: "" });
    
//     const [submitType, setSubmitType] = useState("INTERNAL"); 
//     const [employees, setEmployees] = useState([]);
//     const [clientsList, setClientsList] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [submitData, setSubmitData] = useState({ target_id: "" });

//     // --- DATA FETCHING ---
//     const fetchAllData = async () => {
//         try {
//             const [sData, tData, vData, pData, teamData] = await Promise.all([
//                 apiRequest("/employee-portal/dashboard/stats/"),
//                 apiRequest("/employee-portal/dashboard/today-candidates/"),
//                 apiRequest("/employee-portal/dashboard/today-verified-candidates/"),
//                 apiRequest("/employee-portal/dashboard/active-pipeline-candidates/"),
//                 apiRequest("/employee-portal/dashboard/team/today-submissions/")
//             ]);
//             setStats(sData);
//             setTodayCandidates(tData);
//             setVerifiedCandidates(vData);
//             setPipelineCandidates(pData);
//             setTeamSubmissions(teamData);
//         } catch (err) { notify("Failed to load dashboard data", "error"); }
//         finally { setLoading(false); }
//     };

//     const fetchDropdowns = async () => {
//     try {
//         const [empData, clientData] = await Promise.all([
//             apiRequest("/employee-portal/api/employees/"),
//             apiRequest("/employee-portal/clients/list/")
//         ]);

//         // Employee list direct array hai
//         setEmployees(Array.isArray(empData) ? empData : []);

//         // Client list mein data "results" key ke andar hai
//         if (clientData && clientData.results) {
//             setClientsList(clientData.results);
//         } else {
//             setClientsList(Array.isArray(clientData) ? clientData : []);
//         }
//     } catch (err) { 
//         console.error("Dropdown loading failed"); 
//         setEmployees([]);
//         setClientsList([]);
//     }
//     };

//     useEffect(() => { 
//         fetchAllData(); 
//         fetchDropdowns(); 
//     }, []);

//     // --- HANDLERS ---
//     const notify = (msg, type = "success") => {
//         setToast({ show: true, msg, type });
//         setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
//     };

//     const handleEditClick = (e, candidate) => {
//         e.stopPropagation();
//         setSelectedCand(candidate);
//         setEditForm({ main_status: candidate.main_status, sub_status: candidate.sub_status, remark: candidate.remark || "" });
//         setShowModal(true);
//     };

//     const handleTeamSubmitClick = (e, candidate) => {
//     e.stopPropagation();
//     setSelectedCand(candidate);
//     setSubmitData({ target_id: "" });
//     setSubmitType("CLIENT"); 
//     setSearchTerm("");
//     setShowClientSubmitModal(true);
//     };

//     const handleUpdateSubmit = async () => {
//         try {
//             await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", editForm);
//             notify("Status updated successfully!");
//             setShowModal(false);
//             fetchAllData();
//         } catch (err) { notify("Update failed", "error"); }
//     };


//     const handleSubmitClick = (e, candidate) => {
//         e.stopPropagation();
//         setSelectedCand(candidate);
//         setSubmitData({ target_id: "" });
//         setSubmitType("INTERNAL");
//         setSearchTerm("");
//         setShowSubmitModal(true);
//     };


//     const handleFinalSubmission = async () => {
//     if (!submitData.target_id) return notify("Please select a target", "error");

//     // Naya dynamic payload logic
//     const payload = {
//         verification_status: true,
//     };

//     if (submitType === "INTERNAL") {
//         payload.submitted_to = submitData.target_id;
//         payload.client = null; // Internal submission hai toh client clear kar sakte hain
//     } else if (submitType === "CLIENT") {
//         payload.client = submitData.target_id;
//         // YAHAN DHAYAN DEIN: Humne submitted_to ko payload mein dala hi nahi, 
//         // taaki purana employee name delete na ho.
//     }

//     try {
//         await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", payload);
//         notify("Profile submitted successfully!");
//         setShowSubmitModal(false);
//         setShowClientSubmitModal(false); // Dono modals close karein
//         fetchAllData(); 
//     } catch (err) { notify("Submission failed", "error"); }
// };

//     const truncate = (text, limit) => (text?.length > limit ? text.substring(0, limit) + "..." : text);

//     if (loading) return <BaseLayout><div style={styles.loading}>Loading Dashboard...</div></BaseLayout>;

//     return (
//         <BaseLayout>
//             {toast.show && (
//                 <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#E74C3C' : '#27AE60'}}>
//                     {toast.msg}  
//                 </div>
//             )}

//             <div style={styles.header}>
//                 <div>
//                     <h2 style={styles.welcome}>Welcome, {stats.user_name || "Recruiter"}</h2>
//                     <p style={styles.subText}>Here is your recruitment pipeline overview for today.</p>
//                 </div>
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
//                     <div key={i} style={{ ...styles.statCard, cursor: "pointer" }} onClick={() => navigate(s.url)}>
//                         <div>
//                             <p style={styles.statLabel}>{s.label}</p>
//                             <h3 style={{ ...styles.statValue, color: s.col }}>{s.val || 0}</h3>
//                         </div>
//                         <div style={{...styles.iconCircle, color: s.col, backgroundColor: s.col === '#FF9B51' ? 'rgba(255,155,81,0.1)' : 'rgba(37,52,63,0.05)'}}>
//                             {s.icon}
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             <Section title="Active Pipeline Candidates">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th><th style={styles.th}>Vendor & Contact</th>
//                             <th style={styles.th}>Vendor Rate</th><th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {pipelineCandidates.map((c, i) => (
//                             <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                 <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                 <td style={styles.td} title={c.technology}>{truncate(c.technology, 100)}</td>
//                                 <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                 <td style={styles.td}>{c.client || "N/A"}</td>
//                                 <td style={styles.td}><b>{truncate(c.vendor, 15)}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
//                                 <td style={styles.td}>₹{c.vendor_rate}</td>
//                                 <td style={styles.td}>
//                                     <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
//                                         <span style={styles.badge}>{c.main_status}</span>
//                                         {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
//                                     </div>
//                                     <small style={styles.subStatus}>{c.sub_status}</small>
//                                 </td>
//                                 <td style={styles.td}><button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button></td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>

//             <Section title="Submitted Profiles Table">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th><th style={styles.th}>Vendor & Contact</th>
//                             <th style={styles.th}>Vendor Rate</th><th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {verifiedCandidates.map((c, i) => (
//                             <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                 <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                 <td style={styles.td}>{truncate(c.technology, 100)}</td>
//                                 <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                 <td style={styles.td}>{c.client || "N/A"}</td>
//                                 <td style={styles.td}><b>{truncate(c.vendor, 15)}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
//                                 <td style={styles.td}>₹{c.vendor_rate}</td>
//                                 <td style={styles.td}>
//                                     <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
//                                         <span style={{...styles.badge, background:'#E3F2FD', color:'#1976D2'}}>{c.main_status}</span>
//                                         {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
//                                     </div>
//                                     <small style={styles.subStatus}>{c.sub_status}</small>
//                                 </td>
//                                 <td style={styles.td}><button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button></td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>

//             <Section title="Today's Team Submissions">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Submitted By</th><th style={styles.th}>Candidate</th>
//                             <th style={styles.th}>Tech</th><th style={styles.th}>Exp</th><th style={styles.th}>Client</th>
//                             <th style={styles.th}>Vendor & Contact</th><th style={styles.th}>Vendor Rate</th>
//                             <th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {teamSubmissions.length > 0 ? teamSubmissions.map((c, i) => (
//                             <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                 <td style={styles.td}>{c.created_by_name}</td>
//                                 <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                 <td style={styles.td}>{truncate(c.technology, 100)}</td>
//                                 <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                 <td style={styles.td}>{c.client || "N/A"}</td>
//                                 <td style={styles.td}><b>{truncate(c.vendor, 15)}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
//                                 <td style={styles.td}>₹{c.vendor_rate}</td>
//                                 <td style={styles.td}>
//                                     <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
//                                         <span style={{...styles.badge, background:'#E3F2FD', color:'#1976D2'}}>{c.main_status}</span>
//                                         {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
//                                     </div>
//                                     <small style={styles.subStatus}>{c.sub_status}</small>
//                                 </td>
//                                 <td style={styles.td}><button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button></td>
//                                 <td style={styles.td}>
//     <button 
//         style={styles.submitBtn} 
//         onClick={(e) => handleTeamSubmitClick(e, c)}
//     >
//         Submit to Client
//     </button>
// </td>
//                             </tr>
//                         )) : <tr><td colSpan="9" style={{textAlign:'center', padding:'20px'}}>No team submissions found.</td></tr>}
//                     </tbody>
//                 </table>
//             </Section>

//             <Section title="Today's New Profiles">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th><th style={styles.th}>Vendor & Contact</th>
//                             <th style={styles.th}>Vendor Rate</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {todayCandidates.map((c, i) => (
//                             <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                 <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                 <td style={styles.td}>{truncate(c.technology, 100)}</td>
//                                 <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                 <td style={styles.td}>{c.client || "N/A"}</td>
//                                 <td style={styles.td}><b>{truncate(c.vendor, 15)}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
//                                 <td style={styles.td}>₹{c.vendor_rate}</td>
//                                 <td style={styles.td}>
//                                     {!c.verification_status ? (
//                                         <button style={styles.submitBtn} onClick={(e) => handleSubmitClick(e, c)}>Submit</button>
//                                     ) : <span style={{color:'#27AE60', fontWeight:'700', fontSize:'12px'}}>✓ Submitted</span>}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>

//             {/* MODALS */}
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
//                                 <option value="NONE">None</option><option value="SCHEDULED">Scheduled</option>
//                                 <option value="COMPLETED">Completed</option><option value="FEEDBACK_PENDING">Feedback Pending</option>
//                                 <option value="CLEARED">Cleared</option><option value="REJECTED">Rejected</option>
//                                 <option value="ON_HOLD">On Hold</option><option value="POSTPONED">Postponed</option>
//                                 <option value="NO_SHOW">No Show</option><option value="INTERVIEW_PENDING">Interview Pending</option>
//                             </select>
//                         </div>
//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Remark</label>
//                             <textarea style={styles.textarea} value={editForm.remark} onChange={e => setEditForm({...editForm, remark: e.target.value})} placeholder="Internal notes..." />
//                         </div>
//                         <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
//                             <button style={styles.saveBtn} onClick={handleUpdateSubmit}>Save Changes</button>
//                             <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* ONLY CLIENT SUBMISSION MODAL */}
// {showClientSubmitModal && (
//     <div style={styles.modalOverlay}>
//         <div style={styles.modalContent}>
//             <h3 style={{color:'#25343F', marginBottom:'10px'}}>Submit to Client</h3>
//             <p style={{fontSize:'12px', color:'#7F8C8D', marginBottom:'15px'}}>Choose the client for final submission.</p>

//             <div style={styles.inputGroup}>
//                 <label style={styles.modalLabel}>Search & Select Client</label>
//                 <input 
//                     type="text" 
//                     placeholder="Search client name..." 
//                     style={{...styles.select, marginBottom:'10px'}} 
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//                 <select 
//                     style={{...styles.select, height:'150px'}} 
//                     size="5" 
//                     value={submitData.target_id} 
//                     onChange={(e) => setSubmitData({target_id: e.target.value})}
//                 >
//                     <option value="">-- Select Client --</option>
//                     {clientsList.map((item) => {
//                         const displayName = item.company_name || item.client_name || "N/A";
//                         if (displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
//                             return (
//                                 <option key={item.id} value={item.id}>
//                                     {displayName}
//                                 </option>
//                             );
//                         }
//                         return null;
//                     })}
//                 </select>
//             </div>

//             <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
//                 <button style={styles.saveBtn} onClick={handleFinalSubmission}>Submit to Client</button>
//                 <button style={styles.cancelBtn} onClick={() => setShowClientSubmitModal(false)}>Cancel</button>
//             </div>
//         </div>
//     </div>
// )}

//             {showSubmitModal && (
//                 <div style={styles.modalOverlay}>
//                     <div style={styles.modalContent}>
//                         <h3 style={{color:'#25343F', marginBottom:'10px'}}>Complete Submission</h3>
//                         <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
//                             <button style={{...styles.typeBtn, border: submitType === 'INTERNAL' ? '2px solid #FF9B51' : '1px solid #ddd'}} onClick={() => { setSubmitType('INTERNAL'); setSubmitData({target_id: ""}); }}>Internal Team</button>
//                             <button style={{...styles.typeBtn, border: submitType === 'CLIENT' ? '2px solid #FF9B51' : '1px solid #ddd'}} onClick={() => { setSubmitType('CLIENT'); setSubmitData({target_id: ""}); }}>Client</button>
//                         </div>

//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Search & Select</label>
//                             <input type="text" placeholder="Search here..." style={{...styles.select, marginBottom:'10px'}} onChange={(e) => setSearchTerm(e.target.value)} />
//                             <select 
//                                 style={{...styles.select, height:'150px'}} 
//                                 size="5" 
//                                 value={submitData.target_id} 
//                                 onChange={(e) => setSubmitData({target_id: e.target.value})}
//                             >
//                                 <option value="">-- Select --</option>
//                                 {(submitType === 'INTERNAL' ? employees : clientsList).map((item) => {
//                                     const displayName = submitType === 'INTERNAL' 
//                                         ? `${item.first_name || ''} ${item.last_name || ''}`.trim()
//                                         : (item.company_name || item.client_name || "N/A");

//                                     if (displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
//                                         return (
//                                             <option key={item.id} value={item.id}>
//                                                 {displayName}
//                                             </option>
//                                         );
//                                     }
//                                     return null;
//                                 })}
//                             </select>
//                         </div>

//                         <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
//                             <button style={styles.saveBtn} onClick={handleFinalSubmission}>Confirm Submission</button>
//                             <button style={styles.cancelBtn} onClick={() => setShowSubmitModal(false)}>Cancel</button>
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
//     btnGroup: { display: "flex", gap: "10px", alignItems: "center"},
//     welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
//     subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
//     actionBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", boxShadow: "0 4px 10px rgba(255,155,81,0.2)" },
//     statsGrid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "15px", marginBottom: "30px", overflowX: "auto", paddingBottom: "10px" },
//     statCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4" },
//     statLabel: { margin: 0, color: "#7F8C8D", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" },
//     statValue: { margin: "4px 0", fontSize: "24px", fontWeight: "800" },
//     iconCircle: { width: "44px", height: "44px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
//     sectionContainer: { marginBottom: "35px" },
//     sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
//     sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #FF9B51", paddingLeft: "12px" },
//     tableWrapper: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
//     th: { padding: "14px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
//     tableRow: { borderBottom: "1.9px solid #d1d5da", transition: "0.2s" },
//     td: { padding: "14px 18px", fontSize: "14px", color: "#334155" },
//     badge: { background: "rgba(255, 155, 81, 0.12)", color: "#FF9B51", padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//     subStatus: { fontSize: '12px', color: '#7f8c8d', display: 'block' },
//     remarkIcon: { display: 'flex', cursor: 'help', padding: '4px', borderRadius: '4px', background: '#FFF5EB' },
//     editBtn: { border: 'none', background: '#F1F5F9', padding: '6px', borderRadius: '6px', cursor: 'pointer' },
//     submitBtn: { background: '#25343F', color: '#fff', border: 'none', padding: '6px 15px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '12px' },
//     modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' },
//     modalContent: { background: '#fff', padding: '30px', borderRadius: '15px', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' },
//     inputGroup: { marginBottom: '15px' },
//     modalLabel: { fontSize: '11px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '5px', textTransform: 'uppercase' },
//     select: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' },
//     textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', height: '80px', resize: 'none' },
//     saveBtn: { flex: 1, background: '#FF9B51', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },
//     cancelBtn: { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },
//     typeBtn: { flex: 1, padding: '10px', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
// };

// export default EmployeeDashboard;











// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import BaseLayout from "../components/emp_base";
// import { apiRequest } from "../../services/api";

// const Icons = {
//     UserPlus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>,
//     Users: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
//     Buildings: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="10" width="20" height="12" rx="2"/><path d="M7 10V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6"/></svg>,

//     Client: () => (
//         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
//             <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
//         </svg>
//     ),

//     Vendor: () => (
//         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
//         <circle cx="18" cy="8" r="3"/><path d="M18 11v5"/>
//     </svg>
//     ),

//     Pipeline: () => (
//         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
//         </svg>
//     ),

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
//     const [loading, setLoading] = useState(true);
//     const [toast, setToast] = useState({ show: false, msg: "", type: "" });
    

//     // Modal States
//     const [showModal, setShowModal] = useState(false);
//     const [selectedCand, setSelectedCand] = useState(null);
//     const [editForm, setEditForm] = useState({ main_status: "", sub_status: "", remark: "" });

//     const fetchAllData = async () => {
//         try {
//             const [sData, tData, vData, pData,teamData] = await Promise.all([
//                 apiRequest("/employee-portal/dashboard/stats/"),
//                 apiRequest("/employee-portal/dashboard/today-candidates/"),
//                 apiRequest("/employee-portal/dashboard/today-verified-candidates/"),
//                 apiRequest("/employee-portal/dashboard/active-pipeline-candidates/"),
//                 apiRequest("/employee-portal/dashboard/team/today-submissions/")
//             ]);
//             setStats(sData);
//             setTodayCandidates(tData);
//             setVerifiedCandidates(vData);
//             setPipelineCandidates(pData);
//             setTeamSubmissions(teamData);
//         } catch (err) { notify("Failed to load dashboard data", "error"); }
//         finally { setLoading(false); }
//     };

//     useEffect(() => { fetchAllData(); }, []);

//     const notify = (msg, type = "success") => {
//         setToast({ show: true, msg, type });
//         setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
//     };

//     const handleEditClick = (e, candidate) => {
//         e.stopPropagation();
//         setSelectedCand(candidate);
//         setEditForm({ main_status: candidate.main_status, sub_status: candidate.sub_status, remark: candidate.remark || "" });
//         setShowModal(true);
//     };

//     const handleUpdateSubmit = async () => {
//         try {
//             await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", editForm);
//             notify("Status updated successfully!");
//             setShowModal(false);
//             fetchAllData();
//         } catch (err) { notify("Update failed", "error"); }
//     };

//     // const handleVerify = async (e, id) => {
//     //     e.stopPropagation();
//     //     try {
//     //         await apiRequest(`/employee-portal/candidates/${id}/update/`, "PUT", { verification_status: true });
//     //         notify("Candidate profile submitted!");
//     //         fetchAllData();
//     //     } catch (err) { notify("Submission failed", "error"); }
//     // };

//     // -=========================================================
//     const handleSubmitClick = (e, candidate) => {
//         e.stopPropagation();
//         setSelectedCand(candidate);
//         setSubmitData({ target_id: "" });
//         setShowSubmitModal(true);
//     };

//     const handleFinalSubmission = async () => {
//         if (!submitData.target_id) return notify("Please select a target", "error");

//         const payload = {
//             verification_status: true,
//             submitted_to: submitType === "INTERNAL" ? submitData.target_id : null,
//             client: submitType === "CLIENT" ? submitData.target_id : null
//         };

//         try {
//             await apiRequest(`/employee-portal/candidates/${selectedCand.id}/update/`, "PUT", payload);
//             notify("Profile submitted successfully!");
//             setShowSubmitModal(false);
//             fetchAllData(); // Refresh list
//         } catch (err) { notify("Submission failed", "error"); }
//     };

//     // ==================================================================
//     const truncate = (text, limit) => (text?.length > limit ? text.substring(0, limit) + "..." : text);

//     // -------------------------------------------------------------------------------
//     // --- NAYE STATES ---
//     const [showSubmitModal, setShowSubmitModal] = useState(false);
//     const [submitType, setSubmitType] = useState("INTERNAL"); // INTERNAL ya CLIENT
//     const [employees, setEmployees] = useState([]);
//     const [clientsList, setClientsList] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [submitData, setSubmitData] = useState({ target_id: "" });

//     // Dropdown data fetch karne ke liye function
//     const fetchDropdowns = async () => {
//         try {
//             const [empData, clientData] = await Promise.all([
//                 apiRequest("/employee-portal/api/employees/"),
//                 apiRequest("/employee-portal/clients/list/")
//             ]);
//             setEmployees(empData);
//             setClientsList(clientData);
//         } catch (err) { console.error("Dropdown loading failed"); }
//     };

//     // fetchAllData ke saath isse bhi call karein
//     useEffect(() => { 
//         fetchAllData(); 
//         fetchDropdowns(); 
//     }, []);

//     // -------------------------------------------------

//     if (loading) return <BaseLayout><div style={styles.loading}>Loading Dashboard...</div></BaseLayout>;

//     return (
//         <BaseLayout>
//             {/* Toast Notification */}
//             {toast.show && (
//                 <div style={{...styles.toast, backgroundColor: toast.type === 'error' ? '#E74C3C' : '#27AE60'}}>
//                     {toast.msg}  
//                 </div>
//             )}


//             <div style={styles.header}>
//                 <div>
//                     <h2 style={styles.welcome}>Welcome, {stats.user_name || "Recruiter"}</h2>
//                     <p style={styles.subText}>Here is your recruitment pipeline overview for today.</p>
//                 </div>
                
//                 {/* Dono buttons ko is div ke andar rakhein taaki wo ek saath rahein */}
//                 <div style={styles.btnGroup}>
//                     <button style={styles.actionBtn} onClick={() => navigate("/employee/candidates/add")}>
//                         <Icons.UserPlus /> Add Profile
//                     </button>

//                     <button style={styles.actionBtn} onClick={() => navigate("/employee/vendor/add")}>
//                         <Icons.UserPlus /> Add Vendor
//                     </button>
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
//                     <div
//                         key={i}
//                         style={{ ...styles.statCard, cursor: "pointer" }}
//                         onClick={() => navigate(s.url)}
//                     >
//                         <div>
//                             <p style={styles.statLabel}>{s.label}</p>
//                             <h3 style={{ ...styles.statValue, color: s.col }}>{s.val || 0}</h3>
//                         </div>
//                         <div
//                             style={{
//                                 ...styles.iconCircle,
//                                 color: s.col,
//                                 backgroundColor: s.col === '#FF9B51'
//                                     ? 'rgba(255,155,81,0.1)'
//                                     : 'rgba(37,52,63,0.05)'
//                             }}
//                         >
//                             {s.icon}
//                         </div>
//                     </div>
//                 ))}
//             </div>


//             {/* Table 1: Active Pipelines */}
//             <Section title="Active Pipeline Candidates">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th>
//                             <th style={styles.th}>Vendor & Contact</th>
//                             <th style={styles.th}>Vendor Rate</th>
//                             <th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {pipelineCandidates.map((c, i) => (
//                             <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                 <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                 <td style={styles.td} title={c.technology}>{truncate(c.technology, 100)}</td>
//                                 <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                 <td style={styles.td}>{c.client || "N/A"}</td>
//                                 <td style={styles.td}><b>{truncate(c.vendor, 15)}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
//                                 <td style={styles.td}>₹{c.vendor_rate}</td>
//                                 <td style={styles.td}>
//                                     <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
//                                         <span style={styles.badge}>{c.main_status}</span>
//                                         {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
//                                     </div>
//                                     <small style={styles.subStatus}>{c.sub_status}</small>
//                                 </td>
//                                 <td style={styles.td}><button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button></td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>

//             {/* Table 2: Submitted Profiles */}
//             <Section title="Submitted Profiles Table">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th>
//                             <th style={styles.th}>Vendor & Contact</th>
//                             <th style={styles.th}>Vendor Rate</th>
                            
//                             <th style={styles.th}>Status & Remark</th><th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {verifiedCandidates.map((c, i) => (
//                             <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                 <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                 <td style={styles.td}>{truncate(c.technology, 100)}</td>
//                                 <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                 <td style={styles.td}>{c.client || "N/A"}</td>
//                                 <td style={styles.td}><b>{truncate(c.vendor, 15)}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
//                                 <td style={styles.td}>₹{c.vendor_rate}</td>
//                                 <td style={styles.td}>
                                    
//                                     <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
//                                         <span style={{...styles.badge, background:'#E3F2FD', color:'#1976D2'}}>{c.main_status}</span>
//                                         {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
//                                     </div>
//                                     <small style={styles.subStatus}>{c.sub_status}</small>
//                                 </td>
//                                 <td style={styles.td}><button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button></td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>

//             {/* Table 3: Today's Team Submissions */}
//             <Section title="Today's Team Submissions">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Submitted By</th>
//                             <th style={styles.th}>Candidate</th>
//                             <th style={styles.th}>Tech</th>
//                             <th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th>
//                             <th style={styles.th}>Vendor & Contact</th>
//                             <th style={styles.th}>Vendor Rate</th>
                            
//                             <th style={styles.th}>Status & Remark</th>
                            
//                             <th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {teamSubmissions.length > 0 ? (
//                             teamSubmissions.map((c, i) => (
//                                 <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                     <td style={styles.td}>{c.created_by_name}</td>
//                                 <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                 <td style={styles.td}>{truncate(c.technology, 100)}</td>
//                                 <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>
//                                 <td style={styles.td}>{c.client || "N/A"}</td>
//                                 <td style={styles.td}><b>{truncate(c.vendor, 15)}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
//                                 <td style={styles.td}>₹{c.vendor_rate}</td>
//                                 <td style={styles.td}>
                                    
//                                     <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
//                                         <span style={{...styles.badge, background:'#E3F2FD', color:'#1976D2'}}>{c.main_status}</span>
//                                         {c.remark && <div style={styles.remarkIcon} title={c.remark}><Icons.Remark /></div>}
//                                     </div>
//                                     <small style={styles.subStatus}>{c.sub_status}</small>
//                                 </td>
                                
//                                 <td style={styles.td}><button style={styles.editBtn} onClick={(e) => handleEditClick(e, c)}><Icons.Edit /></button></td>
//                             </tr>
                            
//                             ))
//                         ) : (
//                             <tr>
//                                 <td colSpan="6" style={{...styles.td, textAlign: 'center', padding: '30px', color: '#94A3B8'}}>
//                                     No team submissions found for today.
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </Section>

//             {/* Table 4: Today's New Profiles */}
//             <Section title="Today's New Profiles">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Candidate</th><th style={styles.th}>Tech</th><th style={styles.th}>Exp</th>
//                             <th style={styles.th}>Client</th>
//                             <th style={styles.th}>Vendor & Contact</th>
//                             <th style={styles.th}>Vendor Rate</th>
//                             <th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {todayCandidates.map((c, i) => (
//                             <tr key={i} style={styles.tableRow} onClick={() => navigate(`/employee/candidate/view/${c.id}`)}>
//                                 <td style={styles.td}><b>{c.candidate_name}</b></td>
//                                 <td style={styles.td}>{truncate(c.technology, 100)}</td>
//                                 <td style={styles.td}>{c.years_of_experience_manual || "0"} Yrs</td>

//                                 <td style={styles.td}>{c.client || "N/A"}</td>
//                                 <td style={styles.td}><b>{truncate(c.vendor, 15)}</b><br/><small style={styles.subStatus}>{c.vendor_number || "N/A"}</small></td>
//                                 <td style={styles.td}>₹{c.vendor_rate}</td>
//                                 {/* <td style={styles.td}>
//                                     {!c.verification_status ? (
//                                         <button style={styles.submitBtn} onClick={(e) => handleVerify(e, c.id)}>Submit</button>
//                                     ) : (
//                                         <span style={{color:'#27AE60', fontWeight:'700', fontSize:'12px'}}>✓ Submitted</span>
//                                     )}
//                                 </td> */}

//                                 <td style={styles.td}>
//                                     {!c.verification_status ? (
//                                         <button style={styles.submitBtn} onClick={(e) => handleSubmitClick(e, c)}>Submit</button>
//                                     ) : (
//                                         <span style={{color:'#27AE60', fontWeight:'700', fontSize:'12px'}}>✓ Submitted</span>
//                                     )}
//                                 </td>

//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>

            
//             {/* Update Modal */}
//             {showModal && (
//                 <div style={styles.modalOverlay}>
//                     <div style={styles.modalContent}>
//                         <h3 style={{color:'#25343F', marginBottom:'20px'}}>Update Status</h3>
//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Main Status</label>
//                             <select style={styles.select} value={editForm.main_status} onChange={e => setEditForm({...editForm, main_status: e.target.value})}>


//                                 <option value="SUBMITTED">Submitted</option>
//                                 <option value="SCREENING">Screening</option>
//                                 <option value="L1">L1</option>
//                                 <option value="L2">L2</option>
//                                 <option value="L3">L3</option>
//                                 <option value="OTHER">Other</option>
//                                 <option value="OFFERED">Offered</option>
//                                 <option value="ONBORD">Onbord</option>
//                                 <option value="ON_HOLD">On Hold</option>
//                                 <option value="REJECTED">Rejected</option>
//                                 <option value="WITHDRAWN">Withdrawn</option>

//                             </select>
//                         </div>
//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Sub Status</label>
//                             <select style={styles.select} value={editForm.sub_status} onChange={e => setEditForm({...editForm, sub_status: e.target.value})}>
//                                 {/* <option value="PENDING">PENDING</option><option value="DONE">DONE</option><option value="NONE">NONE</option> */}
                               
//                                 <option value="NONE">None</option>
//                                 <option value="SCHEDULED">Scheduled</option>
//                                 <option value="COMPLETED">Completed</option>
//                                 <option value="FEEDBACK_PENDING">Feedback Pending</option>
//                                 <option value="CLEARED">Cleared</option>
//                                 <option value="REJECTED">Rejected</option>
//                                 <option value="ON_HOLD">On Hold</option>
//                                 <option value="POSTPONED">Postponed</option>    
//                                 <option value="NO_SHOW">No Show</option>
                                
//                                 <option value="INTERVIEW_PENDING">Interview Pending</option>
                                
//                             </select>
//                         </div>
//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Remark</label>
//                             <textarea style={styles.textarea} value={editForm.remark} onChange={e => setEditForm({...editForm, remark: e.target.value})} placeholder="Internal notes..." />
//                         </div>
//                         <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
//                             <button style={styles.saveBtn} onClick={handleUpdateSubmit}>Save Changes</button>
//                             <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* SUBMISSION MODAL */}
//             {showSubmitModal && (
//                 <div style={styles.modalOverlay}>
//                     <div style={styles.modalContent}>
//                         <h3 style={{color:'#25343F', marginBottom:'10px'}}>Complete Submission</h3>
                        
//                         <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
//                             <button 
//                                 style={{...styles.typeBtn, border: submitType === 'INTERNAL' ? '2px solid #FF9B51' : '1px solid #ddd'}}
//                                 onClick={() => { setSubmitType('INTERNAL'); setSubmitData({target_id: ""}); }}
//                             >Internal Team</button>
//                             <button 
//                                 style={{...styles.typeBtn, border: submitType === 'CLIENT' ? '2px solid #FF9B51' : '1px solid #ddd'}}
//                                 onClick={() => { setSubmitType('CLIENT'); setSubmitData({target_id: ""}); }}
//                             >Client</button>
//                         </div>

//                         <div style={styles.inputGroup}>
//                             <label style={styles.modalLabel}>Search & Select</label>
//                             <input 
//                                 type="text" 
//                                 placeholder="Search here..." 
//                                 style={{...styles.select, marginBottom:'10px'}} 
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                             />
//                             <select 
//                                 style={{...styles.select, height:'150px'}} 
//                                 size="5"
//                                 value={submitData.target_id}
//                                 onChange={(e) => setSubmitData({target_id: e.target.value})}
//                             >
//                                 <option value="">-- Select --</option>
//                                 {(submitType === 'INTERNAL' ? employees : clientsList)
//                                     .filter(item => (item.name || item.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()))
//                                     .map(item => (
//                                         <option key={item.id} value={item.id}>{item.name || item.company_name}</option>
//                                     ))
//                                 }
//                             </select>
//                         </div>

//                         <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
//                             <button style={styles.saveBtn} onClick={handleFinalSubmission}>Confirm Submission</button>
//                             <button style={styles.cancelBtn} onClick={() => setShowSubmitModal(false)}>Cancel</button>
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
//     btnGroup: { display: "flex", gap: "10px", alignItems: "center"},
//     welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
//     subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
//     actionBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", boxShadow: "0 4px 10px rgba(255,155,81,0.2)" },
//     // statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" },
//     statsGrid: { 
//     display: "grid", 
//     // Desktop (badi screens) ke liye 6 columns, aur mobile ke liye automatic wrap
//     gridTemplateColumns: "repeat(6, 1fr)", 
//     gap: "15px", 
//     marginBottom: "30px",
//     // Agar screen choti ho toh cards overlap na ho, isliye horizontal scroll ya wrapping handle karein
//     overflowX: "auto", 
//     paddingBottom: "10px" 
// },
//     statCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4" },
//     statLabel: { margin: 0, color: "#7F8C8D", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" },
//     statValue: { margin: "4px 0", fontSize: "24px", fontWeight: "800" },
//     iconCircle: { width: "44px", height: "44px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
//     sectionContainer: { marginBottom: "35px" },
//     sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
//     sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #FF9B51", paddingLeft: "12px" },
//     tableWrapper: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
//     th: { padding: "14px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
//     tableRow: { borderBottom: "1.9px solid #d1d5da", transition: "0.2s" },
//     td: { padding: "14px 18px", fontSize: "14px", color: "#334155" },
//     badge: { background: "rgba(255, 155, 81, 0.12)", color: "#FF9B51", padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//     subStatus: { fontSize: '12px', color: '#7f8c8d', display: 'block' },
//     remarkIcon: { display: 'flex', cursor: 'help', padding: '4px', borderRadius: '4px', background: '#FFF5EB' },
//     editBtn: { border: 'none', background: '#F1F5F9', padding: '6px', borderRadius: '6px', cursor: 'pointer' },
//     submitBtn: { background: '#25343F', color: '#fff', border: 'none', padding: '6px 15px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '12px' },
//     modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' },
//     modalContent: { background: '#fff', padding: '30px', borderRadius: '15px', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' },
//     inputGroup: { marginBottom: '15px' },
//     modalLabel: { fontSize: '11px', fontWeight: '800', color: '#64748B', display: 'block', marginBottom: '5px', textTransform: 'uppercase' },
//     select: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' },
//     textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', height: '80px', resize: 'none' },
//     saveBtn: { flex: 1, background: '#FF9B51', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },
//     cancelBtn: { flex: 1, background: '#F1F5F9', color: '#64748B', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' },
//     typeBtn: { flex: 1, padding: '10px', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
// };

// export default EmployeeDashboard;

