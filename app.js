// =====================================================================
// Mozambique Ecosystem Sub-group & Reference Site Review Map
// =====================================================================

const map = L.map('map', { zoomControl: true, maxZoom: 20 }).setView([-18.5, 35.5], 6);

// Custom pane so reference-site polygons always render above ecosystem polygons
map.createPane('refSitesPane');
map.getPane('refSitesPane').style.zIndex = 450;

// Custom pane for distance raster (below ecosystem polygons)
map.createPane('distancePane');
map.getPane('distancePane').style.zIndex = 300;

// Basemaps
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
  maxNativeZoom: 19,
});

const esriSat = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Tiles &copy; Esri', maxZoom: 20, maxNativeZoom: 19 }
).addTo(map);

L.control.layers({ 'OpenStreetMap': osm, 'Satellite (Esri)': esriSat }, null, { position: 'bottomleft' }).addTo(map);

// ---------------------------------------------------------------------
// Distance-to-disturbance v3 — colour-coded PNG image overlay
// Red = close to disturbance (0 km), green = far (≥10 km)
// ---------------------------------------------------------------------
let distanceOverlay = null;

Promise.all([
  fetch('data/distance_to_disturbance_v3_bounds.json').then(r => r.json()),
]).then(([b]) => {
  const bounds = [[b.south, b.west], [b.north, b.east]];
  distanceOverlay = L.imageOverlay('data/distance_to_disturbance_v3.png', bounds, {
    opacity: 0.75,
    pane: 'distancePane',
  });
  // Not shown by default - user must check the toggle
});

function syncDistanceToggle(checked) {
  const other = checked
    ? (document.getElementById('toggleDistance').checked ? 'toggleDistanceRef' : 'toggleDistance')
    : null;
  // Keep both checkboxes in sync
  document.getElementById('toggleDistance').checked = checked;
  document.getElementById('toggleDistanceRef').checked = checked;
  if (!distanceOverlay) return;
  if (checked) distanceOverlay.addTo(map);
  else map.removeLayer(distanceOverlay);
}

document.getElementById('toggleDistance').addEventListener('change', e => syncDistanceToggle(e.target.checked));
document.getElementById('toggleDistanceRef').addEventListener('change', e => syncDistanceToggle(e.target.checked));

// ---------------------------------------------------------------------
// Reference site polygons (vectorized from the 25m raster, reprojected
// with pyproj so they align exactly with the ecosystem-type boundaries and
// with GIS - no raster-reprojection misalignment)
//
// Reference sites are identified PER INDIVIDUAL ECOSYSTEM TYPE. Only types
// where the reference-site AGBD is "higher" than the non-reference AGBD
// (AlphaEarth embeddings biomass model, >10% difference) are included here
// and highlighted with a diagonal cross-hatch pattern (in the parent
// sub-group's color). Types flagged "similar", "lower" or "no_reference"
// still show their full ecosystem area (in ecosystems.geojson / the
// sub-group layer) but get no reference-site overlay - see the
// "Reference biomass" flag shown in their popup instead.
// ---------------------------------------------------------------------
const refLayersByEcotype = {};      // EnglishNam -> Leaflet layer (added/removed individually)
const refLayersBySubgroup = {};     // sub_group_label -> [Leaflet layers]
let refGeojsonData;

let selectedRefLayer = null;   // currently highlighted reference site layer

fetch('data/reference_sites.geojson')
  .then(r => r.json())
  .then(geojson => {
    refGeojsonData = geojson;
    geojson.features.forEach(feature => {
      const p = feature.properties;
      const color = p.color || '#33cc33';
      const angle = p.hatch_angle !== undefined ? p.hatch_angle : 45;

      const pattern = new L.StripePattern({
        weight: 3,
        spaceWeight: 4,
        color: '#ffffff',
        opacity: 0.9,
        spaceOpacity: 0,
        angle: angle,
      });
      pattern.addTo(map);

      const normalStyle = { color: color, weight: 2, dashArray: '6 4', fillPattern: pattern, fillOpacity: 1 };
      const selectedStyle = { color: '#1a6fdb', weight: 3.5, dashArray: null, fillPattern: pattern, fillOpacity: 1 };

      const layer = L.geoJSON(feature, {
        style: normalStyle,
        pane: 'refSitesPane',
      }).bindPopup(`<b>${p.EnglishNam}</b><br/><span class="muted">${p.group_label}</span>`);

      layer.on('click', () => {
        // Deselect previous
        if (selectedRefLayer && selectedRefLayer !== layer) {
          selectedRefLayer.resetStyle();
        }
        // Select this one
        layer.setStyle(selectedStyle);
        layer.bringToFront();
        selectedRefLayer = layer;
      });

      refLayersByEcotype[p.EnglishNam] = layer;
      (refLayersBySubgroup[p.group_label] = refLayersBySubgroup[p.group_label] || []).push(layer);
      layer.addTo(map);
    });

    // Click on map background deselects
    map.on('click', e => {
      if (selectedRefLayer && !e.originalEvent._refLayerClicked) {
        selectedRefLayer.resetStyle();
        selectedRefLayer = null;
      }
    });

    buildLegend();
    setMode(currentMode);
  });

function buildLegend() {
  const legend = document.getElementById('legend');
  legend.innerHTML = '';

  // One swatch per ecosystem group present in reference sites
  const seen = new Set();
  refGeojsonData.features
    .slice()
    .sort((a, b) => a.properties.group_label.localeCompare(b.properties.group_label))
    .forEach(f => {
      const lbl = f.properties.group_label;
      if (seen.has(lbl)) return;
      seen.add(lbl);
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `
        <span class="legend-swatch" style="background:${f.properties.color}; background-image:repeating-linear-gradient(45deg, rgba(255,255,255,0.9), rgba(255,255,255,0.9) 2px, transparent 2px, transparent 6px); border: 2px dashed ${f.properties.color}"></span>
        <span>${lbl}</span>
      `;
      legend.appendChild(item);
    });

  const note = document.createElement('div');
  note.className = 'legend-note';
  note.innerHTML = `
    <hr/>
    <span class="flag-higher">&#9646; Colour</span> — validated reference ecosystem (biomass &gt;10% higher)<br/>
    <span style="color:#4a4a4a">&#9646; Dark grey</span> — did not qualify<br/>
    <span class="muted">Click an ecosystem type for details.</span>
  `;
  legend.appendChild(note);
}

// ---------------------------------------------------------------------
// Sub-group boundary polygons
// ---------------------------------------------------------------------
let subgroupLayer;
let labelLayer = L.layerGroup();
let subgroupColors = {};
const subgroupLayers = {}; // sub_group_label -> Leaflet layer

function defaultStyle(feature) {
  return {
    color: feature.properties.color || '#3388ff',
    weight: 1.5,
    fillColor: feature.properties.color || '#3388ff',
    fillOpacity: 0.12,
  };
}

function dimmedStyle(feature) {
  return {
    color: feature.properties.color || '#3388ff',
    weight: 0.5,
    fillColor: feature.properties.color || '#3388ff',
    fillOpacity: 0.03,
    opacity: 0.25,
  };
}

function highlightStyle(feature) {
  return {
    color: '#222',
    weight: 3,
    fillColor: feature.properties.color || '#3388ff',
    fillOpacity: 0.45,
  };
}

// Style for the individual ecosystem-type layer (composition mode):
// types whose reference-site AGBD is NOT "higher" than non-reference
// (similar / lower / no_reference) are shown filled grey (instead of their
// sub-group color), to flag that they have no highlighted reference-site
// overlay on the map.
function ecoStyle(feature) {
  const p = feature.properties;
  const qualifying = p.flag === 'higher';
  return {
    color: qualifying ? '#222' : '#aaaaaa',
    weight: qualifying ? 1.2 : 1.0,
    fillColor: qualifying ? (p.color || '#3388ff') : '#4a4a4a',
    fillOpacity: qualifying ? 1.0 : 0.7,
  };
}

Promise.all([
  fetch('data/subgroups.geojson').then(r => r.json()),
  fetch('data/group_colors.json').then(r => r.json()),
]).then(([geojson, colors]) => {
  subgroupColors = colors;

  subgroupLayer = L.geoJSON(geojson, {
    style: defaultStyle,
    onEachFeature: (feature, layer) => {
      subgroupLayers[feature.properties.sub_group_label] = layer;
      const p = feature.properties;
      let flagHtml = '';
      if (p.flag === 'lower') flagHtml = '<span class="flag-lower">⚠ Reference AGBD LOWER than non-reference</span>';
      else if (p.flag === 'similar') flagHtml = '<span class="flag-similar">~ Reference AGBD similar to non-reference</span>';
      else if (p.flag === 'higher') flagHtml = '<span class="flag-higher">Reference AGBD higher than non-reference (expected)</span>';

      layer.bindPopup(`
        <b>${p.group_label}</b><br/>
        <span class="muted">${p.group_label}</span>
        <table>
          <tr><td>Total area:</td><td>${fmt(p.total_area_km2)} km²</td></tr>
          <tr><td>Reference area:</td><td>${fmt(p.ref_area_km2)} km² (${fmt(p.pct_ref)}%)</td></tr>
          <tr><td>Reference AGBD:</td><td>${fmt(p.ae_ref_mean)} Mg/ha</td></tr>
          <tr><td>Non-ref. AGBD:</td><td>${fmt(p.ae_nonref_mean)} Mg/ha</td></tr>
          <tr><td>Difference:</td><td>${fmt(p.ae_rel_diff_pct)}%</td></tr>
        </table>
        ${flagHtml}
      `);

      // centroid label
      try {
        const center = layer.getBounds().getCenter();
        const marker = L.marker(center, {
          icon: L.divIcon({
            className: 'subgroup-label',
            html: p.group_label,
            iconSize: null,
          }),
          interactive: false,
        });
        labelLayer.addLayer(marker);
      } catch (e) { /* skip */ }
    },
  }).addTo(map);

  setMode(currentMode);
});

function focusEcotype(selectedName) {
  if (!ecosystemLayer) return;

  if (currentMode === 'composition') {
    if (!selectedName) {
      ecosystemLayer.eachLayer(layer => ecosystemLayer.resetStyle(layer));
      ecoLabelLayer.clearLayers();
      map.setView([-18.5, 35.5], 6);
      return;
    }
    let bounds = null;
    ecosystemLayer.eachLayer(layer => {
      if (layer.feature.properties.EnglishNam === selectedName) {
        layer.setStyle(highlightStyle(layer.feature));
        layer.bringToFront();
        bounds = layer.getBounds();
      } else {
        layer.setStyle(dimmedStyle(layer.feature));
      }
    });
    if (bounds) map.fitBounds(bounds, { padding: [20, 20] });

    // Show the label for this ecosystem type only
    ecoLabelLayer.clearLayers();
    const marker = ecoLabelMarkersByName[selectedName];
    if (marker) ecoLabelLayer.addLayer(marker);
    if (document.getElementById('toggleEcoLabels').checked) ecoLabelLayer.addTo(map);
    return;
  }

  // Reference mode: highlight/dim individual ecosystem-type polygons
  // (not sub-group boundaries)
  if (!selectedName) {
    ecosystemLayer.eachLayer(layer => ecosystemLayer.resetStyle(layer));
    Object.values(refLayersByEcotype).forEach(layer => {
      if (referenceSitesEnabled()) layer.addTo(map);
      else map.removeLayer(layer);
    });
    map.setView([-18.5, 35.5], 6);
    return;
  }

  let bounds = null;
  ecosystemLayer.eachLayer(layer => {
    if (layer.feature.properties.EnglishNam === selectedName) {
      layer.setStyle(highlightStyle(layer.feature));
      layer.bringToFront();
      bounds = layer.getBounds();
    } else {
      layer.setStyle(dimmedStyle(layer.feature));
    }
  });

  // Only show the reference site for the selected ecosystem type (if any
  // and if enabled)
  Object.entries(refLayersByEcotype).forEach(([enName, layer]) => {
    if (enName === selectedName && referenceSitesEnabled()) layer.addTo(map);
    else map.removeLayer(layer);
  });

  const selLayer = ecosystemLayersByName[selectedName];
  if (selLayer) {
    if (bounds) map.fitBounds(bounds, { padding: [20, 20] });
    selLayer.openPopup();
  }
}

// ---------------------------------------------------------------------
// Individual ecosystem-type polygons (composition review)
// ---------------------------------------------------------------------
let ecosystemLayer;
let ecoLabelLayer = L.layerGroup(); // currently-displayed label (for the focused ecosystem type)
let allEcoLabelLayer = L.layerGroup(); // labels for all ecosystem types (reference mode)
const ecosystemLayersBySubgroup = {}; // sub_group_label -> [Leaflet layers]
const ecosystemLayersByName = {}; // EnglishNam -> Leaflet layer
const ecoLabelMarkersBySubgroup = {}; // sub_group_label -> [Leaflet markers]
const ecoLabelMarkersByName = {}; // EnglishNam -> Leaflet marker

fetch('data/ecosystems.geojson')
  .then(r => r.json())
  .then(geojson => {
    ecosystemLayer = L.geoJSON(geojson, {
      style: feature => ecoStyle(feature),
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        (ecosystemLayersBySubgroup[p.group_label] = ecosystemLayersBySubgroup[p.group_label] || []).push(layer);
        ecosystemLayersByName[p.EnglishNam] = layer;

        const hasEnv = p.MAP_mm !== null && p.MAP_mm !== undefined && !Number.isNaN(p.MAP_mm);
        const estNote = p.env_estimated
          ? ` <i>(sub-group average; not directly measured for this type)</i>`
          : '';
        const envRows = hasEnv
          ? `
            <tr><td>Mean annual rainfall:</td><td>${fmt(p.MAP_mm)} mm${estNote}</td></tr>
            <tr><td>Mean annual temp:</td><td>${fmt(p.MAT_degC)} °C</td></tr>
            <tr><td>Rainfall seasonality:</td><td>${fmt(p.P_seasonality)}</td></tr>
            <tr><td>Dry-season EVI:</td><td>${fmt(p.EVI_dry)}</td></tr>
            <tr><td>Elevation:</td><td>${fmt(p.elev_m)} m</td></tr>
          `
          : `
            <tr><td colspan="2"><i>No environmental sub-grouping data
              (this sub-group was not split using environmental data)</i></td></tr>
          `;

        let flagHtml = '';
        if (p.flag === 'lower') flagHtml = '<span class="flag-lower">⚠ Reference AGBD LOWER than non-reference</span>';
        else if (p.flag === 'similar') flagHtml = '<span class="flag-similar">~ Reference AGBD similar to non-reference</span>';
        else if (p.flag === 'higher') flagHtml = '<span class="flag-higher">Reference AGBD higher than non-reference (highlighted on map)</span>';
        else flagHtml = '<span class="muted">No reference site identified for this type</span>';

        const biomassRows = (p.ae_ref_mean !== null && p.ae_ref_mean !== undefined && !Number.isNaN(p.ae_ref_mean))
          ? `
            <tr><td>Reference AGBD:</td><td>${fmt(p.ae_ref_mean)} Mg/ha</td></tr>
            <tr><td>Non-ref. AGBD:</td><td>${fmt(p.ae_nonref_mean)} Mg/ha</td></tr>
            <tr><td>Difference:</td><td>${fmt(p.ae_rel_diff_pct)}%</td></tr>
          `
          : '';

        layer.bindPopup(`
          <b>${p.EnglishNam}</b><br/>
          <span class="muted">Ecosystem group: ${p.group_label}</span>
          <table>
            <tr><td>Size:</td><td>${fmt(p.Size_ha)} ha</td></tr>
            ${envRows}
            <tr><td>Reference area:</td><td>${fmt(p.ref_area_km2)} km² (${fmt(p.pct_ref)}%)</td></tr>
            ${biomassRows}
          </table>
          ${flagHtml}
        `);

        // centroid label (not shown by default - only for the focused sub-group)
        try {
          const center = layer.getBounds().getCenter();
          const marker = L.marker(center, {
            icon: L.divIcon({
              className: 'subgroup-label',
              html: p.EnglishNam,
              iconSize: null,
            }),
            interactive: false,
          });
          (ecoLabelMarkersBySubgroup[p.group_label] = ecoLabelMarkersBySubgroup[p.group_label] || []).push(marker);
          ecoLabelMarkersByName[p.EnglishNam] = marker;
          allEcoLabelLayer.addLayer(marker);
        } catch (e) { /* skip */ }
      },
    });

    // Populate the "focus" dropdown with the individual ecosystem types
    // (146), grouped by ecosystem group then sub-group, since reference
    // sites are now identified per ecosystem type. Types with a validated
    // ("higher") reference site are listed first (grouped as normal);
    // types with no highlighted reference site (similar / lower /
    // no_reference) are listed afterwards in their own section.
    const select = document.getElementById('subgroupSelect');

    const addGroupedOptions = (features, labelSuffix) => {
      const byGroup = {};
      features.forEach(f => {
        const g = f.properties.group_label || 'Other';
        (byGroup[g] = byGroup[g] || []).push(f.properties);
      });
      Object.keys(byGroup).sort().forEach(groupLabel => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = labelSuffix ? `${groupLabel} ${labelSuffix}` : groupLabel;
        byGroup[groupLabel]
          .sort((a, b) => a.sub_group_label.localeCompare(b.sub_group_label) || a.EnglishNam.localeCompare(b.EnglishNam))
          .forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.EnglishNam;
            const sgNum = (p.group_label.match(/SG\d+/) || [''])[0];
            opt.textContent = sgNum ? `${p.EnglishNam} (${sgNum})` : p.EnglishNam;
            optgroup.appendChild(opt);
          });
        select.appendChild(optgroup);
      });
    };

    const higherFeatures = geojson.features.filter(f => f.properties.flag === 'higher');
    const otherFeatures = geojson.features.filter(f => f.properties.flag !== 'higher');

    addGroupedOptions(higherFeatures, '');
    if (otherFeatures.length) {
      const divider = document.createElement('optgroup');
      divider.label = '─── No validated reference site ───';
      select.appendChild(divider);
      addGroupedOptions(otherFeatures, '(no validated reference site)');
    }

    select.addEventListener('change', () => focusEcotype(select.value));

    setMode(currentMode);
  });

document.getElementById('toggleEcosystems').addEventListener('change', e => {
  if (!ecosystemLayer) return;
  if (e.target.checked) ecosystemLayer.addTo(map);
  else map.removeLayer(ecosystemLayer);
});

document.getElementById('toggleEcoLabels').addEventListener('change', e => {
  if (e.target.checked) allEcoLabelLayer.addTo(map);
  else map.removeLayer(allEcoLabelLayer);
});

// ---------------------------------------------------------------------
// Review-step (mode) switching
// ---------------------------------------------------------------------
let currentMode = 'composition';

function setMode(mode) {
  currentMode = mode;
  const isComposition = mode === 'composition';

  document.getElementById('compositionPanel').style.display = isComposition ? '' : 'none';
  document.getElementById('referencePanel').style.display = isComposition ? 'none' : '';

  // Reference site layers (and their patterns) - hidden entirely in
  // composition mode; in reference mode, focusEcotype() controls which
  // ecosystem type's reference site is shown
  if (isComposition) {
    Object.values(refLayersByEcotype).forEach(layer => map.removeLayer(layer));
  }

  // Sub-group boundary layer is no longer shown on the map (reference
  // sites are now reviewed per individual ecosystem type)
  if (subgroupLayer) map.removeLayer(subgroupLayer);
  map.removeLayer(labelLayer);

  // Ecosystem-type layer - shown in both modes (composition mode controlled
  // by "Individual ecosystem types"; reference mode by "Ecosystem type
  // boundaries")
  if (ecosystemLayer) {
    const ecoOn = isComposition
      ? document.getElementById('toggleEcosystems').checked
      : document.getElementById('toggleSubgroups').checked;
    if (ecoOn) ecosystemLayer.addTo(map);
    else map.removeLayer(ecosystemLayer);
  }

  // Ecosystem-type labels: both modes use allEcoLabelLayer for all labels
  const showLabels = isComposition
    ? document.getElementById('toggleEcoLabels').checked
    : document.getElementById('toggleLabels').checked;
  if (showLabels) allEcoLabelLayer.addTo(map);
  else map.removeLayer(allEcoLabelLayer);
  map.removeLayer(ecoLabelLayer);  // single-focus label not used

  // Re-apply focus highlighting for the new mode
  focusEcotype(document.getElementById("subgroupSelect").value);
}

document.getElementById('modeComposition').addEventListener('change', () => setMode('composition'));
document.getElementById('modeReference').addEventListener('change', () => setMode('reference'));

function referenceSitesEnabled() {
  const el = document.getElementById('toggleReferenceSites');
  return !el || el.checked;
}

document.getElementById('toggleReferenceSites').addEventListener('change', () => {
  if (currentMode === 'composition') return;
  const selectedName = document.getElementById("subgroupSelect").value;
  const enabled = referenceSitesEnabled();
  Object.entries(refLayersByEcotype).forEach(([enName, layer]) => {
    if (enabled && (!selectedName || enName === selectedName)) layer.addTo(map);
    else map.removeLayer(layer);
  });
});

document.getElementById('toggleSubgroups').addEventListener('change', e => {
  if (!ecosystemLayer || currentMode === 'composition') return;
  if (e.target.checked) ecosystemLayer.addTo(map);
  else map.removeLayer(ecosystemLayer);
});

document.getElementById('toggleLabels').addEventListener('change', e => {
  if (currentMode === 'composition') return;
  if (e.target.checked) allEcoLabelLayer.addTo(map);
  else map.removeLayer(allEcoLabelLayer);
});

function fmt(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return 'n/a';
  return v;
}

// ---------------------------------------------------------------------
// Drawing tools + feedback form
// ---------------------------------------------------------------------
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  edit: { featureGroup: drawnItems, remove: true },
  draw: {
    polygon: { allowIntersection: false, showArea: true },
    polyline: true,
    rectangle: true,
    circle: false,
    circlemarker: false,
    marker: true,
  },
});
map.addControl(drawControl);

let pendingLayer = null;

map.on(L.Draw.Event.CREATED, e => {
  pendingLayer = e.layer;
  drawnItems.addLayer(pendingLayer);
  openFeedbackForm(pendingLayer);
});

const feedbackForm = document.getElementById('feedbackForm');
const formSubgroups = document.getElementById('formSubgroups');
const formCategory = document.getElementById('formCategory');
const formComment = document.getElementById('formComment');
const formStatus = document.getElementById('formStatus');

function openFeedbackForm(layer) {
  formStatus.textContent = '';
  formComment.value = '';
  formCategory.selectedIndex = 0;

  // Determine which individual ecosystem types intersect this shape
  const matches = [];
  const sourceLayer = ecosystemLayer;
  if (sourceLayer) {
    let drawnGeoJSON;
    try {
      drawnGeoJSON = layer.toGeoJSON();
      // Convert points/markers to a tiny buffer so turf.intersect works for "contains" checks
      let testGeom = drawnGeoJSON;
      if (drawnGeoJSON.geometry.type === 'Point') {
        testGeom = turf.buffer(drawnGeoJSON, 0.001, { units: 'degrees' });
      }
      sourceLayer.eachLayer(sgLayer => {
        const sgGeoJSON = sgLayer.toGeoJSON();
        try {
          const intersects = turf.booleanIntersects(testGeom, sgGeoJSON);
          if (intersects) {
            const p = sgLayer.feature.properties;
            matches.push(`${p.EnglishNam} (${p.group_label})`);
          }
        } catch (err) { /* ignore geometry errors */ }
      });
    } catch (err) { /* ignore */ }
  }

  formSubgroups.textContent = matches.length ? matches.join(', ') : '(none detected — please mention in comment)';
  feedbackForm.dataset.subgroups = JSON.stringify(matches);
  feedbackForm.classList.remove('hidden');
}

document.getElementById('formCancel').addEventListener('click', () => {
  if (pendingLayer) {
    drawnItems.removeLayer(pendingLayer);
    pendingLayer = null;
  }
  feedbackForm.classList.add('hidden');
});

document.getElementById('formSubmit').addEventListener('click', () => {
  const expertName = document.getElementById('expertName').value.trim();
  if (!expertName) {
    formStatus.textContent = 'Please enter your name in the sidebar before submitting.';
    formStatus.style.color = '#c0392b';
    return;
  }
  if (!pendingLayer) return;

  const record = {
    timestamp: new Date().toISOString(),
    expert_name: expertName,
    category: formCategory.value,
    comment: formComment.value.trim(),
    sub_groups: JSON.parse(feedbackForm.dataset.subgroups || '[]').join('; '),
    geometry_type: pendingLayer.toGeoJSON().geometry.type,
    geometry_geojson: JSON.stringify(pendingLayer.toGeoJSON().geometry),
    map_url: window.location.href,
  };

  formStatus.textContent = 'Submitting...';
  formStatus.style.color = '#666';

  submitFeedback(record)
    .then(() => {
      formStatus.textContent = 'Submitted. Thank you!';
      formStatus.style.color = '#1a7a1a';
      addFeedbackToList(record);
      pendingLayer.bindPopup(`<b>${record.category}</b><br/>${record.comment || ''}<br/><i>${record.expert_name}</i>`);
      pendingLayer = null;
      setTimeout(() => feedbackForm.classList.add('hidden'), 900);
    })
    .catch(err => {
      formStatus.textContent = 'Submission failed: ' + err + '. (Check config.js endpoint URL.)';
      formStatus.style.color = '#c0392b';
    });
});

function submitFeedback(record) {
  if (!FEEDBACK_ENDPOINT_URL || FEEDBACK_ENDPOINT_URL.startsWith('PASTE_')) {
    return Promise.reject('feedback endpoint not configured');
  }
  // Apps Script web apps don't handle CORS preflight, so we POST as
  // text/plain (a "simple request" - no preflight) and read doPost(e.postData.contents)
  return fetch(FEEDBACK_ENDPOINT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(record),
  });
}

function addFeedbackToList(record) {
  const list = document.getElementById('feedbackList');
  if (list.querySelector('.muted')) list.innerHTML = '';
  const item = document.createElement('div');
  item.className = 'feedback-item';
  item.innerHTML = `<b>${record.category}</b><br/>${record.sub_groups || '(no sub-group detected)'}<br/>${record.comment}`;
  list.prepend(item);
}
