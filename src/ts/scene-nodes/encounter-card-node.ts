import { Align, drawText, drawTexture } from "../core/draw";

import { EncounterCard } from "../encounter-cards";
import { EncountersActiveNode } from "./encounters-active-node";
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
  public parent: EncountersActiveNode;
  constructor(initializer: Partial<EncounterCardNode> = {}) {
    super(initializer, "encounter_card");
    Object.assign(this, initializer);
    this.size = { x: 32, y: 48 };
  }

  public update(now: number, delta: number): void {
    if (this.card && this.card.health === 0) {
      if (GameState.encounterTarget === this.card) {
        GameState.encounterTarget = null;
      }

      const index: number = GameState.encountersActive.indexOf(this.card);
      GameState.encountersActive.splice(index, 1);
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
    if (this.card
      && GameState.encounterPlaying === this.card
      && !this.movementAnimation) {
      this.moveBy({ x: 0, y: 10 }, 120).then(() => {
        this.card.effects.map(fn => fn());
        return this.moveBy({ x: 0, y: -10 }, 120).then(() => {
          GameState.encounterPlaying = null;
        });
      });
    }
    super.update(now, delta);
  }

  public draw(now: number, delta: number): void {
    if (this.card) {
      if (this.card === GameState.encounterTarget || GameState.encounterPlaying === this.card) {
        gl.colour(0xFFEEEEEE);
        drawTexture("solid", this.topLeft.x - 1, this.topLeft.y - 1, this.size.x + 2, this.size.y + 2);
        gl.colour(0xFFFFFFFF);
      }
      drawTexture(this.card.art, this.topLeft.x, this.topLeft.y);
    } else {
      gl.colour(0xFF0000FF);
      drawTexture("solid", this.topLeft.x, this.topLeft.y + 1, 32, 32);
      gl.colour(0xFFFFFFFF);
    }
    drawTexture("card_enemy", this.topLeft.x, this.topLeft.y);
    if (this.card) {
      drawText(`${this.card.health}`, this.topLeft.x + this.size.x - 9, this.topLeft.y + this.size.y - 9);
    } else {
      drawText(`0`, this.topLeft.x + this.size.x - 9, this.topLeft.y + this.size.y - 9);
    }

    if (this.card
      && this.card === GameState.encounterTarget
      && GameState.playerSelectedCard
      && GameState.playerSelectedCard.type === "attack") {
      gl.colour(0x99000000);
      drawTexture("solid", this.topLeft.x, this.topLeft.y, this.size.x, this.size.y);
      const value: number = Math.min(-GameState.playerSelectedCard.attackValue + this.card.armor, 0);
      drawText(`${value}`, this.topLeft.x + this.size.x / 2 + 1, this.topLeft.y + this.size.y / 2 - 5, { textAlign: Align.Center, scale: 2, colour: 0xFF2222FF });
    }
    super.draw(now, delta);
  }
}
