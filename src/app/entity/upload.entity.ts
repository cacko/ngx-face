export enum API {
    URL = "https://face-api.cacko.net/api",
    ACTION_GENERATE = "generate",
    ACTION_GENERATED = "generated",
    ACTION_OPTIONS = "options",
    CDN = "https://cdn.cacko.net/face"
  };
  
  export enum FILETYPE {
    PNG = "image/png",
    JPEG = "image/jpeg",
    WEBP = "image/webp"
  };

  export enum STATUS {
    STARTED = "started",
    ERROR = "error",
    PENDING ="pending",
    GENERATED = "generated",
    IN_PROGRESS = "in_progress",
    IDLE = "idle"
  };
  
  
  export const ACCEPTS = [FILETYPE.PNG, FILETYPE.JPEG, FILETYPE.WEBP];
  
  export interface FileInfo {
    filename: string;
    collage_id: string;
    url: string;
    progress?: number;
  };

  export interface ApiImage {
    thumb_src: string;
    webp_src: string;
    raw_src: string;
    hash: string;
  };

  export interface OptionsEntity {
    prompt ?: string;
    model ?: string;
    template ?: string;
  }
  
  export interface GeneratedEntitty {
    slug: string;
    uid: string;
    last_modified: string;
    clip_skip ?: number;
    deleted: boolean;
    guidance_scale ?: number;
    height ?: number;
    width ?: number;
    image : ApiImage;
    source : ApiImage;
    template ?: string;
    model ?: string;
    prompt ?: string;
    num_inferance_steps ?: number;
    scale ?: number;
    status: STATUS;
    error: string;
  }