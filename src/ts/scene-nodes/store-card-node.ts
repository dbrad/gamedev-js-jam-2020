import { drawText, drawTexture } from "../core/draw";

import { GameState } from "../game-state";
import { Interactive } from "../core/pointer";
import { PlayerCard } from "../player-cards";
import { SceneNode } from "./scene-node";
import { drawPlayerCard } from "../common";
import { emit } from "../core/events";
import { gl } from "../core/gl";

export class StoreCardNode extends SceneNode implements Interactive {
  public hover: boolean;
  public pressed: boolean;
  public onHover(mouseDown: boolean): void { }
  public onBlur(): void {
    emit("store_card_tooltip", null, { x: 0, y: 0 });

  }
  public onMouseDown(): void { }
  public onMouseUp(): void {
    if (this.card && this.card.cost <= GameState.playerMoney) {
      this.moveTo({ x: this.relativeOrigin.x, y: 0 });
      this.movementAnimation = null;
      this.hover = false;
      this.onBlur();

      GameState.playerMoney -= this.card.cost;
      const cardIndex: number = GameState.storeActive.indexOf(this.card);
      GameState.storeActive.splice(cardIndex, 1);
      emit("card_discarded", this.card);

      this.parent.add(this);
    }
  }
  public card: PlayerCard;

  constructor(initializer: Partial<StoreCardNode> = {}) {
    super(initializer, "store_card");
    Object.assign(this, initializer);
    this.size = { x: 32, y: 48 };
  }
  public update(now: number, delta: number): void {
    if (this.hover && this.card) {
      emit("store_card_tooltip", this.card, this.topLeft);
    }
    super.update(now, delta);
  }
  public draw(now: number, delta: number): void {
    if (this.card && this.hover) {
      gl.colour(0xFFEEEEEE);
      drawTexture("solid", this.topLeft.x - 1, this.topLeft.y - 1, this.size.x + 2, this.size.y + 2);
      gl.colour(0xFFFFFFFF);
    }
    drawPlayerCard(this.card, this.topLeft, this.size);
    if (this.card && GameState.playerMoney < this.card.cost) {
      drawText(`${this.card.cost}`, this.topLeft.x + this.size.x - 11, this.topLeft.y + this.size.y - 9, { colour: 0xFF0000FF });
      gl.colour(0xAA000000);
      drawTexture("solid", this.topLeft.x, this.topLeft.y, 32, 48);
    }
    super.draw(now, delta);
  }
}
