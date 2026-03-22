import React from "react";
import PropTypes from "prop-types";

export default function CardStats({
  statSubtitle,
  statTitle,
  statArrow,
  statPercent,
  statPercentColor,
  statDescripiron,
  statIconName,
  statIconColor,
  statBgColor,
}) {
  // Map old bg colors to gradient pairs
  const gradientMap = {
    "bg-red-500":       ["#ef4444", "#b91c1c"],
    "bg-lightBlue-500": ["#0ea5e9", "#0284c7"],
    "bg-pink-500":      ["#ec4899", "#be185d"],
    "bg-orange-500":    ["#f97316", "#c2410c"],
    "bg-emerald-500":   ["#10b981", "#047857"],
    "bg-purple-500":    ["#a855f7", "#7e22ce"],
  };
  const [c1, c2] = gradientMap[statIconColor] || ["#7c0000", "#a00000"];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        padding: "20px 24px",
        marginBottom: "24px",
        border: "1px solid rgba(0,0,0,0.04)",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.13)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        {/* Text */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: "700",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#9ca3af",
              marginBottom: "6px",
            }}
          >
            {statSubtitle}
          </p>
          <p
            style={{
              fontSize: "26px",
              fontWeight: "700",
              color: "#111827",
              lineHeight: "1.1",
              letterSpacing: "-0.01em",
            }}
          >
            {statTitle}
          </p>
        </div>

        {/* Icon bubble */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 16px ${c1}55`,
            flexShrink: 0,
            marginLeft: "12px",
          }}
        >
          <i className={statIconName} style={{ color: "#fff", fontSize: "20px" }}></i>
        </div>
      </div>

      {/* Footer stat */}
      {(statPercent || statDescripiron) && (
        <div
          style={{
            marginTop: "14px",
            paddingTop: "14px",
            borderTop: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {statArrow && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                fontWeight: "600",
                color:
                  statArrow === "up"
                    ? "#10b981"
                    : statArrow === "down"
                    ? "#ef4444"
                    : "#6b7280",
              }}
            >
              <i
                className={
                  statArrow === "up"
                    ? "fas fa-arrow-up"
                    : statArrow === "down"
                    ? "fas fa-arrow-down"
                    : ""
                }
                style={{ fontSize: "10px" }}
              ></i>
              {statPercent}
            </span>
          )}
          {statDescripiron && (
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>
              {statDescripiron}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

CardStats.defaultProps = {
  statArrow: "",
  statPercent: "",
  statDescripiron: "",
};

CardStats.propTypes = {
  statSubtitle: PropTypes.string,
  statTitle: PropTypes.string,
  statArrow: PropTypes.oneOf(["up", "down", ""]),
  statPercent: PropTypes.string,
  statPercentColor: PropTypes.string,
  statDescripiron: PropTypes.string,
  statIconName: PropTypes.string,
  statIconColor: PropTypes.string,
};