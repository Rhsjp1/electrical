
export const APP_NAME = "ElectricAI";
export const STORAGE_KEY_JOBS = "electricai_jobs";
export const STORAGE_KEY_SETTINGS = "electricai_settings";

export const COLORS = {
  primary: "indigo-600",
  secondary: "indigo-700",
  accent: "amber-400",
  success: "emerald-500",
  danger: "rose-500",
  warning: "amber-500"
};

export interface CatalogItem {
  name: string;
  defaultCost: number;
  unit: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  items: CatalogItem[];
}

export const ELECTRICAL_CATALOG: CatalogCategory[] = [
  {
    id: 'wiring',
    name: 'Wiring & Cable',
    items: [
      { name: '14/2 NM-B Wire (250ft)', defaultCost: 115.00, unit: 'roll' },
      { name: '12/2 NM-B Wire (250ft)', defaultCost: 145.00, unit: 'roll' },
      { name: '10/2 NM-B Wire (50ft)', defaultCost: 65.00, unit: 'roll' },
      { name: '12AWG THHN Solid (Black)', defaultCost: 0.45, unit: 'ft' },
      { name: '10AWG THHN Solid (Green)', defaultCost: 0.65, unit: 'ft' },
      { name: 'Cat6 Ethernet (1000ft)', defaultCost: 220.00, unit: 'roll' }
    ]
  },
  {
    id: 'devices',
    name: 'Devices & Switches',
    items: [
      { name: '15A Duplex Outlet (White)', defaultCost: 1.25, unit: 'ea' },
      { name: '20A GFCI Outlet (Tamper Resistant)', defaultCost: 18.50, unit: 'ea' },
      { name: 'Single Pole Switch (Decora)', defaultCost: 2.75, unit: 'ea' },
      { name: '3-Way Switch (Decora)', defaultCost: 4.50, unit: 'ea' },
      { name: 'Dimmer Switch (LED Compatible)', defaultCost: 24.00, unit: 'ea' },
      { name: 'USB-A/C Combo Outlet', defaultCost: 22.00, unit: 'ea' }
    ]
  },
  {
    id: 'breakers',
    name: 'Circuit Protection',
    items: [
      { name: '15A Single Pole Breaker (Square D)', defaultCost: 8.50, unit: 'ea' },
      { name: '20A Single Pole Breaker (Homeline)', defaultCost: 7.25, unit: 'ea' },
      { name: '50A Double Pole Breaker', defaultCost: 22.00, unit: 'ea' },
      { name: '15A AFCI Breaker (Plug-on Neutral)', defaultCost: 55.00, unit: 'ea' },
      { name: '20A GFCI/AFCI Dual Function', defaultCost: 62.00, unit: 'ea' }
    ]
  },
  {
    id: 'boxes',
    name: 'Boxes & Fittings',
    items: [
      { name: '1-Gang Old Work Plastic Box', defaultCost: 2.50, unit: 'ea' },
      { name: '2-Gang New Work Plastic Box', defaultCost: 1.85, unit: 'ea' },
      { name: '4" Octagon Ceiling Box', defaultCost: 3.25, unit: 'ea' },
      { name: 'Wire Nut (Yellow/Red - 100pk)', defaultCost: 12.00, unit: 'bag' },
      { name: '1/2" EMT Connector (Set Screw)', defaultCost: 0.85, unit: 'ea' },
      { name: 'Cable Staples (100pk)', defaultCost: 6.50, unit: 'box' }
    ]
  },
  {
    id: 'lighting',
    name: 'Lighting & Fans',
    items: [
      { name: '6" LED Recessed Downlight', defaultCost: 14.00, unit: 'ea' },
      { name: '4" LED Slim Wafer Light', defaultCost: 16.50, unit: 'ea' },
      { name: 'Ceiling Fan Support Box', defaultCost: 18.00, unit: 'ea' },
      { name: 'A19 LED Bulb (60W Equiv)', defaultCost: 2.25, unit: 'ea' }
    ]
  }
];
