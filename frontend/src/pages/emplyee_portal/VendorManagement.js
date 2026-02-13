import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import BaseLayout from "../components/emp_base";

function VendorList() {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Filter States
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrev, setHasPrev] = useState(false);

    // Fetch Vendors from API
    const fetchVendors = async(page = 1, search = "") => {
        setLoading(true);
        try {
            // API: /vendors/?page=1&search=query
            const url = `/employee-portal/api/vendors/?page=${page}&search=${search}`;
            const response = await apiRequest(url, "GET");

            setVendors(response.results || []);
            setTotalCount(response.count || 0);
            setHasNext(!!response.next);
            setHasPrev(!!response.previous);
        } catch (error) {
            console.error("Error fetching vendors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search logic (wait 500ms after typing)
        const delayDebounceFn = setTimeout(() => {
            fetchVendors(currentPage, searchQuery);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, searchQuery]);

    // Handle Delete
    const handleDelete = async(id, name) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete vendor: ${name}?`);
        if (confirmDelete) {
            try {
                await apiRequest(`/employee-portal/api/vendors/${id}/delete/`, "DELETE");
                alert("Vendor deleted successfully!");
                // Refresh list
                fetchVendors(currentPage, searchQuery);
            } catch (error) {
                console.error("Delete failed:", error);
                alert("Could not delete vendor.");
            }
        }
    };

    return ( <
        BaseLayout > { /* Top Navigation & Actions */ } <
        div style = { styles.topBar } >
        <
        button onClick = {
            () => navigate("/employee") }
        style = { styles.backBtn } > ←Back to Dashboard < /button> <
        div style = { styles.searchContainer } >
        <
        input type = "text"
        placeholder = "Search vendors (name, tech...)"
        style = { styles.searchInput }
        value = { searchQuery }
        onChange = {
            (e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to page 1 on new search
            }
        }
        /> <
        /div> <
        button onClick = {
            () => navigate("/employee/vendor/add") }
        style = { styles.addBtn } >
        +Add Vendor <
        /button> <
        /div>

        <
        div style = { styles.section } >
        <
        h2 style = { styles.pageTitle } > Vendor Pool({ totalCount }) < /h2>

        <
        div style = { styles.tableWrapper } >
        <
        table style = { styles.table } >
        <
        thead >
        <
        tr style = { styles.tableHeader } >
        <
        th style = { styles.th } > ID < /th> <
        th style = { styles.th } > Vendor Name < /th> <
        th style = { styles.th } > Contact < /th> <
        th style = { styles.th } > Company < /th> <
        th style = { styles.th } > Specialized Tech < /th> <
        th style = { styles.th } > Onsite < /th> <
        th style = {
            {...styles.th, textAlign: "center" } } > Actions < /th> <
        /tr> <
        /thead> <
        tbody > {
            loading ? ( <
                tr >
                <
                td colSpan = "7"
                style = {
                    { textAlign: "center", padding: "40px" } } > Loading vendors... < /td> <
                /tr>
            ) : vendors.length > 0 ? (
                vendors.map((vendor) => ( <
                    tr key = { vendor.id }
                    style = { styles.tableRow } >
                    <
                    td style = { styles.td } > { vendor.id } < /td> <
                    td style = { styles.td } > < strong > { vendor.name } < /strong></td >
                    <
                    td style = { styles.td } > { vendor.number } < /td> <
                    td style = { styles.td } > { vendor.company_name } < /td> <
                    td style = { styles.td } > { vendor.specialized_tech_developers || "N/A" } < /td> <
                    td style = { styles.td } >
                    <
                    span style = { vendor.provide_onsite ? styles.badgeYes : styles.badgeNo } > { vendor.provide_onsite ? "YES" : "NO" } <
                    /span> <
                    /td> <
                    td style = { styles.actionTd } >
                    <
                    button style = { styles.viewBtn }
                    onClick = {
                        () => navigate(`/employee/vendor/view/${vendor.id}`) } >
                    View < /button> <
                    button style = { styles.editBtn }
                    onClick = {
                        () => navigate(`/employee/vendor/edit/${vendor.id}`) } >
                    Edit < /button> <
                    button style = { styles.deleteBtn }
                    onClick = {
                        () => handleDelete(vendor.id, vendor.name) } >
                    Delete < /button> <
                    /td> <
                    /tr>
                ))
            ) : ( <
                tr >
                <
                td colSpan = "7"
                style = {
                    { textAlign: "center", padding: "40px" } } > No vendors found. < /td> <
                /tr>
            )
        } <
        /tbody> <
        /table> <
        /div>

        { /* Dynamic Pagination Section */ } <
        div style = { styles.pagination } >
        <
        button disabled = {!hasPrev || loading }
        onClick = {
            () => setCurrentPage(prev => prev - 1) }
        style = {
            {...styles.pageStep, opacity: hasPrev ? 1 : 0.5 } } >
        Previous < /button>

        <
        div style = { styles.pageNumbers } >
        <
        button style = {
            {...styles.pageNum, ...styles.activePage } } > { currentPage } < /button> <
        /div>

        <
        button disabled = {!hasNext || loading }
        onClick = {
            () => setCurrentPage(prev => prev + 1) }
        style = {
            {...styles.pageStep, opacity: hasNext ? 1 : 0.5 } } >
        Next < /button> <
        /div> <
        /div> <
        /BaseLayout>
    );
}

const styles = {
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", gap: "15px" },
    backBtn: { background: "transparent", color: "#25343F", border: "none", fontSize: "15px", fontWeight: "700", cursor: "pointer", padding: "0" },
    searchContainer: { flex: 1, maxWidth: "400px" },
    searchInput: { width: "100%", padding: "10px 15px", borderRadius: "10px", border: "1px solid #BFC9D1", outline: "none", background: "#fff" },
    addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 155, 81, 0.3)" },
    pageTitle: { fontSize: "24px", color: "#25343F", marginBottom: "20px", fontWeight: "800" },
    tableWrapper: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(37, 52, 63, 0.08)", border: "1px solid #EAEFEF" },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: { background: "#BFC9D1" },
    th: { padding: "16px", textAlign: "left", color: "#25343F", fontSize: "14px", fontWeight: "700" },
    tableRow: { borderBottom: "1px solid #EAEFEF" },
    td: { padding: "16px", color: "#25343F", fontSize: "14px" },
    actionTd: { display: "flex", gap: "8px", padding: "16px", justifyContent: "center" },
    badgeYes: { padding: "4px 8px", background: "#dcfce7", color: "#166534", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" },
    badgeNo: { padding: "4px 8px", background: "#fee2e2", color: "#991b1b", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" },
    viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #BFC9D1", background: "#fff", color: "#25343F", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
    editBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#25343F", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
    deleteBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#fee2e2", color: "#991b1b", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
    pagination: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: "30px", gap: "20px" },
    pageStep: { padding: "8px 16px", background: "#fff", border: "1px solid #BFC9D1", borderRadius: "8px", color: "#25343F", cursor: "pointer", fontWeight: "600" },
    pageNumbers: { display: "flex", gap: "8px" },
    pageNum: { width: "35px", height: "35px", borderRadius: "8px", border: "1px solid #BFC9D1", background: "#fff", cursor: "pointer", fontWeight: "600", color: "#25343F" },
    activePage: { background: "#FF9B51", borderColor: "#FF9B51", color: "#fff" }
};

export default VendorList;



// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { apiRequest } from "../../services/api";
// import BaseLayout from "../components/emp_base";

// function VendorList() {
//     const navigate = useNavigate();
//     const [vendors, setVendors] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // Fetch Vendors from API
//     useEffect(() => {
//         const fetchVendors = async() => {
//             try {
//                 const response = await apiRequest("/employee-portal/api/vendors/", "GET");
//                 // API returns { results: [...] }, so we set response.results
//                 setVendors(response.results || []);
//             } catch (error) {
//                 console.error("Error fetching vendors:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchVendors();
//     }, []);

//     return ( <
//         BaseLayout > { /* Top Navigation & Actions */ } <
//         div style = { styles.topBar } >
//         <
//         button onClick = {
//             () => navigate("/employee")
//         }
//         style = { styles.backBtn } > ←Back to Dashboard <
//         /button> <
//         button onClick = {
//             () => navigate("/employee/vendor/add")
//         }
//         style = { styles.addBtn } >
//         +Add Vendor <
//         /button> < /
//         div >

//         <
//         div style = { styles.section } >
//         <
//         h2 style = { styles.pageTitle } > Vendor Directory < /h2>

//         <
//         div style = { styles.tableWrapper } >
//         <
//         table style = { styles.table } >
//         <
//         thead >
//         <
//         tr style = { styles.tableHeader } >
//         <
//         th style = { styles.th } > ID < /th> <
//         th style = { styles.th } > Vendor Name < /th> <
//         th style = { styles.th } > Contact < /th> <
//         th style = { styles.th } > Company < /th> <
//         th style = { styles.th } > Specialized Tech < /th> <
//         th style = { styles.th } > Onsite < /th> <
//         th style = {
//             {...styles.th, textAlign: "center" }
//         } > Actions < /th> < /
//         tr > <
//         /thead> <
//         tbody > {
//             loading ? ( <
//                 tr >
//                 <
//                 td colSpan = "7"
//                 style = {
//                     { textAlign: "center", padding: "20px" }
//                 } > Loading vendors... < /td> < /
//                 tr >
//             ) : vendors.length > 0 ? (
//                 vendors.map((vendor) => ( <
//                     tr key = { vendor.id }
//                     style = { styles.tableRow } >
//                     <
//                     td style = { styles.td } > { vendor.id } < /td> <
//                     td style = { styles.td } > < strong > { vendor.name } < /strong></td >
//                     <
//                     td style = { styles.td } > { vendor.number } < /td> <
//                     td style = { styles.td } > { vendor.company_name } < /td> <
//                     td style = { styles.td } > { vendor.specialized_tech_developers || "N/A" } < /td> <
//                     td style = { styles.td } >
//                     <
//                     span style = { vendor.provide_onsite ? styles.badgeYes : styles.badgeNo } > { vendor.provide_onsite ? "YES" : "NO" } <
//                     /span> < /
//                     td > <
//                     td style = { styles.actionTd } >

//                     <
//                     button style = { styles.viewBtn }
//                     onClick = {
//                         () => navigate(`/employee/vendor/view/${vendor.id}`)
//                     } >
//                     View <
//                     /button> <
//                     button style = { styles.editBtn }
//                     onClick = {
//                         () => navigate(`/employee/vendor/edit/${vendor.id}`) } > Edit < /button> <
//                     button style = { styles.deleteBtn } > Delete < /button> < /
//                     td > <
//                     /tr>
//                 ))
//             ) : ( <
//                 tr >
//                 <
//                 td colSpan = "7"
//                 style = {
//                     { textAlign: "center", padding: "20px" }
//                 } > No vendors found. < /td> < /
//                 tr >
//             )
//         } <
//         /tbody> < /
//         table > <
//         /div>

//         { /* Pagination Section (Static for now) */ } <
//         div style = { styles.pagination } >
//         <
//         button style = { styles.pageStep } > Previous < /button> <
//         div style = { styles.pageNumbers } >
//         <
//         button style = {
//             {...styles.pageNum, ...styles.activePage }
//         } > 1 < /button> < /
//         div > <
//         button style = { styles.pageStep } > Next < /button> < /
//         div > <
//         /div> < /
//         BaseLayout >
//     );
// }

// const styles = {
//     topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" },
//     backBtn: { background: "transparent", color: "#25343F", border: "none", fontSize: "15px", fontWeight: "700", cursor: "pointer", padding: "0" },
//     addBtn: { background: "#FF9B51", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(255, 155, 81, 0.3)" },
//     pageTitle: { fontSize: "24px", color: "#25343F", marginBottom: "20px", fontWeight: "800" },
//     tableWrapper: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(37, 52, 63, 0.08)", border: "1px solid #EAEFEF" },
//     table: { width: "100%", borderCollapse: "collapse" },
//     tableHeader: { background: "#BFC9D1" },
//     th: { padding: "16px", textAlign: "left", color: "#25343F", fontSize: "14px", fontWeight: "700" },
//     tableRow: { borderBottom: "1px solid #EAEFEF" },
//     td: { padding: "16px", color: "#25343F", fontSize: "14px" },
//     actionTd: { display: "flex", gap: "8px", padding: "16px", justifyContent: "center" },

//     // Status Badges
//     badgeYes: { padding: "4px 8px", background: "#dcfce7", color: "#166534", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" },
//     badgeNo: { padding: "4px 8px", background: "#fee2e2", color: "#991b1b", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" },

//     viewBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid #BFC9D1", background: "#fff", color: "#25343F", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
//     editBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#25343F", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
//     deleteBtn: { padding: "6px 12px", borderRadius: "6px", border: "none", background: "#fee2e2", color: "#991b1b", cursor: "pointer", fontSize: "12px", fontWeight: "600" },

//     pagination: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: "30px", gap: "20px" },
//     pageStep: { padding: "8px 16px", background: "#fff", border: "1px solid #BFC9D1", borderRadius: "8px", color: "#25343F", cursor: "pointer", fontWeight: "600" },
//     pageNumbers: { display: "flex", gap: "8px" },
//     pageNum: { width: "35px", height: "35px", borderRadius: "8px", border: "1px solid #BFC9D1", background: "#fff", cursor: "pointer", fontWeight: "600", color: "#25343F" },
//     activePage: { background: "#FF9B51", borderColor: "#FF9B51", color: "#fff" }
// };

// export default VendorList;