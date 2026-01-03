import React from "react";
import { Link, Upload } from "lucide-react";

const DynamicEquipmentForm = ({ selectedRadio, setSelectedRadio }) => {
  const [formData, setFormData] = React.useState({
    airflowVelocity: "",
    hepaFilterIntegrity: "Intact",
    uvLightFunctionality: "Functional",
    cleanlinessLog: "",
    status: "Pass",
    comments: "",
  });

  const handleClearForm = () => {
    setFormData({
      airflowVelocity: "",
      hepaFilterIntegrity: "Intact",
      uvLightFunctionality: "Functional",
      cleanlinessLog: "",
      status: "Pass",
      comments: "",
    });
  };

  const activityData = [
    { day: "Monday", compliant: 24, nonCompliant: -33 },
    { day: "Tuesday", compliant: 28, nonCompliant: -23 },
    { day: "Wednesday", compliant: 26, nonCompliant: -0 },
    { day: "Thursday", compliant: 34, nonCompliant: -8 },
    { day: "Friday", compliant: 28, nonCompliant: -23 },
    { day: "Saturday", compliant: 15, nonCompliant: -10 },
    { day: "Sunday", compliant: 25, nonCompliant: -33 },
  ];

  const maxValue = 40;

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        padding: "24px",
        maxWidth: "1200px",
      }}
    >
      {/* Radio Buttons */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          paddingBottom: "24px",
          borderBottom: "1px solid #f1f5f9",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {[
          "Laminar Air Flow A",
          "Laminar Air Flow B",
          "Laminar Air Flow C",
          "Laminar Air Flow D",
          "Laminar Air Flow E",
        ].map((name) => (
          <label
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              color: "#0f172a",
            }}
          >
            <input
              type="radio"
              name="equipment"
              checked={selectedRadio === name}
              onChange={() => setSelectedRadio(name)}
              style={{
                accentColor: "#f97316",
                width: "16px",
                height: "16px",
              }}
            />
            {name}
          </label>
        ))}
      </div>

      {/* Form Fields */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Airflow Velocity */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Type Here"
            value={formData.airflowVelocity}
            onChange={(e) =>
              setFormData({ ...formData, airflowVelocity: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              color: "#0f172a",
              backgroundColor: "#fff",
            }}
          />
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Airflow Velocity (m/s)
          </label>
          <p
            style={{
              fontSize: "11px",
              color: "#64748b",
              margin: "4px 0 0 0",
            }}
          >
            Range: 0.45 - 0.75
          </p>
        </div>

        {/* HEPA Filter Integrity */}
        <div style={{ position: "relative" }}>
          <select
            value={formData.hepaFilterIntegrity}
            onChange={(e) =>
              setFormData({ ...formData, hepaFilterIntegrity: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              backgroundColor: "#fff",
              color: "#0f172a",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "36px",
            }}
          >
            <option>Intact</option>
            <option>Damaged</option>
          </select>
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            HEPA Filter Integrity
          </label>
        </div>

        {/* UV Light Functionality */}
        <div style={{ position: "relative" }}>
          <select
            value={formData.uvLightFunctionality}
            onChange={(e) =>
              setFormData({ ...formData, uvLightFunctionality: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              backgroundColor: "#fff",
              color: "#0f172a",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "36px",
            }}
          >
            <option>Functional</option>
            <option>Non-Functional</option>
          </select>
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            UV Light Functionality
          </label>
        </div>

        {/* Cleanliness & Decontamination Log */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              color: "#64748b",
              backgroundColor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <span>Type Here</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <Link size={16} color="#3b82f6" />
              <label style={{ cursor: "pointer" }}>
                <Upload size={16} color="#64748b" />
                <input type="file" style={{ display: "none" }} />
              </label>
            </div>
          </div>
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Cleanliness & Decontamination Log
          </label>
          <p
            style={{
              fontSize: "11px",
              color: "#64748b",
              margin: "4px 0 0 0",
            }}
          >
            Range: 0.45 - 0.75
          </p>
        </div>

        {/* Sample ID.doc */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              color: "#0f172a",
              backgroundColor: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Link size={16} color="#3b82f6" />
            <span style={{ fontWeight: "500" }}>Sample ID.doc</span>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "#dbeafe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "12px", color: "#3b82f6" }}>↻</span>
              </div>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "12px", color: "#ef4444" }}>×</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Type Here"
            value={formData.comments}
            onChange={(e) =>
              setFormData({ ...formData, comments: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              color: "#0f172a",
              backgroundColor: "#fff",
            }}
          />
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Comments
          </label>
        </div>

        {/* Status */}
        <div style={{ position: "relative" }}>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              backgroundColor: "#fff",
              color: "#0f172a",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "36px",
            }}
          >
            <option>Pass</option>
            <option>Fail</option>
          </select>
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Status
          </label>
        </div>
      </div>

      {/* Activity Chart */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              margin: 0,
              color: "#0f172a",
            }}
          >
            <span style={{ marginRight: "8px" }}>📊</span>
            Activity
          </h3>
          <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#64748b",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#475569",
                }}
              ></div>
              Compliant
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#64748b",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#f87171",
                }}
              ></div>
              Non - Compliant
            </span>
          </div>
        </div>

        {/* Bar Chart */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "16px",
            height: "200px",
            padding: "16px",
            backgroundColor: "#fafafa",
            borderRadius: "8px",
            overflowX: "auto",
          }}
        >
          {activityData.map((item, i) => (
            <div
              key={i}
              style={{
                flex: "1 0 60px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  color: "#64748b",
                  marginBottom: "4px",
                  position: "absolute",
                  top: `${50 - (item.compliant / maxValue) * 50 - 10}%`,
                }}
              >
                {item.compliant}
              </div>
              <div
                style={{
                  width: "100%",
                  height: `${(item.compliant / maxValue) * 50}%`,
                  backgroundColor: "#475569",
                  borderRadius: "4px 4px 0 0",
                }}
              ></div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  color: "#64748b",
                  padding: "4px 0",
                }}
              >
                {item.day.slice(0, 3)}
              </div>
              <div
                style={{
                  width: "100%",
                  height: `${(Math.abs(item.nonCompliant) / maxValue) * 50}%`,
                  backgroundColor: "#f87171",
                  borderRadius: "0 0 4px 4px",
                }}
              ></div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#64748b",
                  marginTop: "4px",
                  position: "absolute",
                  bottom: `${
                    (Math.abs(item.nonCompliant) / maxValue) * 50 - 5
                  }%`,
                }}
              >
                {item.nonCompliant}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleClearForm}
          style={{
            padding: "10px 24px",
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            color: "#0f172a",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f9fafb")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#fff")
          }
        >
          Clear
        </button>
        <button
          style={{
            padding: "10px 24px",
            backgroundColor: "#1e293b",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#0f172a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#1e293b")
          }
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default DynamicEquipmentForm;