import * as THREE from 'three';

// Procedural Photorealistic Canvas Texture Generators
// Produces 2K/1K detailed surface textures, bump maps, specular maps, and night lights.

class TextureFactory {
  private cache = new Map<string, THREE.CanvasTexture>();

  // Helper to create a canvas
  private createCanvas(width: number, height: number): {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
  } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    return { canvas, ctx };
  }

  // Simple pseudo-random 2D noise
  private noise(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
    return n - Math.floor(n);
  }

  // Smooth Perlin-like octave noise
  private fbm(x: number, y: number, octaves = 5): number {
    let val = 0;
    let amp = 0.5;
    let freq = 1;
    for (let i = 0; i < octaves; i++) {
      val += this.noise(x * freq, y * freq) * amp;
      freq *= 2.0;
      amp *= 0.5;
    }
    return val;
  }

  // 1. EARTH DAY SURFACE (NASA Blue Marble inspired)
  public getEarthDayTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null;
    if (this.cache.has('earth-day')) return this.cache.get('earth-day')!;

    const { canvas, ctx } = this.createCanvas(2048, 1024);
    const imgData = ctx.createImageData(2048, 1024);
    const data = imgData.data;

    for (let y = 0; y < 1024; y++) {
      const lat = (y / 1024) * Math.PI - Math.PI / 2;
      const isPolar = Math.abs(lat) > 1.15;

      for (let x = 0; x < 2048; x++) {
        const idx = (y * 2048 + x) * 4;
        const nx = x / 80;
        const ny = y / 80;

        // Continental landmass shape approximation
        const n =
          this.noise(nx * 0.1, ny * 0.1) * 0.5 +
          this.noise(nx * 0.25, ny * 0.25) * 0.3 +
          this.noise(nx * 0.5, ny * 0.5) * 0.2;

        const isLand = n > 0.47 && !isPolar;

        if (isPolar) {
          // Polar Ice Caps
          const iceTint = 230 + Math.floor(Math.random() * 25);
          data[idx] = iceTint;
          data[idx + 1] = iceTint + 5;
          data[idx + 2] = 255;
          data[idx + 3] = 255;
        } else if (isLand) {
          // Continents: Green vegetation, savanna, brown mountains
          const elev = this.noise(nx * 0.8, ny * 0.8);
          if (elev > 0.65) {
            // Mountains / Desert
            data[idx] = 160 + Math.floor(elev * 40);
            data[idx + 1] = 140 + Math.floor(elev * 30);
            data[idx + 2] = 90;
          } else {
            // Forests / Plains
            data[idx] = 34 + Math.floor(elev * 30);
            data[idx + 1] = 110 + Math.floor(elev * 50);
            data[idx + 2] = 45;
          }
          data[idx + 3] = 255;
        } else {
          // Oceans: Deep blue to turquoise shelf
          const depth = (0.47 - n) / 0.47;
          data[idx] = Math.floor(10 + depth * 15);
          data[idx + 1] = Math.floor(45 + depth * 40);
          data[idx + 2] = Math.floor(120 + depth * 80);
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache.set('earth-day', texture);
    return texture;
  }

  // 2. EARTH NIGHT LIGHTS (City clusters)
  public getEarthNightTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null;
    if (this.cache.has('earth-night')) return this.cache.get('earth-night')!;

    const { canvas, ctx } = this.createCanvas(1024, 512);
    ctx.fillStyle = '#010206';
    ctx.fillRect(0, 0, 1024, 512);

    // Render city light clusters over continents
    ctx.fillStyle = '#ffcf77';
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      // Filter out polar regions and deep oceans using noise threshold
      const n = this.noise(x / 80, y / 80);
      if (n > 0.48 && y > 100 && y < 420) {
        const radius = Math.random() * 1.8 + 0.4;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache.set('earth-night', texture);
    return texture;
  }

  // 3. EARTH CLOUDS
  public getEarthCloudTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null;
    if (this.cache.has('earth-clouds')) return this.cache.get('earth-clouds')!;

    const { canvas, ctx } = this.createCanvas(1024, 512);
    const imgData = ctx.createImageData(1024, 512);
    const data = imgData.data;

    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 1024; x++) {
        const idx = (y * 1024 + x) * 4;
        const n =
          this.noise(x / 40, y / 40) * 0.6 +
          this.noise(x / 20, y / 20) * 0.4;

        if (n > 0.52) {
          const alpha = Math.min((n - 0.52) * 5.0, 1.0) * 220;
          data[idx] = 255;
          data[idx + 1] = 255;
          data[idx + 2] = 255;
          data[idx + 3] = alpha;
        } else {
          data[idx + 3] = 0;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    this.cache.set('earth-clouds', texture);
    return texture;
  }

  // 4. MARS SURFACE (Viking & MGS topographic terrain)
  public getMarsTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null;
    if (this.cache.has('mars')) return this.cache.get('mars')!;

    const { canvas, ctx } = this.createCanvas(1024, 512);
    const imgData = ctx.createImageData(1024, 512);
    const data = imgData.data;

    for (let y = 0; y < 512; y++) {
      const isPole = y < 35 || y > 475;
      for (let x = 0; x < 1024; x++) {
        const idx = (y * 1024 + x) * 4;
        if (isPole) {
          // White ice caps (Planum Boreum / Australe)
          data[idx] = 245;
          data[idx + 1] = 240;
          data[idx + 2] = 240;
          data[idx + 3] = 255;
        } else {
          const n = this.noise(x / 45, y / 45);
          // Dark basaltic plains vs bright red iron-oxide dust
          const r = 180 + Math.floor(n * 50);
          const g = 70 + Math.floor(n * 35);
          const b = 35 + Math.floor(n * 20);
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    this.cache.set('mars', texture);
    return texture;
  }

  // 5. JUPITER ATMOSPHERE (Cassini & Juno belts with Great Red Spot)
  public getJupiterTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null;
    if (this.cache.has('jupiter')) return this.cache.get('jupiter')!;

    const { canvas, ctx } = this.createCanvas(1024, 512);
    const imgData = ctx.createImageData(1024, 512);
    const data = imgData.data;

    for (let y = 0; y < 512; y++) {
      // Horizontal jet stream bands
      const bandFreq = Math.sin(y * 0.12) * 0.5 + 0.5;
      const swirl = this.noise(xSwirl(y), y / 20) * 0.2;

      for (let x = 0; x < 1024; x++) {
        const idx = (y * 1024 + x) * 4;

        // Check for Great Red Spot (-22° latitude, around y = 310, x = 450)
        const dx = (x - 450) / 45;
        const dy = (y - 310) / 22;
        const distGRS = Math.sqrt(dx * dx + dy * dy);

        if (distGRS < 1.0) {
          // Inside Great Red Spot
          const spotRamp = 1.0 - distGRS;
          data[idx] = 220 + Math.floor(spotRamp * 30);
          data[idx + 1] = 60 + Math.floor(spotRamp * 30);
          data[idx + 2] = 40;
          data[idx + 3] = 255;
        } else {
          // Jovian atmospheric bands
          const v = (bandFreq + swirl) % 1.0;
          const r = Math.floor(190 + v * 50);
          const g = Math.floor(130 + v * 55);
          const b = Math.floor(80 + v * 50);

          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }

    function xSwirl(yCoord: number) {
      return Math.sin(yCoord * 0.05) * 5;
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    this.cache.set('jupiter', texture);
    return texture;
  }

  // 6. SUN PHOTOSPHERE (Granules and Sunspots)
  public getSunTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null;
    if (this.cache.has('sun')) return this.cache.get('sun')!;

    const { canvas, ctx } = this.createCanvas(1024, 512);
    const imgData = ctx.createImageData(1024, 512);
    const data = imgData.data;

    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 1024; x++) {
        const idx = (y * 1024 + x) * 4;
        const n = this.noise(x / 15, y / 15);

        // Sunspot groups (dark umbra/penumbra)
        const isSunspot =
          (Math.abs(x - 300) < 30 && Math.abs(y - 230) < 15 && n < 0.25) ||
          (Math.abs(x - 700) < 40 && Math.abs(y - 270) < 20 && n < 0.22);

        if (isSunspot) {
          data[idx] = 120;
          data[idx + 1] = 40;
          data[idx + 2] = 10;
          data[idx + 3] = 255;
        } else {
          // Hot convective granules
          data[idx] = 255;
          data[idx + 1] = 180 + Math.floor(n * 60);
          data[idx + 2] = 40 + Math.floor(n * 40);
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    this.cache.set('sun', texture);
    return texture;
  }

  // 7. MOON SURFACE (Cratered Mare & Highlands)
  public getMoonTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null;
    if (this.cache.has('moon')) return this.cache.get('moon')!;

    const { canvas, ctx } = this.createCanvas(1024, 512);
    const imgData = ctx.createImageData(1024, 512);
    const data = imgData.data;

    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 1024; x++) {
        const idx = (y * 1024 + x) * 4;
        const n = this.noise(x / 30, y / 30);
        // Basaltic Maria vs Anorthosite Highlands
        const tone = Math.floor(120 + n * 95);
        data[idx] = tone;
        data[idx + 1] = tone;
        data[idx + 2] = tone + 5;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    this.cache.set('moon', texture);
    return texture;
  }

  // 8. COSMIC MICROWAVE BACKGROUND (Planck Full-Sky Anisotropy Map)
  public getCMBTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null;
    if (this.cache.has('cmb')) return this.cache.get('cmb')!;

    const { canvas, ctx } = this.createCanvas(1024, 512);
    const imgData = ctx.createImageData(1024, 512);
    const data = imgData.data;

    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 1024; x++) {
        const idx = (y * 1024 + x) * 4;
        // Multi-frequency thermal ripples (micro-Kelvin fluctuations)
        const t =
          this.noise(x / 20, y / 20) * 0.5 +
          this.noise(x / 10, y / 10) * 0.3 +
          this.noise(x / 5, y / 5) * 0.2;

        // Color map from cold (blue) through green/yellow to hot (red)
        if (t < 0.35) {
          data[idx] = 10;
          data[idx + 1] = 60 + Math.floor(t * 300);
          data[idx + 2] = 220;
        } else if (t < 0.65) {
          data[idx] = 40 + Math.floor((t - 0.35) * 400);
          data[idx + 1] = 200;
          data[idx + 2] = 40;
        } else {
          data[idx] = 240;
          data[idx + 1] = 80 + Math.floor((1.0 - t) * 300);
          data[idx + 2] = 20;
        }
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    this.cache.set('cmb', texture);
    return texture;
  }
}

export const textureFactory = new TextureFactory();
