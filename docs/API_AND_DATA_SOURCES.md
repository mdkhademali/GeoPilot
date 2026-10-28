# API and data sources
- **Crossref REST API** – `GET https://api.crossref.org/works/{DOI}`; used only on user action. Fields mapped: title, author, issued year, container-title, DOI, publisher, abstract (markup stripped), volume, issue, page, URL, type. Rate limits and availability are Crossref's.
- **Resource Hub** – static list in `src/data/resources.ts`; each URL points to the provider's main site or documentation page and should be re-verified periodically.
- **Spectral index references** – cited in `src/features/spectral-indices/indices.ts`.
- **Sensor scale factors** – summarized from product documentation (Sentinel-2, Landsat Collection 2, MODIS); always confirm against current official docs.
