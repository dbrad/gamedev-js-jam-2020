import { Align, drawText, drawTexture, drawQuad } from "../core/draw";
import { Easing, Interpolator } from "../core/interpolation";
import { cardFwip, zzfx } from "../core/zzfx";

import { DiscardPileSceneName } from "../scenes/discard-pile-scene";
import { GameState } from "../game-state";
import { Interactive } from "../core/pointer";
import { PlayerCard } from "../player-cards";
import { SceneManager } from "../core/scene-manager";
import { SceneNode } from "./scene-node";
import { V2 } from "../core/v2";
import { drawPlayerCard } from "../common";
import { gl } from "../core/gl";
import { on } from "../core/events";

type DiscardAnim = { position: V2, fn: ( now: number ) => boolean; };
export const toBeDiscarded: [ PlayerCard, DiscardAnim ][] = [];
export class PlayerDiscardPileNode extends SceneNode implements Interactive
{
  constructor( initializer: Partial<PlayerDiscardPileNode> = {} )
  {
    super( initializer, "player_discard_pile" );
    Object.assign( this, initializer );
    this.size = { x: 32, y: 48 };
    on( "card_discarded", ( card: PlayerCard ) =>
    {
      const position: V2 = { x: 0, y: -40 };
      const origin: V2 = V2.copy( position );

      const interp: Iterator<number, number, number> = Interpolator( 125 / ( toBeDiscarded.length + 1 ), Easing.easeOutQuad );
      const fn: ( now: number ) => boolean =
        ( now: number ): boolean =>
        {
          const i: IteratorResult<number> = interp.next( now );
          position.x = origin.x + Math.round( ( 0 - origin.x ) * i.value );
          position.y = origin.y + Math.round( ( 0 - origin.y ) * i.value );
          if ( i.done )
          {
            position.x = 0;
            position.y = 0;
            GameState.playerDiscardPile.push( card );
            toBeDiscarded.shift();
            cardFwip();
          }
          return i.done;
        };
      const anim: DiscardAnim = { position, fn };
      toBeDiscarded.push( [ card, anim ] );
    } );
  }
  public hover: boolean;
  public pressed: boolean;
  public onHover( mouseDown: boolean ): void { }
  public onBlur(): void { }
  public onMouseDown(): void { }
  public onMouseUp(): void
  {
    GameState.discardPileMode = "player";
    SceneManager.push( DiscardPileSceneName );
  }

  public update( now: number, delta: number ): void
  {
    if ( toBeDiscarded.length > 0 )
    {
      toBeDiscarded[ 0 ][ 1 ].fn( now );
    }
    super.update( now, delta );
  }

  public draw( now: number, delta: number ): void
  {
    gl.colour( 0x66FFFFFF );
    drawTexture( "card_empty_space", this.topLeft.x, this.topLeft.y );
    gl.colour( 0xFFFFFFFF );
    super.draw( now, delta );

    // Top card of the discard pile
    if ( GameState.playerDiscardPile.length > 0 )
    {
      const lastCard: PlayerCard = GameState.playerDiscardPile[ GameState.playerDiscardPile.length - 1 ];
      drawPlayerCard( lastCard, this.topLeft, this.size );
      gl.colour( 0x99111111 );
      drawQuad( this.topLeft.x, this.topLeft.y, 32, 48 );
      gl.colour( 0xFFFFFFFF );
    }

    // Card being discarded via animation
    if ( toBeDiscarded.length > 0 )
    {
      const card: PlayerCard = toBeDiscarded[ 0 ][ 0 ];
      const pos: V2 = toBeDiscarded[ 0 ][ 1 ].position;
      drawPlayerCard( card, V2.add( this.topLeft, pos ), this.size );
      gl.colour( 0x99111111 );
      drawQuad( this.topLeft.x + pos.x, this.topLeft.y + pos.y, 32, 48 );
      gl.colour( 0xFFFFFFFF );
    }
    drawText( `${ GameState.playerDiscardPile.length }`.padStart( 2, "0" ), this.topLeft.x + 16, this.topLeft.y + this.size.y - 12, { textAlign: Align.Center, colour: 0xFFFFFFFF, font: "gb" } );
  }
}
