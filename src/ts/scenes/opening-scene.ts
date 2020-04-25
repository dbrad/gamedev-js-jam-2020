import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { Easing } from "../core/interpolation";
import { MainMenuSceneName } from "./main-menu-scene";
import { Scene } from "../core/scene";
import { SceneManager } from "../core/scene-manager";
import { TextNode } from "../scene-nodes/text-node";
import { buttonMouseUp } from "../core/zzfx";
import { gl } from "../core/gl";

export const OpeningSceneName: string = "Opening";
export class OpeningScene extends Scene {

  private text01: TextNode;
  private text02: TextNode;
  private text03: TextNode;
  private text04: TextNode;

  private skipButton: ButtonNode;
  constructor() {
    super();
    this.id = OpeningSceneName;

    let yOffset: number = 5;
    this.text01 =
      new Builder(TextNode)
        .with("text", "year: 20XX")
        .with("colour", 0x00EEEEEE)
        .with("scale", 2)
        .build();
    this.text01.moveTo({ x: 5, y: yOffset });
    this.root.add(this.text01);
    yOffset += 14 * 2;

    this.text02 =
      new Builder(TextNode)
        .with("text", "humanity had managed to create a small tear in space-time utilizing control bursts of anti-matter.")
        .with("colour", 0x00EEEEEE)
        .with("wordWrapWidth", 500)
        .with("scale", 2)
        .build();
    this.text02.moveTo({ x: 5, y: yOffset });
    this.root.add(this.text02);
    yOffset += 14 * 4;

    this.text03 =
      new Builder(TextNode)
        .with("text", "this 'rift' in space-time would potentially allow humans to travel vast distances in an instant, as well as to far off unknown futures.")
        .with("colour", 0x00EEEEEE)
        .with("wordWrapWidth", 500)
        .with("scale", 2)
        .build();
    this.text03.moveTo({ x: 5, y: yOffset });
    this.root.add(this.text03);
    yOffset += 14 * 5;

    this.text04 =
      new Builder(TextNode)
        .with("text", "unfortunately they did not consider that the rift was also a doorway into their own world, until it was too late and monsterous sounds began to be heard from within the rift...")
        .with("colour", 0x00EEEEEE)
        .with("wordWrapWidth", 500)
        .with("scale", 2)
        .build();
    this.text04.moveTo({ x: 5, y: yOffset });
    this.root.add(this.text04);

    this.skipButton =
      new Builder(ButtonNode)
        .with("size", { x: 80, y: 20 })
        .with("colour", 0x000F0F0F)
        .with("text", "skip")
        .with("onMouseUp", () => {
          buttonMouseUp();
          SceneManager.push(MainMenuSceneName);
        })
        .build();
    this.skipButton.moveTo({ x: this.root.size.x - 80, y: this.root.size.y - 18 });
    this.root.add(this.skipButton);
  }
  public transitionIn(): Promise<any> {
    this.backgroundColour = gl.getBackground();
    this.changeBackground(15, 15, 15, 250);
    this.text01.fade(0xFF, 2000);
    return this.root.moveBy({ x: 0, y: this.root.size.y }).then(() => {
      return this.root.moveTo({ x: 0, y: 0 }, 2000, Easing.easeOutQuad).then(() => {
        super.transitionIn();
        return this.text02.fade(0xFF, 3000, Easing.easeOutQuad).then(() => {
          return this.text03.fade(0xFF, 3000, Easing.easeOutQuad).then(() => {
            return this.text04.fade(0xFF, 3000, Easing.easeOutQuad).then(() => {
              return this.text01.fade(0x00, 4000).then(() => {
                return this.text02.fade(0x00, 2000).then(() => {
                  return this.text03.fade(0x00, 2000).then(() => {
                    return this.text04.fade(0x00, 3000).then(() => {
                      SceneManager.push(MainMenuSceneName);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }
  public transitionOut(): Promise<any> {
    this.changeBackground(0, 87, 132, 500);
    super.transitionOut();
    return this.root.moveTo({ x: 0, y: this.root.size.y }, 500, Easing.easeOutQuad);
  }

  public draw(now: number, delta: number): void {

    super.draw(now, delta);
  }
}
