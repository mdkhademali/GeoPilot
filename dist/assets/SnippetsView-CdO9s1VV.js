import{a as e,g as t,i as n,s as r,t as i,u as a,w as o}from"./styles-O6pnk7Rt.js";import{t as s}from"./useDebounce-C-ArZENI.js";var c=o(),l=`Original example written for GeoPilot (MIT).`,u=[{id:`rio-ndvi`,title:`NDVI from a GeoTIFF with Rasterio`,language:`Python`,topic:`Rasterio`,purpose:`Compute NDVI from red and NIR bands of a multi-band raster.`,dependencies:`rasterio, numpy`,code:`import numpy as np, rasterio

with rasterio.open("scene.tif") as src:
    red = src.read(3).astype("float32")  # adjust band order
    nir = src.read(4).astype("float32")
    profile = src.profile

den = nir + red
ndvi = np.where(den == 0, np.nan, (nir - red) / den)

profile.update(count=1, dtype="float32", nodata=np.nan)
with rasterio.open("ndvi.tif", "w", **profile) as dst:
    dst.write(ndvi.astype("float32"), 1)`,notes:`Apply scale factors/offsets and cloud masks before computing indices.`},{id:`gpd-clip`,title:`Reproject and clip with GeoPandas`,language:`Python`,topic:`GeoPandas`,purpose:`Reproject layers to a common CRS and clip to an area of interest.`,dependencies:`geopandas`,code:`import geopandas as gpd

aoi = gpd.read_file("aoi.gpkg").to_crs(32646)
roads = gpd.read_file("roads.gpkg").to_crs(aoi.crs)
clipped = gpd.clip(roads, aoi)
clipped.to_file("roads_clip.gpkg", driver="GPKG")`,notes:`Replace EPSG:32646 with a projected CRS suitable for your area.`},{id:`gee-ndvi`,title:`Sentinel-2 median NDVI composite`,language:`GEE JavaScript`,topic:`Remote sensing`,purpose:`Cloud-masked median composite and NDVI for an area and period.`,dependencies:`Earth Engine Code Editor`,code:`var aoi = ee.Geometry.Rectangle([88.0, 20.5, 92.7, 26.7]);
function mask(img) {
  var scl = img.select('SCL');
  var ok = scl.neq(3).and(scl.neq(8)).and(scl.neq(9)).and(scl.neq(10));
  return img.updateMask(ok).divide(10000);
}
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(aoi).filterDate('2024-01-01', '2024-03-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)).map(mask);
var ndvi = s2.median().normalizedDifference(['B8', 'B4']).rename('NDVI');
Map.centerObject(aoi, 7);
Map.addLayer(ndvi.clip(aoi), {min: 0, max: 0.9, palette: ['#ffffe5','#78c679','#004529']}, 'NDVI');`,notes:`Check the current dataset ID and band names in the Data Catalog.`},{id:`gee-landsat-lst`,title:`Landsat 8 surface temperature (ST_B10)`,language:`GEE JavaScript`,topic:`Remote sensing`,purpose:`Convert Collection 2 Level-2 thermal band to °C.`,dependencies:`Earth Engine Code Editor`,code:`var aoi = ee.Geometry.Point([89.0, 24.4]).buffer(10000);
var img = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterBounds(aoi).filterDate('2023-03-01', '2023-05-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 20)).median();
var lst = img.select('ST_B10').multiply(0.00341802).add(149.0).subtract(273.15).rename('LST_C');
Map.centerObject(aoi, 11);
Map.addLayer(lst.clip(aoi), {min: 20, max: 45, palette: ['blue','yellow','red']}, 'LST');`,notes:`Scale factors are from the dataset documentation; verify them before use.`},{id:`py-spatial-cv`,title:`Spatial block cross-validation`,language:`Python`,topic:`Spatial cross-validation`,purpose:`Evaluate a model with spatially grouped folds to reduce leakage.`,dependencies:`scikit-learn, numpy`,code:`import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GroupKFold
from sklearn.metrics import f1_score

# X: features, y: labels, xy: (n, 2) projected coordinates
block = 5000  # metres
groups = (xy[:, 0] // block).astype(int) * 100000 + (xy[:, 1] // block).astype(int)
scores = []
for tr, te in GroupKFold(n_splits=5).split(X, y, groups):
    m = RandomForestClassifier(n_estimators=300, random_state=0, n_jobs=-1).fit(X[tr], y[tr])
    scores.append(f1_score(y[te], m.predict(X[te]), average="macro"))
print(np.mean(scores), np.std(scores))`,notes:`Choose the block size from the spatial autocorrelation range of your data.`},{id:`py-ml-eval`,title:`Classification accuracy report`,language:`Python`,topic:`Machine-learning evaluation`,purpose:`Confusion matrix, overall accuracy and Cohen's kappa.`,dependencies:`scikit-learn`,code:`from sklearn.metrics import confusion_matrix, accuracy_score, cohen_kappa_score, classification_report

cm = confusion_matrix(y_true, y_pred)
print(cm)
print("OA:", accuracy_score(y_true, y_pred))
print("Kappa:", cohen_kappa_score(y_true, y_pred))
print(classification_report(y_true, y_pred))`,notes:`Report per-class producer/user accuracy for land-cover studies.`},{id:`r-terra-ndvi`,title:`NDVI with terra`,language:`R`,topic:`Remote sensing`,purpose:`Compute NDVI from a stacked raster in R.`,dependencies:`terra`,code:`library(terra)
r <- rast("scene.tif")
red <- r[[3]]; nir <- r[[4]]
ndvi <- (nir - red) / (nir + red)
writeRaster(ndvi, "ndvi.tif", overwrite = TRUE)`,notes:`Adjust band indices to your sensor.`},{id:`r-sf-buffer`,title:`Buffer and intersect with sf`,language:`R`,topic:`GIS automation`,purpose:`Buffer points and intersect them with polygons.`,dependencies:`sf`,code:`library(sf)
pts <- st_read("points.gpkg") |> st_transform(32646)
poly <- st_read("zones.gpkg") |> st_transform(32646)
buf <- st_buffer(pts, 500)
hits <- st_intersection(buf, poly)`,notes:`Use a projected CRS for metric buffers.`},{id:`pyqgis-batch`,title:`Batch reproject layers in PyQGIS`,language:`PyQGIS`,topic:`GIS automation`,purpose:`Reproject every vector file in a folder from the QGIS Python console.`,dependencies:`QGIS Python console`,code:`import os, processing
folder = "/path/to/data"
for f in os.listdir(folder):
    if f.endswith(".shp"):
        processing.run("native:reprojectlayer", {
            "INPUT": os.path.join(folder, f),
            "TARGET_CRS": "EPSG:32646",
            "OUTPUT": os.path.join(folder, "utm_" + f)})`,notes:`Run from the QGIS Python console; adapt paths and CRS.`},{id:`py-raster-mask`,title:`Mask raster nodata and resample`,language:`Python`,topic:`Raster preprocessing`,purpose:`Resample a raster to a new resolution while preserving nodata.`,dependencies:`rasterio, numpy`,code:`import rasterio
from rasterio.enums import Resampling

with rasterio.open("in.tif") as src:
    scale = 0.5
    data = src.read(out_shape=(src.count, int(src.height * scale), int(src.width * scale)), resampling=Resampling.bilinear, masked=True)
    transform = src.transform * src.transform.scale(src.width / data.shape[-1], src.height / data.shape[-2])
print(data.shape, transform)`,notes:`Use nearest-neighbour for categorical rasters.`},{id:`py-zonal`,title:`Zonal statistics`,language:`Python`,topic:`Remote-sensing calculations`,purpose:`Mean raster value per polygon.`,dependencies:`rasterstats, geopandas`,code:`import geopandas as gpd
from rasterstats import zonal_stats

zones = gpd.read_file("wards.gpkg")
stats = zonal_stats(zones, "ndvi.tif", stats=["mean", "min", "max", "count"])
zones = zones.join(gpd.GeoDataFrame(stats))`,notes:`Ensure raster and polygons share the same CRS.`}],d=t();function f(){let[t,o]=(0,c.useState)(``),[f,p]=(0,c.useState)(``),m=s(t,150),h=[...new Set(u.map(e=>e.language))],g=(0,c.useMemo)(()=>i(u.filter(e=>!f||e.language===f),m,e=>[e.title,e.topic,e.purpose,e.dependencies,e.language]),[m,f]);return(0,d.jsxs)(`section`,{className:`space-y-3 gp-fade`,children:[(0,d.jsx)(a,{sub:l,children:`Code & Formula Library`}),(0,d.jsxs)(`div`,{className:`flex gap-2`,children:[(0,d.jsx)(`div`,{className:`flex-1`,children:(0,d.jsx)(r,{label:`Search`,children:(0,d.jsx)(`input`,{className:`gp-input`,type:`search`,value:t,onChange:e=>o(e.target.value)})})}),(0,d.jsx)(r,{label:`Language`,children:(0,d.jsxs)(`select`,{className:`gp-input`,value:f,onChange:e=>p(e.target.value),children:[(0,d.jsx)(`option`,{value:``,children:`All`}),h.map(e=>(0,d.jsx)(`option`,{children:e},e))]})})]}),g.length===0?(0,d.jsx)(e,{title:`No snippets match`}):g.map(e=>(0,d.jsxs)(`article`,{className:`gp-card space-y-1.5`,children:[(0,d.jsxs)(`div`,{className:`flex justify-between gap-2`,children:[(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h3`,{className:`font-medium`,children:e.title}),(0,d.jsxs)(`p`,{className:`gp-muted`,children:[e.language,` · `,e.topic]})]}),(0,d.jsx)(n,{text:e.code})]}),(0,d.jsx)(`p`,{children:e.purpose}),(0,d.jsx)(`pre`,{className:`overflow-x-auto rounded p-2 text-[11px] font-mono`,style:{background:`var(--surface2)`},children:(0,d.jsx)(`code`,{children:e.code})}),(0,d.jsxs)(`p`,{className:`gp-muted`,children:[(0,d.jsx)(`b`,{children:`Dependencies:`}),` `,e.dependencies]}),(0,d.jsxs)(`p`,{className:`gp-muted`,children:[(0,d.jsx)(`b`,{children:`Notes:`}),` `,e.notes]})]},e.id))]})}export{f as SnippetsView};