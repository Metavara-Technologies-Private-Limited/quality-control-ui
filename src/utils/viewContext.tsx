import React, { createContext, useContext, useState, ReactNode } from 'react';

type ViewType = 'admin' | 'user' | 'technician';

interface ViewContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    // Get from localStorage or default to 'technician'
    const saved = localStorage.getItem('qc_view_type');
    return (saved as ViewType) || 'technician';
  });

  const handleSetView = (view: ViewType) => {
    setCurrentView(view);
    localStorage.setItem('qc_view_type', view);
  };

  return (
    <ViewContext.Provider
      value={{ currentView, setCurrentView: handleSetView }}
    >
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};
