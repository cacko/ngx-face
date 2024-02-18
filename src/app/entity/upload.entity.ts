export enum API {
    URL = "https://face-api.cacko.net/api",
    ACTION_GENERATE = "generate",
    CDN = "https://cdn.cacko.net/face"
  };
  
  export enum FILETYPE {
    PNG = "image/png",
    JPEG = "image/jpeg",
    WEBP = "image/webp"
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
  
  export interface Generated {
    slug: string;
    uid: string;
    last_modified: string;
    clip_skip ?: number;
    deleted: boolean;
    guidance_scale ?: number;
    height ?: number;
    image : ApiImage;
    source : ApiImage;
    template ?: string;
    model ?: string;
    prompt ?: string;
    num_inferance_steps ?: number;
    scale ?: number;
  }