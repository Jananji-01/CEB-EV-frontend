import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SolarOwnerDetails() {
  const BASE = "#7c0000"; // Updated to match the theme
  const BASE_GRADIENT = "linear-gradient(135deg, #7c0000 0%, #a30000 100%)";
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [month, setMonth] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
  });

  const [searchAccount, setSearchAccount] = useState("");
  const [searchName, setSearchName] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [year, m] = month.split("-");
      const monthNum = Number(m);

      const params = new URLSearchParams({ month: String(monthNum), year });
      if (searchAccount) params.append("accountNo", searchAccount);
      if (searchName) params.append("username", searchName);

      const res = await fetch(
        `${BASE_URL}/api/admins/solar-owners?${params.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch solar owners");

      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Cannot load Solar Owner data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okAcc =
        !searchAccount ||
        String(r.accountNo || "")
          .toLowerCase()
          .includes(searchAccount.toLowerCase());

      const okName =
        !searchName ||
        String(r.username || "")
          .toLowerCase()
          .includes(searchName.toLowerCase());

      return okAcc && okName;
    });
  }, [rows, searchAccount, searchName]);

  const clearFilters = () => {
    setSearchAccount("");
    setSearchName("");
    setTimeout(() => loadData(), 0);
  };

  const handleCreateBill = (row) => {
    toast.success(`Bill request created for ${row.accountNo} (${month})`);
  };

  const downloadCsv = () => {
    const [year, m] = month.split("-");
    const monthNum = Number(m);

    const params = new URLSearchParams({ month: String(monthNum), year });
    if (searchAccount) params.append("accountNo", searchAccount);
    if (searchName) params.append("username", searchName);

    window.open(
      `${BASE_URL}/api/admins/solar-owners/csv?${params.toString()}`,
      "_blank"
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #f8f9fa 100%)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  background: BASE_GRADIENT,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <i className="fas fa-solar-panel" style={{ background: BASE_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}></i>
                Solar Owner Details
              </h1>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                <i className="fas fa-sun" style={{ marginRight: "6px", fontSize: "12px" }}></i>
                Manage and monitor all solar panel owners
              </p>
            </div>
            <button
              onClick={loadData}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontWeight: "500",
                fontSize: "13px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = BASE;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              <i className="fas fa-sync-alt" style={{ fontSize: "12px" }}></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Title + Filters */}
          <div style={{ padding: "24px", borderBottom: "2px solid #f0f0f0" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1f2937",
                    marginBottom: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <i className="fas fa-filter" style={{ fontSize: "14px", color: BASE }}></i>
                  Filter Options
                </h2>
                <p style={{ color: "#6b7280", fontSize: "13px" }}>
                  Filter by month, account number, or user name
                </p>
              </div>

              {/* Responsive controls */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#555",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "6px",
                    }}
                  >
                    Month
                  </label>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      fontSize: "13px",
                      background: "#ffffff",
                      border: "1.5px solid #e5e7eb",
                      borderRadius: "10px",
                      outline: "none",
                      transition: "all 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = BASE;
                      e.currentTarget.style.boxShadow = `0 0 0 3px rgba(124, 0, 0, 0.1)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#555",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "6px",
                    }}
                  >
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter account number"
                    value={searchAccount}
                    onChange={(e) => setSearchAccount(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      fontSize: "13px",
                      background: "#ffffff",
                      border: "1.5px solid #e5e7eb",
                      borderRadius: "10px",
                      outline: "none",
                      transition: "all 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = BASE;
                      e.currentTarget.style.boxShadow = `0 0 0 3px rgba(124, 0, 0, 0.1)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#555",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "6px",
                    }}
                  >
                    User Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      fontSize: "13px",
                      background: "#ffffff",
                      border: "1.5px solid #e5e7eb",
                      borderRadius: "10px",
                      outline: "none",
                      transition: "all 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = BASE;
                      e.currentTarget.style.boxShadow = `0 0 0 3px rgba(124, 0, 0, 0.1)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                  <button
                    onClick={clearFilters}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "#f3f4f6",
                      color: "#6b7280",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e5e7eb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f3f4f6";
                    }}
                  >
                    <i className="fas fa-times"></i> Clear
                  </button>

                  <button
                    onClick={loadData}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: BASE_GRADIENT,
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,0,0,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <i className="fas fa-search"></i> Apply
                  </button>

                  <button
                    onClick={downloadCsv}
                    style={{
                      flex: 1,
                      padding: "10px",
                      background: "#0f766e",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(15,118,110,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <i className="fas fa-download"></i> Download 
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "1000px", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: BASE_GRADIENT,
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {[
                    "Account No",
                    "User Name",
                    "Monthly kWh",
                    "Email",
                    "Contact",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "16px 20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "left",
                        color: "#ffffff",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "60px",
                        textAlign: "center",
                        color: "#6b7280",
                      }}
                    >
                      <div style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}>
                        <i className="fas fa-spinner fa-spin"></i>
                      </div>
                      <p style={{ marginTop: "12px" }}>Loading solar owner data...</p>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "60px",
                        textAlign: "center",
                        color: "#6b7280",
                      }}
                    >
                      <i className="fas fa-solar-panel" style={{ fontSize: "48px", color: "#d1d5db" }}></i>
                      <p style={{ marginTop: "12px", fontSize: "14px" }}>No records found</p>
                      <p style={{ fontSize: "12px", marginTop: "4px" }}>Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => (
                    <tr
                      key={`${r.accountNo}-${idx}`}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "white" : "#f9fafb",
                        borderBottom: "1px solid #f0f0f0",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#fef2f2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "white" : "#f9fafb";
                      }}
                    >
                      <td
                        style={{
                          padding: "16px 20px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#1f2937",
                        }}
                      >
                        {r.accountNo}
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#374151" }}>
                        {r.username}
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#374151", fontWeight: "500" }}>
                        <span style={{ color: "#d97706" }}>
                          {Number(r.totalKwh || 0).toFixed(3)} kWh
                        </span>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#374151" }}>
                        {r.email || "-"}
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#374151" }}>
                        {r.contactNo || "-"}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <button
                          onClick={() => handleCreateBill(r)}
                          style={{
                            padding: "8px 16px",
                            background: BASE_GRADIENT,
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            fontSize: "12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,0,0,0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <i className="fas fa-file-invoice-dollar"></i> Create Bill
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "16px 24px",
              fontSize: "12px",
              color: "#9ca3af",
              borderTop: "1px solid #f0f0f0",
              background: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div>
              <i className="fas fa-chart-line" style={{ marginRight: "6px" }}></i>
              Showing <strong style={{ color: BASE }}>{filtered.length}</strong> records
            </div>
            <div>
              <i className="fas fa-calendar-alt" style={{ marginRight: "6px" }}></i>
              Selected Month: <strong>{month}</strong>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .fa-spin {
            animation: spin 1s linear infinite;
          }
          * {
            box-sizing: border-box;
          }
        `}
      </style>
    </div>
  );
}