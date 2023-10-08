import Core from 'wappalyzer-core';

type TypeProp = Core.Category | Core.Technology;
type WappalyzerProp<T extends TypeProp = TypeProp> = Record<string, T>;
type WappalyzerOption = {
    path?: string;
    custom_categories?: WappalyzerProp<Core.Category>;
    custom_technologies?: WappalyzerProp<Core.Technology>;
};
type PropKey = 'categories' | 'technologies';
type Metadata = Core.Input;
declare class Wappalyzer {
    readonly options: WappalyzerOption;
    protected loaded: boolean;
    protected path: string;
    private readonly files;
    constructor(options?: WappalyzerOption);
    prepare(force_fetch: boolean): Promise<Wappalyzer>;
    resolve(metadata: Metadata, force_fetch?: boolean): Promise<Array<Core.Resolution>>;
    private fetch;
}

export { Metadata, PropKey, TypeProp, Wappalyzer, WappalyzerOption, WappalyzerProp, Wappalyzer as default };
