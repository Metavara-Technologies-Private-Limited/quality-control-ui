import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  CartesianGrid,
  LabelList
} from 'recharts';

const Environment = () => {
  const [activeTab, setActiveTab] = useState('details');
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

  const [logs, setLogs] = useState<any[]>([]);

  const activityData = [
    { day: 'Mon', compliant: 34, nonCompliant: -23 },
    { day: 'Tue', compliant: 28, nonCompliant: -22 },
    { day: 'Wed', compliant: 22, nonCompliant: -36 },
    { day: 'Thu', compliant: 36, nonCompliant: -12 },
    { day: 'Fri', compliant: 29, nonCompliant: -28 },
    { day: 'Sat', compliant: 15, nonCompliant: -33 },
    { day: 'Sun', compliant: 25, nonCompliant: -25 },
  ];

  const isValidDecimal = (value: string) => {
    return /^\d{0,3}(\.\d{0,3})?$/.test(value);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'comments' || name === 'status') {
      setFormData(prev => ({ ...prev, [name]: value }));
      return;
    }

    if (name === 'gasMeasure') {
      const parts = value.split(',');

      if (parts.length > 2) {
        toast.error('Enter Digits and Decimals only');
        return;
      }

      for (let part of parts) {
        if (part.trim() && !isValidDecimal(part.trim())) {
          toast.error('Enter Digits and Decimals only');
          return;
        }
      }

      setFormData(prev => ({ ...prev, gasMeasure: value }));
      return;
    }

    if (!isValidDecimal(value)) {
      toast.error('Enter Digits and Decimals only');
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const hasValue =
      formData.temperature ||
      formData.humidity ||
      formData.airQuality ||
      formData.gasMeasure ||
      formData.lightCondition ||
      formData.noiseLevel;

    if (!hasValue) {
      toast.error('Please fill atleast 1 field');
      return;
    }

    const [o2Value, co2Value] = formData.gasMeasure
      ? formData.gasMeasure.split(',').map(v => v.trim())
      : ['', ''];

    const newLog = {
      dateTime: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      temperature: formData.temperature,
      humidity: formData.humidity,
      airQuality: formData.airQuality,
      gasMeasure: { o2: o2Value, co2: co2Value },
      lightCondition: formData.lightCondition,
      noiseLevel: formData.noiseLevel,
      status: formData.status,
      comments: formData.comments
    };

    setLogs(prev => [newLog, ...prev]);

    setFormData({
      temperature: '',
      humidity: '',
      airQuality: '',
      gasMeasure: '',
      lightCondition: '',
      noiseLevel: '',
      comments: '',
      status: 'Within Range'
    });

    toast.success('Environmental data Saved Successfully');
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

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Left Section - Parameters with Tabs */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
          }}
        >
          <div style={{ flex: 1 }}>
            {/* Heading */}
            <h2 style={{ fontWeight: 700, marginBottom: '24px', fontSize: '16px', color: '#232323', margin: 0 }}>Environmental Parameters</h2>

            {/* Tabs */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: '#f2f2f2',
                borderRadius: '12px',
                padding: '4px',
                marginBottom: '24px',
                gap: '4px'
              }}
            >
              <button
                onClick={() => setActiveTab('details')}
                style={{
                  padding: '8px 32px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: activeTab === 'details' ? '700' : '600',
                  backgroundColor: activeTab === 'details' ? '#ffffff' : 'transparent',
                  color: activeTab === 'details' ? '#e17e61' : '#94a3b8'
                }}
              >
                Details
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                style={{
                  padding: '8px 32px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: activeTab === 'logs' ? '700' : '600',
                  backgroundColor: activeTab === 'logs' ? '#ffffff' : 'transparent',
                  color: activeTab === 'logs' ? '#e17e61' : '#94a3b8'
                }}
              >
                Logs
              </button>
            </div>

            {/* Details Tab */}
            {activeTab === 'details' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  
                  {/* Temperature */}
                  <div style={{ marginBottom: '16px', position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Type Here"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        height: '50px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#9e9e9e',
                        padding: '10px 12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <label
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '-8px',
                        backgroundColor: '#fff',
                        padding: '0 4px',
                        fontSize: '14px',
                        color: '#232323'
                      }}
                    >
                      Temperature (°C)
                    </label>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: '500' }}>
                      Range: 36.5 °C - 37.5 °C
                    </p>
                  </div>

                  {/* Humidity */}
                  <div style={{ marginBottom: '16px', position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Type Here"
                      name="humidity"
                      value={formData.humidity}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        height: '50px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#9e9e9e',
                        padding: '10px 12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <label
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '-8px',
                        backgroundColor: '#fff',
                        padding: '0 4px',
                        fontSize: '14px',
                        color: '#232323'
                      }}
                    >
                      Humidity Levels (%)
                    </label>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: '500' }}>
                      Range: 30% - 60%
                    </p>
                  </div>

                  {/* Air Quality */}
                  <div style={{ marginBottom: '16px', position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Type Here"
                      name="airQuality"
                      value={formData.airQuality}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        height: '50px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#9e9e9e',
                        padding: '10px 12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <label
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '-8px',
                        backgroundColor: '#fff',
                        padding: '0 4px',
                        fontSize: '14px',
                        color: '#232323'
                      }}
                    >
                      Air Quality
                    </label>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: '500' }}>
                      Range: &lt;100 Particles/M³
                    </p>
                  </div>

                  {/* Gas Mixture */}
                  <div style={{ marginBottom: '16px', position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Type Here"
                      name="gasMeasure"
                      value={formData.gasMeasure}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        height: '50px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#9e9e9e',
                        padding: '10px 12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <label
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '-8px',
                        backgroundColor: '#fff',
                        padding: '0 4px',
                        fontSize: '14px',
                        color: '#232323'
                      }}
                    >
                      Gas Mixture (% O2, CO2)
                    </label>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: '500' }}>
                      Range: O2 - 20, CO2 - 5
                    </p>
                  </div>

                  {/* Lighting */}
                  <div style={{ marginBottom: '16px', position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Type Here"
                      name="lightCondition"
                      value={formData.lightCondition}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        height: '50px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#9e9e9e',
                        padding: '10px 12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <label
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '-8px',
                        backgroundColor: '#fff',
                        padding: '0 4px',
                        fontSize: '14px',
                        color: '#232323'
                      }}
                    >
                      Lighting Condition (Lux)
                    </label>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: '500' }}>
                      Range: 300 - 500 For Embryo Culture
                    </p>
                  </div>

                  {/* Noise */}
                  <div style={{ marginBottom: '16px', position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Type Here"
                      name="noiseLevel"
                      value={formData.noiseLevel}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        height: '50px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#9e9e9e',
                        padding: '10px 12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <label
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '-8px',
                        backgroundColor: '#fff',
                        padding: '0 4px',
                        fontSize: '14px',
                        color: '#232323'
                      }}
                    >
                      Noise Levels (DB)
                    </label>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: '500' }}>
                      Range: &lt; 5
                    </p>
                  </div>

                  {/* Comments and Status Row */}
                  <div style={{ display: 'flex', gap: '20px', gridColumn: '1 / -1', marginTop: '16px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <textarea
                        placeholder="Type Here"
                        name="comments"
                        value={formData.comments}
                        onChange={handleChange}
                        rows={1}
                        style={{
                          width: '100%',
                          minHeight: '50px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          padding: '10px 12px',
                          outline: 'none',
                          resize: 'none',
                          color: '#9e9e9e',
                          boxSizing: 'border-box'
                        }}
                      />
                      <label
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '-8px',
                          backgroundColor: '#fff',
                          padding: '0 4px',
                          fontSize: '14px',
                          color: '#232323'
                        }}
                      >
                        Comments
                      </label>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          height: '50px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '16px',
                          padding: '10px 12px',
                          outline: 'none',
                          color: '#232323',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="Within Range">Within Range</option>
                        <option value="Out of Range">Out of Range</option>
                        <option value="Critical">Critical</option>
                      </select>
                      <label
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '-8px',
                          backgroundColor: '#fff',
                          padding: '0 4px',
                          fontSize: '14px',
                          color: '#232323'
                        }}
                      >
                        Status
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div style={{ overflowX: 'auto' }}>
                {logs.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 20px', fontSize: '13px' }}>
                    No logs yet. Fill in the details form and click Save to see entries here.
                  </p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ backgroundColor: '#f9fafb', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      <tr>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Date & Time</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Temp.</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Humidity</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Air Quality</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Gas Mixture</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Lighting</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Noise</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Comments</th>
                      </tr>
                    </thead>

                    <tbody style={{ fontSize: '13px' }}>
                      {logs.map((log: any, index: number) => (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px', color: '#232323', fontWeight: '600' }}>{log.dateTime}</td>
                          <td style={{ padding: '12px', color: '#232323' }}>
                            {log.temperature ? `${log.temperature} °C` : '-'}
                          </td>
                          <td style={{ padding: '12px', color: '#232323' }}>
                            {log.humidity ? `${log.humidity} %` : '-'}
                          </td>
                          <td style={{ padding: '12px', color: '#232323' }}>
                            {log.airQuality ? `${log.airQuality} P/M³` : '-'}
                          </td>
                          <td style={{ padding: '12px', color: '#232323', lineHeight: '1.6' }}>
                            {log.gasMeasure?.o2 ? (
                              <>
                                <div>O2 : {log.gasMeasure.o2}%</div>
                                <div>CO2 : {log.gasMeasure.co2}%</div>
                              </>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td style={{ padding: '12px', color: '#232323' }}>
                            {log.lightCondition ? `${log.lightCondition} Lux` : '-'}
                          </td>
                          <td style={{ padding: '12px', color: '#232323' }}>
                            {log.noiseLevel ? `${log.noiseLevel} dB` : '-'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                padding: '5px 15px',
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                textAlign: 'center',
                                display: 'inline-block',
                                color:
                                  log.status === 'Within Range'
                                    ? '#47B35F'
                                    : log.status === 'Out of Range'
                                    ? '#F25B5B'
                                    : '#7A0C0C',
                                border:
                                  log.status === 'Within Range'
                                    ? '2px solid #47B35F'
                                    : log.status === 'Out of Range'
                                    ? '2px solid #F25B5B'
                                    : '2px solid #7A0C0C',
                                backgroundColor:
                                  log.status === 'Within Range'
                                    ? '#F1FFF5'
                                    : log.status === 'Out of Range'
                                    ? '#FFF1F1'
                                    : '#FDECEC'
                              }}
                            >
                              {log.status === 'Within Range'
                                ? 'In Range'
                                : log.status === 'Out of Range'
                                ? 'Out of Range'
                                : 'Critical'}
                            </span>
                          </td>
                          <td style={{
                            padding: '12px',
                            color: '#232323',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word'
                          }}>
                            {log.comments || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          {activeTab === 'details' && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
              <button
                onClick={handleClear}
                style={{
                  padding: '10px 24px',
                  border: '1px solid #505050',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#505050'
                }}
              >
                Clear
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#505050',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '14px'
                }}
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Right Section - Activity Chart */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', minHeight: '100vh', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <h4 style={{ fontWeight: 700, fontSize: '16px', margin: 0, color: '#0f172a' }}>
              Activity
            </h4>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#6c6c6c', borderRadius: '50%' }} />
                <span style={{ fontSize: '12px', color: '#949494' }}>Compliant</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#EF9685', borderRadius: '50%' }} />
                <span style={{ fontSize: '12px', color: '#949494' }}>Non - Compliant</span>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #E2E3E5', margin: '0 0 16px 0' }} />

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={activityData}
              stackOffset="sign"
              margin={{ top: 20, right: 30, left: 45, bottom: 20 }}
            >
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#9e9e9e' }}
                axisLine={{ stroke: '#E0E0E0' }}
                tickLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tickCount={9}
                tick={{ fontSize: 12, fill: '#9e9e9e' }}
                axisLine={{ stroke: '#E0E0E0' }}
                tickLine={false}
                tickFormatter={(value) => (value === 0 ? '' : value)}
                label={{
                  value: 'No of Parameters',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -35,
                  dy: 40,
                  style: {
                    textAnchor: 'middle',
                    fill: '#9e9e9e',
                    fontWeight: 500,
                    fontSize: '12px'
                  }
                }}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                formatter={(value: number, name: string) => {
                  const absoluteValue = Math.abs(value);
                  const label = name === 'compliant' ? 'Compliant' : 'Non-Compliant';
                  return [`${absoluteValue}`, label];
                }}
              />
              <ReferenceLine y={0} stroke="#E0E0E0" />
              <Bar dataKey="compliant" fill="#6c6c6c" radius={[4, 4, 0, 0]} barSize={25}>
                <LabelList
                  dataKey="compliant"
                  position="top"
                  formatter={(value: number) => (value === 0 ? '' : value)}
                  style={{ fill: '#6c6c6c', fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
              <Bar dataKey="nonCompliant" fill="#EF9685" radius={[4, 4, 0, 0]} barSize={25}>
                <LabelList
                  dataKey="nonCompliant"
                  position="top"
                  formatter={(value: number) => (value === 0 ? '' : Math.abs(value))}
                  style={{ fill: '#EF9685', fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Environment;