import { Align, drawText, drawTexture } from "../core/draw";
import { buttonHover, buttonMouseDown, buttonMouseUp } from "../core/zzfx";

import { Interactive } from "../core/pointer";
import { SceneNode } from "./scene-node";
import { gl } from "../core/gl";

export class ButtonNode extends SceneNode implements Interactive
{
  public hover: boolean = false;
  public pressed: boolean = false;
  public onHover(): void
  {
    buttonHover();
  }
  public onBlur(): void { }
  public onMouseDown(): void
  {
    buttonMouseDown();
  }
  public onMouseUp(): void
  {
    buttonMouseUp();
  }
  public text: string = "";
  public textScale: number = 2;
  constructor(initializer: Partial<ButtonNode> = {})
  {
    super(initializer, "button_node");
    Object.assign(this, initializer);
  }
  public update(now: number, delta: number): void
  {
    super.update(now, delta);
  }

  public draw(now: number, delta: number): void
  {
    const textX: number = ~~(this.topLeft.x + this.size.x / 2);
    const textY: number = ~~(this.topLeft.y + this.size.y / 2 - (this.textScale * 3));
    if (!this.pressed)
    {
      if (!this.hover)
      {
        // Hover
        gl.colour(this.colour);
        drawTexture("solid", this.topLeft.x, this.topLeft.y, this.size.x, this.size.y);
        drawText(this.text, textX, textY + 1, { textAlign: Align.Center, colour: 0xCC000000, scale: this.textScale, font: "bit" });
        drawText(this.text, textX, textY, { textAlign: Align.Center, colour: 0xFFFFFFFF, scale: this.textScale, font: "bit" });
        gl.colour(0xBB000000);
        drawTexture("solid", this.topLeft.x, this.topLeft.y + this.size.y - 2, this.size.x, 2);
      } else
      {
        // Neutral
        gl.colour(this.colour);
        drawTexture("solid", this.topLeft.x, this.topLeft.y + 1, this.size.x, this.size.y - 1);
        drawText(this.text, textX, textY + 2, { textAlign: Align.Center, colour: 0xCC000000, scale: this.textScale, font: "bit" });
        drawText(this.text, textX, textY + 1, { textAlign: Align.Center, colour: 0xFFFFFFFF, scale: this.textScale, font: "bit" });
        gl.colour(0xBB000000);
        drawTexture("solid", this.topLeft.x, this.topLeft.y + this.size.y - 1, this.size.x, 1);
      }
    } else if (this.pressed)
    {
      // Presses
      gl.colour(this.colour);
      drawTexture("solid", this.topLeft.x, this.topLeft.y + 2, this.size.x, this.size.y - 2);
      drawText(this.text, textX, textY + 3, { textAlign: Align.Center, colour: 0xCC000000, scale: this.textScale, font: "bit" });
      drawText(this.text, textX, textY + 2, { textAlign: Align.Center, colour: 0xFFFFFFFF, scale: this.textScale, font: "bit" });
    }

    super.draw(now, delta);
  }
}
