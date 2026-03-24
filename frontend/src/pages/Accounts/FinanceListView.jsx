import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import AccountsBaseLayout from "../components/AccountsBaseLayout";

const FinanceListView = () => {

    const [settings, setSettings] = useState(null);
    const [banks, setBanks] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const sData = await apiRequest("/invoice/api/settings/", "GET");
                const bData = await apiRequest("/invoice/api/bank-accounts/", "GET");

                setSettings(sData);
                setBanks(bData.results ? bData.results : bData);

            } catch (err) {
                console.error(err);
            }
        };

        loadData();
    }, []);

    return (
        <AccountsBaseLayout>

            <div style={{ padding: "20px" }}>

                {/* SETTINGS */}
                {settings && (
                    <div style={{ marginBottom: "30px" }}>
                        <h2>{settings.company_name}</h2>

                        <img
                            src={settings.logo_url ? settings.logo_url : "https://via.placeholder.com/80"}
                            alt="logo"
                            width="80"
                        />

                        <p>{settings.address}</p>
                        <p>Email: {settings.email}</p>
                        <p>Phone: {settings.phone}</p>
                        <p>GST: {settings.gstin}</p>
                        <p>GST Rate: {settings.default_gst_rate}%</p>
                    </div>
                )}

                {/* BANKS */}
                <h3>Bank Accounts</h3>

                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>Bank</th>
                            <th>Holder</th>
                            <th>Account</th>
                            <th>IFSC</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {banks.length > 0 ? banks.map(b => (
                            <tr key={b.id}>
                                <td>{b.bank_name}</td>
                                <td>{b.account_holder_name}</td>
                                <td>{b.account_number}</td>
                                <td>{b.ifsc_code}</td>
                                <td>{b.is_active ? "Active" : "Inactive"}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5">No Data</td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </div>

        </AccountsBaseLayout>
    );
};

export default FinanceListView;






// import React, { useState, useEffect } from "react";
// import { apiRequest } from "../../services/api";
// import AccountsBaseLayout from "../components/AccountsBaseLayout";

// const FinanceListView = () => {
//     const [settings, setSettings] = useState(null);
//     const [banks, setBanks] = useState([]);

//     const localStyles = {
//         card: { backgroundColor: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: "25px" },
//         cardTitle: { fontSize: "18px", fontWeight: "700", color: "#1E293B", marginBottom: "20px", borderBottom: "2px solid #F1F5F9", paddingBottom: "10px" },
//         table: { width: "100%", borderCollapse: "collapse" },
//         miniLogo: { width: "70px", height: "70px", borderRadius: "8px", objectFit: "contain", border: "1px solid #E2E8F0" },
//         settingsHeader: { display: "flex", gap: "25px", alignItems: "center" },
//         th: { textAlign: "left", padding: "12px", fontSize: "13px", color: "#64748B", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" },
//         td: { padding: "12px", fontSize: "14px", color: "#1E293B", borderBottom: "1px solid #F1F5F9" }
//     };

//     useEffect(() => {
//         const loadData = async () => {
//             try {
//                 const sData = await apiRequest("/invoice/api/settings/", "GET");
//                 const bData = await apiRequest("/invoice/api/bank-accounts/", "GET");
//                 setSettings(sData);
//                 setBanks(bData.results || []);
//             } catch (err) { console.error("Error loading data", err); }
//         };
//         loadData();
//     }, []);

//     return (
//         <AccountsBaseLayout>
//         <div style={{ width: "100%" }}>
//             {settings && (
//                 <div style={localStyles.card}>
//                     <h3 style={localStyles.cardTitle}>Company Profile Overview</h3>
//                     <div style={localStyles.settingsHeader}>
//                         <img src={settings.logo_url || "https://via.placeholder.com/70"} alt="Logo" style={localStyles.miniLogo} />
//                         <div style={{flex: 1}}>
//                             <h3 style={{margin: 0, color: "#1E293B"}}>{settings.company_name || "Name Not Set"}</h3>
//                             <p style={{margin: "5px 0", color: "#64748B", fontSize: "14px"}}>{settings.address}</p>
//                         </div>
//                         <div style={{textAlign: "right", fontSize: "14px"}}>
//                             <p><b>GSTIN:</b> {settings.gstin}</p>
//                             <p><b>SAC:</b> {settings.default_sac_code}</p>
//                         </div>
//                     </div>
//                     <div style={{marginTop: "20px", display: "flex", gap: "30px", fontSize: "14px", borderTop: "1px solid #F1F5F9", paddingTop: "15px"}}>
//                         <span><b>Email:</b> {settings.email}</span>
//                         <span><b>Phone:</b> {settings.phone}</span>
//                         <span><b>GST Rate:</b> {settings.default_gst_rate}%</span>
//                     </div>
//                 </div>
//             )}

//             <div style={localStyles.card}>
//                 <h3 style={localStyles.cardTitle}>Registered Bank Accounts</h3>
//                 <div style={{ overflowX: "auto" }}>
//                     <table style={localStyles.table}>
//                         <thead>
//                             <tr>
//                                 <th style={localStyles.th}>Bank & Branch</th>
//                                 <th style={localStyles.th}>Account Holder</th>
//                                 <th style={localStyles.th}>Account & IFSC</th>
//                                 <th style={localStyles.th}>Status</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {banks.length > 0 ? banks.map(b => (
//                                 <tr key={b.id}>
//                                     <td style={localStyles.td}><b>{b.bank_name}</b><br/><small style={{color: "#64748B"}}>{b.branch}</small></td>
//                                     <td style={localStyles.td}>{b.account_holder_name}</td>
//                                     <td style={localStyles.td}>{b.account_number}<br/><small style={{color: "#64748B"}}>IFSC: {b.ifsc_code}</small></td>
//                                     <td style={localStyles.td}>
//                                         <span style={{color: b.is_active ? "#10B981" : "#EF4444", fontWeight: "700"}}>
//                                             {b.is_active ? "● Active" : "● Inactive"}
//                                         </span>
//                                     </td>
//                                 </tr>
//                             )) : (
//                                 <tr><td colSpan="4" style={{textAlign: "center", padding: "20px"}}>No bank accounts found.</td></tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//         </AccountsBaseLayout>
//     );
// };

// export default FinanceListView;