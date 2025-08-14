import * as mapgl from '@2gis/mapgl/types';

let map: typeof mapgl | undefined;

export function load(mapglURL = 'https://mapgl.2gis.com/api/js') {
    if (typeof window === 'undefined') {
        throw new Error('mapgl is supported only in browser environment');
    }

    return createScriptAndLoad(mapglURL).then(() => {
        map = (window as any).mapgl as typeof mapgl;
        return map;
    });
}

function createScriptAndLoad(mapglURL: string) {
    return new Promise<void>((resolve, reject) => {
        // Create script element and set attributes
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = mapglURL;

        // Append the script to the DOM
        document.body.appendChild(script);

        // Resolve the promise once the script is loaded
        script.addEventListener('load', () => {
            resolve();
        });

        // Catch any errors while loading the script
        script.addEventListener('error', (error) => {
            reject(error);
        });
    });
}
