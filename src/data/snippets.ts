export interface Snippet {
  id: string;
  title: string;
  language: 'Python' | 'R' | 'GEE JavaScript' | 'PyQGIS';
  topic: string;
  purpose: string;
  code: string;
  dependencies: string;
  notes: string;
}
const A = 'Original example written for GeoPilot (MIT).';
export const SNIPPET_ATTRIBUTION = A;
export const SNIPPETS: Snippet[] = [
  {
    id: 'rio-ndvi',
    title: 'NDVI from a GeoTIFF with Rasterio',
    language: 'Python',
    topic: 'Rasterio',
    purpose: 'Compute NDVI from red and NIR bands of a multi-band raster.',
    dependencies: 'rasterio, numpy',
    code: `import numpy as np, rasterio\n\nwith rasterio.open("scene.tif") as src:\n    red = src.read(3).astype("float32")  # adjust band order\n    nir = src.read(4).astype("float32")\n    profile = src.profile\n\nden = nir + red\nndvi = np.where(den == 0, np.nan, (nir - red) / den)\n\nprofile.update(count=1, dtype="float32", nodata=np.nan)\nwith rasterio.open("ndvi.tif", "w", **profile) as dst:\n    dst.write(ndvi.astype("float32"), 1)`,
    notes: 'Apply scale factors/offsets and cloud masks before computing indices.',
  },
  {
    id: 'gpd-clip',
    title: 'Reproject and clip with GeoPandas',
    language: 'Python',
    topic: 'GeoPandas',
    purpose: 'Reproject layers to a common CRS and clip to an area of interest.',
    dependencies: 'geopandas',
    code: `import geopandas as gpd\n\naoi = gpd.read_file("aoi.gpkg").to_crs(32646)\nroads = gpd.read_file("roads.gpkg").to_crs(aoi.crs)\nclipped = gpd.clip(roads, aoi)\nclipped.to_file("roads_clip.gpkg", driver="GPKG")`,
    notes: 'Replace EPSG:32646 with a projected CRS suitable for your area.',
  },
  {
    id: 'gee-ndvi',
    title: 'Sentinel-2 median NDVI composite',
    language: 'GEE JavaScript',
    topic: 'Remote sensing',
    purpose: 'Cloud-masked median composite and NDVI for an area and period.',
    dependencies: 'Earth Engine Code Editor',
    code: `var aoi = ee.Geometry.Rectangle([88.0, 20.5, 92.7, 26.7]);\nfunction mask(img) {\n  var scl = img.select('SCL');\n  var ok = scl.neq(3).and(scl.neq(8)).and(scl.neq(9)).and(scl.neq(10));\n  return img.updateMask(ok).divide(10000);\n}\nvar s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')\n  .filterBounds(aoi).filterDate('2024-01-01', '2024-03-31')\n  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)).map(mask);\nvar ndvi = s2.median().normalizedDifference(['B8', 'B4']).rename('NDVI');\nMap.centerObject(aoi, 7);\nMap.addLayer(ndvi.clip(aoi), {min: 0, max: 0.9, palette: ['#ffffe5','#78c679','#004529']}, 'NDVI');`,
    notes: 'Check the current dataset ID and band names in the Data Catalog.',
  },
  {
    id: 'gee-landsat-lst',
    title: 'Landsat 8 surface temperature (ST_B10)',
    language: 'GEE JavaScript',
    topic: 'Remote sensing',
    purpose: 'Convert Collection 2 Level-2 thermal band to °C.',
    dependencies: 'Earth Engine Code Editor',
    code: `var aoi = ee.Geometry.Point([89.0, 24.4]).buffer(10000);\nvar img = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')\n  .filterBounds(aoi).filterDate('2023-03-01', '2023-05-31')\n  .filter(ee.Filter.lt('CLOUD_COVER', 20)).median();\nvar lst = img.select('ST_B10').multiply(0.00341802).add(149.0).subtract(273.15).rename('LST_C');\nMap.centerObject(aoi, 11);\nMap.addLayer(lst.clip(aoi), {min: 20, max: 45, palette: ['blue','yellow','red']}, 'LST');`,
    notes: 'Scale factors are from the dataset documentation; verify them before use.',
  },
  {
    id: 'py-spatial-cv',
    title: 'Spatial block cross-validation',
    language: 'Python',
    topic: 'Spatial cross-validation',
    purpose: 'Evaluate a model with spatially grouped folds to reduce leakage.',
    dependencies: 'scikit-learn, numpy',
    code: `import numpy as np\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import GroupKFold\nfrom sklearn.metrics import f1_score\n\n# X: features, y: labels, xy: (n, 2) projected coordinates\nblock = 5000  # metres\ngroups = (xy[:, 0] // block).astype(int) * 100000 + (xy[:, 1] // block).astype(int)\nscores = []\nfor tr, te in GroupKFold(n_splits=5).split(X, y, groups):\n    m = RandomForestClassifier(n_estimators=300, random_state=0, n_jobs=-1).fit(X[tr], y[tr])\n    scores.append(f1_score(y[te], m.predict(X[te]), average="macro"))\nprint(np.mean(scores), np.std(scores))`,
    notes: 'Choose the block size from the spatial autocorrelation range of your data.',
  },
  {
    id: 'py-ml-eval',
    title: 'Classification accuracy report',
    language: 'Python',
    topic: 'Machine-learning evaluation',
    purpose: "Confusion matrix, overall accuracy and Cohen's kappa.",
    dependencies: 'scikit-learn',
    code: `from sklearn.metrics import confusion_matrix, accuracy_score, cohen_kappa_score, classification_report\n\ncm = confusion_matrix(y_true, y_pred)\nprint(cm)\nprint("OA:", accuracy_score(y_true, y_pred))\nprint("Kappa:", cohen_kappa_score(y_true, y_pred))\nprint(classification_report(y_true, y_pred))`,
    notes: 'Report per-class producer/user accuracy for land-cover studies.',
  },
  {
    id: 'r-terra-ndvi',
    title: 'NDVI with terra',
    language: 'R',
    topic: 'Remote sensing',
    purpose: 'Compute NDVI from a stacked raster in R.',
    dependencies: 'terra',
    code: `library(terra)\nr <- rast("scene.tif")\nred <- r[[3]]; nir <- r[[4]]\nndvi <- (nir - red) / (nir + red)\nwriteRaster(ndvi, "ndvi.tif", overwrite = TRUE)`,
    notes: 'Adjust band indices to your sensor.',
  },
  {
    id: 'r-sf-buffer',
    title: 'Buffer and intersect with sf',
    language: 'R',
    topic: 'GIS automation',
    purpose: 'Buffer points and intersect them with polygons.',
    dependencies: 'sf',
    code: `library(sf)\npts <- st_read("points.gpkg") |> st_transform(32646)\npoly <- st_read("zones.gpkg") |> st_transform(32646)\nbuf <- st_buffer(pts, 500)\nhits <- st_intersection(buf, poly)`,
    notes: 'Use a projected CRS for metric buffers.',
  },
  {
    id: 'pyqgis-batch',
    title: 'Batch reproject layers in PyQGIS',
    language: 'PyQGIS',
    topic: 'GIS automation',
    purpose: 'Reproject every vector file in a folder from the QGIS Python console.',
    dependencies: 'QGIS Python console',
    code: `import os, processing\nfolder = "/path/to/data"\nfor f in os.listdir(folder):\n    if f.endswith(".shp"):\n        processing.run("native:reprojectlayer", {\n            "INPUT": os.path.join(folder, f),\n            "TARGET_CRS": "EPSG:32646",\n            "OUTPUT": os.path.join(folder, "utm_" + f)})`,
    notes: 'Run from the QGIS Python console; adapt paths and CRS.',
  },
  {
    id: 'py-raster-mask',
    title: 'Mask raster nodata and resample',
    language: 'Python',
    topic: 'Raster preprocessing',
    purpose: 'Resample a raster to a new resolution while preserving nodata.',
    dependencies: 'rasterio, numpy',
    code: `import rasterio\nfrom rasterio.enums import Resampling\n\nwith rasterio.open("in.tif") as src:\n    scale = 0.5\n    data = src.read(out_shape=(src.count, int(src.height * scale), int(src.width * scale)), resampling=Resampling.bilinear, masked=True)\n    transform = src.transform * src.transform.scale(src.width / data.shape[-1], src.height / data.shape[-2])\nprint(data.shape, transform)`,
    notes: 'Use nearest-neighbour for categorical rasters.',
  },
  {
    id: 'py-zonal',
    title: 'Zonal statistics',
    language: 'Python',
    topic: 'Remote-sensing calculations',
    purpose: 'Mean raster value per polygon.',
    dependencies: 'rasterstats, geopandas',
    code: `import geopandas as gpd\nfrom rasterstats import zonal_stats\n\nzones = gpd.read_file("wards.gpkg")\nstats = zonal_stats(zones, "ndvi.tif", stats=["mean", "min", "max", "count"])\nzones = zones.join(gpd.GeoDataFrame(stats))`,
    notes: 'Ensure raster and polygons share the same CRS.',
  },
];
