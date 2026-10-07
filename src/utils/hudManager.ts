export interface BodyLabelData {
  x: number;
  y: number;
  visible: boolean;
  name: string;
  isSelected: boolean;
}

export interface LandmarkLabelData {
  x: number;
  y: number;
  visible: boolean;
  name: string;
  elevation: string;
  latitude: number;
  longitude: number;
  isSelected: boolean;
}

type BodyCallback = (data: BodyLabelData | null) => void;
type LandmarkCallback = (data: LandmarkLabelData | null) => void;

class HudManager {
  private bodyListener: BodyCallback | null = null;
  private landmarkListener: LandmarkCallback | null = null;

  public setBodyListener(fn: BodyCallback | null) {
    this.bodyListener = fn;
  }

  public setLandmarkListener(fn: LandmarkCallback | null) {
    this.landmarkListener = fn;
  }

  public updateBody(data: BodyLabelData | null) {
    if (this.bodyListener) {
      this.bodyListener(data);
    }
  }

  public updateLandmark(data: LandmarkLabelData | null) {
    if (this.landmarkListener) {
      this.landmarkListener(data);
    }
  }
}

export const hudManager = new HudManager();
