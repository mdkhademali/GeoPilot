export interface Workflow {
  id: string;
  title: string;
  objective: string;
  datasets: string[];
  preprocessing: string[];
  methods: string[];
  validation: string[];
  limitations: string[];
  docs: { label: string; url: string }[];
}
const W = (w: Workflow): Workflow => w;
export const WORKFLOWS: Workflow[] = [
  W({
    id: 'flood',
    title: 'Flood mapping and susceptibility',
    objective: 'Map flood extent from SAR/optical imagery and model susceptibility from conditioning factors.',
    datasets: ['Sentinel-1 GRD SAR', 'Sentinel-2 optical', 'SRTM or other DEM', 'Rainfall (e.g. CHIRPS)', 'Land cover'],
    preprocessing: [
      'Speckle filtering and terrain correction for SAR',
      'Cloud masking for optical',
      'Co-register layers to one grid',
      'Derive slope, HAND and distance to rivers',
    ],
    methods: ['Pre/post-event change detection with thresholding', 'MNDWI/NDWI water extraction', 'Susceptibility via ML (RF, logistic regression) or AHP'],
    validation: ['Independent flood inventory with spatial hold-out', 'Confusion matrix, ROC-AUC, F1', 'Spatial cross-validation'],
    limitations: ['Radar shadow and urban double-bounce affect SAR', 'Thresholds are scene specific', 'Inventory quality limits accuracy'],
    docs: [
      { label: 'Earth Engine datasets', url: 'https://developers.google.com/earth-engine/datasets' },
      { label: 'Copernicus Data Space', url: 'https://dataspace.copernicus.eu/' },
    ],
  }),
  W({
    id: 'drought',
    title: 'Drought monitoring',
    objective: 'Track vegetation and moisture anomalies against a climatological baseline.',
    datasets: ['MODIS or Sentinel-2 NDVI', 'CHIRPS or ERA5 precipitation', 'Land surface temperature', 'Soil moisture products'],
    preprocessing: ['Build consistent time series', 'Gap-fill and smooth', 'Compute multi-year baseline'],
    methods: ['NDVI anomaly / VCI', 'SPI from precipitation', 'Combine indicators in a composite index'],
    validation: ['Compare with crop statistics or reports', 'Correlate indicators with yield'],
    limitations: ['Baseline length changes results', 'Irrigation masks rainfall deficits'],
    docs: [
      { label: 'Copernicus Climate Data Store', url: 'https://cds.climate.copernicus.eu/' },
      { label: 'CHIRPS', url: 'https://www.chc.ucsb.edu/data/chirps' },
    ],
  }),
  W({
    id: 'lulc',
    title: 'Land-use and land-cover classification',
    objective: 'Produce a thematic map from multispectral imagery.',
    datasets: ['Sentinel-2 or Landsat surface reflectance', 'Reference samples', 'DEM and spectral indices'],
    preprocessing: ['Cloud masking and compositing', 'Stack bands and indices', 'Stratified sample design'],
    methods: ['Random Forest or other supervised classifiers', 'Object-based image analysis', 'Post-classification filtering'],
    validation: ['Independent validation samples', 'Confusion matrix, OA, kappa, per-class accuracy', 'Area-adjusted accuracy estimates'],
    limitations: ['Mixed pixels', 'Class imbalance', 'Training data bias'],
    docs: [
      { label: 'Earth Engine docs', url: 'https://developers.google.com/earth-engine' },
      { label: 'scikit-learn', url: 'https://scikit-learn.org/' },
    ],
  }),
  W({
    id: 'uhi',
    title: 'Urban heat island analysis',
    objective: 'Quantify surface temperature patterns in relation to land cover.',
    datasets: ['Landsat Collection 2 Level-2 thermal', 'Sentinel-2 indices', 'Urban boundary data'],
    preprocessing: ['Cloud masking', 'Apply thermal scale factors', 'Select comparable seasons and times'],
    methods: ['LST retrieval', 'Correlate LST with NDVI/NDBI/MNDWI', 'Zonal statistics and hotspot analysis'],
    validation: ['Compare with weather-station air temperature where available', 'Multi-date consistency'],
    limitations: ['Surface vs air temperature differ', 'Landsat revisit and overpass time limit coverage'],
    docs: [
      { label: 'USGS EarthExplorer', url: 'https://earthexplorer.usgs.gov/' },
      { label: 'Earth Engine datasets', url: 'https://developers.google.com/earth-engine/datasets' },
    ],
  }),
  W({
    id: 'water-change',
    title: 'Water-body change detection',
    objective: 'Measure surface-water extent change between dates.',
    datasets: ['Sentinel-2 or Landsat', 'Sentinel-1 SAR for cloudy seasons'],
    preprocessing: ['Cloud/shadow masking', 'Seasonal compositing'],
    methods: ['MNDWI/NDWI thresholding (e.g. Otsu)', 'Post-classification comparison', 'Frequency of inundation'],
    validation: ['High-resolution imagery reference', 'Confusion matrix on sample points'],
    limitations: ['Seasonality can mimic change', 'Turbid or vegetated water'],
    docs: [{ label: 'Planetary Computer', url: 'https://planetarycomputer.microsoft.com/' }],
  }),
  W({
    id: 'climate-risk',
    title: 'Climate risk',
    objective: 'Combine hazard, exposure and vulnerability into a risk view.',
    datasets: ['Climate reanalysis or projections', 'Population (e.g. WorldPop)', 'Infrastructure from OSM'],
    preprocessing: ['Harmonise resolution and CRS', 'Normalise indicators'],
    methods: ['Hazard × exposure × vulnerability frameworks', 'Scenario comparison', 'Uncertainty ranges'],
    validation: ['Sensitivity analysis', 'Compare with historical loss records'],
    limitations: ['Projection uncertainty', 'Weighting choices are subjective'],
    docs: [
      { label: 'Copernicus CDS', url: 'https://cds.climate.copernicus.eu/' },
      { label: 'WorldPop', url: 'https://www.worldpop.org/' },
    ],
  }),
  W({
    id: 'env-vuln',
    title: 'Environmental vulnerability',
    objective: 'Index spatial vulnerability from environmental and social indicators.',
    datasets: ['Land cover, NDVI, LST', 'Slope and elevation', 'Population and infrastructure'],
    preprocessing: ['Standardise indicators', 'Check collinearity'],
    methods: ['Weighted overlay / AHP', 'PCA-based composite indices'],
    validation: ['Sensitivity of weights', 'Spatial autocorrelation of residuals'],
    limitations: ['Weights encode assumptions', 'Modifiable areal unit problem'],
    docs: [{ label: 'QGIS', url: 'https://qgis.org/' }],
  }),
  W({
    id: 'drm',
    title: 'Disaster risk assessment',
    objective: 'Assess hazard, exposure and capacity to inform preparedness.',
    datasets: ['Hazard footprints', 'Population and building data', 'Facility locations'],
    preprocessing: ['Clean and georeference records', 'Align to common grid or admin units'],
    methods: ['Overlay and exposure counts', 'Multi-hazard indices', 'Scenario analysis'],
    validation: ['Past event back-testing', 'Expert review'],
    limitations: ['Data gaps in informal settlements', 'Static snapshots'],
    docs: [
      { label: 'Humanitarian Data Exchange', url: 'https://data.humdata.org/' },
      { label: 'OpenStreetMap', url: 'https://www.openstreetmap.org/' },
    ],
  }),
  W({
    id: 'accessibility',
    title: 'Spatial accessibility',
    objective: 'Measure how easily people reach services.',
    datasets: ['Road network (OSM)', 'Facility points', 'Population grid'],
    preprocessing: ['Build routable graph', 'Snap points to the network'],
    methods: ['Network travel-time isochrones', '2SFCA family of methods', 'Nearest-facility analysis'],
    validation: ['Compare with observed travel times', 'Sensitivity to catchment size'],
    limitations: ['Speed assumptions', 'Network completeness varies'],
    docs: [{ label: 'OSMnx', url: 'https://osmnx.readthedocs.io/' }],
  }),
  W({
    id: 'location-allocation',
    title: 'Location-allocation',
    objective: 'Choose facility sites to optimise coverage or cost.',
    datasets: ['Demand points', 'Candidate sites', 'Travel-time or distance matrix'],
    preprocessing: ['Build cost matrix', 'Define constraints'],
    methods: ['p-median, maximal covering, p-center', 'Mixed-integer programming solvers'],
    validation: ['Compare with current configuration', 'Scenario robustness'],
    limitations: ['Optimality depends on cost matrix quality', 'Capacity assumptions'],
    docs: [{ label: 'GeoPandas', url: 'https://geopandas.org/' }],
  }),
  W({
    id: 'vrp',
    title: 'Vehicle routing and spatial logistics',
    objective: 'Plan efficient routes subject to vehicle and time constraints.',
    datasets: ['Depot and customer locations', 'Road network and travel times', 'Demands and time windows'],
    preprocessing: ['Geocode and snap locations', 'Compute travel-time matrix'],
    methods: ['CVRP/VRPTW with heuristics or solvers', 'Clustering-first, route-second'],
    validation: ['Compare with baseline routes', 'Sensitivity to demand changes'],
    limitations: ['Static travel times ignore congestion', 'Solver time grows quickly with size'],
    docs: [{ label: 'OSMnx', url: 'https://osmnx.readthedocs.io/' }],
  }),
  W({
    id: 'digital-twin',
    title: 'Digital twins',
    objective: 'Maintain a spatial model synchronised with real-world data.',
    datasets: ['Base geometry (buildings, land use)', 'Sensor/IoT feeds', 'EO time series'],
    preprocessing: ['Data model and CRS standardisation', 'Time-stamped ingestion pipelines'],
    methods: ['Simulation (e.g. cellular automata)', 'Data assimilation', 'Scenario dashboards'],
    validation: ['Back-test against observed states', 'Monitor drift'],
    limitations: ['Model fidelity vs maintenance cost', 'Data latency'],
    docs: [
      { label: 'STAC', url: 'https://stacspec.org/' },
      { label: 'PostGIS', url: 'https://postgis.net/' },
    ],
  }),
];
