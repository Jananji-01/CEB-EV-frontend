import React, { useEffect, useState } from "react";

// FormField Component
function FormField({ label, icon, children, error }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "13px",
          fontWeight: "600",
          color: "#1f2937",
          marginBottom: "8px",
        }}
      >
        {icon && <i className={icon} style={{ fontSize: "14px", width: "16px" }}></i>}
        {label}
      </label>
      {children}
      {error && (
        <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "6px" }}>
          {error}
        </p>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "14px",
  background: "#ffffff",
  border: "1.5px solid #e5e7eb",
  borderRadius: "12px",
  outline: "none",
  transition: "all 0.2s ease",
  fontFamily: "inherit",
};

// StyledInput Component
function StyledInput(props) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        borderColor: isFocused ? "#7c0000" : "#e5e7eb",
        boxShadow: isFocused ? "0 0 0 3px rgba(124, 0, 0, 0.1)" : "none",
      }}
      onFocus={(e) => {
        setIsFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        props.onBlur?.(e);
      }}
    />
  );
}

// PasswordInput Component
function PasswordInput({ value, onChange, placeholder, required, error }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          ...inputStyle,
          paddingRight: "45px",
          borderColor: error ? "#dc2626" : "#e5e7eb",
        }}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#9ca3af",
          padding: "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          transition: "color 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#7c0000")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
      >
        <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
      </button>
    </div>
  );
}

// AdminCard Component
function AdminCard({ admin, onDelete, onEdit }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        transition: "all 0.2s ease",
        border: "1px solid #f0f0f0",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <i className="fas fa-user-shield" style={{ fontSize: "18px" }}></i>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => onEdit(admin)}
            style={{
              padding: "6px",
              background: "#f3f4f6",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e5e7eb";
              e.currentTarget.style.color = "#7c0000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <i className="fas fa-edit" style={{ fontSize: "12px" }}></i>
          </button>
          <button
            onClick={() => onDelete(admin.adminId)}
            style={{
              padding: "6px",
              background: "#fef2f2",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.color = "#b91c1c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fef2f2";
              e.currentTarget.style.color = "#dc2626";
            }}
          >
            <i className="fas fa-trash-alt" style={{ fontSize: "12px" }}></i>
          </button>
        </div>
      </div>
      <div>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "6px",
          }}
        >
          {admin.username}
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "4px",
          }}
        >
          <i className="fas fa-envelope" style={{ fontSize: "10px" }}></i>
          <span style={{ fontSize: "11px" }}>{admin.email || "No email"}</span>
        </p>
        <p
          style={{
            fontSize: "10px",
            color: "#9ca3af",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <i className="fas fa-id-card" style={{ fontSize: "10px" }}></i>
          <span>ID: {admin.adminId}</span>
        </p>
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange }) {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        marginTop: "24px",
        padding: "16px 0",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#6b7280" }}>
        <span>Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          style={{
            padding: "6px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            outline: "none",
          }}
        >
          <option value={6}>6</option>
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={48}>48</option>
        </select>
        <span>entries</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: "8px 12px",
            border: "1px solid #e5e7eb",
            background: "white",
            borderRadius: "8px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            opacity: currentPage === 1 ? 0.5 : 1,
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "13px",
          }}
        >
          <i className="fas fa-chevron-left" style={{ fontSize: "10px" }}></i>
          Previous
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            style={{
              padding: "8px 12px",
              minWidth: "38px",
              border: page === currentPage ? "none" : "1px solid #e5e7eb",
              background: page === currentPage ? "linear-gradient(135deg, #7c0000 0%, #a30000 100%)" : "white",
              color: page === currentPage ? "white" : "#6b7280",
              borderRadius: "8px",
              cursor: page === '...' ? "default" : "pointer",
              fontWeight: page === currentPage ? "600" : "400",
              transition: "all 0.2s ease",
              fontSize: "13px",
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: "8px 12px",
            border: "1px solid #e5e7eb",
            background: "white",
            borderRadius: "8px",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            opacity: currentPage === totalPages ? 0.5 : 1,
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "13px",
          }}
        >
          Next
          <i className="fas fa-chevron-right" style={{ fontSize: "10px" }}></i>
        </button>
      </div>

      <div style={{ fontSize: "12px", color: "#9ca3af" }}>
        Showing page {currentPage} of {totalPages}
      </div>
    </div>
  );
}

// Main Component
export default function CreateNewAdmin() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingAdmin, setEditingAdmin] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/admins`);
      const data = await res.json();
      setAdmins(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Reset to first page when admins data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [admins.length]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAdmins = admins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(admins.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      document.getElementById("admins-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!password.trim() && !editingAdmin) newErrors.password = "Password is required";
    else if (password.trim() && password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const url = editingAdmin 
        ? `${baseUrl}/api/admins/${editingAdmin.adminId}`
        : `${baseUrl}/api/admins`;
      
      const method = editingAdmin ? "PUT" : "POST";
      
      const body = { 
        username, 
        email
      };
      
      if (password.trim()) {
        body.password = password;
      }
      
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        alert(result.message || result.error || (editingAdmin ? "Admin update failed" : "Admin creation failed"));
        return;
      }
      
      // Set success message based on action
      if (editingAdmin) {
        setSuccessMessage("Admin updated successfully!");
      } else {
        setSuccessMessage("Admin created successfully!");
      }
      setShowSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
      }, 3000);
      
      // Reset form
      setUsername("");
      setEmail("");
      setPassword("");
      setErrors({});
      setEditingAdmin(null);
      
      // Refresh the list
      await fetchAdmins();
      
    } catch (error) {
      console.error("Error:", error);
      alert(editingAdmin ? "Failed to update admin" : "Failed to create admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (adminId) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        const response = await fetch(`${baseUrl}/api/admins/${adminId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          setSuccessMessage("Admin deleted successfully!");
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            setSuccessMessage("");
          }, 3000);
          
          fetchAdmins();
        } else {
          alert("Failed to delete admin");
        }
      } catch (error) {
        console.error("Error deleting admin:", error);
        alert("Failed to delete admin");
      }
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setUsername(admin.username);
    setEmail(admin.email);
    setPassword("");
    setErrors({});
    setShowSuccess(false);
    setSuccessMessage("");
    
    document.getElementById("create-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingAdmin(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setErrors({});
    setShowSuccess(false);
    setSuccessMessage("");
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
                  background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <i className="fas fa-tachometer-alt"></i>
                Admin Dashboard
              </h1>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                <i className="fas fa-user-cog" style={{ marginRight: "6px", fontSize: "12px" }}></i>
                Manage administrator accounts and permissions
              </p>
            </div>
            <button
              onClick={fetchAdmins}
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
            >
              <i className="fas fa-sync-alt" style={{ fontSize: "12px" }}></i>
              Refresh
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "28px" }}>
          {/* Create Admin Form */}
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              height: "fit-content",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "24px",
                paddingBottom: "14px",
                borderBottom: "2px solid #f0f0f0",
              }}
            >
              {editingAdmin ? (
                <>
                  <i className="fas fa-edit" style={{ fontSize: "20px", color: "#7c0000" }}></i>
                  <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
                    Edit Admin
                  </h2>
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus" style={{ fontSize: "20px", color: "#7c0000" }}></i>
                  <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937" }}>
                    Create New Admin
                  </h2>
                </>
              )}
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div
                style={{
                  background: "#10b981",
                  color: "white",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  marginBottom: "18px",
                  textAlign: "center",
                  animation: "slideDown 0.3s ease",
                  fontSize: "13px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <i className="fas fa-check-circle" style={{ fontSize: "16px" }}></i>
                {successMessage}
              </div>
            )}

            <form id="create-form" onSubmit={handleSubmit}>
              <FormField label="Username" icon="fas fa-user" error={errors.username}>
                <StyledInput
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </FormField>
              <FormField label="Email" icon="fas fa-envelope" error={errors.email}>
                <StyledInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </FormField>
              <FormField label="Password" icon="fas fa-lock" error={errors.password}>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingAdmin ? "Enter new password (optional)" : "Enter password"}
                  required={!editingAdmin}
                  error={errors.password}
                />
              </FormField>

              <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "linear-gradient(135deg, #7c0000 0%, #a30000 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    opacity: isSubmitting ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontSize: "13px",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className={editingAdmin ? "fas fa-save" : "fas fa-plus"}></i>
                      {editingAdmin ? "UPDATE ADMIN" : "CREATE ADMIN"}
                    </>
                  )}
                </button>
                {editingAdmin && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      padding: "12px 20px",
                      background: "#f3f4f6",
                      color: "#6b7280",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                    }}
                  >
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Admins List */}
          <div id="admins-list">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "12px",
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
                  <i className="fas fa-users" style={{ fontSize: "16px", color: "#7c0000" }}></i>
                  All Administrators
                </h2>
                <p style={{ color: "#6b7280", fontSize: "13px" }}>
                  <i className="fas fa-chart-line" style={{ fontSize: "11px", marginRight: "4px" }}></i>
                  {admins.length} {admins.length === 1 ? "admin" : "admins"} total
                  {admins.length > 0 && ` • Showing ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, admins.length)}`}
                </p>
              </div>
            </div>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px",
                  background: "white",
                  borderRadius: "16px",
                }}
              >
                <i className="fas fa-spinner fa-spin" style={{ fontSize: "28px", color: "#7c0000" }}></i>
                <p style={{ marginTop: "12px", color: "#6b7280", fontSize: "13px" }}>Loading admins...</p>
              </div>
            ) : admins.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px",
                  background: "white",
                  borderRadius: "16px",
                  border: "2px dashed #e5e7eb",
                }}
              >
                <i className="fas fa-user-slash" style={{ fontSize: "40px", color: "#d1d5db" }}></i>
                <p style={{ marginTop: "12px", color: "#6b7280", fontSize: "14px" }}>No admins found</p>
                <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                  Create your first admin using the form
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {currentAdmins.map((admin) => (
                    <AdminCard
                      key={admin.adminId}
                      admin={admin}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
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