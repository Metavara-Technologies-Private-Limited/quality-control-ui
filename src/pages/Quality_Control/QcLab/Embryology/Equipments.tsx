import { useState } from "react";
import { useSelector } from "react-redux";
import { Plus, X } from "lucide-react";
import { useOutletContext } from "react-router-dom";

import { RootState } from "@/store";
import { Assignee } from "@/types";

import IncubatorForm from "./IncubatorForm";
import LFHForm from "./LFHForm";
import MicroscopesForm from "./MicroscopesForm";
import CryopreservationForm from "./CryopreservationForm";
import OvensWaterBathForm from "./OvensWaterBathForm";
import PHMetersForm from "./PHMetersForm";

const formatCount = (value: number) => String(value).padStart(2, "0");

const determineEquipmentType = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("incubator")) return "incubator";
  if (n.includes("lfh") || n.includes("hood") || n.includes("laminar")) return "lfh";
  if (n.includes("ovens") || n.includes("water bath") || n.includes("oven")) return "ovens";
  if (n.includes("waterbath") || n.includes("water bath")) return "waterbath";
  if (n.includes("microscope")) return "microscopes";
  if (n.includes("ph meter") || n.includes("phMeter") || n.includes("ph-meter")) return "phmeters"; // ✅ FIXED
  if (n.includes("cryo") || n.includes("ln2")) return "cryopreservation";
  return "other";
};

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
  // Calculate active parameters percentage
  const totalParams = item.parameters.length || 0;
  const activeParams = item.parameters.filter((p: any) => p.is_active).length;
  const activePercent =
    totalParams > 0 ? Math.round((activeParams / totalParams) * 100) : 0;

  // Color: green if 100%, orange if below
  const percentColor = activePercent === 100 ? "#16a34a" : "#f97316";

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "12px",
        cursor: "pointer",
        backgroundColor: selected ? "#fef3f2" : "#fff",
        border: selected ? "2px solid #f97316" : "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onClick={onClick}
      >
        <span style={{ fontSize: "13px", fontWeight: "700" }}>
          {item.detailName} :{" "}
          <span style={{ color: "#64748b", fontWeight: "400" }}>
            Parameters: {item.paramsCount}
          </span>
        </span>

        <div
          style={{ display: "flex", alignItems: "center", gap: "4px" }}
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

      {/* Bottom row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "12px",
        }}
        onClick={onClick}
      >
        {/* Active percent */}
        <span
          style={{ fontSize: "12px", fontWeight: "700", color: percentColor }}
        >
          {activePercent}%
        </span>

        {/* Assignee count */}
        <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>
          {assignees.length > 0 && `${assignees.length} assignee${assignees.length > 1 ? 's' : ''}`}
        </div>
      </div>
    </div>
  );
};


const Equipment = () => {
const { selectedAssigneeId } = useOutletContext<{
  selectedAssigneeId: number | null;
}>();

  const { data: clinic } = useSelector((state: RootState) => state.clinic);
  const assigneeOptions = useSelector(
    (state: RootState) => state.assignees.data
  );
  const departments = clinic?.department ?? [];

  const [view, setView] = useState<"list" | "detail">("list");
  const [activeTab, setActiveTab] = useState("To-Do");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedRadio, setSelectedRadio] = useState("");
  const [equipmentType, setEquipmentType] = useState("incubator");

  // Assignee management
  const [equipmentAssignees, setEquipmentAssignees] = useState<
    Record<string, Assignee[]>
  >({});
  const [assigneeDialogOpen, setAssigneeDialogOpen] = useState(false);
  const [currentEquipmentId, setCurrentEquipmentId] = useState<string>("");

  const embryologyDept = departments.find((dep) => dep.name === "Embryology");

  // Get assignees for Embryology department
  const embryologyAssignees = assigneeOptions.filter(
    (a) => a.department_name === "Embryology"
  );

  // Flatten equipment details per equipment
  const equipmentData =
    embryologyDept?.equipments.flatMap((eq) =>
      eq.equipment_details.map((detail) => {
        const total = eq.parameters?.length ?? 0;
        const active =
          eq.parameters?.filter((param) => param.is_active).length ?? 0;

        return {
          id: detail.id,
          name: eq.equipment_name,
          detailName: detail.equipment_num,
          make: detail.make,
          model: detail.model,
          parameters: eq.parameters || [],
          paramsCount: `${formatCount(active)}/${formatCount(total)}`,
          type: determineEquipmentType(eq.equipment_name),
        };
      })
    ) || [];

  const equipmentDetails = equipmentData
    .filter((e) => e.name === selectedEquipment)
    .map((e) => ({
      equipment_id: e.id,
      equipment_num: e.detailName,
      parameters: e.parameters,
      make: e.make,
      model: e.model,
    }));

  const selectEquipment = (eq: (typeof equipmentData)[number]) => {
    setSelectedEquipment(eq.name);
    setSelectedRadio(eq.detailName);
    setEquipmentType(eq.type);
  };

  const handleSelectEquipment = (item: (typeof equipmentData)[number]) => {
    selectEquipment(item);
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

  // Group by equipment name
  const groupedEquipments: Record<string, typeof equipmentData> =
    equipmentData.reduce((acc, curr) => {
      if (!acc[curr.name]) acc[curr.name] = [];
      acc[curr.name].push(curr);
      return acc;
    }, {} as Record<string, typeof equipmentData>);

  // --- Form mapping for main content ---
  const formMap: Record<string, any> = {
    incubator: IncubatorForm,
    lfh: LFHForm,
    ovens: OvensWaterBathForm,
    waterbath: OvensWaterBathForm,
    microscopes: MicroscopesForm,
    phmeters: PHMetersForm,
    cryopreservation: CryopreservationForm,
  };

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
        {/* Header */}
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

        {/* To-Do list */}
        {activeTab === "To-Do" ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {Object.keys(groupedEquipments).map((eqName) => (
              <div
                key={eqName}
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
                  {eqName}
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(400px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {groupedEquipments[eqName]
  .filter((item) => {
    // ✅ If no assignee selected, show all equipments
    if (!selectedAssigneeId) return true;

    const equipmentKey = `${item.name}-${item.detailName}`;
    const assignees = equipmentAssignees[equipmentKey] || [];

    // ✅ Show equipment only if selected assignee exists
    return assignees.some(
      (assignee) => assignee.id === selectedAssigneeId
    );
  })
  .map((item) => {
                    const equipmentKey = `${item.name}-${item.detailName}`;
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
          availableAssignees={embryologyAssignees}
          currentAssignees={equipmentAssignees[currentEquipmentId] || []}
          onAdd={handleAssigneesAdded}
        />
      </div>
    );
  }

  // DETAIL VIEW
  const ActiveForm = formMap[equipmentType];

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
            Object.keys(groupedEquipments).map((eqName) => {
              const eqItems = groupedEquipments[eqName];
              const itemsToShow =
                eqName === selectedEquipment
                  ? eqItems.filter((item) => item.detailName === selectedRadio)
                  : [eqItems[0]];

              return itemsToShow.map((item) => {
                const equipmentKey = `${item.name}-${item.detailName}`;
                return (
                  <EquipmentCard
                    key={item.id}
                    item={item}
                    selected={selectedRadio === item.detailName}
                    onClick={() => handleSelectEquipment(item)}
                    assignees={equipmentAssignees[equipmentKey] || []}
                    onAddAssignee={() => handleAddAssignee(equipmentKey)}
                    onRemoveAssignee={(assigneeId) =>
                      handleRemoveAssignee(equipmentKey, assigneeId)
                    }
                  />
                );
              });
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

      {/* Main Content Area */}
      <div style={{ width: "994px" }}>
        {activeTab === "To-Do" && ActiveForm && (
          <ActiveForm
            selectedRadio={selectedRadio}
            setSelectedRadio={setSelectedRadio}
            equipmentDetails={equipmentDetails}
          />
        )}
      </div>

      {/* Assignee Dialog in detail view */}
      <AssigneeDialog
        open={assigneeDialogOpen}
        onClose={() => setAssigneeDialogOpen(false)}
        availableAssignees={embryologyAssignees}
        currentAssignees={equipmentAssignees[currentEquipmentId] || []}
        onAdd={handleAssigneesAdded}
      />
    </div>
  );
};

export default Equipment;