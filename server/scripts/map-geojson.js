#!/usr/bin/env npx tsx

import process from "node:process";
import fs from "node:fs";
import * as csv from "csv-parse";
import { wktToGeoJSON } from "@terraformer/wkt";

const usage = `
usage:
  ./scripts/map-geojson.js <input.csv>

info:
  generate GeoJSON from the Google My Maps CSV file
`;

const [filename = "input.csv"] = process.argv.slice(2);

// Stop and output help if requested
if (process.argv.includes("--help")) {
  console.log(usage.trim());
  process.exit();
}

/** @type {any} */
const output = {
  type: "FeatureCollection",
  features: [],
};

/** @type {any} */
const themes = {
  "zone a": "red",
  "zone b": "yellow",
  "zone c": "green",
  "zone d": "blue",
  "zone e": "purple",
  "zone f": "magenta",
};

/** @param {string} name */
function getTheme(name) {
  if (/^A\d/.test(name)) return "red";
  if (/^B\d/.test(name)) return "yellow";
  if (/^C\d/.test(name)) return "green";
  if (/^D\d/.test(name)) return "blue";
  if (/^E\d/.test(name)) return "purple";
  if (/^F\d/.test(name)) return "magenta";

  return themes[name.toLowerCase()] ?? "black";
}

/** @type {any} */
const icons = {
  medic: "medic",
  toilet: "toilet",
  toilets: "toilet",
  food: "food",
  "food truck": "food",
  "food trucks": "food",
};

/** @param {string} name */
function getIcon(name) {
  return icons[name.toLowerCase()] ?? undefined;
}

/** @type {any} */
const themeProperties = {
  black: { theme: "#000000" },
  red: { theme: "#E65100" },
  yellow: { theme: "#FFD600" },
  green: { theme: "#109D58" },
  blue: { theme: "#0188D1" },
  purple: { theme: "#9C27B0" },
  magenta: { theme: "#C2185B" },
};

fs.createReadStream(filename, "utf8")
  .pipe(csv.parse({ columns: true }))
  .on("data", (data) => {
    output.features.push({
      type: "Feature",
      geometry: wktToGeoJSON(data.WKT),
      properties: {
        title: data.name,
        description: data.description,
        icon: getIcon(data.name),
        ...themeProperties[getTheme(data.name)],
      },
    });
  })
  .on("end", () => {
    console.log(JSON.stringify(output, null, 2));
  });
