import React from "react";

export default function FooterAdmin() {
  return (
    <footer
      style={{
        padding: "20px 0 12px",
        marginTop: "32px",
      }}
    >
      <div className="container mx-auto px-4">
        <div
          style={{
            height: "1px",
            background: "rgba(0,0,0,0.07)",
            marginBottom: "16px",
          }}
        />
        <div className="flex flex-wrap items-center md:justify-between justify-center">
          <div className="w-full md:w-4/12 px-4">
            <div
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                fontWeight: "500",
                textAlign: "left",
              }}
            >
              © {new Date().getFullYear()}{" "}
              <span style={{ color: "#7c0000", fontWeight: "600" }}>
                EV Charging Management System
              </span>
            </div>
          </div>
          <div className="w-full md:w-8/12 px-4">
            <ul className="flex flex-wrap list-none md:justify-end justify-center" style={{ gap: "4px" }}>
              {[
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Contact Us", href: "#" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      fontWeight: "500",
                      padding: "4px 10px",
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#7c0000")}
                    onMouseLeave={(e) => (e.target.style.color = "#9ca3af")}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}