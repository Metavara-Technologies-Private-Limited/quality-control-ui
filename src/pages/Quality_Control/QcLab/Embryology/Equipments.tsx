import React, { useState, useEffect } from "react";
import { Filter, Plus } from "lucide-react";
import LFHForm from "./LFHForm";
import MicroscopesForm from "./MicroscopesForm";
import CryopreservationForm from "./CryopreservationForm";
import OvensWaterBathForm from "./OvensWaterBathForm";
import PHMetersForm from "./PHMetersForm";
import IncubatorForm from "./IncubatorForm";

const Equipment = () => {
  const [view, setView] = useState("list");
  const [activeTab, setActiveTab] = useState("To-Do");
  
  // --- Dynamic States ---
  const [equipmentData, setEquipmentData] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedRadio, setSelectedRadio] = useState("");
  const [equipmentType, setEquipmentType] = useState("incubator");
  const [currentParameters, setCurrentParameters] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  // --- Static Assignee Data (Ready for DB connection later) ---
  const assignees = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
  ];

  // Logic to determine form type based on equipment name
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

  // --- Fetch Data from Backend ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/get_clinic/1/`);
        const data = await response.json();

        let equipmentList: any[] = [];
        data.department.forEach((dep: any) => {
          dep.equipments.forEach((eq: any) => {
            // This pulls the actual parameter list saved from AddParameterPopup
            const params = eq.parameters || []; 
            
            equipmentList.push({
              id: eq.id,
              name: eq.equipment_name,
              departmentName: dep.name,
              parameters: params, // Full parameter list containing 'parameter_name'
              // Dynamic Parameter Count Display (e.g., 05/05)
              paramsCount: `${String(params.length).padStart(2, '0')}/${String(params.length).padStart(2, '0')}`,
              progress: "100%",
              type: determineEquipmentType(eq.equipment_name)
            });
          });
        });

        setEquipmentData(equipmentList);
        
        // Auto-select the first item initially
        if (equipmentList.length > 0) {
          const firstEq = equipmentList[0];
          setSelectedEquipment(firstEq.name);
          setSelectedRadio(firstEq.name);
          setEquipmentType(firstEq.type);
          setCurrentParameters(firstEq.parameters);
        }
      } catch (error) {
        console.error("Error loading equipments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handler to switch equipment selection
  const handleSelectEquipment = (item: any) => {
    setSelectedEquipment(item.name);
    setEquipmentType(item.type);
    setSelectedRadio(item.name);
    setCurrentParameters(item.parameters); // Update the parameters passed to the form
  };

  // Grouping logic for the List View sections
  const groupedEquipments = equipmentData.reduce((acc, curr) => {
    if (!acc[curr.departmentName]) acc[curr.departmentName] = [];
    acc[curr.departmentName].push(curr);
    return acc;
  }, {});

  const CustomPlusIcon = () => (
    <div style={{ width: "24px", height: "24px", borderRadius: "6px", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
      <div style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Plus size={14} color="#fff" strokeWidth={3} />
      </div>
    </div>
  );

  if (view === "list") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#fff", padding: "12px", fontFamily: "'Montserrat', sans-serif" }}>
        {/* Header Section */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px", gap: "24px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#0f172a" }}>Equipments</h1>
          <div style={{ display: "inline-flex", backgroundColor: "#F2F2F2", padding: "4px", borderRadius: "12px", gap: "4px" }}>
            <button onClick={() => setActiveTab("To-Do")} style={{ width: "166px", height: "36px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "700", backgroundColor: activeTab === "To-Do" ? "#FFFFFF" : "transparent", color: activeTab === "To-Do" ? "#E17E61" : "#94a3b8" }}>To-Do</button>
            <button onClick={() => setActiveTab("Plan")} style={{ width: "166px", height: "36px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "700", backgroundColor: activeTab === "Plan" ? "#FFFFFF" : "transparent", color: activeTab === "Plan" ? "#E17E61" : "#94a3b8" }}>Plan</button>
          </div>
          <div style={{ marginLeft: "auto" }}><Filter size={20} color="#94a3b8" style={{ cursor: "pointer" }} /></div>
        </div>

        {activeTab === "To-Do" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {Object.keys(groupedEquipments).map((dept) => (
              <div key={dept} style={{ borderRadius: "12px", backgroundColor: "#F8F8F8", padding: "15px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#0f172a", marginTop: 0 }}>{dept}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "12px" }}>
                  {groupedEquipments[dept].map((item: any) => (
                    <div key={item.id} onClick={() => { handleSelectEquipment(item); setView("detail"); }} style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700" }}>{item.name} <span style={{ color: "#64748b", fontWeight: "400" }}>: Parameters : {item.paramsCount}</span></span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>Assignee :</span>
                          <div style={{ display: "flex" }}>
                            {assignees.map((img, i) => (
                              <img key={i} src={img} alt="assignee" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid white", marginLeft: i > 0 ? "-8px" : 0 }} />
                            ))}
                          </div>
                          <CustomPlusIcon />
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: "700" }}>{item.progress}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : <div style={{ textAlign: "center", marginTop: "100px", color: "#94a3b8" }}>No plans added yet</div>}
      </div>
    );
  }

  // Detail / Form View
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb", padding: "20px", gap: "20px", fontFamily: "'Montserrat', sans-serif" }}>
      {/* Sidebar List */}
      <div style={{ width: "512px", height: "840px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <button onClick={() => setView("list")} style={{ background: "none", border: "none", fontSize: "14px", fontWeight: "700", cursor: "pointer", color: "#0f172a" }}>Equipments</button>
        </div>
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", flex: 1 }}>
          {equipmentData.map((item) => (
            <div key={item.id} onClick={() => handleSelectEquipment(item)} style={{ padding: "16px", borderRadius: "12px", cursor: "pointer", backgroundColor: selectedEquipment === item.name ? "#fef3f2" : "#fff", border: selectedEquipment === item.name ? "2px solid #f97316" : "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "700" }}>{item.name} : <span style={{ color: "#64748b", fontWeight: "400" }}>{item.paramsCount}</span></span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ display: "flex" }}>
                    {assignees.map((img, i) => (
                      <img key={i} src={img} alt="user" style={{ width: "20px", height: "20px", borderRadius: "50%", border: "1px solid white", marginLeft: i > 0 ? "-8px" : 0 }} />
                    ))}
                  </div>
                  <CustomPlusIcon />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Area */}
      <div style={{ width: "994px" }}>
        {equipmentType === "incubator" && (
          <IncubatorForm 
            selectedRadio={selectedRadio} 
            setSelectedRadio={setSelectedRadio} 
            parameters={currentParameters} // Passing the Parameter Names from AddParameterPopup
          />
        )}
        {/* Placeholder for other forms */}
        {equipmentType === "lfh" && <LFHForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
        {equipmentType === "ovens" && <OvensWaterBathForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
        {equipmentType === "microscopes" && <MicroscopesForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
        {equipmentType === "ph" && <PHMetersForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
        {equipmentType === "cryopreservation" && <CryopreservationForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
      </div>
    </div>
  );
};

export default Equipment;