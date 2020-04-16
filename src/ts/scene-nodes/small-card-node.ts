import { Interactive } from "../core/pointer";
import { PlayerCard } from "../player-cards";
import { SceneNode } from "./scene-node";
import { drawTexture } from "../core/draw";
import { emit } from "../core/events";
import { gl } from "../core/gl";

export class SmallCardNode extends SceneNode implements Interactive {
  public hover: boolean;
  public pressed: boolean;
  public onHover(): void {
    emit("player_card_tooltip", this.card);
  }
  public onBlur(): void {
    throw new Error("Method not implemented.");
  }
  public onMouseDown(): void {
    throw new Error("Method not implemented.");
  }
  public onMouseUp(): void {
    throw new Error("Method not implemented.");
  }
  public card: PlayerCard;
  constructor(initializer: Partial<SmallCardNode> = {}) {
    super(initializer, "small_card_node");
    Object.assign(this, initializer);
    if (!this.card) {
      // throw new Error("null card data! ILLEGAL!");
    }
  }
  public update(now: number, delta: number): void {
    super.update(now, delta);
  }

  public draw(now: number, delta: number): void {
    if (this.card) {
      drawTexture(this.card.art + "_small", this.topLeft.x, this.topLeft.y);
    } else {
      gl.colour(0xFF0000FF);
      drawTexture("solid", this.topLeft.x, this.topLeft.y + 1, 32, 32);
      gl.colour(0xFFFFFFFF);
    }
    drawTexture("card_small", this.topLeft.x, this.topLeft.y);
    super.draw(now, delta);
  }
}
