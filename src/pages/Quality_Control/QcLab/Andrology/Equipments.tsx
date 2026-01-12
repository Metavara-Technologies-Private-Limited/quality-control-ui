import React, { useState, useEffect } from "react";
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
      cursor: "pointer",
    }}
  >
    <div
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Plus size={14} color="#fff" strokeWidth={3} />
    </div>
  </div>
);

// --- Assignee Dialog Component ---
type AssigneeDialogProps = {
  open: boolean;
  onClose: () => void;
  availableAssignees: Assignee[];
  currentAssignees: Assignee[];
  onAdd: (assignees: Assignee[]) => void;
};

const AssigneeDialog = ({
  open,
  onClose,
  availableAssignees,
  currentAssignees,
  onAdd,
}: AssigneeDialogProps) => {
  const [selected, setSelected] = useState<Assignee[]>([]);

  if (!open) return null;

  const handleToggle = (assignee: Assignee) => {
    setSelected((prev) => {
      const exists = prev.find((a) => a.id === assignee.id);
      if (exists) {
        return prev.filter((a) => a.id !== assignee.id);
      }
      return [...prev, assignee];
    });
  };

  const handleAdd = () => {
    onAdd(selected);
    setSelected([]);
    onClose();
  };

  // Filter out already assigned
  const available = availableAssignees.filter(
    (a) => !currentAssignees.find((curr) => curr.id === a.id)
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          width: "520px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
            Select Assignees
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={20} color="#6B7280" />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {available.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6B7280" }}>
              No available assignees
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {available.map((assignee) => {
                const isSelected = selected.find((a) => a.id === assignee.id);
                return (
                  <div
                    key={assignee.id}
                    onClick={() => handleToggle(assignee)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: isSelected
                        ? "2px solid #2563EB"
                        : "1px solid #E5E7EB",
                      backgroundColor: isSelected ? "#EFF6FF" : "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#E5E7EB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#374151",
                      }}
                    >
                      {assignee.emp_name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px" }}>
                        {assignee.emp_name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6B7280" }}>
                        {assignee.department_name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              border: "1px solid #D1D5DB",
              backgroundColor: "#fff",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selected.length === 0}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: selected.length === 0 ? "#D1D5DB" : "#4B4B4B",
              color: "#fff",
              cursor: selected.length === 0 ? "not-allowed" : "pointer",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            Add ({selected.length})
          </button>
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

const EquipmentCard = ({
  item,
  selected = false,
  onClick,
  assignees,
  onAddAssignee,
  onRemoveAssignee,
}: EquipmentCardProps) => {
  return (
    <div
      style={{
        border: selected ? "2px solid #f97316" : "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "16px",
        cursor: "pointer",
        backgroundColor: selected ? "#fef3f2" : "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
        onClick={onClick}
      >
        <div>
          <span style={{ fontSize: "14px", fontWeight: "700" }}>
            {item.parameterName}
          </span>
          <span
            style={{
              color: "#64748b",
              fontWeight: "400",
              fontSize: "14px",
              marginLeft: "8px",
            }}
          >
            : Parameters : {String(item.paramsCount).padStart(2, "0")}/
            {String(item.paramsCount).padStart(2, "0")}
          </span>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>
            Assignee :
          </span>
          <div style={{ display: "flex", position: "relative" }}>
            {assignees.slice(0, 3).map((assignee, i) => (
              <div
                key={assignee.id}
                style={{
                  position: "relative",
                  marginLeft: i > 0 ? "-8px" : 0,
                }}
                title={assignee.emp_name}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: "2px solid white",
                    backgroundColor: "#E5E7EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  {assignee.emp_name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveAssignee(assignee.id);
                  }}
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    border: "1px solid white",
                    backgroundColor: "#EF4444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <X size={10} color="white" />
                </button>
              </div>
            ))}
            {assignees.length > 3 && (
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  border: "2px solid white",
                  backgroundColor: "#6B7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "white",
                  marginLeft: "-8px",
                }}
              >
                +{assignees.length - 3}
              </div>
            )}
          </div>
          <div onClick={onAddAssignee}>
            <CustomPlusIcon />
          </div>
        </div>
      </div>
      <div onClick={onClick}>
        <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: "700" }}>
          {item.progress}
        </span>
      </div>
    </div>
  );
};

const Andrology = () => {
  const { selectedAssigneeId } = useOutletContext<{
  selectedAssigneeId: number | null;
}>();

  const assigneeOptions = useSelector(
    (state: RootState) => state.assignees.data
  );

  const [view, setView] = useState("list");
  const [activeTab, setActiveTab] = useState("To-Do");

  const [equipmentData, setEquipmentData] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedRadio, setSelectedRadio] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [activeEquipmentGroup, setActiveEquipmentGroup] = useState("");
  const [currentParameters, setCurrentParameters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeMake, setActiveMake] = useState("");
  const [activeModel, setActiveModel] = useState("");

  // Assignee management
  const [equipmentAssignees, setEquipmentAssignees] = useState<
    Record<string, Assignee[]>
  >({});
  const [assigneeDialogOpen, setAssigneeDialogOpen] = useState(false);
  const [currentEquipmentId, setCurrentEquipmentId] = useState<string>("");

  // Get assignees for Andrology department
  const andrologyAssignees = assigneeOptions.filter(
    (a) => a.department_name === "Andrology"
  );

  const determineEquipmentType = (paramName: string) => {
    const p = paramName.toLowerCase();
    if (p.includes("sperm") || p.includes("analyzer")) return "sperm";
    if (p.includes("centrifuge")) return "centrifuge";
    if (p.includes("autoclave")) return "autoclave";
    if (p.includes("gas")) return "gas";
    if (
      p.includes("refrigerator") ||
      p.includes("freezer") ||
      p.includes("fridge")
    )
      return "fridge";
    return "other";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/get_clinic/1/`);
        const data = await response.json();

        let equipmentList: any[] = [];
        data.department.forEach((dep: any) => {
          // FILTER: Only process Andrology department
          if (dep.name.toLowerCase().trim() !== "andrology") {
            return; // Skip non-Andrology departments
          }

          dep.equipments.forEach((eq: any) => {
            const params = eq.parameters || [];

            const detailsMap: Record<
              string,
              { make: string; model: string }
            > = {};
            eq.equipment_details?.forEach((detail: any) => {
              detailsMap[detail.equipment_num] = {
                make: detail.make,
                model: detail.model,
              };
            });

            params.forEach((param: any) => {
              equipmentList.push({
                id: `${eq.id}-${param.id}`,
                parameterName: param.parameter_name,
                equipmentName: eq.equipment_name,
                departmentName: dep.name,
                allParameters: params,
                paramsCount: params.length,
                progress: "100%",
                type: determineEquipmentType(param.parameter_name),
                make: detailsMap[eq.equipment_name]?.make || "N/A",
                model: detailsMap[eq.equipment_name]?.model || "N/A",
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
    setActiveMake(item.make);
    setActiveModel(item.model);
  };

  const handleAddAssignee = (equipmentKey: string) => {
    setCurrentEquipmentId(equipmentKey);
    setAssigneeDialogOpen(true);
  };

  const handleAssigneesAdded = (newAssignees: Assignee[]) => {
    setEquipmentAssignees((prev) => ({
      ...prev,
      [currentEquipmentId]: [
        ...(prev[currentEquipmentId] || []),
        ...newAssignees,
      ],
    }));
  };

  const handleRemoveAssignee = (equipmentKey: string, assigneeId: number) => {
    setEquipmentAssignees((prev) => ({
      ...prev,
      [equipmentKey]: (prev[equipmentKey] || []).filter(
        (a) => a.id !== assigneeId
      ),
    }));
  };

  const groupedEquipments = equipmentData.reduce((acc: any, curr) => {
    if (!acc[curr.equipmentName]) acc[curr.equipmentName] = [];
    acc[curr.equipmentName].push(curr);
    return acc;
  }, {});

  const sidebarData = equipmentData.filter(
    (item) => item.equipmentName === activeEquipmentGroup
  );

  if (loading)
    return (
      <div style={{ padding: "20px", fontFamily: "'Montserrat', sans-serif" }}>
        Loading...
      </div>
    );

  // Show message if no Andrology equipment found
  if (equipmentData.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#fff",
          padding: "12px",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "700",
            margin: 0,
            color: "#0f172a",
            marginBottom: "32px",
          }}
        >
          Equipments
        </h1>
        <div
          style={{
            textAlign: "center",
            marginTop: "100px",
            color: "#94a3b8",
            fontSize: "16px",
          }}
        >
          No equipment found in Andrology department
        </div>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#fff",
          padding: "12px",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "32px",
            gap: "24px",
          }}
        >
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "700",
              margin: 0,
              color: "#0f172a",
            }}
          >
            Equipments
          </h1>
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "#F2F2F2",
              padding: "4px",
              borderRadius: "12px",
              gap: "4px",
            }}
          >
            {["To-Do", "Plan"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  width: "166px",
                  height: "36px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "700",
                  backgroundColor:
                    activeTab === tab ? "#FFFFFF" : "transparent",
                  color: activeTab === tab ? "#E17E61" : "#94a3b8",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "To-Do" ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "30px" }}
          >
            {Object.keys(groupedEquipments).map((equipmentName) => (
              <div
                key={equipmentName}
                style={{
                  borderRadius: "12px",
                  backgroundColor: "#F8F8F8",
                  padding: "15px",
                }}
              >
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    marginBottom: "16px",
                    color: "#0f172a",
                    marginTop: 0,
                  }}
                >
                  {equipmentName}
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(400px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {groupedEquipments[equipmentName]
  .filter((item: any) => {
    // 👉 if no assignee selected, show all
    if (!selectedAssigneeId) return true;

    const equipmentKey = item.id;
    const assignees = equipmentAssignees[equipmentKey] || [];

    // 👉 show only if selected assignee is assigned
    return assignees.some(
      (assignee) => assignee.id === selectedAssigneeId
    );
  })
  .map((item: any) => {
    const equipmentKey = item.id;
    return (
      <EquipmentCard
        key={item.id}
        item={item}
        onClick={() => {
          handleSelectEquipment(item);
          setView("detail");
        }}
        assignees={equipmentAssignees[equipmentKey] || []}
        onAddAssignee={() => handleAddAssignee(equipmentKey)}
        onRemoveAssignee={(assigneeId) =>
          handleRemoveAssignee(equipmentKey, assigneeId)
        }
      />
    );
  })}

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              marginTop: "100px",
              color: "#94a3b8",
            }}
          >
            No plans added yet
          </div>
        )}

        {/* Assignee Dialog */}
        <AssigneeDialog
          open={assigneeDialogOpen}
          onClose={() => setAssigneeDialogOpen(false)}
          availableAssignees={andrologyAssignees}
          currentAssignees={equipmentAssignees[currentEquipmentId] || []}
          onAdd={handleAssigneesAdded}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        padding: "20px",
        gap: "20px",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {/* Sidebar */}
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
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <button
            onClick={() => setView("list")}
            style={{
              background: "none",
              border: "none",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              color: "#0f172a",
              marginBottom: "16px",
            }}
          >
            ← Equipments
          </button>
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "#F2F2F2",
              padding: "4px",
              borderRadius: "12px",
              gap: "4px",
              width: "100%",
            }}
          >
            {["To-Do", "Plan"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  height: "36px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "700",
                  backgroundColor:
                    activeTab === tab ? "#FFFFFF" : "transparent",
                  color: activeTab === tab ? "#E17E61" : "#94a3b8",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {activeTab === "To-Do" ? (
            sidebarData
  .filter((item) => {
    if (!selectedAssigneeId) return true;

    const equipmentKey = item.id;
    const assignees = equipmentAssignees[equipmentKey] || [];

    return assignees.some(
      (assignee) => assignee.id === selectedAssigneeId
    );
  })
  .map((item) => {
    const equipmentKey = item.id;
    return (
      <EquipmentCard
        key={item.id}
        item={item}
        selected={selectedEquipment === item.parameterName}
        onClick={() => handleSelectEquipment(item)}
        assignees={equipmentAssignees[equipmentKey] || []}
        onAddAssignee={() => handleAddAssignee(equipmentKey)}
        onRemoveAssignee={(assigneeId) =>
          handleRemoveAssignee(equipmentKey, assigneeId)
        }
      />
    );
  })

          ) : (
            <div
              style={{
                textAlign: "center",
                marginTop: "20px",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              No plans available
            </div>
          )}
        </div>
      </div>

      <div style={{ width: "994px" }}>
        {activeTab === "To-Do" ? (
          <>
            {equipmentType === "sperm" && (
              <SpermAnalyzersForm
                selectedRadio={selectedRadio}
                setSelectedRadio={setSelectedRadio}
                parameters={currentParameters}
                make={activeMake}
                model={activeModel}
              />
            )}
            {equipmentType === "centrifuge" && (
              <CentrifugesForm
                selectedRadio={selectedRadio}
                setSelectedRadio={setSelectedRadio}
                parameters={currentParameters}
                make={activeMake}
                model={activeModel}
              />
            )}
            {equipmentType === "autoclave" && (
              <AutoclavesForm
                selectedRadio={selectedRadio}
                setSelectedRadio={setSelectedRadio}
                parameters={currentParameters}
                make={activeMake}
                model={activeModel}
              />
            )}
            {equipmentType === "gas" && (
              <GasAnalyzersForm
                selectedRadio={selectedRadio}
                setSelectedRadio={setSelectedRadio}
                parameters={currentParameters}
                make={activeMake}
                model={activeModel}
              />
            )}
            {equipmentType === "fridge" && (
              <RefrigeratorFreezerForm
                selectedRadio={selectedRadio}
                setSelectedRadio={setSelectedRadio}
                parameters={currentParameters}
                make={activeMake}
                model={activeModel}
              />
            )}
          </>
        ) : (
          <div
            style={{
              height: "840px",
              backgroundColor: "#fff",
              borderRadius: "14px",
              border: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            No plans added for this group.
          </div>
        )}
      </div>

      {/* Assignee Dialog in detail view */}
      <AssigneeDialog
        open={assigneeDialogOpen}
        onClose={() => setAssigneeDialogOpen(false)}
        availableAssignees={andrologyAssignees}
        currentAssignees={equipmentAssignees[currentEquipmentId] || []}
        onAdd={handleAssigneesAdded}
      />
    </div>
  );
};

export default Andrology;