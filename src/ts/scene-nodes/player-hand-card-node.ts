import { Interactive, pointer } from "../core/pointer";
import { drawText, drawTexture } from "../core/draw";

import { Easing } from "../core/interpolation";
import { EncounterCard } from "../encounter-cards";
import { GameState } from "../game-state";
import { PlayerCard } from "../player-cards";
import { PlayerHandNode } from "./player-hand-node";
import { SceneNode } from "./scene-node";
import { V2 } from "../core/v2";
import { drawPlayerCard } from "../common";
import { emit } from "../core/events";
import { gl } from "../core/gl";

export class PlayerHandCardNode extends SceneNode implements Interactive {
  public willBePlayed: boolean = false;
  public hover: boolean;
  public pressed: boolean;
  public onHover(mouseDown: boolean): void { }
  public onBlur(): void {
    emit("player_card_tooltip", null, { x: 0, y: 0 });
  }
  public onMouseDown(): void {
    if (!this.parent.cardSelected) {
      this.parent.cardSelected = this;
    }
  }
  public onMouseUp(): void {
    this.hover = false;
  }
  public card: PlayerCard;
  public parent: PlayerHandNode;
  constructor(initializer: Partial<PlayerHandCardNode> = {}) {
    super(initializer, "player_card_node");
    Object.assign(this, initializer);
    this.size = { x: 32, y: 48 };
  }

  public update(now: number, delta: number): void {
    if (!this.pressed && this.parent.cardSelected === this) {
      this.parent.cardSelected = null;
      switch (GameState.playerMode) {
        case "discard":
          if (this.willBePlayed) {
            // discard logic
            this.moveTo({ x: this.relativeOrigin.x, y: 0 });
            this.movementAnimation = null;
            this.willBePlayed = false;
            this.hover = false;

            const cardIndex: number = GameState.playerHand.indexOf(this.card);
            GameState.playerHand.splice(cardIndex, 1);
            emit("card_discarded", this.card);

            GameState.discardsRequired -= 1;

            this.parent.add(this);
            this.parent.update(now, delta);
            return;
          }
          break;
        case "destroy":
          if (this.willBePlayed) {
            // destroy logic
            this.moveTo({ x: this.relativeOrigin.x, y: 0 });
            this.movementAnimation = null;
            this.willBePlayed = false;
            this.hover = false;

            const cardIndex: number = GameState.playerHand.indexOf(this.card);
            GameState.playerHand.splice(cardIndex, 1);

            GameState.destroysRequired -= 1;

            this.parent.add(this);
            this.parent.update(now, delta);
            return;
          }
          break;
        case "play":
        default:
          if (this.willBePlayed
            && (this.card.type === "action" || this.card.type === "permanent" || (this.card.type === "attack" && GameState.encounterTarget))) {
            const target: EncounterCard = GameState.encounterTarget;
            const abs: V2 = this.absoluteOrigin;
            const cardIndex: number = GameState.playerHand.indexOf(this.card);
            GameState.playerHand.splice(cardIndex, 1);
            
            // Play card logic
            this.moveTo({ x: this.relativeOrigin.x, y: 0 });
            this.movementAnimation = null;
            this.willBePlayed = false;
            this.hover = false;
            this.pressed = false;
            
            if(this.card.type === "permanent") {
              emit("play_permanent_card", this.card, abs);
            } else {
              emit("card_discarded", this.card);
              this.card.effects.map(fn => fn(target));
            }

            this.parent.add(this);
            this.parent.update(now, delta);
            return;
          }
      }
    } else if (this.pressed && this.parent.cardSelected === this) {
      const target: V2 = {
        x: this.relativeOrigin.x,
        y: Math.max(pointer.y - this.parent.topLeft.y - 24, -62)
      };
      this.moveTo(target);
    } else if (!this.parent.cardSelected && this.hover && !this.movementAnimation) {
      this.moveTo({ x: this.relativeOrigin.x, y: -5 }, 25, Easing.easeOutQuad);
      emit("player_card_tooltip", this.card, this.topLeft);
    }

    if (this.relativeOrigin.y <= -48) {
      this.willBePlayed = true;
    } else {
      this.willBePlayed = false;
    }

    super.update(now, delta);
  }

  public draw(now: number, delta: number): void {
    if (this.willBePlayed) {
      gl.colour(0xFF22DD00);
      drawTexture("solid", this.topLeft.x - 1, this.topLeft.y - 1, this.size.x + 2, this.size.y + 2);
      gl.colour(0xFFFFFFFF);
    }

    drawPlayerCard(this.card, this.topLeft, this.size);

    if (this.card
      && GameState.playerMode === "play"
      && this.card.type === "attack"
      && this.pressed
      && this.parent.cardSelected === this
      && this.relativeOrigin.y === -62
      && pointer.y < this.topLeft.y - 5) {
      // Bezier curve drawing to pointer!
      const p0: V2 = V2.add(this.absoluteOrigin, { x: 15, y: -5 });
      const p1: V2 = { x: this.absoluteOrigin.x + 15, y: pointer.y + (this.absoluteOrigin.y - pointer.y) / 2 };
      const p2: V2 = V2.add(pointer, { x: 1, y: 3 });
      for (let t: number = 0; t <= 0.9; t += 0.1) {
        const pt: V2 = pointOnQuadraticBezier(p0, p1, p2, t);
        drawTexture("solid", pt.x, pt.y, 2, 2);
      }
    }
    super.draw(now, delta);
  }
}

function pointOnQuadraticBezier(p0: V2, p1: V2, p2: V2, t: number): V2 {
  return {
    x: ~~((((1 - t) * (1 - t)) * p0.x) + (2 * (1 - t) * t * p1.x) + ((t * t) * p2.x)),
    y: ~~((((1 - t) * (1 - t)) * p0.y) + (2 * (1 - t) * t * p1.y) + ((t * t) * p2.y))
  };
}
