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