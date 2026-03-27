import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
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

// Add Client Modal Component
const AddClientModal = ({ isOpen, onClose, onClientAdded, notify }) => {
  const [formData, setFormData] = useState({
    client_name: "", company_name: "", phone_number: "", email: "",
    gst_number: "", billing_address: "", account_holder_name: "",
    bank_name: "", account_number: "", ifsc_code: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let newErrors = {};
    if (!formData.client_name.trim()) newErrors.client_name = "Client Name is required";
    if (!formData.phone_number.trim()) newErrors.phone_number = "Phone Number is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.billing_address.trim()) newErrors.billing_address = "Address is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      notify("Please fix the errors", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest("/invoice/api/clients/", "POST", formData);
      if (response) {
        onClientAdded(response);
        notify("Client added successfully!");
        onClose();
        setFormData({
          client_name: "", company_name: "", phone_number: "", email: "",
          gst_number: "", billing_address: "", account_holder_name: "",
          bank_name: "", account_number: "", ifsc_code: ""
        });
        setErrors({});
      }
    } catch (error) {
      notify("Client creation failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modernModalContent}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Add New Client</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.modalFormWrapper}>
          <div style={styles.modalBody}>
            <div style={styles.formSectionTitle}>Basic Information</div>
            <div style={styles.formGridModern}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Client Name *</label>
                <input style={{...styles.input, borderColor: errors.client_name ? '#EF4444' : '#E2E8F0'}} type="text" value={formData.client_name} onChange={e => setFormData({ ...formData, client_name: e.target.value })} />
                {errors.client_name && <span style={styles.errorText}>{errors.client_name}</span>}
              </div>
              <div style={styles.inputGroup}><label style={styles.label}>Company Name</label><input style={styles.input} type="text" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} /></div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number *</label>
                <input style={{...styles.input, borderColor: errors.phone_number ? '#EF4444' : '#E2E8F0'}} type="tel" value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} />
                {errors.phone_number && <span style={styles.errorText}>{errors.phone_number}</span>}
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email *</label>
                <input style={{...styles.input, borderColor: errors.email ? '#EF4444' : '#E2E8F0'}} type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>
              <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}><label style={styles.label}>GST Number</label><input style={styles.input} type="text" value={formData.gst_number} onChange={e => setFormData({ ...formData, gst_number: e.target.value })} /></div>
              <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Billing Address *</label>
                <textarea style={{...styles.textarea, borderColor: errors.billing_address ? '#EF4444' : '#E2E8F0'}} value={formData.billing_address} onChange={e => setFormData({ ...formData, billing_address: e.target.value })} />
                {errors.billing_address && <span style={styles.errorText}>{errors.billing_address}</span>}
              </div>
            </div>
            
            <div style={styles.formSectionTitle}>Bank Details</div>
            <div style={styles.formGridModern}>
              <div style={styles.inputGroup}><label style={styles.label}>Account Holder</label><input style={styles.input} type="text" value={formData.account_holder_name} onChange={e => setFormData({ ...formData, account_holder_name: e.target.value })} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Bank Name</label><input style={styles.input} type="text" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Account Number</label><input style={styles.input} type="text" value={formData.account_number} onChange={e => setFormData({ ...formData, account_number: e.target.value })} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>IFSC Code</label><input style={styles.input} type="text" value={formData.ifsc_code} onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })} /></div>
            </div>
          </div>
          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>{loading ? "Creating..." : "Create Client"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Update Client Modal Component
const UpdateClientModal = ({ isOpen, onClose, client, onClientUpdated, notify }) => {
  const [formData, setFormData] = useState({
    client_name: "", company_name: "", phone_number: "", gst_number: "",
    billing_address: "", account_holder_name: "", bank_name: "",
    account_number: "", ifsc_code: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        client_name: client.client_name || "", company_name: client.company_name || "",
        phone_number: client.phone_number || "", gst_number: client.gst_number || "",
        billing_address: client.billing_address || "", account_holder_name: client.account_holder_name || "",
        bank_name: client.bank_name || "", account_number: client.account_number || "", ifsc_code: client.ifsc_code || ""
      });
    }
  }, [client]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest(`/invoice/api/clients/${client.id}/`, "PATCH", formData);
      if (response) {
        onClientUpdated(response);
        notify("Client updated successfully!");
        onClose();
      }
    } catch (error) {
      notify("Update failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modernModalContent}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Update Bank Details</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={styles.modalFormWrapper}>
          <div style={styles.modalBody}>
            <div style={styles.formGridModern}>
              <div style={styles.inputGroup}><label style={styles.label}>Account Holder</label><input style={styles.input} type="text" value={formData.account_holder_name} onChange={e => setFormData({ ...formData, account_holder_name: e.target.value })} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Bank Name</label><input style={styles.input} type="text" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Account Number</label><input style={styles.input} type="text" value={formData.account_number} onChange={e => setFormData({ ...formData, account_number: e.target.value })} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>IFSC Code</label><input style={styles.input} type="text" value={formData.ifsc_code} onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })} /></div>
            </div>
          </div>
          <div style={styles.modalFooter}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={styles.saveBtn}>{loading ? "Updating..." : "Update Details"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loadingClients, setLoadingClients] = useState(false);
  const [candidateList, setCandidateList] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isUpdateClientModalOpen, setIsUpdateClientModalOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [billingMonth, setBillingMonth] = useState(currentMonth);
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([]);

  const notify = (msg, type = "success") => setToast({ show: true, msg, type });

  const hasBankDetails = (client) => client?.account_number && client?.bank_name && client?.ifsc_code && client?.account_holder_name;

  const fetchClients = useCallback(async (searchVal = "") => {
    setLoadingClients(true);
    try {
      let all = [];
      const searchParam = searchVal ? `?search=${encodeURIComponent(searchVal)}` : '';
      let url = `/invoice/api/clients/${searchParam}`;
      while (url) {
        const res = await apiRequest(url);
        if (res?.results) {
          all = [...all, ...res.results];
          url = res.next ? res.next.split('/api')[1] ? '/api' + res.next.split('/api')[1] : null : null;
        } else break;
      }
      setClients(all);
    } catch (error) { console.error(error); } finally { setLoadingClients(false); }
  }, []);

  const fetchCandidates = useCallback(async (searchVal = "") => {
    if (!selectedClient) { setCandidateList([]); return; }
    setLoadingCandidates(true);
    try {
      let all = [];
      const searchParam = searchVal ? `?search=${encodeURIComponent(searchVal)}` : '';
      let url = `/invoice/api/clients/${selectedClient.id}/candidates/${searchParam}`;
      while (url) {
        const res = await apiRequest(url);
        if (res?.results) {
          all = [...all, ...res.results];
          url = res.next ? res.next.split('/api')[1] ? '/api' + res.next.split('/api')[1] : null : null;
        } else break;
      }
      setCandidateList(all);
    } catch (error) { setCandidateList([]); } finally { setLoadingCandidates(false); }
  }, [selectedClient]);

  useEffect(() => {
    fetchClients();
    const fetchBanks = async () => {
      setLoadingBanks(true);
      try {
        const res = await apiRequest(`/invoice/api/bank-accounts/`);
        setBanks(res?.results || []);
      } catch (error) { console.error(error); } finally { setLoadingBanks(false); }
    };
    fetchBanks();
  }, [fetchClients]);

  useEffect(() => { if (selectedClient) fetchCandidates(); }, [selectedClient, fetchCandidates]);

  const handleClientAdded = (newClient) => {
    setClients(prev => [...prev, newClient]);
    setSelectedClient(newClient);
    setClientSearch(newClient.client_name);
    setShowClientDropdown(false);
  };

  const handleClientUpdated = (updatedClient) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setSelectedClient(updatedClient);
  };

  const addItem = () => {
    setItems([...items, {
      billing_type: "MANUAL", title: "", description: "", sac_code: "",
      candidate: null, candidateSearch: "", showDropdown: false, monthly_rate: 0, total_days: 0, working_days: 0,
      hourly_rate: 0, total_hours: 0, amount: 0, gst_rate: 18, calc_amount: 0, gst_amount: 0, total: 0
    }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculate = (item) => {
    let amount = 0;
    if (item.billing_type === "BILLABLE_DAYS") amount = (item.monthly_rate / (item.total_days || 1)) * (item.working_days || 0);
    else if (item.billing_type === "HOURLY") amount = item.hourly_rate * item.total_hours;
    else amount = item.amount || 0;
    const gst = (amount * item.gst_rate) / 100;
    return { amount: Math.round(amount * 100) / 100, gst: Math.round(gst * 100) / 100, total: Math.round((amount + gst) * 100) / 100 };
  };

  const updateItem = (i, key, value) => {
    const newItems = [...items];
    newItems[i][key] = value;
    const calc = calculate(newItems[i]);
    newItems[i].calc_amount = calc.amount;
    newItems[i].gst_amount = calc.gst;
    newItems[i].total = calc.total;
    setItems(newItems);
  };

  const selectCandidate = (i, candidate) => {
    const newItems = [...items];
    newItems[i].candidate = candidate.id;
    newItems[i].candidateSearch = candidate.candidate_name;
    newItems[i].showDropdown = false;
    newItems[i].title = candidate.candidate_name;
    newItems[i].description = candidate.technology;
    newItems[i].monthly_rate = candidate.client_rate || 0;
    const calc = calculate(newItems[i]);
    newItems[i].calc_amount = calc.amount;
    newItems[i].gst_amount = calc.gst;
    newItems[i].total = calc.total;
    setItems(newItems);
  };

  const validateInvoice = () => {
    if (!selectedClient) return "Select Client is required";
    if (!selectedBank) return "Bank Account is required";
    if (!dueDate) return "Due Date is required";
    if (items.length === 0) return "At least one item is required";
    return null;
  };

  const handleSubmit = async () => {
    const errorMsg = validateInvoice();
    if (errorMsg) {
      notify(errorMsg, "error");
      return;
    }
    try {
      const payload = {
        client: selectedClient.id, company_bank_account: selectedBank, invoice_type: "CANDIDATE",
        invoice_date: invoiceDate, billing_month: billingMonth, due_date: dueDate,
        items: items.map(i => ({
          candidate: i.candidate, title: i.title, description: i.description, sac_code: i.sac_code,
          billing_type: i.billing_type, monthly_rate: i.monthly_rate, total_days: i.total_days,
          working_days: i.working_days, hourly_rate: i.hourly_rate, total_hours: i.total_hours, amount: i.amount
        }))
      };
      await apiRequest("/invoice/api/create/", "POST", payload);
      notify("Invoice Created successfully!");
    } catch (error) { 
      notify("Invoice creation failed", "error"); 
    }
  };

  return (
    <AccountsBaseLayout>
      {toast.show && <Toaster msg={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
      <div style={styles.topNav}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
          <h2 style={styles.pageTitle}>Create Invoice</h2>
        </div>
        <button style={styles.settingsBtn} onClick={() => navigate("/accounts/finance-overview")} title="Settings">
                        <Icons.Settings />
        </button>

      </div>

      <div style={styles.card}>
        <div style={styles.section}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <label style={styles.label}>Select Client</label>
              <input style={styles.inputSearch} placeholder="Search Client..." value={clientSearch} onChange={e => { setClientSearch(e.target.value); fetchClients(e.target.value); setShowClientDropdown(true); }} onFocus={() => setShowClientDropdown(true)} />
              {showClientDropdown && (
                <div style={styles.dropdownList}>
                  {loadingClients ? <div style={styles.dropdownItem}>Loading...</div> : clients.map(c => <div key={c.id} style={styles.dropdownItem} onClick={() => { setSelectedClient(c); setClientSearch(c.client_name); setShowClientDropdown(false); }}>{c.client_name}</div>)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={() => setIsAddClientModalOpen(true)} style={styles.addBtn}>+ Add Client</button>
            </div>
          </div>
          {selectedClient && !hasBankDetails(selectedClient) && (
            <div style={styles.warningBox}>
              <span style={{ fontSize: '12px', color: '#B45309' }}>⚠️ Bank details missing.</span>
              <button onClick={() => setIsUpdateClientModalOpen(true)} style={styles.updateBtn}>Update</button>
            </div>
          )}
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Bank Account</label>
          <select style={styles.input} onChange={e => setSelectedBank(e.target.value)} value={selectedBank} disabled={selectedClient && !hasBankDetails(selectedClient)}>
            <option value="">Select Bank</option>
            {banks.map(b => <option key={b.id} value={b.id}>{b.bank_name}</option>)}
          </select>
        </div>

        <div style={styles.grid3}>
          <div><label style={styles.label}>Invoice Date</label><input type="date" style={styles.input} value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
          <div><label style={styles.label}>Billing Month</label><input type="date" style={styles.input} value={billingMonth} onChange={e => setBillingMonth(e.target.value)} /></div>
          <div><label style={styles.label}>Due Date</label><input type="date" style={styles.input} value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '18px', color: '#1E293B', marginBottom: '15px' }}>Invoice Items</h3>
          {items.map((item, i) => (
            <div key={i} style={styles.itemCard}>
              <div style={styles.itemHeader}>
                <span style={styles.itemCount}>Item #{i+1}</span>
                <button onClick={() => removeItem(i)} style={styles.removeBtn}>✕ Remove</button>
              </div>
              <div style={styles.grid2}>
                <div style={styles.inputGroup}><label style={styles.label}>Billing Type</label>
                  <select style={styles.input} value={item.billing_type} onChange={e => updateItem(i, "billing_type", e.target.value)}>
                    <option value="BILLABLE_DAYS">Billable Days</option><option value="HOURLY">Hourly</option><option value="MANUAL">Manual</option>
                  </select>
                </div>
                {item.billing_type !== "MANUAL" && (
                  <div style={{ ...styles.inputGroup, position: 'relative' }}><label style={styles.label}>Candidate</label>
                    <input style={styles.inputSearch} placeholder="Search Candidate..." value={item.candidateSearch} disabled={!selectedClient} onChange={e => { updateItem(i, "candidateSearch", e.target.value); updateItem(i, "showDropdown", true); fetchCandidates(e.target.value); }} onFocus={() => updateItem(i, "showDropdown", true)} />
                    {item.showDropdown && (
                      <div style={styles.dropdownList}>{candidateList.map(c => <div key={c.id} style={styles.dropdownItem} onClick={() => selectCandidate(i, c)}>{c.candidate_name}</div>)}</div>
                    )}
                  </div>
                )}
              </div>
              <div style={styles.grid3}>
                <div><label style={styles.label}>Title</label><input style={styles.input} value={item.title} onChange={e => updateItem(i, "title", e.target.value)} /></div>
                <div><label style={styles.label}>Description</label><input style={styles.input} value={item.description} onChange={e => updateItem(i, "description", e.target.value)} /></div>
                <div><label style={styles.label}>SAC Code</label><input style={styles.input} value={item.sac_code} onChange={e => updateItem(i, "sac_code", e.target.value)} /></div>
              </div>
              <div style={styles.gridCalculations}>
                {item.billing_type === "BILLABLE_DAYS" && (<>
                  <div><label style={styles.label}>Monthly Rate</label><input style={styles.input} type="number" value={item.monthly_rate} onChange={e => updateItem(i, "monthly_rate", Number(e.target.value))} /></div>
                  <div><label style={styles.label}>Total Days</label><input style={styles.input} type="number" value={item.total_days} onChange={e => updateItem(i, "total_days", Number(e.target.value))} /></div>
                  <div><label style={styles.label}>Working Days</label><input style={styles.input} type="number" value={item.working_days} onChange={e => updateItem(i, "working_days", Number(e.target.value))} /></div>
                </>)}
                {item.billing_type === "HOURLY" && (<>
                  <div><label style={styles.label}>Hourly Rate</label><input style={styles.input} type="number" value={item.hourly_rate} onChange={e => updateItem(i, "hourly_rate", Number(e.target.value))} /></div>
                  <div><label style={styles.label}>Total Hours</label><input style={styles.input} type="number" value={item.total_hours} onChange={e => updateItem(i, "total_hours", Number(e.target.value))} /></div>
                </>)}
                {item.billing_type === "MANUAL" && <div><label style={styles.label}>Amount</label><input style={styles.input} type="number" value={item.amount} onChange={e => updateItem(i, "amount", Number(e.target.value))} /></div>}
              </div>
              <div style={styles.summaryRow}>
                <div><label style={styles.label}>GST %</label><input style={{ ...styles.input, width: '60px' }} type="number" value={item.gst_rate} onChange={e => updateItem(i, "gst_rate", Number(e.target.value))} /></div>
                <div><small style={styles.label}>Amount</small><div style={styles.readonlyValue}>₹{item.calc_amount}</div></div>
                <div><small style={styles.label}>GST</small><div style={styles.readonlyValue}>₹{item.gst_amount}</div></div>
                <div><small style={styles.label}>Total</small><div style={styles.totalValue}>₹{item.total}</div></div>
              </div>
            </div>
          ))}
          <button onClick={addItem} style={styles.addItemBtn}>+ Add Item</button>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'right' }}>
          <button onClick={handleSubmit} disabled={selectedClient && !hasBankDetails(selectedClient)} style={styles.submitBtnLarge}>Create Invoice</button>
        </div>
      </div>

      <AddClientModal isOpen={isAddClientModalOpen} onClose={() => setIsAddClientModalOpen(false)} onClientAdded={handleClientAdded} notify={notify} />
      <UpdateClientModal isOpen={isUpdateClientModalOpen} onClose={() => setIsUpdateClientModalOpen(false)} client={selectedClient} onClientUpdated={handleClientUpdated} notify={notify} />
    </AccountsBaseLayout>
  );
}

const styles = {
  toaster: { position: 'fixed', top: '20px', right: '20px', color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 10001, fontWeight: '700', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  topNav: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" },
  backBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  settingsBtn: { background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0", padding: "10px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },

  pageTitle: { fontSize: "22px", fontWeight: "800", color: "#1E293B", margin: 0 },
  card: { background: "#fff", borderRadius: "12px", padding: "25px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
  section: { marginBottom: "20px" },
  label: { display: "block", fontSize: "12px", fontWeight: "700", color: "#64748B", marginBottom: "6px", textTransform: 'uppercase' },
  input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '100%', outline: 'none', boxSizing: 'border-box', fontSize: '14px' },
  inputSearch: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '100%', outline: 'none', boxSizing: 'border-box', background: '#fff', fontSize: '14px' },
  dropdownList: { position: 'absolute', top: '100%', left: 0, width: '100%', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  dropdownItem: { padding: '10px 14px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9' },
  textarea: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '100%', minHeight: '80px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  addBtn: { background: "#10B981", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  warningBox: { marginTop: "10px", padding: "12px", background: "#FFFBEB", border: "1px solid #FEF3C7", borderRadius: "8px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  updateBtn: { background: "#F59E0B", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: '12px', fontWeight: "700" },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" },
  gridCalculations: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "15px", marginBottom: "15px" },
  itemCard: { padding: "15px", border: "1px solid #F1F5F9", borderRadius: "10px", background: "#F8FAFC", marginBottom: "15px" },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  itemCount: { fontSize: '14px', fontWeight: '800', color: '#1E293B' },
  removeBtn: { background: '#EF4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", gap: '15px' },
  readonlyValue: { padding: '8px', background: '#E2E8F0', borderRadius: '6px', fontSize: '13px', minWidth: '80px', textAlign: 'center', fontWeight: '600' },
  totalValue: { padding: '8px', background: '#DBEAFE', borderRadius: '6px', fontSize: '14px', fontWeight: '800', color: '#1E40AF', minWidth: '80px', textAlign: 'center' },
  addItemBtn: { background: "#3B82F6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  submitBtnLarge: { background: "#FF9B51", color: "#fff", border: "none", padding: "14px 40px", borderRadius: "10px", fontSize: "16px", fontWeight: "800", cursor: "pointer" },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modernModalContent: { background: '#fff', borderRadius: '16px', width: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', padding: '20px 25px', borderBottom: '1px solid #F1F5F9', alignItems: 'center', flexShrink: 0 },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '800', color: '#1E293B' },
  closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' },
  modalFormWrapper: { display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 },
  modalBody: { padding: '25px', flex: 1 },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC', flexShrink: 0 },
  formSectionTitle: { fontSize: '14px', fontWeight: '800', color: '#FF9B51', marginBottom: '15px', textTransform: 'uppercase', borderBottom: '1px solid #F1F5F9', paddingBottom: '5px' },
  formGridModern: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' },
  cancelBtn: { padding: '10px 20px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#64748B' },
  submitBtn: { padding: '10px 20px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
  saveBtn: { padding: '10px 20px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '2px' },
  errorText: { color: '#EF4444', fontSize: '11px', fontWeight: '600', marginTop: '2px' }
};







// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import AccountsBaseLayout from "../components/AccountsBaseLayout";

// // Toaster Component
// const Toaster = ({ msg, type, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(onClose, 3000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     <div style={{
//       ...styles.toaster,
//       backgroundColor: type === 'error' ? '#EF4444' : '#10B981'
//     }}>
//       {msg}
//     </div>
//   );
// };

// // Add Client Modal Component
// const AddClientModal = ({ isOpen, onClose, onClientAdded, notify }) => {
//   const [formData, setFormData] = useState({
//     client_name: "", company_name: "", phone_number: "", email: "",
//     gst_number: "", billing_address: "", account_holder_name: "",
//     bank_name: "", account_number: "", ifsc_code: ""
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const response = await apiRequest("/invoice/api/clients/", "POST", formData);
//       if (response) {
//         onClientAdded(response);
//         notify("Client added successfully!");
//         onClose();
//         setFormData({
//           client_name: "", company_name: "", phone_number: "", email: "",
//           gst_number: "", billing_address: "", account_holder_name: "",
//           bank_name: "", account_number: "", ifsc_code: ""
//         });
//       }
//     } catch (error) {
//       notify("Client creation failed.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div style={styles.modalOverlay}>
//       <div style={styles.modernModalContent}>
//         <div style={styles.modalHeader}>
//           <h3 style={styles.modalTitle}>Add New Client</h3>
//           <button onClick={onClose} style={styles.closeBtn}>✕</button>
//         </div>
//         <form onSubmit={handleSubmit} style={styles.modalFormWrapper}>
//           <div style={styles.modalBody}>
//             <div style={styles.formSectionTitle}>Basic Information</div>
//             <div style={styles.formGridModern}>
//               <div style={styles.inputGroup}><label style={styles.label}>Client Name *</label><input style={styles.input} type="text" required value={formData.client_name} onChange={e => setFormData({ ...formData, client_name: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Company Name</label><input style={styles.input} type="text" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Phone Number *</label><input style={styles.input} type="tel" required value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Email *</label><input style={styles.input} type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
//               <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}><label style={styles.label}>GST Number</label><input style={styles.input} type="text" value={formData.gst_number} onChange={e => setFormData({ ...formData, gst_number: e.target.value })} /></div>
//               <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}><label style={styles.label}>Billing Address *</label><textarea style={styles.textarea} required value={formData.billing_address} onChange={e => setFormData({ ...formData, billing_address: e.target.value })} /></div>
//             </div>
            
//             <div style={styles.formSectionTitle}>Bank Details</div>
//             <div style={styles.formGridModern}>
//               <div style={styles.inputGroup}><label style={styles.label}>Account Holder</label><input style={styles.input} type="text" value={formData.account_holder_name} onChange={e => setFormData({ ...formData, account_holder_name: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Bank Name</label><input style={styles.input} type="text" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Account Number</label><input style={styles.input} type="text" value={formData.account_number} onChange={e => setFormData({ ...formData, account_number: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>IFSC Code</label><input style={styles.input} type="text" value={formData.ifsc_code} onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })} /></div>
//             </div>
//           </div>
//           <div style={styles.modalFooter}>
//             <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
//             <button type="submit" disabled={loading} style={styles.submitBtn}>{loading ? "Creating..." : "Create Client"}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Update Client Modal Component
// const UpdateClientModal = ({ isOpen, onClose, client, onClientUpdated, notify }) => {
//   const [formData, setFormData] = useState({
//     client_name: "", company_name: "", phone_number: "", gst_number: "",
//     billing_address: "", account_holder_name: "", bank_name: "",
//     account_number: "", ifsc_code: ""
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (client) {
//       setFormData({
//         client_name: client.client_name || "", company_name: client.company_name || "",
//         phone_number: client.phone_number || "", gst_number: client.gst_number || "",
//         billing_address: client.billing_address || "", account_holder_name: client.account_holder_name || "",
//         bank_name: client.bank_name || "", account_number: client.account_number || "", ifsc_code: client.ifsc_code || ""
//       });
//     }
//   }, [client]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const response = await apiRequest(`/invoice/api/clients/${client.id}/`, "PATCH", formData);
//       if (response) {
//         onClientUpdated(response);
//         notify("Client updated successfully!");
//         onClose();
//       }
//     } catch (error) {
//       notify("Update failed.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen || !client) return null;

//   return (
//     <div style={styles.modalOverlay}>
//       <div style={styles.modernModalContent}>
//         <div style={styles.modalHeader}>
//           <h3 style={styles.modalTitle}>Update Bank Details</h3>
//           <button onClick={onClose} style={styles.closeBtn}>✕</button>
//         </div>
//         <form onSubmit={handleSubmit} style={styles.modalFormWrapper}>
//           <div style={styles.modalBody}>
//             <div style={styles.formGridModern}>
//               <div style={styles.inputGroup}><label style={styles.label}>Account Holder</label><input style={styles.input} type="text" value={formData.account_holder_name} onChange={e => setFormData({ ...formData, account_holder_name: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Bank Name</label><input style={styles.input} type="text" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Account Number</label><input style={styles.input} type="text" value={formData.account_number} onChange={e => setFormData({ ...formData, account_number: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>IFSC Code</label><input style={styles.input} type="text" value={formData.ifsc_code} onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })} /></div>
//             </div>
//           </div>
//           <div style={styles.modalFooter}>
//             <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
//             <button type="submit" disabled={loading} style={styles.saveBtn}>{loading ? "Updating..." : "Update Details"}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default function CreateInvoice() {
//   const navigate = useNavigate();
//   const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
//   const [clients, setClients] = useState([]);
//   const [clientSearch, setClientSearch] = useState("");
//   const [showClientDropdown, setShowClientDropdown] = useState(false);
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [loadingClients, setLoadingClients] = useState(false);
//   const [candidateList, setCandidateList] = useState([]);
//   const [loadingCandidates, setLoadingCandidates] = useState(false);
//   const [banks, setBanks] = useState([]);
//   const [selectedBank, setSelectedBank] = useState("");
//   const [loadingBanks, setLoadingBanks] = useState(false);
//   const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
//   const [isUpdateClientModalOpen, setIsUpdateClientModalOpen] = useState(false);

//   const today = new Date().toISOString().slice(0, 10);
//   const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
//   const [invoiceDate, setInvoiceDate] = useState(today);
//   const [billingMonth, setBillingMonth] = useState(currentMonth);
//   const [dueDate, setDueDate] = useState("");
//   const [items, setItems] = useState([]);

//   const notify = (msg, type = "success") => setToast({ show: true, msg, type });

//   const hasBankDetails = (client) => client?.account_number && client?.bank_name && client?.ifsc_code && client?.account_holder_name;

//   const fetchClients = useCallback(async (searchVal = "") => {
//     setLoadingClients(true);
//     try {
//       let all = [];
//       const searchParam = searchVal ? `?search=${encodeURIComponent(searchVal)}` : '';
//       let url = `/invoice/api/clients/${searchParam}`;
//       while (url) {
//         const res = await apiRequest(url);
//         if (res?.results) {
//           all = [...all, ...res.results];
//           url = res.next ? res.next.split('/api')[1] ? '/api' + res.next.split('/api')[1] : null : null;
//         } else break;
//       }
//       setClients(all);
//     } catch (error) { console.error(error); } finally { setLoadingClients(false); }
//   }, []);

//   const fetchCandidates = useCallback(async (searchVal = "") => {
//     if (!selectedClient) { setCandidateList([]); return; }
//     setLoadingCandidates(true);
//     try {
//       let all = [];
//       const searchParam = searchVal ? `?search=${encodeURIComponent(searchVal)}` : '';
//       let url = `/invoice/api/clients/${selectedClient.id}/candidates/${searchParam}`;
//       while (url) {
//         const res = await apiRequest(url);
//         if (res?.results) {
//           all = [...all, ...res.results];
//           url = res.next ? res.next.split('/api')[1] ? '/api' + res.next.split('/api')[1] : null : null;
//         } else break;
//       }
//       setCandidateList(all);
//     } catch (error) { setCandidateList([]); } finally { setLoadingCandidates(false); }
//   }, [selectedClient]);

//   useEffect(() => {
//     fetchClients();
//     const fetchBanks = async () => {
//       setLoadingBanks(true);
//       try {
//         const res = await apiRequest(`/invoice/api/bank-accounts/`);
//         setBanks(res?.results || []);
//       } catch (error) { console.error(error); } finally { setLoadingBanks(false); }
//     };
//     fetchBanks();
//   }, [fetchClients]);

//   useEffect(() => { if (selectedClient) fetchCandidates(); }, [selectedClient, fetchCandidates]);

//   const handleClientAdded = (newClient) => {
//     setClients(prev => [...prev, newClient]);
//     setSelectedClient(newClient);
//     setClientSearch(newClient.client_name);
//     setShowClientDropdown(false);
//   };

//   const handleClientUpdated = (updatedClient) => {
//     setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
//     setSelectedClient(updatedClient);
//   };

//   const addItem = () => {
//     setItems([...items, {
//       billing_type: "MANUAL", title: "", description: "", sac_code: "",
//       candidate: null, candidateSearch: "", showDropdown: false, monthly_rate: 0, total_days: 0, working_days: 0,
//       hourly_rate: 0, total_hours: 0, amount: 0, gst_rate: 18, calc_amount: 0, gst_amount: 0, total: 0
//     }]);
//   };

//   const calculate = (item) => {
//     let amount = 0;
//     if (item.billing_type === "BILLABLE_DAYS") amount = (item.monthly_rate / (item.total_days || 1)) * (item.working_days || 0);
//     else if (item.billing_type === "HOURLY") amount = item.hourly_rate * item.total_hours;
//     else amount = item.amount || 0;
//     const gst = (amount * item.gst_rate) / 100;
//     return { amount: Math.round(amount * 100) / 100, gst: Math.round(gst * 100) / 100, total: Math.round((amount + gst) * 100) / 100 };
//   };

//   const updateItem = (i, key, value) => {
//     const newItems = [...items];
//     newItems[i][key] = value;
//     const calc = calculate(newItems[i]);
//     newItems[i].calc_amount = calc.amount;
//     newItems[i].gst_amount = calc.gst;
//     newItems[i].total = calc.total;
//     setItems(newItems);
//   };

//   const selectCandidate = (i, candidate) => {
//     const newItems = [...items];
//     newItems[i].candidate = candidate.id;
//     newItems[i].candidateSearch = candidate.candidate_name;
//     newItems[i].showDropdown = false;
//     newItems[i].title = candidate.candidate_name;
//     newItems[i].description = candidate.technology;
//     newItems[i].monthly_rate = candidate.client_rate || 0;
//     const calc = calculate(newItems[i]);
//     newItems[i].calc_amount = calc.amount;
//     newItems[i].gst_amount = calc.gst;
//     newItems[i].total = calc.total;
//     setItems(newItems);
//   };

//   const handleSubmit = async () => {
//     if (!selectedClient || !selectedBank || !dueDate || items.length === 0) {
//       notify("Please fill all fields", "error");
//       return;
//     }
//     try {
//       const payload = {
//         client: selectedClient.id, company_bank_account: selectedBank, invoice_type: "CANDIDATE",
//         invoice_date: invoiceDate, billing_month: billingMonth, due_date: dueDate,
//         items: items.map(i => ({
//           candidate: i.candidate, title: i.title, description: i.description, sac_code: i.sac_code,
//           billing_type: i.billing_type, monthly_rate: i.monthly_rate, total_days: i.total_days,
//           working_days: i.working_days, hourly_rate: i.hourly_rate, total_hours: i.total_hours, amount: i.amount
//         }))
//       };
//       await apiRequest("/invoice/api/create/", "POST", payload);
//       notify("Invoice Created!");
//       navigate("/invoice/list");
//     } catch (error) { notify("Creation failed", "error"); }
//   };

//   return (
//     <AccountsBaseLayout>
//       {toast.show && <Toaster msg={toast.msg} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
//       <div style={styles.topNav}>
//         <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
//           <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
//           <h2 style={styles.pageTitle}>Create Invoice</h2>
//         </div>
//         <button style={styles.settingsBtn}>⚙</button>
//       </div>

//       <div style={styles.card}>
//         <div style={styles.section}>
//           <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
//             <div style={{ flex: 1, position: 'relative' }}>
//               <label style={styles.label}>Select Client</label>
//               <input style={styles.inputSearch} placeholder="Search Client..." value={clientSearch} onChange={e => { setClientSearch(e.target.value); fetchClients(e.target.value); setShowClientDropdown(true); }} onFocus={() => setShowClientDropdown(true)} />
//               {showClientDropdown && (
//                 <div style={styles.dropdownList}>
//                   {loadingClients ? <div style={styles.dropdownItem}>Loading...</div> : clients.map(c => <div key={c.id} style={styles.dropdownItem} onClick={() => { setSelectedClient(c); setClientSearch(c.client_name); setShowClientDropdown(false); }}>{c.client_name}</div>)}
//                 </div>
//               )}
//             </div>
//             <div style={{ display: 'flex', alignItems: 'flex-end' }}>
//               <button onClick={() => setIsAddClientModalOpen(true)} style={styles.addBtn}>+ Add Client</button>
//             </div>
//           </div>
//           {selectedClient && !hasBankDetails(selectedClient) && (
//             <div style={styles.warningBox}>
//               <span style={{ fontSize: '12px', color: '#B45309' }}>⚠️ Bank details missing.</span>
//               <button onClick={() => setIsUpdateClientModalOpen(true)} style={styles.updateBtn}>Update</button>
//             </div>
//           )}
//         </div>

//         <div style={styles.section}>
//           <label style={styles.label}>Bank Account</label>
//           <select style={styles.input} onChange={e => setSelectedBank(e.target.value)} value={selectedBank} disabled={selectedClient && !hasBankDetails(selectedClient)}>
//             <option value="">Select Bank</option>
//             {banks.map(b => <option key={b.id} value={b.id}>{b.bank_name}</option>)}
//           </select>
//         </div>

//         <div style={styles.grid3}>
//           <div><label style={styles.label}>Invoice Date</label><input type="date" style={styles.input} value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
//           <div><label style={styles.label}>Billing Month</label><input type="date" style={styles.input} value={billingMonth} onChange={e => setBillingMonth(e.target.value)} /></div>
//           <div><label style={styles.label}>Due Date</label><input type="date" style={styles.input} value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
//         </div>

//         <div style={{ marginTop: '30px' }}>
//           <h3 style={{ fontSize: '18px', color: '#1E293B', marginBottom: '15px' }}>Invoice Items</h3>
//           {items.map((item, i) => (
//             <div key={i} style={styles.itemCard}>
//               <div style={styles.grid2}>
//                 <div style={styles.inputGroup}><label style={styles.label}>Billing Type</label>
//                   <select style={styles.input} value={item.billing_type} onChange={e => updateItem(i, "billing_type", e.target.value)}>
//                     <option value="BILLABLE_DAYS">Billable Days</option><option value="HOURLY">Hourly</option><option value="MANUAL">Manual</option>
//                   </select>
//                 </div>
//                 {item.billing_type !== "MANUAL" && (
//                   <div style={{ ...styles.inputGroup, position: 'relative' }}><label style={styles.label}>Candidate</label>
//                     <input style={styles.inputSearch} placeholder="Search Candidate..." value={item.candidateSearch} disabled={!selectedClient} onChange={e => { updateItem(i, "candidateSearch", e.target.value); updateItem(i, "showDropdown", true); fetchCandidates(e.target.value); }} onFocus={() => updateItem(i, "showDropdown", true)} />
//                     {item.showDropdown && (
//                       <div style={styles.dropdownList}>{candidateList.map(c => <div key={c.id} style={styles.dropdownItem} onClick={() => selectCandidate(i, c)}>{c.candidate_name}</div>)}</div>
//                     )}
//                   </div>
//                 )}
//               </div>
//               <div style={styles.grid3}>
//                 <div><label style={styles.label}>Title</label><input style={styles.input} value={item.title} onChange={e => updateItem(i, "title", e.target.value)} /></div>
//                 <div><label style={styles.label}>Description</label><input style={styles.input} value={item.description} onChange={e => updateItem(i, "description", e.target.value)} /></div>
//                 <div><label style={styles.label}>SAC Code</label><input style={styles.input} value={item.sac_code} onChange={e => updateItem(i, "sac_code", e.target.value)} /></div>
//               </div>
//               <div style={styles.gridCalculations}>
//                 {item.billing_type === "BILLABLE_DAYS" && (<>
//                   <div><label style={styles.label}>Monthly Rate</label><input style={styles.input} type="number" value={item.monthly_rate} onChange={e => updateItem(i, "monthly_rate", Number(e.target.value))} /></div>
//                   <div><label style={styles.label}>Total Days</label><input style={styles.input} type="number" value={item.total_days} onChange={e => updateItem(i, "total_days", Number(e.target.value))} /></div>
//                   <div><label style={styles.label}>Working Days</label><input style={styles.input} type="number" value={item.working_days} onChange={e => updateItem(i, "working_days", Number(e.target.value))} /></div>
//                 </>)}
//                 {item.billing_type === "HOURLY" && (<>
//                   <div><label style={styles.label}>Hourly Rate</label><input style={styles.input} type="number" value={item.hourly_rate} onChange={e => updateItem(i, "hourly_rate", Number(e.target.value))} /></div>
//                   <div><label style={styles.label}>Total Hours</label><input style={styles.input} type="number" value={item.total_hours} onChange={e => updateItem(i, "total_hours", Number(e.target.value))} /></div>
//                 </>)}
//                 {item.billing_type === "MANUAL" && <div><label style={styles.label}>Amount</label><input style={styles.input} type="number" value={item.amount} onChange={e => updateItem(i, "amount", Number(e.target.value))} /></div>}
//               </div>
//               <div style={styles.summaryRow}>
//                 <div><label style={styles.label}>GST %</label><input style={{ ...styles.input, width: '60px' }} type="number" value={item.gst_rate} onChange={e => updateItem(i, "gst_rate", Number(e.target.value))} /></div>
//                 <div><small style={styles.label}>Amount</small><div style={styles.readonlyValue}>₹{item.calc_amount}</div></div>
//                 <div><small style={styles.label}>GST</small><div style={styles.readonlyValue}>₹{item.gst_amount}</div></div>
//                 <div><small style={styles.label}>Total</small><div style={styles.totalValue}>₹{item.total}</div></div>
//               </div>
//             </div>
//           ))}
//           <button onClick={addItem} style={styles.addItemBtn}>+ Add Item</button>
//         </div>

//         <div style={{ marginTop: '40px', textAlign: 'right' }}>
//           <button onClick={handleSubmit} disabled={selectedClient && !hasBankDetails(selectedClient)} style={styles.submitBtnLarge}>Create Invoice</button>
//         </div>
//       </div>

//       <AddClientModal isOpen={isAddClientModalOpen} onClose={() => setIsAddClientModalOpen(false)} onClientAdded={handleClientAdded} notify={notify} />
//       <UpdateClientModal isOpen={isUpdateClientModalOpen} onClose={() => setIsUpdateClientModalOpen(false)} client={selectedClient} onClientUpdated={handleClientUpdated} notify={notify} />
//     </AccountsBaseLayout>
//   );
// }

// const styles = {
//   toaster: { position: 'fixed', top: '20px', right: '20px', color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 10001, fontWeight: '700', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
//   topNav: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" },
//   backBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//   settingsBtn: { background: "#F1F5F9", border: "1px solid #E2E8F0", padding: "8px 10px", borderRadius: "8px", cursor: "pointer" },
//   pageTitle: { fontSize: "22px", fontWeight: "800", color: "#1E293B", margin: 0 },
//   card: { background: "#fff", borderRadius: "12px", padding: "25px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
//   section: { marginBottom: "20px" },
//   label: { display: "block", fontSize: "12px", fontWeight: "700", color: "#64748B", marginBottom: "6px", textTransform: 'uppercase' },
//   input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '100%', outline: 'none', boxSizing: 'border-box', fontSize: '14px' },
//   inputSearch: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '100%', outline: 'none', boxSizing: 'border-box', background: '#fff', fontSize: '14px' },
//   dropdownList: { position: 'absolute', top: '100%', left: 0, width: '100%', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
//   dropdownItem: { padding: '10px 14px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9' },
//   textarea: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '90%', minHeight: '80px', fontSize: '14px', outline: 'none' },
//   addBtn: { background: "#10B981", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//   warningBox: { marginTop: "10px", padding: "12px", background: "#FFFBEB", border: "1px solid #FEF3C7", borderRadius: "8px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
//   updateBtn: { background: "#F59E0B", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: '12px', fontWeight: "700" },
//   grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" },
//   grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" },
//   gridCalculations: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "15px", marginBottom: "15px" },
//   itemCard: { padding: "15px", border: "1px solid #F1F5F9", borderRadius: "10px", background: "#F8FAFC", marginBottom: "15px" },
//   summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", gap: '15px' },
//   readonlyValue: { padding: '8px', background: '#E2E8F0', borderRadius: '6px', fontSize: '13px', minWidth: '80px', textAlign: 'center', fontWeight: '600' },
//   totalValue: { padding: '8px', background: '#DBEAFE', borderRadius: '6px', fontSize: '14px', fontWeight: '800', color: '#1E40AF', minWidth: '80px', textAlign: 'center' },
//   addItemBtn: { background: "#3B82F6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//   submitBtnLarge: { background: "#FF9B51", color: "#fff", border: "none", padding: "14px 40px", borderRadius: "10px", fontSize: "16px", fontWeight: "800", cursor: "pointer" },
//   modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
//   modernModalContent: { background: '#fff', borderRadius: '16px', width: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' },
//   modalHeader: { display: 'flex', justifyContent: 'space-between', padding: '20px 25px', borderBottom: '1px solid #F1F5F9', alignItems: 'center', flexShrink: 0 },
//   modalTitle: { margin: 0, fontSize: '20px', fontWeight: '800', color: '#1E293B' },
//   closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' },
//   modalFormWrapper: { display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 },
//   modalBody: { padding: '25px', flex: 1 },
//   modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC', flexShrink: 0 },
//   formSectionTitle: { fontSize: '14px', fontWeight: '800', color: '#FF9B51', marginBottom: '15px', textTransform: 'uppercase', borderBottom: '1px solid #F1F5F9', paddingBottom: '5px' },
//   formGridModern: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' },
//   cancelBtn: { padding: '10px 20px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#64748B' },
//   submitBtn: { padding: '10px 20px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
//   saveBtn: { padding: '10px 20px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
//   inputGroup: { display: 'flex', flexDirection: 'column', gap: '2px' }
// };









// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import AccountsBaseLayout from "../components/AccountsBaseLayout";

// // Add Client Modal Component
// const AddClientModal = ({ isOpen, onClose, onClientAdded }) => {
//   const [formData, setFormData] = useState({
//     client_name: "",
//     company_name: "",
//     phone_number: "",
//     email: "",
//     gst_number: "",
//     billing_address: "",
//     account_holder_name: "",
//     bank_name: "",
//     account_number: "",
//     ifsc_code: ""
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await apiRequest("/invoice/api/clients/", "POST", formData);
//       if (response) {
//         onClientAdded(response);
//         onClose();
//         setFormData({
//           client_name: "", company_name: "", phone_number: "", email: "",
//           gst_number: "", billing_address: "", account_holder_name: "",
//           bank_name: "", account_number: "", ifsc_code: ""
//         });
//       }
//     } catch (error) {
//       setError("Client creation failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div style={styles.modalOverlay}>
//       <div style={styles.modernModalContent}>
//         <div style={styles.modalHeader}>
//           <h3 style={styles.modalTitle}>Add New Client</h3>
//           <button onClick={onClose} style={styles.closeBtn}>✕</button>
//         </div>
//         {error && <div style={styles.errorBanner}>{error}</div>}
//         <form onSubmit={handleSubmit}>
//           <div style={styles.modalBody}>
//             <div style={styles.formSectionTitle}>Basic Information</div>
//             <div style={styles.formGridModern}>
//               <div style={styles.inputGroup}><label style={styles.label}>Client Name *</label><input style={styles.input} type="text" required value={formData.client_name} onChange={e => setFormData({ ...formData, client_name: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Company Name</label><input style={styles.input} type="text" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Phone Number *</label><input style={styles.input} type="tel" required value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Email *</label><input style={styles.input} type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
//               <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}><label style={styles.label}>GST Number</label><input style={styles.input} type="text" value={formData.gst_number} onChange={e => setFormData({ ...formData, gst_number: e.target.value })} /></div>
//               <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}><label style={styles.label}>Billing Address *</label><textarea style={styles.textarea} required value={formData.billing_address} onChange={e => setFormData({ ...formData, billing_address: e.target.value })} /></div>
//             </div>
            
//             <div style={styles.formSectionTitle}>Bank Details</div>
//             <div style={styles.formGridModern}>
//               <div style={styles.inputGroup}><label style={styles.label}>Account Holder</label><input style={styles.input} type="text" value={formData.account_holder_name} onChange={e => setFormData({ ...formData, account_holder_name: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Bank Name</label><input style={styles.input} type="text" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Account Number</label><input style={styles.input} type="text" value={formData.account_number} onChange={e => setFormData({ ...formData, account_number: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>IFSC Code</label><input style={styles.input} type="text" value={formData.ifsc_code} onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })} /></div>
//             </div>
//           </div>
//           <div style={styles.modalFooter}>
//             <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
//             <button type="submit" disabled={loading} style={styles.submitBtn}>{loading ? "Creating..." : "Create Client"}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Update Client Modal Component
// const UpdateClientModal = ({ isOpen, onClose, client, onClientUpdated }) => {
//   const [formData, setFormData] = useState({
//     client_name: "", company_name: "", phone_number: "", gst_number: "",
//     billing_address: "", account_holder_name: "", bank_name: "",
//     account_number: "", ifsc_code: ""
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (client) {
//       setFormData({
//         client_name: client.client_name || "",
//         company_name: client.company_name || "",
//         phone_number: client.phone_number || "",
//         gst_number: client.gst_number || "",
//         billing_address: client.billing_address || "",
//         account_holder_name: client.account_holder_name || "",
//         bank_name: client.bank_name || "",
//         account_number: client.account_number || "",
//         ifsc_code: client.ifsc_code || ""
//       });
//     }
//   }, [client]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await apiRequest(`/invoice/api/clients/${client.id}/`, "PATCH", formData);
//       if (response) {
//         onClientUpdated(response);
//         onClose();
//       }
//     } catch (error) {
//       setError("Client update failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen || !client) return null;

//   return (
//     <div style={styles.modalOverlay}>
//       <div style={styles.modernModalContent}>
//         <div style={styles.modalHeader}>
//           <h3 style={styles.modalTitle}>Update Bank Details</h3>
//           <button onClick={onClose} style={styles.closeBtn}>✕</button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div style={styles.modalBody}>
//             <div style={styles.formGridModern}>
//               <div style={styles.inputGroup}><label style={styles.label}>Account Holder</label><input style={styles.input} type="text" value={formData.account_holder_name} onChange={e => setFormData({ ...formData, account_holder_name: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Bank Name</label><input style={styles.input} type="text" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>Account Number</label><input style={styles.input} type="text" value={formData.account_number} onChange={e => setFormData({ ...formData, account_number: e.target.value })} /></div>
//               <div style={styles.inputGroup}><label style={styles.label}>IFSC Code</label><input style={styles.input} type="text" value={formData.ifsc_code} onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })} /></div>
//             </div>
//           </div>
//           <div style={styles.modalFooter}>
//             <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
//             <button type="submit" disabled={loading} style={styles.saveBtn}>{loading ? "Updating..." : "Update Details"}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default function CreateInvoice() {
//   const navigate = useNavigate();
//   const [clients, setClients] = useState([]);
//   const [clientSearch, setClientSearch] = useState("");
//   const [showClientDropdown, setShowClientDropdown] = useState(false);
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [loadingClients, setLoadingClients] = useState(false);
//   const [candidateList, setCandidateList] = useState([]);
//   const [loadingCandidates, setLoadingCandidates] = useState(false);
//   const [banks, setBanks] = useState([]);
//   const [selectedBank, setSelectedBank] = useState("");
//   const [loadingBanks, setLoadingBanks] = useState(false);
//   const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
//   const [isUpdateClientModalOpen, setIsUpdateClientModalOpen] = useState(false);

//   const today = new Date().toISOString().slice(0, 10);
//   const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
//   const [invoiceDate, setInvoiceDate] = useState(today);
//   const [billingMonth, setBillingMonth] = useState(currentMonth);
//   const [dueDate, setDueDate] = useState("");
//   const [items, setItems] = useState([]);

//   const hasBankDetails = (client) => {
//     if (!client) return false;
//     return !!(client.account_number && client.bank_name && client.ifsc_code && client.account_holder_name);
//   };

//   const fetchClients = useCallback(async (searchVal = "") => {
//     setLoadingClients(true);
//     try {
//       let all = [];
//       const searchParam = searchVal ? `?search=${encodeURIComponent(searchVal)}` : '';
//       let url = `/invoice/api/clients/${searchParam}`;
//       while (url) {
//         const res = await apiRequest(url);
//         if (res?.results) {
//           all = [...all, ...res.results];
//           url = res.next ? res.next.split('/api')[1] ? '/api' + res.next.split('/api')[1] : null : null;
//         } else break;
//       }
//       setClients(all);
//     } catch (error) { console.error(error); } finally { setLoadingClients(false); }
//   }, []);

//   const fetchCandidates = useCallback(async (searchVal = "") => {
//     if (!selectedClient) { setCandidateList([]); return; }
//     setLoadingCandidates(true);
//     try {
//       let all = [];
//       const searchParam = searchVal ? `?search=${encodeURIComponent(searchVal)}` : '';
//       let url = `/invoice/api/clients/${selectedClient.id}/candidates/${searchParam}`;
//       while (url) {
//         const res = await apiRequest(url);
//         if (res?.results) {
//           all = [...all, ...res.results];
//           url = res.next ? res.next.split('/api')[1] ? '/api' + res.next.split('/api')[1] : null : null;
//         } else break;
//       }
//       setCandidateList(all);
//     } catch (error) { setCandidateList([]); } finally { setLoadingCandidates(false); }
//   }, [selectedClient]);

//   useEffect(() => {
//     fetchClients();
//     const fetchBanks = async () => {
//       setLoadingBanks(true);
//       try {
//         const res = await apiRequest(`/invoice/api/bank-accounts/`);
//         setBanks(res?.results || []);
//       } catch (error) { console.error(error); } finally { setLoadingBanks(false); }
//     };
//     fetchBanks();
//   }, [fetchClients]);

//   useEffect(() => {
//     if (selectedClient) fetchCandidates();
//   }, [selectedClient, fetchCandidates]);

//   const handleClientAdded = (newClient) => {
//     setClients(prev => [...prev, newClient]);
//     setSelectedClient(newClient);
//     setClientSearch(newClient.client_name);
//     setShowClientDropdown(false);
//   };

//   const handleClientUpdated = (updatedClient) => {
//     setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
//     setSelectedClient(updatedClient);
//   };

//   const addItem = () => {
//     setItems([...items, {
//       billing_type: "MANUAL", title: "", description: "", sac_code: "",
//       candidate: null, candidateSearch: "", showDropdown: false, monthly_rate: 0, total_days: 0, working_days: 0,
//       hourly_rate: 0, total_hours: 0, amount: 0, gst_rate: 18,
//       calc_amount: 0, gst_amount: 0, total: 0
//     }]);
//   };

//   const calculate = (item) => {
//     let amount = 0;
//     if (item.billing_type === "BILLABLE_DAYS") {
//       amount = (item.monthly_rate / (item.total_days || 1)) * (item.working_days || 0);
//     } else if (item.billing_type === "HOURLY") {
//       amount = item.hourly_rate * item.total_hours;
//     } else {
//       amount = item.amount || 0;
//     }
//     const gst = (amount * item.gst_rate) / 100;
//     return { amount: Math.round(amount * 100) / 100, gst: Math.round(gst * 100) / 100, total: Math.round((amount + gst) * 100) / 100 };
//   };

//   const updateItem = (i, key, value) => {
//     const newItems = [...items];
//     newItems[i][key] = value;
//     const calc = calculate(newItems[i]);
//     newItems[i].calc_amount = calc.amount;
//     newItems[i].gst_amount = calc.gst;
//     newItems[i].total = calc.total;
//     setItems(newItems);
//   };

//   const selectCandidate = (i, candidate) => {
//     const newItems = [...items];
//     newItems[i].candidate = candidate.id;
//     newItems[i].candidateSearch = candidate.candidate_name;
//     newItems[i].showDropdown = false;
//     newItems[i].title = candidate.candidate_name || "";
//     newItems[i].description = candidate.technology || "";
//     newItems[i].monthly_rate = candidate.client_rate || 0;
//     const calc = calculate(newItems[i]);
//     newItems[i].calc_amount = calc.amount;
//     newItems[i].gst_amount = calc.gst;
//     newItems[i].total = calc.total;
//     setItems(newItems);
//   };

//   const handleSubmit = async () => {
//     if (!selectedClient || !selectedBank || !dueDate || items.length === 0) {
//       alert("Please fill all required fields and add at least one item");
//       return;
//     }
//     try {
//       const payload = {
//         client: selectedClient.id, company_bank_account: selectedBank, invoice_type: "CANDIDATE",
//         invoice_date: invoiceDate, billing_month: billingMonth, due_date: dueDate,
//         items: items.map(i => ({
//           candidate: i.candidate, title: i.title, description: i.description, sac_code: i.sac_code,
//           billing_type: i.billing_type, monthly_rate: i.monthly_rate, total_days: i.total_days,
//           working_days: i.working_days, hourly_rate: i.hourly_rate, total_hours: i.total_hours, amount: i.amount
//         }))
//       };
//       await apiRequest("/invoice/api/create/", "POST", payload);
//       alert("Invoice Created Successfully!");
//       navigate("/invoice/list");
//     } catch (error) { alert("Error creating invoice."); }
//   };

//   return (
//     <AccountsBaseLayout>
//       <div style={styles.topNav}>
//         <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
//           <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
//           <h2 style={styles.pageTitle}>Create Invoice</h2>
//         </div>
//         <button style={styles.settingsBtn}><span style={{ fontSize: '18px' }}>⚙</span></button>
//       </div>

//       <div style={styles.card}>
//         <div style={styles.section}>
//           <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
//             <div style={{ flex: 1, position: 'relative' }}>
//               <label style={styles.label}>Select Client</label>
//               <input 
//                 style={styles.inputSearch} 
//                 placeholder="Search and Select Client..." 
//                 value={clientSearch} 
//                 onChange={e => {
//                   setClientSearch(e.target.value);
//                   fetchClients(e.target.value);
//                   setShowClientDropdown(true);
//                 }}
//                 onFocus={() => setShowClientDropdown(true)}
//               />
//               {showClientDropdown && (
//                 <div style={styles.dropdownList}>
//                   {loadingClients ? <div style={styles.dropdownItem}>Loading...</div> : 
//                     clients.map(c => (
//                       <div 
//                         key={c.id} 
//                         style={{...styles.dropdownItem, background: selectedClient?.id === c.id ? '#F1F5F9' : 'transparent'}}
//                         onClick={() => {
//                           setSelectedClient(c);
//                           setClientSearch(c.client_name);
//                           setShowClientDropdown(false);
//                         }}
//                       >
//                         {c.client_name}
//                       </div>
//                     ))
//                   }
//                 </div>
//               )}
//             </div>
//             <div style={{ display: 'flex', alignItems: 'flex-end' }}>
//               <button onClick={() => setIsAddClientModalOpen(true)} style={styles.addBtn}>+ Add Client</button>
//             </div>
//           </div>
//           {selectedClient && !hasBankDetails(selectedClient) && (
//             <div style={styles.warningBox}>
//               <span style={{ fontSize: '12px', color: '#B45309' }}>⚠️ Client bank details missing.</span>
//               <button onClick={() => setIsUpdateClientModalOpen(true)} style={styles.updateBtn}>Update Details</button>
//             </div>
//           )}
//         </div>

//         <div style={styles.section}>
//           <label style={styles.label}>Company Bank Account</label>
//           <select style={styles.input} onChange={e => setSelectedBank(e.target.value)} value={selectedBank} disabled={selectedClient && !hasBankDetails(selectedClient)}>
//             <option value="">Select Bank</option>
//             {loadingBanks ? <option disabled>Loading...</option> : banks.map(b => <option key={b.id} value={b.id}>{b.bank_name}</option>)}
//           </select>
//         </div>

//         <div style={styles.grid3}>
//           <div><label style={styles.label}>Invoice Date</label><input type="date" style={styles.input} value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
//           <div><label style={styles.label}>Billing Month</label><input type="date" style={styles.input} value={billingMonth} onChange={e => setBillingMonth(e.target.value)} /></div>
//           <div><label style={styles.label}>Due Date</label><input type="date" style={styles.input} value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
//         </div>

//         <div style={{ marginTop: '30px' }}>
//           <h3 style={{ fontSize: '18px', color: '#1E293B', marginBottom: '15px' }}>Invoice Items</h3>
//           {items.map((item, i) => (
//             <div key={i} style={styles.itemCard}>
//               <div style={styles.grid2}>
//                 <div style={styles.inputGroup}><label style={styles.label}>Billing Type</label>
//                   <select style={styles.input} value={item.billing_type} onChange={e => updateItem(i, "billing_type", e.target.value)}>
//                     <option value="BILLABLE_DAYS">Billable Days</option><option value="HOURLY">Hourly</option><option value="MANUAL">Manual</option>
//                   </select>
//                 </div>
//                 {item.billing_type !== "MANUAL" && (
//                   <div style={{...styles.inputGroup, position: 'relative'}}><label style={styles.label}>Candidate</label>
//                     <input 
//                       style={styles.inputSearch} 
//                       placeholder="Search Candidate..." 
//                       value={item.candidateSearch}
//                       disabled={!selectedClient}
//                       onChange={e => {
//                         updateItem(i, "candidateSearch", e.target.value);
//                         updateItem(i, "showDropdown", true);
//                         fetchCandidates(e.target.value);
//                       }}
//                       onFocus={() => updateItem(i, "showDropdown", true)}
//                     />
//                     {item.showDropdown && (
//                       <div style={styles.dropdownList}>
//                         {loadingCandidates ? <div style={styles.dropdownItem}>Loading...</div> : 
//                           candidateList.map(c => (
//                             <div 
//                               key={c.id} 
//                               style={{...styles.dropdownItem, background: item.candidate === c.id ? '#F1F5F9' : 'transparent'}}
//                               onClick={() => selectCandidate(i, c)}
//                             >
//                               {c.candidate_name}
//                             </div>
//                           ))
//                         }
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//               <div style={styles.grid3}>
//                 <div><label style={styles.label}>Title</label><input style={styles.input} value={item.title} placeholder="Title" onChange={e => updateItem(i, "title", e.target.value)} /></div>
//                 <div><label style={styles.label}>Description</label><input style={styles.input} value={item.description} placeholder="Description" onChange={e => updateItem(i, "description", e.target.value)} /></div>
//                 <div><label style={styles.label}>SAC Code</label><input style={styles.input} value={item.sac_code} placeholder="SAC Code" onChange={e => updateItem(i, "sac_code", e.target.value)} /></div>
//               </div>
//               <div style={styles.gridCalculations}>
//                 {item.billing_type === "BILLABLE_DAYS" && (<>
//                   <div><label style={styles.label}>Monthly Rate</label><input style={styles.input} type="number" value={item.monthly_rate} onChange={e => updateItem(i, "monthly_rate", Number(e.target.value))} /></div>
//                   <div><label style={styles.label}>Total Days</label><input style={styles.input} type="number" value={item.total_days} onChange={e => updateItem(i, "total_days", Number(e.target.value))} /></div>
//                   <div><label style={styles.label}>Working Days</label><input style={styles.input} type="number" value={item.working_days} onChange={e => updateItem(i, "working_days", Number(e.target.value))} /></div>
//                 </>)}
//                 {item.billing_type === "HOURLY" && (<>
//                   <div><label style={styles.label}>Hourly Rate</label><input style={styles.input} type="number" value={item.hourly_rate} onChange={e => updateItem(i, "hourly_rate", Number(e.target.value))} /></div>
//                   <div><label style={styles.label}>Total Hours</label><input style={styles.input} type="number" value={item.total_hours} onChange={e => updateItem(i, "total_hours", Number(e.target.value))} /></div>
//                 </>)}
//                 {item.billing_type === "MANUAL" && <div><label style={styles.label}>Amount</label><input style={styles.input} type="number" value={item.amount} onChange={e => updateItem(i, "amount", Number(e.target.value))} /></div>}
//               </div>
//               <div style={styles.summaryRow}>
//                 <div><label style={styles.label}>GST %</label><input style={{ ...styles.input, width: '60px' }} type="number" value={item.gst_rate} onChange={e => updateItem(i, "gst_rate", Number(e.target.value))} /></div>
//                 <div><small style={styles.label}>Amount</small><div style={styles.readonlyValue}>₹{item.calc_amount}</div></div>
//                 <div><small style={styles.label}>GST</small><div style={styles.readonlyValue}>₹{item.gst_amount}</div></div>
//                 <div><small style={styles.label}>Total</small><div style={styles.totalValue}>₹{item.total}</div></div>
//               </div>
//             </div>
//           ))}
//           <button onClick={addItem} style={styles.addItemBtn}>+ Add Item</button>
//         </div>

//         <div style={{ marginTop: '40px', textAlign: 'right' }}>
//           <button onClick={handleSubmit} disabled={selectedClient && !hasBankDetails(selectedClient)} style={{ ...styles.submitBtnLarge, opacity: (selectedClient && !hasBankDetails(selectedClient)) ? 0.5 : 1 }}>Create Invoice</button>
//         </div>
//       </div>

//       <AddClientModal isOpen={isAddClientModalOpen} onClose={() => setIsAddClientModalOpen(false)} onClientAdded={handleClientAdded} />
//       <UpdateClientModal isOpen={isUpdateClientModalOpen} onClose={() => setIsUpdateClientModalOpen(false)} client={selectedClient} onClientUpdated={handleClientUpdated} />
//     </AccountsBaseLayout>
//   );
// }

// const styles = {
//   topNav: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" },
//   backBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//   settingsBtn: { background: "#F1F5F9", border: "1px solid #E2E8F0", padding: "8px 10px", borderRadius: "8px", cursor: "pointer" },
//   pageTitle: { fontSize: "22px", fontWeight: "800", color: "#1E293B", margin: 0 },
//   card: { background: "#fff", borderRadius: "12px", padding: "25px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
//   section: { marginBottom: "20px" },
//   label: { display: "block", fontSize: "12px", fontWeight: "700", color: "#64748B", marginBottom: "6px", textTransform: 'uppercase' },
//   input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '100%', outline: 'none', boxSizing: 'border-box', fontSize: '14px' },
//   inputSearch: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '100%', outline: 'none', boxSizing: 'border-box', background: '#fff', fontSize: '14px' },
//   dropdownList: { position: 'absolute', top: '100%', left: 0, width: '100%', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
//   dropdownItem: { padding: '10px 14px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9' },
//   textarea: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '100%', minHeight: '80px', fontSize: '14px', outline: 'none' },
//   addBtn: { background: "#10B981", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//   warningBox: { marginTop: "10px", padding: "12px", background: "#FFFBEB", border: "1px solid #FEF3C7", borderRadius: "8px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
//   updateBtn: { background: "#F59E0B", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: '12px', fontWeight: "700" },
//   grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" },
//   grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" },
//   gridCalculations: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "15px", marginBottom: "15px" },
//   itemCard: { padding: "15px", border: "1px solid #F1F5F9", borderRadius: "10px", background: "#F8FAFC", marginBottom: "15px" },
//   summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", gap: '15px' },
//   readonlyValue: { padding: '8px', background: '#E2E8F0', borderRadius: '6px', fontSize: '13px', minWidth: '80px', textAlign: 'center', fontWeight: '600' },
//   totalValue: { padding: '8px', background: '#DBEAFE', borderRadius: '6px', fontSize: '14px', fontWeight: '800', color: '#1E40AF', minWidth: '80px', textAlign: 'center' },
//   addItemBtn: { background: "#3B82F6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//   submitBtnLarge: { background: "#FF9B51", color: "#fff", border: "none", padding: "14px 40px", borderRadius: "10px", fontSize: "16px", fontWeight: "800", cursor: "pointer" },
//   modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
//   modernModalContent: { background: '#fff', borderRadius: '16px', width: '600px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
//   modalHeader: { display: 'flex', justifyContent: 'space-between', padding: '20px 25px', borderBottom: '1px solid #F1F5F9', alignItems: 'center' },
//   modalTitle: { margin: 0, fontSize: '20px', fontWeight: '800', color: '#1E293B' },
//   closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' },
//   modalBody: { padding: '25px', overflowY: 'auto', flex: 1 },
//   modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC' },
//   formSectionTitle: { fontSize: '14px', fontWeight: '800', color: '#FF9B51', marginBottom: '15px', textTransform: 'uppercase', borderBottom: '1px solid #F1F5F9', paddingBottom: '5px' },
//   formGridModern: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' },
//   cancelBtn: { padding: '10px 20px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#64748B' },
//   submitBtn: { padding: '10px 20px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
//   saveBtn: { padding: '10px 20px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
//   inputGroup: { display: 'flex', flexDirection: 'column', gap: '2px' },
//   errorBanner: { background: '#FEF2F2', color: '#EF4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '600', border: '1px solid #FEE2E2' }
// };






// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import AccountsBaseLayout from "../components/AccountsBaseLayout";

// // Add Client Modal Component
// const AddClientModal = ({ isOpen, onClose, onClientAdded }) => {
//   const [formData, setFormData] = useState({
//     client_name: "",
//     company_name: "",
//     phone_number: "",
//     email: "",
//     gst_number: "",
//     billing_address: "",
//     account_holder_name: "",
//     bank_name: "",
//     account_number: "",
//     ifsc_code: ""
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await apiRequest("/invoice/api/clients/", "POST", formData);
//       if (response) {
//         onClientAdded(response);
//         onClose();
//         setFormData({
//           client_name: "", company_name: "", phone_number: "", email: "",
//           gst_number: "", billing_address: "", account_holder_name: "",
//           bank_name: "", account_number: "", ifsc_code: ""
//         });
//       }
//     } catch (error) {
//       setError("Client creation failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div style={styles.modalOverlay}>
//       <div style={styles.modalContent}>
//         <div style={styles.modalHeader}>
//           <h3 style={{ margin: 0 }}>Add New Client</h3>
//           <button onClick={onClose} style={styles.closeBtn}>✕</button>
//         </div>
//         {error && <div style={styles.errorBanner}>{error}</div>}
//         <form onSubmit={handleSubmit}>
//           <div style={styles.formGrid}>
//             <div style={{ gridColumn: "1 / -1" }}><strong>Basic Information</strong></div>
//             <div style={styles.inputGroup}><label>Client Name *</label><input style={styles.input} type="text" required value={formData.client_name} onChange={e => setFormData({ ...formData, client_name: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Company Name</label><input style={styles.input} type="text" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Phone Number *</label><input style={styles.input} type="tel" required value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Email *</label><input style={styles.input} type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
//             <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}><label>GST Number</label><input style={styles.input} type="text" value={formData.gst_number} onChange={e => setFormData({ ...formData, gst_number: e.target.value })} /></div>
//             <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}><label>Billing Address *</label><textarea style={styles.textarea} required value={formData.billing_address} onChange={e => setFormData({ ...formData, billing_address: e.target.value })} /></div>
//             <div style={{ gridColumn: "1 / -1", marginTop: '10px' }}><strong>Bank Details</strong></div>
//             <div style={styles.inputGroup}><label>Account Holder</label><input style={styles.input} type="text" value={formData.account_holder_name} onChange={e => setFormData({ ...formData, account_holder_name: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Bank Name</label><input style={styles.input} type="text" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Account Number</label><input style={styles.input} type="text" value={formData.account_number} onChange={e => setFormData({ ...formData, account_number: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>IFSC Code</label><input style={styles.input} type="text" value={formData.ifsc_code} onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })} /></div>
//           </div>
//           <div style={styles.modalFooter}>
//             <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
//             <button type="submit" disabled={loading} style={styles.submitBtn}>{loading ? "Creating..." : "Create Client"}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Update Client Modal Component
// const UpdateClientModal = ({ isOpen, onClose, client, onClientUpdated }) => {
//   const [formData, setFormData] = useState({
//     client_name: "", company_name: "", phone_number: "", gst_number: "",
//     billing_address: "", account_holder_name: "", bank_name: "",
//     account_number: "", ifsc_code: ""
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (client) {
//       setFormData({
//         client_name: client.client_name || "",
//         company_name: client.company_name || "",
//         phone_number: client.phone_number || "",
//         gst_number: client.gst_number || "",
//         billing_address: client.billing_address || "",
//         account_holder_name: client.account_holder_name || "",
//         bank_name: client.bank_name || "",
//         account_number: client.account_number || "",
//         ifsc_code: client.ifsc_code || ""
//       });
//     }
//   }, [client]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await apiRequest(`/invoice/api/clients/${client.id}/`, "PATCH", formData);
//       if (response) {
//         onClientUpdated(response);
//         onClose();
//       }
//     } catch (error) {
//       setError("Client update failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen || !client) return null;

//   return (
//     <div style={styles.modalOverlay}>
//       <div style={styles.modalContent}>
//         <div style={styles.modalHeader}>
//           <h3 style={{ margin: 0 }}>Update Bank Details</h3>
//           <button onClick={onClose} style={styles.closeBtn}>✕</button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div style={styles.formGrid}>
//             <div style={styles.inputGroup}><label>Account Holder</label><input style={styles.input} type="text" value={formData.account_holder_name} onChange={e => setFormData({ ...formData, account_holder_name: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Bank Name</label><input style={styles.input} type="text" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Account Number</label><input style={styles.input} type="text" value={formData.account_number} onChange={e => setFormData({ ...formData, account_number: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>IFSC Code</label><input style={styles.input} type="text" value={formData.ifsc_code} onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })} /></div>
//           </div>
//           <div style={styles.modalFooter}>
//             <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
//             <button type="submit" disabled={loading} style={styles.saveBtn}>{loading ? "Updating..." : "Update Details"}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default function CreateInvoice() {
//   const navigate = useNavigate();
//   const [clients, setClients] = useState([]);
//   const [clientSearch, setClientSearch] = useState("");
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [loadingClients, setLoadingClients] = useState(false);
//   const [candidates, setCandidates] = useState([]);
//   const [candidateSearch, setCandidateSearch] = useState("");
//   const [loadingCandidates, setLoadingCandidates] = useState(false);
//   const [banks, setBanks] = useState([]);
//   const [selectedBank, setSelectedBank] = useState("");
//   const [loadingBanks, setLoadingBanks] = useState(false);
//   const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
//   const [isUpdateClientModalOpen, setIsUpdateClientModalOpen] = useState(false);

//   const today = new Date().toISOString().slice(0, 10);
//   const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
//   const [invoiceDate, setInvoiceDate] = useState(today);
//   const [billingMonth, setBillingMonth] = useState(currentMonth);
//   const [dueDate, setDueDate] = useState("");
//   const [items, setItems] = useState([]);

//   const hasBankDetails = (client) => {
//     if (!client) return false;
//     return !!(client.account_number && client.bank_name && client.ifsc_code && client.account_holder_name);
//   };

//   const fetchClients = useCallback(async (searchVal = "") => {
//     setLoadingClients(true);
//     try {
//       let all = [];
//       const searchParam = searchVal ? `?search=${encodeURIComponent(searchVal)}` : '';
//       let url = `/invoice/api/clients/${searchParam}`;
//       while (url) {
//         const res = await apiRequest(url);
//         if (res?.results) {
//           all = [...all, ...res.results];
//           url = res.next ? res.next.split('/api')[1] ? '/api' + res.next.split('/api')[1] : null : null;
//         } else break;
//       }
//       setClients(all);
//     } catch (error) { console.error(error); } finally { setLoadingClients(false); }
//   }, []);

//   useEffect(() => {
//     fetchClients();
//   }, [fetchClients]);

//   useEffect(() => {
//     const fetchBanks = async () => {
//       setLoadingBanks(true);
//       try {
//         const res = await apiRequest(`/invoice/api/bank-accounts/`);
//         setBanks(res?.results || []);
//       } catch (error) { console.error(error); } finally { setLoadingBanks(false); }
//     };
//     fetchBanks();
//   }, []);

//   const fetchCandidates = useCallback(async (searchVal = "") => {
//     if (!selectedClient) { setCandidates([]); return; }
//     setLoadingCandidates(true);
//     try {
//       let all = [];
//       const searchParam = searchVal ? `?search=${encodeURIComponent(searchVal)}` : '';
//       let url = `/invoice/api/clients/${selectedClient.id}/candidates/${searchParam}`;
//       while (url) {
//         const res = await apiRequest(url);
//         if (res?.results) {
//           all = [...all, ...res.results];
//           url = res.next ? res.next.split('/api')[1] ? '/api' + res.next.split('/api')[1] : null : null;
//         } else break;
//       }
//       setCandidates(all);
//     } catch (error) { setCandidates([]); } finally { setLoadingCandidates(false); }
//   }, [selectedClient]);

//   useEffect(() => {
//     if (selectedClient) fetchCandidates();
//   }, [selectedClient, fetchCandidates]);

//   const handleClientAdded = (newClient) => {
//     setClients(prev => [...prev, newClient]);
//     setSelectedClient(newClient);
//     setClientSearch("");
//   };

//   const handleClientUpdated = (updatedClient) => {
//     setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
//     setSelectedClient(updatedClient);
//   };

//   const addItem = () => {
//     setItems([...items, {
//       billing_type: "MANUAL", title: "", description: "", sac_code: "",
//       candidate: null, monthly_rate: 0, total_days: 0, working_days: 0,
//       hourly_rate: 0, total_hours: 0, amount: 0, gst_rate: 18,
//       calc_amount: 0, gst_amount: 0, total: 0
//     }]);
//   };

//   const calculate = (item) => {
//     let amount = 0;
//     if (item.billing_type === "BILLABLE_DAYS") {
//       amount = (item.monthly_rate / (item.total_days || 1)) * (item.working_days || 0);
//     } else if (item.billing_type === "HOURLY") {
//       amount = item.hourly_rate * item.total_hours;
//     } else {
//       amount = item.amount || 0;
//     }
//     const gst = (amount * item.gst_rate) / 100;
//     return { amount: Math.round(amount * 100) / 100, gst: Math.round(gst * 100) / 100, total: Math.round((amount + gst) * 100) / 100 };
//   };

//   const updateItem = (i, key, value) => {
//     const newItems = [...items];
//     newItems[i][key] = value;
//     const calc = calculate(newItems[i]);
//     newItems[i].calc_amount = calc.amount;
//     newItems[i].gst_amount = calc.gst;
//     newItems[i].total = calc.total;
//     setItems(newItems);
//   };

//   const selectCandidate = (i, candidate) => {
//     const newItems = [...items];
//     newItems[i].candidate = candidate.id;
//     newItems[i].title = candidate.candidate_name || "";
//     newItems[i].description = candidate.technology || "";
//     newItems[i].monthly_rate = candidate.client_rate || 0;
//     const calc = calculate(newItems[i]);
//     newItems[i].calc_amount = calc.amount;
//     newItems[i].gst_amount = calc.gst;
//     newItems[i].total = calc.total;
//     setItems(newItems);
//   };

//   const handleSubmit = async () => {
//     if (!selectedClient || !selectedBank || !dueDate || items.length === 0) {
//       alert("Please fill all required fields and add at least one item");
//       return;
//     }
//     try {
//       const payload = {
//         client: selectedClient.id, company_bank_account: selectedBank, invoice_type: "CANDIDATE",
//         invoice_date: invoiceDate, billing_month: billingMonth, due_date: dueDate,
//         items: items.map(i => ({
//           candidate: i.candidate, title: i.title, description: i.description, sac_code: i.sac_code,
//           billing_type: i.billing_type, monthly_rate: i.monthly_rate, total_days: i.total_days,
//           working_days: i.working_days, hourly_rate: i.hourly_rate, total_hours: i.total_hours, amount: i.amount
//         }))
//       };
//       await apiRequest("/invoice/api/create/", "POST", payload);
//       alert("Invoice Created Successfully!");
//       navigate("/invoice/list");
//     } catch (error) { alert("Error creating invoice."); }
//   };

//   return (
//     <AccountsBaseLayout>
//       <div style={styles.topNav}>
//         <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
//           <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
//           <h2 style={styles.pageTitle}>Create Invoice</h2>
//         </div>
//         <button style={styles.settingsBtn}><span style={{ fontSize: '18px' }}>⚙</span></button>
//       </div>

//       <div style={styles.card}>
//         <div style={styles.section}>
//           <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
//             <div style={{ flex: 1, position: 'relative' }}>
//               <label style={styles.label}>Select Client</label>
//               <div style={styles.searchDropdownWrapper}>
//                 <input 
//                   style={styles.inputSearch} 
//                   placeholder="Search and Select Client..." 
//                   value={clientSearch} 
//                   onChange={e => {
//                     setClientSearch(e.target.value);
//                     fetchClients(e.target.value);
//                   }}
//                   onFocus={() => { if(clients.length === 0) fetchClients(); }}
//                 />
//                 <div style={styles.dropdownList}>
//                   {loadingClients ? <div style={styles.dropdownItem}>Loading...</div> : 
//                     clients.map(c => (
//                       <div 
//                         key={c.id} 
//                         style={{...styles.dropdownItem, background: selectedClient?.id === c.id ? '#F1F5F9' : 'transparent'}}
//                         onClick={() => {
//                           setSelectedClient(c);
//                           setClientSearch(c.client_name);
//                         }}
//                       >
//                         {c.client_name}
//                       </div>
//                     ))
//                   }
//                 </div>
//               </div>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'flex-end' }}>
//               <button onClick={() => setIsAddClientModalOpen(true)} style={styles.addBtn}>+ Add Client</button>
//             </div>
//           </div>
//           {selectedClient && !hasBankDetails(selectedClient) && (
//             <div style={styles.warningBox}>
//               <span style={{ fontSize: '12px', color: '#B45309' }}>⚠️ Client bank details missing.</span>
//               <button onClick={() => setIsUpdateClientModalOpen(true)} style={styles.updateBtn}>Update Details</button>
//             </div>
//           )}
//         </div>

//         <div style={styles.section}>
//           <label style={styles.label}>Company Bank Account</label>
//           <select style={styles.input} onChange={e => setSelectedBank(e.target.value)} value={selectedBank} disabled={selectedClient && !hasBankDetails(selectedClient)}>
//             <option value="">Select Bank</option>
//             {loadingBanks ? <option disabled>Loading...</option> : banks.map(b => <option key={b.id} value={b.id}>{b.bank_name}</option>)}
//           </select>
//         </div>

//         <div style={styles.grid3}>
//           <div><label style={styles.label}>Invoice Date</label><input type="date" style={styles.input} value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
//           <div><label style={styles.label}>Billing Month</label><input type="date" style={styles.input} value={billingMonth} onChange={e => setBillingMonth(e.target.value)} /></div>
//           <div><label style={styles.label}>Due Date</label><input type="date" style={styles.input} value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
//         </div>

//         <div style={{ marginTop: '30px' }}>
//           <h3 style={{ fontSize: '18px', color: '#1E293B', marginBottom: '15px' }}>Invoice Items</h3>
//           {items.map((item, i) => (
//             <div key={i} style={styles.itemCard}>
//               <div style={styles.grid2}>
//                 <div style={styles.inputGroup}><label style={styles.label}>Billing Type</label>
//                   <select style={styles.input} value={item.billing_type} onChange={e => updateItem(i, "billing_type", e.target.value)}>
//                     <option value="BILLABLE_DAYS">Billable Days</option><option value="HOURLY">Hourly</option><option value="MANUAL">Manual</option>
//                   </select>
//                 </div>
//                 {item.billing_type !== "MANUAL" && (
//                   <div style={styles.inputGroup}><label style={styles.label}>Candidate</label>
//                     <div style={styles.searchDropdownWrapper}>
//                       <input 
//                         style={styles.inputSearch} 
//                         placeholder="Search Candidate..." 
//                         value={candidateSearch}
//                         disabled={!selectedClient}
//                         onChange={e => {
//                           setCandidateSearch(e.target.value);
//                           fetchCandidates(e.target.value);
//                         }}
//                       />
//                       <div style={styles.dropdownList}>
//                         {loadingCandidates ? <div style={styles.dropdownItem}>Loading...</div> : 
//                           candidates.map(c => (
//                             <div 
//                               key={c.id} 
//                               style={{...styles.dropdownItem, background: item.candidate === c.id ? '#F1F5F9' : 'transparent'}}
//                               onClick={() => {
//                                 selectCandidate(i, c);
//                                 setCandidateSearch(c.candidate_name);
//                               }}
//                             >
//                               {c.candidate_name}
//                             </div>
//                           ))
//                         }
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <div style={styles.grid3}>
//                 <div><label style={styles.label}>Title</label><input style={styles.input} value={item.title} placeholder="Title" onChange={e => updateItem(i, "title", e.target.value)} /></div>
//                 <div><label style={styles.label}>Description</label><input style={styles.input} value={item.description} placeholder="Description" onChange={e => updateItem(i, "description", e.target.value)} /></div>
//                 <div><label style={styles.label}>SAC Code</label><input style={styles.input} value={item.sac_code} placeholder="SAC Code" onChange={e => updateItem(i, "sac_code", e.target.value)} /></div>
//               </div>
//               <div style={styles.gridCalculations}>
//                 {item.billing_type === "BILLABLE_DAYS" && (<>
//                   <div><label style={styles.label}>Monthly Rate</label><input style={styles.input} type="number" placeholder="Monthly Rate" value={item.monthly_rate} onChange={e => updateItem(i, "monthly_rate", Number(e.target.value))} /></div>
//                   <div><label style={styles.label}>Total Days</label><input style={styles.input} type="number" placeholder="Total Days" value={item.total_days} onChange={e => updateItem(i, "total_days", Number(e.target.value))} /></div>
//                   <div><label style={styles.label}>Working Days</label><input style={styles.input} type="number" placeholder="Working Days" value={item.working_days} onChange={e => updateItem(i, "working_days", Number(e.target.value))} /></div>
//                 </>)}
//                 {item.billing_type === "HOURLY" && (<>
//                   <div><label style={styles.label}>Hourly Rate</label><input style={styles.input} type="number" placeholder="Hourly Rate" value={item.hourly_rate} onChange={e => updateItem(i, "hourly_rate", Number(e.target.value))} /></div>
//                   <div><label style={styles.label}>Total Hours</label><input style={styles.input} type="number" placeholder="Total Hours" value={item.total_hours} onChange={e => updateItem(i, "total_hours", Number(e.target.value))} /></div>
//                 </>)}
//                 {item.billing_type === "MANUAL" && <div><label style={styles.label}>Amount</label><input style={styles.input} type="number" placeholder="Amount" value={item.amount} onChange={e => updateItem(i, "amount", Number(e.target.value))} /></div>}
//               </div>
//               <div style={styles.summaryRow}>
//                 <div><label style={styles.label}>GST %</label><input style={{ ...styles.input, width: '60px' }} type="number" value={item.gst_rate} onChange={e => updateItem(i, "gst_rate", Number(e.target.value))} /></div>
//                 <div><small style={styles.label}>Amount</small><div style={styles.readonlyValue}>₹{item.calc_amount}</div></div>
//                 <div><small style={styles.label}>GST</small><div style={styles.readonlyValue}>₹{item.gst_amount}</div></div>
//                 <div><small style={styles.label}>Total</small><div style={styles.totalValue}>₹{item.total}</div></div>
//               </div>
//             </div>
//           ))}
//           <button onClick={addItem} style={styles.addItemBtn}>+ Add Item</button>
//         </div>

//         <div style={{ marginTop: '40px', textAlign: 'right' }}>
//           <button onClick={handleSubmit} disabled={selectedClient && !hasBankDetails(selectedClient)} style={{ ...styles.submitBtnLarge, opacity: (selectedClient && !hasBankDetails(selectedClient)) ? 0.5 : 1 }}>Create Invoice</button>
//         </div>
//       </div>

//       <AddClientModal isOpen={isAddClientModalOpen} onClose={() => setIsAddClientModalOpen(false)} onClientAdded={handleClientAdded} />
//       <UpdateClientModal isOpen={isUpdateClientModalOpen} onClose={() => setIsUpdateClientModalOpen(false)} client={selectedClient} onClientUpdated={handleClientUpdated} />
//     </AccountsBaseLayout>
//   );
// }

// const styles = {
//   topNav: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" },
//   backBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//   settingsBtn: { background: "#F1F5F9", border: "1px solid #E2E8F0", padding: "8px 10px", borderRadius: "8px", cursor: "pointer" },
//   pageTitle: { fontSize: "22px", fontWeight: "800", color: "#1E293B", margin: 0 },
//   card: { background: "#fff", borderRadius: "12px", padding: "25px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
//   section: { marginBottom: "20px" },
//   label: { display: "block", fontSize: "13px", fontWeight: "700", color: "#64748B", marginBottom: "6px" },
//   input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '100%', outline: 'none', boxSizing: 'border-box' },
//   inputSearch: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '100%', outline: 'none', boxSizing: 'border-box', background: '#fff' },
//   searchDropdownWrapper: { position: 'relative' },
//   dropdownList: { position: 'absolute', top: '100%', left: 0, width: '100%', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'block' },
//   dropdownItem: { padding: '10px 14px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9' },
//   textarea: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '100%', minHeight: '60px' },
//   addBtn: { background: "#10B981", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//   warningBox: { marginTop: "10px", padding: "12px", background: "#FFFBEB", border: "1px solid #FEF3C7", borderRadius: "8px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
//   updateBtn: { background: "#F59E0B", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: '12px', fontWeight: "700" },
//   grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" },
//   grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" },
//   gridCalculations: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "15px", marginBottom: "15px" },
//   itemCard: { padding: "15px", border: "1px solid #F1F5F9", borderRadius: "10px", background: "#F8FAFC", marginBottom: "15px" },
//   summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", gap: '15px' },
//   readonlyValue: { padding: '8px', background: '#E2E8F0', borderRadius: '6px', fontSize: '13px', minWidth: '80px', textAlign: 'center' },
//   totalValue: { padding: '8px', background: '#DBEAFE', borderRadius: '6px', fontSize: '14px', fontWeight: '800', color: '#1E40AF', minWidth: '80px', textAlign: 'center' },
//   addItemBtn: { background: "#3B82F6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//   submitBtnLarge: { background: "#FF9B51", color: "#fff", border: "none", padding: "14px 40px", borderRadius: "10px", fontSize: "16px", fontWeight: "800", cursor: "pointer" },
//   modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
//   modalContent: { background: '#fff', padding: '25px', borderRadius: '12px', width: '550px', maxHeight: '90vh', overflowY: 'auto' },
//   modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
//   modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' },
//   cancelBtn: { padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: '6px', cursor: 'pointer' },
//   submitBtn: { padding: '8px 16px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
//   saveBtn: { padding: '8px 16px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
//   formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
//   inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' }
// };






// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import AccountsBaseLayout from "../components/AccountsBaseLayout";

// // Add Client Modal Component
// const AddClientModal = ({ isOpen, onClose, onClientAdded }) => {
//   const [formData, setFormData] = useState({
//     client_name: "",
//     company_name: "",
//     phone_number: "",
//     email: "",
//     gst_number: "",
//     billing_address: "",
//     account_holder_name: "",
//     bank_name: "",
//     account_number: "",
//     ifsc_code: ""
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await apiRequest("/invoice/api/clients/", "POST", formData);
//       if (response) {
//         onClientAdded(response);
//         onClose();
//         setFormData({
//           client_name: "", company_name: "", phone_number: "", email: "",
//           gst_number: "", billing_address: "", account_holder_name: "",
//           bank_name: "", account_number: "", ifsc_code: ""
//         });
//       }
//     } catch (error) {
//       setError("Client creation failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div style={styles.modalOverlay}>
//       <div style={styles.modalContent}>
//         <div style={styles.modalHeader}>
//           <h3 style={{ margin: 0 }}>Add New Client</h3>
//           <button onClick={onClose} style={styles.closeBtn}>✕</button>
//         </div>
//         {error && <div style={styles.errorBanner}>{error}</div>}
//         <form onSubmit={handleSubmit}>
//           <div style={styles.formGrid}>
//             <div style={{ gridColumn: "1 / -1" }}><strong>Basic Information</strong></div>
//             <div style={styles.inputGroup}><label>Client Name *</label><input style={styles.input} type="text" required value={formData.client_name} onChange={e => setFormData({ ...formData, client_name: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Company Name</label><input style={styles.input} type="text" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Phone Number *</label><input style={styles.input} type="tel" required value={formData.phone_number} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Email *</label><input style={styles.input} type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
//             <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}><label>GST Number</label><input style={styles.input} type="text" value={formData.gst_number} onChange={e => setFormData({ ...formData, gst_number: e.target.value })} /></div>
//             <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}><label>Billing Address *</label><textarea style={styles.textarea} required value={formData.billing_address} onChange={e => setFormData({ ...formData, billing_address: e.target.value })} /></div>
//             <div style={{ gridColumn: "1 / -1", marginTop: '10px' }}><strong>Bank Details</strong></div>
//             <div style={styles.inputGroup}><label>Account Holder</label><input style={styles.input} type="text" value={formData.account_holder_name} onChange={e => setFormData({ ...formData, account_holder_name: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Bank Name</label><input style={styles.input} type="text" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Account Number</label><input style={styles.input} type="text" value={formData.account_number} onChange={e => setFormData({ ...formData, account_number: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>IFSC Code</label><input style={styles.input} type="text" value={formData.ifsc_code} onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })} /></div>
//           </div>
//           <div style={styles.modalFooter}>
//             <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
//             <button type="submit" disabled={loading} style={styles.submitBtn}>{loading ? "Creating..." : "Create Client"}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Update Client Modal Component
// const UpdateClientModal = ({ isOpen, onClose, client, onClientUpdated }) => {
//   const [formData, setFormData] = useState({
//     client_name: "", company_name: "", phone_number: "", gst_number: "",
//     billing_address: "", account_holder_name: "", bank_name: "",
//     account_number: "", ifsc_code: ""
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (client) {
//       setFormData({
//         client_name: client.client_name || "",
//         company_name: client.company_name || "",
//         phone_number: client.phone_number || "",
//         gst_number: client.gst_number || "",
//         billing_address: client.billing_address || "",
//         account_holder_name: client.account_holder_name || "",
//         bank_name: client.bank_name || "",
//         account_number: client.account_number || "",
//         ifsc_code: client.ifsc_code || ""
//       });
//     }
//   }, [client]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await apiRequest(`/invoice/api/clients/${client.id}/`, "PATCH", formData);
//       if (response) {
//         onClientUpdated(response);
//         onClose();
//       }
//     } catch (error) {
//       setError("Client update failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen || !client) return null;

//   return (
//     <div style={styles.modalOverlay}>
//       <div style={styles.modalContent}>
//         <div style={styles.modalHeader}>
//           <h3 style={{ margin: 0 }}>Update Bank Details</h3>
//           <button onClick={onClose} style={styles.closeBtn}>✕</button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div style={styles.formGrid}>
//             <div style={styles.inputGroup}><label>Account Holder</label><input style={styles.input} type="text" value={formData.account_holder_name} onChange={e => setFormData({ ...formData, account_holder_name: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Bank Name</label><input style={styles.input} type="text" value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>Account Number</label><input style={styles.input} type="text" value={formData.account_number} onChange={e => setFormData({ ...formData, account_number: e.target.value })} /></div>
//             <div style={styles.inputGroup}><label>IFSC Code</label><input style={styles.input} type="text" value={formData.ifsc_code} onChange={e => setFormData({ ...formData, ifsc_code: e.target.value })} /></div>
//           </div>
//           <div style={styles.modalFooter}>
//             <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
//             <button type="submit" disabled={loading} style={styles.saveBtn}>{loading ? "Updating..." : "Update Details"}</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default function CreateInvoice() {
//   const navigate = useNavigate();
//   const [clients, setClients] = useState([]);
//   const [clientSearch, setClientSearch] = useState("");
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [loadingClients, setLoadingClients] = useState(false);
//   const [candidates, setCandidates] = useState([]);
//   const [candidateSearch, setCandidateSearch] = useState("");
//   const [loadingCandidates, setLoadingCandidates] = useState(false);
//   const [banks, setBanks] = useState([]);
//   const [selectedBank, setSelectedBank] = useState("");
//   const [loadingBanks, setLoadingBanks] = useState(false);
//   const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
//   const [isUpdateClientModalOpen, setIsUpdateClientModalOpen] = useState(false);

//   const today = new Date().toISOString().slice(0, 10);
//   const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
//   const [invoiceDate, setInvoiceDate] = useState(today);
//   const [billingMonth, setBillingMonth] = useState(currentMonth);
//   const [dueDate, setDueDate] = useState("");
//   const [items, setItems] = useState([]);

//   const hasBankDetails = (client) => {
//     if (!client) return false;
//     return !!(client.account_number && client.bank_name && client.ifsc_code && client.account_holder_name);
//   };

//   const fetchClients = useCallback(async () => {
//     setLoadingClients(true);
//     try {
//       let all = [];
//       const searchParam = clientSearch ? `?search=${encodeURIComponent(clientSearch)}` : '';
//       let url = `/invoice/api/clients/${searchParam}`;
//       while (url) {
//         const res = await apiRequest(url);
//         if (res?.results) {
//           all = [...all, ...res.results];
//           url = res.next ? res.next.split('/api')[1] ? '/api' + res.next.split('/api')[1] : null : null;
//         } else break;
//       }
//       setClients(all);
//     } catch (error) { console.error(error); } finally { setLoadingClients(false); }
//   }, [clientSearch]);

//   useEffect(() => {
//     const timer = setTimeout(() => fetchClients(), 500);
//     return () => clearTimeout(timer);
//   }, [clientSearch, fetchClients]);

//   useEffect(() => {
//     const fetchBanks = async () => {
//       setLoadingBanks(true);
//       try {
//         const res = await apiRequest(`/invoice/api/bank-accounts/`);
//         setBanks(res?.results || []);
//       } catch (error) { console.error(error); } finally { setLoadingBanks(false); }
//     };
//     fetchBanks();
//   }, []);

//   const fetchCandidates = useCallback(async () => {
//     if (!selectedClient) { setCandidates([]); return; }
//     setLoadingCandidates(true);
//     try {
//       let all = [];
//       const searchParam = candidateSearch ? `?search=${encodeURIComponent(candidateSearch)}` : '';
//       let url = `/invoice/api/clients/${selectedClient.id}/candidates/${searchParam}`;
//       while (url) {
//         const res = await apiRequest(url);
//         if (res?.results) {
//           all = [...all, ...res.results];
//           url = res.next ? res.next.split('/api')[1] ? '/api' + res.next.split('/api')[1] : null : null;
//         } else break;
//       }
//       setCandidates(all);
//     } catch (error) { setCandidates([]); } finally { setLoadingCandidates(false); }
//   }, [selectedClient, candidateSearch]);

//   useEffect(() => {
//     const timer = setTimeout(() => { if (selectedClient) fetchCandidates(); }, 500);
//     return () => clearTimeout(timer);
//   }, [candidateSearch, selectedClient, fetchCandidates]);

//   const handleClientAdded = (newClient) => {
//     setClients(prev => [...prev, newClient]);
//     setSelectedClient(newClient);
//     setClientSearch("");
//   };

//   const handleClientUpdated = (updatedClient) => {
//     setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
//     setSelectedClient(updatedClient);
//   };

//   const addItem = () => {
//     setItems([...items, {
//       billing_type: "MANUAL", title: "", description: "", sac_code: "",
//       candidate: null, monthly_rate: 0, total_days: 0, working_days: 0,
//       hourly_rate: 0, total_hours: 0, amount: 0, gst_rate: 18,
//       calc_amount: 0, gst_amount: 0, total: 0
//     }]);
//   };

//   const calculate = (item) => {
//     let amount = 0;
//     if (item.billing_type === "BILLABLE_DAYS") {
//       amount = (item.monthly_rate / (item.total_days || 1)) * (item.working_days || 0);
//     } else if (item.billing_type === "HOURLY") {
//       amount = item.hourly_rate * item.total_hours;
//     } else {
//       amount = item.amount || 0;
//     }
//     const gst = (amount * item.gst_rate) / 100;
//     return { amount: Math.round(amount * 100) / 100, gst: Math.round(gst * 100) / 100, total: Math.round((amount + gst) * 100) / 100 };
//   };

//   const updateItem = (i, key, value) => {
//     const newItems = [...items];
//     newItems[i][key] = value;
//     const calc = calculate(newItems[i]);
//     newItems[i].calc_amount = calc.amount;
//     newItems[i].gst_amount = calc.gst;
//     newItems[i].total = calc.total;
//     setItems(newItems);
//   };

//   const selectCandidate = (i, candidate) => {
//     const newItems = [...items];
//     newItems[i].candidate = candidate.id;
//     newItems[i].title = candidate.candidate_name || "";
//     newItems[i].description = candidate.technology || "";
//     newItems[i].monthly_rate = candidate.client_rate || 0;
//     const calc = calculate(newItems[i]);
//     newItems[i].calc_amount = calc.amount;
//     newItems[i].gst_amount = calc.gst;
//     newItems[i].total = calc.total;
//     setItems(newItems);
//   };

//   const handleSubmit = async () => {
//     if (!selectedClient || !selectedBank || !dueDate || items.length === 0) {
//       alert("Please fill all required fields and add at least one item");
//       return;
//     }
//     try {
//       const payload = {
//         client: selectedClient.id, company_bank_account: selectedBank, invoice_type: "CANDIDATE",
//         invoice_date: invoiceDate, billing_month: billingMonth, due_date: dueDate,
//         items: items.map(i => ({
//           candidate: i.candidate, title: i.title, description: i.description, sac_code: i.sac_code,
//           billing_type: i.billing_type, monthly_rate: i.monthly_rate, total_days: i.total_days,
//           working_days: i.working_days, hourly_rate: i.hourly_rate, total_hours: i.total_hours, amount: i.amount
//         }))
//       };
//       await apiRequest("/invoice/api/create/", "POST", payload);
//       alert("Invoice Created Successfully!");
//       navigate("/invoice/list");
//     } catch (error) { alert("Error creating invoice."); }
//   };

//   return (
//     <AccountsBaseLayout>
//       <div style={styles.topNav}>
//         <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
//           <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
//           <h2 style={styles.pageTitle}>Create Invoice</h2>
//         </div>
//         <button style={styles.settingsBtn}><span style={{ fontSize: '18px' }}>⚙</span></button>
//       </div>

//       <div style={styles.card}>
//         <div style={styles.section}>
//           <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
//             <div style={{ flex: 1 }}>
//               <label style={styles.label}>Search Client</label>
//               <input style={styles.input} placeholder="Type to search..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
//             </div>
//             <div style={{ display: 'flex', alignItems: 'flex-end' }}>
//               <button onClick={() => setIsAddClientModalOpen(true)} style={styles.addBtn}>+ Add Client</button>
//             </div>
//           </div>
//           <select style={styles.input} onChange={e => setSelectedClient(clients.find(x => x.id == e.target.value))} value={selectedClient?.id || ""}>
//             <option value="">Select Client</option>
//             {loadingClients ? <option disabled>Loading...</option> : clients.map(c => <option key={c.id} value={c.id}>{c.client_name}</option>)}
//           </select>
//           {selectedClient && !hasBankDetails(selectedClient) && (
//             <div style={styles.warningBox}>
//               <span style={{ fontSize: '12px', color: '#B45309' }}>⚠️ Client bank details missing.</span>
//               <button onClick={() => setIsUpdateClientModalOpen(true)} style={styles.updateBtn}>Update Details</button>
//             </div>
//           )}
//         </div>

//         <div style={styles.section}>
//           <label style={styles.label}>Company Bank Account</label>
//           <select style={styles.input} onChange={e => setSelectedBank(e.target.value)} value={selectedBank} disabled={selectedClient && !hasBankDetails(selectedClient)}>
//             <option value="">Select Bank</option>
//             {loadingBanks ? <option disabled>Loading...</option> : banks.map(b => <option key={b.id} value={b.id}>{b.bank_name}</option>)}
//           </select>
//         </div>

//         <div style={styles.grid3}>
//           <div><label style={styles.label}>Invoice Date</label><input type="date" style={styles.input} value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
//           <div><label style={styles.label}>Billing Month</label><input type="date" style={styles.input} value={billingMonth} onChange={e => setBillingMonth(e.target.value)} /></div>
//           <div><label style={styles.label}>Due Date</label><input type="date" style={styles.input} value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
//         </div>

//         <div style={{ marginTop: '30px' }}>
//           <h3 style={{ fontSize: '18px', color: '#1E293B', marginBottom: '15px' }}>Invoice Items</h3>
//           {items.map((item, i) => (
//             <div key={i} style={styles.itemCard}>
//               <div style={styles.grid2}>
//                 <div style={styles.inputGroup}><label>Billing Type</label>
//                   <select style={styles.input} value={item.billing_type} onChange={e => updateItem(i, "billing_type", e.target.value)}>
//                     <option value="BILLABLE_DAYS">Billable Days</option><option value="HOURLY">Hourly</option><option value="MANUAL">Manual</option>
//                   </select>
//                 </div>
//                 {item.billing_type !== "MANUAL" && (
//                   <div style={styles.inputGroup}><label>Candidate</label>
//                     <select style={styles.input} onChange={e => selectCandidate(i, candidates.find(x => x.id == e.target.value))} value={item.candidate || ""} disabled={!selectedClient}>
//                       <option value="">Select Candidate</option>{candidates.map(c => <option key={c.id} value={c.id}>{c.candidate_name}</option>)}
//                     </select>
//                   </div>
//                 )}
//               </div>
//               <div style={styles.grid3}>
//                 <input style={styles.input} value={item.title} placeholder="Title" onChange={e => updateItem(i, "title", e.target.value)} />
//                 <input style={styles.input} value={item.description} placeholder="Description" onChange={e => updateItem(i, "description", e.target.value)} />
//                 <input style={styles.input} value={item.sac_code} placeholder="SAC Code" onChange={e => updateItem(i, "sac_code", e.target.value)} />
//               </div>
//               <div style={styles.gridCalculations}>
//                 {item.billing_type === "BILLABLE_DAYS" && (<><input style={styles.input} type="number" placeholder="Monthly Rate" value={item.monthly_rate} onChange={e => updateItem(i, "monthly_rate", Number(e.target.value))} /><input style={styles.input} type="number" placeholder="Total Days" value={item.total_days} onChange={e => updateItem(i, "total_days", Number(e.target.value))} /><input style={styles.input} type="number" placeholder="Working Days" value={item.working_days} onChange={e => updateItem(i, "working_days", Number(e.target.value))} /></>)}
//                 {item.billing_type === "HOURLY" && (<><input style={styles.input} type="number" placeholder="Hourly Rate" value={item.hourly_rate} onChange={e => updateItem(i, "hourly_rate", Number(e.target.value))} /><input style={styles.input} type="number" placeholder="Total Hours" value={item.total_hours} onChange={e => updateItem(i, "total_hours", Number(e.target.value))} /></>)}
//                 {item.billing_type === "MANUAL" && <input style={styles.input} type="number" placeholder="Amount" value={item.amount} onChange={e => updateItem(i, "amount", Number(e.target.value))} />}
//               </div>
//               <div style={styles.summaryRow}>
//                 <div><label>GST %</label><input style={{ ...styles.input, width: '60px' }} type="number" value={item.gst_rate} onChange={e => updateItem(i, "gst_rate", Number(e.target.value))} /></div>
//                 <div><small>Amount</small><div style={styles.readonlyValue}>₹{item.calc_amount}</div></div>
//                 <div><small>GST</small><div style={styles.readonlyValue}>₹{item.gst_amount}</div></div>
//                 <div><small>Total</small><div style={styles.totalValue}>₹{item.total}</div></div>
//               </div>
//             </div>
//           ))}
//           <button onClick={addItem} style={styles.addItemBtn}>+ Add Item</button>
//         </div>

//         <div style={{ marginTop: '40px', textAlign: 'right' }}>
//           <button onClick={handleSubmit} disabled={selectedClient && !hasBankDetails(selectedClient)} style={{ ...styles.submitBtnLarge, opacity: (selectedClient && !hasBankDetails(selectedClient)) ? 0.5 : 1 }}>Create Invoice</button>
//         </div>
//       </div>

//       <AddClientModal isOpen={isAddClientModalOpen} onClose={() => setIsAddClientModalOpen(false)} onClientAdded={handleClientAdded} />
//       <UpdateClientModal isOpen={isUpdateClientModalOpen} onClose={() => setIsUpdateClientModalOpen(false)} client={selectedClient} onClientUpdated={handleClientUpdated} />
//     </AccountsBaseLayout>
//   );
// }

// const styles = {
//   topNav: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" },
//   backBtn: { background: "#1E293B", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//   settingsBtn: { background: "#F1F5F9", border: "1px solid #E2E8F0", padding: "8px 10px", borderRadius: "8px", cursor: "pointer" },
//   pageTitle: { fontSize: "22px", fontWeight: "800", color: "#1E293B", margin: 0 },
//   card: { background: "#fff", borderRadius: "12px", padding: "25px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" },
//   section: { marginBottom: "20px" },
//   label: { display: "block", fontSize: "13px", fontWeight: "700", color: "#64748B", marginBottom: "6px" },
//   input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '100%', outline: 'none', boxSizing: 'border-box' },
//   textarea: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", width: '100%', minHeight: '60px' },
//   addBtn: { background: "#10B981", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//   warningBox: { marginTop: "10px", padding: "12px", background: "#FFFBEB", border: "1px solid #FEF3C7", borderRadius: "8px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
//   updateBtn: { background: "#F59E0B", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: '12px', fontWeight: "700" },
//   grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" },
//   grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" },
//   itemCard: { padding: "15px", border: "1px solid #F1F5F9", borderRadius: "10px", background: "#F8FAFC", marginBottom: "15px" },
//   summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", gap: '15px' },
//   readonlyValue: { padding: '8px', background: '#E2E8F0', borderRadius: '6px', fontSize: '13px', minWidth: '80px', textAlign: 'center' },
//   totalValue: { padding: '8px', background: '#DBEAFE', borderRadius: '6px', fontSize: '14px', fontWeight: '800', color: '#1E40AF', minWidth: '80px', textAlign: 'center' },
//   addItemBtn: { background: "#3B82F6", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
//   submitBtnLarge: { background: "#FF9B51", color: "#fff", border: "none", padding: "14px 40px", borderRadius: "10px", fontSize: "16px", fontWeight: "800", cursor: "pointer" },
//   modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
//   modalContent: { background: '#fff', padding: '25px', borderRadius: '12px', width: '550px', maxHeight: '90vh', overflowY: 'auto' },
//   modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
//   modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' },
//   cancelBtn: { padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: '6px', cursor: 'pointer' },
//   submitBtn: { padding: '8px 16px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
//   saveBtn: { padding: '8px 16px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
//   formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
//   inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' }
// };


// ============================================================================================================================================




// import React, { useEffect, useState, useCallback } from "react";
// import { apiRequest } from "../../services/api";

// // Add Client Modal Component
// const AddClientModal = ({ isOpen, onClose, onClientAdded }) => {
//   const [formData, setFormData] = useState({
//     client_name: "",
//     company_name: "",
//     phone_number: "",
//     email: "",
//     gst_number: "",
//     billing_address: "",
//     account_holder_name: "",
//     bank_name: "",
//     account_number: "",
//     ifsc_code: ""
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await apiRequest("/invoice/api/clients/", "POST", formData);
      
//       // Agar response mein client ka data aata hai to use add karo
//       if (response) {
//         onClientAdded(response);
//         onClose();
//         // Reset form
//         setFormData({
//           client_name: "", company_name: "", phone_number: "", email: "",
//           gst_number: "", billing_address: "", account_holder_name: "",
//           bank_name: "", account_number: "", ifsc_code: ""
//         });
//       }
//     } catch (error) {
//       console.error("Error creating client:", error);
//       setError("Client creation failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-xl font-bold">Add New Client</h3>
//           <button 
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             ✕
//           </button>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="grid grid-cols-2 gap-4">
//             {/* Basic Information */}
//             <div className="col-span-2">
//               <h4 className="font-semibold mb-2 text-gray-700">Basic Information</h4>
//             </div>
            
//             <div>
//               <label className="block mb-1">Client Name *</label>
//               <input
//                 type="text"
//                 required
//                 className="w-full p-2 border rounded"
//                 value={formData.client_name}
//                 onChange={e => setFormData({...formData, client_name: e.target.value})}
//               />
//             </div>

//             <div>
//               <label className="block mb-1">Company Name</label>
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 value={formData.company_name}
//                 onChange={e => setFormData({...formData, company_name: e.target.value})}
//               />
//             </div>

//             <div>
//               <label className="block mb-1">Phone Number *</label>
//               <input
//                 type="tel"
//                 required
//                 className="w-full p-2 border rounded"
//                 value={formData.phone_number}
//                 onChange={e => setFormData({...formData, phone_number: e.target.value})}
//               />
//             </div>

//             <div>
//               <label className="block mb-1">Email *</label>
//               <input
//                 type="email"
//                 required
//                 className="w-full p-2 border rounded"
//                 value={formData.email}
//                 onChange={e => setFormData({...formData, email: e.target.value})}
//               />
//             </div>

//             <div className="col-span-2">
//               <label className="block mb-1">GST Number</label>
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 value={formData.gst_number}
//                 onChange={e => setFormData({...formData, gst_number: e.target.value})}
//               />
//             </div>

//             <div className="col-span-2">
//               <label className="block mb-1">Billing Address *</label>
//               <textarea
//                 required
//                 className="w-full p-2 border rounded"
//                 rows="2"
//                 value={formData.billing_address}
//                 onChange={e => setFormData({...formData, billing_address: e.target.value})}
//               />
//             </div>

//             {/* Bank Details */}
//             <div className="col-span-2 mt-4">
//               <h4 className="font-semibold mb-2 text-gray-700">Bank Details</h4>
//             </div>

//             <div>
//               <label className="block mb-1">Account Holder Name</label>
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 value={formData.account_holder_name}
//                 onChange={e => setFormData({...formData, account_holder_name: e.target.value})}
//               />
//             </div>

//             <div>
//               <label className="block mb-1">Bank Name</label>
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 value={formData.bank_name}
//                 onChange={e => setFormData({...formData, bank_name: e.target.value})}
//               />
//             </div>

//             <div>
//               <label className="block mb-1">Account Number</label>
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 value={formData.account_number}
//                 onChange={e => setFormData({...formData, account_number: e.target.value})}
//               />
//             </div>

//             <div>
//               <label className="block mb-1">IFSC Code</label>
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 value={formData.ifsc_code}
//                 onChange={e => setFormData({...formData, ifsc_code: e.target.value})}
//               />
//             </div>
//           </div>

//           <div className="flex justify-end gap-2 mt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border rounded hover:bg-gray-100"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
//             >
//               {loading ? "Creating..." : "Create Client"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Update Client Modal Component
// const UpdateClientModal = ({ isOpen, onClose, client, onClientUpdated }) => {
//   const [formData, setFormData] = useState({
//     client_name: "",
//     company_name: "",
//     phone_number: "",
//     gst_number: "",
//     billing_address: "",
//     account_holder_name: "",
//     bank_name: "",
//     account_number: "",
//     ifsc_code: ""
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Populate form when client changes
//   useEffect(() => {
//     if (client) {
//       setFormData({
//         client_name: client.client_name || "",
//         company_name: client.company_name || "",
//         phone_number: client.phone_number || "",
//         gst_number: client.gst_number || "",
//         billing_address: client.billing_address || "",
//         account_holder_name: client.account_holder_name || "",
//         bank_name: client.bank_name || "",
//         account_number: client.account_number || "",
//         ifsc_code: client.ifsc_code || ""
//       });
//     }
//   }, [client]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await apiRequest(`/invoice/api/clients/${client.id}/`, "PATCH", formData);
      
//       if (response) {
//         onClientUpdated(response);
//         onClose();
//       }
//     } catch (error) {
//       console.error("Error updating client:", error);
//       setError("Client update failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen || !client) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-xl font-bold">Update Client: {client.client_name}</h3>
//           <button 
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             ✕
//           </button>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="grid grid-cols-2 gap-4">
//             {/* Basic Information */}
//             <div className="col-span-2">
//               <h4 className="font-semibold mb-2 text-gray-700">Basic Information</h4>
//             </div>
            
//             <div>
//               <label className="block mb-1">Client Name *</label>
//               <input
//                 type="text"
//                 required
//                 className="w-full p-2 border rounded"
//                 value={formData.client_name}
//                 onChange={e => setFormData({...formData, client_name: e.target.value})}
//               />
//             </div>

//             <div>
//               <label className="block mb-1">Company Name</label>
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 value={formData.company_name}
//                 onChange={e => setFormData({...formData, company_name: e.target.value})}
//               />
//             </div>

//             <div>
//               <label className="block mb-1">Phone Number *</label>
//               <input
//                 type="tel"
//                 required
//                 className="w-full p-2 border rounded"
//                 value={formData.phone_number}
//                 onChange={e => setFormData({...formData, phone_number: e.target.value})}
//               />
//             </div>

//             <div className="col-span-2">
//               <label className="block mb-1">GST Number</label>
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 value={formData.gst_number}
//                 onChange={e => setFormData({...formData, gst_number: e.target.value})}
//               />
//             </div>

//             <div className="col-span-2">
//               <label className="block mb-1">Billing Address *</label>
//               <textarea
//                 required
//                 className="w-full p-2 border rounded"
//                 rows="2"
//                 value={formData.billing_address}
//                 onChange={e => setFormData({...formData, billing_address: e.target.value})}
//               />
//             </div>

//             {/* Bank Details */}
//             <div className="col-span-2 mt-4">
//               <h4 className="font-semibold mb-2 text-gray-700">Bank Details</h4>
//             </div>

//             <div>
//               <label className="block mb-1">Account Holder Name</label>
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 value={formData.account_holder_name}
//                 onChange={e => setFormData({...formData, account_holder_name: e.target.value})}
//               />
//             </div>

//             <div>
//               <label className="block mb-1">Bank Name</label>
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 value={formData.bank_name}
//                 onChange={e => setFormData({...formData, bank_name: e.target.value})}
//               />
//             </div>

//             <div>
//               <label className="block mb-1">Account Number</label>
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 value={formData.account_number}
//                 onChange={e => setFormData({...formData, account_number: e.target.value})}
//               />
//             </div>

//             <div>
//               <label className="block mb-1">IFSC Code</label>
//               <input
//                 type="text"
//                 className="w-full p-2 border rounded"
//                 value={formData.ifsc_code}
//                 onChange={e => setFormData({...formData, ifsc_code: e.target.value})}
//               />
//             </div>
//           </div>

//           <div className="flex justify-end gap-2 mt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border rounded hover:bg-gray-100"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
//             >
//               {loading ? "Updating..." : "Update Client"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default function CreateInvoice() {
//   // ================= STATE =================
//   const [clients, setClients] = useState([]);
//   const [clientSearch, setClientSearch] = useState("");
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [loadingClients, setLoadingClients] = useState(false);

//   const [candidates, setCandidates] = useState([]);
//   const [candidateSearch, setCandidateSearch] = useState("");
//   const [loadingCandidates, setLoadingCandidates] = useState(false);

//   const [banks, setBanks] = useState([]);
//   const [selectedBank, setSelectedBank] = useState("");
//   const [loadingBanks, setLoadingBanks] = useState(false);

//   // Modal states
//   const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
//   const [isUpdateClientModalOpen, setIsUpdateClientModalOpen] = useState(false);

//   const today = new Date().toISOString().slice(0, 10);
//   const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

//   const [invoiceDate, setInvoiceDate] = useState(today);
//   const [billingMonth, setBillingMonth] = useState(currentMonth);
//   const [dueDate, setDueDate] = useState("");

//   const [items, setItems] = useState([]);

//   // Check if client has bank details
//   const hasBankDetails = (client) => {
//     if (!client) return false;
//     return !!(client.account_number && client.bank_name && client.ifsc_code && client.account_holder_name);
//   };

//   // ================= CLIENT SEARCH WITH DEBOUNCE =================
//   const fetchClients = useCallback(async () => {
//     setLoadingClients(true);
//     try {
//       let all = [];
//       const searchParam = clientSearch ? `?search=${encodeURIComponent(clientSearch)}` : '';
//       let url = `/invoice/api/clients/${searchParam}`;

//       while (url) {
//         const res = await apiRequest(url);
//         if (res?.results) {
//           all = [...all, ...res.results];
//           url = res.next ? res.next.replace("http://localhost:8000", "") : null;
//         } else {
//           break;
//         }
//       }
//       setClients(all);
//     } catch (error) {
//       console.error("Error fetching clients:", error);
//     } finally {
//       setLoadingClients(false);
//     }
//   }, [clientSearch]);

//   // Debounce effect for client search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchClients();
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [clientSearch, fetchClients]);

//   // Initial clients fetch
//   useEffect(() => {
//     fetchClients();
//   }, []);

//   // ================= BANK =================
//   const fetchBanks = async () => {
//     setLoadingBanks(true);
//     try {
//       const res = await apiRequest(`/invoice/api/bank-accounts/`);
//       setBanks(res?.results || []);
//     } catch (error) {
//       console.error("Error fetching banks:", error);
//     } finally {
//       setLoadingBanks(false);
//     }
//   };

//   useEffect(() => {
//     fetchBanks();
//   }, []);

//   // ================= CANDIDATE SEARCH =================
//   const fetchCandidates = useCallback(async () => {
//     if (!selectedClient) {
//       setCandidates([]);
//       return;
//     }

//     setLoadingCandidates(true);
//     try {
//       let all = [];
//       const searchParam = candidateSearch ? `?search=${encodeURIComponent(candidateSearch)}` : '';
//       let url = `/invoice/api/clients/${selectedClient.id}/candidates/${searchParam}`;

//       while (url) {
//         const res = await apiRequest(url);
//         if (res?.results) {
//           all = [...all, ...res.results];
//           url = res.next ? res.next.replace("http://localhost:8000", "") : null;
//         } else {
//           break;
//         }
//       }

//       setCandidates(all);
//     } catch (error) {
//       console.error("Error fetching candidates:", error);
//       setCandidates([]);
//     } finally {
//       setLoadingCandidates(false);
//     }
//   }, [selectedClient, candidateSearch]);

//   // Debounce effect for candidate search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (selectedClient) {
//         fetchCandidates();
//       }
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [candidateSearch, selectedClient, fetchCandidates]);

//   // Fetch candidates when client changes
//   useEffect(() => {
//     if (selectedClient) {
//       setCandidateSearch("");
//       fetchCandidates();
//     } else {
//       setCandidates([]);
//     }
//   }, [selectedClient]);

//   // Handle new client added
//   const handleClientAdded = (newClient) => {
//     setClients(prev => [...prev, newClient]);
//     setSelectedClient(newClient);
//     setClientSearch(""); // Clear search
//   };

//   // Handle client updated
//   const handleClientUpdated = (updatedClient) => {
//     setClients(prev => prev.map(c => 
//       c.id === updatedClient.id ? updatedClient : c
//     ));
//     setSelectedClient(updatedClient);
//   };

//   // ================= ADD ITEM =================
//   const addItem = () => {
//     setItems([...items, {
//       billing_type: "MANUAL",
//       title: "",
//       description: "",
//       sac_code: "",
//       candidate: null,
//       monthly_rate: 0,
//       total_days: 0,
//       working_days: 0,
//       hourly_rate: 0,
//       total_hours: 0,
//       amount: 0,
//       gst_rate: 18,
//       calc_amount: 0,
//       gst_amount: 0,
//       total: 0
//     }]);
//   };

//   // ================= CALCULATION =================
//   const calculate = (item) => {
//     let amount = 0;

//     if (item.billing_type === "BILLABLE_DAYS") {
//       const monthlyRate = Number(item.monthly_rate) || 0;
//       const totalDays = Number(item.total_days) || 1;
//       const workingDays = Number(item.working_days) || 0;
//       const perDay = monthlyRate / totalDays;
//       amount = perDay * workingDays;
//     }
//     else if (item.billing_type === "HOURLY") {
//       const hourlyRate = Number(item.hourly_rate) || 0;
//       const totalHours = Number(item.total_hours) || 0;
//       amount = hourlyRate * totalHours;
//     }
//     else {
//       amount = Number(item.amount) || 0;
//     }

//     const gstRate = Number(item.gst_rate) || 0;
//     const gst = (amount * gstRate) / 100;

//     return {
//       amount: Math.round(amount * 100) / 100,
//       gst: Math.round(gst * 100) / 100,
//       total: Math.round((amount + gst) * 100) / 100
//     };
//   };

//   const updateItem = (i, key, value) => {
//     const newItems = [...items];
//     newItems[i][key] = value;

//     const calc = calculate(newItems[i]);

//     newItems[i].calc_amount = calc.amount;
//     newItems[i].gst_amount = calc.gst;
//     newItems[i].total = calc.total;

//     setItems(newItems);
//   };

//   // ================= SELECT CANDIDATE =================
//   const selectCandidate = (i, candidate) => {
//     const newItems = [...items];
    
//     newItems[i].candidate = candidate.id;
//     newItems[i].title = candidate.candidate_name || "";
//     newItems[i].description = candidate.technology || "";
//     newItems[i].monthly_rate = candidate.client_rate || 0;

//     const calc = calculate(newItems[i]);
//     newItems[i].calc_amount = calc.amount;
//     newItems[i].gst_amount = calc.gst;
//     newItems[i].total = calc.total;

//     setItems(newItems);
//   };

//   // ================= SUBMIT =================
//   const handleSubmit = async () => {
//     if (!selectedClient) {
//       alert("Please select a client");
//       return;
//     }
//     if (!selectedBank) {
//       alert("Please select a bank");
//       return;
//     }
//     if (!dueDate) {
//       alert("Please select due date");
//       return;
//     }
//     if (items.length === 0) {
//       alert("Please add at least one item");
//       return;
//     }

//     try {
//       const payload = {
//         client: selectedClient.id,
//         company_bank_account: selectedBank,
//         invoice_type: "CANDIDATE",
//         invoice_date: invoiceDate,
//         billing_month: billingMonth,
//         due_date: dueDate,
//         items: items.map(i => ({
//           candidate: i.candidate,
//           title: i.title,
//           description: i.description,
//           sac_code: i.sac_code,
//           billing_type: i.billing_type,
//           monthly_rate: i.monthly_rate || 0,
//           total_days: i.total_days || 0,
//           working_days: i.working_days || 0,
//           hourly_rate: i.hourly_rate || 0,
//           total_hours: i.total_hours || 0,
//           amount: i.amount || 0
//         }))
//       };

//       const res = await apiRequest("/invoice/api/create/", "POST", payload);
//       console.log("Response:", res);
//       alert("Invoice Created Successfully!");
      
//       setSelectedClient(null);
//       setSelectedBank("");
//       setItems([]);
//       setInvoiceDate(today);
//       setBillingMonth(currentMonth);
//       setDueDate("");
      
//     } catch (error) {
//       console.error("Error creating invoice:", error);
//       alert("Error creating invoice. Please try again.");
//     }
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h2 className="text-2xl font-bold mb-6">Create Invoice</h2>

//       {/* CLIENT SECTION */}
//       <div className="mb-4">
//         <div className="flex gap-2 mb-2">
//           <div className="flex-1">
//             <label className="block mb-2">Search Client</label>
//             <input 
//               className="w-full p-2 border rounded"
//               placeholder="Type to search clients..." 
//               value={clientSearch}
//               onChange={e => setClientSearch(e.target.value)} 
//             />
//           </div>
//           <div className="flex items-end">
//             <button
//               onClick={() => setIsAddClientModalOpen(true)}
//               className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//             >
//               + Add New Client
//             </button>
//           </div>
//         </div>
        
//         <select 
//           className="w-full p-2 border rounded mt-2"
//           onChange={e => {
//             const c = clients.find(x => x.id == e.target.value);
//             setSelectedClient(c);
//           }}
//           value={selectedClient?.id || ""}
//         >
//           <option value="">Select Client</option>
//           {loadingClients ? (
//             <option disabled>Loading clients...</option>
//           ) : (
//             clients.map(c => (
//               <option key={c.id} value={c.id}>{c.client_name}</option>
//             ))
//           )}
//         </select>

//         {/* Bank Details Warning and Update Button */}
//         {selectedClient && !hasBankDetails(selectedClient) && (
//           <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded flex justify-between items-center">
//             <div>
//               <span className="text-yellow-700">⚠️ Client bank details are not available. Please update bank details to create invoice.</span>
//               {!hasBankDetails(selectedClient) && (
//                 <div className="text-sm text-yellow-600 mt-1">
//                   Missing: {
//                     [
//                       !selectedClient.account_holder_name && "Account Holder Name",
//                       !selectedClient.bank_name && "Bank Name",
//                       !selectedClient.account_number && "Account Number",
//                       !selectedClient.ifsc_code && "IFSC Code"
//                     ].filter(Boolean).join(", ")
//                   }
//                 </div>
//               )}
//             </div>
//             <button
//               onClick={() => setIsUpdateClientModalOpen(true)}
//               className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
//             >
//               Update Bank Details
//             </button>
//           </div>
//         )}
//       </div>

//       {/* BANK SECTION */}
//       <div className="mb-4">
//         <label className="block mb-2">Select Bank Account</label>
//         <select 
//           className="w-full p-2 border rounded"
//           onChange={e => setSelectedBank(e.target.value)}
//           value={selectedBank}
//           disabled={selectedClient && !hasBankDetails(selectedClient)}
//         >
//           <option value="">Select Bank</option>
//           {loadingBanks ? (
//             <option disabled>Loading banks...</option>
//           ) : (
//             banks.map(b => (
//               <option key={b.id} value={b.id}>{b.bank_name}</option>
//             ))
//           )}
//         </select>
//         {selectedClient && !hasBankDetails(selectedClient) && (
//           <p className="text-sm text-red-500 mt-1">
//             Please update client bank details first
//           </p>
//         )}
//       </div>

//       {/* DATES SECTION */}
//       <div className="grid grid-cols-3 gap-4 mb-4">
//         <div>
//           <label className="block mb-2">Invoice Date</label>
//           <input 
//             type="date" 
//             className="w-full p-2 border rounded"
//             value={invoiceDate} 
//             onChange={e => setInvoiceDate(e.target.value)} 
//           />
//         </div>
//         <div>
//           <label className="block mb-2">Billing Month</label>
//           <input 
//             type="date" 
//             className="w-full p-2 border rounded"
//             value={billingMonth} 
//             onChange={e => setBillingMonth(e.target.value)} 
//           />
//         </div>
//         <div>
//           <label className="block mb-2">Due Date</label>
//           <input 
//             type="date" 
//             className="w-full p-2 border rounded"
//             value={dueDate} 
//             onChange={e => setDueDate(e.target.value)} 
//           />
//         </div>
//       </div>

//       {/* ITEMS SECTION */}
//       <div className="mb-4">
//         <h3 className="text-xl font-semibold mb-3">Invoice Items</h3>
        
//         {items.map((item, i) => (
//           <div key={i} className="border rounded p-4 mb-4">
//             <div className="grid grid-cols-2 gap-4 mb-3">
//               <div>
//                 <label className="block mb-1">Billing Type</label>
//                 <select 
//                   className="w-full p-2 border rounded"
//                   value={item.billing_type} 
//                   onChange={e => updateItem(i, "billing_type", e.target.value)}
//                 >
//                   <option value="BILLABLE_DAYS">Billable Days</option>
//                   <option value="HOURLY">Hourly</option>
//                   <option value="MANUAL">Manual</option>
//                 </select>
//               </div>

//               {item.billing_type !== "MANUAL" && (
//                 <div>
//                   <label className="block mb-1">Search Candidate</label>
//                   <input 
//                     className="w-full p-2 border rounded mb-2"
//                     placeholder="Type to search candidates..." 
//                     value={candidateSearch}
//                     onChange={e => setCandidateSearch(e.target.value)}
//                     disabled={!selectedClient}
//                   />
//                   <select 
//                     className="w-full p-2 border rounded"
//                     onChange={e => {
//                       const c = candidates.find(x => x.id == e.target.value);
//                       if (c) selectCandidate(i, c);
//                     }}
//                     value={item.candidate || ""}
//                     disabled={!selectedClient}
//                   >
//                     <option value="">Select Candidate</option>
//                     {loadingCandidates ? (
//                       <option disabled>Loading candidates...</option>
//                     ) : (
//                       candidates.map(c => (
//                         <option key={c.id} value={c.id}>{c.candidate_name}</option>
//                       ))
//                     )}
//                   </select>
//                 </div>
//               )}
//             </div>

//             <div className="grid grid-cols-3 gap-4 mb-3">
//               <input 
//                 className="p-2 border rounded"
//                 value={item.title} 
//                 placeholder="Title" 
//                 onChange={e => updateItem(i, "title", e.target.value)} 
//               />
//               <input 
//                 className="p-2 border rounded"
//                 value={item.description} 
//                 placeholder="Description" 
//                 onChange={e => updateItem(i, "description", e.target.value)} 
//               />
//               <input 
//                 className="p-2 border rounded"
//                 value={item.sac_code} 
//                 placeholder="SAC Code" 
//                 onChange={e => updateItem(i, "sac_code", e.target.value)} 
//               />
//             </div>

//             {item.billing_type === "BILLABLE_DAYS" && (
//               <div className="grid grid-cols-3 gap-4 mb-3">
//                 <input 
//                   className="p-2 border rounded"
//                   type="number"
//                   placeholder="Monthly Rate" 
//                   value={item.monthly_rate} 
//                   onChange={e => updateItem(i, "monthly_rate", Number(e.target.value))} 
//                 />
//                 <input 
//                   className="p-2 border rounded"
//                   type="number"
//                   placeholder="Total Days" 
//                   value={item.total_days} 
//                   onChange={e => updateItem(i, "total_days", Number(e.target.value))} 
//                 />
//                 <input 
//                   className="p-2 border rounded"
//                   type="number"
//                   placeholder="Working Days" 
//                   value={item.working_days} 
//                   onChange={e => updateItem(i, "working_days", Number(e.target.value))} 
//                 />
//               </div>
//             )}

//             {item.billing_type === "HOURLY" && (
//               <div className="grid grid-cols-2 gap-4 mb-3">
//                 <input 
//                   className="p-2 border rounded"
//                   type="number"
//                   placeholder="Hourly Rate" 
//                   value={item.hourly_rate} 
//                   onChange={e => updateItem(i, "hourly_rate", Number(e.target.value))} 
//                 />
//                 <input 
//                   className="p-2 border rounded"
//                   type="number"
//                   placeholder="Total Hours" 
//                   value={item.total_hours} 
//                   onChange={e => updateItem(i, "total_hours", Number(e.target.value))} 
//                 />
//               </div>
//             )}

//             {item.billing_type === "MANUAL" && (
//               <div className="mb-3">
//                 <input 
//                   className="w-full p-2 border rounded"
//                   type="number"
//                   placeholder="Amount" 
//                   value={item.amount} 
//                   onChange={e => updateItem(i, "amount", Number(e.target.value))} 
//                 />
//               </div>
//             )}

//             <div className="grid grid-cols-4 gap-4 mb-3">
//               <div>
//                 <label className="block mb-1">GST Rate (%)</label>
//                 <input 
//                   className="w-full p-2 border rounded"
//                   type="number"
//                   value={item.gst_rate} 
//                   onChange={e => updateItem(i, "gst_rate", Number(e.target.value))} 
//                 />
//               </div>
//               <div>
//                 <label className="block mb-1">Amount</label>
//                 <div className="p-2 bg-gray-100 rounded">₹{item.calc_amount || 0}</div>
//               </div>
//               <div>
//                 <label className="block mb-1">GST</label>
//                 <div className="p-2 bg-gray-100 rounded">₹{item.gst_amount || 0}</div>
//               </div>
//               <div>
//                 <label className="block mb-1">Total</label>
//                 <div className="p-2 bg-blue-100 rounded font-bold">₹{item.total || 0}</div>
//               </div>
//             </div>
//           </div>
//         ))}

//         <button 
//           onClick={addItem}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//         >
//           + Add Item
//         </button>
//       </div>

//       <button 
//         onClick={handleSubmit}
//         disabled={selectedClient && !hasBankDetails(selectedClient)}
//         className={`px-6 py-3 rounded text-lg font-semibold ${
//           selectedClient && !hasBankDetails(selectedClient)
//             ? 'bg-gray-400 cursor-not-allowed'
//             : 'bg-green-500 hover:bg-green-600 text-white'
//         }`}
//       >
//         Create Invoice
//       </button>

//       {/* Modals */}
//       <AddClientModal
//         isOpen={isAddClientModalOpen}
//         onClose={() => setIsAddClientModalOpen(false)}
//         onClientAdded={handleClientAdded}
//       />

//       <UpdateClientModal
//         isOpen={isUpdateClientModalOpen}
//         onClose={() => setIsUpdateClientModalOpen(false)}
//         client={selectedClient}
//         onClientUpdated={handleClientUpdated}
//       />
//     </div>
//   );
// }







// // working =====================================

// import React, { useEffect, useState, useCallback } from "react";
// import { apiRequest } from "../../services/api";

// export default function CreateInvoice() {
//   // ================= STATE =================
//   const [clients, setClients] = useState([]);
//   const [clientSearch, setClientSearch] = useState("");
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [loadingClients, setLoadingClients] = useState(false);

//   const [candidates, setCandidates] = useState([]);
//   const [candidateSearch, setCandidateSearch] = useState("");
//   const [loadingCandidates, setLoadingCandidates] = useState(false);

//   const [banks, setBanks] = useState([]);
//   const [selectedBank, setSelectedBank] = useState("");
//   const [loadingBanks, setLoadingBanks] = useState(false);

//   const today = new Date().toISOString().slice(0, 10);
//   const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

//   const [invoiceDate, setInvoiceDate] = useState(today);
//   const [billingMonth, setBillingMonth] = useState(currentMonth);
//   const [dueDate, setDueDate] = useState("");

//   const [items, setItems] = useState([]);

//   // ================= CLIENT SEARCH WITH DEBOUNCE =================
//   const fetchClients = useCallback(async () => {
//     if (!clientSearch && clientSearch !== "") return;
    
//     setLoadingClients(true);
//     try {
//       let all = [];
//       // Search parameter properly encode kiya
//       const searchParam = clientSearch ? `?search=${encodeURIComponent(clientSearch)}` : '';
//       let url = `/invoice/api/clients/${searchParam}`;

//       while (url) {
//         const res = await apiRequest(url);
//         if (res?.results) {
//           all = [...all, ...res.results];
//           url = res.next ? res.next.replace("http://localhost:8000", "") : null;
//         } else {
//           break;
//         }
//       }
//       setClients(all);
//     } catch (error) {
//       console.error("Error fetching clients:", error);
//     } finally {
//       setLoadingClients(false);
//     }
//   }, [clientSearch]);

//   // Debounce effect for client search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (clientSearch !== undefined) {
//         fetchClients();
//       }
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [clientSearch, fetchClients]);

//   // Initial clients fetch without search
//   useEffect(() => {
//     fetchClients();
//   }, []); // Empty dependency array for initial load

//   // ================= BANK =================
//   const fetchBanks = async () => {
//     setLoadingBanks(true);
//     try {
//       const res = await apiRequest(`/invoice/api/bank-accounts/`);
//       setBanks(res?.results || []);
//     } catch (error) {
//       console.error("Error fetching banks:", error);
//     } finally {
//       setLoadingBanks(false);
//     }
//   };

//   useEffect(() => {
//     fetchBanks();
//   }, []);

//   // ================= CANDIDATE SEARCH =================
//   const fetchCandidates = useCallback(async () => {
//     if (!selectedClient) {
//       setCandidates([]);
//       return;
//     }

//     setLoadingCandidates(true);
//     try {
//       let all = [];
//       // Proper URL formation with search parameter
//       const searchParam = candidateSearch ? `?search=${encodeURIComponent(candidateSearch)}` : '';
//       let url = `/invoice/api/clients/${selectedClient.id}/candidates/${searchParam}`;

//       while (url) {
//         const res = await apiRequest(url);
//         if (res?.results) {
//           all = [...all, ...res.results];
//           url = res.next ? res.next.replace("http://localhost:8000", "") : null;
//         } else {
//           break;
//         }
//       }

//       setCandidates(all);
//     } catch (error) {
//       console.error("Error fetching candidates:", error);
//       setCandidates([]);
//     } finally {
//       setLoadingCandidates(false);
//     }
//   }, [selectedClient, candidateSearch]);

//   // Debounce effect for candidate search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (selectedClient) {
//         fetchCandidates();
//       }
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [candidateSearch, selectedClient, fetchCandidates]);

//   // Fetch candidates when client changes
//   useEffect(() => {
//     if (selectedClient) {
//       setCandidateSearch(""); // Reset search when client changes
//       fetchCandidates();
//     } else {
//       setCandidates([]);
//     }
//   }, [selectedClient]);

//   // ================= ADD ITEM =================
//   const addItem = () => {
//     setItems([...items, {
//       billing_type: "MANUAL",
//       title: "",
//       description: "",
//       sac_code: "",
//       candidate: null,
//       monthly_rate: 0,
//       total_days: 0,
//       working_days: 0,
//       hourly_rate: 0,
//       total_hours: 0,
//       amount: 0,
//       gst_rate: 18,
//       calc_amount: 0,
//       gst_amount: 0,
//       total: 0
//     }]);
//   };

//   // ================= CALCULATION =================
//   const calculate = (item) => {
//     let amount = 0;

//     if (item.billing_type === "BILLABLE_DAYS") {
//       const monthlyRate = Number(item.monthly_rate) || 0;
//       const totalDays = Number(item.total_days) || 1; // Avoid division by zero
//       const workingDays = Number(item.working_days) || 0;
//       const perDay = monthlyRate / totalDays;
//       amount = perDay * workingDays;
//     }
//     else if (item.billing_type === "HOURLY") {
//       const hourlyRate = Number(item.hourly_rate) || 0;
//       const totalHours = Number(item.total_hours) || 0;
//       amount = hourlyRate * totalHours;
//     }
//     else {
//       amount = Number(item.amount) || 0;
//     }

//     const gstRate = Number(item.gst_rate) || 0;
//     const gst = (amount * gstRate) / 100;

//     return {
//       amount: Math.round(amount * 100) / 100,
//       gst: Math.round(gst * 100) / 100,
//       total: Math.round((amount + gst) * 100) / 100
//     };
//   };

//   const updateItem = (i, key, value) => {
//     const newItems = [...items];
//     newItems[i][key] = value;

//     const calc = calculate(newItems[i]);

//     newItems[i].calc_amount = calc.amount;
//     newItems[i].gst_amount = calc.gst;
//     newItems[i].total = calc.total;

//     setItems(newItems);
//   };

//   // ================= SELECT CANDIDATE =================
//   const selectCandidate = (i, candidate) => {
//     const newItems = [...items];
    
//     newItems[i].candidate = candidate.id;
//     newItems[i].title = candidate.candidate_name || "";
//     newItems[i].description = candidate.technology || "";
//     newItems[i].monthly_rate = candidate.client_rate || 0;

//     // Recalculate after setting candidate
//     const calc = calculate(newItems[i]);
//     newItems[i].calc_amount = calc.amount;
//     newItems[i].gst_amount = calc.gst;
//     newItems[i].total = calc.total;

//     setItems(newItems);
//   };

//   // ================= SUBMIT =================
//   const handleSubmit = async () => {
//     // Validation
//     if (!selectedClient) {
//       alert("Please select a client");
//       return;
//     }
//     if (!selectedBank) {
//       alert("Please select a bank");
//       return;
//     }
//     if (!dueDate) {
//       alert("Please select due date");
//       return;
//     }
//     if (items.length === 0) {
//       alert("Please add at least one item");
//       return;
//     }

//     try {
//       const payload = {
//         client: selectedClient.id,
//         company_bank_account: selectedBank,
//         invoice_type: "CANDIDATE",
//         invoice_date: invoiceDate,
//         billing_month: billingMonth,
//         due_date: dueDate,
//         items: items.map(i => ({
//           candidate: i.candidate,
//           title: i.title,
//           description: i.description,
//           sac_code: i.sac_code,
//           billing_type: i.billing_type,
//           monthly_rate: i.monthly_rate || 0,
//           total_days: i.total_days || 0,
//           working_days: i.working_days || 0,
//           hourly_rate: i.hourly_rate || 0,
//           total_hours: i.total_hours || 0,
//           amount: i.amount || 0
//         }))
//       };

//       const res = await apiRequest("/invoice/api/invoices/create/", "POST", payload);
//       console.log("Response:", res);
//       alert("Invoice Created Successfully!");
      
//       // Reset form after successful submission
//       setSelectedClient(null);
//       setSelectedBank("");
//       setItems([]);
//       setInvoiceDate(today);
//       setBillingMonth(currentMonth);
//       setDueDate("");
      
//     } catch (error) {
//       console.error("Error creating invoice:", error);
//       alert("Error creating invoice. Please try again.");
//     }
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h2 className="text-2xl font-bold mb-6">Create Invoice</h2>

//       {/* CLIENT SECTION */}
//       <div className="mb-4">
//         <label className="block mb-2">Search Client</label>
//         <input 
//           className="w-full p-2 border rounded"
//           placeholder="Type to search clients..." 
//           value={clientSearch}
//           onChange={e => setClientSearch(e.target.value)} 
//         />
        
//         <select 
//           className="w-full p-2 border rounded mt-2"
//           onChange={e => {
//             const c = clients.find(x => x.id == e.target.value);
//             setSelectedClient(c);
//           }}
//           value={selectedClient?.id || ""}
//         >
//           <option value="">Select Client</option>
//           {loadingClients ? (
//             <option disabled>Loading clients...</option>
//           ) : (
//             clients.map(c => (
//               <option key={c.id} value={c.id}>{c.client_name}</option>
//             ))
//           )}
//         </select>
//       </div>

//       {/* BANK SECTION */}
//       <div className="mb-4">
//         <label className="block mb-2">Select Bank Account</label>
//         <select 
//           className="w-full p-2 border rounded"
//           onChange={e => setSelectedBank(e.target.value)}
//           value={selectedBank}
//         >
//           <option value="">Select Bank</option>
//           {loadingBanks ? (
//             <option disabled>Loading banks...</option>
//           ) : (
//             banks.map(b => (
//               <option key={b.id} value={b.id}>{b.bank_name}</option>
//             ))
//           )}
//         </select>
//       </div>

//       {/* DATES SECTION */}
//       <div className="grid grid-cols-3 gap-4 mb-4">
//         <div>
//           <label className="block mb-2">Invoice Date</label>
//           <input 
//             type="date" 
//             className="w-full p-2 border rounded"
//             value={invoiceDate} 
//             onChange={e => setInvoiceDate(e.target.value)} 
//           />
//         </div>
//         <div>
//           <label className="block mb-2">Billing Month</label>
//           <input 
//             type="date" 
//             className="w-full p-2 border rounded"
//             value={billingMonth} 
//             onChange={e => setBillingMonth(e.target.value)} 
//           />
//         </div>
//         <div>
//           <label className="block mb-2">Due Date</label>
//           <input 
//             type="date" 
//             className="w-full p-2 border rounded"
//             value={dueDate} 
//             onChange={e => setDueDate(e.target.value)} 
//           />
//         </div>
//       </div>

//       {/* ITEMS SECTION */}
//       <div className="mb-4">
//         <h3 className="text-xl font-semibold mb-3">Invoice Items</h3>
        
//         {items.map((item, i) => (
//           <div key={i} className="border rounded p-4 mb-4">
//             <div className="grid grid-cols-2 gap-4 mb-3">
//               <div>
//                 <label className="block mb-1">Billing Type</label>
//                 <select 
//                   className="w-full p-2 border rounded"
//                   value={item.billing_type} 
//                   onChange={e => updateItem(i, "billing_type", e.target.value)}
//                 >
//                   <option value="BILLABLE_DAYS">Billable Days</option>
//                   <option value="HOURLY">Hourly</option>
//                   <option value="MANUAL">Manual</option>
//                 </select>
//               </div>

//               {/* Candidate Selection (for non-manual) */}
//               {item.billing_type !== "MANUAL" && (
//                 <div>
//                   <label className="block mb-1">Search Candidate</label>
//                   <input 
//                     className="w-full p-2 border rounded mb-2"
//                     placeholder="Type to search candidates..." 
//                     value={candidateSearch}
//                     onChange={e => setCandidateSearch(e.target.value)}
//                     disabled={!selectedClient}
//                   />
//                   <select 
//                     className="w-full p-2 border rounded"
//                     onChange={e => {
//                       const c = candidates.find(x => x.id == e.target.value);
//                       if (c) selectCandidate(i, c);
//                     }}
//                     value={item.candidate || ""}
//                     disabled={!selectedClient}
//                   >
//                     <option value="">Select Candidate</option>
//                     {loadingCandidates ? (
//                       <option disabled>Loading candidates...</option>
//                     ) : (
//                       candidates.map(c => (
//                         <option key={c.id} value={c.id}>{c.candidate_name}</option>
//                       ))
//                     )}
//                   </select>
//                 </div>
//               )}
//             </div>

//             {/* Item Details */}
//             <div className="grid grid-cols-3 gap-4 mb-3">
//               <input 
//                 className="p-2 border rounded"
//                 value={item.title} 
//                 placeholder="Title" 
//                 onChange={e => updateItem(i, "title", e.target.value)} 
//               />
//               <input 
//                 className="p-2 border rounded"
//                 value={item.description} 
//                 placeholder="Description" 
//                 onChange={e => updateItem(i, "description", e.target.value)} 
//               />
//               <input 
//                 className="p-2 border rounded"
//                 value={item.sac_code} 
//                 placeholder="SAC Code" 
//                 onChange={e => updateItem(i, "sac_code", e.target.value)} 
//               />
//             </div>

//             {/* Billing Type Specific Fields */}
//             {item.billing_type === "BILLABLE_DAYS" && (
//               <div className="grid grid-cols-3 gap-4 mb-3">
//                 <input 
//                   className="p-2 border rounded"
//                   type="number"
//                   placeholder="Monthly Rate" 
//                   value={item.monthly_rate} 
//                   onChange={e => updateItem(i, "monthly_rate", Number(e.target.value))} 
//                 />
//                 <input 
//                   className="p-2 border rounded"
//                   type="number"
//                   placeholder="Total Days" 
//                   value={item.total_days} 
//                   onChange={e => updateItem(i, "total_days", Number(e.target.value))} 
//                 />
//                 <input 
//                   className="p-2 border rounded"
//                   type="number"
//                   placeholder="Working Days" 
//                   value={item.working_days} 
//                   onChange={e => updateItem(i, "working_days", Number(e.target.value))} 
//                 />
//               </div>
//             )}

//             {item.billing_type === "HOURLY" && (
//               <div className="grid grid-cols-2 gap-4 mb-3">
//                 <input 
//                   className="p-2 border rounded"
//                   type="number"
//                   placeholder="Hourly Rate" 
//                   value={item.hourly_rate} 
//                   onChange={e => updateItem(i, "hourly_rate", Number(e.target.value))} 
//                 />
//                 <input 
//                   className="p-2 border rounded"
//                   type="number"
//                   placeholder="Total Hours" 
//                   value={item.total_hours} 
//                   onChange={e => updateItem(i, "total_hours", Number(e.target.value))} 
//                 />
//               </div>
//             )}

//             {item.billing_type === "MANUAL" && (
//               <div className="mb-3">
//                 <input 
//                   className="w-full p-2 border rounded"
//                   type="number"
//                   placeholder="Amount" 
//                   value={item.amount} 
//                   onChange={e => updateItem(i, "amount", Number(e.target.value))} 
//                 />
//               </div>
//             )}

//             {/* GST and Calculations */}
//             <div className="grid grid-cols-4 gap-4 mb-3">
//               <div>
//                 <label className="block mb-1">GST Rate (%)</label>
//                 <input 
//                   className="w-full p-2 border rounded"
//                   type="number"
//                   value={item.gst_rate} 
//                   onChange={e => updateItem(i, "gst_rate", Number(e.target.value))} 
//                 />
//               </div>
//               <div>
//                 <label className="block mb-1">Amount</label>
//                 <div className="p-2 bg-gray-100 rounded">₹{item.calc_amount || 0}</div>
//               </div>
//               <div>
//                 <label className="block mb-1">GST</label>
//                 <div className="p-2 bg-gray-100 rounded">₹{item.gst_amount || 0}</div>
//               </div>
//               <div>
//                 <label className="block mb-1">Total</label>
//                 <div className="p-2 bg-blue-100 rounded font-bold">₹{item.total || 0}</div>
//               </div>
//             </div>
//           </div>
//         ))}

//         <button 
//           onClick={addItem}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//         >
//           + Add Item
//         </button>
//       </div>

//       {/* SUBMIT BUTTON */}
//       <button 
//         onClick={handleSubmit}
//         className="bg-green-500 text-white px-6 py-3 rounded text-lg font-semibold hover:bg-green-600"
//       >
//         Create Invoice
//       </button>
//     </div>
//   );
// }

