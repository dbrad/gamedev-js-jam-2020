import { drawText, drawTexture } from "../core/draw";

import { GameState } from "../game-state";
import { Interactive } from "../core/pointer";
import { SceneNode } from "./scene-node";
import { V2 } from "../core/v2";
import { gl } from "../core/gl";

export class DeckSelectorNode extends SceneNode implements Interactive {
  public deckId: "occult" | "psy" | "tech";
  public label: string = "";
  public deckLimit: number = 1;
  private selected: boolean = false;
  private markerSize: number = 0;
  public hover: boolean;
  public pressed: boolean;
  public onHover(mouseDown: boolean): void { }
  public onBlur(): void { }
  public onMouseDown(): void { }
  public onMouseUp(): void {
    const index: number = GameState.decksPicked.indexOf(this.deckId);
    if (index === -1) {
      if (GameState.decksPicked.length >= this.deckLimit) {
        GameState.decksPicked.shift();
      }
      GameState.decksPicked.push(this.deckId);
    } else {
      GameState.decksPicked.splice(index, 1);
    }
  }

  constructor(initializer: Partial<DeckSelectorNode> = {}) {
    super(initializer, "deck_selector_node");
    Object.assign(this, initializer);
    this.markerSize = ~~(this.size.y / 2);
  }

  public update(now: number, delta: number): void {
    const index: number = GameState.decksPicked.indexOf(this.deckId);
    if (index === -1) {
      this.selected = false;
    } else {
      this.selected = true;
    }
    super.update(now, delta);
  }

  public draw(now: number, delta: number): void {
    const topleft: V2 = this.topLeft;
    const size: V2 = this.size;

    gl.colour(0xFFFFFFFF);
    drawTexture("solid", topleft.x, topleft.y, size.x, size.y);
    gl.colour(this.colour);
    drawTexture("solid", topleft.x + 1, topleft.y + 1, size.x - 2, size.y - 2);
    gl.colour(0xFFFFFFFF);
    drawTexture("solid", topleft.x + ~~(this.markerSize / 2), topleft.y + ~~(this.markerSize / 2), this.markerSize, this.markerSize);
    drawText(this.label, topleft.x + this.markerSize * 2, topleft.y + size.y / 2 - 4, { scale: 2 , colour: 0xCC000000});
    drawText(this.label, topleft.x + this.markerSize * 2, topleft.y + size.y / 2 - 5, { scale: 2 });
    if (this.selected) {
      gl.colour(0xFF202020);
      drawTexture("solid", topleft.x + ~~(this.markerSize / 2) + 3, topleft.y + ~~(this.markerSize / 2) + 3, this.markerSize - 6, this.markerSize - 6);
    } else if (this.hover) {
      gl.colour(0xFFAAAAAA);
      drawTexture("solid", topleft.x + ~~(this.markerSize / 2) + 3, topleft.y + ~~(this.markerSize / 2) + 3, this.markerSize - 6, this.markerSize - 6);
    }
    super.draw(now, delta);
  }
}
