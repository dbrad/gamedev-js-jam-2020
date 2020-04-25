import { Align, drawText, drawTexture, textHeight } from "../core/draw";

import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { Easing } from "../core/interpolation";
import { GameState } from "../game-state";
import { PlayerCard } from "../player-cards";
import { PlayerDiscardCardNode } from "../scene-nodes/player-discard-card-node";
import { Scene } from "../core/scene";
import { SceneManager } from "../core/scene-manager";
import { V2 } from "../core/v2";
import { buttonMouseUp } from "../core/zzfx";
import { drawPlayerCard } from "../common";
import { gl } from "../core/gl";
import { on } from "../core/events";

export const DiscardPileSceneName: string = "DiscardPile";
export class DiscardPileScene extends Scene {
  private backButton: ButtonNode;
  private currentPage: number = 0;
  private maxPages: number = 0;
  private data: PlayerCard[] = [];
  public tooltipCard: PlayerCard = null;
  public tooltipPosition: V2 = { x: 0, y: 0 };
  constructor() {
    super();
    this.id = DiscardPileSceneName;

    this.backButton = new Builder(ButtonNode)
      .with("text", "back")
      .with("size", { x: 100, y: 30 })
      .with("colour", 0xFF55cc55)
      .with("onMouseUp", () => {
        buttonMouseUp();
        SceneManager.pop();
      })
      .build();
    this.backButton.moveTo({ x: this.root.size.x / 2 - 50, y: this.root.size.y - 33 });
    this.root.add(this.backButton);

    for (let i: number = 0; i < 52; i++) {
      const card: PlayerDiscardCardNode = new Builder(PlayerDiscardCardNode).build();
      this.root.add(card);
    }
    on("discard_card_tooltip", (card: PlayerCard, position: V2) => {
      this.tooltipCard = card;
      this.tooltipPosition = position;
    });
  }

  public transitionIn(): Promise<any> {
    if (GameState.discardPileMode === "store") {
      this.data = [...GameState.storeDiscard].reverse();
    } else {
      this.data = [...GameState.playerDiscardPile].reverse();
    }
    this.currentPage = 0;
    this.maxPages = Math.ceil(this.data.length / 15);

    this.backgroundColour = gl.getBackground();
    this.changeBackground(0, 25, 55, 500);

    return this.root.moveBy({ x: 0, y: -this.root.size.y }).then(() => {
      return this.root.moveTo({ x: 0, y: 0 }, 500, Easing.easeOutQuad).then(() => {
        return super.transitionIn();
      });
    });
  }
  public transitionOut(): Promise<any> {
    this.changeBackground(0, 87, 132, 500);
    super.transitionOut();
    return this.root.moveTo({ x: 0, y: -this.root.size.y }, 500, Easing.easeOutQuad);
  }

  public cards(): PlayerDiscardCardNode[] {
    const result: PlayerDiscardCardNode[] = [];
    for (const [id, node] of this.root.nodes) {
      if (node instanceof PlayerDiscardCardNode) {
        result.push(node);
      }
    }
    return result;
  }

  public update(now: number, delta: number): void {
    const xOffset: number = 36;
    const yOffset: number = 4;
    const numberOfRows: number = Math.ceil((this.data.length - (this.currentPage * 52)) / 15);
    const cards: PlayerDiscardCardNode[] = this.cards();
    let card: PlayerCard = null;
    let index: number = -1;

    for (let y: number = 0, ylen: number = Math.min(4, numberOfRows); y < ylen; y++) {
      const rowCards: number = this.data.length - (this.currentPage * 52) - (y * 13);
      for (let x: number = 0, xlen: number = Math.min(13, rowCards); x < xlen; x++) {
        index = (this.currentPage * 52) + (y * 13) + x;
        card = this.data[index];
        cards[index].card = card;
        cards[index].visible = true;
        cards[index].moveTo({ x: this.root.topLeft.x + x * 34 + xOffset, y: this.root.topLeft.y + y * 52 + yOffset });
      }
    }
    for (let i: number = index + 1, len: number = cards.length; i < len; i++) {
      cards[i].visible = false;
    }
    super.update(now, delta);
  }

  public draw(now: number, delta: number): void {
    drawText("discard pile", this.root.topLeft.x + this.root.size.x / 2, this.root.topLeft.y + this.root.size.y / 2 - 8, { scale: 3, colour: 0x99DDDDDD, textAlign: Align.Center });
    if (this.tooltipCard) {
      // HOVER TOOLTIP
      const topLeft: V2 = { x: this.tooltipPosition.x - 34, y: this.tooltipPosition.y + 50 };
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
    super.draw(now, delta);
  }
}
