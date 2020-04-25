import { Easing } from "../core/interpolation";
import { Scene } from "../core/scene";
import { gl } from "../core/gl";

export const OpeningSceneName: string = "Opening";
export class OpeningScene extends Scene {
  constructor() {
    super();
    this.id = OpeningSceneName;
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

    super.draw(now, delta);
  }
}
