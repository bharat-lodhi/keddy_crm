import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../../services/api";
import SubAdminLayout from "../../components/SubAdminLayout";

export default function InvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [search, invoices]);

  const fetchInvoices = async () => {
    setLoading(true);
    const res = await apiRequest("/invoice/api/all/");
    if (res?.results) {
      setInvoices(res.results);
      setFilteredInvoices(res.results);
    }
    setLoading(false);
  };

  const applyFilter = () => {
    const s = search.toLowerCase();

    const filtered = invoices.filter((inv) =>
      inv.invoice_number?.toLowerCase().includes(s) ||
      inv.candidate_name?.toLowerCase().includes(s) ||
      inv.bill_to_name?.toLowerCase().includes(s) ||
      inv.status?.toLowerCase().includes(s)
    );

    setFilteredInvoices(filtered);
  };

  const openPreview = (id) => {
    navigate(`/sub-admin/invoice/preview/${id}`);
  };

  const openEdit = (id) => {
    navigate(`/sub-admin/invoice/edit/${id}`);
  };

  const openHistory = (candidateId) => {
    navigate(`/sub-admin/invoice/candidate-history/${candidateId}`);
  };

  const generatePDF = async (id) => {
    setPdfLoadingId(id);
    const res = await apiRequest(`/invoice/api/generate-pdf/${id}/`, "POST");
    setPdfLoadingId(null);

    if (res?.pdf_url) {
      window.open(res.pdf_url, "_blank");
      fetchInvoices();
    } else {
      alert("Failed to generate PDF");
    }
  };

  const formatMoney = (amt) => `₹ ${amt}`;

  if (loading) return <SubAdminLayout><div>Loading invoices...</div></SubAdminLayout>;

  return (
    <SubAdminLayout>
      <div>
        <h2>Invoice List</h2>

        <button onClick={() => navigate("/sub-admin/create-invoice")}>
          + Create Invoice
        </button>
        <button onClick={() => navigate("/sub-admin/invoice/settings")}>
          Manage settings
        </button>

        <br /><br />

        <input
          placeholder="Search invoice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <br /><br />

        <table border="1" cellPadding="8" width="100%">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Candidate</th>
              <th>Bill To</th>
              <th>Type</th>
              <th>Date</th>
              <th>Billing Month</th>
              <th>Total</th>
              <th>Status</th>
              <th>PDF</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan="10" align="center">No invoices found</td>
              </tr>
            )}

            {filteredInvoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.invoice_number}</td>
                <td>{inv.candidate_name || "-"}</td>
                <td>{inv.bill_to_name}</td>
                <td>{inv.invoice_type}</td>
                <td>{inv.invoice_date}</td>
                <td>{inv.billing_month}</td>
                <td>{formatMoney(inv.total_amount)}</td>
                <td>{inv.status}</td>

                <td>
                  {inv.pdf_file ? (
                    <>
                      <a href={inv.pdf_file} target="_blank" rel="noreferrer">
                        View PDF
                      </a>
                      {" "}
                      <button
                        onClick={() => generatePDF(inv.id)}
                        disabled={pdfLoadingId === inv.id}
                      >
                        {pdfLoadingId === inv.id ? "Updating..." : "Regenerate PDF"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => generatePDF(inv.id)}
                      disabled={pdfLoadingId === inv.id}
                    >
                      {pdfLoadingId === inv.id ? "Generating..." : "Generate PDF"}
                    </button>
                  )}
                </td>

                {/* <td>
                  <button onClick={() => openPreview(inv.id)}>Preview</button>{" "}
                  <button onClick={() => openEdit(inv.id)}>Edit</button>
                </td> */}

                <td>
                  <button onClick={() => openPreview(inv.id)}>Preview</button>{" "}
                  <button onClick={() => openEdit(inv.id)}>Edit</button>{" "}

                  {inv.candidate_id && (
                    <button onClick={() => openHistory(inv.candidate_id)}>
                      History
                    </button>
                  )}
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SubAdminLayout>
  );
}









// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest, API_BASE } from "../../../services/api";
// import SubAdminLayout from "../../components/SubAdminLayout";

// export default function InvoiceList() {
//   const navigate = useNavigate();
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pdfLoadingId, setPdfLoadingId] = useState(null);

//   useEffect(() => {
//     fetchInvoices();
//   }, []);

//   const fetchInvoices = async () => {
//     setLoading(true);
//     const res = await apiRequest("/invoice/api/all/");
//     if (res?.results) setInvoices(res.results);
//     setLoading(false);
//   };

//   const openPreview = (id) => {
//     navigate(`/sub-admin/invoice/preview/${id}`);
//   };

//   const openEdit = (id) => {
//     navigate(`/sub-admin/invoice/edit/${id}`);
//   };

//   const generatePDF = async (id) => {
//     setPdfLoadingId(id);

//     const res = await apiRequest(`/invoice/api/generate-pdf/${id}/`, "POST");

//     setPdfLoadingId(null);

//     if (res?.pdf_url) {
//       // ✅ open pdf instantly
//       window.open(`${API_BASE}${res.pdf_url}`, "_blank");

//       // ✅ refresh list so pdf_file update ho jaaye
//       fetchInvoices();
//     } else {
//       alert("Failed to generate PDF");
//     }
//   };

//   const formatMoney = (amt) => `₹ ${amt}`;

//   if (loading) return <div>Loading invoices...</div>;

//   return (
//     <SubAdminLayout>
//     <div>
//       <h2>Invoice List</h2>

//       <button onClick={() => navigate("/sub-admin/create-invoice")}>
//         + Create Invoice
//       </button>

//       <br /><br />

//       <table border="1" cellPadding="8" width="100%">
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Invoice No</th>
//             <th>Candidate</th>
//             <th>Bill To</th>
//             <th>Type</th>
//             <th>Date</th>
//             <th>Billing Month</th>
//             <th>Total</th>
//             <th>Status</th>
//             <th>PDF</th>
//             <th>Actions</th>
//           </tr>
//         </thead>

//         <tbody>
//           {invoices.length === 0 && (
//             <tr>
//               <td colSpan="11" align="center">No invoices found</td>
//             </tr>
//           )}

//           {invoices.map((inv) => (
//             <tr key={inv.id}>
//               <td>{inv.id}</td>
//               <td>{inv.invoice_number}</td>
//               <td>{inv.candidate_name || "-"}</td>
//               <td>{inv.bill_to_name}</td>
//               <td>{inv.invoice_type}</td>
//               <td>{inv.invoice_date}</td>
//               <td>{inv.billing_month}</td>
//               <td>{formatMoney(inv.total_amount)}</td>
//               <td>{inv.status}</td>

//               <td>
//                 {inv.pdf_file ? (
//                     <a
//                     href={inv.pdf_file}
//                     target="_blank"
//                     rel="noreferrer"
//                     >
//                     View PDF
//                     </a>
//                 ) : (
//                     <button
//                     onClick={() => generatePDF(inv.id)}
//                     disabled={pdfLoadingId === inv.id}
//                     >
//                     {pdfLoadingId === inv.id ? "Generating..." : "Generate PDF"}
//                     </button>
//                 )}
//                 </td>

//               <td>
//                 <button onClick={() => openPreview(inv.id)}>Preview</button>{" "}
//                 <button onClick={() => openEdit(inv.id)}>Edit</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//     </SubAdminLayout>
//   );
// }





// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../../services/api";
// import SubAdminLayout from "../../components/SubAdminLayout";

// export default function InvoiceList() {
//   const navigate = useNavigate();
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pdfLoadingId, setPdfLoadingId] = useState(null);

//   useEffect(() => {
//     fetchInvoices();
//   }, []);

//   const fetchInvoices = async () => {
//     setLoading(true);
//     const res = await apiRequest("/invoice/api/all/");
//     if (res?.results) setInvoices(res.results);
//     setLoading(false);
//   };

//   const openPreview = (id) => {
//     navigate(`/sub-admin/invoice/preview/${id}`);
//   };

//   const openEdit = (id) => {
//     navigate(`/sub-admin/invoice/edit/${id}`);
//   };

//   const generatePDF = async (id) => {
//     setPdfLoadingId(id);
//     const res = await apiRequest(`/invoice/api/generate-pdf/${id}/`, "POST");
//     setPdfLoadingId(null);

//     if (res?.message) {
//       alert("PDF Generated Successfully");
//       fetchInvoices(); // refresh list
//     } else {
//       alert("Failed to generate PDF");
//     }
//   };

//   const formatMoney = (amt) => `₹ ${amt}`;

//   if (loading) return <div>Loading invoices...</div>;

//   return (
//     <SubAdminLayout>
//     <div>
//       <h2>Invoice List</h2>

//       <button onClick={() => navigate("/sub-admin/create-invoice")}>
//         + Create Invoice
//       </button>

//       <br /><br />

//       <table border="1" cellPadding="8" width="100%">
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Invoice No</th>
//             <th>Candidate</th>
//             <th>Bill To</th>
//             <th>Type</th>
//             <th>Date</th>
//             <th>Billing Month</th>
//             <th>Total</th>
//             <th>Status</th>
//             <th>PDF</th>
//             <th>Actions</th>
//           </tr>
//         </thead>

//         <tbody>
//           {invoices.length === 0 && (
//             <tr>
//               <td colSpan="11" align="center">No invoices found</td>
//             </tr>
//           )}

//           {invoices.map((inv) => (
//             <tr key={inv.id}>
//               <td>{inv.id}</td>
//               <td>{inv.invoice_number}</td>
//               <td>{inv.candidate_name || "-"}</td>
//               <td>{inv.bill_to_name}</td>
//               <td>{inv.invoice_type}</td>
//               <td>{inv.invoice_date}</td>
//               <td>{inv.billing_month}</td>
//               <td>{formatMoney(inv.total_amount)}</td>
//               <td>{inv.status}</td>
//               <td>{inv.pdf_file ? "Generated" : "Not Generated"}</td>

//               <td>
//                 <button onClick={() => openPreview(inv.id)}>Preview</button>{" "}
//                 <button onClick={() => openEdit(inv.id)}>Edit</button>{" "}
//                 <button
//                   onClick={() => generatePDF(inv.id)}
//                   disabled={pdfLoadingId === inv.id}
//                 >
//                   {pdfLoadingId === inv.id ? "Generating..." : "Generate PDF"}
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//     </SubAdminLayout>
//   );
// }