import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import BaseLayout from "../components/emp_base";

function UpdateCandidate() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({});
    const [resumeFile, setResumeFile] = useState(null);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const candidateRes = await apiRequest(`/employee-portal/api/candidates/${id}/`);
            const clientRes = await apiRequest("/employee-portal/clients/list/");
            setForm(candidateRes);
            setClients(clientRes.results || []);
        } catch (err) {
            console.error("Error loading data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();

        const editableFields = [
            "candidate_name", "candidate_email", "candidate_number",
            "years_of_experience_manual", "years_of_experience_calculated",
            "skills", "technology", "vendor_company_name", "vendor_number",
            "vendor_rate", "vendor_rate_type", "client", "client_rate", "client_rate_type", "main_status",
            "sub_status", "verification_status", "is_blocklisted",
            "blocklisted_reason", "remark", "extra_details"
        ];

        editableFields.forEach((field) => {
            if (form[field] !== null && form[field] !== undefined && form[field] !== "") {
                fd.append(field, form[field]);
            }
        });

        if (resumeFile) fd.append("resume", resumeFile);

        try {
            const res = await apiRequest(`/employee-portal/candidates/${id}/update/`, "PUT", fd);
            alert(res.message || "Candidate updated successfully");
            navigate(`/employee/candidate/view/${id}`);
        } catch (err) {
            alert("Update failed!");
        }
    };

    if (loading) return <BaseLayout><h3>Loading Candidate Data...</h3></BaseLayout>;

    return (
        <BaseLayout>
            <div style={styles.header}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
                    <h2 style={styles.title}>Edit Candidate: {form.candidate_name}</h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.formContainer}>
                
                {/* Section 1: Personal & Technical */}
                <div style={styles.section}>
                    <h3 style={styles.secTitle}>1. Personal & Professional Details</h3>
                    <div style={styles.grid}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Candidate Name</label>
                            <input name="candidate_name" style={styles.input} value={form.candidate_name || ""} onChange={handleChange} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <input name="candidate_email" style={styles.input} value={form.candidate_email || ""} onChange={handleChange} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Phone Number</label>
                            <input name="candidate_number" style={styles.input} value={form.candidate_number || ""} onChange={handleChange} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Technology</label>
                            <input name="technology" style={styles.input} value={form.technology || ""} onChange={handleChange} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Exp (Manual)</label>
                            <input name="years_of_experience_manual" style={styles.input} value={form.years_of_experience_manual || ""} onChange={handleChange} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Exp (Calc - Read Only)</label>
                            <input name="years_of_experience_calculated" style={{...styles.input, background: '#f5f5f5'}} value={form.years_of_experience_calculated || ""} readOnly />
                        </div>
                        <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
                            <label style={styles.label}>Skills</label>
                            <input name="skills" style={styles.input} value={form.skills || ""} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* Section 2: Vendor & Client Financials */}
                <div style={styles.section}>
                    <h3 style={styles.secTitle}>2. Vendor & Client Information</h3>
                    <div style={styles.grid}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Vendor Company</label>
                            <input name="vendor_company_name" style={styles.input} value={form.vendor_company_name || ""} onChange={handleChange} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Vendor Rate</label>
                            <input name="vendor_rate" style={styles.input} value={form.vendor_rate || ""} onChange={handleChange} />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Vendor Rate Type</label>
                            <select
                                name="vendor_rate_type"
                                style={styles.input}
                                value={form.vendor_rate_type || ""}
                                onChange={handleChange}
                            >
                                <option value="">Select Type</option>
                                <option value="LPM">LPM</option>
                                <option value="KPM">KPM</option>
                                <option value="PHR">PHR</option>
                                <option value="LPA">LPA</option>
                            </select>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Select Client</label>
                            <select name="client" style={styles.input} value={form.client || ""} onChange={handleChange}>
                                <option value="">-- Choose Client --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.client_name} - {c.company_name}</option>)}
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Client Rate</label>
                            <input name="client_rate" style={styles.input} value={form.client_rate || ""} onChange={handleChange} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Client Rate Type</label>
                            <select
                                name="client_rate_type"
                                style={styles.input}
                                value={form.client_rate_type || ""}
                                onChange={handleChange}
                            >
                                <option value="">Select Type</option>
                                <option value="LPM">LPM</option>
                                <option value="KPM">KPM</option>
                                <option value="PHR">PHR</option>
                                <option value="LPA">LPA</option>
                            </select>
                        </div>

                    </div>
                </div>


                {/* Section 3: Status & Management */}
                {/* <div style={styles.section}>
                    <h3 style={styles.secTitle}>3. Status & Governance</h3>
                    <div style={styles.grid}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Main Status</label>
                            <select name="main_status" style={styles.input} value={form.main_status || ""} onChange={handleChange}>
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
                            <label style={styles.label}>Sub Status</label>
                            <select name="sub_status" style={styles.input} value={form.sub_status || ""} onChange={handleChange}>
                                <option value="NONE">None</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="SELECTED">Selected</option>
                                <option value="DONE">Done</option>
                                
                            </select>
                        </div>
                        <div style={{...styles.inputGroup, flexDirection: 'row', alignItems: 'center', gap: '20px', paddingTop: '25px'}}>
                            <label style={{fontWeight: '700', fontSize: '13px'}}><input type="checkbox" name="verification_status" checked={form.verification_status || false} onChange={handleChange} /> Verified</label>
                            <label style={{fontWeight: '700', fontSize: '13px', color: 'red'}}><input type="checkbox" name="is_blocklisted" checked={form.is_blocklisted || false} onChange={handleChange} /> Blocklisted</label>
                        </div>
                        {form.is_blocklisted && (
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Blocklist Reason</label>
                                <input name="blocklisted_reason" style={{...styles.input, borderColor: 'red'}} value={form.blocklisted_reason || ""} onChange={handleChange} />
                            </div>
                        )}
                    </div>
                </div> */}

                {/* Section 4: Files & Remarks */}
                <div style={styles.section}>
                    <h3 style={styles.secTitle}>3. Documents & Remarks</h3>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Replace Resume (Optional)</label>
                        <input type="file" style={styles.input} onChange={(e) => setResumeFile(e.target.files[0])} />
                    </div>
                    <div style={{...styles.grid, marginTop: '15px'}}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Remark</label>
                            <textarea name="remark" style={styles.textarea} value={form.remark || ""} onChange={handleChange} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Extra Details</label>
                            <textarea name="extra_details" style={styles.textarea} value={form.extra_details || ""} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <button type="submit" style={styles.submitBtn}>Update Candidate Details</button>
            </form>
        </BaseLayout>
    );
}

const styles = {
    header: { marginBottom: "20px" },
    backBtn: { background: "#25343F", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: '600' },
    title: { margin: 0, color: "#25343F", fontSize: "24px", fontWeight: "800" },
    formContainer: { display: "flex", flexDirection: "column", gap: "20px" },
    section: { background: "#fff", padding: "20px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" },
    secTitle: { fontSize: "14px", color: "#FF9B51", fontWeight: "800", marginBottom: "15px", borderBottom: "1px solid #f0f0f0", paddingBottom: "10px", textTransform: 'uppercase' },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" },
    inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
    label: { fontSize: "12px", fontWeight: "700", color: "#555" },
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #ccc", outline: "none" },
    textarea: { padding: "10px", borderRadius: "8px", border: "1px solid #ccc", minHeight: "80px", outline: "none" },
    submitBtn: { padding: "15px", background: "#FF9B51", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "800", cursor: "pointer", boxShadow: "0 5px 15px rgba(255,155,81,0.3)" }
};

export default UpdateCandidate;



