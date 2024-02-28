export enum ViewMode {
    GENERATED = "generated",
    SOURCE = "source"
}

export enum ScreenFit {
    FIT_SCREEN = "fit_screen",
    FULLSCREEN = "fullscreen"
}

export interface Options {
    models: string[];
    templates: string[];
}

export interface PromptEntity {
    clip_skip?: number;
    guidance_scale?: number;
    model?: string;
    prompt?: string;
    negative_prompt?: string;
    num_inference_steps?: number;
    scale?: number;
    height?: number;
    width?: number;
}