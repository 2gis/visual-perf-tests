
import { AnimationOptions, Map } from "@2gis/mapgl/types";

function sleep(time) {
  return new Promise((resolve) => {
      setTimeout(resolve, time);
  });
}

function waitIdle(map: Map) {
  return new Promise((resolve) => {
      map.once('idle', resolve);
  });
}

export async function runScenario(map: Map, name: string) {
  const scenario = scenarios[name];
  for (const part of scenario) {
      console.log(part);
      // console.log(part);
      const duration = part.duration || 0;
      if (part.zoom !== undefined) {
          const params: AnimationOptions = {
              duration,
              // @ts-ignore
              animateHeight: true,
          };
          if (part.zoomEasing) {
              params.easing = part.zoomEasing;
          }
          map.setZoom(part.zoom, params);
      }
      if (part.pitch !== undefined) {
          const params: AnimationOptions = {
              duration,
          };
          if (part.pitchEasing) {
              params.easing = part.pitchEasing;
          }
          map.setPitch(part.pitch, params);
      }
      if (part.center) {
          const params: AnimationOptions = {
              duration,
          };
          if (part.centerEasing) {
              params.easing = part.centerEasing;
          }
          map.setCenter(part.center, params);
      }
      if (part.rotation !== undefined) {
          const params: AnimationOptions = {
              duration,
          };
          if (part.rotationEasing) {
              params.easing = part.rotationEasing;
          }
          map.setRotation(part.rotation, { ...params, normalize: false });
      }

      if (typeof part.f === 'function') {
          part.f();
      }

      if (part.waitIdle) {
          await waitIdle(map);
      } else {
          await sleep(duration);
      }
  }
}

const easy = [
  // москва дефолт
  [
    { center: [37.62017, 55.753466], duration: 7, easing: 'easeInOutQuad' },
    { zoom: 11, pitch: 0, rotation: 0, duration: 7, easing: 'easeOutCubic' },
  ],
  // вднх вход
  [
      { center: [37.637587, 55.826326], duration: 80, easing: 'easeInOutQuad' },
      { zoom: 18.89, pitch: 44.13, rotation: 34.85, duration: 110, easing: 'easeInOutCubic' },
  ],
  // вднх отзум
  [
      { center: [37.630834, 55.830619], duration: 70, easing: 'easeInOutQuad' },
      { zoom: 16.39, pitch: 45, rotation: 174.95, duration: 80, easing: 'easeInOutCubic' },
  ],
].reduce((res, scenario) => {
  scenario.forEach((viewRequest) =>
      res.push({ ...viewRequest, duration: viewRequest.duration * 100 }),
  );
  return res;
}, []);

const moscow = [
  // москва дефолт
  [
      { center: [37.62017, 55.753466], duration: 7, easing: 'easeInOutQuad' },
      { zoom: 11, pitch: 0, rotation: 0, duration: 7, easing: 'easeOutCubic' },
  ],
  // вднх вход
  [
      { center: [37.637587, 55.826326], duration: 80, easing: 'easeInOutQuad' },
      { zoom: 18.89, pitch: 44.13, rotation: 34.85, duration: 110, easing: 'easeInOutCubic' },
  ],
  // вднх отзум
  [
      { center: [37.630834, 55.830619], duration: 70, easing: 'easeInOutQuad' },
      { zoom: 16.39, pitch: 45, rotation: 174.95, duration: 80, easing: 'easeInOutCubic' },
  ],
  // вднх техника
  [
      { center: [37.623036, 55.83416], duration: 80, easing: 'easeInOutQuad' },
      { zoom: 18.75, pitch: 63.93, rotation: -84.33, duration: 90, easing: 'easeInOutCubic' },
  ],
  // вднх колесо
  [
      { center: [37.627831, 55.82705], duration: 70, easing: 'easeInOutQuad' },
      { zoom: 17.83, pitch: 58.31, rotation: -63.07, duration: 80, easing: 'easeInOutQuad' },
  ],
  // останкино
  [
      { center: [37.616066, 55.820679], duration: 60, easing: 'easeInOutSine' },
      { zoom: 16.34, pitch: 35.32, rotation: -62.37, duration: 70, easing: 'easeInOutSine' },
  ],
  // отзум
  [
      { center: [37.602637, 55.790551], duration: 60, easing: 'easeInOutSine' },
      { zoom: 11.68, pitch: 7.83, rotation: -11.69, duration: 60, easing: 'easeInOutSine' },
  ],
  // кутузовский
  [
      { center: [37.561666, 55.749094], duration: 80, easing: 'easeInOutSine' },
      { zoom: 18, pitch: 50, rotation: 115, duration: 80, easing: 'easeInOutCubic' },
  ],
  [
      { center: [37.55185, 55.746361], duration: 50, easing: 'easeInSine' },
      { zoom: 19.55, pitch: 70, rotation: 123.91, duration: 50, easing: 'easeInSine' },
  ],
  [
      { center: [37.534157, 55.739691], duration: 90, easing: 'easeOutSine' },
      { zoom: 19.44, pitch: 70, rotation: 33.37, duration: 90, easing: 'easeInCubic' },
  ],
  // сити
  [
      { center: [37.531171, 55.752421], duration: 80, easing: 'easeInOutQuad' },
      { zoom: 19.21, pitch: 57.61, rotation: -21.64, duration: 80, easing: 'easeInOutCubic' },
  ],
  [
      { center: [37.53787, 55.7489], duration: 60, easing: 'easeInOutSine' },
      { zoom: 16.27, pitch: 44.23, rotation: 176.37, duration: 60, easing: 'easeInOutSine' },
  ],
  // отзум
  [
      { center: [37.535044, 55.704878], duration: 60, easing: 'easeInOutSine' },
      { zoom: 13.16, pitch: 43.06, rotation: -92.59, duration: 70, easing: 'easeInOutQuad' },
  ],
  // мгу
  [
      { center: [37.523931, 55.699406, 0], duration: 70, easing: 'easeInOutSine' },
      { zoom: 16.76, pitch: 47.58, rotation: -45.38, duration: 80, easing: 'easeInOutCubic' },
  ],
  [
      { center: [37.545059, 55.708756, 0], duration: 60, easing: 'easeInOutQuad' },
      { zoom: 18.39, pitch: 37.51, rotation: -21.14, duration: 60, easing: 'easeInOutCubic' },
  ],
  [
      { center: [37.549656, 55.714078, 0], duration: 50, easing: 'easeInOutSine' },
      { zoom: 18.41, pitch: 64.12, rotation: -33.26, duration: 60, easing: 'easeInOutQuad' },
  ],
  // отзум
  [
      { center: [37.610546, 55.740738, 0], duration: 80, easing: 'easeInOutSine' },
      { zoom: 12.95, pitch: 42.29, rotation: -94.82, duration: 100, easing: 'easeInOutQuad' },
  ],
  // зарядье
  [
      { center: [37.629518, 55.750003, 0], duration: 90, easing: 'easeInOutQuad' },
      { zoom: 18.74, pitch: 67.44, rotation: 40.36, duration: 150, easing: 'easeInOutCubic' },
  ],
].reduce((res, scenario) => {
  scenario.forEach((viewRequest) =>
      res.push({ ...viewRequest, duration: viewRequest.duration * 100 }),
  );
  return res;
}, []);

export const scenarios = { easy, moscow }
