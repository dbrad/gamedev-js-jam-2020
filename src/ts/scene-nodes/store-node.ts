import { Align, drawText, drawTexture, textHeight, textWidth } from "../core/draw";

import { Easing } from "../core/interpolation";
import { GameState } from "../game-state";
import { PlayerCard } from "../player-cards";
import { SceneNode } from "./scene-node";
import { StoreCardNode } from "./store-card-node";
import { V2 } from "../core/v2";
import { gl } from "../core/gl";
import { on } from "../core/events";

export class StoreNode extends SceneNode {
  public tooltipCard: PlayerCard;
  public tooltipPosition: V2 = { x: 0, y: 0 };

  public showRefreshTooltip: boolean = false;
  public showUpgradeTooltip: boolean = false;
  constructor(initializer: Partial<StoreNode> = {}) {
    super(initializer, "store_node");
    Object.assign(this, initializer);
    this.size = { x: 304, y: 48 };
    for (let i: number = 0; i < 15; i++) {
      this.add(new StoreCardNode());
    }
    on("store_card_tooltip", (card: PlayerCard, position: V2) => {
      this.tooltipCard = card;
      this.tooltipPosition = position;
    });
    on("refresh_store_tooltip", (show: boolean) => {
      this.showRefreshTooltip = show;
    });
    on("upgrade_store_tooltip", (show: boolean) => {
      this.showUpgradeTooltip = show;
    });
  }

  public cards(): StoreCardNode[] {
    const result: StoreCardNode[] = [];
    for (const [id, node] of this.nodes) {
      if (node instanceof StoreCardNode) {
        result.push(node);
      }
    }
    return result;
  }

  public update(now: number, delta: number): void {
    const cardNodes: StoreCardNode[] = this.cards();
    const handSize: number = GameState.storeActive.length;
    let xOffset: number = 34;

    for (let i: number = handSize - 1; i >= 0; i--) {
      cardNodes[i].card = GameState.storeActive[i];
      if (!cardNodes[i].movementAnimation) {
        cardNodes[i].moveTo({ x: xOffset, y: 0 }, 250 + (25 * i), Easing.easeOutQuad);
      }
      xOffset += 34;
    }
    for (let i: number = handSize; i < cardNodes.length; i++) {
      cardNodes[i].card = null;
      cardNodes[i].moveTo({ x: 0, y: 0 });
    }
    super.update(now, delta);
  }

  public draw(now: number, delta: number): void {
    drawTexture("card_empty_space", this.topLeft.x + 34, this.topLeft.y);
    drawTexture("card_empty_space", this.topLeft.x + 68, this.topLeft.y);
    drawTexture("card_empty_space", this.topLeft.x + 102, this.topLeft.y);
    drawTexture("card_empty_space", this.topLeft.x + 136, this.topLeft.y);
    drawTexture("card_empty_space", this.topLeft.x + 170, this.topLeft.y);
    super.draw(now, delta);

    drawTexture("card_back", this.topLeft.x, this.topLeft.y);
    drawText("hq", this.topLeft.x + 16, this.topLeft.y + 3, { textAlign: Align.Center });
    drawText(`${GameState.storeDeck.length}`.padStart(2, "0"), this.topLeft.x + 16, this.topLeft.y + this.size.y - 12, { textAlign: Align.Center, colour: 0x88FFFFFF });

    //#region Store Button ToolTips
    if (this.showRefreshTooltip || this.showUpgradeTooltip) {
      const topLeft: V2 = { x: this.topLeft.x + 197, y: this.topLeft.y - 45 };
      gl.colour(0XFFEEEEEE);
      drawTexture("solid", topLeft.x, topLeft.y, 80, 40);
      gl.colour(0xFF0E0803);
      drawTexture("solid", topLeft.x + 1, topLeft.y + 1, 78, 38);
      if (this.showRefreshTooltip) {
        drawText("replace the cards in hq", topLeft.x + 40, topLeft.y + 6, { textAlign: Align.Center, wrap: 74 });
      } else {
        drawText("upgrade the cards in hq", topLeft.x + 40, topLeft.y + 6, { textAlign: Align.Center, wrap: 74 });
      }
      if (GameState.playerMoney < 1) {
        drawText("cost: 1", topLeft.x + 40, topLeft.y + 31, { textAlign: Align.Center, colour: 0XFF2222FF });
      } else {
        drawText("cost: 1", topLeft.x + 40, topLeft.y + 31, { textAlign: Align.Center, colour: 0XFFEEEEEE });
      }
    }
    //#endregion Store Button ToolTips

    //#region STORE CARD TOOLTIP
    if (this.tooltipCard) {
      const topLeft: V2 = { x: this.tooltipPosition.x - 34, y: this.tooltipPosition.y - 65 };
      gl.colour(0XFFEEEEEE);
      drawTexture("solid", topLeft.x, topLeft.y, 102, 60);
      gl.colour(0xFF0E0803);
      drawTexture("solid", topLeft.x + 1, topLeft.y + 1, 100, 58);

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

      // Card Cost
      if (this.tooltipCard.cost > GameState.playerMoney) {
        drawText(`cost: ${this.tooltipCard.cost}`, topLeft.x + 51, topLeft.y + 52, { textAlign: Align.Center, colour: 0XFF2222FF });
      } else {
        drawText(`cost: ${this.tooltipCard.cost}`, topLeft.x + 51, topLeft.y + 52, { textAlign: Align.Center, colour: 0XFFEEEEEE });
      }

      // STORE CARD LEVEL TOOLTIP
      if (this.tooltipCard.levelsText.length > 0 && this.tooltipCard.level < 5) {
        const height: number = textHeight(this.tooltipCard.levelsText.length, 1) + 4 + this.tooltipCard.levelsText.length;
        const width: number = textWidth(this.tooltipCard.levelsText[this.tooltipCard.levelsText.length - 1].length, 1) + 4;

        let yLevelsOffset: number = 0;
        topLeft.x = topLeft.x + 104;
        topLeft.y = this.tooltipPosition.y - height - 5;

        gl.colour(0XFFEEEEEE);
        drawTexture("solid", topLeft.x, topLeft.y, width, height);
        gl.colour(0xFF0E0803);
        drawTexture("solid", topLeft.x + 1, topLeft.y + 1, width - 2, height - 2);

        for (const level of this.tooltipCard.levelsText) {
          drawText(level, topLeft.x + 3, topLeft.y + 3 + yLevelsOffset);
          yLevelsOffset += 8;
        }
      }
    }
    //#endregion STORE CARD TOOLTIP
  }
}
