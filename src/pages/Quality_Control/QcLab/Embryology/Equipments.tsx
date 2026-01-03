import React, { useState } from "react";
import { Filter, Plus } from "lucide-react";
import LFHForm from "./LFHForm"
import MicroscopesForm from "./MicroscopesForm";
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
 
// LFH Form Component

 <LFHForm />

// Ovens Water Bath Form Component
const OvensWaterBathForm = ({ selectedRadio, setSelectedRadio }) => {
  const [activeSubTab, setActiveSubTab] = useState("Ovens");

 
  const radioLabels = activeSubTab === "Ovens" 
    ? ["Oven A", "Oven B", "Oven C", "Oven D", "Oven E"]
    : ["Water Bath A", "Water Bath B", "Water Bath C", "Water Bath D", "Water Bath E"];

 
  const handleTabSwitch = (tab: string) => {
    setActiveSubTab(tab);
  
    setSelectedRadio(tab === "Ovens" ? "Oven A" : "Water Bath A");
  };

  const [formData, setFormData] = useState({
    temperatureConsistency: "",
    waterLevelMonitoring: "Sufficient",
    alarmFunctionality: "Functional",
    cleanlinessLog: "",
    status: "Pass",
    comments: "",
  });

  const handleClearForm = () => {
    setFormData({
      temperatureConsistency: "",
      waterLevelMonitoring: "Sufficient",
      alarmFunctionality: "Functional",
      cleanlinessLog: "",
      status: "Pass",
      comments: "",
    });
  };

  const activityData = [
    { day: "Monday", compliant: 34, nonCompliant: -33 },
    { day: "Tuesday", compliant: 28, nonCompliant: -0 },
    { day: "Wednesday", compliant: 26, nonCompliant: -12 },
    { day: "Thursday", compliant: 34, nonCompliant: -0 },
    { day: "Friday", compliant: 30, nonCompliant: -28 },
    { day: "Saturday", compliant: 16, nonCompliant: -33 },
    { day: "Sunday", compliant: 23, nonCompliant: -33 },
  ];

  const maxValue = 40;

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", maxWidth: "1200px" }}>

      {/* 1. Sub-Tabs Header Logic */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
        <button 
          onClick={() => handleTabSwitch("Ovens")}
          style={{ 
            padding: "8px 16px", 
            backgroundColor: "transparent", 
            border: "none", 
            borderBottom: activeSubTab === "Ovens" ? "2px solid #f97316" : "2px solid transparent", 
            fontSize: "13px", 
            fontWeight: "500", 
            color: activeSubTab === "Ovens" ? "#f97316" : "#94a3b8", 
            cursor: "pointer" 
          }}
        >
          Ovens
        </button>
        <button 
          onClick={() => handleTabSwitch("Water Bath")}
          style={{ 
            padding: "8px 16px", 
            backgroundColor: "transparent", 
            border: "none", 
            borderBottom: activeSubTab === "Water Bath" ? "2px solid #f97316" : "2px solid transparent", 
            fontSize: "13px", 
            fontWeight: "500", 
            color: activeSubTab === "Water Bath" ? "#f97316" : "#94a3b8", 
            cursor: "pointer" 
          }}
        >
          Water Bath
        </button>
      </div>

      {/* 2. Dynamic Radio Selection Row based on activeSubTab */}
      <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
        {radioLabels.map((name) => (
          <label key={name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", color: "#0f172a" }}>
            <input 
              type="radio" 
              name="equipment" 
              checked={selectedRadio === name} 
              onChange={() => setSelectedRadio(name)} 
              style={{ accentColor: "#f97316", width: "16px", height: "16px" }} 
            />
            {name}
          </label>
        ))}
      </div>

      {/* 3. Shared Form Layout for both tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div style={{ position: "relative" }}>
          <input type="text" placeholder="Type Here" value={formData.temperatureConsistency} onChange={(e) => setFormData({ ...formData, temperatureConsistency: e.target.value })} style={{ width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>
            {activeSubTab === "Ovens" ? "Temperature Consistency (°C)" : "Temperature Consistency (°C) "}
          </label>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Range: 37 °C For Embryo Culture</p>
        </div>

        <div style={{ position: "relative" }}>
          <select value={formData.waterLevelMonitoring} onChange={(e) => setFormData({ ...formData, waterLevelMonitoring: e.target.value })} style={{ width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
            <option>Sufficient</option>
            <option>Insufficient</option>
          </select>
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Water Level Monitoring</label>
        </div>

        <div style={{ position: "relative" }}>
          <select value={formData.alarmFunctionality} onChange={(e) => setFormData({ ...formData, alarmFunctionality: e.target.value })} style={{ width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
            <option>Functional</option>
            <option>Non-Functional</option>
          </select>
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Alarm Functionality</label>
        </div>

        <div style={{ position: "relative" }}>
          <input type="text" placeholder="Type Here" value={formData.cleanlinessLog} onChange={(e) => setFormData({ ...formData, cleanlinessLog: e.target.value })} style={{ width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Cleanliness & Decontamination Log</label>
        </div>

        <div style={{ position: "relative" }}>
          <input type="text" placeholder="Type Here" value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} style={{ width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Comments</label>
        </div>

        <div style={{ position: "relative" }}>
          <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
            <option>Pass</option>
            <option>Fail</option>
          </select>
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Status</label>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap", marginBottom: "30px" }}>
        <button onClick={handleClearForm} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", color: "#0f172a" }}>Clear</button>
        <button style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>Save</button>
      </div>

      {/* Shared Activity Chart Section */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#505050" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 style={{ fontSize: "14px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Activity</h3>
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#6c6c6c', borderRadius: '50%' }} />
              <span style={{ color: '#9e9e9e' }}>Compliant</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#EF9685', borderRadius: '50%' }} />
              <span style={{ color: '#9e9e9e' }}>Non - Compliant</span>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 300, backgroundColor: '#fff' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} stackOffset="sign" margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9e9e9e' }} axisLine={{ stroke: '#E0E0E0' }} tickLine={false} />
              <YAxis domain={[-40, 40]} ticks={[-40, -20, 0, 20, 40]} tick={{ fontSize: 12, fill: '#9e9e9e' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }} />
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={15} label={{ position: 'top', fill: '#9e9e9e', fontSize: 10 }} />
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={15} label={({ x, y, value, width }) => (
                <text x={x + width / 2} y={y + 14} fill="#EF9685" fontSize={10} textAnchor="middle">{value}</text>
              )} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ textAlign: 'center', marginTop: '8px', color: '#B1B1B1', fontSize: '12px' }}>Month</p>
      </div>

    </div>
  );
};
//Microscope From component
<MicroscopesForm />

const CryopreservationForm = ({ selectedRadio, setSelectedRadio }) => {
  const [formData, setFormData] = useState({
    liquidNitrogenLevels: "",
    temperature: "",
    backSystemFunctionality: "Functional",
    alarmStatus: "Functional",
    status: "Pass",
    comments: "",
  });

  const handleClearForm = () => {
    setFormData({
      liquidNitrogenLevels: "",
      temperature: "",
      backSystemFunctionality: "Functional",
      alarmStatus: "Functional",
      status: "Pass",
      comments: "",
    });
  };

  const activityData = [
    { day: "Monday", compliant: 34, nonCompliant: -33 },
    { day: "Tuesday", compliant: 28, nonCompliant: -0 },
    { day: "Wednesday", compliant: 22, nonCompliant: -38 },
    { day: "Thursday", compliant: 34, nonCompliant: -12 },
    { day: "Friday", compliant: 29, nonCompliant: -33 },
    { day: "Saturday", compliant: 15, nonCompliant: -33 },
    { day: "Sunday", compliant: 25, nonCompliant: -33 },
  ];

  const maxValue = 40;

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        padding: "24px",
        maxWidth: "1200px",
      }}
    >
      {/* Radio Buttons */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          paddingBottom: "24px",
          borderBottom: "1px solid #f1f5f9",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {["Cryo Tank A", "Cryo Tank B", "Cryo Tank C", "Cryo Tank D", "Cryo Tank E"].map((name) => (
          <label
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              color: "#0f172a",
            }}
          >
            <input
              type="radio"
              name="equipment"
              checked={selectedRadio === name}
              onChange={() => setSelectedRadio(name)}
              style={{
                accentColor: "#f97316",
                width: "16px",
                height: "16px",
              }}
            />
            {name}
          </label>
        ))}
      </div>

      {/* Form Fields */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Liquid Nitrogen Levels */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Type Here"
            value={formData.liquidNitrogenLevels}
            onChange={(e) =>
              setFormData({ ...formData, liquidNitrogenLevels: e.target.value })
            }
            style={{
              width:"290px", 
              height:"50px",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              color: "#0f172a",
              backgroundColor: "#fff",
            }}
          />
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Liquid Nitrogen Levels (mm)
          </label>
          <p
            style={{
              fontSize: "11px",
              color: "#64748b",
              margin: "4px 0 0 0",
            }}
          >
            Range: &gt;100
          </p>
        </div>

        {/* Temperature */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Type Here"
            value={formData.temperature}
            onChange={(e) =>
              setFormData({ ...formData, temperature: e.target.value })
            }
            style={{
              width:"290px", 
              height:"50px",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              color: "#0f172a",
              backgroundColor: "#fff",
            }}
          />
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Temperature (°C)
          </label>
          <p
            style={{
              fontSize: "11px",
              color: "#64748b",
              margin: "4px 0 0 0",
            }}
          >
            Range: -196 [-243]
          </p>
        </div>

        {/* Back System Functionality */}
        <div style={{ position: "relative" }}>
          <select
            value={formData.backSystemFunctionality}
            onChange={(e) =>
              setFormData({ ...formData, backSystemFunctionality: e.target.value })
            }
            style={{
              width:"290px", 
              height:"50px",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              backgroundColor: "#fff",
              color: "#0f172a",
            }}
          >
            <option>Functional</option>
            <option>Non-Functional</option>
          </select>
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Back System Functionality
          </label>
        </div>

        {/* Alarm Status */}
        <div style={{ position: "relative" }}>
          <select
            value={formData.alarmStatus}
            onChange={(e) =>
              setFormData({ ...formData, alarmStatus: e.target.value })
            }
            style={{
              width:"290px", 
              height:"50px",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              backgroundColor: "#fff",
              color: "#0f172a",
            }}
          >
            <option>Functional</option>
            <option>Non-Functional</option>
          </select>
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Alarm Status
          </label>
        </div>

        {/* Comments */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Type Here"
            value={formData.comments}
            onChange={(e) =>
              setFormData({ ...formData, comments: e.target.value })
            }
            style={{
              width:"290px", 
              height:"50px",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              color: "#0f172a",
              backgroundColor: "#fff",
            }}
          />
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Comments
          </label>
        </div>

        {/* Status */}
        <div style={{ position: "relative" }}>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            style={{
              width:"290px", 
              height:"50px",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              backgroundColor: "#fff",
              color: "#0f172a",
            }}
          >
            <option>Pass</option>
            <option>Fail</option>
          </select>
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Status
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleClearForm}
          style={{
            padding: "10px 24px",
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            color: "#0f172a",
            transition: "all 0.2s",
          }}
        >
          Clear
        </button>
        <button
          style={{
            padding: "10px 24px",
            backgroundColor: "#1e293b",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Save
        </button>
      </div>

      {/* Activity Chart */}
      <div style={{ marginBottom: "24px" }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#505050" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
      </div>
      <h3 style={{ fontSize: "14px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Activity</h3>
    </div>
    
    <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '10px', height: '10px', backgroundColor: '#6c6c6c', borderRadius: '50%' }} />
        <span style={{ color: '#9e9e9e' }}>Compliant</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '10px', height: '10px', backgroundColor: '#EF9685', borderRadius: '50%' }} />
        <span style={{ color: '#9e9e9e' }}>Non - Compliant</span>
      </div>
    </div>
  </div>

            {/* Activity Chart */}
             <div style={{ width: '100%', height: 300, backgroundColor: '#fff' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={activityData} 
                stackOffset="sign" 
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: '#9e9e9e' }}
                  axisLine={{ stroke: '#E0E0E0' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[-40, 40]}
                  ticks={[-40, -20, 0, 20, 40]}
                  tick={{ fontSize: 12, fill: '#9e9e9e' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }} 
                />
                
                {/* Horizontal Grid/Reference Lines */}
                <ReferenceLine y={0} stroke="#E0E0E0" />
                <ReferenceLine y={20} stroke="#F1F1F1" />
                <ReferenceLine y={40} stroke="#F1F1F1" />
                <ReferenceLine y={-20} stroke="#F1F1F1" />
                <ReferenceLine y={-40} stroke="#F1F1F1" />
        
                <Bar 
                  dataKey="compliant" 
                  fill="#6c6c6c" 
                  radius={[4, 4, 0, 0]} 
                  barSize={15} 
                  label={{ position: 'top', fill: '#9e9e9e', fontSize: 10 }} 
                />
                <Bar 
                  dataKey="nonCompliant" 
                  fill="#EF9685" 
                  radius={[0, 0, 4, 4]} 
                  barSize={15} 
                  label={({ x, y, value, width }) => (
                    <text x={x + width / 2} y={y + 14} fill="#EF9685" fontSize={10} textAnchor="middle">
                      {value}
                    </text>
                  )} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ textAlign: 'center', marginTop: '8px', color: '#B1B1B1', fontSize: '12px' }}>Month</p>
        
        
      </div>
    </div>
  );
}; 

//Ph Meters Component
 
const PHMetersForm = ({ selectedRadio, setSelectedRadio }) => {
  const [formData, setFormData] = useState({
    calibrationChecks: "Accurate",
    electrodeCondition: "Clean",
    temperatureCompensation: "Functional",
    status: "Pass",
    comments: "",
  });

  const handleClearForm = () => {
    setFormData({
      calibrationChecks: "Accurate",
      electrodeCondition: "Clean",
      temperatureCompensation: "Functional",
      status: "Pass",
      comments: "",
    });
  };

  const activityData = [
    { day: "Monday", compliant: 24, nonCompliant: -33 },
    { day: "Tuesday", compliant: 28, nonCompliant: -23 },
    { day: "Wednesday", compliant: 22, nonCompliant: -38 },
    { day: "Thursday", compliant: 34, nonCompliant: -12 },
    { day: "Friday", compliant: 28, nonCompliant: -33 },
    { day: "Saturday", compliant: 15, nonCompliant: -10 },
    { day: "Sunday", compliant: 25, nonCompliant: -33 },
  ];

  const maxValue = 40;

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        padding: "24px",
        maxWidth: "1200px",
      }}
    >
      {/* Radio Buttons */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          paddingBottom: "24px",
          borderBottom: "1px solid #f1f5f9",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {["pH Meters A", "pH Meters B", "pH Meters C", "pH Meters D", "pH Meters E"].map((name) => (
          <label
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              color: "#0f172a",
            }}
          >
            <input
              type="radio"
              name="equipment"
              checked={selectedRadio === name}
              onChange={() => setSelectedRadio(name)}
              style={{
                accentColor: "#f97316",
                width: "16px",
                height: "16px",
              }}
            />
            {name}
          </label>
        ))}
      </div>

      {/* Form Fields */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Calibration Checks */}
        <div style={{ position: "relative" }}>
          <select
            value={formData.calibrationChecks}
            onChange={(e) =>
              setFormData({ ...formData, calibrationChecks: e.target.value })
            }
            style={{
              width:"290px", 
              height:"50px",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              backgroundColor: "#fff",
              color: "#0f172a",
            }}
          >
            <option>Accurate</option>
            <option>Needs Calibration</option>
          </select>
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Calibration Checks
          </label>
        </div>

        {/* Electrode Condition */}
        <div style={{ position: "relative" }}>
          <select
            value={formData.electrodeCondition}
            onChange={(e) =>
              setFormData({ ...formData, electrodeCondition: e.target.value })
            }
            style={{
               width:"290px", 
              height:"50px",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              backgroundColor: "#fff",
              color: "#0f172a",
            }}
          >
            <option>Clean</option>
            <option>Dirty</option>
            <option>Needs Replacement</option>
          </select>
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Electrode Condition
          </label>
        </div>

        {/* Temperature Compensation Verification */}
        <div style={{ position: "relative" }}>
          <select
            value={formData.temperatureCompensation}
            onChange={(e) =>
              setFormData({ ...formData, temperatureCompensation: e.target.value })
            }
            style={{
            width:"290px", 
              height:"50px",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              backgroundColor: "#fff",
              color: "#0f172a",
            }}
          >
            <option>Functional</option>
            <option>Non-Functional</option>
          </select>
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Temperature Compensation Verification
          </label>
        </div>

        {/* Comments */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Type Here"
            value={formData.comments}
            onChange={(e) =>
              setFormData({ ...formData, comments: e.target.value })
            }
            style={{
              width:"290px", 
              height:"50px",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              color: "#0f172a",
              backgroundColor: "#fff",
            }}
          />
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Comments
          </label>
        </div>

        {/* Status */}
        <div style={{ position: "relative" }}>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            style={{
               width:"290px", 
              height:"50px",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              backgroundColor: "#fff",
              color: "#0f172a",
            }}
          >
            <option>Pass</option>
            <option>Fail</option>
          </select>
          <label
            style={{
              position: "absolute",
              left: "12px",
              top: "-8px",
              backgroundColor: "#fff",
              padding: "0 4px",
              fontSize: "12px",
              fontWeight: "500",
              color: "#64748b",
            }}
          >
            Status
          </label>
        </div>
      </div>

            {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleClearForm}
          style={{
            padding: "10px 24px",
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            color: "#0f172a",
            transition: "all 0.2s",
          }}
        >
          Clear
        </button>
        <button
          style={{
            padding: "10px 24px",
            backgroundColor: "#1e293b",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Save
        </button>
      </div>

         {/* Activity Chart */}
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#505050" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
      </div>
      <h3 style={{ fontSize: "14px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Activity</h3>
    </div>
    
    <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '10px', height: '10px', backgroundColor: '#6c6c6c', borderRadius: '50%' }} />
        <span style={{ color: '#9e9e9e' }}>Compliant</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '10px', height: '10px', backgroundColor: '#EF9685', borderRadius: '50%' }} />
        <span style={{ color: '#9e9e9e' }}>Non - Compliant</span>
      </div>
    </div>
  </div>
          <div style={{ width: '100%', height: 300, backgroundColor: '#fff' }}>
         <ResponsiveContainer width="100%" height="100%">
           <BarChart 
             data={activityData} 
             stackOffset="sign" 
             margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
           >
             <XAxis
               dataKey="day"
               tick={{ fontSize: 12, fill: '#9e9e9e' }}
               axisLine={{ stroke: '#E0E0E0' }}
               tickLine={false}
             />
             <YAxis
               domain={[-40, 40]}
               ticks={[-40, -20, 0, 20, 40]}
               tick={{ fontSize: 12, fill: '#9e9e9e' }}
               axisLine={false}
               tickLine={false}
             />
             <Tooltip 
               cursor={{ fill: 'transparent' }} 
               contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }} 
             />
             
             {/* Horizontal Grid/Reference Lines */}
             <ReferenceLine y={0} stroke="#E0E0E0" />
             <ReferenceLine y={20} stroke="#F1F1F1" />
             <ReferenceLine y={40} stroke="#F1F1F1" />
             <ReferenceLine y={-20} stroke="#F1F1F1" />
             <ReferenceLine y={-40} stroke="#F1F1F1" />
     
             <Bar 
               dataKey="compliant" 
               fill="#6c6c6c" 
               radius={[4, 4, 0, 0]} 
               barSize={15} 
               label={{ position: 'top', fill: '#9e9e9e', fontSize: 10 }} 
             />
             <Bar 
               dataKey="nonCompliant" 
               fill="#EF9685" 
               radius={[0, 0, 4, 4]} 
               barSize={15} 
               label={({ x, y, value, width }) => (
                 <text x={x + width / 2} y={y + 14} fill="#EF9685" fontSize={10} textAnchor="middle">
                   {value}
                 </text>
               )} 
             />
           </BarChart>
         </ResponsiveContainer>
       </div>
       <p style={{ textAlign: 'center', marginTop: '8px', color: '#B1B1B1', fontSize: '12px' }}>Month</p>
     
     


    </div>
  );
};

// Incubator Form Component  
const IncubatorForm = ({ selectedRadio, setSelectedRadio, formData, setFormData, handleClearForm }) => {
  const activityData = [
    { month: "02", compliant: 34, nonCompliant: -23 },
    { month: "34", compliant: 28, nonCompliant: -22 },
    { month: "06", compliant: 22, nonCompliant: 0 },
    { month: "34", compliant: 34, nonCompliant: -12 },
    { month: "29", compliant: 29, nonCompliant: -28 },
    { month: "15", compliant: 15, nonCompliant: -32 },
    { month: "28", compliant: 28, nonCompliant: -25 },
  ];

  const maxValue = 40;

  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", maxWidth: "1200px" }}>
      <div style={{ display: "flex", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9", marginBottom: "24px", flexWrap: "wrap" }}>
        {["Incubator A", "Incubator B", "Incubator C", "Incubator D", "Incubator E"].map((name) => (
          <label key={name} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", color: "#0f172a" }}>
            <input type="radio" name="equipment" checked={selectedRadio === name} onChange={() => setSelectedRadio(name)} style={{ accentColor: "#f97316", width: "16px", height: "16px" }} />
            {name}
          </label>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div style={{ position: "relative" }}>
          <input type="text" placeholder=" " value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} style={{ width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #fecaca", backgroundColor: "#fef2f2", borderRadius: "8px", fontSize: "14px", color: "#dc2626", outline: "none" }} />
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fef2f2", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Temperature (°C)</label>
          <p style={{ fontSize: "11px", color: "#dc2626", margin: "4px 0 0 0" }}>Recommended: 36.5°C - ... | <span style={{ color: "#f97316" }}>Range: 36.5 °C - 37.3 °C</span></p>
        </div>

        <div style={{ position: "relative" }}>
          <input type="text" placeholder=" " value={formData.co2Concentration} onChange={(e) => setFormData({ ...formData, co2Concentration: e.target.value })} style={{ width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>CO2 Concentration (%)</label>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Range: 5% - 6%</p>
        </div>

        <div style={{ position: "relative" }}>
          <input type="text" placeholder=" " value={formData.humidity} onChange={(e) => setFormData({ ...formData, humidity: e.target.value })} style={{ width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #fef3c7", backgroundColor: "#fffbeb", borderRadius: "8px", fontSize: "14px", color: "#d97706", outline: "none" }} />
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fffbeb", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Humidity Levels (%)</label>
          <p style={{ fontSize: "11px", color: "#d97706", margin: "4px 0 0 0" }}>Range: 30% - 60%</p>
        </div>

        <div style={{ position: "relative" }}>
          <input type="text" placeholder=" " value={formData.alarmResponseTime} onChange={(e) => setFormData({ ...formData, alarmResponseTime: e.target.value })} style={{width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Alarm Response Time (Mins)</label>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Range: &lt; 5</p>
        </div>

        <div style={{ position: "relative" }}>
          <input type="text" placeholder=" " value={formData.gasMixture} onChange={(e) => setFormData({ ...formData, gasMixture: e.target.value })} style={{ width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Gas Mixture (% O2, CO2)</label>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "4px 0 0 0" }}>Range: O2 &gt; 20; CO2: 5</p>
        </div>

        <div style={{ position: "relative" }}>
          <select value={formData.alarmStatus} onChange={(e) => setFormData({ ...formData, alarmStatus: e.target.value })} style={{ width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
            <option>Functional</option>
            <option>Non-Functional</option>
          </select>
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Alarm Status</label>
        </div>

        <div style={{ position: "relative" }}>
          <input type="text" placeholder=" " value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} style={{ width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", color: "#0f172a", backgroundColor: "#fff" }} />
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Comments</label>
        </div>

        <div style={{ position: "relative" }}>
          <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width:"290px", height:"50px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", cursor: "pointer", backgroundColor: "#fff", color: "#0f172a" }}>
            <option>Pass</option>
            <option>Fail</option>
          </select>
          <label style={{ position: "absolute", left: "12px", top: "-8px", backgroundColor: "#fff", padding: "0 4px", fontSize: "12px", fontWeight: "500", color: "#64748b" }}>Status</label>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "32px", paddingTop: "16px", borderTop: "1px solid #f1f5f9", marginBottom: "32px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "13px", color: "#64748b" }}>Make : <strong style={{ color: "#0f172a" }}>Lorem Ipsum</strong></span>
        <span style={{ fontSize: "13px", color: "#64748b" }}>Model : <strong style={{ color: "#0f172a" }}>Lorem Ipsum</strong></span>
      </div>
     {/* Button for clear and save*/ }
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", flexWrap: "wrap", marginBottom:"10px" }}>
        <button onClick={handleClearForm} style={{ padding: "10px 24px", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", color: "#0f172a", transition: "all 0.2s" }}>Clear</button>
        <button style={{ padding: "10px 24px", backgroundColor: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s" }}>Save</button>
      </div>
      
      {/*Charts*/}
      <div style={{ marginBottom: "24px" }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#505050" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
      </div>
      <h3 style={{ fontSize: "14px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Activity</h3>
    </div>
    
    <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '10px', height: '10px', backgroundColor: '#6c6c6c', borderRadius: '50%' }} />
        <span style={{ color: '#9e9e9e' }}>Compliant</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '10px', height: '10px', backgroundColor: '#EF9685', borderRadius: '50%' }} />
        <span style={{ color: '#9e9e9e' }}>Non - Compliant</span>
      </div>
    </div>
  </div>
  {/* Recharts Container */}
  <div style={{ width: '100%', height: 300, backgroundColor: '#fff' }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={activityData} 
        stackOffset="sign" 
        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
      >
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12, fill: '#9e9e9e' }}
          axisLine={{ stroke: '#E0E0E0' }}
          tickLine={false}
        />
        <YAxis
          domain={[-40, 40]}
          ticks={[-40, -20, 0, 20, 40]}
          tick={{ fontSize: 12, fill: '#9e9e9e' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          cursor={{ fill: 'transparent' }} 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }} 
        />
        
        {/* Horizontal Grid/Reference Lines */}
        <ReferenceLine y={0} stroke="#E0E0E0" />
        <ReferenceLine y={20} stroke="#F1F1F1" />
        <ReferenceLine y={40} stroke="#F1F1F1" />
        <ReferenceLine y={-20} stroke="#F1F1F1" />
        <ReferenceLine y={-40} stroke="#F1F1F1" />

        <Bar 
          dataKey="compliant" 
          fill="#6c6c6c" 
          radius={[4, 4, 0, 0]} 
          barSize={15} 
          label={{ position: 'top', fill: '#9e9e9e', fontSize: 10 }} 
        />
        <Bar 
          dataKey="nonCompliant" 
          fill="#EF9685" 
          radius={[0, 0, 4, 4]} 
          barSize={15} 
          label={({ x, y, value, width }) => (
            <text x={x + width / 2} y={y + 14} fill="#EF9685" fontSize={10} textAnchor="middle">
              {value}
            </text>
          )} 
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
  <p style={{ textAlign: 'center', marginTop: '8px', color: '#B1B1B1', fontSize: '12px' }}>Month</p>
      </div>
    </div>
  );
};

// Main Equipment Component
const Equipment = () => {
  const [view, setView] = useState("list");
  const [selectedEquipment, setSelectedEquipment] = useState("Incubator B");
  const [selectedRadio, setSelectedRadio] = useState("Incubator B");
  const [activeTab, setActiveTab] = useState("To-Do");
  const [equipmentType, setEquipmentType] = useState("incubator");
  

  const [formData, setFormData] = useState({
    temperature: "",
    co2Concentration: "",
    humidity: "",
    alarmResponseTime: "",
    gasMixture: "",
    alarmStatus: "Functional",
    comments: "",
    status: "Pass",
  });

  const handleClearForm = () => {
    setFormData({
      temperature: "",
      co2Concentration: "",
      humidity: "",
      alarmResponseTime: "",
      gasMixture: "",
      alarmStatus: "Functional",
      comments: "",
      status: "Pass",
    });
  };

const determineEquipmentType = (name: string) => {
  if (name.includes("Incubator")) return "incubator";
  if (name.includes("LFH")) return "lfh";
  if (name.includes("Ovens") || name.includes("Water Bath")) return "ovens";
  if (name.includes("Microscope")) return "microscopes";
  if (name.includes("pH Meter")) return "ph";
  if (name.includes("Cryopreservation") || name.includes("LN2")) return "cryopreservation";
  return "other";
};

  
  const equipmentList = [
    { name: "Incubator B", params: "08/08", progress: "100%", tags: [{ text: "Temp - 38.5 °C", color: "#ef4444" }, { text: "Humidity - 20%", color: "#eab308" }] },
    { name: "LFH 02", params: "08/08", progress: "100%", tags: [{ text: "Temp - 38.5 °C", color: "#ef4444" }] },
    { name: "Ovens And Water Baths", params: "08/08", progress: "100%", tags: [{ text: "Temp - 38.5 °C", color: "#ef4444" }] },
    { name: "Microscopes", params: "05/08", progress: "38%", tags: [{ text: "Humidity - 20%", color: "#eab308" }] },
    { name: "pH Meters", params: "05/08", progress: "86%", tags: [{ text: "Temp - 38.5 °C", color: "#ef4444" }] },
    { name: "Cryopreservation Tanks (LN2)", params: "05/08", progress: "86%", tags: [{ text: "Temp - 38.5 °C", color: "#ef4444" }] },
  ];

  const assignees = ["https://i.pravatar.cc/150?img=1", "https://i.pravatar.cc/150?img=2", "https://i.pravatar.cc/150?img=3"];

  const incubatorCards = [
    { name: "Incubator A", params: "08/08", progress: "100%", tags: [] },
    { name: "Incubator B", params: "08/08", progress: "100%", tags: [] },
    { name: "Incubator C", params: "08/08", progress: "100%", tags: [{ text: "Humidity - 30%", color: "#eab308" }] },
    { name: "Incubator D", params: "08/08", progress: "100%", tags: [] },
    { name: "Incubator E", params: "08/08", progress: "100%", tags: [] },
  ];

  const lfhCards = [
    { name: "LFH 01", params: "08/08", progress: "100%", tags: [] },
    { name: "LFH 02", params: "08/08", progress: "100%", tags: [] },
    { name: "LFH 03", params: "08/08", progress: "100%", tags: [{ text: "Temp - 38.5 °C", color: "#ef4444" }] },
    { name: "LFH 04", params: "08/08", progress: "100%", tags: [] },
  ];

  if (view === "list") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "24px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "32px", gap: "24px" }}>
  {/* Heading */}
  <h1 style={{ fontSize: "20px", fontWeight: "600", margin: 0, color: "#0f172a" }}>Equipments</h1>
  
  {/* Tab Container sitting directly next to heading */}
  <div 
    style={{ 
      display: "inline-flex", 
      backgroundColor: "#F2F2F2", // Gray background for the pill container
      padding: "4px", 
      borderRadius: "12px", 
      gap: "4px" 
    }}
  >
    <button 
      onClick={() => setActiveTab("To-Do")} 
      style={{ 
        padding: "8px 24px", 
        borderRadius: "10px", 
        border: "none", 
        cursor: "pointer", 
        fontSize: "14px", 
        fontWeight: "600", 
        backgroundColor: activeTab === "To-Do" ? "#FFFFFF" : "transparent", 
        color: activeTab === "To-Do" ? "#E17E61" : "#94a3b8", // Salmon orange for active
        boxShadow: activeTab === "To-Do" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
        transition: "all 0.2s ease-in-out"
      }}
    >
      To-Do
    </button>
    <button 
      onClick={() => setActiveTab("Plan")} 
      style={{ 
        padding: "8px 24px", 
        borderRadius: "10px", 
        border: "none", 
        cursor: "pointer", 
        fontSize: "14px", 
        fontWeight: "600", 
        backgroundColor: activeTab === "Plan" ? "#FFFFFF" : "transparent", 
        color: activeTab === "Plan" ? "#E17E61" : "#94a3b8",
        boxShadow: activeTab === "Plan" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
        transition: "all 0.2s ease-in-out"
      }}
    >
      Plan
    </button>
  </div>

  {/* Filter icon stays at the very end of the row if you want, or right next to tabs */}
  <div style={{ marginLeft: "auto" }}>
    <Filter size={20} color="#94a3b8" style={{ cursor: "pointer" }} />
  </div>
</div>

        <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#0f172a" }}>Incubator</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(487px, 1fr))", gap: "16px", marginBottom: "32px", fontSize: "14px", fontWeight: 700 }}>
          {incubatorCards.map((item) => (
            <div key={item.name} onClick={() => { setSelectedEquipment(item.name); setSelectedRadio(item.name); setEquipmentType(determineEquipmentType(item.name)); setView("detail"); }} style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", cursor: "pointer", transition: "box-shadow 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)")} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "500", color: "#0f172a" }}>{item.name}</span>
                  <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>: Parameters : {item.params}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Assignees:</span>
                  <div style={{ display: "flex", marginLeft: "-4px" }}>
                    {assignees.map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid white", marginLeft: i > 0 ? "-8px" : 0 }} />
                    ))}
                  </div>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Plus size={16} color="#64748b" />
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "#22c55e", fontWeight: "600" }}>
                {item.progress}
                {item.tags.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                    {item.tags.map((tag, i) => (
                      <span key={i} style={{ backgroundColor: tag.color, color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: "500" }}>{tag.text}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#0f172a" }}>Laminar Flow Hoods</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(487px, 1fr))", gap: "16px", fontSize: "14px" }}>
          {lfhCards.map((item) => (
            <div key={item.name} onClick={() => { setSelectedEquipment(item.name); setSelectedRadio(item.name); setEquipmentType(determineEquipmentType(item.name)); setView("detail"); }} style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", cursor: "pointer", transition: "box-shadow 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)")} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>{item.name}</span>
                  <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>: Parameters : {item.params}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Assignees:</span>
                  <div style={{ display: "flex", marginLeft: "-4px" }}>
                    {assignees.map((img, i) => (
                      <img key={i} src={img} alt="" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid white", marginLeft: i > 0 ? "-8px" : 0 }} />
                    ))}
                  </div>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <Plus size={16} color="#64748b" />
                  </div>
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "#22c55e", fontWeight: "600", marginBottom: "8px" }}>{item.progress}</div>
              {item.tags.length > 0 && (
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {item.tags.map((tag, i) => (
                    <span key={i} style={{ backgroundColor: tag.color, color: "#fff", padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: "500" }}>{tag.text}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Detail View
  
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* LEFT SIDEBAR SECTION */}
      <div
        style={{
          width: "340px",
          backgroundColor: "#fff",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* TOP NAVIGATION BAR */}
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setView("list")}
            style={{ background: "none", border: "none", fontSize: "14px", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "#0f172a" }}
          >
            ← Equipments
          </button>
          <Filter size={18} color="#94a3b8" style={{ cursor: "pointer" }} />
        </div>

        {/* TO-DO AND PLAN TABS */}
        <div style={{ display: "flex", padding: "10px 16px", backgroundColor: "#FAFAFA", margin: "12px 16px", borderRadius: "10px", gap: "6px" }}>
          <button 
            onClick={() => setActiveTab("To-Do")} 
            style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, backgroundColor: activeTab === "To-Do" ? "#FFFFFF" : "transparent", color: activeTab === "To-Do" ? "#E17E61" : "#232323", boxShadow: activeTab === "To-Do" ? "0 2px 4px rgba(0,0,0,0.1)" : "none" }}
          >
            To-Do
          </button>
          <button 
            onClick={() => setActiveTab("Plan")} 
            style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, backgroundColor: activeTab === "Plan" ? "#FFFFFF" : "transparent", color: activeTab === "Plan" ? "#E17E61" : "#232323", boxShadow: activeTab === "Plan" ? "0 2px 4px rgba(0,0,0,0.1)" : "none" }}
          >
            Plan
          </button>
        </div>

        {/* SIDEBAR CONTENT */}
        <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
          {activeTab === "To-Do" ? (
            equipmentList.map((item) => (
              <div
                key={item.name}
                onClick={() => {
                  setSelectedEquipment(item.name);
                  setEquipmentType(determineEquipmentType(item.name));
                  setSelectedRadio(item.name);
                }}
                style={{
                  padding: "12px", marginBottom: "12px", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s",
                  backgroundColor: selectedEquipment === item.name ? "#fef3f2" : "#fff",
                  border: selectedEquipment === item.name ? "2px solid #f97316" : "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                    {item.name} : <span style={{ color: "#64748b", fontWeight: "400" }}>{item.params}</span>
                  </span>
                  <div style={{ display: "flex", marginLeft: "-4px" }}>
                    {assignees.slice(0, 3).map((img, i) => (
                      <img key={i} src={img} style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid white", marginLeft: i > 0 ? "-6px" : 0 }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: "600" }}>{item.progress}</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {item.tags.map((tag, i) => (
                      <span key={i} style={{ backgroundColor: tag.color, color: "#fff", padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "500" }}>{tag.text}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", marginTop: "40px", color: "#94a3b8", fontSize: "14px" }}>No items planned</div>
          )}
        </div>
      </div>

      {/* RIGHT MAIN CONTENT SECTION */}
      <div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        {activeTab === "To-Do" ? (
          // ONLY DISPLAY FORMS IF "TO-DO" IS ACTIVE
          <>
            {equipmentType === "incubator" && (
              <IncubatorForm 
                selectedRadio={selectedRadio} 
                setSelectedRadio={setSelectedRadio} 
                formData={formData} 
                setFormData={setFormData} 
                handleClearForm={handleClearForm} 
              />
            )}

            {equipmentType === "lfh" && (
              <LFHForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />
            )}

            {equipmentType === "ovens" && (
              <OvensWaterBathForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />
            )}

            {equipmentType === "microscopes" && (
              <MicroscopesForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />
            )}

            {equipmentType === "ph" && (
              <PHMetersForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />
            )}

            {equipmentType === "cryopreservation" && (
              <CryopreservationForm selectedRadio={selectedRadio} setSelectedRadio={setSelectedRadio} />
            )}
          </>
        ) : (
          // EMPTY STATE FOR "PLAN" TAB (Matches Image 12)
          <div style={{ 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            backgroundColor: "#fff", 
            borderRadius: "12px", 
            border: "1px solid #e5e7eb",
            color: "#94a3b8",
            fontSize: "16px"
          }}>
            <p>Select the To-Do tab to record equipment parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
    
};

export default Equipment;