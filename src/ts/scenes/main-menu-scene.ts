import { Align, drawText } from "../core/draw";

import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { Easing } from "../core/interpolation";
import { GameOverSceneName } from "./game-over-scene";
import { GameState } from "../game-state";
import { Scene } from "../core/scene";
import { SceneManager } from "../core/scene-manager";
import { TextNode } from "../scene-nodes/text-node";
import { V2 } from "../core/v2";
import { buttonMouseUp } from "../core/zzfx";
import { gl } from "../core/gl";

export const MainMenuSceneName: string = "MainMenu";
export class MainMenuScene extends Scene {
  private menuOffset: number;
  private title: TextNode;
  private newGame: ButtonNode;
  private settings: ButtonNode;
  constructor() {
    super();
    this.id = MainMenuSceneName;

    this.menuOffset = this.root.size.y / 2 - 50;
    const title: TextNode = new Builder(TextNode)
      .with("text", "beyond the rift")
      .with("textAlign", Align.Center)
      .with("scale", 4)
      .with("colour", 0xCC000000)
      .build();
    title.moveTo({ x: this.root.size.x / 2, y: this.menuOffset + 2 });
    this.root.add(title);

    this.title = new Builder(TextNode)
      .with("text", "beyond the rift")
      .with("textAlign", Align.Center)
      .with("scale", 4)
      .build();
    this.title.moveTo({ x: this.root.size.x / 2, y: this.menuOffset });
    this.root.add(this.title);
    this.menuOffset += 50;

    this.newGame = new Builder(ButtonNode)
      .with("text", "new game")
      .with("size", { x: 144, y: 30 })
      .with("colour", 0xFF55cc55)
      .with("onMouseUp", () => {
        buttonMouseUp();
        SceneManager.push("GameDifficulty");
      })
      .build();
    this.newGame.moveTo({ x: this.root.size.x / 2 - 72, y: this.menuOffset });
    this.root.add(this.newGame);
    this.menuOffset += 34;

    this.settings = new Builder(ButtonNode)
      .with("text", "settings")
      .with("size", { x: 144, y: 30 })
      .with("colour", 0xFFFF5555)
      .with("onMouseUp", () => {
        buttonMouseUp();
        GameState.gameOverReason = "oldOne";
        SceneManager.push(GameOverSceneName);
      })
      .build();
    this.settings.moveTo({ x: this.root.size.x / 2 - 72, y: this.menuOffset });
    // this.root.add(this.settings);
  }

  private toBlue: boolean = false;
  public transitionIn(): Promise<any> {
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

  public update(now: number, delta: number): void {
    if (this.backgroundAnimation === null) {
      if (this.toBlue) {
        this.changeBackground(0, 25, 55, 2500);
        this.toBlue = false;
      } else {
        this.changeBackground(67, 21, 174, 2500);
        this.toBlue = true;
      }
    }
    super.update(now, delta);
  }

  public draw(now: number, delta: number): void {
    const topLeft: V2 = this.root.topLeft;
    const size: V2 = this.root.size;
    drawText("a deck building game", topLeft.x + size.x / 2 + this.title.size.x / 2, topLeft.y + size.y / 2 - 20, { textAlign: Align.Right, scale: 2, colour: 0xCC000000 });
    drawText("a deck building game", topLeft.x + size.x / 2 + this.title.size.x / 2, topLeft.y + size.y / 2 - 22, { textAlign: Align.Right, scale: 2 });

    drawText("(c) 2020 david brad", topLeft.x + size.x, topLeft.y + size.y - 21, { textAlign: Align.Right });
    drawText("Card art icons made by Lorc, Delapouite, and other contributors", topLeft.x + size.x, topLeft.y + size.y - 14, { textAlign: Align.Right });
    drawText("Available on https://game-icons.net", topLeft.x + size.x, topLeft.y + size.y - 7, { textAlign: Align.Right });
    super.draw(now, delta);
  }
}
