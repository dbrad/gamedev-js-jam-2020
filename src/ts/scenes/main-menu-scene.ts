import { Align } from "../core/draw";
import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { Easing } from "../core/interpolation";
import { Scene } from "../core/scene";
import { SceneManager } from "../core/scene-manager";
import { TextNode } from "../scene-nodes/text-node";

export const MainMenuSceneName: string = "MainMenu";
export class MainMenuScene extends Scene {
  private menuOffset: number;
  private title: TextNode;
  private newGame: ButtonNode;
  private settings: ButtonNode;
  constructor() {
    super();
    this.id = MainMenuSceneName;

    this.menuOffset = this.root.size.y / 2 - 40;
    const title: TextNode = new Builder(TextNode)
      .with("text", "main menu")
      .with("textAlign", Align.Center)
      .with("scale", 3)
      .with("colour", 0xCC000000)
      .build();
    title.moveTo({ x: this.root.size.x / 2, y: this.menuOffset + 2 });
    this.root.add(title);

    this.title = new Builder(TextNode)
      .with("text", "main menu")
      .with("textAlign", Align.Center)
      .with("scale", 3)
      .build();
    this.title.moveTo({ x: this.root.size.x / 2, y: this.menuOffset });
    this.root.add(this.title);
    this.menuOffset += 37;

    this.newGame = new Builder(ButtonNode)
      .with("text", "new game")
      .with("size", { x: 144, y: 30 })
      .with("colour", 0xFF55cc55)
      .with("onMouseUp", () => {
        SceneManager.push("GameDifficulty");
      })
      .build();
    this.newGame.moveTo({ x: -this.root.size.x / 2, y: this.menuOffset });
    this.root.add(this.newGame);
    this.menuOffset += 34;

    this.settings = new Builder(ButtonNode)
      .with("text", "settings")
      .with("size", { x: 144, y: 30 })
      .with("colour", 0xFFFF5555)
      .build();
    this.settings.moveTo({ x: this.root.size.x / 2 - 72, y: this.root.size.y * 2 });
    this.root.add(this.settings);
  }
  public transitionIn(): Promise<any> {
    this.changeBackground(0, 35, 65, 500);
    return this.root.moveBy({ x: 0, y: -this.root.size.y }).then(() => {
      return this.root.moveTo({ x: 0, y: 0 }, 500, Easing.easeOutQuad).then(() => {
        return Promise.all([
          this.newGame.moveTo({ x: this.root.size.x / 2 - 72, y: this.newGame.relativeOrigin.y }, 500, Easing.easeOutQuad),
          this.settings.moveTo({ x: this.settings.relativeOrigin.x, y: this.menuOffset }, 500, Easing.easeOutQuad),
          super.transitionIn()
        ]);
      });
    });
  }
  public transitionOut(): Promise<any> {
    super.transitionOut();
    return this.root.moveTo({ x: 0, y: -this.root.size.y }, 500, Easing.easeOutQuad);
  }
}
