import { Align, drawText } from "../core/draw";

import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { Easing } from "../core/interpolation";
import { GameState } from "../game-state";
import { MainMenuSceneName } from "./main-menu-scene";
import { Scene } from "../core/scene";
import { SceneManager } from "../core/scene-manager";
import { V2 } from "../core/v2";
import { buttonMouseUp } from "../core/zzfx";
import { gl } from "../core/gl";

export const GameOverSceneName: string = "GameOver";
export class GameOverScene extends Scene {
  private backButton: ButtonNode;
  private gameOverTitle: string = "";
  private titleColour: number = 0xFFFFFFFF;
  private gameOverText: string = "";
  constructor() {
    super();
    this.id = GameOverSceneName;

    this.backButton = new Builder(ButtonNode)
      .with("text", "back to menu")
      .with("size", { x: 160, y: 30 })
      .with("colour", 0xFF2222AA)
      .with("onMouseUp", () => {
        buttonMouseUp();
        SceneManager.popTo(MainMenuSceneName);
      })
      .build();
    this.backButton.moveTo({ x: this.root.size.x / 2 - 80, y: this.root.size.y - 40 });
    this.root.add(this.backButton);
  }
  public transitionIn(): Promise<any> {
    this.backgroundColour = gl.getBackground();
    this.changeBackground(10, 10, 10, 500);
    switch (GameState.gameOverReason) {
      case "overrun":
        this.titleColour = 0xFF6666FF;
        this.gameOverTitle = "overrun...";
        this.gameOverText = "your defense was broken by the constant outpouring of unspeakable creatures from the rift. it appears humanity was not ready for this step forward...";
        break;
      case "clear":
        this.titleColour = 0xFF66FF66;
        this.gameOverTitle = "defense successful!";
        this.gameOverText = "your defensive line withstood the onslaught that emerged from the rift. it's only a matter of time before it opens its maw again...";
        break;
      case "oldOne":
        this.titleColour = 0xFF22A6F5;
        this.gameOverTitle = "help from beyond...";
        this.gameOverText = "your plea for help was answered by... something... this debt will surely be collected somehow one day...";
        break;
      case "stitch":
        this.titleColour = 0xFFE00DBD;
        this.gameOverTitle = "rift temporarily close";
        this.gameOverText = "as the final psychic stitch comes into place, humanity's defenders have earned themselves a reprieve... how long will these hold this time...";
        break;
      case "none":
      default:
    }
    return this.root.moveBy({ x: 0, y: -this.root.size.y }).then(() => {
      return this.root.moveTo({ x: 0, y: 0 }, 500, Easing.easeOutQuad).then(() => {
        return super.transitionIn();
      });
    });
  }
  public transitionOut(): Promise<any> {
    super.transitionOut();
    return this.root.moveTo({ x: 0, y: -this.root.size.y }, 500, Easing.easeOutQuad);
  }

  public draw(now: number, delta: number): void {
    const topLeft: V2 = this.root.topLeft;
    drawText(this.gameOverTitle, topLeft.x + this.root.size.x / 2, topLeft.y + 20, { textAlign: Align.Center, scale: 3, colour: this.titleColour });
    drawText(this.gameOverText, topLeft.x + this.root.size.x / 2, topLeft.y + 50, { textAlign: Align.Center, scale: 2, wrap: 500 });
    super.draw(now, delta);
  }
}
