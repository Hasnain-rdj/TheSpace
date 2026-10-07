import fs from 'node:fs';
import https from 'node:https';

const TARGETS = [
  { query: 'andromeda galaxy hubble', out: 'public/textures/andromeda.jpg' },
  { query: 'sagittarius a event horizon', out: 'public/textures/sgra.jpg' },
  { query: 'planck cosmic microwave background', out: 'public/textures/cmb.jpg' },
  { query: 'kepler 186f', out: 'public/textures/kepler186f.jpg' },
  { query: 'trappist 1e', out: 'public/textures/trappist1e.jpg' },
  { query: 'black hole accretion disk simulation', out: 'public/textures/blackhole.jpg' },
  { query: 'hd 189733b blue', out: 'public/textures/hd189733b.jpg' },
  { query: 'saturn rings backlit cassini', out: 'public/textures/saturn_rings.jpg' },
];

function fetchNasaImage(query) {
  return new Promise((resolve, reject) => {
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`;
    https.get(url, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const items = json.collection?.items || [];
          for (const it of items) {
            const link = it.links?.find((l) => l.render === 'image' || l.href?.endsWith('.jpg') || l.href?.endsWith('.png'));
            if (link?.href) {
              return resolve({ href: link.href, title: it.data?.[0]?.title, description: it.data?.[0]?.description });
            }
          }
          resolve(null);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve(fs.statSync(dest).size);
      });
    }).on('error', reject);
  });
}

async function main() {
  for (const t of TARGETS) {
    try {
      console.log(`Searching NASA API for: "${t.query}"...`);
      const result = await fetchNasaImage(t.query);
      if (result?.href) {
        console.log(`Found: "${result.title}" -> ${result.href}`);
        const size = await downloadFile(result.href, t.out);
        console.log(`Saved ${t.out} (${size} bytes)`);
      } else {
        console.log(`No results found for "${t.query}"`);
      }
    } catch (err) {
      console.error(`Error for "${t.query}":`, err.message);
    }
  }
}

main();
