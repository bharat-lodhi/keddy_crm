import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import BaseLayout from "../components/emp_base";

function CandidateList() {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [count, setCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    
    // Search aur Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [techFilter, setTechFilter] = useState("");

    useEffect(() => {
        fetchCandidates(currentPage, searchTerm, techFilter);
    }, [currentPage, searchTerm, techFilter]);

    const fetchCandidates = async (page, search, tech) => {
    setLoading(true);
    try {
        // Updated API endpoint
        let url = `/employee-portal/api/submitted-profiles/?page=${page}`;
        if (search) url += `&search=${search}`;
        if (tech) url += `&technology=${tech}`;

        const res = await apiRequest(url, "GET");

        // Kyunki API direct Array return kar rahi hai, hum seedha res set karenge
        // Agar pagination backend se missing hai, toh count ko array length se set karenge
        if (Array.isArray(res)) {
            setCandidates(res);
            setCount(res.length); 
        } else if (res.results) {
            // Backup case: agar kabhi results key mein aaye
            setCandidates(res.results);
            setCount(res.count || res.results.length);
        }
    } catch (err) {
        console.error("Error fetching candidates:", err);
        setCandidates([]); // Error pe list khali kar dein
    } finally {
        setLoading(false);
    }
};

    return (
        <BaseLayout>
            {/* Header Section */}
            <div style={styles.header}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
                    <h2 style={styles.title}>Candidates ({count})</h2>
                </div>
                <button onClick={() => navigate("/employee/candidates/add")} style={styles.addBtn}>+ Add Candidate</button>
            </div>

            {/* Filter Bar */}
            <div style={styles.filterBar}>
                <input 
                    placeholder="Search by name or email..." 
                    style={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <input 
                    placeholder="Filter by Tech (AI, ML, React...)" 
                    style={styles.filterInput}
                    value={techFilter}
                    onChange={(e) => setTechFilter(e.target.value)}
                />
            </div>

            {/* Candidates Table */}
            <div style={styles.tableCard}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Submitted To & Submitted By</th>
                            <th style={styles.th}>Candidate</th>
                            <th style={styles.th}>Tech / Skills</th>
                            <th style={styles.th}>Experience</th>
                            <th style={styles.th}>Vendor</th>
                            <th style={styles.th}>Resume</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>Loading candidates...</td></tr>
                        ) : candidates.map(can => (
                            <tr key={can.id} style={styles.tr}>
                                <td style={styles.td}>{can.submitted_to_name} & {can.created_by_name}</td>

                                <td style={styles.td}>
                                    <div style={{ fontWeight: "bold", color: "#25343F" }}>{can.candidate_name}</div>
                                    <div style={{ fontSize: "11px", color: "#666" }}>{can.candidate_email || "No Email"}</div>
                                </td>
                                <td style={styles.td}>
                                    <span style={styles.techBadge}>{can.technology || "N/A"}</span>
                                    <div style={styles.skillText}>{can.skills?.substring(0, 30)}...</div>
                                </td>
                                <td style={styles.td}>
                                    <div>Manual: {can.years_of_experience_manual}</div>
                                    <div style={{ fontSize: "11px", color: "#FF9B51" }}>System: {can.years_of_experience_calculated} yrs</div>
                                </td>
                                <td style={styles.td}>
                                    <div style={{fontWeight: "600"}}>{can.vendor_company_name}</div>
                                    <div style={{fontSize: "11px"}}>{can.vendor_name}</div>
                                </td>
                                
                                <td style={styles.td}>
                                    <a href={can.resume} target="_blank" rel="noreferrer" style={styles.resumeLink}>View Resume</a>
                                </td>
                                <td style={styles.td}>
                                    <button onClick={() => navigate(`/employee/candidate/view/${can.id}`)} style={styles.viewBtn}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div style={styles.pagination}>
                <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => p - 1)}
                    style={currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtn}
                >Previous</button>
                
                <span style={styles.pageInfo}>Page {currentPage} of {Math.ceil(count / 10)}</span>
                
                <button 
                    disabled={candidates.length < 10 && currentPage * 10 >= count} 
                    onClick={() => setCurrentPage(p => p + 1)}
                    style={candidates.length < 10 ? styles.pageBtnDisabled : styles.pageBtn}
                >Next</button>
            </div>
        </BaseLayout>
    );
}

const styles = {
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
    backBtn: { background: "#25343F", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer" },
    title: { margin: 0, color: "#25343F", fontWeight: "800" },
    addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" },
    filterBar: { display: "flex", gap: "15px", marginBottom: "20px" },
    searchInput: { flex: 2, padding: "12px", borderRadius: "10px", border: "1px solid #BFC9D1", outline: "none" },
    filterInput: { flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #BFC9D1", outline: "none" },
    tableCard: { background: "#fff", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
    tableHeader: { background: "#F5F7F9", borderBottom: "2px solid #EAEFEF" },
    th: { padding: "15px", fontSize: "13px", color: "#25343F", textTransform: "uppercase", fontWeight: "800" },
    tr: { borderBottom: "1px solid #F0F0F0", transition: "0.2s" },
    td: { padding: "15px", fontSize: "14px", verticalAlign: "top" },
    techBadge: { background: "#FFFBF8", color: "#FF9B51", padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "bold", border: "1px solid #FFE6D5" },
    skillText: { fontSize: "11px", color: "#888", marginTop: "5px" },
    resumeLink: { color: "#25343F", fontWeight: "bold", textDecoration: "underline", fontSize: "12px" },
    viewBtn: { background: "#EAEFEF", border: "none", padding: "5px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "12px" },
    pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginTop: "25px" },
    pageBtn: { padding: "8px 20px", background: "#25343F", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
    pageBtnDisabled: { padding: "8px 20px", background: "#BFC9D1", color: "#fff", border: "none", borderRadius: "8px", cursor: "not-allowed" },
    pageInfo: { fontWeight: "bold", color: "#25343F" }
};

export default CandidateList;