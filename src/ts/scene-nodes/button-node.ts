import { Align, drawText, drawTexture } from "../core/draw";

import { Interactive } from "../core/pointer";
import { SceneNode } from "./scene-node";
import { gl } from "../core/gl";

export class ButtonNode extends SceneNode implements Interactive {
  public hover: boolean = false;
  public pressed: boolean = false;
  public onHover(): void { }
  public onBlur(): void { }
  public onMouseDown(): void { }
  public onMouseUp(): void { }
  public text: string = "";

  constructor(initializer: Partial<ButtonNode> = {}) {
    super(initializer, "button_node");
    Object.assign(this, initializer);
  }
  public update(now: number, delta: number): void {
    super.update(now, delta);
  }

  public draw(now: number, delta: number): void {
    const textX: number = this.topLeft.x + this.size.x / 2;
    const textY: number = ~~(this.topLeft.y + this.size.y / 2 - 6);
    if (!this.pressed) {
      if (!this.hover) {
        gl.colour(this.colour);
        drawTexture("solid", this.topLeft.x, this.topLeft.y, this.size.x, this.size.y);
        drawText(this.text, textX, textY + 1, { textAlign: Align.Center, colour: 0xCC000000, scale: 2 });
        drawText(this.text, textX, textY, { textAlign: Align.Center, colour: 0xFFFFFFFF, scale: 2 });
        gl.colour(0xBB000000);
        drawTexture("solid", this.topLeft.x, this.topLeft.y + this.size.y - 2, this.size.x, 2);
      } else {
        gl.colour(this.colour);
        drawTexture("solid", this.topLeft.x, this.topLeft.y + 1, this.size.x, this.size.y - 1);
        drawText(this.text, textX, textY + 2, { textAlign: Align.Center, colour: 0xCC000000, scale: 2 });
        drawText(this.text, textX, textY + 1, { textAlign: Align.Center, colour: 0xFFFFFFFF, scale: 2 });
        gl.colour(0xBB000000);
        drawTexture("solid", this.topLeft.x, this.topLeft.y + this.size.y - 1, this.size.x, 1);
      }
    } else if (this.pressed) {
      gl.colour(this.colour);
      drawTexture("solid", this.topLeft.x, this.topLeft.y + 2, this.size.x, this.size.y - 2);
      drawText(this.text, textX, textY + 3, { textAlign: Align.Center, colour: 0xCC000000, scale: 2 });
      drawText(this.text, textX, textY + 2, { textAlign: Align.Center, colour: 0xFFFFFFFF, scale: 2 });
    }

    super.draw(now, delta);
  }
}