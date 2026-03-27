import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest,API_BASE } from "../../services/api";
import AccountsBaseLayout from "../components/AccountsBaseLayout";

// Toaster Component
const Toaster = ({ msg, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      ...styles.toaster,
      backgroundColor: type === 'error' ? '#EF4444' : '#10B981'
    }}>
      {msg}
    </div>
  );
};

const Icons = {
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>

}

export default function InvoiceList() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState({});

  const notify = (msg, type = "success") => setToast({ show: true, msg, type });

  const fetchInvoices = async (page = 1) => {
    setLoading(true);
    try {
      let apiUrl = `/invoice/api/all/?page=${page}`;
      if (search) {
        apiUrl = `/invoice/api/all/?search=${search}&page=${page}`;
      }
      
      const res = await apiRequest(apiUrl);
      if (res) {
        setInvoices(res.results || []);
        setTotal(res.count || 0);
        setHasNext(!!res.next);
        setHasPrevious(!!res.previous);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (page) => {
    fetchInvoices(page);
  };

  const handlePdfGenerate = async (invoiceId) => {
    setGeneratingPdf(prev => ({ ...prev, [invoiceId]: true }));
    try {
      const response = await apiRequest(`/invoice/api/generate-pdf/${invoiceId}/`, "POST");
      if (response && response.pdf_url) {
        setInvoices(prev => prev.map(inv => 
          inv.id === invoiceId 
            ? { ...inv, pdf_url: response.pdf_url }
            : inv
        ));
        notify("PDF generated successfully!");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      notify("Failed to generate PDF. Please try again.", "error");
    } finally {
      setGeneratingPdf(prev => ({ ...prev, [invoiceId]: false }));
    }
  };

  const formatAmount = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amt);
  };

  return (
    <AccountsBaseLayout>
      {toast.show && <Toaster msg={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      <div style={styles.topNav}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
          <h2 style={styles.pageTitle}>Invoices ({total})</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => navigate("/accounts/create-invoice")} style={styles.createBtn}>+ Create Invoice</button>
          
          <button style={styles.settingsBtn} onClick={() => navigate("/accounts/finance-overview")} title="Settings">
                        <Icons.Settings />
          </button>

        </div>
      </div>

      <div style={styles.searchRow}>
        <input
          type="text"
          placeholder="Search by invoice number, bill to or candidate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Invoice #</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Bill To</th>
              <th style={styles.th}>Candidates</th>
              <th style={{...styles.th, textAlign: 'right'}}>Amount</th>
              <th style={{...styles.th, textAlign: 'center'}}>Status</th>
              <th style={{...styles.th, textAlign: 'center'}}>PDF</th>
              <th style={{...styles.th, textAlign: 'center'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && invoices.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '40px', textAlign: 'center' }}>No invoices found</td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} style={styles.tableRow}>
                  <td style={styles.td}>{inv.invoice_number}</td>
                  <td style={styles.td}>{new Date(inv.invoice_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td style={styles.td}>{inv.bill_to_name || '-'}</td>
                  <td style={styles.td}>{inv.candidate_names || '-'}</td>
                  <td style={{...styles.td, textAlign: 'right', fontWeight: '700'}}>
                    {formatAmount(inv.total_amount)}
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: inv.status === 'GENERATED' ? '#E0F2FE' : '#F1F5F9',
                      color: inv.status === 'GENERATED' ? '#0369A1' : '#64748B'
                    }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    {inv.pdf_url ? (
                      <a 
                        
                        href={inv.pdf_url.startsWith('http') ? inv.pdf_url : `${API_BASE}${inv.pdf_url}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={styles.viewLink}
                      >
                        View
                      </a>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>-</span>
                    )}
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <button
                      onClick={() => handlePdfGenerate(inv.id)}
                      disabled={generatingPdf[inv.id]}
                      style={{
                        ...styles.actionBtn,
                        backgroundColor: inv.pdf_url ? '#1E293B' : '#FF9B51',
                        opacity: generatingPdf[inv.id] ? 0.7 : 1,
                        cursor: generatingPdf[inv.id] ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {generatingPdf[inv.id] ? 'Generating...' : (inv.pdf_url ? 'Regenerate PDF' : 'Generate PDF')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(hasNext || hasPrevious) && (
        <div style={styles.paginationContainer}>
          <div style={styles.pageInfo}>
            Showing {invoices.length} of {total} invoices
          </div>
          <div style={styles.paginationBtns}>
            <button
              disabled={!hasPrevious || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{ ...styles.pageBtn, opacity: !hasPrevious ? 0.5 : 1, cursor: !hasPrevious ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <span style={styles.currentPageText}>Page {currentPage}</span>
            <button
              disabled={!hasNext || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{ ...styles.pageBtn, opacity: !hasNext ? 0.5 : 1, cursor: !hasNext ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AccountsBaseLayout>
  );
}

const styles = {
  toaster: { position: 'fixed', top: '20px', right: '20px', color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 10001, fontWeight: '700', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  topNav: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  backBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: '13px' },
  createBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: '13px' },
  settingsBtn: { background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0", padding: "10px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },

  pageTitle: { fontSize: "22px", fontWeight: "800", color: "#1E293B", margin: 0 },
  searchRow: { marginBottom: "20px" },
  searchInput: { padding: "12px 16px", borderRadius: "10px", border: "1px solid #E2E8F0", width: '100%', outline: 'none', fontSize: '14px', boxSizing: 'border-box' },
  tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { background: "#F8FAFC" },
  th: { padding: "14px 12px", textAlign: "left", fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: '800', borderBottom: "1px solid #E2E8F0" },
  tableRow: { borderBottom: "1px solid #F1F5F9" },
  td: { padding: "14px 12px", fontSize: "13px", color: "#1E293B" },
  statusBadge: { padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' },
  viewLink: { color: '#FF9B51', textDecoration: 'none', fontWeight: '700', fontSize: '12px' },
  actionBtn: { color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '11px' },
  paginationContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "25px", padding: "10px" },
  pageInfo: { fontSize: "13px", color: "#64748B", fontWeight: "600" },
  paginationBtns: { display: "flex", alignItems: "center", gap: "12px" },
  pageBtn: { padding: "7px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", fontSize: "13px", fontWeight: "600", color: "#1E293B" },
  currentPageText: { fontWeight: "700", color: "#1E293B", fontSize: "13px" }
};







// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import AccountsBaseLayout from "../components/AccountsBaseLayout";

// export default function InvoiceList() {
//   const navigate = useNavigate();
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [hasNext, setHasNext] = useState(false);
//   const [hasPrevious, setHasPrevious] = useState(false);
//   const [generatingPdf, setGeneratingPdf] = useState({});

//   const fetchInvoices = async (page = 1) => {
//     setLoading(true);
//     try {
//       let apiUrl = `/invoice/api/all/?page=${page}`;
//       if (search) {
//         apiUrl = `/invoice/api/all/?search=${search}&page=${page}`;
//       }
      
//       const res = await apiRequest(apiUrl);
//       if (res) {
//         setInvoices(res.results || []);
//         setTotal(res.count || 0);
//         // API response ke "next" aur "previous" field se buttons control honge
//         setHasNext(!!res.next);
//         setHasPrevious(!!res.previous);
//         setCurrentPage(page);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchInvoices(1);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [search]);

//   const handlePageChange = (page) => {
//     fetchInvoices(page);
//   };

//   const handlePdfGenerate = async (invoiceId) => {
//     setGeneratingPdf(prev => ({ ...prev, [invoiceId]: true }));
//     try {
//       const response = await apiRequest(`/invoice/api/generate-pdf/${invoiceId}/`, "POST");
//       if (response && response.pdf_url) {
//         setInvoices(prev => prev.map(inv => 
//           inv.id === invoiceId 
//             ? { ...inv, pdf_url: response.pdf_url }
//             : inv
//         ));
//         alert("PDF generated successfully!");
//       }
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       alert("Failed to generate PDF. Please try again.");
//     } finally {
//       setGeneratingPdf(prev => ({ ...prev, [invoiceId]: false }));
//     }
//   };

//   const formatAmount = (amt) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR'
//     }).format(amt);
//   };

//   return (
//     <AccountsBaseLayout>
//       {/* Top Navigation Row */}
//       <div style={styles.topNav}>
//         <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
//           <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
//           <h2 style={styles.pageTitle}>Invoices ({total})</h2>
//         </div>
//         <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
//           <button onClick={() => navigate("/accounts/create-invoice")} style={styles.createBtn}>+ Create Invoice</button>
//           <button style={styles.settingsBtn}>
//              <span style={{ fontSize: '18px' }}>⚙</span>
//           </button>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div style={styles.searchRow}>
//         <input
//           type="text"
//           placeholder="Search by invoice number, bill to or candidate..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           style={styles.searchInput}
//         />
//       </div>

//       <div style={styles.tableWrapper}>
//         <table style={styles.table}>
//           <thead>
//             <tr style={styles.tableHeader}>
//               <th style={styles.th}>Invoice #</th>
//               <th style={styles.th}>Date</th>
//               <th style={styles.th}>Bill To</th>
//               <th style={styles.th}>Candidates</th>
//               <th style={{...styles.th, textAlign: 'right'}}>Amount</th>
//               <th style={{...styles.th, textAlign: 'center'}}>Status</th>
//               <th style={{...styles.th, textAlign: 'center'}}>PDF</th>
//               <th style={{...styles.th, textAlign: 'center'}}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading && invoices.length === 0 ? (
//               <tr>
//                 <td colSpan="8" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td>
//               </tr>
//             ) : invoices.length === 0 ? (
//               <tr>
//                 <td colSpan="8" style={{ padding: '40px', textAlign: 'center' }}>No invoices found</td>
//               </tr>
//             ) : (
//               invoices.map((inv) => (
//                 <tr key={inv.id} style={styles.tableRow}>
//                   <td style={styles.td}>{inv.invoice_number}</td>
//                   <td style={styles.td}>{inv.invoice_date}</td>
//                   <td style={styles.td}>{inv.bill_to_name || '-'}</td>
//                   <td style={styles.td}>{inv.candidate_names || '-'}</td>
//                   <td style={{...styles.td, textAlign: 'right', fontWeight: '700'}}>
//                     {formatAmount(inv.total_amount)}
//                   </td>
//                   <td style={{...styles.td, textAlign: 'center'}}>
//                     <span style={{
//                       ...styles.statusBadge,
//                       backgroundColor: inv.status === 'GENERATED' ? '#E0F2FE' : '#F1F5F9',
//                       color: inv.status === 'GENERATED' ? '#0369A1' : '#64748B'
//                     }}>
//                       {inv.status}
//                     </span>
//                   </td>
//                   <td style={{...styles.td, textAlign: 'center'}}>
//                     {inv.pdf_url ? (
//                       <a 
//                         href={inv.pdf_url.startsWith('http') ? inv.pdf_url : `http://127.0.0.1:8000${inv.pdf_url}`} 
//                         target="_blank" 
//                         rel="noopener noreferrer"
//                         style={styles.viewLink}
//                       >
//                         View
//                       </a>
//                     ) : (
//                       <span style={{ color: '#94A3B8' }}>-</span>
//                     )}
//                   </td>
//                   <td style={{...styles.td, textAlign: 'center'}}>
//                     <button
//                       onClick={() => handlePdfGenerate(inv.id)}
//                       disabled={generatingPdf[inv.id]}
//                       style={{
//                         ...styles.actionBtn,
//                         backgroundColor: inv.pdf_url ? '#1E293B' : '#FF9B51',
//                         opacity: generatingPdf[inv.id] ? 0.7 : 1,
//                         cursor: generatingPdf[inv.id] ? 'not-allowed' : 'pointer'
//                       }}
//                     >
//                       {generatingPdf[inv.id] ? 'Generating...' : (inv.pdf_url ? 'Regenerate PDF' : 'Generate PDF')}
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination Controls based on API "next" and "previous" */}
//       {(hasNext || hasPrevious) && (
//         <div style={styles.paginationContainer}>
//           <div style={styles.pageInfo}>
//             Showing {invoices.length} of {total} invoices
//           </div>
//           <div style={styles.paginationBtns}>
//             <button
//               disabled={!hasPrevious || loading}
//               onClick={() => handlePageChange(currentPage - 1)}
//               style={{ ...styles.pageBtn, opacity: !hasPrevious ? 0.5 : 1, cursor: !hasPrevious ? 'not-allowed' : 'pointer' }}
//             >
//               Previous
//             </button>
//             <span style={styles.currentPageText}>Page {currentPage}</span>
//             <button
//               disabled={!hasNext || loading}
//               onClick={() => handlePageChange(currentPage + 1)}
//               style={{ ...styles.pageBtn, opacity: !hasNext ? 0.5 : 1, cursor: !hasNext ? 'not-allowed' : 'pointer' }}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}
//     </AccountsBaseLayout>
//   );
// }

// const styles = {
//   topNav: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
//   backBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: '13px' },
//   createBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: '13px' },
//   settingsBtn: { background: "#F1F5F9", color: "#1E293B", border: "1px solid #E2E8F0", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center' },
//   pageTitle: { fontSize: "22px", fontWeight: "800", color: "#1E293B", margin: 0 },
//   searchRow: { marginBottom: "20px" },
//   searchInput: { padding: "12px 16px", borderRadius: "10px", border: "1px solid #E2E8F0", width: '100%', outline: 'none', fontSize: '14px', boxSizing: 'border-box' },
//   tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" },
//   table: { width: "100%", borderCollapse: "collapse" },
//   tableHeader: { background: "#F8FAFC" },
//   th: { padding: "14px 12px", textAlign: "left", fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: '800', borderBottom: "1px solid #E2E8F0" },
//   tableRow: { borderBottom: "1px solid #F1F5F9" },
//   td: { padding: "14px 12px", fontSize: "13px", color: "#1E293B" },
//   statusBadge: { padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' },
//   viewLink: { color: '#FF9B51', textDecoration: 'none', fontWeight: '700', fontSize: '12px' },
//   actionBtn: { color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '11px' },
//   paginationContainer: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "25px", padding: "10px" },
//   pageInfo: { fontSize: "13px", color: "#64748B", fontWeight: "600" },
//   paginationBtns: { display: "flex", alignItems: "center", gap: "12px" },
//   pageBtn: { padding: "7px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#fff", fontSize: "13px", fontWeight: "600", color: "#1E293B" },
//   currentPageText: { fontWeight: "700", color: "#1E293B", fontSize: "13px" }
// };








// import React, { useEffect, useState } from "react";
// import { apiRequest } from "../../services/api";

// export default function InvoiceList() {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [generatingPdf, setGeneratingPdf] = useState({});

//   // Fetch invoices
//   const fetchInvoices = async (page = 1) => {
//     setLoading(true);
//     try {
//       let apiUrl = `/invoice/api/all/?page=${page}`;
//       if (search) {
//         apiUrl = `/invoice/api/all/?search=${search}&page=${page}`;
//       }
      
//       const res = await apiRequest(apiUrl);
//       if (res) {
//         setInvoices(res.results || []);
//         setTotal(res.count || 0);
        
//         // Calculate total pages
//         const total = res.count || 0;
//         const perPage = 10; // Assuming 10 items per page
//         setTotalPages(Math.ceil(total / perPage));
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setCurrentPage(1); // Reset to first page on search
//       fetchInvoices(1);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [search]);

//   // Handle page change
//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//     fetchInvoices(page);
//   };

//   // Handle PDF Generate/Regenerate
//   const handlePdfGenerate = async (invoiceId) => {
//     setGeneratingPdf(prev => ({ ...prev, [invoiceId]: true }));
//     try {
//       const response = await apiRequest(`/invoice/api/generate-pdf/${invoiceId}/`, "POST");
      
//       if (response && response.pdf_url) {
//         setInvoices(prev => prev.map(inv => 
//           inv.id === invoiceId 
//             ? { ...inv, pdf_url: response.pdf_url }
//             : inv
//         ));
//         alert("PDF generated successfully!");
//       }
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       alert("Failed to generate PDF. Please try again.");
//     } finally {
//       setGeneratingPdf(prev => ({ ...prev, [invoiceId]: false }));
//     }
//   };

//   // Format amount
//   const formatAmount = (amt) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR'
//     }).format(amt);
//   };

//   return (
//     <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
//       {/* Header */}
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center',
//         marginBottom: '20px' 
//       }}>
//         <h2 style={{ margin: 0 }}>Invoices</h2>
//         <span>Total: {total}</span>
//       </div>

//       {/* Search */}
//       <div style={{ marginBottom: '20px' }}>
//         <input
//           type="text"
//           placeholder="Search invoices..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           style={{
//             width: '100%',
//             padding: '8px 12px',
//             border: '1px solid #ddd',
//             borderRadius: '4px'
//           }}
//         />
//       </div>

//       {/* Table */}
//       <table style={{ 
//         width: '100%', 
//         borderCollapse: 'collapse',
//         backgroundColor: '#fff',
//         border: '1px solid #ddd'
//       }}>
//         <thead>
//           <tr style={{ backgroundColor: '#f5f5f5' }}>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
//               Invoice #
//             </th>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
//               Date
//             </th>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
//               Bill To
//             </th>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
//               Candidates
//             </th>
//             <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
//               Amount
//             </th>
//             <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
//               Status
//             </th>
//             <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
//               PDF
//             </th>
//             <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
//               Action
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {loading && invoices.length === 0 ? (
//             <tr>
//               <td colSpan="8" style={{ padding: '40px', textAlign: 'center' }}>
//                 Loading...
//               </td>
//             </tr>
//           ) : invoices.length === 0 ? (
//             <tr>
//               <td colSpan="8" style={{ padding: '40px', textAlign: 'center' }}>
//                 No invoices found
//               </td>
//             </tr>
//           ) : (
//             invoices.map((inv) => (
//               <tr key={inv.id} style={{ borderBottom: '1px solid #eee' }}>
//                 <td style={{ padding: '10px' }}>
//                   {inv.invoice_number}
//                 </td>
//                 <td style={{ padding: '10px' }}>
//                   {inv.invoice_date}
//                 </td>
//                 <td style={{ padding: '10px' }}>
//                   {inv.bill_to_name || '-'}
//                 </td>
//                 <td style={{ padding: '10px' }}>
//                   {inv.candidate_names || '-'}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'right' }}>
//                   {formatAmount(inv.total_amount)}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   <span style={{
//                     backgroundColor: inv.status === 'GENERATED' ? '#e3f2fd' : '#f5f5f5',
//                     padding: '4px 8px',
//                     borderRadius: '4px',
//                     fontSize: '12px'
//                   }}>
//                     {inv.status}
//                   </span>
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   {inv.pdf_url ? (
//                     <a 
//                       href={inv.pdf_url.startsWith('http') ? inv.pdf_url : `http://127.0.0.1:8000${inv.pdf_url}`} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       style={{ color: '#2196f3', textDecoration: 'none' }}
//                     >
//                       View
//                     </a>
//                   ) : (
//                     <span style={{ color: '#999' }}>-</span>
//                   )}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   <button
//                     onClick={() => handlePdfGenerate(inv.id)}
//                     disabled={generatingPdf[inv.id]}
//                     style={{
//                       padding: '4px 12px',
//                       backgroundColor: inv.pdf_url ? '#ff9800' : '#4caf50',
//                       color: '#fff',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: generatingPdf[inv.id] ? 'not-allowed' : 'pointer',
//                       opacity: generatingPdf[inv.id] ? 0.7 : 1,
//                       fontSize: '12px'
//                     }}
//                   >
//                     {generatingPdf[inv.id] ? 'Generating...' : (inv.pdf_url ? 'Regenerate PDF' : 'Generate PDF')}
//                   </button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div style={{ 
//           marginTop: '20px', 
//           display: 'flex', 
//           justifyContent: 'center',
//           gap: '5px'
//         }}>
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1 || loading}
//             style={{
//               padding: '6px 12px',
//               backgroundColor: '#f5f5f5',
//               border: '1px solid #ddd',
//               borderRadius: '4px',
//               cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer',
//               opacity: (currentPage === 1 || loading) ? 0.5 : 1
//             }}
//           >
//             Previous
//           </button>
          
//           {/* Page Numbers */}
//           {[...Array(totalPages)].map((_, index) => {
//             const pageNum = index + 1;
//             // Show only current page, first, last, and nearby pages
//             if (
//               pageNum === 1 ||
//               pageNum === totalPages ||
//               (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
//             ) {
//               return (
//                 <button
//                   key={pageNum}
//                   onClick={() => handlePageChange(pageNum)}
//                   disabled={loading}
//                   style={{
//                     padding: '6px 12px',
//                     backgroundColor: currentPage === pageNum ? '#2196f3' : '#f5f5f5',
//                     color: currentPage === pageNum ? '#fff' : '#000',
//                     border: '1px solid #ddd',
//                     borderRadius: '4px',
//                     cursor: loading ? 'not-allowed' : 'pointer',
//                     opacity: loading ? 0.5 : 1
//                   }}
//                 >
//                   {pageNum}
//                 </button>
//               );
//             } else if (
//               pageNum === currentPage - 3 ||
//               pageNum === currentPage + 3
//             ) {
//               return <span key={pageNum} style={{ padding: '6px 12px' }}>...</span>;
//             }
//             return null;
//           })}
          
//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages || loading}
//             style={{
//               padding: '6px 12px',
//               backgroundColor: '#f5f5f5',
//               border: '1px solid #ddd',
//               borderRadius: '4px',
//               cursor: (currentPage === totalPages || loading) ? 'not-allowed' : 'pointer',
//               opacity: (currentPage === totalPages || loading) ? 0.5 : 1
//             }}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }






// import React, { useEffect, useState } from "react";
// import { apiRequest } from "../../services/api";

// export default function InvoiceList() {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState("");
//   const [generatingPdf, setGeneratingPdf] = useState({}); // Track PDF generation state per invoice

//   // Fetch invoices
//   const fetchInvoices = async () => {
//     setLoading(true);
//     try {
//       let apiUrl = `/invoice/api/all/`;
//       if (search) {
//         apiUrl = `/invoice/api/all/?search=${search}`;
//       }
      
//       const res = await apiRequest(apiUrl);
//       if (res) {
//         setInvoices(res.results || []);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchInvoices();
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [search]);

//   // Handle PDF Generate/Regenerate
//   const handlePdfGenerate = async (invoiceId) => {
//     setGeneratingPdf(prev => ({ ...prev, [invoiceId]: true }));
//     try {
//       const response = await apiRequest(`/invoice/api/generate-pdf/${invoiceId}/`, "POST");
      
//       if (response && response.pdf_url) {
//         // Update the invoice in the list with new PDF URL
//         setInvoices(prev => prev.map(inv => 
//           inv.id === invoiceId 
//             ? { ...inv, pdf_url: response.pdf_url }
//             : inv
//         ));
//         alert("PDF generated successfully!");
//       }
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       alert("Failed to generate PDF. Please try again.");
//     } finally {
//       setGeneratingPdf(prev => ({ ...prev, [invoiceId]: false }));
//     }
//   };

//   // Format amount
//   const formatAmount = (amt) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR'
//     }).format(amt);
//   };

//   return (
//     <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
//       {/* Header */}
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center',
//         marginBottom: '20px' 
//       }}>
//         <h2 style={{ margin: 0 }}>Invoices</h2>
//         <span>Total: {invoices.length}</span>
//       </div>

//       {/* Search */}
//       <div style={{ marginBottom: '20px' }}>
//         <input
//           type="text"
//           placeholder="Search invoices..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           style={{
//             width: '100%',
//             padding: '8px 12px',
//             border: '1px solid #ddd',
//             borderRadius: '4px'
//           }}
//         />
//       </div>

//       {/* Table */}
//       <table style={{ 
//         width: '100%', 
//         borderCollapse: 'collapse',
//         backgroundColor: '#fff',
//         border: '1px solid #ddd'
//       }}>
//         <thead>
//           <tr style={{ backgroundColor: '#f5f5f5' }}>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
//               Invoice #
//             </th>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
//               Date
//             </th>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
//               Bill To
//             </th>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
//               Candidates
//             </th>
//             <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
//               Amount
//             </th>
//             <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
//               Status
//             </th>
//             <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
//               PDF
//             </th>
//             <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
//               Action
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {loading && invoices.length === 0 ? (
//             <tr>
//               <td colSpan="8" style={{ padding: '40px', textAlign: 'center' }}>
//                 Loading...
//               </td>
//             </tr>
//           ) : invoices.length === 0 ? (
//             <tr>
//               <td colSpan="8" style={{ padding: '40px', textAlign: 'center' }}>
//                 No invoices found
//               </td>
//             </tr>
//           ) : (
//             invoices.map((inv) => (
//               <tr key={inv.id} style={{ borderBottom: '1px solid #eee' }}>
//                 <td style={{ padding: '10px' }}>
//                   {inv.invoice_number}
//                 </td>
//                 <td style={{ padding: '10px' }}>
//                   {inv.invoice_date}
//                 </td>
//                 <td style={{ padding: '10px' }}>
//                   {inv.bill_to_name || '-'}
//                 </td>
//                 <td style={{ padding: '10px' }}>
//                   {inv.candidate_names || '-'}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'right' }}>
//                   {formatAmount(inv.total_amount)}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   <span style={{
//                     backgroundColor: inv.status === 'GENERATED' ? '#e3f2fd' : '#f5f5f5',
//                     padding: '4px 8px',
//                     borderRadius: '4px',
//                     fontSize: '12px'
//                   }}>
//                     {inv.status}
//                   </span>
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   {inv.pdf_url ? (
//                     <a 
//                       href={inv.pdf_url.startsWith('http') ? inv.pdf_url : `http://127.0.0.1:8000${inv.pdf_url}`} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       style={{ color: '#2196f3', textDecoration: 'none' }}
//                     >
//                       View
//                     </a>
//                   ) : (
//                     <span style={{ color: '#999' }}>-</span>
//                   )}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   <button
//                     onClick={() => handlePdfGenerate(inv.id)}
//                     disabled={generatingPdf[inv.id]}
//                     style={{
//                       padding: '4px 12px',
//                       backgroundColor: inv.pdf_url ? '#ff9800' : '#4caf50',
//                       color: '#fff',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: generatingPdf[inv.id] ? 'not-allowed' : 'pointer',
//                       opacity: generatingPdf[inv.id] ? 0.7 : 1,
//                       fontSize: '12px'
//                     }}
//                   >
//                     {generatingPdf[inv.id] ? 'Generating...' : (inv.pdf_url ? 'Regenerate PDF' : 'Generate PDF')}
//                   </button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }








// import React, { useEffect, useState } from "react";
// import { apiRequest } from "../../services/api";

// export default function InvoiceList() {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState("");
//   const [nextPage, setNextPage] = useState(null);
//   const [total, setTotal] = useState(0);

//   // Fetch invoices
//   const fetchInvoices = async (url = null) => {
//     setLoading(true);
//     try {
//       let apiUrl = url || `/invoice/api/all/`;
//       if (search && !url) {
//         apiUrl = `/invoice/api/all/?search=${search}`;
//       }
      
//       const res = await apiRequest(apiUrl);
//       if (res) {
//         if (url) {
//           setInvoices(prev => [...prev, ...res.results]);
//         } else {
//           setInvoices(res.results);
//         }
//         setNextPage(res.next);
//         setTotal(res.count);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchInvoices();
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [search]);

//   // Format amount
//   const formatAmount = (amt) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR'
//     }).format(amt);
//   };

//   return (
//     <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
//       {/* Header */}
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center',
//         marginBottom: '20px' 
//       }}>
//         <h2 style={{ margin: 0 }}>Invoices</h2>
//         <span>Total: {total}</span>
//       </div>

//       {/* Search */}
//       <div style={{ marginBottom: '20px' }}>
//         <input
//           type="text"
//           placeholder="Search invoices..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           style={{
//             width: '100%',
//             padding: '8px 12px',
//             border: '1px solid #ddd',
//             borderRadius: '4px'
//           }}
//         />
//       </div>

//       {/* Table */}
//       <table style={{ 
//         width: '100%', 
//         borderCollapse: 'collapse',
//         backgroundColor: '#fff',
//         border: '1px solid #ddd'
//       }}>
//         <thead>
//           <tr style={{ backgroundColor: '#f5f5f5' }}>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
//               Invoice #
//             </th>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
//               Date
//             </th>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
//               Bill To
//             </th>
//             <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
//               Candidates
//             </th>
//             <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
//               Amount
//             </th>
//             <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
//               Status
//             </th>
//             <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
//               PDF
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {loading && invoices.length === 0 ? (
//             <tr>
//               <td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>
//                 Loading...
//               </td>
//             </tr>
//           ) : invoices.length === 0 ? (
//             <tr>
//               <td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>
//                 No invoices found
//               </td>
//             </tr>
//           ) : (
//             invoices.map((inv) => (
//               <tr key={inv.id} style={{ borderBottom: '1px solid #eee' }}>
//                 <td style={{ padding: '10px' }}>
//                   {inv.invoice_number}
//                 </td>
//                 <td style={{ padding: '10px' }}>
//                   {inv.invoice_date}
//                 </td>
//                 <td style={{ padding: '10px' }}>
//                   {inv.bill_to_name || '-'}
//                 </td>
//                 <td style={{ padding: '10px' }}>
//                   {inv.candidate_names || '-'}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'right' }}>
//                   {formatAmount(inv.total_amount)}
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   <span style={{
//                     backgroundColor: inv.status === 'GENERATED' ? '#e3f2fd' : '#f5f5f5',
//                     padding: '4px 8px',
//                     borderRadius: '4px',
//                     fontSize: '12px'
//                   }}>
//                     {inv.status}
//                   </span>
//                 </td>
//                 <td style={{ padding: '10px', textAlign: 'center' }}>
//                   {inv.pdf_url ? (
//                     <a 
//                       href={inv.pdf_url} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       style={{ color: '#2196f3', textDecoration: 'none' }}
//                     >
//                       View
//                     </a>
//                   ) : (
//                     <span style={{ color: '#999' }}>-</span>
//                   )}
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>

//       {/* Load More */}
//       {nextPage && (
//         <div style={{ marginTop: '20px', textAlign: 'center' }}>
//           <button
//             onClick={() => fetchInvoices(nextPage)}
//             disabled={loading}
//             style={{
//               padding: '8px 16px',
//               backgroundColor: '#2196f3',
//               color: '#fff',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: loading ? 'not-allowed' : 'pointer',
//               opacity: loading ? 0.7 : 1
//             }}
//           >
//             {loading ? 'Loading...' : 'Load More'}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }