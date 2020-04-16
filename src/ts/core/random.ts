/**
 * Base abstract class for random number generators.
 *
 * @abstract
 * @class RandonNumberGenerator
 */
abstract class RandonNumberGenerator {
  public abstract next(): number;

  public int(min: number, max: number): number {
    return ~~(this.next() * (max - min + 1)) + min;
  }

  public shuffle<T>(array: T[]): T[] {
    let currentIndex: number = array.length, temporaryValue: T, randomIndex: number;
    const arr: T[] = array.slice();
    while (0 !== currentIndex) {
      randomIndex = ~~(this.next() * currentIndex);
      currentIndex -= 1;
      temporaryValue = arr[currentIndex];
      arr[currentIndex] = arr[randomIndex];
      arr[randomIndex] = temporaryValue;
    }
    return arr;
  }
}

/**
 * A seeded version of a random number generator, used for deterministic PRNG.
 *
 * @export
 * @class SeededRandonNumberGenerator
 * @extends {RandonNumberGenerator}
 */
export class SeededRandonNumberGenerator extends RandonNumberGenerator {
  private _x: number;
  private readonly _m: number;
  private readonly _a: number;
  private readonly _c: number;

  constructor(seed: number = null, m: number = 16127, a: number = 3967, c: number = 11) {
    super();
    this._x = seed || performance.now();
    this._m = m;
    this._a = a;
    this._c = c;
  }

  public next(): number {
    this._x = (this._a * this._x + this._c) % this._m;
    return this._x / this._m;
  }

  public reseed(seedValue: number = null): void {
    this._x = seedValue || performance.now();
  }

}

/**
 * Globally usable SeededRandonNumberGenerator. Use this is you want deterministic RNG by seeding it with a consisant value.
 * @type {SeededRandonNumberGenerator}
 */
export const srand: SeededRandonNumberGenerator = new SeededRandonNumberGenerator();

/**
 * A random number generator that uses Javascript's Math.random() as the source of it's random number generation.
 *
 * @export
 * @class UnseededRandonNumberGenerator
 * @extends {RandonNumberGenerator}
 */
export class UnseededRandonNumberGenerator extends RandonNumberGenerator {
  public next(): number {
    return Math.random();
  }
}

/**
 * Globally usable UnseededRandonNumberGenerator. Use this is you want RNG, but don't care if it is deterministic.
 * @type {UnseededRandonNumberGenerator}
 */
export const rand: UnseededRandonNumberGenerator = new UnseededRandonNumberGenerator();
