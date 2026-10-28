export interface ToolDef {
  id: string;
  label: string;
  group: string;
  blurb: string;
}
export const TOOLS: ToolDef[] = [
  { id: 'dashboard', label: 'Dashboard', group: 'Workspace', blurb: 'Counts from your saved data' },
  { id: 'resources', label: 'Resource Hub', group: 'GIS & Remote Sensing', blurb: 'Official geospatial resources' },
  { id: 'coordinates', label: 'Coordinate Converter', group: 'GIS & Remote Sensing', blurb: 'DD, DMS and UTM' },
  { id: 'indices', label: 'Spectral Indices', group: 'GIS & Remote Sensing', blurb: 'NDVI, NDWI, EVI and more' },
  { id: 'geojson', label: 'GeoJSON Toolkit', group: 'GIS & Remote Sensing', blurb: 'Validate, format, summarize' },
  { id: 'research', label: 'Research Companion', group: 'Research', blurb: 'Save pages, notes, DOI lookup' },
  { id: 'citations', label: 'Citations', group: 'Research', blurb: 'BibTeX, RIS, JSON export/import' },
  { id: 'snippets', label: 'Code Library', group: 'GeoAI & ML', blurb: 'Python, R, GEE, PyQGIS' },
  { id: 'workflows', label: 'Workflow Guides', group: 'GeoAI & ML', blurb: 'Flood, UHI, LULC and more' },
  { id: 'settings', label: 'Settings & Help', group: 'Workspace', blurb: 'Theme, backup, privacy' },
];
