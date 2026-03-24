import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [generatingPdf, setGeneratingPdf] = useState({});

  // Fetch invoices
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
        
        // Calculate total pages
        const total = res.count || 0;
        const perPage = 10; // Assuming 10 items per page
        setTotalPages(Math.ceil(total / perPage));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      fetchInvoices(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchInvoices(page);
  };

  // Handle PDF Generate/Regenerate
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
        alert("PDF generated successfully!");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(prev => ({ ...prev, [invoiceId]: false }));
    }
  };

  // Format amount
  const formatAmount = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amt);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        <h2 style={{ margin: 0 }}>Invoices</h2>
        <span>Total: {total}</span>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Table */}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        backgroundColor: '#fff',
        border: '1px solid #ddd'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              Invoice #
            </th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              Date
            </th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              Bill To
            </th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              Candidates
            </th>
            <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>
              Amount
            </th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
              Status
            </th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
              PDF
            </th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {loading && invoices.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ padding: '40px', textAlign: 'center' }}>
                Loading...
              </td>
            </tr>
          ) : invoices.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ padding: '40px', textAlign: 'center' }}>
                No invoices found
              </td>
            </tr>
          ) : (
            invoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>
                  {inv.invoice_number}
                </td>
                <td style={{ padding: '10px' }}>
                  {inv.invoice_date}
                </td>
                <td style={{ padding: '10px' }}>
                  {inv.bill_to_name || '-'}
                </td>
                <td style={{ padding: '10px' }}>
                  {inv.candidate_names || '-'}
                </td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  {formatAmount(inv.total_amount)}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <span style={{
                    backgroundColor: inv.status === 'GENERATED' ? '#e3f2fd' : '#f5f5f5',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {inv.pdf_url ? (
                    <a 
                      href={inv.pdf_url.startsWith('http') ? inv.pdf_url : `http://127.0.0.1:8000${inv.pdf_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#2196f3', textDecoration: 'none' }}
                    >
                      View
                    </a>
                  ) : (
                    <span style={{ color: '#999' }}>-</span>
                  )}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <button
                    onClick={() => handlePdfGenerate(inv.id)}
                    disabled={generatingPdf[inv.id]}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: inv.pdf_url ? '#ff9800' : '#4caf50',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: generatingPdf[inv.id] ? 'not-allowed' : 'pointer',
                      opacity: generatingPdf[inv.id] ? 0.7 : 1,
                      fontSize: '12px'
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ 
          marginTop: '20px', 
          display: 'flex', 
          justifyContent: 'center',
          gap: '5px'
        }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer',
              opacity: (currentPage === 1 || loading) ? 0.5 : 1
            }}
          >
            Previous
          </button>
          
          {/* Page Numbers */}
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            // Show only current page, first, last, and nearby pages
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: currentPage === pageNum ? '#2196f3' : '#f5f5f5',
                    color: currentPage === pageNum ? '#fff' : '#000',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {pageNum}
                </button>
              );
            } else if (
              pageNum === currentPage - 3 ||
              pageNum === currentPage + 3
            ) {
              return <span key={pageNum} style={{ padding: '6px 12px' }}>...</span>;
            }
            return null;
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: (currentPage === totalPages || loading) ? 'not-allowed' : 'pointer',
              opacity: (currentPage === totalPages || loading) ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}



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