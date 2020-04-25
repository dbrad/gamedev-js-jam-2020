// ZzFXmicro - Zuper Zmall Zound Zynth - MIT License - Copyright 2019 Frank Force
const zzfx_v: number = 0.5;
const zzfx_x: AudioContext = new AudioContext();

export function zzfx(volume: number, randomness: number, frequency: number, length: number = 1, attack: number = 0.1, slide: number = 0, noise: number = 0, modulation: number = 0, phase: number = 0): AudioBufferSourceNode {
  const S: number = 44100;
  const P: number = Math.PI;
  frequency *= 2 * P / S;
  frequency *= 1 + randomness * (2 * Math.random() - 1);
  slide *= 1E3 * P / (S ** 2);
  length = 0 < length ? S * (10 < length ? 10 : length) | 0 : 1;
  attack *= length | 0;
  modulation *= 2 * P / S;
  phase *= P;

  const channelData: number[] = [];
  for (let m: number = 0, n: number = 0, c: number = 0; c < length; ++c) {
    channelData[c] = volume * zzfx_v * Math.cos(m * frequency * Math.cos(n * modulation + phase)) * (c < attack ? c / attack : 1 - (c - attack) / (length - attack));
    m += 1 + noise * (2 * Math.random() - 1);
    n += 1 + noise * (2 * Math.random() - 1);
    frequency += slide;
  }

  const buffer: AudioBuffer = zzfx_x.createBuffer(1, length, S);
  const bufferSource: AudioBufferSourceNode = zzfx_x.createBufferSource();

  buffer.getChannelData(0).set(channelData);
  bufferSource.buffer = buffer;
  bufferSource.connect(zzfx_x.destination);
  bufferSource.start();
  return bufferSource;
}

export const cardFwip: () => void = () => zzfx(0.05, 0, -350, .1, .85, 1, 20.1, 3, 0);

export const thwack: () => void = () => zzfx(1, .15, 1353, .1, .05, 7.4, 3.2, 1.5, .98);

export const action: () => void = () => zzfx(1,.05,153,.2,.14,0,3.3,17.3,.85);

export const buttonHover: () => void = () => zzfx(1, .02, 440, .05, .55, 0, 0, 0, .1);

export const buttonMouseDown: () => void = () => zzfx(1, .02, 220, .05, .55, 0, 0, 0, .1);

export const buttonMouseUp: () => void = () => zzfx(1, .02, 330, .05, .55, 0, 0, 0, .1);
