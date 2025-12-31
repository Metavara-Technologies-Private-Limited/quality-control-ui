import React, { useEffect, useMemo, useState } from 'react';
import { Filter, MoreVertical } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// --- Types ---
interface Assignee {
  id: number;
  img: string;
}

// --- Mock Data ---
const ASSIGNEES: Assignee[] = [
  { id: 1, img: "https://i.pravatar.cc/150?u=1" },
  { id: 2, img: "https://i.pravatar.cc/150?u=2" },
  { id: 3, img: "https://i.pravatar.cc/150?u=3" },
  { id: 4, img: "https://i.pravatar.cc/150?u=4"}
];

const EQUIPMENT_DATA: Record<string, {
  variants: string[]; 
  temperature: string;
  humidity: string;
  status: string;
  make: string;
  model: string;
  hasWarning: boolean;
  warningType?: 'temp' | 'humidity';
}> = {
  'Incubator A': {
    variants: ['A', 'B', 'C', 'D'],
    temperature: '38.5',
    humidity: '55',
    status: 'Pass',
    make: 'THERMO FISHER',
    model: 'HERACELL 150i',
    hasWarning: true,
    warningType: 'temp'
  },
  'Incubator B': {
    variants: ['A', 'B', 'C', 'D'],
    temperature: '37.0',
    humidity: '60',
    status: 'Pass',
    make: 'EPPENDORF',
    model: 'CELLXPERT C170',
    hasWarning: false
  },
  'Incubator C': {
    variants: ['A', 'B', 'C', 'D'],
    temperature: '36.8',
    humidity: '20',
    status: 'Pass',
    make: 'BINDER',
    model: 'CB 150',
    hasWarning: true,
    warningType: 'humidity'
  },
  'Incubator D': {
    variants: ['A', 'B', 'C', 'D'],
    temperature: '37.2',
    humidity: '65',
    status: 'Pass',
    make: 'PANASONIC',
    model: 'MCO-170AICUV',
    hasWarning: false
  },
  'Incubator E': {
    variants: ['A', 'B', 'C', 'D'],
    temperature: '37.5',
    humidity: '58',
    status: 'Pass',
    make: 'NUAIRE',
    model: 'NU-5841',
    hasWarning: false
  },
  'LFH 01': {
    variants: ['01', '02', '03', '04'],
    temperature: '22.0',
    humidity: '45',
    status: 'Pass',
    make: 'ESCO',
    model: 'AC2-4E8',
    hasWarning: false
  },
  'LFH 02': {
    variants: ['01', '02', '03', '04'],
    temperature: '23.5',
    humidity: '48',
    status: 'Pass',
    make: 'THERMO FISHER',
    model: '1300 SERIES A2',
    hasWarning: false
  },
  'LFH 03': {
    variants: ['01', '02', '03', '04'],
    temperature: '38.5',
    humidity: '50',
    status: 'Fail',
    make: 'LABCONCO',
    model: 'PURIFIER LOGIC+',
    hasWarning: true,
    warningType: 'temp'
  },
  'LFH 04': {
    variants: ['01', '02', '03', '04'],
    temperature: '21.8',
    humidity: '47',
    status: 'Pass',
    make: 'BAKER',
    model: 'STERILGARD III',
    hasWarning: false
  },
  'Microscopes': {
    variants: ['M1', 'M2', 'M3', 'M4'],
    temperature: '24.0',
    humidity: '40',
    status: 'Pass',
    make: 'OLYMPUS',
    model: 'CKX53',
    hasWarning: false
  }
};

const Equipment = () => {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedItem, setSelectedItem] = useState('Incubator B');
  const [selectedVariant, setSelectedVariant] = useState('B');
  const [activeTab, setActiveTab] = useState('To-Do');
  const [formData, setFormData] = useState({ temperature: '', humidity: '', status: 'Pass' });
  const [live, setLive] = useState(true);
  const [targetTemp, setTargetTemp] = useState<number>(37);
  const [history, setHistory] = useState<Array<{ time: string; temperature: number; humidity: number }>>([]);

  // --- Common Styles ---
  const flexCenter = { display: 'flex', alignItems: 'center' };

  // Load equipment data when selected item changes
  const currentEquipment = EQUIPMENT_DATA[selectedItem];
  
  React.useEffect(() => {
    if (currentEquipment) {
      setFormData({
        temperature: currentEquipment.temperature,
        humidity: currentEquipment.humidity,
        status: currentEquipment.status
      });
      setSelectedVariant(currentEquipment.variants[0]);
      setTargetTemp(Number(currentEquipment.temperature));
      setHistory([]);
    }
  }, [selectedItem]);

  useEffect(() => {
    let interval: any;
    if (live) {
      interval = setInterval(() => {
        const baseT = Number(currentEquipment?.temperature || 37);
        const baseH = Number(currentEquipment?.humidity || 50);
        const driftT = (Math.random() - 0.5) * 0.4;
        const driftH = (Math.random() - 0.5) * 1.2;
        const nextT = Math.max(35, Math.min(39, baseT + driftT + (targetTemp - baseT) * 0.05));
        const nextH = Math.max(20, Math.min(80, baseH + driftH));
        setFormData(f => ({ ...f, temperature: nextT.toFixed(1), humidity: nextH.toFixed(0) }));
        const now = new Date();
        const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setHistory(h => {
          const next = [...h, { time: t, temperature: Number(nextT.toFixed(1)), humidity: Number(nextH.toFixed(0)) }];
          return next.slice(-24);
        });
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [live, currentEquipment, targetTemp]);

  const historicalData = useMemo(() => history.map(d => ({ time: d.time, Temperature: d.temperature, Humidity: d.humidity })), [history]);

  // --- VIEW 1: Grid List ---
  const ListView = () => (
    <div style={{ padding: '24px', backgroundColor: '#f3f4f6', minHeight: 'calc(100vh - 60px)' }}>
      {/* Top Bar */}
      <div style={{ ...flexCenter, justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>Equipments</h1>
        <div style={{ ...flexCenter, gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('To-Do')}
            style={{ 
              padding: '8px 24px', 
              border: 'none', 
              backgroundColor: activeTab === 'To-Do' ? 'white' : 'transparent',
              color: activeTab === 'To-Do' ? '#2563eb' : '#64748b',
              borderRadius: '8px', 
              fontWeight: '600', 
              fontSize: '13px',
              cursor: 'pointer',
              transition: '0.2s'
            }}>
            To-Do
          </button>
          <button 
            onClick={() => setActiveTab('Plan')}
            style={{ 
              padding: '8px 24px', 
              border: 'none', 
              backgroundColor: activeTab === 'Plan' ? 'white' : 'transparent',
              color: activeTab === 'Plan' ? '#2563eb' : '#64748b',
              borderRadius: '8px', 
              fontWeight: '600', 
              fontSize: '13px',
              cursor: 'pointer',
              transition: '0.2s'
            }}>
            Plan
          </button>
        </div>
        <Filter size={20} color="#64748b" style={{ cursor: 'pointer' }} />
      </div>

      {/* Incubator Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>Incubator</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {[
            { name: 'Incubator A', progress: 100, tag: 'Temp - 38.5 °C', tagColor: '#ef4444' },
            { name: 'Incubator B', progress: 100, tag: null },
            { name: 'Incubator C', progress: 100, tag: 'Humidity - 20%', tagColor: '#facc15' },
            { name: 'Incubator D', progress: 100, tag: null },
            { name: 'Incubator E', progress: 100, tag: null }
          ].map((item) => (
            <div 
              key={item.name} 
              onClick={() => { setSelectedItem(item.name); setView('detail'); }}
              style={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '12px', 
                padding: '16px',
                cursor: 'pointer',
                transition: '0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'}
            >
              <div style={{ ...flexCenter, justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ ...flexCenter, gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{item.name}</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>: Parameters : 08/08</span>
                </div>
                <div style={{ ...flexCenter, gap: '12px' }}>
                  <div style={{ display: 'flex', marginLeft: '-4px' }}>
                    {ASSIGNEES.map((a, i) => (
                      <img 
                        key={a.id} 
                        src={a.img} 
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          border: '2px solid white', 
                          marginLeft: i > 0 ? '-8px' : '0' 
                        }} 
                        alt="assignee" 
                      />
                    ))}
                  </div>
                  <MoreVertical size={16} color="#64748b" style={{ cursor: 'pointer' }} />
                </div>
              </div>
              
              <div style={{ fontSize: '13px', color: '#22c55e', fontWeight: '600', marginBottom: '12px' }}>
                {item.progress}%
              </div>
              
              {item.tag && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ 
                    backgroundColor: item.tagColor, 
                    color: 'white', 
                    padding: '4px 12px', 
                    borderRadius: '16px', 
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {item.tag}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Laminar Flow Hoods Section */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#0f172a' }}>Laminar Flow Hoods</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {[
            { name: 'LFH 01', progress: 100, tag: null },
            { name: 'LFH 02', progress: 100, tag: null },
            { name: 'LFH 03', progress: 100, tag: 'Temp - 38.5 °C', tagColor: '#ef4444' },
            { name: 'LFH 04', progress: 100, tag: null }
          ].map((item) => (
            <div 
              key={item.name} 
              onClick={() => { setSelectedItem(item.name); setView('detail'); }}
              style={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '12px', 
                padding: '16px',
                cursor: 'pointer',
                transition: '0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'}
            >
              <div style={{ ...flexCenter, justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ ...flexCenter, gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{item.name}</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>: Parameters : 08/08</span>
                </div>
                <div style={{ ...flexCenter, gap: '12px' }}>
                  <div style={{ display: 'flex', marginLeft: '-4px' }}>
                    {ASSIGNEES.map((a, i) => (
                      <img 
                        key={a.id} 
                        src={a.img} 
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          borderRadius: '50%', 
                          border: '2px solid white', 
                          marginLeft: i > 0 ? '-8px' : '0' 
                        }} 
                        alt="assignee" 
                      />
                    ))}
                  </div>
                  <MoreVertical size={16} color="#64748b" style={{ cursor: 'pointer' }} />
                </div>
              </div>
              
              <div style={{ fontSize: '13px', color: '#22c55e', fontWeight: '600', marginBottom: '12px' }}>
                {item.progress}%
              </div>
              
              {item.tag && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ 
                    backgroundColor: item.tagColor, 
                    color: 'white', 
                    padding: '4px 12px', 
                    borderRadius: '16px', 
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {item.tag}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- VIEW 2: Detail Form ---
  const DetailView = () => (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', backgroundColor: '#f3f4f6', transition: 'opacity 0.2s ease' }}>
      {/* Sidebar */}
      <div style={{ width: '320px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', ...flexCenter, justifyContent: 'space-between' }}>
          <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', fontWeight: '600', fontSize: '14px', cursor: 'pointer', color: '#0f172a' }}>
            ← Equipments
          </button>
          <Filter size={18} color="#64748b" style={{ cursor: 'pointer' }} />
        </div>
        
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
          {Object.keys(EQUIPMENT_DATA).map(name => (
            <div 
              key={name} 
              onClick={() => setSelectedItem(name)} 
              style={{ 
                padding: '14px', 
                borderRadius: '12px', 
                border: selectedItem === name ? '2px solid #2563eb' : '1px solid #f1f5f9',
                backgroundColor: selectedItem === name ? '#eff6ff' : 'white', 
                marginBottom: '12px', 
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              <div style={{ ...flexCenter, justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                <span style={{ color: '#0f172a' }}>{name} : <span style={{ color: '#64748b', fontWeight: 'normal' }}>08/08</span></span>
                <div style={{ display: 'flex', marginLeft: '-4px' }}>
                  <img src={ASSIGNEES[0].img} style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid white' }} alt="assignee" />
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600' }}>100%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Radio Buttons */}
          <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            {currentEquipment?.variants.map(variant => (
              <label key={variant} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="equipment" 
                  checked={selectedVariant === variant} 
                  onChange={() => setSelectedVariant(variant)}
                  style={{ accentColor: '#2563eb', width: '16px', height: '16px' }} 
                /> 
                {selectedItem.split(' ')[0]} {variant}
              </label>
            ))}
          </div>

          {/* Form Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Temperature (°C)</label>
              <div style={{ 
                padding: '12px 16px', 
                border: currentEquipment?.hasWarning && currentEquipment?.warningType === 'temp' ? '1px solid #fecaca' : '1px solid #e5e7eb', 
                backgroundColor: currentEquipment?.hasWarning && currentEquipment?.warningType === 'temp' ? '#fef2f2' : '#ffffff', 
                color: currentEquipment?.hasWarning && currentEquipment?.warningType === 'temp' ? '#dc2626' : '#0f172a', 
                borderRadius: '8px', 
                fontSize: '14px', 
                fontWeight: '500' 
              }}>
                {formData.temperature} °C
              </div>
              {currentEquipment?.hasWarning && currentEquipment?.warningType === 'temp' && (
                <p style={{ fontSize: '10px', color: '#ef4444', margin: 0 }}>Recommended: 36.5°C - 37.5°C</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Humidity (%)</label>
              <div style={{ 
                padding: '12px 16px', 
                border: currentEquipment?.hasWarning && currentEquipment?.warningType === 'humidity' ? '1px solid #fef08a' : '1px solid #e5e7eb', 
                backgroundColor: currentEquipment?.hasWarning && currentEquipment?.warningType === 'humidity' ? '#fefce8' : '#ffffff', 
                color: currentEquipment?.hasWarning && currentEquipment?.warningType === 'humidity' ? '#ca8a04' : '#0f172a', 
                borderRadius: '8px', 
                fontSize: '14px', 
                fontWeight: '500' 
              }}>
                {formData.humidity}%
              </div>
              {currentEquipment?.hasWarning && currentEquipment?.warningType === 'humidity' && (
                <p style={{ fontSize: '10px', color: '#facc15', margin: 0 }}>Recommended: 50% - 70%</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none', cursor: 'pointer', backgroundColor: 'white' }}
              >
                <option>Pass</option>
                <option>Fail</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Live</span>
              <button onClick={() => setLive(true)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #22c55e', backgroundColor: live ? '#22c55e' : 'transparent', color: live ? 'white' : '#22c55e', fontWeight: 700, cursor: 'pointer' }}>Start</button>
              <button onClick={() => setLive(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: live ? 'transparent' : '#e5e7eb', color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}>Stop</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>Target Temp</span>
              <input type="range" min={35} max={39} step={0.1} value={targetTemp} onChange={(e) => setTargetTemp(Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600 }}>{targetTemp.toFixed(1)} °C</span>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Historical Data</span>
              <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 700 }}>{live ? 'Live' : 'Paused'}</span>
            </div>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Temperature" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Humidity" stroke="#64748b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', ...flexCenter, justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
              MAKE : <b style={{ color: '#334155' }}>{currentEquipment?.make || 'N/A'}</b> | MODEL : <b style={{ color: '#334155' }}>{currentEquipment?.model || 'N/A'}</b>
            </span>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => {
                  if (currentEquipment) {
                    setFormData({
                      temperature: currentEquipment.temperature,
                      humidity: currentEquipment.humidity,
                      status: currentEquipment.status
                    });
                  }
                }}
                style={{ 
                  padding: '10px 32px', 
                  border: '1px solid #e5e7eb', 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#334155',
                  transition: '0.2s'
                }}>
                Clear
              </button>
              <button style={{ 
                padding: '10px 32px', 
                border: 'none', 
                backgroundColor: '#1e3a8a', 
                color: 'white', 
                borderRadius: '8px', 
                fontWeight: '600', 
                cursor: 'pointer',
                fontSize: '14px',
                transition: '0.2s'
              }}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      {view === 'list' ? <ListView /> : <DetailView />}
    </div>
  );
};

export default Equipment;
