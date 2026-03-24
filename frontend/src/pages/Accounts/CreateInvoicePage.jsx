import React, { useEffect, useState, useCallback } from "react";
import { apiRequest } from "../../services/api";

// Add Client Modal Component
const AddClientModal = ({ isOpen, onClose, onClientAdded }) => {
  const [formData, setFormData] = useState({
    client_name: "",
    company_name: "",
    phone_number: "",
    email: "",
    gst_number: "",
    billing_address: "",
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/invoice/api/clients/", "POST", formData);
      
      // Agar response mein client ka data aata hai to use add karo
      if (response) {
        onClientAdded(response);
        onClose();
        // Reset form
        setFormData({
          client_name: "", company_name: "", phone_number: "", email: "",
          gst_number: "", billing_address: "", account_holder_name: "",
          bank_name: "", account_number: "", ifsc_code: ""
        });
      }
    } catch (error) {
      console.error("Error creating client:", error);
      setError("Client creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Add New Client</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="col-span-2">
              <h4 className="font-semibold mb-2 text-gray-700">Basic Information</h4>
            </div>
            
            <div>
              <label className="block mb-1">Client Name *</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={formData.client_name}
                onChange={e => setFormData({...formData, client_name: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-1">Company Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.company_name}
                onChange={e => setFormData({...formData, company_name: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                className="w-full p-2 border rounded"
                value={formData.phone_number}
                onChange={e => setFormData({...formData, phone_number: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-1">Email *</label>
              <input
                type="email"
                required
                className="w-full p-2 border rounded"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-1">GST Number</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.gst_number}
                onChange={e => setFormData({...formData, gst_number: e.target.value})}
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-1">Billing Address *</label>
              <textarea
                required
                className="w-full p-2 border rounded"
                rows="2"
                value={formData.billing_address}
                onChange={e => setFormData({...formData, billing_address: e.target.value})}
              />
            </div>

            {/* Bank Details */}
            <div className="col-span-2 mt-4">
              <h4 className="font-semibold mb-2 text-gray-700">Bank Details</h4>
            </div>

            <div>
              <label className="block mb-1">Account Holder Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.account_holder_name}
                onChange={e => setFormData({...formData, account_holder_name: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-1">Bank Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.bank_name}
                onChange={e => setFormData({...formData, bank_name: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-1">Account Number</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.account_number}
                onChange={e => setFormData({...formData, account_number: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-1">IFSC Code</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.ifsc_code}
                onChange={e => setFormData({...formData, ifsc_code: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? "Creating..." : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Update Client Modal Component
const UpdateClientModal = ({ isOpen, onClose, client, onClientUpdated }) => {
  const [formData, setFormData] = useState({
    client_name: "",
    company_name: "",
    phone_number: "",
    gst_number: "",
    billing_address: "",
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form when client changes
  useEffect(() => {
    if (client) {
      setFormData({
        client_name: client.client_name || "",
        company_name: client.company_name || "",
        phone_number: client.phone_number || "",
        gst_number: client.gst_number || "",
        billing_address: client.billing_address || "",
        account_holder_name: client.account_holder_name || "",
        bank_name: client.bank_name || "",
        account_number: client.account_number || "",
        ifsc_code: client.ifsc_code || ""
      });
    }
  }, [client]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest(`/invoice/api/clients/${client.id}/`, "PATCH", formData);
      
      if (response) {
        onClientUpdated(response);
        onClose();
      }
    } catch (error) {
      console.error("Error updating client:", error);
      setError("Client update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Update Client: {client.client_name}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="col-span-2">
              <h4 className="font-semibold mb-2 text-gray-700">Basic Information</h4>
            </div>
            
            <div>
              <label className="block mb-1">Client Name *</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={formData.client_name}
                onChange={e => setFormData({...formData, client_name: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-1">Company Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.company_name}
                onChange={e => setFormData({...formData, company_name: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                className="w-full p-2 border rounded"
                value={formData.phone_number}
                onChange={e => setFormData({...formData, phone_number: e.target.value})}
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-1">GST Number</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.gst_number}
                onChange={e => setFormData({...formData, gst_number: e.target.value})}
              />
            </div>

            <div className="col-span-2">
              <label className="block mb-1">Billing Address *</label>
              <textarea
                required
                className="w-full p-2 border rounded"
                rows="2"
                value={formData.billing_address}
                onChange={e => setFormData({...formData, billing_address: e.target.value})}
              />
            </div>

            {/* Bank Details */}
            <div className="col-span-2 mt-4">
              <h4 className="font-semibold mb-2 text-gray-700">Bank Details</h4>
            </div>

            <div>
              <label className="block mb-1">Account Holder Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.account_holder_name}
                onChange={e => setFormData({...formData, account_holder_name: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-1">Bank Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.bank_name}
                onChange={e => setFormData({...formData, bank_name: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-1">Account Number</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.account_number}
                onChange={e => setFormData({...formData, account_number: e.target.value})}
              />
            </div>

            <div>
              <label className="block mb-1">IFSC Code</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.ifsc_code}
                onChange={e => setFormData({...formData, ifsc_code: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
            >
              {loading ? "Updating..." : "Update Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CreateInvoice() {
  // ================= STATE =================
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [loadingClients, setLoadingClients] = useState(false);

  const [candidates, setCandidates] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Modal states
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isUpdateClientModalOpen, setIsUpdateClientModalOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";

  const [invoiceDate, setInvoiceDate] = useState(today);
  const [billingMonth, setBillingMonth] = useState(currentMonth);
  const [dueDate, setDueDate] = useState("");

  const [items, setItems] = useState([]);

  // Check if client has bank details
  const hasBankDetails = (client) => {
    if (!client) return false;
    return !!(client.account_number && client.bank_name && client.ifsc_code && client.account_holder_name);
  };

  // ================= CLIENT SEARCH WITH DEBOUNCE =================
  const fetchClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      let all = [];
      const searchParam = clientSearch ? `?search=${encodeURIComponent(clientSearch)}` : '';
      let url = `/invoice/api/clients/${searchParam}`;

      while (url) {
        const res = await apiRequest(url);
        if (res?.results) {
          all = [...all, ...res.results];
          url = res.next ? res.next.replace("http://localhost:8000", "") : null;
        } else {
          break;
        }
      }
      setClients(all);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoadingClients(false);
    }
  }, [clientSearch]);

  // Debounce effect for client search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 500);

    return () => clearTimeout(timer);
  }, [clientSearch, fetchClients]);

  // Initial clients fetch
  useEffect(() => {
    fetchClients();
  }, []);

  // ================= BANK =================
  const fetchBanks = async () => {
    setLoadingBanks(true);
    try {
      const res = await apiRequest(`/invoice/api/bank-accounts/`);
      setBanks(res?.results || []);
    } catch (error) {
      console.error("Error fetching banks:", error);
    } finally {
      setLoadingBanks(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  // ================= CANDIDATE SEARCH =================
  const fetchCandidates = useCallback(async () => {
    if (!selectedClient) {
      setCandidates([]);
      return;
    }

    setLoadingCandidates(true);
    try {
      let all = [];
      const searchParam = candidateSearch ? `?search=${encodeURIComponent(candidateSearch)}` : '';
      let url = `/invoice/api/clients/${selectedClient.id}/candidates/${searchParam}`;

      while (url) {
        const res = await apiRequest(url);
        if (res?.results) {
          all = [...all, ...res.results];
          url = res.next ? res.next.replace("http://localhost:8000", "") : null;
        } else {
          break;
        }
      }

      setCandidates(all);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  }, [selectedClient, candidateSearch]);

  // Debounce effect for candidate search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedClient) {
        fetchCandidates();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [candidateSearch, selectedClient, fetchCandidates]);

  // Fetch candidates when client changes
  useEffect(() => {
    if (selectedClient) {
      setCandidateSearch("");
      fetchCandidates();
    } else {
      setCandidates([]);
    }
  }, [selectedClient]);

  // Handle new client added
  const handleClientAdded = (newClient) => {
    setClients(prev => [...prev, newClient]);
    setSelectedClient(newClient);
    setClientSearch(""); // Clear search
  };

  // Handle client updated
  const handleClientUpdated = (updatedClient) => {
    setClients(prev => prev.map(c => 
      c.id === updatedClient.id ? updatedClient : c
    ));
    setSelectedClient(updatedClient);
  };

  // ================= ADD ITEM =================
  const addItem = () => {
    setItems([...items, {
      billing_type: "MANUAL",
      title: "",
      description: "",
      sac_code: "",
      candidate: null,
      monthly_rate: 0,
      total_days: 0,
      working_days: 0,
      hourly_rate: 0,
      total_hours: 0,
      amount: 0,
      gst_rate: 18,
      calc_amount: 0,
      gst_amount: 0,
      total: 0
    }]);
  };

  // ================= CALCULATION =================
  const calculate = (item) => {
    let amount = 0;

    if (item.billing_type === "BILLABLE_DAYS") {
      const monthlyRate = Number(item.monthly_rate) || 0;
      const totalDays = Number(item.total_days) || 1;
      const workingDays = Number(item.working_days) || 0;
      const perDay = monthlyRate / totalDays;
      amount = perDay * workingDays;
    }
    else if (item.billing_type === "HOURLY") {
      const hourlyRate = Number(item.hourly_rate) || 0;
      const totalHours = Number(item.total_hours) || 0;
      amount = hourlyRate * totalHours;
    }
    else {
      amount = Number(item.amount) || 0;
    }

    const gstRate = Number(item.gst_rate) || 0;
    const gst = (amount * gstRate) / 100;

    return {
      amount: Math.round(amount * 100) / 100,
      gst: Math.round(gst * 100) / 100,
      total: Math.round((amount + gst) * 100) / 100
    };
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

  // ================= SELECT CANDIDATE =================
  const selectCandidate = (i, candidate) => {
    const newItems = [...items];
    
    newItems[i].candidate = candidate.id;
    newItems[i].title = candidate.candidate_name || "";
    newItems[i].description = candidate.technology || "";
    newItems[i].monthly_rate = candidate.client_rate || 0;

    const calc = calculate(newItems[i]);
    newItems[i].calc_amount = calc.amount;
    newItems[i].gst_amount = calc.gst;
    newItems[i].total = calc.total;

    setItems(newItems);
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!selectedClient) {
      alert("Please select a client");
      return;
    }
    if (!selectedBank) {
      alert("Please select a bank");
      return;
    }
    if (!dueDate) {
      alert("Please select due date");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    try {
      const payload = {
        client: selectedClient.id,
        company_bank_account: selectedBank,
        invoice_type: "CANDIDATE",
        invoice_date: invoiceDate,
        billing_month: billingMonth,
        due_date: dueDate,
        items: items.map(i => ({
          candidate: i.candidate,
          title: i.title,
          description: i.description,
          sac_code: i.sac_code,
          billing_type: i.billing_type,
          monthly_rate: i.monthly_rate || 0,
          total_days: i.total_days || 0,
          working_days: i.working_days || 0,
          hourly_rate: i.hourly_rate || 0,
          total_hours: i.total_hours || 0,
          amount: i.amount || 0
        }))
      };

      const res = await apiRequest("/invoice/api/create/", "POST", payload);
      console.log("Response:", res);
      alert("Invoice Created Successfully!");
      
      setSelectedClient(null);
      setSelectedBank("");
      setItems([]);
      setInvoiceDate(today);
      setBillingMonth(currentMonth);
      setDueDate("");
      
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Error creating invoice. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create Invoice</h2>

      {/* CLIENT SECTION */}
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <label className="block mb-2">Search Client</label>
            <input 
              className="w-full p-2 border rounded"
              placeholder="Type to search clients..." 
              value={clientSearch}
              onChange={e => setClientSearch(e.target.value)} 
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setIsAddClientModalOpen(true)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              + Add New Client
            </button>
          </div>
        </div>
        
        <select 
          className="w-full p-2 border rounded mt-2"
          onChange={e => {
            const c = clients.find(x => x.id == e.target.value);
            setSelectedClient(c);
          }}
          value={selectedClient?.id || ""}
        >
          <option value="">Select Client</option>
          {loadingClients ? (
            <option disabled>Loading clients...</option>
          ) : (
            clients.map(c => (
              <option key={c.id} value={c.id}>{c.client_name}</option>
            ))
          )}
        </select>

        {/* Bank Details Warning and Update Button */}
        {selectedClient && !hasBankDetails(selectedClient) && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded flex justify-between items-center">
            <div>
              <span className="text-yellow-700">⚠️ Client bank details are not available. Please update bank details to create invoice.</span>
              {!hasBankDetails(selectedClient) && (
                <div className="text-sm text-yellow-600 mt-1">
                  Missing: {
                    [
                      !selectedClient.account_holder_name && "Account Holder Name",
                      !selectedClient.bank_name && "Bank Name",
                      !selectedClient.account_number && "Account Number",
                      !selectedClient.ifsc_code && "IFSC Code"
                    ].filter(Boolean).join(", ")
                  }
                </div>
              )}
            </div>
            <button
              onClick={() => setIsUpdateClientModalOpen(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Update Bank Details
            </button>
          </div>
        )}
      </div>

      {/* BANK SECTION */}
      <div className="mb-4">
        <label className="block mb-2">Select Bank Account</label>
        <select 
          className="w-full p-2 border rounded"
          onChange={e => setSelectedBank(e.target.value)}
          value={selectedBank}
          disabled={selectedClient && !hasBankDetails(selectedClient)}
        >
          <option value="">Select Bank</option>
          {loadingBanks ? (
            <option disabled>Loading banks...</option>
          ) : (
            banks.map(b => (
              <option key={b.id} value={b.id}>{b.bank_name}</option>
            ))
          )}
        </select>
        {selectedClient && !hasBankDetails(selectedClient) && (
          <p className="text-sm text-red-500 mt-1">
            Please update client bank details first
          </p>
        )}
      </div>

      {/* DATES SECTION */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block mb-2">Invoice Date</label>
          <input 
            type="date" 
            className="w-full p-2 border rounded"
            value={invoiceDate} 
            onChange={e => setInvoiceDate(e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2">Billing Month</label>
          <input 
            type="date" 
            className="w-full p-2 border rounded"
            value={billingMonth} 
            onChange={e => setBillingMonth(e.target.value)} 
          />
        </div>
        <div>
          <label className="block mb-2">Due Date</label>
          <input 
            type="date" 
            className="w-full p-2 border rounded"
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
          />
        </div>
      </div>

      {/* ITEMS SECTION */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-3">Invoice Items</h3>
        
        {items.map((item, i) => (
          <div key={i} className="border rounded p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block mb-1">Billing Type</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={item.billing_type} 
                  onChange={e => updateItem(i, "billing_type", e.target.value)}
                >
                  <option value="BILLABLE_DAYS">Billable Days</option>
                  <option value="HOURLY">Hourly</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>

              {item.billing_type !== "MANUAL" && (
                <div>
                  <label className="block mb-1">Search Candidate</label>
                  <input 
                    className="w-full p-2 border rounded mb-2"
                    placeholder="Type to search candidates..." 
                    value={candidateSearch}
                    onChange={e => setCandidateSearch(e.target.value)}
                    disabled={!selectedClient}
                  />
                  <select 
                    className="w-full p-2 border rounded"
                    onChange={e => {
                      const c = candidates.find(x => x.id == e.target.value);
                      if (c) selectCandidate(i, c);
                    }}
                    value={item.candidate || ""}
                    disabled={!selectedClient}
                  >
                    <option value="">Select Candidate</option>
                    {loadingCandidates ? (
                      <option disabled>Loading candidates...</option>
                    ) : (
                      candidates.map(c => (
                        <option key={c.id} value={c.id}>{c.candidate_name}</option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <input 
                className="p-2 border rounded"
                value={item.title} 
                placeholder="Title" 
                onChange={e => updateItem(i, "title", e.target.value)} 
              />
              <input 
                className="p-2 border rounded"
                value={item.description} 
                placeholder="Description" 
                onChange={e => updateItem(i, "description", e.target.value)} 
              />
              <input 
                className="p-2 border rounded"
                value={item.sac_code} 
                placeholder="SAC Code" 
                onChange={e => updateItem(i, "sac_code", e.target.value)} 
              />
            </div>

            {item.billing_type === "BILLABLE_DAYS" && (
              <div className="grid grid-cols-3 gap-4 mb-3">
                <input 
                  className="p-2 border rounded"
                  type="number"
                  placeholder="Monthly Rate" 
                  value={item.monthly_rate} 
                  onChange={e => updateItem(i, "monthly_rate", Number(e.target.value))} 
                />
                <input 
                  className="p-2 border rounded"
                  type="number"
                  placeholder="Total Days" 
                  value={item.total_days} 
                  onChange={e => updateItem(i, "total_days", Number(e.target.value))} 
                />
                <input 
                  className="p-2 border rounded"
                  type="number"
                  placeholder="Working Days" 
                  value={item.working_days} 
                  onChange={e => updateItem(i, "working_days", Number(e.target.value))} 
                />
              </div>
            )}

            {item.billing_type === "HOURLY" && (
              <div className="grid grid-cols-2 gap-4 mb-3">
                <input 
                  className="p-2 border rounded"
                  type="number"
                  placeholder="Hourly Rate" 
                  value={item.hourly_rate} 
                  onChange={e => updateItem(i, "hourly_rate", Number(e.target.value))} 
                />
                <input 
                  className="p-2 border rounded"
                  type="number"
                  placeholder="Total Hours" 
                  value={item.total_hours} 
                  onChange={e => updateItem(i, "total_hours", Number(e.target.value))} 
                />
              </div>
            )}

            {item.billing_type === "MANUAL" && (
              <div className="mb-3">
                <input 
                  className="w-full p-2 border rounded"
                  type="number"
                  placeholder="Amount" 
                  value={item.amount} 
                  onChange={e => updateItem(i, "amount", Number(e.target.value))} 
                />
              </div>
            )}

            <div className="grid grid-cols-4 gap-4 mb-3">
              <div>
                <label className="block mb-1">GST Rate (%)</label>
                <input 
                  className="w-full p-2 border rounded"
                  type="number"
                  value={item.gst_rate} 
                  onChange={e => updateItem(i, "gst_rate", Number(e.target.value))} 
                />
              </div>
              <div>
                <label className="block mb-1">Amount</label>
                <div className="p-2 bg-gray-100 rounded">₹{item.calc_amount || 0}</div>
              </div>
              <div>
                <label className="block mb-1">GST</label>
                <div className="p-2 bg-gray-100 rounded">₹{item.gst_amount || 0}</div>
              </div>
              <div>
                <label className="block mb-1">Total</label>
                <div className="p-2 bg-blue-100 rounded font-bold">₹{item.total || 0}</div>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={addItem}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Add Item
        </button>
      </div>

      <button 
        onClick={handleSubmit}
        disabled={selectedClient && !hasBankDetails(selectedClient)}
        className={`px-6 py-3 rounded text-lg font-semibold ${
          selectedClient && !hasBankDetails(selectedClient)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        Create Invoice
      </button>

      {/* Modals */}
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onClientAdded={handleClientAdded}
      />

      <UpdateClientModal
        isOpen={isUpdateClientModalOpen}
        onClose={() => setIsUpdateClientModalOpen(false)}
        client={selectedClient}
        onClientUpdated={handleClientUpdated}
      />
    </div>
  );
}



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

