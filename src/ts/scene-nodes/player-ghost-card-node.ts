import { SceneNode } from "./scene-node";
import { drawTexture } from "../core/draw";
import { gl } from "../core/gl";

export class PlayerGhostCardNode extends SceneNode {
  constructor(initializer: Partial<PlayerGhostCardNode> = {}) {
    super(initializer, "ghost_card");
    Object.assign(this, initializer);
    this.size = { x: 32, y: 48 };
  }
  public draw(now: number, delta: number): void {
    gl.colour(0x33FFFFFF);
    drawTexture("card_empty_space", this.topLeft.x, this.topLeft.y);
    super.draw(now, delta);
  }
}
