import Core from 'wappalyzer-core';

type TypeProp = Core.Category | Core.Technology;
type WappalyzerProp<T extends TypeProp = TypeProp> = Record<string, T>;
type WappalyzerOption = {
    repository?: string;
    path?: string;
    custom_categories?: WappalyzerProp<Core.Category>;
    custom_technologies?: WappalyzerProp<Core.Technology>;
};
type PropKey = 'categories' | 'technologies';
type Metadata = Core.Input;
declare class Wappalyzer {
    readonly options: WappalyzerOption;
    protected loaded: boolean;
    protected cache_path: string;
    protected repository: string;
    private readonly files;
    constructor(options?: WappalyzerOption);
    prepare(force_fetch: boolean): Promise<Wappalyzer>;
    resolve(metadata: Metadata, force_fetch?: boolean): Promise<Array<Core.Resolution>>;
    private fetch;
}

export { type Metadata, type PropKey, type TypeProp, Wappalyzer, type WappalyzerOption, type WappalyzerProp, Wappalyzer as default };
