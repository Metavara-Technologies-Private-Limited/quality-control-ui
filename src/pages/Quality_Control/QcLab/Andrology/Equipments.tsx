import React, { useState } from "react";
import { Filter, Plus } from "lucide-react";
import SpermAnalyzersForm from "./SpermAnalyzersForm";
import CentrifugesForm from "./CentrifugesForm";
import AutoclavesForm from "./AutoclavesForm";
import GasAnalyzersForm from "./GasAnalyzersForm";
import RefrigeratorFreezerForm from "./RefrigeratorFreezerForm";

const Andrology = () => {
  // Main Tab State
  const [activeTab, setActiveTab] = useState("To-Do");

  // Equipment Selection State
  const [selectedEquipment, setSelectedEquipment] = useState("Sperm Analyzers");
  const [equipmentType, setEquipmentType] = useState("sperm");
  const [selectedRadio, setSelectedRadio] = useState("Sperm Analyzer B");

  // YOUR SPECIFIED BOLD STYLE
  const boldTextStyle = {
    fontFamily: "Montserrat",
    fontWeight: 700,
    fontStyle: "normal", // "Bold" is typically defined via fontWeight 700
    fontSize: "14px",
    lineHeight: "145%",
    letterSpacing: "0%",
    textTransform: "capitalize",
  };

  const assignees = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
  ];

  const andrologyList = [
    { name: "Sperm Analyzers", params: "05/08", progress: "100%", type: "sperm" },
    { name: "Centrifuges", params: "05/08", progress: "24%", type: "centrifuge" },
    { name: "Autoclaves", params: "05/08", progress: "100%", type: "autoclave" },
    { name: "Gas Analyzers", params: "05/08", progress: "100%", type: "gas" },
    { name: "Refrigerators / Freezers", params: "05/08", progress: "56%", type: "fridge" },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        padding: "20px",
        gap: "20px",
      }}
    >
      {/* LEFT SIDEBAR SECTION */}
      <div
        style={{
          width: "512px",
          height: "840px",
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ ...boldTextStyle, fontSize: "18px" }}>
            <p style={{ margin: 0 }}>Equipments</p>
          </div>
          <Filter size={18} color="#94a3b8" style={{ cursor: "pointer" }} />
        </div>

        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            flex: 1,
            overflowY: "auto",
          }}
        >
          {/* Tab Switcher */}
          <div
            style={{
              display: "flex",
              padding: "4px",
              backgroundColor: "#FAFAFA",
              borderRadius: "10px",
              gap: "6px",
            }}
          >
            <button
              onClick={() => setActiveTab("To-Do")}
              style={{
                ...boldTextStyle, // Applying bold style here
                flex: 1,
                width: "166px",
                height: "36px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor: activeTab === "To-Do" ? "#FFFFFF" : "transparent",
                color: activeTab === "To-Do" ? "#E17E61" : "#94a3b8",
                boxShadow: activeTab === "To-Do" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              }}
            >
              To-Do
            </button>
            <button
              onClick={() => setActiveTab("Plan")}
              style={{
                ...boldTextStyle, // Applying bold style here
                flex: 1,
                width: "166px",
                height: "36px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor: activeTab === "Plan" ? "#FFFFFF" : "transparent",
                color: activeTab === "Plan" ? "#E17E61" : "#94a3b8",
                boxShadow: activeTab === "Plan" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
              }}
            >
              Plan
            </button>
          </div>

          {/* Conditional Sidebar Content */}
          {activeTab === "To-Do" ? (
            andrologyList.map((item) => (
              <div
                key={item.name}
                onClick={() => {
                  setSelectedEquipment(item.name);
                  setEquipmentType(item.type);
                }}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: selectedEquipment === item.name ? "#fef3f2" : "#fff",
                  border: selectedEquipment === item.name ? "2px solid #f97316" : "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ ...boldTextStyle, color: "#0f172a" }}>
                    {item.name}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <div style={{ display: "flex" }}>
                      {assignees.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="assignee"
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            border: "2px solid white",
                            marginLeft: i > 0 ? "-6px" : 0,
                          }}
                        />
                      ))}
                    </div>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "#F1F5F9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Plus size={12} color="#94a3b8" />
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      ...boldTextStyle,
                      fontSize: "12px",
                      color: item.progress === "100%" ? "#22c55e" : "#f97316",
                    }}
                  >
                    {item.progress}
                  </span>
                  <span style={{ fontSize: "12px", color: "#64748b", fontFamily: "Montserrat" }}>
                    Parameters : {item.params}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                marginTop: "40px",
                color: "#94a3b8",
                fontSize: "14px",
                fontFamily: "Montserrat",
              }}
            >
              No plans added yet
            </div>
          )}
        </div>
      </div>

      {/* RIGHT MAIN CONTENT AREA */}
      <div style={{ width: "994px", height: "879px" }}>
        {activeTab === "To-Do" ? (
          <>
            {equipmentType === "sperm" && (
              <SpermAnalyzersForm
                selectedRadio={selectedRadio}
                setSelectedRadio={setSelectedRadio}
              />
            )}
            {equipmentType === "centrifuge" && (
              <CentrifugesForm
                selectedRadio={selectedRadio}
                setSelectedRadio={setSelectedRadio}
              />
            )}
            {equipmentType === "autoclave" && (
              <AutoclavesForm
                selectedRadio={selectedRadio}
                setSelectedRadio={setSelectedRadio}
              />
            )}
            {equipmentType === "gas" && (
              <GasAnalyzersForm
                selectedRadio={selectedRadio}
                setSelectedRadio={setSelectedRadio}
              />
            )}
            {equipmentType === "fridge" && (
              <RefrigeratorFreezerForm
                selectedRadio={selectedRadio}
                setSelectedRadio={setSelectedRadio}
              />
            )}

            {!equipmentType && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "419px",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  color: "#94a3b8",
                  fontFamily: "Montserrat",
                }}
              >
                Select an equipment from the sidebar to record parameters
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "419px",
              backgroundColor: "#fff",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              color: "#94a3b8",
              fontSize: "16px",
              fontFamily: "Montserrat",
            }}
          >
            No plans added yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Andrology;