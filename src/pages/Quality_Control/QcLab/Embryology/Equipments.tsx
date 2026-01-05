import React, { useState } from "react";
import { Filter, Plus } from "lucide-react";
import LFHForm from "./LFHForm";
import MicroscopesForm from "./MicroscopesForm";
import CryopreservationForm from "./CryopreservationForm";
import OvensWaterBathForm from "./OvensWaterBathForm";
import PHMetersForm from "./PHMetersForm";
import IncubatorForm from "./IncubatorForm";

const Equipment = () => {
  const [view, setView] = useState("list");
  const [selectedEquipment, setSelectedEquipment] = useState("Incubator B");
  const [selectedRadio, setSelectedRadio] = useState("Incubator B");
  const [activeTab, setActiveTab] = useState("To-Do");
  const [equipmentType, setEquipmentType] = useState("incubator");

  const [formData, setFormData] = useState({
    temperature: "",
    co2Concentration: "",
    humidity: "",
    alarmResponseTime: "",
    gasMixture: "",
    alarmStatus: "Functional",
    comments: "",
    status: "Pass",
  });

  const handleClearForm = () => {
    setFormData({
      temperature: "",
      co2Concentration: "",
      humidity: "",
      alarmResponseTime: "",
      gasMixture: "",
      alarmStatus: "Functional",
      comments: "",
      status: "Pass",
    });
  };

  const determineEquipmentType = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("incubator")) return "incubator";
    if (n.includes("lfh") || n.includes("hood")) return "lfh";
    if (n.includes("ovens") || n.includes("water bath")) return "ovens";
    if (n.includes("microscope")) return "microscopes";
    if (n.includes("ph meter")) return "ph";
    if (n.includes("cryo") || n.includes("ln2")) return "cryopreservation";
    return "other";
  };

  const equipmentList = [
    { name: "Incubator B", params: "08/08", progress: "100%", tags: [{ text: "Temp - 38.5 °C", color: "#ef4444" }, { text: "Humidity - 20%", color: "#eab308" }] },
    { name: "LFH 02", params: "08/08", progress: "100%", tags: [{ text: "Temp - 38.5 °C", color: "#ef4444" }] },
    { name: "Ovens And Water Baths", params: "08/08", progress: "100%", tags: [{ text: "Temp - 38.5 °C", color: "#ef4444" }] },
    { name: "Microscopes", params: "05/08", progress: "38%", tags: [{ text: "Humidity - 20%", color: "#eab308" }] },
    { name: "pH Meters", params: "05/08", progress: "86%", tags: [{ text: "Temp - 38.5 °C", color: "#ef4444" }] },
    { name: "Cryopreservation Tanks (LN2)", params: "05/08", progress: "86%", tags: [{ text: "Temp - 38.5 °C", color: "#ef4444" }] },
  ];

  const assignees = ["https://i.pravatar.cc/150?img=1", "https://i.pravatar.cc/150?img=2", "https://i.pravatar.cc/150?img=3"];

  const incubatorCards = [
    { name: "Incubator A", params: "08/08", progress: "100%", tags: [] },
    { name: "Incubator B", params: "08/08", progress: "100%", tags: [] },
    { name: "Incubator C", params: "08/08", progress: "100%", tags: [{ text: "Humidity - 30%", color: "#eab308" }] },
    { name: "Incubator D", params: "08/08", progress: "100%", tags: [] },
    { name: "Incubator E", params: "08/08", progress: "100%", tags: [] },
  ];

  const lfhCards = [
    { name: "LFH 01", params: "08/08", progress: "100%", tags: [] },
    { name: "LFH 02", params: "08/08", progress: "100%", tags: [] },
    { name: "LFH 03", params: "08/08", progress: "100%", tags: [{ text: "Temp - 38.5 °C", color: "#ef4444" }] },
    { name: "LFH 04", params: "08/08", progress: "100%", tags: [] },
  ];

  // Logic for the specific Plus icon style from your image
const CustomPlusIcon = () => (
  <div
    style={{
      width: "24px",
      height: "24px",
      borderRadius: "6px",           
      border: "1px solid #E5E7EB",  
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
    }}
  >
    <div
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        backgroundColor: "#000000ff",    
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {/* The white plus symbol */}
      <Plus size={18} color="#ffffffff" strokeWidth={3} /> 
    </div>
  </div>
);

  if (view === "list") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "24px", fontFamily: "system-ui" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px", gap: "24px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Equipments</h1>
          <div style={{ display: "inline-flex", backgroundColor: "#F2F2F2", padding: "4px", borderRadius: "12px", gap: "4px" }}>
            <button onClick={() => setActiveTab("To-Do")} style={{ padding: "8px 24px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", backgroundColor: activeTab === "To-Do" ? "#FFFFFF" : "transparent", color: activeTab === "To-Do" ? "#E17E61" : "#94a3b8" }}>To-Do</button>
            <button onClick={() => setActiveTab("Plan")} style={{ padding: "8px 24px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", backgroundColor: activeTab === "Plan" ? "#FFFFFF" : "transparent", color: activeTab === "Plan" ? "#E17E61" : "#94a3b8" }}>Plan</button>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Filter size={20} color="#94a3b8" style={{ cursor: "pointer" }} />
          </div>
        </div>

        {activeTab === "To-Do" ? (
          <>
            <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#0f172a" }}>Incubator</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(487px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              {incubatorCards.map((item) => (
                <div key={item.name} onClick={() => { setSelectedEquipment(item.name); setSelectedRadio(item.name); setEquipmentType(determineEquipmentType(item.name)); setView("detail"); }} style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>{item.name} <span style={{ color: "#64748b", fontWeight: "400" }}>: Parameters : {item.params}</span></span>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ display: "flex" }}>
                        {assignees.map((img, i) => (
                          <img key={i} src={img} alt="assignee" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid white", marginLeft: i > 0 ? "-8px" : 0 }} />
                        ))}
                      </div>
                      <CustomPlusIcon />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: "600" }}>{item.progress}</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {item.tags.map((tag, i) => (
                        <span key={i} style={{ backgroundColor: tag.color, color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "11px" }}>{tag.text}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#0f172a" }}>Laminar Flow Hoods</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(487px, 1fr))", gap: "16px" }}>
               {lfhCards.map((item) => (
                 <div key={item.name} onClick={() => { setSelectedEquipment(item.name); setSelectedRadio(item.name); setEquipmentType(determineEquipmentType(item.name)); setView("detail"); }} style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", cursor: "pointer" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                     <span style={{ fontSize: "14px", fontWeight: "600" }}>{item.name} <span style={{ color: "#64748b", fontWeight: "400" }}>: Parameters : {item.params}</span></span>
                     <div style={{ display: "flex", alignItems: "center" }}>
                       <div style={{ display: "flex" }}>
                         {assignees.map((img, i) => (
                           <img key={i} src={img} alt="assignee" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid white", marginLeft: i > 0 ? "-8px" : 0 }} />
                         ))}
                       </div>
                       <CustomPlusIcon />
                     </div>
                   </div>
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                     <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: "600" }}>{item.progress}</span>
                     <div style={{ display: "flex", gap: "8px" }}>
                       {item.tags.map((tag, i) => (
                         <span key={i} style={{ backgroundColor: tag.color, color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "11px" }}>{tag.text}</span>
                       ))}
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", marginTop: "100px", color: "#94a3b8" }}>No plans added yet</div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb", padding: "20px", gap: "20px" }}>
      {/* Sidebar Section */}
      <div style={{ width: "512px", height: "840px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setView("list")} style={{ background: "none", border: "none", fontSize: "14px", fontWeight: "700", cursor: "pointer", color: "#0f172a", fontFamily: "Montserrat" }}>Equipments</button>
          <Filter size={18} color="#94a3b8" />
        </div>
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", flex: 1 }}>
          <div style={{ display: "flex", padding: "4px", backgroundColor: "#FAFAFA", borderRadius: "10px", gap: "6px" }}>
            <button onClick={() => setActiveTab("To-Do")} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, backgroundColor: activeTab === "To-Do" ? "#FFFFFF" : "transparent", color: activeTab === "To-Do" ? "#E17E61" : "#232323" }}>To-Do</button>
            <button onClick={() => setActiveTab("Plan")} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, backgroundColor: activeTab === "Plan" ? "#FFFFFF" : "transparent", color: activeTab === "Plan" ? "#E17E61" : "#232323" }}>Plan</button>
          </div>
          {activeTab === "To-Do" ? (
            equipmentList.map((item) => (
              <div key={item.name} onClick={() => { setSelectedEquipment(item.name); setEquipmentType(determineEquipmentType(item.name)); setSelectedRadio(item.name); }} style={{ padding: "16px", borderRadius: "12px", cursor: "pointer", backgroundColor: selectedEquipment === item.name ? "#fef3f2" : "#fff", border: selectedEquipment === item.name ? "2px solid #f97316" : "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>{item.name} : <span style={{ color: "#64748b", fontWeight: "400" }}>{item.params}</span></span>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ display: "flex" }}>
                      {assignees.slice(0, 3).map((img, i) => (
                        <img key={i} src={img} alt="user" style={{ width: "20px", height: "20px", borderRadius: "50%", border: "1px solid white", marginLeft: i > 0 ? "-6px" : 0 }} />
                      ))}
                    </div>
                    <CustomPlusIcon />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: "600" }}>{item.progress}</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {item.tags.map((tag, i) => (
                      <span key={i} style={{ backgroundColor: tag.color, color: "#fff", padding: "2px 8px", borderRadius: "10px", fontSize: "10px" }}>{tag.text}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", marginTop: "40px", color: "#94a3b8", fontSize: "14px" }}>No plans added yet</div>
          )}
        </div>
      </div>

      <div style={{ width: "994px", height: "879px" }}>
        {activeTab === "To-Do" ? (
          <>
            {equipmentType === "incubator" && <IncubatorForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} formData={formData} setFormData={setFormData} handleClearForm={handleClearForm} />}
            {equipmentType === "lfh" && <LFHForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
            {equipmentType === "ovens" && <OvensWaterBathForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
            {equipmentType === "microscopes" && <MicroscopesForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
            {equipmentType === "ph" && <PHMetersForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
            {equipmentType === "cryopreservation" && <CryopreservationForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
          </>
        ) : (
          <div style={{ width: "100%", height: "419px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", color: "#94a3b8" }}>
            <p>No plans added yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipment;