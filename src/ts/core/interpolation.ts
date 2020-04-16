export type EasingFn = (t: number) => number;

export namespace Easing {
  export const easeInBack: EasingFn = (t: number): number => {
    const s: number = 1.70158;
    return (t) * t * ((s + 1) * t - s);
  };

  export const bounce: EasingFn = (t: number): number => {
    if (t < (1 / 2.75)) {
      return (7.5625 * t * t);
    } else if (t < (2 / 2.75)) {
      return (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
    } else if (t < (2.5 / 2.75)) {
      return (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
    } else {
      return (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
    }
  };

  export const easeInOutBack: EasingFn = (t: number) => {
    let s: number = 1.70158;
    t /= 0.5;
    if (t < 1) { return 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s)); }
    return 0.5 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
  };

  export const easeOutQuad: EasingFn = (t: number) => {
    return t * (2 - t);
  };
}

export function* Interpolator(duration: number, easingFn: EasingFn = (t: number) => t): Iterator<number, number, number> {
  const start: number = yield 0;
  let now: number = start;
  while (now - start < duration) {
    const val: number = easingFn((now - start) / duration);
    now = yield val;
  }
  if (now - start >= duration) {
    return 1;
  }
}
