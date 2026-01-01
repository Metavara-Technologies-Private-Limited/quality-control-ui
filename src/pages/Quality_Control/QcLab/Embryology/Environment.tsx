import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

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
    { day: 'Mon', compliant: 34, nonCompliant: -23 },
    { day: 'Tue', compliant: 28, nonCompliant: -22 },
    { day: 'Wed', compliant: 22, nonCompliant: -36 },
    { day: 'Thu', compliant: 36, nonCompliant: -12 },
    { day: 'Fri', compliant: 29, nonCompliant: -28 },
    { day: 'Sat', compliant: 15, nonCompliant: -33 },
    { day: 'Sun', compliant: 25, nonCompliant: -25 },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    <div style={{ padding: '1px', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

        {/* LEFT SECTION */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #EEEEEE',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '14px' }}>
              Environmental Parameters
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Temperature (°C)', name: 'temperature' },
                { label: 'Humidity Levels (%)', name: 'humidity' },
                { label: 'Air Quality', name: 'airQuality' },
                { label: 'Gas Mixture (% O2, CO2)', name: 'gasMeasure' },
                { label: 'Lighting Condition (Lux)', name: 'lightCondition' },
                { label: 'Noise Levels (DB)', name: 'noiseLevel' },
              ].map(item => (
                <div key={item.name}>
                  <fieldset style={{ border: '1px solid #d1d5db', borderRadius: 12 }}>
                    <legend style={{ padding: '0 8px', fontSize: 14 }}>
                      {item.label}
                    </legend>
                    <input
                      name={item.name}
                      value={(formData as any)[item.name]}
                      onChange={handleChange}
                      placeholder="Type Here"
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        fontSize: 16,
                        padding: 8,
                      }}
                    />
                  </fieldset>
                </div>
              ))}

              {/* COMMENTS + STATUS */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 16 }}>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  placeholder="Comments"
                  style={{ flex: 1, padding: 8 }}
                />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                >
                  <option>Within Range</option>
                  <option>Out of Range</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button onClick={handleClear}>Clear</button>
            <button onClick={handleSave}>Save</button>
          </div>
        </div>

        {/* RIGHT SECTION - CHART */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #EEEEEE',
            minHeight: '100vh',
          }}
        >
          <h3>Activity</h3>

          {/* SEPARATOR */}
          <div
            style={{
              width: 'calc(100% + 40px)',
              height: 1,
              backgroundColor: '#E0E0E0',
              margin: '12px -20px',
            }}
          />

          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={activityData} stackOffset="sign">
              <XAxis
                dataKey="day"
                axisLine={{ stroke: '#E0E0E0' }}
                tickLine={{ stroke: '#E0E0E0' }}
              />
              <YAxis
                domain={[-40, 40]}
                ticks={[-40, -30, -20, -10, 0, 10, 20, 30, 40]}
                axisLine={{ stroke: '#E0E0E0' }}
                tickLine={{ stroke: '#E0E0E0' }}
              />
              <Tooltip />

              {[0, 10, 20, 30, 40, -10, -20, -30, -40].map(v => (
                <ReferenceLine key={v} y={v} stroke="#E0E0E0" />
              ))}

              <Bar
                dataKey="compliant"
                fill="#6c6c6c"
                barSize={15}
                label={{ position: 'top', fontSize: 11 }}
              />
              <Bar
                dataKey="nonCompliant"
                fill="#EF9685"
                barSize={15}
                label={({ x, y, width, value }) => (
                  <text
                    x={x + width / 2}
                    y={y + 14}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#EF9685"
                  >
                    {value}
                  </text>
                )}
              />
            </BarChart>
          </ResponsiveContainer>

          <p style={{ textAlign: 'center', marginTop: 16 }}>Month</p>
        </div>
      </div>
    </div>
  );
};

export default Environment;
