import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Environment = () => {
  const [formData, setFormData] = useState({
    temperature: '',
    humidity: '',
    airQuality: '',
    gasMeasure: '',
    lightCondition: '',
    noiseLevel: '',
    comments: '',
    status: 'Within Range',
  });

  const activityData = [
    { day: 'Mon', compliant: 34, nonCompliant: 23 },
    { day: 'Tue', compliant: 28, nonCompliant: 22 },
    { day: 'Wed', compliant: 21, nonCompliant: 36 },
    { day: 'Thu', compliant: 36, nonCompliant: 12 },
    { day: 'Fri', compliant: 29, nonCompliant: 29 },
    { day: 'Sat', compliant: 15, nonCompliant: 35 },
    { day: 'Sun', compliant: 23, nonCompliant: 28 },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setFormData({
      temperature: '',
      humidity: '',
      airQuality: '',
      gasMeasure: '',
      lightCondition: '',
      noiseLevel: '',
      comments: '',
      status: 'Within Range',
    });
  };

  const handleSave = () => {
    console.log('Saved:', formData);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <h2 style={{ fontWeight: 600, marginBottom: '24px', fontSize: '20px' }}>
        Environmental Parameters
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Section - Parameters */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Temperature */}
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Temperature (°C)
              </label>
              <input
                type="text"
                placeholder="Type Here"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Range: 16.5°C - 23.5°C
              </p>
            </div>

            {/* Humidity Levels */}
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Humidity Levels (%)
              </label>
              <input
                type="text"
                placeholder="Type Here"
                name="humidity"
                value={formData.humidity}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Range: 30% - 60%
              </p>
            </div>

            {/* Air Quality */}
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Air Quality
              </label>
              <input
                type="text"
                placeholder="Type Here"
                name="airQuality"
                value={formData.airQuality}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Range: &gt; 100 Particles /M
              </p>
            </div>

            {/* Gas Measure */}
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Gas Mixture (% O2, CO2)
              </label>
              <input
                type="text"
                placeholder="Type Here"
                name="gasMeasure"
                value={formData.gasMeasure}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Range: 02 - 20 CO2 - 5
              </p>
            </div>

            {/* Lighting Condition */}
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Lighting Condition (Lux)
              </label>
              <input
                type="text"
                placeholder="Type Here"
                name="lightCondition"
                value={formData.lightCondition}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Range: 300-500 For Embryo Culture
              </p>
            </div>

            {/* Noise Level */}
            <div>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Noise Levels (dB)
              </label>
              <input
                type="text"
                placeholder="Type Here"
                name="noiseLevel"
                value={formData.noiseLevel}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Range: &lt; 5
              </p>
            </div>

            {/* Comments */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Comments
              </label>
              <textarea
                placeholder="Type Here"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="3"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Status */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="Within Range">Within Range</option>
                <option value="Out of Range">Out of Range</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Buttons */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={handleClear}
                style={{
                  padding: '8px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px',
                }}
              >
                Clear
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '8px 24px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#4b5563',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '14px',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Activity Chart */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 600, fontSize: '16px', margin: 0 }}>Activity</h3>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#4b5563', borderRadius: '2px' }} />
                <span style={{ fontSize: '12px' }}>Compliant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }} />
                <span style={{ fontSize: '12px' }}>Non - Compliant</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                }}
              />
              <Bar dataKey="compliant" stackId="a" fill="#6c6c6c" />
              <Bar dataKey="nonCompliant" stackId="a" fill="#EF9685" />
            </BarChart>
          </ResponsiveContainer>

          <p style={{ textAlign: 'center', marginTop: '16px', color: '#6b7280', fontSize: '12px' }}>
            Month
          </p>
        </div>
      </div>
    </div>
  );
};

export default Environment;