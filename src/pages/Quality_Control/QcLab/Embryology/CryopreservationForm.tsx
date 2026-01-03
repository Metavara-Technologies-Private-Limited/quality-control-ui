import { useState } from "react";
const CryopreservationForm = ({ selectedRadio, setSelectedRadio }) => {
  const [formData, setFormData] = useState({
    liquidNitrogenLevels: "",
    temperature: "",
    backSystemFunctionality: "Functional",
    alarmStatus: "Functional",
    status: "Pass",
    comments: "",
  });

  const handleClearForm = () => {
    setFormData({
      liquidNitrogenLevels: "",
      temperature: "",
      backSystemFunctionality: "Functional",
      alarmStatus: "Functional",
      status: "Pass",
      comments: "",
    });
  };

  const activityData = [
    { day: "Monday", compliant: 34, nonCompliant: -33 },
    { day: "Tuesday", compliant: 28, nonCompliant: -0 },
    { day: "Wednesday", compliant: 22, nonCompliant: -38 },
    { day: "Thursday", compliant: 34, nonCompliant: -12 },
    { day: "Friday", compliant: 29, nonCompliant: -33 },
    { day: "Saturday", compliant: 15, nonCompliant: -33 },
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
        {["Cryo Tank A", "Cryo Tank B", "Cryo Tank C", "Cryo Tank D", "Cryo Tank E"].map((name) => (
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
        {/* Liquid Nitrogen Levels */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Type Here"
            value={formData.liquidNitrogenLevels}
            onChange={(e) =>
              setFormData({ ...formData, liquidNitrogenLevels: e.target.value })
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
            Liquid Nitrogen Levels (mm)
          </label>
          <p
            style={{
              fontSize: "11px",
              color: "#64748b",
              margin: "4px 0 0 0",
            }}
          >
            Range: &gt;100
          </p>
        </div>

        {/* Temperature */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Type Here"
            value={formData.temperature}
            onChange={(e) =>
              setFormData({ ...formData, temperature: e.target.value })
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
            Temperature (°C)
          </label>
          <p
            style={{
              fontSize: "11px",
              color: "#64748b",
              margin: "4px 0 0 0",
            }}
          >
            Range: -196 [-243]
          </p>
        </div>

        {/* Back System Functionality */}
        <div style={{ position: "relative" }}>
          <select
            value={formData.backSystemFunctionality}
            onChange={(e) =>
              setFormData({ ...formData, backSystemFunctionality: e.target.value })
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
            Back System Functionality
          </label>
        </div>

        {/* Alarm Status */}
        <div style={{ position: "relative" }}>
          <select
            value={formData.alarmStatus}
            onChange={(e) =>
              setFormData({ ...formData, alarmStatus: e.target.value })
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
            Alarm Status
          </label>
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
            📊 Activity
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
              />
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
              />
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
              />
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
              />
              <div
                style={{
                  fontSize: "10px",
                  color: "#64748b",
                  marginTop: "4px",
                  position: "absolute",
                  bottom: `${(Math.abs(item.nonCompliant) / maxValue) * 50 - 5}%`,
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
        >
          Save
        </button>
      </div>
    </div>
  );
}; 

export default CryopreservationForm;