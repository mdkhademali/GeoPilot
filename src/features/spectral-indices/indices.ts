export type BandKey = 'blue' | 'green' | 'red' | 'nir' | 'swir1' | 'swir2';

export interface IndexDef {
  id: string;
  name: string;
  formula: string;
  bands: BandKey[];
  applications: string;
  limitations: string;
  reference: string;
  compute: (b: Record<BandKey, number>) => number | null;
}

const nd = (a: number, b: number): number | null => (a + b === 0 ? null : (a - b) / (a + b));

export const INDICES: IndexDef[] = [
  {
    id: 'ndvi',
    name: 'Normalized Difference Vegetation Index',
    formula: '(NIR − Red) / (NIR + Red)',
    bands: ['nir', 'red'],
    applications: 'Vegetation vigour, phenology, land-cover screening.',
    limitations: 'Saturates over dense canopy; sensitive to soil background and atmosphere.',
    reference: 'Rouse et al. (1974), NASA/GSFC Type III Final Report.',
    compute: (b) => nd(b.nir, b.red),
  },
  {
    id: 'ndwi',
    name: 'Normalized Difference Water Index (McFeeters)',
    formula: '(Green − NIR) / (Green + NIR)',
    bands: ['green', 'nir'],
    applications: 'Open-water delineation.',
    limitations: 'Built-up areas can give false positives; thresholds are scene dependent.',
    reference: 'McFeeters (1996), Int. J. Remote Sensing 17(7).',
    compute: (b) => nd(b.green, b.nir),
  },
  {
    id: 'mndwi',
    name: 'Modified NDWI',
    formula: '(Green − SWIR1) / (Green + SWIR1)',
    bands: ['green', 'swir1'],
    applications: 'Water mapping in built-up settings.',
    limitations: 'Requires a SWIR band; shadows may be confused with water.',
    reference: 'Xu (2006), Int. J. Remote Sensing 27(14).',
    compute: (b) => nd(b.green, b.swir1),
  },
  {
    id: 'ndbi',
    name: 'Normalized Difference Built-up Index',
    formula: '(SWIR1 − NIR) / (SWIR1 + NIR)',
    bands: ['swir1', 'nir'],
    applications: 'Built-up area and urban extent screening.',
    limitations: 'Bare soil confusion; not a standalone classifier.',
    reference: 'Zha et al. (2003), Int. J. Remote Sensing 24(3).',
    compute: (b) => nd(b.swir1, b.nir),
  },
  {
    id: 'evi',
    name: 'Enhanced Vegetation Index',
    formula: '2.5 × (NIR − Red) / (NIR + 6·Red − 7.5·Blue + 1)',
    bands: ['nir', 'red', 'blue'],
    applications: 'Dense-canopy vegetation with reduced atmospheric and soil effects.',
    limitations: 'Assumes surface reflectance scaled 0–1; coefficients are MODIS-derived.',
    reference: 'Huete et al. (2002), Remote Sens. Environ. 83.',
    compute: (b) => {
      const d = b.nir + 6 * b.red - 7.5 * b.blue + 1;
      return d === 0 ? null : (2.5 * (b.nir - b.red)) / d;
    },
  },
  {
    id: 'savi',
    name: 'Soil-Adjusted Vegetation Index (L = 0.5)',
    formula: '1.5 × (NIR − Red) / (NIR + Red + 0.5)',
    bands: ['nir', 'red'],
    applications: 'Sparse vegetation where soil brightness matters.',
    limitations: 'L = 0.5 is a general choice; optimal L varies with cover.',
    reference: 'Huete (1988), Remote Sens. Environ. 25.',
    compute: (b) => {
      const d = b.nir + b.red + 0.5;
      return d === 0 ? null : (1.5 * (b.nir - b.red)) / d;
    },
  },
  {
    id: 'bsi',
    name: 'Bare Soil Index',
    formula: '((SWIR1 + Red) − (NIR + Blue)) / ((SWIR1 + Red) + (NIR + Blue))',
    bands: ['swir1', 'red', 'nir', 'blue'],
    applications: 'Bare soil and fallow-land mapping.',
    limitations: 'Several BSI variants exist; check which one a paper uses.',
    reference: 'Rikimaru et al. (2002), Tropical Ecology 43(1).',
    compute: (b) => nd(b.swir1 + b.red, b.nir + b.blue),
  },
  {
    id: 'nbr',
    name: 'Normalized Burn Ratio',
    formula: '(NIR − SWIR2) / (NIR + SWIR2)',
    bands: ['nir', 'swir2'],
    applications: 'Burn severity (with dNBR) and vegetation moisture.',
    limitations: 'Needs pre/post pairs for severity; thresholds are regional.',
    reference: 'Key & Benson (2006), USGS FIREMON.',
    compute: (b) => nd(b.nir, b.swir2),
  },
];

export type IndexResult = { ok: true; value: number } | { ok: false; error: string };

export function calculateIndex(def: IndexDef, input: Partial<Record<BandKey, string | number>>): IndexResult {
  const vals = {} as Record<BandKey, number>;
  for (const k of def.bands) {
    const raw = input[k];
    if (raw === undefined || raw === '') return { ok: false, error: `Missing value for ${k.toUpperCase()}.` };
    const n = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isFinite(n)) return { ok: false, error: `${k.toUpperCase()} is not a valid number.` };
    vals[k] = n;
  }
  const v = def.compute(vals);
  if (v === null || !Number.isFinite(v)) return { ok: false, error: 'Undefined result: the denominator is zero.' };
  return { ok: true, value: v };
}

export const SENSOR_BANDS = [
  {
    sensor: 'Sentinel-2 MSI (L2A)',
    blue: 'B2',
    green: 'B3',
    red: 'B4',
    nir: 'B8',
    swir1: 'B11',
    swir2: 'B12',
    note: 'Surface reflectance is stored ×10000 (divide by 10000); apply cloud masking (e.g. SCL).',
  },
  {
    sensor: 'Landsat 8/9 OLI (Collection 2 L2)',
    blue: 'SR_B2',
    green: 'SR_B3',
    red: 'SR_B4',
    nir: 'SR_B5',
    swir1: 'SR_B6',
    swir2: 'SR_B7',
    note: 'Reflectance = DN × 0.0000275 − 0.2; mask with QA_PIXEL.',
  },
  {
    sensor: 'Landsat 5/7 TM/ETM+ (Collection 2 L2)',
    blue: 'SR_B1',
    green: 'SR_B2',
    red: 'SR_B3',
    nir: 'SR_B4',
    swir1: 'SR_B5',
    swir2: 'SR_B7',
    note: 'Same scale factor and offset as Landsat 8/9 C2 L2; band numbers differ.',
  },
  {
    sensor: 'MODIS MOD09A1',
    blue: 'sur_refl_b03',
    green: 'sur_refl_b04',
    red: 'sur_refl_b01',
    nir: 'sur_refl_b02',
    swir1: 'sur_refl_b06',
    swir2: 'sur_refl_b07',
    note: 'Scale factor 0.0001; use the quality bands for masking.',
  },
];
