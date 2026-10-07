import * as THREE from 'three';

class CelestialRegistry {
  private bodyRefs = new Map<string, THREE.Object3D>();

  public register(id: string, obj: THREE.Object3D) {
    this.bodyRefs.set(id, obj);
  }

  public unregister(id: string) {
    this.bodyRefs.delete(id);
  }

  public getWorldPosition(id: string, target = new THREE.Vector3()): THREE.Vector3 | null {
    const obj = this.bodyRefs.get(id);
    if (!obj) return null;
    return obj.getWorldPosition(target);
  }

  public getObject(id: string): THREE.Object3D | undefined {
    return this.bodyRefs.get(id);
  }
}

export const celestialRegistry = new CelestialRegistry();
