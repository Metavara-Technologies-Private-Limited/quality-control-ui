import { createContext, useContext, useState, ReactNode } from "react";

type TabContextType = {
  activeTabIndex: number;
  setActiveTabIndex: (index: number) => void;
};

const TabContext = createContext<TabContextType | null>(null);

export const TabProvider = ({ children }: { children: ReactNode }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  return (
    <TabContext.Provider value={{ activeTabIndex, setActiveTabIndex }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTab = () => {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error("useTab must be used inside TabProvider");
  return ctx;
};
