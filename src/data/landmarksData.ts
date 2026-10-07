export interface SurfaceLandmark {
  id: string;
  bodyId: string;
  name: string;
  category:
    | 'mountain'
    | 'crater'
    | 'volcano'
    | 'canyon'
    | 'storm'
    | 'spaceport'
    | 'ocean'
    | 'landmark'
    | 'anomaly';
  latitude: number; // degrees -90 to 90
  longitude: number; // degrees -180 to 180
  elevation: string;
  diameter?: string;
  description: string;
  scientificValue: string;
  discoveredOrEstablished?: string;
}

export const SURFACE_LANDMARKS: SurfaceLandmark[] = [
  // ==========================================
  // EARTH LANDMARKS (Google Earth & Maps Parity)
  // ==========================================
  {
    id: 'earth-everest',
    bodyId: 'earth',
    name: 'Mount Everest (Chomolungma)',
    category: 'mountain',
    latitude: 27.9881,
    longitude: 86.925,
    elevation: '+8,848.86 m (Highest on Earth)',
    description:
      'Earth’s highest mountain above sea level, located in the Mahalangur Himal sub-range of the Himalayas. Formed by the ongoing tectonic collision between the Indian and Eurasian continental plates.',
    scientificValue:
      'Tectonic uplift continues at ~4 mm per year. Geological samples reveal Ordovician limestone at the summit, proving marine seabed origin before orogeny.',
    discoveredOrEstablished: 'First summitted 1953 by Hillary & Norgay',
  },
  {
    id: 'earth-mariana-trench',
    bodyId: 'earth',
    name: 'Challenger Deep (Mariana Trench)',
    category: 'ocean',
    latitude: 11.3493,
    longitude: 142.1996,
    elevation: '-10,994 m (Deepest Abyssal Trench)',
    description:
      'The deepest known point in Earth’s oceans, situated in the western Pacific Ocean. The hydrostatic pressure exceeds 1,086 bar (1,071 atm), over 1,000 times standard sea-level atmospheric pressure.',
    scientificValue:
      'Hosts unique barophilic and piezophilic extremophiles, xenophyophores, and amphipods thriving in super-saline cold seep ecosystems.',
    discoveredOrEstablished: 'HMS Challenger (1875)',
  },
  {
    id: 'earth-grand-canyon',
    bodyId: 'earth',
    name: 'Grand Canyon Gorge',
    category: 'canyon',
    latitude: 36.0544,
    longitude: -112.1401,
    elevation: '+2,100 m (rim) to +750 m (river)',
    description:
      'A steep-sided gorge carved by the Colorado River in Arizona, USA. Measures 446 km long, up to 29 km wide, and attains a depth exceeding 1,800 meters.',
    scientificValue:
      'Exposes nearly two billion years of Earth’s geological history across pristine strata layers from the Vishnu Basement Rocks to Kaibab Limestone.',
  },
  {
    id: 'earth-ksc',
    bodyId: 'earth',
    name: 'NASA Kennedy Space Center (LC-39A)',
    category: 'spaceport',
    latitude: 28.5729,
    longitude: -80.649,
    elevation: '+3 m (Sea Level Launchpad)',
    description:
      'NASA’s primary launch center for human spaceflight, departure site for Apollo 11 to the Moon and dozens of Space Shuttle and Artemis missions.',
    scientificValue:
      'Cradle of human space exploration, situated at 28°N latitude to exploit Earth’s rotational tangential velocity (+1,470 km/h) for orbital insertions.',
    discoveredOrEstablished: 'Established 1962',
  },
  {
    id: 'earth-cern',
    bodyId: 'earth',
    name: 'CERN Large Hadron Collider',
    category: 'landmark',
    latitude: 46.233,
    longitude: 6.0557,
    elevation: '+450 m (-100 m subterranean)',
    description:
      'The world’s largest and highest-energy particle collider, consisting of a 27-kilometer ring of superconducting magnets beneath the Franco-Swiss border.',
    scientificValue:
      'Probes fundamental physics, discovered the Higgs Boson in 2012, searches for supersymmetric particles, dark matter candidates, and extra spatial dimensions.',
    discoveredOrEstablished: 'First beam 2008',
  },
  {
    id: 'earth-giza',
    bodyId: 'earth',
    name: 'Great Pyramid of Giza',
    category: 'landmark',
    latitude: 29.9792,
    longitude: 31.1342,
    elevation: '+60 m (Giza Plateau)',
    description:
      'The oldest and largest of the Giza pyramids in Egypt, aligned with true north within 3/60ths of a degree precision.',
    scientificValue:
      'Demonstrates remarkable ancient astronomical alignments to polar stars Thuban and Orion’s Belt constellations.',
    discoveredOrEstablished: 'c. 2560 BCE',
  },

  // ==========================================
  // MARS LANDMARKS (Google Mars & In-Situ Rovers)
  // ==========================================
  {
    id: 'mars-olympus-mons',
    bodyId: 'mars',
    name: 'Olympus Mons',
    category: 'volcano',
    latitude: 18.65,
    longitude: -133.8,
    elevation: '+21,287 m (Tallest Planetary Volcano)',
    diameter: '624 km across (Size of France)',
    description:
      'A colossal shield volcano on Mars, standing roughly two and a half times the height of Mount Everest above sea level and covering an area comparable to the British Isles.',
    scientificValue:
      'Grew to monstrous proportions due to the absence of mobile tectonic plates on Mars, allowing a stationary mantle hotspot to extrude basaltic lava for hundreds of millions of years.',
  },
  {
    id: 'mars-valles-marineris',
    bodyId: 'mars',
    name: 'Valles Marineris (The Grand Chasm)',
    category: 'canyon',
    latitude: -13.9,
    longitude: -59.2,
    elevation: '-7,000 m (Below datum)',
    diameter: '4,000 km long, 200 km wide',
    description:
      'A vast tectonic canyon system running along the Martian equator. If located on Earth, it would stretch across the entire continental United States from Los Angeles to New York.',
    scientificValue:
      'Formed by radial faulting and crustal rifting during the volcanic uplift of the neighboring Tharsis bulge, sculpted by subsequent catastrophic outflow floods.',
  },
  {
    id: 'mars-jezero',
    bodyId: 'mars',
    name: 'Jezero Crater (Perseverance Landing Site)',
    category: 'crater',
    latitude: 18.38,
    longitude: 77.58,
    elevation: '-2,500 m',
    diameter: '45 km diameter',
    description:
      'An ancient impact crater hosting a well-preserved river delta that flowed with liquid water 3.5 billion years ago. Current site of NASA’s Perseverance rover and Ingenuity helicopter.',
    scientificValue:
      'Targeted for Mars Sample Return mission to search for fossilized biosignatures in carbonate and clay sediments.',
    discoveredOrEstablished: 'Perseverance landed Feb 18, 2021',
  },
  {
    id: 'mars-gale',
    bodyId: 'mars',
    name: 'Gale Crater & Mount Sharp (Curiosity Rover)',
    category: 'crater',
    latitude: -5.4,
    longitude: 137.8,
    elevation: '-4,500 m (Floor to +5,500 m peak)',
    diameter: '154 km diameter',
    description:
      'An ancient crater containing a 5-km-high central sedimentary mountain (Aeolis Mons / Mount Sharp). NASA’s Curiosity rover has climbed its layers since 2012.',
    scientificValue:
      'Confirmed ancient freshwater lacustrine environments with organic carbon molecules, nitrates, and favorable habitability parameters.',
    discoveredOrEstablished: 'Curiosity landed Aug 6, 2012',
  },
  {
    id: 'mars-north-ice-cap',
    bodyId: 'mars',
    name: 'Planum Boreum (North Polar Ice Cap)',
    category: 'anomaly',
    latitude: 84.0,
    longitude: 0.0,
    elevation: '+3,000 m',
    diameter: '1,000 km across',
    description:
      'The permanent northern ice sheet on Mars, comprised of alternating layered deposits of water ice and dust, capped seasonally with dry ice (solid CO2).',
    scientificValue:
      'Preserves a 5-million-year climatic record of Martian orbital obliquity cycles analogous to ice core records in Greenland and Antarctica.',
  },

  // ==========================================
  // LUNAR LANDMARKS (The Moon & Apollo Missions)
  // ==========================================
  {
    id: 'moon-tranquility-base',
    bodyId: 'moon',
    name: 'Apollo 11 Tranquility Base (Mare Tranquillitatis)',
    category: 'spaceport',
    latitude: 0.6741,
    longitude: 23.473,
    elevation: '-1,300 m (Basaltic Plain)',
    description:
      'Site of humanity’s historic first crewed lunar landing on July 20, 1969. Neil Armstrong and Buzz Aldrin spent 21 hours on the surface, deploying seismometers and returning 22 kg of rocks.',
    scientificValue:
      'Titanium-rich ilmenite basalts dated to 3.7 billion years, establishing radiometric calibration for crater-count chronology across the inner solar system.',
    discoveredOrEstablished: 'Apollo 11 (July 20, 1969)',
  },
  {
    id: 'moon-tycho',
    bodyId: 'moon',
    name: 'Tycho Crater & Ray System',
    category: 'crater',
    latitude: -43.31,
    longitude: -11.36,
    elevation: '-4,800 m depth',
    diameter: '85 km diameter',
    description:
      'A prominent young lunar impact crater whose bright ejecta rays extend over 1,500 km across the lunar nearside, visible even to the unaided eye during a full Moon.',
    scientificValue:
      'Formed roughly 108 million years ago (during Earth’s Cretaceous dinosaur era), providing an unweathered pristine benchmark for hypervelocity impact mechanics.',
  },
  {
    id: 'moon-shackleton',
    bodyId: 'moon',
    name: 'Shackleton Crater (South Pole Water Ice)',
    category: 'crater',
    latitude: -89.9,
    longitude: 0.0,
    elevation: '-4,200 m depth',
    diameter: '21 km diameter',
    description:
      'An impact crater at the lunar south pole whose interior floor lies in perpetual cryogenic shadow (< 90 Kelvin), while its peaks receive nearly continuous sunlight.',
    scientificValue:
      'Prime candidate site for NASA Artemis base camps; permanently shadowed regions (PSRs) harbor vast deposits of water ice essential for rocket propellant and life support.',
  },

  // ==========================================
  // JUPITER STORMS & FEATURES
  // ==========================================
  {
    id: 'jupiter-grs',
    bodyId: 'jupiter',
    name: 'The Great Red Spot',
    category: 'storm',
    latitude: -22.0,
    longitude: -165.0,
    elevation: '+8 km (Above surrounding cloud deck)',
    diameter: '16,350 km (Larger than Earth)',
    description:
      'A colossal, high-pressure anticyclonic storm churning counter-clockwise with peripheral wind speeds exceeding 680 km/h. Has raged continuously since at least 1665.',
    scientificValue:
      'Juno gravity pass confirmed the storm roots extend roughly 300 to 500 km deep into the gas giant mantle, far below the condensation cloud decks.',
  },

  // ==========================================
  // SATURN POLAR PHENOMENA
  // ==========================================
  {
    id: 'saturn-hexagon',
    bodyId: 'saturn',
    name: 'Saturn North Polar Hexagon',
    category: 'storm',
    latitude: 78.0,
    longitude: 0.0,
    elevation: 'Deep Troposphere',
    diameter: '32,000 km across (Each side ~14,500 km)',
    description:
      'A persistent 6-sided geometric jet stream pattern encircling Saturn’s north pole at nearly 360 km/h. Features a central eyewall vortex rotating at the planet’s internal dynamo speed.',
    scientificValue:
      'Fluid dynamics laboratory demonstration of Rossby wave resonances created by extreme horizontal shear gradients in a rotating gaseous fluid.',
    discoveredOrEstablished: 'Voyager 1 (1981), mapped by Cassini (2006)',
  },

  // ==========================================
  // VENUS VOLCANIC PEAKS
  // ==========================================
  {
    id: 'venus-maxwell-montes',
    bodyId: 'venus',
    name: 'Maxwell Montes Peak',
    category: 'mountain',
    latitude: 65.2,
    longitude: 3.3,
    elevation: '+11,000 m (Highest on Venus)',
    description:
      'The highest mountain range on Venus, rising 11 km above the mean planetary radius. Due to the high altitude, atmospheric pressure drops to 48 bar and temperature to 380°C.',
    scientificValue:
      'Magellan radar images show radar-bright metallic snow deposits (hypothesized lead sulfide / bismuth sulfide "frost") coating the upper elevations.',
  },

  // ==========================================
  // MERCURY BASINS
  // ==========================================
  {
    id: 'mercury-caloris',
    bodyId: 'mercury',
    name: 'Caloris Basin (The Hot Basin)',
    category: 'crater',
    latitude: 30.5,
    longitude: -189.8,
    elevation: '-2,000 m (Ringed by 2 km mountains)',
    diameter: '1,550 km across',
    description:
      'One of the largest impact basins in the Solar System, ringed by mile-high concentric mountain massifs (Caloris Montes).',
    scientificValue:
      'The monumental asteroid impact sent seismic shockwaves through Mercury’s molten core, focusing antipodally on the exact opposite side of the planet to create the fractured "Weird Terrain".',
  },
];

// Helper to convert spherical coordinates (lat, lon) to Cartesian 3D position [x, y, z]
export function latLongToCartesian(
  lat: number,
  lon: number,
  radius: number
): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}
