import { Align, drawText, drawTexture, parseText, textHeight } from "../core/draw";

import { Easing } from "../core/interpolation";
import { EncounterCard } from "../encounter-cards";
import { EncounterCardNode } from "./encounter-card-node";
import { GameState } from "../game-state";
import { SceneNode } from "./scene-node";
import { V2 } from "../core/v2";
import { gl } from "../core/gl";
import { on } from "../core/events";

export class EncountersActiveNode extends SceneNode {
  public tooltipCard: EncounterCard = null;
  public tooltipPosition: V2 = { x: 0, y: 0 };
  constructor(initializer: Partial<EncountersActiveNode> = {}) {
    super(initializer, "encounters_active");
    Object.assign(this, initializer);
    this.size = { x: 338, y: 48 };
    for (let i: number = 0; i < 10; i++) {
      this.add(new EncounterCardNode());
    }
    on("encounter_card_tooltip", (card: EncounterCard, position: V2) => {
      this.tooltipCard = card;
      this.tooltipPosition = position;
    });
  }

  public cards(): EncounterCardNode[] {
    const result: EncounterCardNode[] = [];
    for (const [id, node] of this.nodes) {
      if (node instanceof EncounterCardNode) {
        result.push(node);
      }
    }
    return result;
  }

  public update(now: number, delta: number): void {
    const cardNodes: EncounterCardNode[] = this.cards();
    const handSize: number = GameState.encountersActive.length;
    let xOffset: number = 0;

    for (let i: number = Math.min(cardNodes.length - 1, handSize - 1); i >= 0; i--) {
      cardNodes[i].card = GameState.encountersActive[i];
      if (!cardNodes[i].movementAnimation) {
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
    gl.colour(0x66FFFFFF);
    for (let i: number = 0; i < 10; i++) {
      drawTexture("card_empty_space", this.topLeft.x + (34 * i), this.topLeft.y);
    }
    gl.colour(0xFFFFFFFF);
    super.draw(now, delta);

    if (this.tooltipCard) {
      // tooltipCard
      const topLeft: V2 = { x: this.tooltipPosition.x - 34, y: this.tooltipPosition.y + 50 };
      const nameLines: number = parseText(`${this.tooltipCard.name}`, { textAlign: Align.Center, wrap: 98 });
      let height: number = 3;
      height += textHeight(nameLines, 1);
      height += (this.tooltipCard.armor > 0 ? this.tooltipCard.description.length > 0 ? 11 : 7 : this.tooltipCard.description.length > 0 ? 4 : 0);
      for (let i: number = 0, l: number = this.tooltipCard.description.length; i < l; i++) {
        const lines: number = parseText(this.tooltipCard.description[i], { textAlign: Align.Center, wrap: 96 });
        height += textHeight(lines, 1);
      }

      gl.colour(0XFFEEEEEE);
      drawTexture("solid", topLeft.x, topLeft.y, 102, height + 2);
      gl.colour(0xFF0E0803);
      drawTexture("solid", topLeft.x + 1, topLeft.y + 1, 100, height);

      // Card Name
      let yTooltipOffset: number = 3;
      drawText(`${this.tooltipCard.name}`, topLeft.x + 51, topLeft.y + yTooltipOffset, { textAlign: Align.Center, colour: 0XFFEEEEEE, wrap: 98 });
      yTooltipOffset += textHeight(nameLines, 1);

      // Card armor
      if (this.tooltipCard.armor > 0) {
        drawText(`armor ${this.tooltipCard.armor}`, topLeft.x + 51, topLeft.y + yTooltipOffset, { textAlign: Align.Center, colour: 0XFF777777 });
        yTooltipOffset += 11;
      } else if (this.tooltipCard.description.length > 0) {
        yTooltipOffset += 4;
      }

      // Card Effects
      for (let i: number = 0, l: number = this.tooltipCard.description.length; i < l; i++) {
        const lines: number = drawText(this.tooltipCard.description[i], topLeft.x + 51, topLeft.y + yTooltipOffset, { textAlign: Align.Center, colour: 0XFFEEEEEE, wrap: 96 });
        yTooltipOffset += textHeight(lines, 1);
      }
    }
  }
}
