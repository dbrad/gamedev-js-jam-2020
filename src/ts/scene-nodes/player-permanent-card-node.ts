import { drawText, drawTexture, drawQuad } from "../core/draw";

import { GameState } from "../game-state";
import { Interactive } from "../core/pointer";
import { PlayerCard } from "../player-cards";
import { SceneNode } from "./scene-node";
import { drawPlayerCard } from "../common";
import { emit } from "../core/events";
import { gl } from "../core/gl";

export class PlayerPermanentCardNode extends SceneNode implements Interactive
{
  public hover: boolean;
  public pressed: boolean;
  public onHover( mouseDown: boolean ): void { }
  public onBlur(): void
  {
    emit( "permanent_card_tooltip", null, { x: 0, y: 0 } );
  }
  public onMouseDown(): void { }
  public onMouseUp(): void { }
  public card: PlayerCard;

  constructor( initializer: Partial<PlayerPermanentCardNode> = {} )
  {
    super( initializer, "permanent_card" );
    Object.assign( this, initializer );
    this.size = { x: 32, y: 48 };
  }
  public update( now: number, delta: number ): void
  {
    if ( this.hover && this.card )
    {
      emit( "permanent_card_tooltip", this.card, this.topLeft );
    }
    if ( this.card
      && GameState.playerPermanentPlaying === this.card
      && !this.movementAnimation )
    {
      this.moveBy( { x: 0, y: -10 }, 66 ).then( () =>
      {
        this.card.effects.map( fn => fn( null ) );
        return this.moveBy( { x: 0, y: 10 }, 66 ).then( () =>
        {
          GameState.playerPermanentPlaying = null;
        } );
      } );
    }
    super.update( now, delta );
  }
  public draw( now: number, delta: number ): void
  {
    if ( this.card && ( this.hover || GameState.playerPermanentPlaying === this.card ) )
    {
      gl.colour( 0xFFEEEEEE );
      drawQuad( this.topLeft.x - 1, this.topLeft.y - 1, this.size.x + 2, this.size.y + 2 );
      gl.colour( 0xFFFFFFFF );
    }
    drawPlayerCard( this.card, this.topLeft, this.size );
    super.draw( now, delta );
  }
}
