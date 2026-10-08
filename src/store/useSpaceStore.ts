import { create } from 'zustand';
import { CosmicScale, CelestialObject } from '@/types/space';
import { CELESTIAL_BODIES } from '@/data/celestialData';
import { SURFACE_LANDMARKS, SurfaceLandmark } from '@/data/landmarksData';

export type MapLayerType = 'satellite' | 'elevation' | 'night' | 'clouds';

interface SpaceState {
  selectedObjectId: string;
  hoveredObjectId: string | null;
  activeScale: CosmicScale;
  searchQuery: string;
  isSearchOpen: boolean;
  isDataPanelOpen: boolean;
  timeSpeed: number;
  isOrbitLinesVisible: boolean;
  isLabelsVisible: boolean;
  isAudioMuted: boolean;
  activeCategoryFilter: string;
  isTourActive: boolean;
  tourStep: number;
  isTransitioning: boolean;
  cameraDistance: number;

  // Google Maps / Surface Navigation Mode
  isSurfaceMode: boolean;
  selectedLandmarkId: string | null;
  hoveredLandmarkId: string | null;
  activeMapLayer: MapLayerType;
  cursorCoordinates: { lat: number; lon: number } | null;

  // Multiverse & NASA Knowledge Hub
  isMultiverseModalOpen: boolean;
  isNasaLiveFeedOpen: boolean;

  // Actions
  selectObject: (id: string) => void;
  setHoveredObject: (id: string | null) => void;
  setScale: (scale: CosmicScale) => void;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (open: boolean) => void;
  toggleDataPanel: (open?: boolean) => void;
  setTimeSpeed: (speed: number) => void;
  toggleOrbitLines: () => void;
  toggleLabels: () => void;
  toggleAudio: () => void;
  setCategoryFilter: (category: string) => void;
  startTour: () => void;
  stopTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  setIsTransitioning: (val: boolean) => void;
  setCameraDistance: (dist: number) => void;

  // Surface Navigation Actions
  enterSurfaceMode: () => void;
  exitSurfaceMode: () => void;
  selectLandmark: (id: string) => void;
  setHoveredLandmark: (id: string | null) => void;
  setMapLayer: (layer: MapLayerType) => void;
  setCursorCoordinates: (coords: { lat: number; lon: number } | null) => void;

  // Modals & Simulation Labs
  isDestructionLabOpen: boolean;
  toggleMultiverseModal: (open?: boolean) => void;
  toggleNasaLiveFeed: (open?: boolean) => void;
  toggleDestructionLab: (open?: boolean) => void;

  // Selectors
  getSelectedObject: () => CelestialObject | undefined;
  getSelectedLandmark: () => SurfaceLandmark | undefined;
}

const TOUR_OBJECT_IDS = [
  'observable-universe',
  'milky-way',
  'sagittarius-a',
  'sun',
  'earth',
  'saturn',
  'kepler-186f',
  'gargantua',
  'calabi-yau',
];

export const useSpaceStore = create<SpaceState>((set, get) => ({
  selectedObjectId: 'earth',
  hoveredObjectId: null,
  activeScale: 'planetary',
  searchQuery: '',
  isSearchOpen: false,
  isDataPanelOpen: false,
  timeSpeed: 1,
  isOrbitLinesVisible: true,
  isLabelsVisible: true,
  isAudioMuted: false,
  activeCategoryFilter: 'all',
  isTourActive: false,
  tourStep: 0,
  isTransitioning: false,
  cameraDistance: 120,

  // Google Maps / Surface navigation state
  isSurfaceMode: false,
  selectedLandmarkId: null,
  hoveredLandmarkId: null,
  activeMapLayer: 'satellite',
  cursorCoordinates: null,

  isMultiverseModalOpen: false,
  isNasaLiveFeedOpen: false,
  isDestructionLabOpen: false,

  selectObject: (id: string) => {
    const obj = CELESTIAL_BODIES.find((item) => item.id === id);
    if (!obj) return;

    set({
      selectedObjectId: id,
      activeScale: obj.scale,
      isSearchOpen: false,
      searchQuery: '',
      isTransitioning: true,
      selectedLandmarkId: null,
    });
  },

  setHoveredObject: (id: string | null) => set({ hoveredObjectId: id }),

  setScale: (scale: CosmicScale) => {
    const target = CELESTIAL_BODIES.find((b) => b.scale === scale);
    if (target) {
      set({
        activeScale: scale,
        selectedObjectId: target.id,
        isTransitioning: true,
        isSurfaceMode: false,
        selectedLandmarkId: null,
      });
    } else {
      set({ activeScale: scale });
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setIsSearchOpen: (open: boolean) => set({ isSearchOpen: open }),

  toggleDataPanel: (open?: boolean) =>
    set((state) => ({
      isDataPanelOpen: open !== undefined ? open : !state.isDataPanelOpen,
    })),

  setTimeSpeed: (speed: number) => set({ timeSpeed: speed }),

  toggleOrbitLines: () =>
    set((state) => ({ isOrbitLinesVisible: !state.isOrbitLinesVisible })),

  toggleLabels: () =>
    set((state) => ({ isLabelsVisible: !state.isLabelsVisible })),

  toggleAudio: () => set((state) => ({ isAudioMuted: !state.isAudioMuted })),

  setCategoryFilter: (category: string) =>
    set({ activeCategoryFilter: category }),

  startTour: () => {
    set({
      isTourActive: true,
      tourStep: 0,
      selectedObjectId: TOUR_OBJECT_IDS[0],
      activeScale: 'cosmic',
      isDataPanelOpen: true,
      isTransitioning: true,
      isSurfaceMode: false,
      selectedLandmarkId: null,
    });
  },

  stopTour: () => set({ isTourActive: false }),

  nextTourStep: () => {
    const { tourStep } = get();
    const nextIdx = (tourStep + 1) % TOUR_OBJECT_IDS.length;
    const nextId = TOUR_OBJECT_IDS[nextIdx];
    const target = CELESTIAL_BODIES.find((b) => b.id === nextId);

    set({
      tourStep: nextIdx,
      selectedObjectId: nextId,
      activeScale: target ? target.scale : 'planetary',
      isTransitioning: true,
      isSurfaceMode: false,
      selectedLandmarkId: null,
    });
  },

  prevTourStep: () => {
    const { tourStep } = get();
    const prevIdx =
      (tourStep - 1 + TOUR_OBJECT_IDS.length) % TOUR_OBJECT_IDS.length;
    const prevId = TOUR_OBJECT_IDS[prevIdx];
    const target = CELESTIAL_BODIES.find((b) => b.id === prevId);

    set({
      tourStep: prevIdx,
      selectedObjectId: prevId,
      activeScale: target ? target.scale : 'planetary',
      isTransitioning: true,
      isSurfaceMode: false,
      selectedLandmarkId: null,
    });
  },

  setIsTransitioning: (val: boolean) => set({ isTransitioning: val }),
  setCameraDistance: (dist: number) => set({ cameraDistance: dist }),

  // Surface Navigation actions
  enterSurfaceMode: () => {
    set({
      isSurfaceMode: true,
      timeSpeed: 0, // Freeze orbital rotation for steady surface inspection
      isTransitioning: true,
    });
  },

  exitSurfaceMode: () => {
    set({
      isSurfaceMode: false,
      selectedLandmarkId: null,
      timeSpeed: 1,
      isTransitioning: true,
    });
  },

  selectLandmark: (id: string) => {
    const landmark = SURFACE_LANDMARKS.find((l) => l.id === id);
    if (!landmark) return;

    set({
      selectedLandmarkId: id,
      selectedObjectId: landmark.bodyId,
      isSurfaceMode: true,
      isTransitioning: true,
      isDataPanelOpen: true,
    });
  },

  setHoveredLandmark: (id: string | null) => set({ hoveredLandmarkId: id }),
  setMapLayer: (layer: MapLayerType) => set({ activeMapLayer: layer }),
  setCursorCoordinates: (coords: { lat: number; lon: number } | null) =>
    set({ cursorCoordinates: coords }),

  toggleMultiverseModal: (open?: boolean) =>
    set((state) => ({
      isMultiverseModalOpen:
        open !== undefined ? open : !state.isMultiverseModalOpen,
    })),

  toggleNasaLiveFeed: (open?: boolean) =>
    set((state) => ({
      isNasaLiveFeedOpen:
        open !== undefined ? open : !state.isNasaLiveFeedOpen,
    })),

  toggleDestructionLab: (open?: boolean) =>
    set((state) => ({
      isDestructionLabOpen:
        open !== undefined ? open : !state.isDestructionLabOpen,
    })),

  getSelectedObject: () => {
    const { selectedObjectId } = get();
    return CELESTIAL_BODIES.find((b) => b.id === selectedObjectId);
  },

  getSelectedLandmark: () => {
    const { selectedLandmarkId } = get();
    return SURFACE_LANDMARKS.find((l) => l.id === selectedLandmarkId);
  },
}));
