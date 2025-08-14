import { runScenario, scenarios } from './scenarios';
import { keyedStats, stats } from '../../stats';

type JMap = any;

const BAD_FPS_THRESHOLD = 20;

export async function measureRender (map: JMap, scenario: keyof typeof scenarios, iterations: number, warmup: boolean) {
    const ITERATIONS = iterations + (warmup ? 1 : 0);
    const results: any = {
        tiles: [],
        draws: [],
        vertices: [],
        fps: [],
        badfps: [],
        models: [],
        mem: { gpu: [], cpu: [] }
    }
    const oldCollectStats = map.state.collectStats;
    let frameStart = NaN;
    map.on('framestart', () => {
        frameStart = performance.now();
    })
    map.on('frameend', () => {
        const stats = map.state.stats as any;
        const fps = 1000 / (performance.now() - frameStart);
        if (fps <= BAD_FPS_THRESHOLD) {
            results.badfps.push(fps)
        }
        if (stats.drawCount > 0) {
            results.fps.push(fps);
        }
        results.draws.push(stats.drawCount);
        results.tiles.push(stats.tileCount);
        results.vertices.push(stats.vertexCount / 10**6);
        results.models.push(Object.keys(map.modules.assetManager.models).length);
    })
    const checkpointInt = setInterval(() => {
        // Меряем память каждые 1000 мс и на всякий случай сохраняем результаты в localStorage
        map.performanceChecker.getMemoryStats().then((memStats: { gpu: number, cpu: number }) => {
            results.mem.gpu.push(memStats.gpu / 10**6);
            results.mem.cpu.push(memStats.cpu / 10**6);
        });
        localStorage.setItem('checkpoint', JSON.stringify(results));
    }, 1000);
    for (let i = 0; i < ITERATIONS; i++) {
        if (!warmup || i > 0) {
            map.state.collectStats = true;
        }
        await runScenario(map, scenario)
    }
    clearInterval(checkpointInt);
    localStorage.removeItem('checkpoint');
    map.state.collectStats = oldCollectStats;
    return processStats(results);
}

export function processStats (results: any) {
    return {
        fps: stats(results.fps, [.01, .05, .1, .25, .5, .75]),
        badfps: stats(results.badfps, [.01, .05, .1, .25, .5, .75]),
        gliches: results.badfps.length,
        draws: stats(results.draws),
        tiles: stats(results.tiles),
        vertices: stats(results.vertices),
        models: stats(results.models),
        gpuMem: stats(results.mem.gpu, [.25, .5, .75, .9, .99]),
        cpuMem: stats(results.mem.cpu, [.25, .5, .75, .9, .99])
    }
}
