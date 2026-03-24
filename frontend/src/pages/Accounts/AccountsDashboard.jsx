import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountsBaseLayout from "../components/AccountsBaseLayout"
import { apiRequest } from "../../services/api";

const Icons = {
    Invoice: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    Dollar: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
    Pending: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
};

function AccountsDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Static Dummy Data for UI representation
    const stats = {
        total_revenue: "₹12.5L",
        pending_invoices: 14,
        collected_today: "₹85,000",
        overdue_amount: "₹2.1L",
        active_clients: 28
    };

    const recentInvoices = [
        { id: "INV-001", client: "Tech Solutions", amount: "₹45,000", date: "2026-03-14", status: "PAID", type: "Placement Fee" },
        { id: "INV-002", client: "Global Systems", amount: "₹1,20,000", date: "2026-03-12", status: "PENDING", type: "Contract Staffing" },
        { id: "INV-003", client: "Innovate IT", amount: "₹65,000", date: "2026-03-10", status: "OVERDUE", type: "Placement Fee" },
    ];

    if (loading) return <AccountsBaseLayout><div style={styles.loading}>Loading Accounts...</div></AccountsBaseLayout>;

    return (
        <AccountsBaseLayout>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.welcome}>Accounts Overview</h2>
                    <p style={styles.subText}>Monitor your billing, invoices and financial health.</p>
                </div>
                <div style={styles.btnGroup}>
                    <button style={styles.actionBtn} onClick={() => navigate("/accounts/create-invoice")}>
                        <Icons.Plus /> Create New Invoice
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
                {[
                    { label: "Total Revenue", val: stats.total_revenue, icon: <Icons.Dollar />, col: "#27AE60" },
                    { label: "Pending Invoices", val: stats.pending_invoices, icon: <Icons.Pending />, col: "#FF9B51" },
                    { label: "Collected Today", val: stats.collected_today, icon: <Icons.Plus />, col: "#25343F" },
                    { label: "Overdue Amount", val: stats.overdue_amount, icon: <Icons.Invoice />, col: "#E74C3C" },
                    { label: "Active Clients", val: stats.active_clients, icon: <Icons.Invoice />, col: "#25343F" },
                ].map((s, i) => (
                    <div key={i} style={styles.statCard}>
                        <div>
                            <p style={styles.statLabel}>{s.label}</p>
                            <h3 style={{...styles.statValue, color: s.col}}>{s.val}</h3>
                        </div>
                        <div style={{...styles.iconCircle, color: s.col, backgroundColor: 'rgba(37,52,63,0.05)'}}>{s.icon}</div>
                    </div>
                ))}
            </div>

            {/* Recent Invoices Table */}
            <Section title="Recent Invoices">
                <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                        <tr>
                            <th style={styles.th}>Invoice ID</th>
                            <th style={styles.th}>Client Name</th>
                            <th style={styles.th}>Amount</th>
                            <th style={styles.th}>Due Date</th>
                            <th style={styles.th}>Type</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentInvoices.map((inv) => (
                            <tr key={inv.id} style={styles.tableRow}>
                                <td style={styles.td}><b>{inv.id}</b></td>
                                <td style={styles.td}>{inv.client}</td>
                                <td style={styles.td}><b>{inv.amount}</b></td>
                                <td style={styles.td}>{inv.date}</td>
                                <td style={styles.td}>{inv.type}</td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.badge, 
                                        backgroundColor: inv.status === 'PAID' ? '#D1FAE5' : inv.status === 'OVERDUE' ? '#FEE2E2' : '#FEF3C7',
                                        color: inv.status === 'PAID' ? '#065F46' : inv.status === 'OVERDUE' ? '#991B1B' : '#92400E'
                                    }}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button style={styles.downloadBtn} title="Download PDF"><Icons.Download /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* Placeholder for Expense or Vendor Payments */}
            <Section title="Pending Vendor Payments">
                <div style={{padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '14px'}}>
                    No pending vendor payments for today.
                </div>
            </Section>
        </AccountsBaseLayout>
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
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" },
    welcome: { fontSize: "24px", color: "#25343F", fontWeight: "800", margin: 0 },
    subText: { color: "#7F8C8D", fontSize: "14px", margin: "4px 0 0 0" },
    btnGroup: { display: "flex", gap: "10px", alignItems: "center"},
    actionBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" },
    statCard: { background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #F0F2F4" },
    statLabel: { margin: 0, color: "#7F8C8D", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" },
    statValue: { margin: "4px 0", fontSize: "22px", fontWeight: "800" },
    iconCircle: { width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
    sectionContainer: { marginBottom: "35px" },
    sectionHeader: { marginBottom: "10px" },
    sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#25343F", margin: 0, borderLeft: "4px solid #27AE60", paddingLeft: "12px" },
    tableWrapper: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: "1px solid #F0F2F4" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { background: "#F9FAFB", borderBottom: "2px solid #EDF2F7" },
    th: { padding: "12px 18px", textAlign: "left", fontSize: "11px", color: "#94A3B8", fontWeight: "800", textTransform: "uppercase" },
    tableRow: { borderBottom: "1px solid #F1F5F9", transition: "0.2s" },
    td: { padding: "15px 18px", fontSize: "13px", color: "#334155" },
    badge: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" },
    downloadBtn: { border: 'none', background: '#F1F5F9', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#475569' }
};

export default AccountsDashboard;