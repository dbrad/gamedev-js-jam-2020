import { Align, drawText, drawTexture, textHeight } from "../core/draw";

import { Builder } from "../core/builder";
import { Easing } from "../core/interpolation";
import { GameState } from "../game-state";
import { PlayerCard } from "../player-cards";
import { PlayerGhostCardNode } from "./player-ghost-card-node";
import { PlayerHandCardNode } from "./player-hand-card-node";
import { SceneNode } from "./scene-node";
import { V2 } from "../core/v2";
import { cardFwip } from "../core/zzfx";
import { gl } from "../core/gl";
import { on } from "../core/events";

export class PlayerHandNode extends SceneNode {
  public tooltipCard: PlayerCard = null;
  public tooltipPosition: V2 = { x: 0, y: 0 };
  public ghostCard: PlayerGhostCardNode;

  constructor(initializer: Partial<PlayerHandNode> = {}) {
    super(initializer, "player_hand");
    Object.assign(this, initializer);
    this.size = { x: 338, y: 48 };

    this.ghostCard = new Builder(PlayerGhostCardNode).build();
    this.ghostCard.moveTo({ x: -34, y: 0 });
    this.add(this.ghostCard);

    for (let i: number = 0; i < 15; i++) {
      this.add(new PlayerHandCardNode());
    }
    on("player_card_tooltip", (card: PlayerCard, position: V2) => {
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
    if (this.cardSelected) {
      GameState.playerSelectedCard = this.cardSelected.card;
    } else {
      this.ghostCard.movementAnimation = null;
      this.ghostCard.moveTo({ x: -34, y: 0 });
      GameState.playerSelectedCard = null;
    }
    const cardNodes: PlayerHandCardNode[] = this.cards();
    const handSize: number = GameState.playerHand.length;
    let xOffset: number = (338 - (((handSize - 1) * 34) + 32)) / 2;

    for (let i: number = 0; i < handSize; i++) {
      cardNodes[i].card = GameState.playerHand[i];
      if (!cardNodes[i].hover && !cardNodes[i].pressed && !cardNodes[i].movementAnimation) {
        cardNodes[i].moveTo({ x: xOffset, y: 0 }, 250 + (25 * i), Easing.easeOutQuad);
      }
      xOffset += 34;
    }
    for (let i: number = handSize; i < cardNodes.length; i++) {
      cardNodes[i].card = null;
      cardNodes[i].moveTo({ x: -34, y: 0 });
    }
    super.update(now, delta);
  }

  public draw(now: number, delta: number): void {
    super.draw(now, delta);
    if (this.cardSelected) {
      // Selected TOOLTIP
      const topLeft: V2 = { x: this.cardSelected.topLeft.x + 34, y: this.topLeft.y - 49 };
      gl.colour(0XFFEEEEEE);
      drawTexture("solid", topLeft.x, topLeft.y, 102, 44);
      gl.colour(0xFF0E0803);
      drawTexture("solid", topLeft.x + 1, topLeft.y + 1, 100, 42);

      // Card Name
      let yTooltipOffset: number = 3;
      const levelString: string = this.cardSelected.card.level > 0 ? `+${this.cardSelected.card.level}` : ``;
      const nameLines: number = drawText(`${this.cardSelected.card.name}${levelString}`, topLeft.x + 51, topLeft.y + yTooltipOffset, { textAlign: Align.Center, colour: 0XFFEEEEEE, wrap: 98 });
      yTooltipOffset += textHeight(nameLines, 1);

      // Card Type
      drawText(this.cardSelected.card.type, topLeft.x + 51, topLeft.y + yTooltipOffset, { textAlign: Align.Center, colour: 0XFF777777 });
      yTooltipOffset += 11;

      // Card Effects
      for (let i: number = 0, l: number = this.cardSelected.card.description.length; i < l; i++) {
        const lines: number = drawText(this.cardSelected.card.description[i], topLeft.x + 51, topLeft.y + yTooltipOffset, { textAlign: Align.Center, colour: 0XFFEEEEEE, wrap: 96 });
        yTooltipOffset += textHeight(lines, 1);
      }

      if (this.cardSelected.card.name === "rift stitch") {
        yTooltipOffset += 3;
        drawText(`${10 - GameState.stitchCounter} more...`, topLeft.x + 51, topLeft.y + yTooltipOffset, { textAlign: Align.Center, colour: 0XFFEEEEEE, wrap: 96 });
      }
    } else if (this.tooltipCard) {
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

      if (this.tooltipCard.name === "rift stitch") {
        yTooltipOffset += 3;
        drawText(`${10 - GameState.stitchCounter} more...`, topLeft.x + 51, topLeft.y + yTooltipOffset, { textAlign: Align.Center, colour: 0XFFEEEEEE, wrap: 96 });
      }
    }
  }
}
