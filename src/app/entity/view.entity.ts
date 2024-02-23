export enum ViewMode {
    GENERATED = "generated",
    SOURCE = "source"
}

export interface Options {
    models: string[];
    templates: string[];
}