import fs from 'node:fs';
import path from 'node:path';
import Core from 'wappalyzer-core';
import { fetch } from 'undici';
export type TypeProp = Core.Category | Core.Technology
export type WappalyzerProp<T extends TypeProp = TypeProp> = Record<string, T>

export type WappalyzerOption = {
	path?: string
	custom_categories?: WappalyzerProp<Core.Category>
	custom_technologies?: WappalyzerProp<Core.Technology>
}


export type PropKey = 'categories' | 'technologies'
export type Metadata = Core.Input

export class Wappalyzer {
	protected loaded: boolean = false;
	protected path: string = path.resolve(path.join(__dirname, 'json'));
	private readonly files: { categories: string; technologies: string; };


	constructor(readonly options: WappalyzerOption = {}) {
		if (options.path) this.path = options.path;
		this.files = {
			categories: path.resolve(path.join(this.path, 'categories.json')),
			technologies: path.resolve(path.join(this.path, 'technologies.json')),
		};
	}


	async prepare(force_fetch: boolean): Promise<Wappalyzer> {
		try {
			if(this.loaded &&  !force_fetch) return Promise.resolve(this);
			if (!fs.existsSync(this.path)) fs.mkdirSync(this.path);
			const definitions: Record<PropKey, WappalyzerProp> = { technologies: {}, categories: {} };
			for (const [name, filename] of Object.entries(this.files)) {
				if (fs.existsSync(filename) && !force_fetch) {
					const buff = fs.readFileSync(filename, { flag: 'r' });
					Object.assign(definitions, { [name]: JSON.parse(buff.toString()) });
				} else await this.fetch(name as PropKey).then(definition => {
					Object.assign(definitions, { [name]: definition });
				}).catch(Promise.reject);
			}
			Core.setCategories({ ...definitions.categories, ...this.options?.custom_categories } as WappalyzerProp<Core.Category>);
			Core.setTechnologies({ ...definitions.technologies, ...this.options?.custom_technologies } as WappalyzerProp<Core.Technology>);
			this.loaded = true;
			return Promise.resolve(this);
		} catch (err) {
			this.loaded = false;
			return Promise.reject(err);
		}
	}

	async resolve(metadata: Metadata, force_fetch = false): Promise<Array<Core.Resolution>> {
		await this.prepare(force_fetch);
		return Core.resolve(Core.analyze(metadata));
	}

	private async fetch<T extends TypeProp = TypeProp>(name: PropKey): Promise<T> {
		if (name == 'categories') {
			const response = await fetch('https://raw.githubusercontent.com/censys/wappalyzer/master/src/categories.json');
			if (!response.ok || !response.body) return Promise.reject(new Error('Empty body'));
			const categories = await response.json();
			fs.writeFileSync(this.files[name], JSON.stringify(categories));
			return Promise.resolve(categories as T);
		} else if (name == 'technologies') {
			const chars = Array.from({ length: 27 }, (v, i) => i ? String.fromCharCode(i + 96) : '_');
			const promises = chars.reduce((out, char) => {
				out.push(fetch(`https://raw.githubusercontent.com/censys/wappalyzer/master/src/technologies/${char}.json`).then(r => r.json()));
				return out;
			}, new Array<Promise<any>>());
			const data = await Promise.all(promises);
			const technologies = data.reduce((acc, obj) => ({ ...acc, ...obj }), {});
			fs.writeFileSync(this.files[name], JSON.stringify(technologies));
			return Promise.resolve(technologies as T);
		}
		return Promise.reject(new Error('Invalid name'));
	}
}

export default Wappalyzer;
