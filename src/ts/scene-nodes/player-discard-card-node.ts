import { Interactive } from "../core/pointer";
import { PlayerCard } from "../player-cards";
import { SceneNode } from "./scene-node";
import { drawPlayerCard } from "../common";
import { drawTexture, drawQuad } from "../core/draw";
import { emit } from "../core/events";
import { gl } from "../core/gl";

export class PlayerDiscardCardNode extends SceneNode implements Interactive
{
  public hover: boolean;
  public pressed: boolean;
  public onHover( mouseDown: boolean ): void { }
  public onBlur(): void
  {
    emit( "discard_card_tooltip", null, { x: 0, y: 0 } );
  }
  public onMouseDown(): void { }
  public onMouseUp(): void { }
  public card: PlayerCard;

  constructor( initializer: Partial<PlayerDiscardCardNode> = {} )
  {
    super( initializer, "discard_card" );
    Object.assign( this, initializer );
    this.size = { x: 32, y: 48 };
  }
  public update( now: number, delta: number ): void
  {
    if ( this.hover && this.card )
    {
      emit( "discard_card_tooltip", this.card, this.topLeft );
    }
    super.update( now, delta );
  }
  public draw( now: number, delta: number ): void
  {
    if ( this.visible )
    {
      if ( this.card && this.hover )
      {
        gl.colour( 0xFFEEEEEE );
        drawQuad( this.topLeft.x - 1, this.topLeft.y - 1, this.size.x + 2, this.size.y + 2 );
        gl.colour( 0xFFFFFFFF );
      }
      drawPlayerCard( this.card, this.topLeft, this.size );
      super.draw( now, delta );
    }
  }
}
