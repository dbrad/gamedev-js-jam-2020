import { drawText, drawTexture } from "../core/draw";

import { EncounterCard } from "../encounter-cards";
import { GameState } from "../game-state";
import { Interactive } from "../core/pointer";
import { SceneNode } from "./scene-node";
import { emit } from "../core/events";
import { gl } from "../core/gl";

export class EncounterCardNode extends SceneNode implements Interactive {
  public hover: boolean;
  public pressed: boolean;
  public onHover(mouseDown: boolean): void { }
  public onBlur(): void {
    if (GameState.encounterTarget === this.card) {
      GameState.encounterTarget = null;
    }
    emit("encounter_card_tooltip", null, { x: 0, y: 0 });
  }
  public onMouseDown(): void { }
  public onMouseUp(): void { }
  public card: EncounterCard;
  constructor(initializer: Partial<EncounterCardNode> = {}) {
    super(initializer, "encounter_card");
    Object.assign(this, initializer);
    this.size = { x: 32, y: 48 };
  }

  public update(now: number, delta: number): void {
    if (this.card && this.card.health === 0) {
      const index: number = GameState.encountersActive.indexOf(this.card);
      GameState.encountersActive.splice(index, 1);
      GameState.encounterTarget = null;
      this.moveTo({ x: -34, y: 0 });
      this.card = null;
      this.parent.add(this);
      this.parent.update(now, delta);
      return;
    }
    if (this.hover && this.card) {
      GameState.encounterTarget = this.card;
      emit("encounter_card_tooltip", this.card, this.topLeft);
    }
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
    drawTexture("card_enemy_small", this.topLeft.x, this.topLeft.y);
    if (this.card) {
      drawText(`${this.card.health}`, this.topLeft.x + this.size.x - 9, this.topLeft.y + this.size.y - 9);
    } else {
      drawText(`0`, this.topLeft.x + this.size.x - 9, this.topLeft.y + this.size.y - 9);
    }
    super.draw(now, delta);
  }
}
