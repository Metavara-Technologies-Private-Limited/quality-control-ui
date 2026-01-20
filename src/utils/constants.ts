// Parameter Types
export const PARAMETERS = [
  'Temperature',
  'CO₂ Conc.',
  'Humidity',
  'Gas Mix.',
  'Gas Conc.',
] as const;


// Status Colors
export const STATUS_COLORS = {
  high: '#ef4444', // red
  normal: '#10b981', // green
  low: '#6b7280', // gray
  warning: '#f59e0b', // orange
  critical: '#dc2626', // dark red
} as const;

// Chart Colors
export const CHART_COLORS = [
  '#000000', // black
  '#6b7280', // gray
  '#f97316', // orange
  '#dc2626', // red
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#ec4899', // pink
] as const;

// // Department Types
// export const DEPARTMENTS = [
//   'Embryology',
//   'Andrology',
//   'Cryopresevation',
//   'Environmental',
//   'Lab Equipment'
// ] as const;

// // Equipment Types for Embryology
// export const EMBRYOLOGY_EQUIPMENT = [
//   'Incubator',
//   'Laminar Flow Hoods',
//   'Cryopreservation Tanks (LN2)',
//   'Autoclaves',
//   'Ovens & Water Baths',
//   'Sterilizers',
// ] as const;

// // Parameter Units
// export const PARAMETER_UNITS: Record<string, string> = {
//   Temperature: '°C',
//   'CO₂ Conc.': '%',
//   Humidity: '%',
//   'Gas Mix.': '%',
//   'Gas Conc.': '%',
// };

// // Activity Types
// export const ACTIVITY_TYPES = {
//   temperature: 'Temperature',
//   humidity: 'Humidity',
//   co2: 'CO₂',
//   assignee: 'Assignee',
//   other: 'Other',
// } as const;

