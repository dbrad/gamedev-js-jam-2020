import { Align, drawText } from "../core/draw";

import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { Easing } from "../core/interpolation";
import { Scene } from "../core/scene";
import { SceneManager } from "../core/scene-manager";
import { V2 } from "../core/v2";
import { buttonMouseUp } from "../core/zzfx";
import { gl } from "../core/gl";

export const HelpSceneName: string = "Help";
export class HelpScene extends Scene {
  private backButton: ButtonNode;
  private helpText: string[] = [];
  constructor() {
    super();
    this.id = HelpSceneName;
    this.helpText = [
      "player effects",
      "attack:     deal damage to a creature from the rift",
      "disrupt:    reduce the stability of the rift",
      "gain:       gain funds to spend in the hq this turn",
      "draw:       draw cards from your deck",
      "destroy:    <permanently> remove a card from you hand and deck",
      "recall:     send the right most creature back into the rift",
      "stitch:     apply a psychic stitch to the rift",
      "old one:    ???",
      "",
      "shared effects",
      "discard:    discard cards from your hand to the discard pile",
      "spawn:      draw another creature from the rift deck",
      "stabilize:  increase the stability of the rift",
      "",
      "rift effects",
      "wound:      add an unplayable wound card to the player's discard pile",
      "regenerate: the creature regains lost health",
      "summon:     summon a creature from beyond the rift",
    ];

    this.backButton = new Builder(ButtonNode)
      .with("text", "back")
      .with("size", { x: 80, y: 20 })
      .with("colour", 0xFF55cc55)
      .with("onMouseUp", () => {
        buttonMouseUp();
        SceneManager.pop();
      })
      .build();
    this.backButton.moveTo({ x: this.root.size.x / 2 - 40, y: this.root.size.y - 23 });
    this.root.add(this.backButton);
  }
  public transitionIn(): Promise<any> {
    this.backgroundColour = gl.getBackground();
    this.changeBackground(15, 15, 15, 500);

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

  public draw(now: number, delta: number): void {
    const topLeft: V2 = this.root.topLeft;
    const size: V2 = this.root.size;
    let yOffset: number = 23;
    drawText("help", topLeft.x + size.x / 2, topLeft.y + 3, { scale: 3, textAlign: Align.Center });

    for (const text of this.helpText) {
      drawText(text, topLeft.x + 5, topLeft.y + yOffset, { colour: 0xFFEEEEEE });
      yOffset += 9;
    }
    yOffset += 10;
    drawText("objective info", topLeft.x + size.x / 2, topLeft.y + yOffset, { scale: 2, textAlign: Align.Center });
    yOffset += 15;
    drawText("- defeat all of the creatures that come to our world", topLeft.x, topLeft.y + yOffset, { textAlign: Align.Left });
    yOffset += 10;
    drawText("- or find a another way to end the enslaught...", topLeft.x, topLeft.y + yOffset, { textAlign: Align.Left });
    yOffset += 10;
    drawText("- if the rift stabilizes, all remaining creature inside the rift will emerge", topLeft.x, topLeft.y + yOffset, { textAlign: Align.Left });
    yOffset += 10;
    drawText("- if 10 creatures are already active, and more emerge from the portal, we will be overrun", topLeft.x, topLeft.y + yOffset, { textAlign: Align.Left, wrap: 400 });

    super.draw(now, delta);
  }
}
