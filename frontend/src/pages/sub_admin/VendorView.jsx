import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import BaseLayout from "../components/SubAdminLayout";

function VendorView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendorDetails = async() => {
            try {
                const data = await apiRequest(`/employee-portal/api/vendors/${id}/`, "GET");
                setVendor(data);
            } catch (error) {
                console.error("Error fetching vendor details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendorDetails();
    }, [id]);

    if (loading) return <BaseLayout > < div style = {
        { padding: "20px", color: "#25343F" }
    } > Loading Profile... < /div></BaseLayout > ;
    if (!vendor) return <BaseLayout > < div style = {
        { padding: "20px", color: "red" }
    } > Vendor not found! < /div></BaseLayout > ;

    return ( <
            BaseLayout >
            <
            div style = { styles.topBar } >
            <
            button onClick = {
                () => navigate(-1)
            }
            style = { styles.backBtn } > ←Back to List < /button> <
            div style = { styles.headerInfo } >
            <
            h2 style = { styles.pageTitle } > { vendor.name } < /h2> <
            span style = { styles.companySub } > { vendor.company_name } < /span> < /
            div > <
            /div>

            <
            div style = { styles.profileCard } >
            <
            div style = { styles.infoGrid } >

            { /* Section 1: Basic Info */ } <
            div style = { styles.detailSection } >
            <
            h3 style = { styles.sectionHeading } > Basic Information < /h3> 

            <
            div style = { styles.infoRow } >
            <strong > Email: < /strong> {vendor.email || "N/A"}</div> <
            div style = { styles.infoRow } > < strong > Phone: < /strong> {vendor.number}</div >
            <
            div style = { styles.infoRow } >
            <
            strong > Website: < /strong>  <
            a href = { vendor.company_website }
            target = "_blank"
            rel = "noreferrer"
            style = { styles.link } > { vendor.company_website || " N/A" } <
            /a> < /
            div > <
            div style = { styles.infoRow } > < strong > PAN / Reg No: < /strong> {vendor.company_pan_or_reg_no || "N/A"}</div> < /
            div >

            { /* Section 2: Business Details */ } <
            div style = { styles.detailSection } >
            <
            h3 style = { styles.sectionHeading } > Business Details < /h3> <
            div style = { styles.infoRow } > < strong > Tech Stack: < /strong> <span style={styles.techBadge}>{vendor.specialized_tech_developers || "N/A"}</span></div> <
            div style = { styles.infoRow } > < strong > Bench Count: < /strong> {vendor.no_of_bench_developers}</div >
            <
            div style = { styles.infoRow } > < strong > Onsite Support: < /strong> {vendor.provide_onsite ? "✅ Yes" : "❌ No"}</div >
            <
            div style = { styles.infoRow } > < strong > Location: < /strong> {vendor.onsite_location || "N/A"}</div> < /
            div >

            { /* Section 3: Point of Contact */ } <
            div style = { styles.detailSection } >
            <
            h3 style = { styles.sectionHeading } > Point of Contact(POC) < /h3> <
            div style = { styles.pocBox } >
            <
            p style = {
                { margin: '0 0 5px 0' }
            } > < strong > POC 1: < /strong> {vendor.poc1_name || "N/A"}</p> <
            p style = {
                { margin: 0, fontSize: '13px', color: '#555' }
            } > { vendor.poc1_number || "N/A" } < /p> < /
            div > <
            div style = { styles.pocBox } >
            <
            p style = {
                { margin: '0 0 5px 0' }
            } > < strong > POC 2: < /strong> {vendor.poc2_name || "N/A"}</p> <
            p style = {
                { margin: 0, fontSize: '13px', color: '#555' }
            } > { vendor.poc2_number || "N/A" } < /p> < /
            div > <
            /div>

            { /* Section 4: Documents & Meta */ } <
            div style = { styles.detailSection } >
            <
            h3 style = { styles.sectionHeading } > Documents & Meta < /h3> <
            div style = { styles.infoRow } > < strong > Top Clients: < /strong> {vendor.top_3_clients || "N/A"}</div> <
            div style = { styles.infoRow } >
            <
            strong > Bench List: < /strong>  
            <button 
    onClick={() => navigate(`/employee/vendor/doc-view/${vendor.id}`)} 
    style={styles.downloadBtn}
>
    📄 View Document Inside App
</button>
    </div> <
    div style = {
            { marginTop: '15px', fontSize: '12px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }
        } >
        <
        strong > Added by: < /strong> {vendor.uploaded_by?.email} <br/ >
        <
        strong > Last Update: < /strong> {new Date(vendor.updated_at).toLocaleString()} < /
    div > <
        /div>

    <
    /div> < /
    div > <
        /BaseLayout>
);
}

const styles = {
    topBar: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" },
    backBtn: { background: "none", border: "none", color: "#25343F", fontWeight: "700", cursor: "pointer", fontSize: "14px" },
    headerInfo: { display: "flex", flexDirection: "column" },
    pageTitle: { fontSize: "28px", color: "#25343F", fontWeight: "800", margin: 0 },
    companySub: { fontSize: "16px", color: "#555", fontWeight: "600" },
    profileCard: { background: "#BFC9D1", borderRadius: "20px", padding: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" },
    infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px" },
    detailSection: { background: "#fff", padding: "20px", borderRadius: "15px", boxShadow: "0 4px 10px rgba(0,0,0,0.03)" },
    sectionHeading: { fontSize: "15px", fontWeight: "800", color: "#25343F", marginBottom: "15px", borderBottom: "2px solid #EAEFEF", paddingBottom: "8px", textTransform: "uppercase" },
    infoRow: { marginBottom: "12px", color: "#25343F", fontSize: "14px" },
    techBadge: { background: "#EAEFEF", padding: "4px 10px", borderRadius: "6px", fontWeight: "600", color: "#25343F" },
    pocBox: { background: "#F9FBFC", padding: "12px", borderRadius: "10px", marginBottom: "10px", border: "1px solid #EAEFEF" },
    link: { color: "#FF9B51", textDecoration: "none", fontWeight: "600" },
    downloadBtn: { display: "inline-block", marginTop: "5px", padding: "8px 15px", background: "#25343F", color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "12px", fontWeight: "600" }
};

export default VendorView;