
type JMap = any;
type TileCoords = number[];

export const now = () => performance.now();

export function getCoords(map: JMap) {
    const tileManager = map.modules.tileManager;
    return tileManager.getViewportTiles().map(tile => tile.coords);
}

export function generateTile (map: JMap, coords: TileCoords) {
    const source = (map.modules.tileManager.tileLayers[0] as any).sourceCore;
    return source.generateTile(map.state, coords, [], 2, {});
}
