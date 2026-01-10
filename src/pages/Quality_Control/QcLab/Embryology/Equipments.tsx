import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import LFHForm from "./LFHForm";
import MicroscopesForm from "./MicroscopesForm";
import CryopreservationForm from "./CryopreservationForm";
import OvensWaterBathForm from "./OvensWaterBathForm";
import PHMetersForm from "./PHMetersForm";
import IncubatorForm from "./IncubatorForm";

const Equipment = () => {
  const [view, setView] = useState("list");
  const [activeTab, setActiveTab] = useState("To-Do");
  
  const [equipmentData, setEquipmentData] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedRadio, setSelectedRadio] = useState("");
  const [equipmentType, setEquipmentType] = useState(""); 
  const [activeEquipmentGroup, setActiveEquipmentGroup] = useState(""); 
  const [currentParameters, setCurrentParameters] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  // Added state to track specific details for the active selection
  const [activeMake, setActiveMake] = useState("");
  const [activeModel, setActiveModel] = useState("");

  const assignees = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
  ];

  const determineEquipmentType = (paramName: string) => {
    const p = paramName.toLowerCase();
    if (p.includes("co2") || p.includes("tri-gas") || p.includes("o2") || p.includes("incubator")) return "incubator";
    if (p.includes("airflow") || p.includes("velocity") || p.includes("lfh") || p.includes("hood")) return "lfh01";
    if (p.includes("water bath") || p.includes("oven") || p.includes("bath temp")) return "ovens";
    if (p.includes("lens") || p.includes("microscope") || p.includes("stage") || p.includes("optics")) return "microscopes";
    if (p.includes("ph") || p.includes("electrode") || p.includes("buffer")) return "phmeters";
    if (p.includes("cryo") || p.includes("ln2") || p.includes("tank level")) return "cryopreservation";
    return "other";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/get_clinic/1/`);
        const data = await response.json();

        let equipmentList: any[] = [];
        data.department.forEach((dep: any) => {
          dep.equipments.forEach((eq: any) => {
            const params = eq.parameters || [];
            
            // Logic: Get the Make/Model map for this equipment group
            // eq.equipment_details is where the table from AddParameterPage is stored
            const detailsMap: Record<string, { make: string, model: string }> = {};
            eq.equipment_details?.forEach((detail: any) => {
               detailsMap[detail.equipment_num] = { make: detail.make, model: detail.model };
            });

            params.forEach((param: any) => {
              equipmentList.push({
                id: `${eq.id}-${param.id}`,
                parameterName: param.parameter_name,
                equipmentName: eq.equipment_name, // e.g. "LFH 01"
                departmentName: dep.name,
                allParameters: params,
                paramsCount: params.length,
                progress: "100%",
                type: determineEquipmentType(param.parameter_name),
                // Attach the specs directly to the parameter object
                make: detailsMap[eq.equipment_name]?.make || "N/A",
                model: detailsMap[eq.equipment_name]?.model || "N/A"
              });
            });
          });
        });

        setEquipmentData(equipmentList);
        if (equipmentList.length > 0) {
          const firstEq = equipmentList[0];
          setSelectedEquipment(firstEq.parameterName);
          setSelectedRadio(firstEq.parameterName);
          setEquipmentType(firstEq.type);
          setActiveEquipmentGroup(firstEq.equipmentName);
          setCurrentParameters(firstEq.allParameters);
          setActiveMake(firstEq.make);
          setActiveModel(firstEq.model);
        }
      } catch (error) {
        console.error("Error loading equipments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectEquipment = (item: any) => {
    setSelectedEquipment(item.parameterName);
    setEquipmentType(item.type);
    setActiveEquipmentGroup(item.equipmentName); 
    setSelectedRadio(item.parameterName);
    setCurrentParameters(item.allParameters);
    // Logic: Update Make and Model when user clicks card or sidebar item
    setActiveMake(item.make);
    setActiveModel(item.model);
  };

  const groupedEquipments = equipmentData.reduce((acc: any, curr) => {
    if (!acc[curr.equipmentName]) acc[curr.equipmentName] = [];
    acc[curr.equipmentName].push(curr);
    return acc;
  }, {});

  const sidebarData = equipmentData.filter(item => item.equipmentName === activeEquipmentGroup);

  const CustomPlusIcon = () => (
    <div style={{ width: "24px", height: "24px", borderRadius: "6px", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
      <div style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Plus size={14} color="#fff" strokeWidth={3} />
      </div>
    </div>
  );

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  if (view === "list") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#fff", padding: "12px", fontFamily: "'Montserrat', sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px", gap: "24px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#0f172a" }}>Equipments</h1>
          <div style={{ display: "inline-flex", backgroundColor: "#F2F2F2", padding: "4px", borderRadius: "12px", gap: "4px" }}>
            {["To-Do", "Plan"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ width: "166px", height: "36px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "700", backgroundColor: activeTab === tab ? "#FFFFFF" : "transparent", color: activeTab === tab ? "#E17E61" : "#94a3b8" }}>{tab}</button>
            ))}
          </div>
        </div>

        {activeTab === "To-Do" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {Object.keys(groupedEquipments).map((equipmentName) => (
              <div key={equipmentName} style={{ borderRadius: "12px", backgroundColor: "#F8F8F8", padding: "15px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#0f172a", marginTop: 0 }}>{equipmentName}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "12px" }}>
                  {groupedEquipments[equipmentName].map((item: any) => (
                    <div key={item.id} onClick={() => { handleSelectEquipment(item); setView("detail"); }} style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div>
                          <span style={{ fontSize: "14px", fontWeight: "700" }}>{item.parameterName}</span>
                          <span style={{ color: "#64748b", fontWeight: "400", fontSize: "14px", marginLeft: "8px" }}>
                            : Parameters : {String(item.paramsCount).padStart(2, '0')}/{String(item.paramsCount).padStart(2, '0')}
                          </span>
                        </div>
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
                      <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: "700" }}>{item.progress}</span>
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb", padding: "20px", gap: "20px", fontFamily: "'Montserrat', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: "512px", height: "840px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <button onClick={() => setView("list")} style={{ background: "none", border: "none", fontSize: "14px", fontWeight: "700", cursor: "pointer", color: "#0f172a", marginBottom: '16px' }}>Equipments</button>
          <div style={{ display: "inline-flex", backgroundColor: "#F2F2F2", padding: "4px", borderRadius: "12px", gap: "4px", width: '100%' }}>
            {["To-Do", "Plan"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, height: "36px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "700", backgroundColor: activeTab === tab ? "#FFFFFF" : "transparent", color: activeTab === tab ? "#E17E61" : "#94a3b8" }}>{tab}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", flex: 1 }}>
          {activeTab === "To-Do" ? (
            sidebarData.map((item) => (
              <div key={item.id} onClick={() => handleSelectEquipment(item)} style={{ padding: "16px", borderRadius: "12px", cursor: "pointer", backgroundColor: selectedEquipment === item.parameterName ? "#fef3f2" : "#fff", border: selectedEquipment === item.parameterName ? "2px solid #f97316" : "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700" }}>{item.parameterName} : <span style={{ color: "#64748b", fontWeight: "400" }}>Parameters : {String(item.paramsCount).padStart(2, '0')}/{String(item.paramsCount).padStart(2, '0')}</span></span>
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
            ))
          ) : (
            <div style={{ textAlign: "center", marginTop: "20px", color: "#94a3b8", fontSize: '14px' }}>No plans available</div>
          )}
        </div>
      </div>

      <div style={{ width: "994px" }}>
        {activeTab === "To-Do" ? (
          <>
            {/* Logic: Renders Make and Model for all forms */}
            {equipmentType === "incubator" && (
              <IncubatorForm 
                selectedRadio={selectedRadio} 
                setSelectedRadio={setSelectedRadio} 
                parameters={currentParameters} 
                make={activeMake}
                model={activeModel}
              />
            )}
            {equipmentType === "lfh01" && <LFHForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
            {equipmentType === "ovens" && <OvensWaterBathForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
            {equipmentType === "microscopes" && <MicroscopesForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
            {equipmentType === "phmeters" && <PHMetersForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
            {equipmentType === "cryopreservation" && <CryopreservationForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />}
          </>
        ) : (
          <div style={{ height: "840px", backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "16px", fontWeight: "500" }}>
            No plans added for this group.
          </div>
        )}
      </div>
    </div>
  );
};

export default Equipment;