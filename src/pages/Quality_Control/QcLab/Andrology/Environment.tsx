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

  // Data rectified for the chart: Non-compliant values are negative to go down
  const activityData = [
    { day: 'Mon', compliant: 34, nonCompliant: -23 },
    { day: 'Tue', compliant: 28, nonCompliant: -22 },
    { day: 'Wed', compliant: 22, nonCompliant: -36 },
    { day: 'Thu', compliant: 36, nonCompliant: -12 },
    { day: 'Fri', compliant: 29, nonCompliant: -28 },
    { day: 'Sat', compliant: 15, nonCompliant: -33 },
    { day: 'Sun', compliant: 25, nonCompliant: -25 },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    <div style={{ padding: '1px', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Section - Parameters (Kept exactly as original) */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid #EEEEEE',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
          }}
        >
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '14px' }}>
              Environmental Parameters
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              
              {/* Temperature */}
              <div style={{ marginBottom: '16px' }}>
                <fieldset style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '0px 12px 8px 12px', margin: 0 }}>
                  <legend style={{ padding: '0 8px', fontSize: '14px', fontWeight: 400, color: '#232323', marginLeft: '12px' }}>
                    Temperature (&deg;C)
                  </legend>
                  <input type="text" placeholder="Type Here" name="temperature" value={formData.temperature} onChange={handleChange}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 500, color: '#9e9e9e', padding: '8px 0', backgroundColor: 'transparent' }}
                  />
                </fieldset>
                <p style={{ fontSize: '14px', color: '#9e9e9e', marginTop: '8px', marginLeft: '4px' }}>Range : 36.5 &deg;C - 37.5 &deg;C</p>
              </div>

              {/* Humidity */}
              <div style={{ marginBottom: '16px' }}>
                <fieldset style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '0px 12px 8px 12px', margin: 0 }}>
                  <legend style={{ padding: '0 8px', fontSize: '14px', fontWeight: 400, color: '#232323', marginLeft: '12px' }}>
                    Humidity Levels (%)
                  </legend>
                  <input type="text" placeholder="Type Here" name="humidity" value={formData.humidity} onChange={handleChange}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 500, color: '#9e9e9e', padding: '8px 0', backgroundColor: 'transparent' }}
                  />
                </fieldset>
                <p style={{ fontSize: '14px', color: '#9e9e9e', marginTop: '8px', marginLeft: '4px' }}>Range : 30% - 60%</p>
              </div>

              {/* Air Quality */}
              <div style={{ marginBottom: '16px' }}>
                <fieldset style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '0px 12px 8px 12px', margin: 0 }}>
                  <legend style={{ padding: '0 8px', fontSize: '14px', fontWeight: 400, color: '#232323', marginLeft: '12px' }}>
                    Air Quality
                  </legend>
                  <input type="text" placeholder="Type Here" name="airQuality" value={formData.airQuality} onChange={handleChange}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 500, color: '#9e9e9e', padding: '8px 0', backgroundColor: 'transparent' }}
                  />
                </fieldset>
                <p style={{ fontSize: '14px', color: '#9e9e9e', marginTop: '8px', marginLeft: '4px' }}>Range : &lt;100 Particles/M&sup3;</p>
              </div>

              {/* Gas Mixture */}
              <div style={{ marginBottom: '16px' }}>
                <fieldset style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '0px 12px 8px 12px', margin: 0 }}>
                  <legend style={{ padding: '0 8px', fontSize: '14px', fontWeight: 400, color: '#232323', marginLeft: '12px' }}>
                    Gas Mixture (% O2, CO2)
                  </legend>
                  <input type="text" placeholder="Type Here" name="gasMeasure" value={formData.gasMeasure} onChange={handleChange}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 500, color: '#9e9e9e', padding: '8px 0', backgroundColor: 'transparent' }}
                  />
                </fieldset>
                <p style={{ fontSize: '14px', color: '#9e9e9e', marginTop: '8px', marginLeft: '4px' }}>Range : O2 - 20, CO2 - 5</p>
              </div>

              {/* Lighting */}
              <div style={{ marginBottom: '16px' }}>
                <fieldset style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '0px 12px 8px 12px', margin: 0 }}>
                  <legend style={{ padding: '0 8px', fontSize: '14px', fontWeight: 400, color: '#232323', marginLeft: '12px' }}>
                    Lighting Condition (Lux)
                  </legend>
                  <input type="text" placeholder="Type Here" name="lightCondition" value={formData.lightCondition} onChange={handleChange}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 500, color: '#9e9e9e', padding: '8px 0', backgroundColor: 'transparent' }}
                  />
                </fieldset>
                <p style={{ fontSize: '14px', color: '#9e9e9e', marginTop: '8px', marginLeft: '4px' }}>Range : 300 - 500 For Embryo Culture</p>
              </div>

              {/* Noise */}
              <div style={{ marginBottom: '16px' }}>
                <fieldset style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '0px 12px 8px 12px', margin: 0 }}>
                  <legend style={{ padding: '0 8px', fontSize: '14px', fontWeight: 400, color: '#232323', marginLeft: '12px' }}>
                    Noise Levels (DB)
                  </legend>
                  <input type="text" placeholder="Type Here" name="noiseLevel" value={formData.noiseLevel} onChange={handleChange}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 500, color: '#9e9e9e', padding: '8px 0', backgroundColor: 'transparent' }}
                  />
                </fieldset>
                <p style={{ fontSize: '14px', color: '#9e9e9e', marginTop: '8px', marginLeft: '4px' }}>Range : &lt; 5</p>
              </div>

              {/* Comments and Status Row */}
              <div style={{ display: 'flex', gap: '16px', gridColumn: '1 / -1', marginTop: '16px' }}>
                <div style={{ flex: 1 }}>
                  <fieldset style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '0 12px 8px 12px', margin: 0 }}>
                    <legend style={{ padding: '0 8px', fontSize: '14px', fontWeight: 500, color: '#232323', marginLeft: '12px' }}>Comments</legend>
                    <textarea placeholder="Type Here" name="comments" value={formData.comments} onChange={handleChange} rows={1}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', padding: '8px 0', backgroundColor: 'transparent', fontFamily: 'inherit', resize: 'none' }}
                    />
                  </fieldset>
                </div>
                <div style={{ flex: 1 }}>
                  <fieldset style={{ border: '1px solid #d1d5db', borderRadius: '12px', padding: '0 12px 8px 12px', margin: 0 }}>
                    <legend style={{ padding: '0 8px', fontSize: '14px', fontWeight: 500, color: '#232323', marginLeft: '12px' }}>Status</legend>
                    <select name="status" value={formData.status} onChange={handleChange}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '16px', padding: '8px 0', backgroundColor: 'transparent', color: '#232323', fontFamily: 'inherit', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23232323' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '16px' }}
                    >
                      <option value="Within Range">Within Range</option>
                      <option value="Out of Range">Out of Range</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </fieldset>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px'}}>
            <button onClick={handleClear} style={{ padding: '8px 24px', border: '1px solid #505050', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500, fontSize: '14px', color: '#505050' }}>
              Clear
            </button>
            <button onClick={handleSave} style={{ padding: '8px 24px', border: 'none', borderRadius: '4px', backgroundColor: '#505050', color: 'white', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>
              Save
            </button>
          </div>
        </div>

        {/* Right Section - Activity Chart */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', border: '1px solid #EEEEEE', minHeight: '100vh', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#505050" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h4 style={{ fontWeight: 500, fontSize: '18px', margin: 0 }}>Activity</h4>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#6c6c6c', borderRadius: '50%' }} />
                <span style={{ fontSize: '12px', color: '#9e9e9e' }}>Compliant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#EF9685', borderRadius: '50%' }} />
                <span style={{ fontSize: '12px', color: '#9e9e9e' }}>Non - Compliant</span>
              </div>
            </div>
          </div>

{/* SEPARATOR LINE */}
<div
  style={{
    width: 'calc(100% + 40px)',
    height: '1px',
    backgroundColor: '#E0E0E0',
    marginLeft: '-20px',
    marginRight: '-20px',
    marginBottom: '10px'
  }}
/>


          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={activityData} stackOffset="sign" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
<XAxis
  dataKey="day"
  tick={{ fontSize: 12, fill: '#9e9e9e' }}
  axisLine={{ stroke: '#E0E0E0' }}
  tickLine={{ stroke: '#E0E0E0' }}
/>
              <YAxis
  domain={[-40, 40]}
  ticks={[-40, -30, -20, -10, 0, 10, 20, 30, 40]}
  tick={{ fontSize: 12, fill: '#9e9e9e' }}
  axisLine={{ stroke: '#E0E0E0' }}
  tickLine={{ stroke: '#E0E0E0' }}
  label={{
    value: 'No of Parameters',
    angle: -90,
    position: 'insideLeft',
    style: { textAnchor: 'middle', fill: '#B1B1B1', fontWeight: 400, fontSize: '14px' }
  }}
/>

              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px' }} />
{/* Center line */}
<ReferenceLine y={0} stroke="#E0E0E0" />

{/* Positive side */}
<ReferenceLine y={10} stroke="#E0E0E0" />
<ReferenceLine y={20} stroke="#E0E0E0" />
<ReferenceLine y={30} stroke="#E0E0E0" />
<ReferenceLine y={40} stroke="#E0E0E0" />

{/* Negative side */}
<ReferenceLine y={-10} stroke="#E0E0E0" />
<ReferenceLine y={-20} stroke="#E0E0E0" />
<ReferenceLine y={-30} stroke="#E0E0E0" />
<ReferenceLine y={-40} stroke="#E0E0E0" />


              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={15} label={{ position: 'top', fill: '#9e9e9e', fontSize: 11 }} />
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[0, 0, 4, 4]} barSize={15} label={({ x, y, value, width }) => (
    <text
      x={x + width / 2}
      y={y + 14}
      fill="#EF9685"
      fontSize={11}
      textAnchor="middle"
    >
      {value}
    </text>
  )} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ textAlign: 'center', marginTop: '16px', color: '#B1B1B1', fontSize: '14px' }}>Month</p>
        </div>

      </div>
    </div>
  );
};

export default Environment;