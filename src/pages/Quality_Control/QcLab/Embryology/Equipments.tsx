import { useState } from "react";
import { useSelector } from "react-redux";
import { Plus } from "lucide-react";

import { RootState } from "@/store";

import IncubatorForm from "./IncubatorForm";
import LFHForm from "./LFHForm";
import MicroscopesForm from "./MicroscopesForm";
import CryopreservationForm from "./CryopreservationForm";
import OvensWaterBathForm from "./OvensWaterBathForm";
import PHMetersForm from "./PHMetersForm";

const formatCount = (value: number) => String(value).padStart(2, "0");

// To-do
const assignees = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=2",
  "https://i.pravatar.cc/150?img=3",
];

const determineEquipmentType = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("incubator")) return "incubator";
  if (n.includes("lfh") || n.includes("hood")) return "lfh";
  if (n.includes("ovens") || n.includes("water bath")) return "ovens";
  if (n.includes("waterbath") || n.includes("water bath")) return "waterbath";
  if (n.includes("microscope")) return "microscopes";
  if (n.includes("phmeters")) return "phmeters";
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

// --- Equipment Card Component ---
type EquipmentCardProps = {
  item: any;
  selected?: boolean;
  onClick: () => void;
  assignees?: string[];
};

const EquipmentCard = ({
  item,
  selected = false,
  onClick,
  assignees = [],
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
      onClick={onClick}
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
      >
        <span style={{ fontSize: "13px", fontWeight: "700" }}>
          {item.detailName} :{" "}
          <span style={{ color: "#64748b", fontWeight: "400" }}>
            Parameters: {item.paramsCount}
          </span>
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ display: "flex" }}>
            {assignees.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="user"
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: "1px solid white",
                  marginLeft: i > 0 ? "-8px" : 0,
                }}
              />
            ))}
          </div>
          <CustomPlusIcon />
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
      >
        {/* Active percent */}
        <span
          style={{ fontSize: "12px", fontWeight: "700", color: percentColor }}
        >
          {activePercent}%
        </span>

        {/* Placeholder for future content (bottom right) */}
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
          {/* Future temp tags here */}
        </div>
      </div>
    </div>
  );
};

const Equipment = () => {
  const { data: clinic } = useSelector((state: RootState) => state.clinic);
  const departments = clinic?.department ?? [];

  const [view, setView] = useState<"list" | "detail">("list");
  const [activeTab, setActiveTab] = useState("To-Do");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedRadio, setSelectedRadio] = useState("");
  const [equipmentType, setEquipmentType] = useState("incubator");
  const [_currentParameters, setCurrentParameters] = useState<any[]>([]);

  const embryologyDept = departments.find((dep) => dep.name === "Embryology");

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
  console.log("cc:equipmentData", equipmentData);

  const selectEquipment = (eq: (typeof equipmentData)[number]) => {
    setSelectedEquipment(eq.name);
    setSelectedRadio(eq.detailName);
    setEquipmentType(eq.type);
    setCurrentParameters(eq.parameters);
  };

  const handleSelectEquipment = (item: (typeof equipmentData)[number]) => {
    selectEquipment(item);
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
                  {groupedEquipments[eqName].map((item) => (
                    <EquipmentCard
                      key={item.id}
                      item={item}
                      onClick={() => {
                        handleSelectEquipment(item);
                        setView("detail");
                      }}
                      assignees={assignees}
                    />
                  ))}
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
            Equipments
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

              return itemsToShow.map((item) => (
                <EquipmentCard
                  key={item.id}
                  item={item}
                  selected={selectedRadio === item.detailName}
                  onClick={() => handleSelectEquipment(item)}
                  assignees={assignees}
                />
              ));
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
    </div>
  );
};

export default Equipment;
