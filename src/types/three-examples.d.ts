declare module "three/examples/jsm/environments/RoomEnvironment" {
  import { Scene } from "three";
  export class RoomEnvironment extends Scene {}
}

declare module "three/examples/jsm/loaders/GLTFLoader" {
  import { LoadingManager, Group } from "three";

  export interface GLTF {
    scene: Group;
    scenes: Group[];
    cameras: import("three").Camera[];
    animations: import("three").AnimationClip[];
    asset: {
      copyright?: string;
      generator?: string;
      version?: string;
      minVersion?: string;
      extensions?: object;
      extras?: unknown;
    };
    parser: unknown;
    userData: Record<string, unknown>;
  }

  export class GLTFLoader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (gltf: GLTF) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
    parse(
      data: ArrayBuffer | string,
      path: string,
      onLoad: (gltf: GLTF) => void,
      onError?: (error: Error) => void
    ): void;
    setDRACOLoader(dracoLoader: unknown): void;
    setKTX2Loader(ktx2Loader: unknown): void;
  }
}

declare module "three/examples/jsm/loaders/DRACOLoader" {
  import { Loader } from "three";

  export class DRACOLoader extends Loader {
    constructor(manager?: import("three").LoadingManager);
    setDecoderPath(path: string): DRACOLoader;
    setDecoderConfig(config: object): DRACOLoader;
    setWorkerLimit(workerLimit: number): DRACOLoader;
    preload(): DRACOLoader;
    dispose(): void;
  }
}
