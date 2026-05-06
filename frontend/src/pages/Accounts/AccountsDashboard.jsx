import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountsBaseLayout from "../components/AccountsBaseLayout"
import { apiRequest } from "../../services/api";

const Icons = {
    Invoice: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>,
    Dollar: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
    Trend: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
    Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
    Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
};

function AccountsDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [editModal, setEditModal] = useState({ show: false, invoice: null, status: "" });
    const [deleteModal, setDeleteModal] = useState({ show: false, invoice: null });

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await apiRequest("/invoice/api/dashboard/all/");
            if (response && response.success) {
                setData(response);
            }
        } catch (error) {
            console.error("Error fetching dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- API Handlers ---
    const handleUpdateStatus = async () => {
        try {
            const res = await apiRequest(`/invoice/api/invoices/${editModal.invoice.id}/status/`, "PATCH", { status: editModal.status });
            if (res.success) {
                setEditModal({ show: false, invoice: null, status: "" });
                fetchData();
            }
        } catch (e) { alert("Update failed"); }
    };

    const handleDelete = async (mode) => {
        const url = mode === "soft" 
            ? `/invoice/api/invoices/${deleteModal.invoice.id}/soft-delete/` 
            : `/invoice/api/invoices/${deleteModal.invoice.id}/hard-delete/`;
        try {
            const res = await apiRequest(url, "DELETE");
            if (res.success) {
                setDeleteModal({ show: false, invoice: null });
                fetchData();
            }
        } catch (e) { alert("Delete failed"); }
    };

    if (loading) return <AccountsBaseLayout><div style={styles.loading}>Loading Dashboard...</div></AccountsBaseLayout>;
    if (!data) return <AccountsBaseLayout><div style={styles.loading}>No data found</div></AccountsBaseLayout>;

    const { kpi_cards, cash_flow, charts, tables } = data;

    return (
        <AccountsBaseLayout>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.welcome}>Finance Dashboard</h2>
                    <p style={styles.subText}>Period: {data.filters_available.current_month} ({data.filters_available.date_range.from} to {data.filters_available.date_range.to})</p>
                </div>
                <div style={styles.btnGroup}>
                    <button style={styles.settingsBtn} onClick={() => navigate("/accounts/finance-overview")} title="Settings">
                        <Icons.Settings />
                    </button>
                    <button style={styles.actionBtn} onClick={() => navigate("/accounts/create-invoice")}>
                        <Icons.Plus /> Create Invoice
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={styles.statsGrid}>
                <StatCard label="Monthly Revenue" val={kpi_cards.this_month_revenue.value} col="#27AE60" icon={<Icons.Dollar />} />
                <StatCard label="Monthly Expense" val={kpi_cards.this_month_expense.value} col="#E74C3C" icon={<Icons.Invoice />} />
                <StatCard label="Net Profit" val={kpi_cards.net_profit.value} col="#25343F" icon={<Icons.Trend />} />
                <StatCard label="Bank Balance" val={kpi_cards.bank_balance.value} col="#3498DB" icon={<Icons.Dollar />} />
            </div>

            {/* Cash Flow & Alerts Row */}
            <div style={{...styles.statsGrid, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
                <div style={styles.infoBox}>
                    <h4 style={styles.infoTitle}>Cash Flow Details</h4>
                    <div style={styles.infoRow}><span>Received this Month:</span> <b>₹{cash_flow.received_this_month}</b></div>
                    <div style={styles.infoRow}><span>Pending Client:</span> <b style={{color: '#FF9B51'}}>₹{cash_flow.pending_client_payments}</b></div>
                    <div style={styles.infoRow}><span>Vendor Payable:</span> <b style={{color: '#E74C3C'}}>₹{cash_flow.vendor_payable}</b></div>
                </div>
                <div style={styles.infoBox}>
                    <h4 style={styles.infoTitle}>Financial Alerts</h4>
                    <div style={styles.infoRow}><span>Overdue Invoices:</span> <b style={{color: '#E74C3C'}}>{data.alerts.overdue.client_invoices_count}</b></div>
                    <div style={styles.infoRow}><span>Due Soon:</span> <b style={{color: '#FF9B51'}}>{data.alerts.due_soon.client_invoices_count}</b></div>
                    <div style={styles.infoRow}><span>Expected Profit:</span> <b>₹{data.future_projection.expected_profit}</b></div>
                </div>
            </div>

            {/* Invoices Table */}
            <Section title="Recent Client Invoices">
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>Invoice ID</th>
                            <th style={styles.th}>Client</th>
                            <th style={styles.th}>Amount</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tables.recent_client_invoices.map((inv) => (
                            <tr key={inv.id} style={styles.tableRow}>
                                <td style={styles.td}><b>{inv.invoice_id}</b></td>
                                <td style={styles.td}>{inv.client}</td>
                                <td style={styles.td}><b>₹{inv.amount}</b></td>
                                <td style={styles.td}>
                                    <span style={{...styles.badge, ...getStatusStyle(inv.status)}}>{inv.status}</span>
                                </td>
                                <td style={styles.td}>
                                    <div style={{display:'flex', gap: '8px'}}>
                                        {/* <button style={styles.iconBtn} title="Download"><Icons.Download /></button> */}
                                        <button 
                                            style={{...styles.iconBtn, color: '#3498DB'}} 
                                            onClick={() => setEditModal({ show: true, invoice: inv, status: inv.status })}
                                        >
                                            <Icons.Edit />
                                        </button>
                                        <button 
                                            style={{...styles.iconBtn, color: '#E74C3C'}} 
                                            onClick={() => setDeleteModal({ show: true, invoice: inv })}
                                        >
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* Performance Summary */}
            <Section title="Monthly Performance Comparison">
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>Month</th>
                            <th style={styles.th}>Revenue</th>
                            <th style={styles.th}>Expense</th>
                            <th style={styles.th}>Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {charts.monthly_comparison.slice(-5).map((m, i) => (
                            <tr key={i} style={styles.tableRow}>
                                <td style={styles.td}>{m.month}</td>
                                <td style={styles.td}>₹{m.revenue}</td>
                                <td style={{...styles.td, color: '#E74C3C'}}>₹{m.expense}</td>
                                <td style={{...styles.td, color: '#27AE60', fontWeight: '700'}}>₹{m.profit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* --- MODALS --- */}
            {editModal.show && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={{margin: '0 0 10px 0'}}>Update Status</h3>
                        <p style={{fontSize: '12px', color: '#64748b'}}>{editModal.invoice.invoice_id} - {editModal.invoice.client}</p>
                        <select 
                            style={styles.select} 
                            value={editModal.status} 
                            onChange={(e) => setEditModal({...editModal, status: e.target.value})}
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            
                            <option value="DRAFT">DRAFT</option>
                            <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                            <option value="OVERDUE">OVERDUE</option>
                            <option value="CANCELLED">CANCELLED</option>

                        </select>
                        <div style={styles.modalBtns}>
                            <button style={styles.cancelBtn} onClick={() => setEditModal({show:false})}>Cancel</button>
                            <button style={styles.saveBtn} onClick={handleUpdateStatus}>Update Status</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteModal.show && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3 style={{margin: '0 0 10px 0', color: '#E74C3C'}}>Delete Invoice</h3>
                        <p style={{fontSize: '13px'}}>Select delete mode for <b>{deleteModal.invoice.invoice_id}</b></p>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px'}}>
                            <button style={styles.softBtn} onClick={() => handleDelete('soft')}>Soft Delete (Hide Only)</button>
                            <button style={styles.hardBtn} onClick={() => handleDelete('hard')}>Hard Delete (Permanent)</button>
                            <button style={styles.cancelBtn} onClick={() => setDeleteModal({show:false})}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </AccountsBaseLayout>
    );
}

// Sub-components
const StatCard = ({ label, val, col, icon }) => (
    <div style={styles.statCard}>
        <div>
            <p style={styles.statLabel}>{label}</p>
            <h3 style={{...styles.statValue, color: col}}>₹{val.toLocaleString()}</h3>
        </div>
        <div style={{...styles.iconCircle, color: col, backgroundColor: `${col}10`}}>{icon}</div>
    </div>
);

const Section = ({ title, children }) => (
    <div style={styles.sectionContainer}>
        <div style={styles.sectionHeader}><h3 style={styles.sectionTitle}>{title}</h3></div>
        <div style={styles.tableWrapper}><div style={{overflowX:'auto'}}>{children}</div></div>
    </div>
);

const getStatusStyle = (status) => {
    switch(status) {
        case 'PAID': return { backgroundColor: '#D1FAE5', color: '#065F46' };
        case 'GENERATED': return { backgroundColor: '#FEF3C7', color: '#92400E' };
        default: return { backgroundColor: '#F3F4F6', color: '#374151' };
    }
}

const styles = {
    loading: { padding: '100px', textAlign: 'center', fontWeight: '800', color: '#25343F' },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "10px" },
    welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
    subText: { color: "#7F8C8D", fontSize: "13px", margin: "4px 0" },
    btnGroup: { display: "flex", gap: "10px" },
    settingsBtn: { background: "#F1F5F9", border: "1px solid #E2E8F0", padding: "10px", borderRadius: "8px", cursor: "pointer", display: "flex" },
    actionBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "25px" },
    statCard: { background: "#fff", padding: "20px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4" },
    statLabel: { margin: 0, color: "#7F8C8D", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" },
    statValue: { margin: "4px 0", fontSize: "20px", fontWeight: "800" },
    iconCircle: { width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
    infoBox: { background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #F0F2F4" },
    infoTitle: { margin: "0 0 15px 0", fontSize: "14px", color: "#25343F", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px", fontWeight: '700' },
    infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', color: '#475569' },
    sectionContainer: { marginBottom: "30px" },
    sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #27AE60", paddingLeft: "12px" },
    tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #F0F2F4", marginTop: '10px' },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { background: "#F9FAFB" },
    th: { padding: "12px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800" },
    td: { padding: "12px 18px", fontSize: "13px", color: "#334155" },
    badge: { padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "700" },
    iconBtn: { border: 'none', background: '#F1F5F9', padding: '6px', borderRadius: '6px', cursor: 'pointer' },
    // Modal Styles
    modalOverlay: { position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: '#fff', padding: '25px', borderRadius: '15px', width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
    select: { width: '100%', padding: '10px', marginTop: '15px', borderRadius: '8px', border: '1px solid #E2E8F0' },
    modalBtns: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    cancelBtn: { padding: '8px 15px', border: 'none', background: '#F1F5F9', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    saveBtn: { padding: '8px 15px', border: 'none', background: '#3498DB', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    softBtn: { padding: '10px', border: '1px solid #E2E8F0', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    hardBtn: { padding: '10px', border: 'none', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }
};

export default AccountsDashboard;





// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import AccountsBaseLayout from "../components/AccountsBaseLayout";
// import { apiRequest } from "../../services/api";

// const Icons = {
//     Invoice: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>,
//     Dollar: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
//     Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
//     Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
//     Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
//     Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
//     Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
// };

// function AccountsDashboard() {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(true);
//     const [data, setData] = useState(null);
    
//     // Modal States
//     const [editModal, setEditModal] = useState({ show: false, invoice: null, status: "" });
//     const [deleteModal, setDeleteModal] = useState({ show: false, invoice: null });

//     const fetchDashboard = async () => {
//         try {
//             setLoading(true);
//             const res = await apiRequest("/invoice/api/dashboard/all/");
//             if (res && res.success) setData(res);
//         } catch (err) { console.error("Fetch error:", err); }
//         finally { setLoading(false); }
//     };

//     useEffect(() => { fetchDashboard(); }, []);

//     // --- API Handlers ---
//     const handleUpdateStatus = async () => {
//         try {
//             const res = await apiRequest(`/invoice/api/invoices/${editModal.invoice.id}/status/`, "PATCH", { status: editModal.status });
//             if (res.success) {
//                 setEditModal({ show: false, invoice: null, status: "" });
//                 fetchDashboard();
//             }
//         } catch (err) { alert("Failed to update status"); }
//     };

//     const handleDelete = async (mode) => {
//         const url = mode === "soft" 
//             ? `/invoice/api/invoices/${deleteModal.invoice.id}/soft-delete/` 
//             : `/invoice/api/invoices/${deleteModal.invoice.id}/hard-delete/`;
        
//         try {
//             const res = await apiRequest(url, "DELETE");
//             if (res.success) {
//                 alert(res.message);
//                 setDeleteModal({ show: false, invoice: null });
//                 fetchDashboard();
//             }
//         } catch (err) { alert("Delete failed"); }
//     };

//     if (loading) return <AccountsBaseLayout><div style={styles.loading}>Loading Dashboard...</div></AccountsBaseLayout>;
//     if (!data) return <AccountsBaseLayout><div style={styles.loading}>No data found</div></AccountsBaseLayout>;

//     return (
//         <AccountsBaseLayout>
//             {/* Header Section */}
//             <div style={styles.header}>
//                 <div>
//                     <h2 style={styles.welcome}>Accounts Overview</h2>
//                     <p style={styles.subText}>Period: {data.filters_available.current_month}</p>
//                 </div>
//                 <div style={styles.btnGroup}>
//                     <button style={styles.settingsBtn} onClick={() => navigate("/accounts/finance-overview")} title="Settings">
//                         <Icons.Settings />
//                     </button>
//                     <button style={styles.actionBtn} onClick={() => navigate("/accounts/create-invoice")}>
//                         <Icons.Plus /> Create New Invoice
//                     </button>
//                 </div>
//             </div>

//             {/* Top KPI Cards */}
//             <div style={styles.statsGrid}>
//                 <StatCard label="Monthly Revenue" val={data.kpi_cards.this_month_revenue.value} col="#27AE60" />
//                 <StatCard label="Bank Balance" val={data.kpi_cards.bank_balance.value} col="#3498DB" />
//                 <StatCard label="Pending Client" val={data.cash_flow.pending_client_payments} col="#FF9B51" />
//                 <StatCard label="Overdue Amount" val={data.alerts.overdue.client_invoices_amount} col="#E74C3C" />
//             </div>

//             {/* Invoices Table */}
//             <Section title="Recent Client Invoices">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Invoice ID</th>
//                             <th style={styles.th}>Client</th>
//                             <th style={styles.th}>Amount</th>
//                             <th style={styles.th}>Status</th>
//                             <th style={styles.th}>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {data.tables.recent_client_invoices.map((inv) => (
//                             <tr key={inv.id} style={styles.tableRow}>
//                                 <td style={styles.td}><b>{inv.invoice_id}</b></td>
//                                 <td style={styles.td}>{inv.client}</td>
//                                 <td style={styles.td}><b>₹{inv.amount.toLocaleString()}</b></td>
//                                 <td style={styles.td}>
//                                     <span style={{...styles.badge, ...getStatusStyle(inv.status)}}>{inv.status}</span>
//                                 </td>
//                                 <td style={styles.td}>
//                                     <div style={{display: 'flex', gap: '8px'}}>
//                                         <button style={styles.iconBtn} title="Download"><Icons.Download /></button>
//                                         <button 
//                                             style={{...styles.iconBtn, color: '#3498DB'}} 
//                                             onClick={() => setEditModal({ show: true, invoice: inv, status: inv.status })}
//                                         >
//                                             <Icons.Edit />
//                                         </button>
//                                         <button 
//                                             style={{...styles.iconBtn, color: '#E74C3C'}} 
//                                             onClick={() => setDeleteModal({ show: true, invoice: inv })}
//                                         >
//                                             <Icons.Trash />
//                                         </button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>

//             {/* Monthly Comparison Summary */}
//             <Section title="Monthly Performance">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Month</th>
//                             <th style={styles.th}>Revenue</th>
//                             <th style={styles.th}>Expense</th>
//                             <th style={styles.th}>Net Profit</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {data.charts.monthly_comparison.slice(-3).map((m, i) => (
//                             <tr key={i} style={styles.tableRow}>
//                                 <td style={styles.td}>{m.month}</td>
//                                 <td style={styles.td}>₹{m.revenue.toLocaleString()}</td>
//                                 <td style={{...styles.td, color: '#E74C3C'}}>₹{m.expense.toLocaleString()}</td>
//                                 <td style={{...styles.td, color: '#27AE60', fontWeight: '800'}}>₹{m.profit.toLocaleString()}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>

//             {/* --- EDIT STATUS MODAL --- */}
//             {editModal.show && (
//                 <div style={styles.modalOverlay}>
//                     <div style={styles.modal}>
//                         <h3 style={{margin: '0 0 10px 0'}}>Update Status</h3>
//                         <p style={{fontSize: '12px', color: '#64748b'}}>{editModal.invoice.invoice_id} | {editModal.invoice.client}</p>
//                         <select 
//                             style={styles.select} 
//                             value={editModal.status} 
//                             onChange={(e) => setEditModal({...editModal, status: e.target.value})}
//                         >
//                             <option value="GENERATED">GENERATED</option>
//                             <option value="PENDING">PENDING</option>
//                             <option value="PAID">PAID</option>
//                             <option value="CANCELLED">CANCELLED</option>
//                         </select>
//                         <div style={styles.modalBtns}>
//                             <button style={styles.cancelBtn} onClick={() => setEditModal({show: false, invoice: null})}>Cancel</button>
//                             <button style={styles.saveBtn} onClick={handleUpdateStatus}>Update Now</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* --- DELETE OPTIONS MODAL --- */}
//             {deleteModal.show && (
//                 <div style={styles.modalOverlay}>
//                     <div style={styles.modal}>
//                         <h3 style={{margin: '0 0 10px 0', color: '#E74C3C'}}>Delete Invoice</h3>
//                         <p style={{fontSize: '13px'}}>Select delete type for <b>{deleteModal.invoice.invoice_id}</b></p>
//                         <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px'}}>
//                             <button style={styles.softBtn} onClick={() => handleDelete('soft')}>Soft Delete (Move to Trash)</button>
//                             <button style={styles.hardBtn} onClick={() => handleDelete('hard')}>Hard Delete (Permanent)</button>
//                             <button style={styles.cancelBtn} onClick={() => setDeleteModal({show: false, invoice: null})}>Close</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//         </AccountsBaseLayout>
//     );
// }

// // --- Internal Components ---
// const StatCard = ({ label, val, col }) => (
//     <div style={styles.statCard}>
//         <p style={styles.statLabel}>{label}</p>
//         <h3 style={{...styles.statValue, color: col}}>₹{val.toLocaleString()}</h3>
//     </div>
// );

// const Section = ({ title, children }) => (
//     <div style={styles.sectionContainer}>
//         <h3 style={styles.sectionTitle}>{title}</h3>
//         <div style={styles.tableWrapper}>{children}</div>
//     </div>
// );

// const getStatusStyle = (s) => {
//     if (s === 'PAID') return { background: '#D1FAE5', color: '#065F46' };
//     if (s === 'GENERATED') return { background: '#FEF3C7', color: '#92400E' };
//     return { background: '#F1F5F9', color: '#475569' };
// };

// // --- Styles ---
// const styles = {
//     loading: { padding: '100px', textAlign: 'center', fontWeight: '800', color: '#1e293b' },
//     header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", gap: "15px", flexWrap: "wrap" },
//     welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
//     subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
//     btnGroup: { display: "flex", gap: "10px", alignItems: "center"},
//     settingsBtn: { background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0", padding: "10px", borderRadius: "8px", cursor: "pointer", display: "flex" },
//     actionBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" },
//     statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" },
//     statCard: { background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #F0F2F4", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" },
//     statLabel: { margin: 0, color: "#7F8C8D", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" },
//     statValue: { margin: "5px 0 0 0", fontSize: "22px", fontWeight: "800" },
//     sectionContainer: { marginBottom: "35px" },
//     sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: "0 0 15px 0", borderLeft: "4px solid #27AE60", paddingLeft: "12px" },
//     tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #F0F2F4", overflowX: "auto" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F9FAFB", borderBottom: "1px solid #EDF2F7" },
//     th: { padding: "12px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
//     tableRow: { borderBottom: "1px solid #F1F5F9" },
//     td: { padding: "15px 18px", fontSize: "13px", color: "#334155" },
//     badge: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//     iconBtn: { border: 'none', background: '#F1F5F9', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#475569', display: 'inline-flex' },
//     // Modal Styles
//     modalOverlay: { position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
//     modal: { background: '#fff', padding: '25px', borderRadius: '16px', width: '380px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
//     select: { width: '100%', padding: '12px', marginTop: '15px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' },
//     modalBtns: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
//     cancelBtn: { padding: '10px 20px', border: 'none', background: '#F1F5F9', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
//     saveBtn: { padding: '10px 20px', border: 'none', background: '#1E293B', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
//     softBtn: { padding: '12px', border: '1px solid #E2E8F0', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', color: '#475569' },
//     hardBtn: { padding: '12px', border: 'none', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }
// };

// export default AccountsDashboard;






// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import AccountsBaseLayout from "../components/AccountsBaseLayout"
// import { apiRequest } from "../../services/api";

// const Icons = {
//     Invoice: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
//     Dollar: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
//     Trend: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
//     Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
//     Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
//     Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
// };

// function AccountsDashboard() {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(true);
//     const [data, setData] = useState(null);

//     const fetchData = async () => {
//         try {
//             setLoading(true);
//             const response = await apiRequest("/invoice/api/dashboard/all/");
//             if (response && response.success) {
//                 setData(response);
//             }
//         } catch (error) {
//             console.error("Error fetching dashboard:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const handleStatusUpdate = async (id, currentStatus) => {
//         const newStatus = currentStatus === "PAID" ? "PENDING" : "PAID";
//         if (window.confirm(`Change status to ${newStatus}?`)) {
//             try {
//                 await apiRequest(`/invoice/api/invoices/${id}/status/`, "PATCH", { status: newStatus });
//                 fetchData();
//             } catch (e) { alert("Failed to update"); }
//         }
//     };

//     const handleDelete = async (id) => {
//         if (window.confirm("Permanent delete this invoice?")) {
//             try {
//                 await apiRequest(`/invoice/api/invoices/${id}/hard-delete/`, "DELETE");
//                 fetchData();
//             } catch (e) { alert("Delete failed"); }
//         }
//     };

//     if (loading) return <AccountsBaseLayout><div style={styles.loading}>Loading Dashboard...</div></AccountsBaseLayout>;
//     if (!data) return <AccountsBaseLayout><div style={styles.loading}>No data found</div></AccountsBaseLayout>;

//     const { kpi_cards, cash_flow, charts, tables } = data;

//     return (
//         <AccountsBaseLayout>
//             {/* Header */}
//             <div style={styles.header}>
//                 <div>
//                     <h2 style={styles.welcome}>Finance Dashboard</h2>
//                     <p style={styles.subText}>Period: {data.filters_available.current_month} ({data.filters_available.date_range.from} to {data.filters_available.date_range.to})</p>
//                 </div>
//                 <button style={styles.actionBtn} onClick={() => navigate("/accounts/create-invoice")}>
//                     <Icons.Plus /> Create Invoice
//                 </button>
//             </div>

//             {/* KPI Cards */}
//             <div style={styles.statsGrid}>
//                 <StatCard label="Monthly Revenue" val={kpi_cards.this_month_revenue.value} col="#27AE60" icon={<Icons.Dollar />} />
//                 <StatCard label="Monthly Expense" val={kpi_cards.this_month_expense.value} col="#E74C3C" icon={<Icons.Invoice />} />
//                 <StatCard label="Net Profit" val={kpi_cards.net_profit.value} col="#25343F" icon={<Icons.Trend />} />
//                 <StatCard label="Bank Balance" val={kpi_cards.bank_balance.value} col="#3498DB" icon={<Icons.Dollar />} />
//             </div>

//             {/* Cash Flow Section */}
//             <div style={{...styles.statsGrid, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
//                 <div style={styles.infoBox}>
//                     <h4 style={styles.infoTitle}>Cash Flow (This Month)</h4>
//                     <div style={styles.infoRow}><span>Received:</span> <b>₹{cash_flow.received_this_month}</b></div>
//                     <div style={styles.infoRow}><span>Pending Client:</span> <b style={{color: '#FF9B51'}}>₹{cash_flow.pending_client_payments}</b></div>
//                     <div style={styles.infoRow}><span>Vendor Payable:</span> <b style={{color: '#E74C3C'}}>₹{cash_flow.vendor_payable}</b></div>
//                 </div>
//                 <div style={styles.infoBox}>
//                     <h4 style={styles.infoTitle}>Monthly Alerts</h4>
//                     <div style={styles.infoRow}><span>Overdue Invoices:</span> <b>{data.alerts.overdue.client_invoices_count}</b></div>
//                     <div style={styles.infoRow}><span>Due Soon:</span> <b>{data.alerts.due_soon.client_invoices_count}</b></div>
//                     <div style={styles.infoRow}><span>Expected Profit:</span> <b>₹{data.future_projection.expected_profit}</b></div>
//                 </div>
//             </div>

//             {/* Invoices Table */}
//             <Section title="Recent Client Invoices">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>ID</th>
//                             <th style={styles.th}>Client</th>
//                             <th style={styles.th}>Amount</th>
//                             <th style={styles.th}>Status</th>
//                             <th style={styles.th}>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {tables.recent_client_invoices.map((inv) => (
//                             <tr key={inv.id} style={styles.tableRow}>
//                                 <td style={styles.td}><b>{inv.invoice_id}</b></td>
//                                 <td style={styles.td}>{inv.client}</td>
//                                 <td style={styles.td}><b>₹{inv.amount}</b></td>
//                                 <td style={styles.td}>
//                                     <span 
//                                         onClick={() => handleStatusUpdate(inv.id, inv.status)}
//                                         style={{...styles.badge, cursor: 'pointer', ...getStatusStyle(inv.status)}}
//                                     >
//                                         {inv.status}
//                                     </span>
//                                 </td>
//                                 <td style={styles.td}>
//                                     <div style={{display:'flex', gap: '5px'}}>
//                                         <button style={styles.iconBtn}><Icons.Download /></button>
//                                         <button style={{...styles.iconBtn, color: '#E74C3C'}} onClick={() => handleDelete(inv.id)}><Icons.Trash /></button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>

//             {/* Comparison Table */}
//             <Section title="Monthly Performance Comparison">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Month</th>
//                             <th style={styles.th}>Revenue</th>
//                             <th style={styles.th}>Expense</th>
//                             <th style={styles.th}>Profit</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {charts.monthly_comparison.map((m, i) => (
//                             <tr key={i} style={styles.tableRow}>
//                                 <td style={styles.td}>{m.month}</td>
//                                 <td style={styles.td}>₹{m.revenue}</td>
//                                 <td style={{...styles.td, color: '#E74C3C'}}>₹{m.expense}</td>
//                                 <td style={{...styles.td, color: '#27AE60', fontWeight: '700'}}>₹{m.profit}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>
//         </AccountsBaseLayout>
//     );
// }

// const StatCard = ({ label, val, col, icon }) => (
//     <div style={styles.statCard}>
//         <div>
//             <p style={styles.statLabel}>{label}</p>
//             <h3 style={{...styles.statValue, color: col}}>₹{val.toLocaleString()}</h3>
//         </div>
//         <div style={{...styles.iconCircle, color: col, backgroundColor: `${col}10`}}>{icon}</div>
//     </div>
// );

// const Section = ({ title, children }) => (
//     <div style={styles.sectionContainer}>
//         <div style={styles.sectionHeader}><h3 style={styles.sectionTitle}>{title}</h3></div>
//         <div style={styles.tableWrapper}><div style={{overflowX:'auto'}}>{children}</div></div>
//     </div>
// );

// const getStatusStyle = (status) => {
//     switch(status) {
//         case 'PAID': return { backgroundColor: '#D1FAE5', color: '#065F46' };
//         case 'GENERATED': return { backgroundColor: '#FEF3C7', color: '#92400E' };
//         default: return { backgroundColor: '#F3F4F6', color: '#374151' };
//     }
// }

// const styles = {
//     loading: { padding: '100px', textAlign: 'center', fontWeight: '800', color: '#25343F' },
//     header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap" },
//     welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
//     subText: { color: "#7F8C8D", fontSize: "13px", margin: "4px 0" },
//     actionBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" },
//     statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "25px" },
//     statCard: { background: "#fff", padding: "20px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4" },
//     statLabel: { margin: 0, color: "#7F8C8D", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" },
//     statValue: { margin: "4px 0", fontSize: "20px", fontWeight: "800" },
//     iconCircle: { width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
//     infoBox: { background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #F0F2F4" },
//     infoTitle: { margin: "0 0 15px 0", fontSize: "14px", color: "#25343F", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" },
//     infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', color: '#475569' },
//     sectionContainer: { marginBottom: "30px" },
//     sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #27AE60", paddingLeft: "12px" },
//     tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #F0F2F4", marginTop: '10px' },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F9FAFB" },
//     th: { padding: "12px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800" },
//     td: { padding: "12px 18px", fontSize: "13px", color: "#334155" },
//     badge: { padding: "4px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "700" },
//     iconBtn: { border: 'none', background: '#F1F5F9', padding: '6px', borderRadius: '6px', cursor: 'pointer' }
// };

// export default AccountsDashboard;





// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import AccountsBaseLayout from "../components/AccountsBaseLayout"
// import { apiRequest } from "../../services/api";

// const Icons = {
//     Invoice: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
//     Dollar: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
//     Pending: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
//     Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
//     Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
//     Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
// };

// function AccountsDashboard() {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);
    
//     const stats = {
//         total_revenue: "₹12.5L",
//         pending_invoices: 14,
//         collected_today: "₹85,000",
//         overdue_amount: "₹2.1L",
//         active_clients: 28
//     };

//     const recentInvoices = [
//         { id: "INV-001", client: "Tech Solutions", amount: "₹45,000", date: "2026-03-14", status: "PAID", type: "Placement Fee" },
//         { id: "INV-002", client: "Global Systems", amount: "₹1,20,000", date: "2026-03-12", status: "PENDING", type: "Contract Staffing" },
//         { id: "INV-003", client: "Innovate IT", amount: "₹65,000", date: "2026-03-10", status: "OVERDUE", type: "Placement Fee" },
//     ];

//     if (loading) return <AccountsBaseLayout><div style={styles.loading}>Loading Accounts...</div></AccountsBaseLayout>;

//     return (
//         <AccountsBaseLayout>
//             <div style={styles.header}>
//                 <div>
//                     <h2 style={styles.welcome}>Accounts Overview</h2>
//                     <p style={styles.subText}>Monitor your billing, invoices and financial health.</p>
//                 </div>
//                 <div style={styles.btnGroup}>
//                     <button style={styles.settingsBtn} onClick={() => navigate("/accounts/finance-overview")} title="Settings">
//                         <Icons.Settings />
//                     </button>
//                     <button style={styles.actionBtn} onClick={() => navigate("/accounts/create-invoice")}>
//                         <Icons.Plus /> Create New Invoice
//                     </button>
//                 </div>
//             </div>

//             <div style={styles.statsGrid}>
//                 {[
//                     { label: "Total Revenue", val: stats.total_revenue, icon: <Icons.Dollar />, col: "#27AE60" },
//                     { label: "Pending Invoices", val: stats.pending_invoices, icon: <Icons.Pending />, col: "#FF9B51" },
//                     { label: "Collected Today", val: stats.collected_today, icon: <Icons.Plus />, col: "#25343F" },
//                     { label: "Overdue Amount", val: stats.overdue_amount, icon: <Icons.Invoice />, col: "#E74C3C" },
//                     { label: "Active Clients", val: stats.active_clients, icon: <Icons.Invoice />, col: "#25343F" },
//                 ].map((s, i) => (
//                     <div key={i} style={styles.statCard}>
//                         <div>
//                             <p style={styles.statLabel}>{s.label}</p>
//                             <h3 style={{...styles.statValue, color: s.col}}>{s.val}</h3>
//                         </div>
//                         <div style={{...styles.iconCircle, color: s.col, backgroundColor: 'rgba(37,52,63,0.05)'}}>{s.icon}</div>
//                     </div>
//                 ))}
//             </div>

//             <Section title="Recent Invoices">
//                 <table style={styles.table}>
//                     <thead style={styles.tableHeader}>
//                         <tr>
//                             <th style={styles.th}>Invoice ID</th>
//                             <th style={styles.th}>Client Name</th>
//                             <th style={styles.th}>Amount</th>
//                             <th style={styles.th}>Due Date</th>
//                             <th style={styles.th}>Type</th>
//                             <th style={styles.th}>Status</th>
//                             <th style={styles.th}>Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {recentInvoices.map((inv) => (
//                             <tr key={inv.id} style={styles.tableRow}>
//                                 <td style={styles.td}><b>{inv.id}</b></td>
//                                 <td style={styles.td}>{inv.client}</td>
//                                 <td style={styles.td}><b>{inv.amount}</b></td>
//                                 <td style={styles.td}>{inv.date}</td>
//                                 <td style={styles.td}>{inv.type}</td>
//                                 <td style={styles.td}>
//                                     <span style={{
//                                         ...styles.badge, 
//                                         backgroundColor: inv.status === 'PAID' ? '#D1FAE5' : inv.status === 'OVERDUE' ? '#FEE2E2' : '#FEF3C7',
//                                         color: inv.status === 'PAID' ? '#065F46' : inv.status === 'OVERDUE' ? '#991B1B' : '#92400E'
//                                     }}>
//                                         {inv.status}
//                                     </span>
//                                 </td>
//                                 <td style={styles.td}>
//                                     <button style={styles.downloadBtn} title="Download PDF"><Icons.Download /></button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Section>

//             <Section title="Pending Vendor Payments">
//                 <div style={{padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px'}}>
//                     No pending vendor payments for today.
//                 </div>
//             </Section>
//         </AccountsBaseLayout>
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
//     header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" },
//     welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
//     subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
//     btnGroup: { display: "flex", gap: "10px", alignItems: "center"},
//     settingsBtn: { background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0", padding: "10px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
//     actionBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" },
//     statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" },
//     statCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4" },
//     statLabel: { margin: 0, color: "#7F8C8D", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" },
//     statValue: { margin: "4px 0", fontSize: "22px", fontWeight: "800" },
//     iconCircle: { width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
//     sectionContainer: { marginBottom: "35px" },
//     sectionHeader: { marginBottom: "10px" },
//     sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #27AE60", paddingLeft: "12px" },
//     tableWrapper: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
//     th: { padding: "12px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
//     tableRow: { borderBottom: "1px solid #F1F5F9", transition: "0.2s" },
//     td: { padding: "15px 18px", fontSize: "13px", color: "#334155" },
//     badge: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
//     downloadBtn: { border: 'none', background: '#F1F5F9', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#475569' }
// };

// export default AccountsDashboard;

