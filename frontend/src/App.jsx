import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./pages/components/ProtectedRoute";


import SubAdminDashboard from "./pages/sub_admin/SubAdminDashboard";
import CentralAdminDashboard from "./pages/central_admin/CentralAdminDashboard";
import EmployeeDashboard from "./pages/emplyee_portal/EmployeeDashboard";


// ================= Vendor =================
import UserVendorManagement from "./pages/emplyee_portal/UserVendorManagement";
import AddVendor from "./pages/emplyee_portal/AddVendor";
import VendorView from "./pages/emplyee_portal/VendorView";
import DocViewer from "./pages/emplyee_portal/DocViewer";
import EditVendor from "./pages/emplyee_portal/EditVendor";

// ================= Client =================
import ClientList from "./pages/emplyee_portal/ClientList";
import AddClient from "./pages/emplyee_portal/AddClient";

// ================= Candidate =================
import AddCandidate from "./pages/emplyee_portal/AddCandidate";
import CandidateList from "./pages/emplyee_portal/CandidateList";
import ViewCandidate from "./pages/emplyee_portal/ViewCandidate";
import UpdateCandidate from "./pages/emplyee_portal/UpdateCandidate";
import UserCandidatelist from "./pages/emplyee_portal/UserCandidateList";
import SubmittedProfiles from "./pages/emplyee_portal/SubmittedProfiles";

// ================= Pool =================
import PoolSelect from "./pages/emplyee_portal/Pool";
import VendorManagement from "./pages/emplyee_portal/VendorManagement";

// ===================Sub-Admin============================
import AllCandidateList from "./pages/sub_admin/allCandidateList";
import AllVendorList from "./pages/sub_admin/AllVendorList";
import SubAdminAddVendor from "./pages/sub_admin/subadminAddVendor";
import EditVendorSubAdmin from "./pages/sub_admin/EditVendor";
import SubAdminAddCandidate from "./pages/sub_admin/SubAdminAddCandidate";
import SubAdminViewCandidate from "./pages/sub_admin/SubAdminViewCandidate";
import SubAdminEditCandidate from "./pages/sub_admin/SubAdminEditCandidate";
import VendorViewSubAdmin from "./pages/sub_admin/VendorView";
import SubAdminClientList from "./pages/sub_admin/ClientList";
import ViewClient from "./pages/sub_admin/ViewClient";
import SubAdminAddClient from "./pages/sub_admin/AddClient";
import SubAdminDocView from "./pages/sub_admin/DocViewer";
import SubAdminTeamManage from "./pages/sub_admin/TeamManage";
import AddUser from "./pages/sub_admin/AddUser";

// ========================================================

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                    path="/employee"
                    element={
                        <ProtectedRoute>
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route path="/employee/candidates/add" element={<ProtectedRoute><AddCandidate /></ProtectedRoute>} />
                <Route path="/employee/candidates" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />
                <Route path="/employee/candidate/view/:id" element={<ProtectedRoute><ViewCandidate /></ProtectedRoute>} />
                <Route path="/employee/candidate/edit/:id" element={<ProtectedRoute><UpdateCandidate /></ProtectedRoute>} />
                <Route path="/employee/user-candidates" element={<ProtectedRoute><UserCandidatelist /></ProtectedRoute>} />

                <Route path="/employee/submitted-profiles" element={<ProtectedRoute><SubmittedProfiles /></ProtectedRoute>} />

                <Route path="/employee/vendors" element={<ProtectedRoute><VendorManagement /></ProtectedRoute>} />
                <Route path="/employee/user-vendors" element={<ProtectedRoute><UserVendorManagement /></ProtectedRoute>} />
                <Route path="/employee/pool" element={<ProtectedRoute><PoolSelect /></ProtectedRoute>} />

                <Route path="/employee/vendor/view/:id" element={<ProtectedRoute><VendorView /></ProtectedRoute>} />
                <Route path="/employee/vendor/doc-view/:id" element={<ProtectedRoute><DocViewer /></ProtectedRoute>} />
                <Route path="/employee/vendor/add" element={<ProtectedRoute><AddVendor /></ProtectedRoute>} />
                <Route path="/employee/vendor/edit/:id" element={<ProtectedRoute><EditVendor /></ProtectedRoute>} />

                <Route path="/employee/clients" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
                <Route path="/employee/client/add" element={<ProtectedRoute><AddClient /></ProtectedRoute>} />

                {/* ======================SUB-ADMIN========================================= */}
                <Route path="/sub-admin" element={<ProtectedRoute><SubAdminDashboard /></ProtectedRoute>} />
                <Route path="/sub-admin/all-candidates" element={<ProtectedRoute><AllCandidateList /></ProtectedRoute>} />
                <Route path="/sub-admin/all-Vendors" element={<ProtectedRoute><AllVendorList /></ProtectedRoute>} />
                <Route path="/sub-admin/add-vendor" element={<ProtectedRoute><SubAdminAddVendor /></ProtectedRoute>} />
                <Route path="/sub-admin/edit-vendor/:id" element={<ProtectedRoute><EditVendorSubAdmin /></ProtectedRoute>} />
                <Route path="/sub-admin/add-candidate" element={<ProtectedRoute><SubAdminAddCandidate /></ProtectedRoute>} />
                <Route path="/sub-admin/candidate/view/:id" element={<ProtectedRoute><SubAdminViewCandidate /></ProtectedRoute>} />
                <Route path="/sub-admin/candidate/edit/:id" element={<ProtectedRoute><SubAdminEditCandidate /></ProtectedRoute>} />
                <Route path="/sub-admin/vendor/view/:id" element={<ProtectedRoute><VendorViewSubAdmin /></ProtectedRoute>} />
                <Route path="/sub-admin/clients" element={<ProtectedRoute><SubAdminClientList /></ProtectedRoute>} />
                <Route path="/sub-admin/client/add" element={<ProtectedRoute><SubAdminAddClient /></ProtectedRoute>} />
                <Route path="/sub-admin/vendor/doc-view/:id" element={<ProtectedRoute><SubAdminDocView /></ProtectedRoute>} />
                <Route path="/sub-admin/team-manage" element={<ProtectedRoute><SubAdminTeamManage /></ProtectedRoute>} />
                <Route path="/sub-admin/add-user" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
                <Route path="/sub-admin/client/view/:id" element={<ProtectedRoute><ViewClient /></ProtectedRoute>} />
                {/* ======================================================================== */}

                <Route path="/central-admin" element={<ProtectedRoute><CentralAdminDashboard /></ProtectedRoute>} />


            </Routes>
        </BrowserRouter>
    );
}

export default App;










// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import SubAdminDashboard from "./pages/sub_admin/SubAdminDashboard";
// import CentralAdminDashboard from "./pages/central_admin/CentralAdminDashboard";
// import EmployeeDashboard from "./pages/emplyee_portal/EmployeeDashboard";

// // #===================Vendor=========================
// import UserVendorManagement from "./pages/emplyee_portal/UserVendorManagement";
// import AddVendor from "./pages/emplyee_portal/AddVendor";
// import VendorView from "./pages/emplyee_portal/VendorView";
// import DocViewer from "./pages/emplyee_portal/DocViewer";
// import EditVendor from "./pages/emplyee_portal/EditVendor";
// // ====================Client==========================
// import ClientList from "./pages/emplyee_portal/ClientList";
// import AddClient from "./pages/emplyee_portal/AddClient";
// // ====================candidate================================
// import AddCandidate from "./pages/emplyee_portal/AddCandidate";
// import CandidateList from "./pages/emplyee_portal/CandidateList";
// import ViewCandidate from "./pages/emplyee_portal/ViewCandidate";
// import UpdateCandidate from "./pages/emplyee_portal/UpdateCandidate";
// import UserCandidatelist from "./pages/emplyee_portal/UserCandidateList";
// // ====================Pool=========================================
// import PoolSelect from "./pages/emplyee_portal/Pool";
// import VendorManagement from "./pages/emplyee_portal/VendorManagement";

// function App() {
//     return ( <
//         BrowserRouter >
//         <
//         Routes > { /* Auth */ } <
//         Route path = "/"
//         element = { < Login / > }
//         /> <
//         Route path = "/register"
//         element = { < Register / > }
//         />

//         { /* Employee */ } <
//         Route path = "/employee"
//         element = { < EmployeeDashboard / > }
//         />  
//         // ========================================Candidate===================================================
//         <
//         Route path = "/employee/candidates/add"
//         element = { < AddCandidate / > }
//         />

//         <
//         Route path = "/employee/candidates"
//         element = { < CandidateList / > }
//         />

//         <
//         Route path = "/employee/candidate/view/:id"
//         element = { < ViewCandidate / > }
//         />
        
//         <
//         Route path = "/employee/candidate/edit/:id"
//         element = { < UpdateCandidate / > }
//         />

//          <
//         Route path = "/employee/user-candidates"
//         element = { < UserCandidatelist / > }
//         />

//         // ===========================================================================================
//         <Route path = "/employee/vendors" element = { < VendorManagement / > }/ >
//         <Route path = "/employee/user-vendors" element = { < UserVendorManagement / > }/ >

//         <
//         Route path = "/employee/pool"
//         element = { < PoolSelect / > }
//         / >

//         <
//         Route path = "/employee/vendor/view/:id"
//         element = { < VendorView / > }
//         / >

//         <
//         Route path = "/employee/vendor/doc-view/:id"
//         element = { < DocViewer / > }
//         />

//         <
//         Route path = "/employee/vendor/add/"
//         element = { < AddVendor / > }
//         / >

//         <
//         Route path = "/employee/vendor/edit/:id"
//         element = { < EditVendor / > }
//         />

//         <
//         Route path = "/employee/clients"
//         element = { < ClientList / > }
//         /> <
//         Route path = "/employee/client/add"
//         element = { < AddClient / > }
//         />

//         { /* Sub Admin */ } <
//         Route path = "/sub-admin"
//         element = { < SubAdminDashboard / > }
//         />

//         { /* Central Admin */ } <
//         Route path = "/central-admin"
//         element = { < CentralAdminDashboard / > }
//         /> < /
//         Routes > <
//         /BrowserRouter>
//     );
// }

// export default App;