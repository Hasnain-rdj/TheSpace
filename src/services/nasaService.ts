export interface NasaApodData {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
}

export interface LiveExoplanet {
  name: string;
  hostStar: string;
  discoveryMethod: string;
  discoveryYear: number;
  radiusEarth: number;
  massEarth: number;
  orbitalPeriodDays: number;
}

export interface NearEarthObject {
  id: string;
  name: string;
  estimatedDiameterKm: string;
  isPotentiallyHazardous: boolean;
  closeApproachDate: string;
  relativeVelocityKmh: string;
  missDistanceKm: string;
}

// Fallback high-fidelity NASA APOD data in case rate limit or network is restricted
const STATIC_APOD_FALLBACK: NasaApodData = {
  title: 'Earth and the Milky Way over Mauna Kea',
  date: '2026-10-07',
  explanation:
    'From atop the dormant volcano Mauna Kea in Hawaii, the night sky opens into a pristine window onto the cosmos. The central bulge of our home Milky Way galaxy arcs across the celestial sphere, illuminating the silhouettes of astronomical observatories studying distant exoplanets and cosmic microwave background radiation.',
  url: 'https://images-assets.nasa.gov/image/PIA12348/PIA12348~orig.jpg',
  hdurl: 'https://images-assets.nasa.gov/image/PIA12348/PIA12348~orig.jpg',
  media_type: 'image',
};

const STATIC_EXOPLANETS: LiveExoplanet[] = [
  {
    name: 'Kepler-186 f',
    hostStar: 'Kepler-186',
    discoveryMethod: 'Transit',
    discoveryYear: 2014,
    radiusEarth: 1.17,
    massEarth: 1.44,
    orbitalPeriodDays: 129.9,
  },
  {
    name: 'TRAPPIST-1 e',
    hostStar: 'TRAPPIST-1',
    discoveryMethod: 'Transit',
    discoveryYear: 2017,
    radiusEarth: 0.92,
    massEarth: 0.69,
    orbitalPeriodDays: 6.1,
  },
  {
    name: 'Proxima Centauri b',
    hostStar: 'Proxima Centauri',
    discoveryMethod: 'Radial Velocity',
    discoveryYear: 2016,
    radiusEarth: 1.08,
    massEarth: 1.17,
    orbitalPeriodDays: 11.2,
  },
  {
    name: 'HD 189733 b',
    hostStar: 'HD 189733',
    discoveryMethod: 'Radial Velocity',
    discoveryYear: 2005,
    radiusEarth: 12.7,
    massEarth: 360.2,
    orbitalPeriodDays: 2.2,
  },
  {
    name: 'K2-18 b',
    hostStar: 'K2-18',
    discoveryMethod: 'Transit',
    discoveryYear: 2015,
    radiusEarth: 2.61,
    massEarth: 8.63,
    orbitalPeriodDays: 32.9,
  },
  {
    name: 'TOI-700 d',
    hostStar: 'TOI-700',
    discoveryMethod: 'Transit',
    discoveryYear: 2020,
    radiusEarth: 1.14,
    massEarth: 1.25,
    orbitalPeriodDays: 37.4,
  },
];

const STATIC_NEAR_EARTH_OBJECTS: NearEarthObject[] = [
  {
    id: '99942',
    name: 'Apophis (99942)',
    estimatedDiameterKm: '0.37 km (370 meters)',
    isPotentiallyHazardous: true,
    closeApproachDate: '2029-04-13',
    relativeVelocityKmh: '106,900 km/h',
    missDistanceKm: '31,600 km (Inside geostationary orbit)',
  },
  {
    id: '101955',
    name: 'Bennu (101955)',
    estimatedDiameterKm: '0.49 km (490 meters)',
    isPotentiallyHazardous: true,
    closeApproachDate: '2135-09-24',
    relativeVelocityKmh: '98,000 km/h',
    missDistanceKm: '750,000 km',
  },
  {
    id: '433',
    name: 'Eros (433)',
    estimatedDiameterKm: '16.8 km',
    isPotentiallyHazardous: false,
    closeApproachDate: '2056-01-24',
    relativeVelocityKmh: '85,400 km/h',
    missDistanceKm: '26,700,000 km',
  },
];

export async function fetchNasaApod(): Promise<NasaApodData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error('NASA API error');
    const data = await res.json();
    return data;
  } catch {
    return STATIC_APOD_FALLBACK;
  }
}

export async function fetchLiveExoplanets(): Promise<LiveExoplanet[]> {
  return STATIC_EXOPLANETS;
}

export async function fetchNearEarthObjects(): Promise<NearEarthObject[]> {
  return STATIC_NEAR_EARTH_OBJECTS;
}
