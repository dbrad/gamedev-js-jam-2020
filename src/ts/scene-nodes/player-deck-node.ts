import { Align, drawText, drawTexture } from "../core/draw";

import { GameState } from "../game-state";
import { SceneNode } from "./scene-node";

export class PlayerDeckNode extends SceneNode {
  constructor(initializer: Partial<PlayerDeckNode> = {}) {
    super(initializer, "player_deck");
    Object.assign(this, initializer);
    this.size = { x: 32, y: 48 };
  }

  public draw(now: number, delta: number): void {
    super.draw(now, delta);
    drawTexture("card_back", this.topLeft.x, this.topLeft.y);
    drawText("deck", this.topLeft.x + 16, this.topLeft.y + 3, { textAlign: Align.Center });

    drawText(`${GameState.playerDeck.length}`.padStart(2, "0"), this.topLeft.x + 16, this.topLeft.y + this.size.y - 12, { textAlign: Align.Center, colour: 0x88FFFFFF });
  }
}
