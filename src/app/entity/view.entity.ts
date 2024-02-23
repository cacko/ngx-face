import { GeneratedEntitty } from "./upload.entity";

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
    template?: string;
    model?: string;
    prompt?: string;
    negative_prompt?: string;
    num_inference_steps?: number;
    scale?: number;
    height?: number;
    width?: number;
}

export const fromGenerated = (ent: GeneratedEntitty) => {
    const prompt: PromptEntity = {
        clip_skip: ent.clip_skip,
        negative_prompt: ent.negative_prompt,
        guidance_scale: ent.guidance_scale,
        template: ent.template,
        model: ent.model,
        prompt: ent.prompt,
        num_inference_steps: ent.num_inference_steps,
        scale: ent.scale,
        height: ent.height,
        width: ent.width
    };
    return Object.entries(prompt)
        .reduce((res: any, [k, v]) => {
            if (v != undefined) {
                res[k] = v;
            }
            return res;
        }, {}) as PromptEntity;
};