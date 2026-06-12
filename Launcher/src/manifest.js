const manifestUrl = process.env.MANIFEST_URL || "http://localhost:8080/launcher/manifest";

const response = await fetch(manifestUrl);
if (!response.ok) {
  throw new Error(`Manifest request failed: ${response.status}`);
}

const manifest = await response.json();
console.log(JSON.stringify(manifest, null, 2));

