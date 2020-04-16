import { EasingFn, Interpolator } from "../core/interpolation";
import { V2, inside } from "../core/v2";
import { colourToHex, hexToColour } from "../core/colour";

import { Interactive } from "../core/pointer";
import { gl } from "../core/gl";

export function isInteractiveScenenode(arg: object): arg is SceneNode & Interactive {
  return (arg as SceneNode & Interactive).onHover !== undefined;
}

let currentNodeId: number = 0;

export class SceneNode {
  public readonly type_id: string;
  public readonly id: number;
  public parent: SceneNode = null;
  public nodes: Map<number, SceneNode> = new Map();
  public enabled: boolean = true;
  public visible: boolean = true;

  public size: V2 = { x: 0, y: 0 };
  public anchor: V2 = { x: 0, y: 0 };
  protected _relativeOrigin: V2 = { x: 0, y: 0 };
  // TODO(dbrad): Change to a movementAnimationQueue? If I do I should expose an easy way to cancel outstanding movement (clear the queue)
  public movementAnimation: (now: number) => boolean = null;

  protected _colour: number = 0xFFFFFFFF;
  protected _red: number = 0XFF;
  protected _blue: number = 0XFF;
  protected _green: number = 0XFF;
  protected _alpha: number = 0XFF;
  public colourAnimation: (now: number) => boolean = null;

  constructor(initializer: Partial<SceneNode> = {}, node_type: string = "scene_node") {
    Object.assign(this, initializer);
    this.id = currentNodeId++;
    this.type_id = `${node_type}_${this.id}`;
  }

  public nodesAt(point: V2): SceneNode[] {
    const result: SceneNode[] = [];
    if (this.enabled
      && this.visible
      && this._relativeOrigin
      && inside(point, this.topLeft, this.size)) {
      result.push(this);
      for (const [id, child] of this.nodes) {
        result.push(...child.nodesAt(point));
      }
    }
    return result;
  }

  public add(node: SceneNode): void {
    if (node.parent) {
      node.parent.remove(node);
    }
    this.nodes.set(node.id, node);
    node.parent = this;
    node.enable();
  }

  public remove(node: SceneNode): void {
    node.disable();
    node.parent = null;
    if (this.nodes) {
      this.nodes.delete(node.id);
    }
  }

  public enable(): void {
    this.enabled = true;
    for (const [id, node] of this.nodes) {
      node.enable();
    }
  }

  public disable(): void {
    this.enabled = false;
    for (const [id, node] of this.nodes) {
      node.disable();
    }
  }

  //#region Position
  public get relativeOrigin(): V2 {
    return V2.copy(this._relativeOrigin);
  }
  private cachedOrigin: V2 = null;
  public get absoluteOrigin(): V2 {
    if (this.cachedOrigin) {
      return this.cachedOrigin;
    }
    if (this.parent) {
      return {
        x: this.parent.topLeft.x + this._relativeOrigin.x,
        y: this.parent.topLeft.y + this._relativeOrigin.y
      };
    }
    return V2.copy(this._relativeOrigin);
  }

  public get topLeft(): V2 {
    return V2.add(
      this.absoluteOrigin,
      {
        x: ~~(this.anchor.x * -(this.size.x - 1)),
        y: ~~(this.anchor.y * -(this.size.y - 1))
      });
  }

  private animateMovement(origin: V2, destination: V2, duration: number, easingFn: EasingFn): Promise<void> {
    const interp: Iterator<number, number, number> = Interpolator(duration, easingFn);
    return new Promise((resolve, reject) => {
      this.movementAnimation = (now: number): boolean => {
        const i: IteratorResult<number> = interp.next(now);
        this._relativeOrigin.x = origin.x + Math.round((destination.x - origin.x) * i.value);
        this._relativeOrigin.y = origin.y + Math.round((destination.y - origin.y) * i.value);
        if (i.done) {
          this._relativeOrigin.x = destination.x;
          this._relativeOrigin.y = destination.y;
          resolve();
        }
        return i.done;
      };
    });
  }

  public moveTo(position: V2, duration: number = 0, easingFn: EasingFn = (t: number) => t): Promise<any> {
    this.cachedOrigin = null;
    const origin: V2 = V2.copy(this._relativeOrigin);
    const destination: V2 = V2.copy(position);
    if (origin.x === destination.x && origin.y === destination.y) {
      return Promise.resolve();
    }
    if (duration === 0) {
      this._relativeOrigin.x = destination.x;
      this._relativeOrigin.y = destination.y;
      return Promise.resolve();
    }
    return this.animateMovement(origin, destination, duration, easingFn);
  }

  public moveBy(amount: V2, duration: number = 0, easingFn: EasingFn = (t: number) => t): Promise<any> {
    this.cachedOrigin = null;
    const origin: V2 = V2.copy(this._relativeOrigin);
    const destination: V2 = V2.add(origin, amount);
    if (origin.x === destination.x && origin.y === destination.y) {
      return Promise.resolve();
    }
    if (duration === 0) {
      this._relativeOrigin.x = destination.x;
      this._relativeOrigin.y = destination.y;
      return Promise.resolve();
    }
    return this.animateMovement(origin, destination, duration, easingFn);
  }
  //#endregion Position

  //#region Colour
  public get colour(): number {
    return this._colour;
  }
  public set colour(abgr: number) {
    this._colour = abgr;
    const [a, b, g, r] = hexToColour(this._colour);
    this._alpha = a;
    this._blue = b;
    this._green = g;
    this._red = r;
  }
  public get red(): number {
    return this._red;
  }
  public set red(value: number) {
    this._red = ~~value;
    this._colour = colourToHex(this._alpha, this._blue, this._green, this._red);
  }
  public get blue(): number {
    return this._blue;
  }
  public set blue(value: number) {
    this._blue = ~~value;
    this._colour = colourToHex(this._alpha, this._blue, this._green, this._red);
  }
  public get green(): number {
    return this._green;
  }
  public set green(value: number) {
    this._green = ~~value;
    this._colour = colourToHex(this._alpha, this._blue, this._green, this._red);
  }
  public get alpha(): number {
    return this._alpha;
  }
  public set alpha(value: number) {
    this._alpha = ~~value;
    this._colour = colourToHex(this._alpha, this._blue, this._green, this._red);
  }
  public fade(fadeTo: number, duration: number, easingFn: EasingFn = (t: number) => t): Promise<void> {
    if (this.alpha === fadeTo) {
      return Promise.resolve();
    }
    if (duration === 0) {
      this.alpha = fadeTo;
      return Promise.resolve();
    }

    const interp: Iterator<number, number, number> = Interpolator(duration, easingFn);
    const origin: number = this.alpha;

    return new Promise((resolve, reject) => {
      this.colourAnimation = (now: number): boolean => {
        const i: IteratorResult<number> = interp.next(now);
        this.alpha = origin + Math.round((fadeTo - origin) * i.value);
        if (i.done) {
          this.alpha = fadeTo;
          resolve();
        }
        return i.done;
      };
    });
  }
  //#endregion Colour

  public update(now: number, delta: number): void {
    if (this.enabled) {
      this.cachedOrigin = null;

      if (this.colourAnimation) {
        if (this.colourAnimation(now)) {
          this.colourAnimation = null;
        }
      }

      if (this.movementAnimation) {
        if (this.movementAnimation(now)) {
          this.movementAnimation = null;
        }
      }

      this.cachedOrigin = this.absoluteOrigin;
      for (const [id, node] of this.nodes) {
        node.update(now, delta);
      }
    }
  }

  public draw(now: number, delta: number): void {
    if (this.visible && this.enabled) {
      // // Debug volumes
      // const topLeft: V2 = V2.copy(this.topLeft);
      // const topRight: V2 = V2.add(topLeft, { x: this.size.x - 1, y: 0 });
      // const bottomLeft: V2 = V2.add(topLeft, { x: 0, y: this.size.y - 1 });
      // gl.colour(0x8800ff00);
      // drawTexture("solid", topLeft.x, topLeft.y, this.size.x, 1);
      // drawTexture("solid", topLeft.x, topLeft.y, 1, this.size.y);
      // drawTexture("solid", topRight.x, topRight.y, 1, this.size.y);
      // drawTexture("solid", bottomLeft.x, bottomLeft.y, this.size.x, 1);

      for (const [id, node] of this.nodes) {
        node.draw(now, delta);
      }
      gl.colour(0xFFFFFFFF);
    }
  }
}
