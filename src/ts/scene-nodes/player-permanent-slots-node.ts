import { Align, drawText, drawTexture, textHeight } from "../core/draw";

import { Easing } from "../core/interpolation";
import { GameState } from "../game-state";
import { PlayerCard } from "../player-cards";
import { PlayerHandCardNode } from "./player-hand-card-node";
import { SceneNode } from "./scene-node";
import { V2 } from "../core/v2";
import { gl } from "../core/gl";
import { on } from "../core/events";

export class PlayerPermanentSlotsNode extends SceneNode {
  public tooltipCard: PlayerCard = null;
  public tooltipPosition: V2 = { x: 0, y: 0 };

  constructor(initializer: Partial<PlayerPermanentSlotsNode> = {}) {
    super(initializer, "permanent_slots");
    Object.assign(this, initializer);
    this.size = { x: 406, y: 48 };
    for (let i: number = 0; i < 12; i++) {
      this.add(new PlayerHandCardNode());
    }
    on("permanent_card_tooltip", (card: PlayerCard, position: V2) => {
      this.tooltipCard = card;
      this.tooltipPosition = position;
    });
  }

  public cardSelected: PlayerHandCardNode = null;

  public cards(): PlayerHandCardNode[] {
    const result: PlayerHandCardNode[] = [];
    for (const [id, node] of this.nodes) {
      if (node instanceof PlayerHandCardNode) {
        result.push(node);
      }
    }
    return result;
  }

  public update(now: number, delta: number): void {
    const cardNodes: PlayerHandCardNode[] = this.cards();
    const cardCount: number = GameState.playerPermanents.length;
    let xOffset: number = (406 - (((cardCount - 1) * 34) + 32)) / 2;

    for (let i: number = 0; i < cardCount; i++) {
      cardNodes[i].card = GameState.playerPermanents[i];
      if (!cardNodes[i].hover && !cardNodes[i].pressed && !cardNodes[i].movementAnimation) {
        cardNodes[i].moveTo({ x: xOffset, y: 0 }, 250 + (25 * i), Easing.easeOutQuad);
      }
      xOffset += 34;
    }
    for (let i: number = cardCount; i < cardNodes.length; i++) {
      cardNodes[i].card = null;
      cardNodes[i].moveTo({ x: 0, y: 350 });
    }
    super.update(now, delta);
  }

  public draw(now: number, delta: number): void {
    gl.colour(0x66FFFFFF);
    for (let i: number = 0; i < 12; i++) {
      drawTexture("card_empty_space", this.topLeft.x + 34 * i, this.topLeft.y);
    }
    gl.colour(0xFFFFFFFF);
    super.draw(now, delta);

    if (this.tooltipCard) {
      // HOVER TOOLTIP
      const topLeft: V2 = { x: this.tooltipPosition.x - 34, y: this.tooltipPosition.y - 49 };
      gl.colour(0XFFEEEEEE);
      drawTexture("solid", topLeft.x, topLeft.y, 102, 44);
      gl.colour(0xFF0E0803);
      drawTexture("solid", topLeft.x + 1, topLeft.y + 1, 100, 42);

      // Card Name
      let yTooltipOffset: number = 3;
      const levelString: string = this.tooltipCard.level > 0 ? `+${this.tooltipCard.level}` : ``;
      const nameLines: number = drawText(`${this.tooltipCard.name}${levelString}`, topLeft.x + 51, topLeft.y + yTooltipOffset, { textAlign: Align.Center, colour: 0XFFEEEEEE, wrap: 98 });
      yTooltipOffset += textHeight(nameLines, 1);

      // Card Type
      drawText(this.tooltipCard.type, topLeft.x + 51, topLeft.y + yTooltipOffset, { textAlign: Align.Center, colour: 0XFF777777 });
      yTooltipOffset += 11;

      // Card Effects
      for (let i: number = 0, l: number = this.tooltipCard.description.length; i < l; i++) {
        const lines: number = drawText(this.tooltipCard.description[i], topLeft.x + 51, topLeft.y + yTooltipOffset, { textAlign: Align.Center, colour: 0XFFEEEEEE, wrap: 96 });
        yTooltipOffset += textHeight(lines, 1);
      }
    }

  }
}
