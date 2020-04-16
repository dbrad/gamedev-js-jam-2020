import { Align, drawText, parseText, textHeight, textWidth } from "../core/draw";

import { SceneNode } from "./scene-node";

export class TextNode extends SceneNode {
  private _text: string = "";
  private _wordWrapWidth: number = 0;
  private _scale: number = 1;
  private _textAlign: Align = Align.Left;
  constructor(initializer: Partial<TextNode> = {}) {
    super(initializer, "text_node");
    Object.assign(this, initializer);
    this.recalculateSize();
  }

  private recalculateSize(): void {
    const lineCount: number = parseText(
      this.text,
      {
        colour: this.colour,
        textAlign: this.textAlign,
        scale: this.scale,
        wrap: this.wordWrapWidth
      });
    this.size.x = this.wordWrapWidth === 0 ? textWidth(this.text.split("").length, this.scale) : this.wordWrapWidth;
    this.size.y = textHeight(lineCount, this.scale);
  }

  public get text(): string {
    return this._text;
  }

  public set text(value: string) {
    this._text = value;
    this.recalculateSize();
  }

  public get wordWrapWidth(): number {
    return this._wordWrapWidth;
  }

  public set wordWrapWidth(value: number) {
    this._wordWrapWidth = value;
    this.recalculateSize();
  }

  public get scale(): number {
    return this._scale;
  }

  public set scale(value: number) {
    this._scale = value;
    this.recalculateSize();
  }

  public get textAlign(): Align {
    return this._textAlign;
  }

  public set textAlign(value: Align) {
    this._textAlign = value;
    switch (value) {
      case Align.Center:
        this.anchor = { x: 0.5, y: 0 };
        break;
      case Align.Right:
        this.anchor = { x: 1, y: 0 };
        break;
      case Align.Left:
      default:
        this.anchor = { x: 0, y: 0 };
    }
  }

  public draw(now: number, delta: number): void {
    if (this.visible && this.enabled) {
      drawText(
        this.text,
        this.absoluteOrigin.x,
        this.absoluteOrigin.y,
        {
          colour: this.colour,
          textAlign: this.textAlign,
          scale: this.scale,
          wrap: this.wordWrapWidth
        });
      super.draw(now, delta);
    }
  }
}
