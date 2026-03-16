type TabType = "All" | "To-Do" | "Plan";

type EquipmentTabsProps = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

export default function EquipmentTabs({
  activeTab,
  onTabChange,
}: EquipmentTabsProps) {
  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#F8F8F8",
        padding: 4,
        borderRadius: 12,
        gap: 4,
        flexShrink: 0,
      }}
    >
      {(["All", "To-Do", "Plan"] as TabType[]).map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          style={{
            minWidth: 70,
            height: 36,
            padding: "0 12px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: "nowrap",
            backgroundColor: activeTab === tab ? "#FFFFFF" : "transparent",
            color: activeTab === tab ? "#E17E61" : "#94a3b8",
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
