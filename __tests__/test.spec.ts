import {Metadata, Wappalyzer} from "dist";
import cheerio from "cheerio";
import { fetch } from 'undici'

describe('check', () => {
    const wappalyzer = new Wappalyzer();
    it('test', async () => {
        const site = 'http://www.katyperry.com/'
        const resolutions = await fetch(site).then(x => x.text()).then( function (html) {
            const $ = cheerio.load(html);
            const meta: Record<string, string[]> = $('meta').toArray().reduce((out, element) => {
                const el = element as cheerio.TagElement
                const k = el.attribs?.property ?? el.attribs?.name as string;
                if (k) out[k.toLowerCase()] = [el.attribs?.itemprop ?? el.attribs?.content as string];
                return out
            }, {} as Record<string, string[]>);
            const scripts = $('script').toArray().reduce((o, element) => {
                const el = element as cheerio.TagElement
                if (el.attribs?.type && el.attribs.type.match(/\/javascript/ig)) o.push(el.attribs?.src ?? el.attribs?.content as string);
                return o;
            }, new Array<string>());
            const metadata: Metadata = {
                url: site,
                html: html,
                meta: meta,
                scriptSrc: scripts
            }
            return  wappalyzer.resolve(metadata)
        })
        expect(JSON.stringify(resolutions)).toContain('wordpress.org');
    });
    afterAll(function (done) {
        done();
    })
});
