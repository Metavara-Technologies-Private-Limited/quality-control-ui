import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Plus, X } from "lucide-react";
import { RootState } from "@/store";
import { Assignee } from "@/types";
import { useOutletContext } from "react-router-dom";

import SpermAnalyzersForm from "./SpermAnalyzersForm";
import CentrifugesForm from "./CentrifugesForm";
import AutoclavesForm from "./AutoclavesForm";
import GasAnalyzersForm from "./GasAnalyzersForm";
import RefrigeratorFreezerForm from "./RefrigeratorFreezerForm";

const formatCount = (value: number) => String(value).padStart(2, "0");

const CustomPlusIcon = () => (
  <div style={{ width: "24px", height: "24px", borderRadius: "6px", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", cursor: "pointer" }}>
    <div style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Plus size={14} color="#fff" strokeWidth={3} />
    </div>
  </div>
);

// FIXED: Check for more specific types first
const determineEquipmentType = (name: string) => {
  const n = name.toLowerCase().trim();
  
  // Check for Gas Analyzer FIRST (more specific)
  if (n.includes("gas") && n.includes("analyzer")) return "gas";
  
  // Check for Sperm Analyzer (more specific)
  if (n.includes("sperm") && n.includes("analyzer")) return "sperm";
  
  // Check for Centrifuge
  if (n.includes("centrifuge")) return "centrifuge";
  
  // Check for Autoclave
  if (n.includes("autoclave")) return "autoclave";
  
  // Check for Refrigerator/Freezer
  if (n.includes("refrigerator") || n.includes("freezer") || n.includes("fridge")) return "fridge";
  
  return "other";
};

// --- Assignee Dialog Component ---
type AssigneeDialogProps = {
  open: boolean;
  onClose: () => void;
  availableAssignees: Assignee[];
  currentAssignees: Assignee[];
  onAdd: (assignees: Assignee[]) => void;
};

const AssigneeDialog = ({ open, onClose, availableAssignees, currentAssignees, onAdd }: AssigneeDialogProps) => {
  const [selected, setSelected] = useState<Assignee[]>([]);
  if (!open) return null;

  const handleToggle = (assignee: Assignee) => {
    setSelected((prev) => {
      const exists = prev.find((a) => a.id === assignee.id);
      return exists ? prev.filter((a) => a.id !== assignee.id) : [...prev, assignee];
    });
  };

  const handleAdd = () => {
    onAdd(selected);
    setSelected([]);
    onClose();
  };

  const available = availableAssignees.filter((a) => !currentAssignees.find((curr) => curr.id === a.id));

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={onClose}>
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", width: "520px", maxHeight: "80vh", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #E5E7EB" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>Select Assignees</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}><X size={20} color="#6B7280" /></button>
        </div>
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {available.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6B7280" }}>No available assignees</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {available.map((assignee) => {
                const isSelected = selected.find((a) => a.id === assignee.id);
                return (
                  <div key={assignee.id} onClick={() => handleToggle(assignee)} style={{ padding: "12px 16px", borderRadius: "8px", border: isSelected ? "2px solid #2563EB" : "1px solid #E5E7EB", backgroundColor: isSelected ? "#EFF6FF" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "14px", color: "#374151" }}>{assignee.emp_name.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px" }}>{assignee.emp_name}</div>
                      <div style={{ fontSize: "12px", color: "#6B7280" }}>{assignee.department_name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: "10px", border: "1px solid #D1D5DB", backgroundColor: "#fff", cursor: "pointer", fontWeight: 500, fontSize: "14px" }}>Cancel</button>
          <button onClick={handleAdd} disabled={selected.length === 0} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", backgroundColor: selected.length === 0 ? "#D1D5DB" : "#4B4B4B", color: "#fff", cursor: selected.length === 0 ? "not-allowed" : "pointer", fontWeight: 500, fontSize: "14px" }}>Add ({selected.length})</button>
        </div>
      </div>
    </div>
  );
};

// --- Equipment Card Component ---
type EquipmentCardProps = {
  item: any;
  selected?: boolean;
  onClick: () => void;
  assignees: Assignee[];
  onAddAssignee: () => void;
  onRemoveAssignee: (assigneeId: number) => void;
};

const EquipmentCard = ({ item, selected = false, onClick, assignees, onAddAssignee, onRemoveAssignee }: EquipmentCardProps) => {
  const totalParams = item.parameters.length || 0;
  const activeParams = item.parameters.filter((p: any) => p.is_active).length;
  const activePercent = totalParams > 0 ? Math.round((activeParams / totalParams) * 100) : 0;
  const percentColor = activePercent === 100 ? "#16a34a" : "#f97316";

  return (
    <div style={{ padding: "16px", borderRadius: "12px", cursor: "pointer", backgroundColor: selected ? "#fef3f2" : "#fff", border: selected ? "2px solid #f97316" : "1px solid #e5e7eb", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={onClick}>
        <span style={{ fontSize: "13px", fontWeight: "700" }}>{item.detailName} : <span style={{ color: "#64748b", fontWeight: "400" }}>Parameters: {item.paramsCount}</span></span>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>Assignee :</span>
          <div style={{ display: "flex", position: "relative" }}>
            {assignees.slice(0, 3).map((assignee, i) => (
              <div key={assignee.id} style={{ position: "relative", marginLeft: i > 0 ? "-8px" : 0 }} title={assignee.emp_name}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid white", backgroundColor: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 600, color: "#374151" }}>{assignee.emp_name.charAt(0).toUpperCase()}</div>
                <button onClick={(e) => { e.stopPropagation(); onRemoveAssignee(assignee.id); }} style={{ position: "absolute", top: "-4px", right: "-4px", width: "14px", height: "14px", borderRadius: "50%", border: "1px solid white", backgroundColor: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}><X size={10} color="white" /></button>
              </div>
            ))}
            {assignees.length > 3 && <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid white", backgroundColor: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 600, color: "white", marginLeft: "-8px" }}>+{assignees.length - 3}</div>}
          </div>
          <div onClick={onAddAssignee}><CustomPlusIcon /></div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }} onClick={onClick}>
        <span style={{ fontSize: "12px", fontWeight: "700", color: percentColor }}>{activePercent}%</span>
        <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>{assignees.length > 0 && `${assignees.length} assignee${assignees.length > 1 ? 's' : ''}`}</div>
      </div>
    </div>
  );
};

const getMappedRadioName = (input: string) => {
  const val = input ? input.toString().toUpperCase() : "";
  if (val.includes("01") || val.includes(" 1") || val.endsWith(" A")) return "Sperm Analyzer A";
  if (val.includes("02") || val.includes(" 2") || val.endsWith(" B")) return "Sperm Analyzer B";
  if (val.includes("03") || val.includes(" 3") || val.endsWith(" C")) return "Sperm Analyzer C";
  if (val.includes("04") || val.includes(" 4") || val.endsWith(" D")) return "Sperm Analyzer D";
  if (val.includes("05") || val.includes(" 5") || val.endsWith(" E")) return "Sperm Analyzer E";
  return input;
};

const Andrology = () => {
  const { selectedAssigneeId, searchText = "", setSearchText } = useOutletContext<{
    selectedAssigneeId: number | null;
    searchText: string;
    setSearchText: (val: string) => void;
  }>();

  const assigneeOptions = useSelector((state: RootState) => state.assignees.data);

  const [view, setView] = useState("list");
  const [activeTab, setActiveTab] = useState("To-Do");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedRadio, setSelectedRadio] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [loading, setLoading] = useState(true);

  const [equipmentAssignees, setEquipmentAssignees] = useState<Record<string, Assignee[]>>({});
  const [assigneeDialogOpen, setAssigneeDialogOpen] = useState(false);
  const [currentEquipmentId, setCurrentEquipmentId] = useState<string>("");

  const [rawEquipmentData, setRawEquipmentData] = useState<any[]>([]);

  const andrologyAssignees = assigneeOptions.filter((a) => a.department_name === "Andrology");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/get_clinic/1/`);
        const data = await response.json();
        let equipmentList: any[] = [];

        data.department.forEach((dep: any) => {
          if (dep.name.toLowerCase().trim() !== "andrology") return;
          dep.equipments.forEach((eq: any) => {
            const detailsMap: Record<string, { make: string; model: string }> = {};
            eq.equipment_details?.forEach((detail: any) => {
              detailsMap[detail.equipment_num] = { make: detail.make, model: detail.model };
            });

            eq.equipment_details?.forEach((detail: any) => {
              equipmentList.push({
                id: detail.id,
                name: eq.equipment_name,
                detailName: detail.equipment_num,
                make: detail.make,
                model: detail.model,
                parameters: eq.parameters || [],
                paramsCount: `${formatCount(eq.parameters?.filter((p: any) => p.is_active).length || 0)}/${formatCount(eq.parameters?.length || 0)}`,
                type: determineEquipmentType(eq.equipment_name),
              });
            });
          });
        });

        setRawEquipmentData(equipmentList);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search and Assignee filter logic
  const filteredGroupedEquipments = useMemo(() => {
    const grouped: Record<string, typeof rawEquipmentData> = {};

    rawEquipmentData.forEach((item) => {
      const equipmentKey = `${item.name}-${item.detailName}`;
      const assignees = equipmentAssignees[equipmentKey] || [];

      const matchesSearch =
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.detailName.toLowerCase().includes(searchText.toLowerCase());

      const matchesAssignee = !selectedAssigneeId || assignees.some(a => a.id === selectedAssigneeId);

      if (matchesSearch && matchesAssignee) {
        if (!grouped[item.name]) grouped[item.name] = [];
        grouped[item.name].push(item);
      }
    });

    return grouped;
  }, [rawEquipmentData, searchText, selectedAssigneeId, equipmentAssignees]);

  const equipmentDetails = rawEquipmentData
    .filter((e) => e.name === selectedEquipment)
    .map((e) => ({
      equipment_id: e.id,
      equipment_num: e.detailName,
      parameters: e.parameters,
      make: e.make,
      model: e.model,
    }));

  const selectEquipment = (eq: (typeof rawEquipmentData)[number]) => {
    setSelectedEquipment(eq.name);
    const mappedRadio = getMappedRadioName(eq.detailName);
    setSelectedRadio(mappedRadio);
    setEquipmentType(eq.type);

    if (setSearchText) {
      setSearchText("");
    }
  };

  const handleAddAssignee = (equipmentKey: string) => {
    setCurrentEquipmentId(equipmentKey);
    setAssigneeDialogOpen(true);
  };

  const handleAssigneesAdded = (newAssignees: Assignee[]) => {
    setEquipmentAssignees((prev) => ({
      ...prev,
      [currentEquipmentId]: [...(prev[currentEquipmentId] || []), ...newAssignees],
    }));
  };

  const handleRemoveAssignee = (equipmentKey: string, assigneeId: number) => {
    setEquipmentAssignees((prev) => ({
      ...prev,
      [equipmentKey]: (prev[equipmentKey] || []).filter((a) => a.id !== assigneeId),
    }));
  };

  const formMap: Record<string, any> = {
    sperm: SpermAnalyzersForm,
    centrifuge: CentrifugesForm,
    autoclave: AutoclavesForm,
    gas: GasAnalyzersForm,
    fridge: RefrigeratorFreezerForm,
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  if (view === "list") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#fff", padding: "12px", fontFamily: "'Montserrat', sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "32px", gap: "24px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#0f172a" }}>Equipments</h1>
          <div style={{ display: "inline-flex", backgroundColor: "#F2F2F2", padding: "4px", borderRadius: "12px", gap: "4px" }}>
            {["To-Do", "Plan"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ width: "166px", height: "36px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "700", backgroundColor: activeTab === tab ? "#FFFFFF" : "transparent", color: activeTab === tab ? "#E17E61" : "#94a3b8" }}>{tab}</button>
            ))}
          </div>
        </div>

        {activeTab === "To-Do" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {Object.keys(filteredGroupedEquipments).length > 0 ? (
              Object.keys(filteredGroupedEquipments).map((eqName) => (
                <div key={eqName} style={{ borderRadius: "12px", backgroundColor: "#F8F8F8", padding: "15px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#0f172a", marginTop: 0 }}>{eqName}</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "12px" }}>
                    {filteredGroupedEquipments[eqName].map((item) => {
                      const equipmentKey = `${item.name}-${item.detailName}`;
                      return (
                        <EquipmentCard
                          key={item.id}
                          item={item}
                          onClick={() => { selectEquipment(item); setView("detail"); }}
                          assignees={equipmentAssignees[equipmentKey] || []}
                          onAddAssignee={() => handleAddAssignee(equipmentKey)}
                          onRemoveAssignee={(id) => handleRemoveAssignee(equipmentKey, id)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", marginTop: "100px", color: "#94a3b8" }}>
                No equipments found matching "{searchText}"
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", marginTop: "100px", color: "#94a3b8" }}>No plans added yet</div>
        )}

        <AssigneeDialog open={assigneeDialogOpen} onClose={() => setAssigneeDialogOpen(false)} availableAssignees={andrologyAssignees} currentAssignees={equipmentAssignees[currentEquipmentId] || []} onAdd={handleAssigneesAdded} />
      </div>
    );
  }

  const ActiveForm = formMap[equipmentType];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb", padding: "20px", gap: "20px", fontFamily: "'Montserrat', sans-serif" }}>
      <div style={{ width: "512px", height: "840px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <button onClick={() => setView("list")} style={{ background: "none", border: "none", fontSize: "14px", fontWeight: "700", cursor: "pointer", color: "#0f172a", marginBottom: "16px" }}>← Equipments</button>
          <div style={{ display: "inline-flex", backgroundColor: "#F2F2F2", padding: "4px", borderRadius: "12px", gap: "4px", width: "100%" }}>
            {["To-Do", "Plan"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, height: "36px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "700", backgroundColor: activeTab === tab ? "#FFFFFF" : "transparent", color: activeTab === tab ? "#E17E61" : "#94a3b8" }}>{tab}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", flex: 1 }}>
          {activeTab === "To-Do" ? (
            Object.keys(filteredGroupedEquipments).map((eqName) => {
              const eqItems = filteredGroupedEquipments[eqName];
              const itemsToShow = eqName === selectedEquipment ? eqItems.filter((item) => item.detailName === selectedRadio) : [eqItems[0]];
              return itemsToShow.map((item) => {
                const equipmentKey = `${item.name}-${item.detailName}`;
                return (
                  <EquipmentCard key={item.id} item={item} selected={selectedRadio === item.detailName} onClick={() => selectEquipment(item)} assignees={equipmentAssignees[equipmentKey] || []} onAddAssignee={() => handleAddAssignee(equipmentKey)} onRemoveAssignee={(id) => handleRemoveAssignee(equipmentKey, id)} />
                );
              });
            })
          ) : (
            <div style={{ textAlign: "center", marginTop: "20px", color: "#94a3b8", fontSize: "14px" }}>No plans available</div>
          )}
        </div>
      </div>

      <div style={{ width: "994px" }}>
        {activeTab === "To-Do" && ActiveForm && (
          <ActiveForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} equipmentDetails={equipmentDetails} />
        )}
      </div>

      <AssigneeDialog open={assigneeDialogOpen} onClose={() => setAssigneeDialogOpen(false)} availableAssignees={andrologyAssignees} currentAssignees={equipmentAssignees[currentEquipmentId] || []} onAdd={handleAssigneesAdded} />
    </div>
  );
};

export default Andrology;