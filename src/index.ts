import { load } from './loader';
import { Map } from '@2gis/mapgl/types';
import { measureRender, processStats } from './tests/render';
import { describe, it, createUI } from 'describe-it-browser/src/lib';
import * as dat from 'dat.gui';
import { scenarios } from './tests/render/scenarios';

const key = import.meta.env.VITE_MAPGL_KEY;

const url = new URL(window.location.href);
const remoteEndpoint = url.searchParams.get('cb');

const styles = {
    'A': 'b2b8046f-9bb0-469a-9860-9847032935cc',
    'Online': 'eb10e2c3-3c28-4b81-b74b-859c9c4cf47e',
    'SDK': 'c080bb6a-8134-4993-93a1-5b4d8c36a59b',
    'Immersive': '8e055b04-e7b5-42a5-95e2-a0b5190a034e',
    //    'Immersive': '9c73b6cf-5d37-44a2-9a3e-68737b72d9a4',
    'Immersive Light': 'ffaaf4c3-4b23-45c8-b816-4f719a3170a9'
}

const references = {
    'production': 'https://mapgl.2gis.com/api/js/v1',
}

const graphicsPresets = ['light', 'normal', 'immersive'];

const params = {
    reference: 'https://mapgl.2gis.com/api/js/v1',
    customReference: '',
    target: 'https://mapgl.2gis.com/api/js/v1',
    iterations: 1,
    warmup: false,
    graphicsPreset: 'immersive',
    immersiveRoads: true,
    styleId: 'eb10e2c3-3c28-4b81-b74b-859c9c4cf47e',
    customMapOptions: '{}',
}

const log = async (msg: any) => {
    console.log(msg)
    if (remoteEndpoint) {
        fetch(`${remoteEndpoint}`, {
            method: 'POST', // or 'PUT'
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'log', msg }),
        });
    }
}
const finish = async (success: boolean, results: any) => {
    console.log('finish', success, results);
    if (remoteEndpoint) {
        fetch(`${remoteEndpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'finish', success, results }),
        });
    }
}

let mapInstance;

type TestFunction = (map: Map) => Promise<any>

function performTest(mapUrl: string, test: TestFunction) {
    return new Promise((resolve, reject) => {
        if (mapInstance) {
            mapInstance.destroy();
        }
        load(mapUrl).then(mapgl => {
            let customOptions = {};
            try {
                customOptions = JSON.parse(params.customMapOptions);
            } catch (e) {
                console.warn('Invalid custom map options JSON:', e);
            }
            const mapOptions = {
                key,
                zoomControl: 'bottomRight',
                enableTrackResize: true,
                center: [82.897904, 54.98318],
                style: params.styleId,
                styleState: {
                    immersiveRoadsOn: params.immersiveRoads,
                    graphicsPreset: params.graphicsPreset,
                },
                maxPitch: 85,
                zoom: 16,
                ...customOptions,
            };
            console.log(mapOptions);
            const map = mapInstance = (window as any).map = new mapgl.Map('map', mapOptions as any);
            const jmap = (map as any)._impl;
            log('Testing ' + (mapUrl || 'production'));
            test(jmap).then(resolve);
        });
    })
}

async function performComparingTest(test: TestFunction) {
    const referenceResults: any = await performTest(params.customReference !== '' ? params.customReference : params.reference, test);
    const targetResults: any = await performTest(params.target, test);
    for (const indicator in referenceResults) {
        const referenceStats = referenceResults[indicator]
        const targetStats = targetResults[indicator]
        await log(indicator);
        for (const percentile in referenceStats) {
            let delta = (targetStats[percentile] - referenceStats[percentile]).toFixed(2);
            if (delta[0] !== '-') {
                delta = `+${delta}`
            }
            await log(`  ${percentile} ${delta} (${targetStats[percentile]}/${referenceStats[percentile]})`);
        }
    }
    // TODO: Compare targetResults with referenceResults
    await finish(true, referenceResults);
}

const ui = new dat.GUI({ width: 330 });
const resultsEl = document.querySelector<HTMLElement>('#results');

const checkpoint = localStorage.getItem('checkpoint');
if (checkpoint) {
    const results = JSON.parse(checkpoint);
    printResults(processStats(results), true);
    localStorage.removeItem('checkpoint');
}
describe('Rendering', () => {
    for (let perfCase in scenarios) {
        it(perfCase, () => {
            const refScript = params.customReference !== '' ? params.customReference : params.reference;
            performTest(refScript, map => measureRender(map, perfCase as any, params.iterations, params.warmup))
                .then(results => {
                    printResults(results)
                    finish(true, results);
                });
            ui.close();
        });
        // it(prefCase, () => performComparingTest(map => measureRender(map, prefCase as any)))
    }
});

function printResults(results: any, fail = false) {
    let name = params.reference;
    if (params.customReference) {
        name = params.customReference;
    } else {
        for (const rname in references) {
            if (references[rname] === params.reference) {
                name = rname;
            }
        }
    }
    if (fail) {
        name += ' <b>(failed)</b>';
    }
    let styleName = params.styleId;
    for (const sname in styles) {
        if (styles[sname] === params.styleId) {
            styleName = sname;
        }
    }
    const output = [
        `<b>${name} - ${styleName}</b>(iterations: ${params.iterations}${params.warmup ? ' + warmup' : ''})<br /><br />`
    ];
    for (const metric in results) {
        output.push(`<b>${metric}</b>`);
        const stats = results[metric];
        if (typeof stats === 'number') {
            output.push(': ' + stats + '<br />');
            continue;
        }
        output.push('<table>');
        output.push('<tr>');
        for (const q in stats) {
            output.push(`<td>${q}</td>`);
        }
        output.push('</tr>');
        output.push('<tr>');
        for (const q in stats) {
            output.push(`<td>${stats[q]}</td>`);
        }
        output.push('</tr>');
        output.push('</table>');
    }
    resultsEl.innerHTML = output.join('');
    resultsEl.style.display = 'block';
}

ui.add(params, 'reference', references);
ui.add(params, 'customReference');
// ui.add(params, 'target');
ui.add(params, 'styleId', styles);
ui.add(params, 'graphicsPreset', graphicsPresets);
ui.add(params, 'immersiveRoads');
ui.add(params, 'iterations');
ui.add(params, 'warmup');

const customOptionsFolder = ui.addFolder('Map custom options');
const optionsController = customOptionsFolder.add(params, 'customMapOptions').name('JSON options');

// Replace single-line input with a textarea
const controllerEl = optionsController.domElement;
const li = controllerEl.closest('li') as HTMLElement;
if (li) {
    const ul = li.closest('ul') as HTMLElement;
    const updateHeight = () => {
        li.style.height = ul && !ul.classList.contains('closed') ? 'auto' : '';
    };
    updateHeight();
    if (ul) {
        new MutationObserver(updateHeight).observe(ul, { attributes: true, attributeFilter: ['class'] });
    }
}
const input = controllerEl.querySelector('input');
if (input) {
    const textarea = document.createElement('textarea');
    textarea.value = params.customMapOptions;
    textarea.rows = 6;
    textarea.style.width = '100%';
    textarea.style.resize = 'vertical';
    textarea.style.fontFamily = 'monospace';
    textarea.style.fontSize = '11px';
    textarea.style.background = '#303030';
    textarea.style.color = '#eee';
    textarea.style.border = '1px solid #555';
    textarea.style.padding = '4px';
    textarea.addEventListener('input', () => {
        params.customMapOptions = textarea.value;
    });
    textarea.addEventListener('keydown', (e) => e.stopPropagation());
    input.replaceWith(textarea);
}

createUI(ui);