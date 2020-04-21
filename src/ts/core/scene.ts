import { EasingFn, Interpolator } from "./interpolation";
import { Interactive, pointer } from "./pointer";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../game";
import { SceneNode, isInteractiveScenenode as isInteractiveSceneNode } from "../scene-nodes/scene-node";
import { drawText, drawTexture } from "./draw";
import { off, on } from "./events";

import { Builder } from "./builder";
import { State } from "./state";
import { V2 } from "./v2";
import { gl } from "./gl";

export abstract class Scene implements State {
  public id: string;
  public root: SceneNode;
  private nodesUnderPointer: Map<number, SceneNode & Interactive> = new Map();
  private nodesPressed: Map<number, SceneNode & Interactive> = new Map();
  public backgroundColour: [number, number, number] = [50, 51, 53];
  public backgroundAnimation: (now: number) => boolean;

  constructor() {
    this.root = new Builder(SceneNode)
      .with("size", { x: SCREEN_WIDTH, y: SCREEN_HEIGHT })
      .build();
  }

  private onMouseMove = (pointerPosition: V2, mouseDown: boolean) => {
    const newMap: Map<number, SceneNode & Interactive> = new Map();
    const nodes: (SceneNode | Interactive)[] = this.root.nodesAt(pointerPosition);
    for (const node of nodes) {
      if (isInteractiveSceneNode(node)) {
        if (!node.hover) {
          node.hover = true;
          node.onHover(mouseDown);
        }
        newMap.set(node.id, node);
      }
    }

    for (const [id, node] of this.nodesUnderPointer) {
      if (!newMap.has(id)) {
        node.hover = false;
        node.onBlur();
      }
    }
    this.nodesUnderPointer = newMap;
  }
  private onMouseDown = () => {
    for (const [id, node] of this.nodesUnderPointer) {
      node.onMouseDown();
      node.pressed = true;
      this.nodesPressed.set(node.id, node);
    }
  }
  private onMouseUp = () => {
    for (const [id, node] of this.nodesPressed) {
      if (this.nodesUnderPointer.has(id) && node.pressed) {
        node.onMouseUp();
      }
      node.pressed = false;
    }
  }
  public transitionIn(): Promise<any> {
    on("mouse_move", this.onMouseMove);
    on("mouse_down", this.onMouseDown);
    on("mouse_up", this.onMouseUp);
    return Promise.resolve();
  }
  public transitionOut(): Promise<any> {
    off("mouse_move", this.onMouseMove);
    off("mouse_down", this.onMouseDown);
    off("mouse_up", this.onMouseUp);
    return Promise.resolve();
  }
  public changeBackground(r: number, g: number, b: number, duration: number = 0, easingFn: EasingFn = (t: number) => t): Promise<void> {
    if (duration === 0 || (this.backgroundColour[0] === r && this.backgroundColour[1] === g && this.backgroundColour[2] === b)) {
      this.backgroundColour = [r, g, b];
      gl.background(...this.backgroundColour);
      return Promise.resolve();
    }
    const interp: Iterator<number, number, number> = Interpolator(duration, easingFn);
    const [oRed, oGreen, oBlue] = this.backgroundColour;
    return new Promise((resolve, reject) => {
      this.backgroundAnimation = (now: number): boolean => {
        const i: IteratorResult<number> = interp.next(now);
        this.backgroundColour[0] = oRed + Math.round((r - oRed) * i.value);
        this.backgroundColour[1] = oGreen + Math.round((g - oGreen) * i.value);
        this.backgroundColour[2] = oBlue + Math.round((b - oBlue) * i.value);
        if (i.done) {
          this.backgroundColour = [r, g, b];
          resolve();
        }
        gl.background(...this.backgroundColour);
        return i.done;
      };
    });
  }
  public update(now: number, delta: number): void {
    if (this.backgroundAnimation) {
      if (this.backgroundAnimation(now)) {
        this.backgroundAnimation = null;
      }
    }
    this.root.update(now, delta);
  }
  public draw(now: number, delta: number): void {
    this.root.draw(now, delta);
    // drawText(`${pointer.x}, ${pointer.y}`, pointer.x, pointer.y + 7);
    // drawTexture("solid", pointer.x, pointer.y, 1, 1);
  }
}
