import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { Easing } from "../core/interpolation";
import { MainMenuSceneName } from "./main-menu-scene";
import { Scene } from "../core/scene";
import { SceneManager } from "../core/scene-manager";
import { gl } from "../core/gl";

export const GameOverSceneName: string = "GameOver";
export class GameOverScene extends Scene {
  private backButton: ButtonNode;
  constructor() {
    super();
    this.id = GameOverSceneName;

    this.backButton = new Builder(ButtonNode)
      .with("text", "back to menu")
      .with("size", { x: 144, y: 30 })
      .with("colour", 0xFFFF5555)
      .with("onMouseUp", () => {
        SceneManager.popTo(MainMenuSceneName);
      })
      .build();
    this.backButton.moveTo({ x: this.root.size.x / 2 - 72 , y: this.root.size.y / 2 });
    this.root.add(this.backButton);
  }
  public transitionIn(): Promise<any> {
    this.backgroundColour = gl.getBackground();
    this.changeBackground(10, 10, 10, 500);
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
}
