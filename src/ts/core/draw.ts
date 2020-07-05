import { FONT_CACHE, TEXTURE_CACHE, Texture } from "./texture.js";

import { gl } from "./gl.js";
import { SCREEN_WIDTH, SCREEN_HEIGHT } from "../game.js";

let solidTexture: Texture;
export function drawQuad( x: number, y: number, sx: number, sy: number ): void
{
  if ( !solidTexture )
  {
    solidTexture = TEXTURE_CACHE.get( "solid" );
  }
  if ( sx >= SCREEN_WIDTH / 2 )
  {
    sx += 1;
  }
  if ( sy >= SCREEN_HEIGHT / 2 )
  {
    sy += 1;
  }
  gl.draw( solidTexture.atlas, x, y, sx, sy, solidTexture.u0, solidTexture.v0, solidTexture.u1, solidTexture.v1 );
}

export function drawTexture( textureName: string, x: number, y: number, sx: number = 1, sy: number = 1 ): void
{
  const t: Texture = TEXTURE_CACHE.get( textureName );
  // @ifdef DEBUG
  if ( !t )
  {
    throw new Error( `No such texture as ${ textureName }` );
  }
  // @endif
  gl.draw( t.atlas, x, y, t.w, t.h, t.u0, t.v0, t.u1, t.v1, sx, sy );
}

export enum Align
{
  Left,
  Center,
  Right
}

export type TextParams = {
  font?: Font,
  colour?: number,
  textAlign?: Align,
  scale?: number,
  wrap?: number;
};

const textCache: Map<string, string[]> = new Map();
type Font = "bit" | "gb";
const fontSizes: Map<Font, number> = new Map( [ [ "bit", 6 ], [ "gb", 8 ] ] );

export function textWidth( characterCount: number, scale: number, font: Font = "bit" ): number
{
  return fontSizes.get( font ) * scale * characterCount;
}

export function textHeight( lineCount: number, scale: number, font: Font = "bit" ): number
{
  return ( fontSizes.get( font ) * scale + scale ) * lineCount;
}

export function parseText( text: string, params: TextParams = { font: "bit", colour: 0xFFFFFFFF, textAlign: Align.Left, scale: 1, wrap: 0 } ): number
{
  params.colour = params.colour || 0xFFFFFFFF;
  params.textAlign = params.textAlign || Align.Left;
  params.scale = params.scale || 1;
  params.wrap = params.wrap || 0;
  params.font = params.font || "bit";
  const letterSize: number = fontSizes.get( params.font ) * params.scale;
  const allWords: string[] = text.split( " " );

  let lines: string[] = [];
  if ( textCache.has( `${ text }_${ params.scale }_${ params.wrap }` ) )
  {
    lines = textCache.get( `${ text }_${ params.scale }_${ params.wrap }` );
  }

  if ( lines.length === 0 )
  {
    if ( params.wrap === 0 )
    {
      lines = [ allWords.join( " " ) ];
    } else
    {
      let line: string[] = [];
      for ( const word of allWords )
      {
        line.push( word );
        if ( line.join( " " ).length * letterSize >= params.wrap )
        {
          const lastWord: string = line.pop();
          lines.push( line.join( " " ) );
          line = [ lastWord ];
        }
      }
      if ( line.length > 0 )
      {
        lines.push( line.join( " " ) );
      }
    }
    textCache.set( `${ text }_${ params.scale }_${ params.wrap }`, lines );
  }
  return lines.length;
}

export function drawText( text: string, x: number, y: number, params: TextParams = { font: "bit", colour: 0xFFFFFFFF, textAlign: Align.Left, scale: 1, wrap: 0 } ): number
{
  params.colour = params.colour || 0xFFFFFFFF;
  params.textAlign = params.textAlign || Align.Left;
  params.scale = params.scale || 1;
  params.wrap = params.wrap || 0;
  params.font = params.font || "bit";
  const letterSize: number = fontSizes.get( params.font ) * params.scale;
  const font: Map<string, Texture> = FONT_CACHE.get( params.font );

  const orgx: number = x;
  let offx: number = 0;

  parseText( text, params );
  const lines: string[] = textCache.get( `${ text }_${ params.scale }_${ params.wrap }` );
  const yInc: number = letterSize + params.scale;

  gl.colour( params.colour );
  for ( const line of lines )
  {
    const words: string[] = line.split( " " );
    const lineLength: number = line.length * letterSize;

    let alignmentOffset: number = 0;
    if ( params.textAlign === Align.Center )
    {
      alignmentOffset = ~~( ( -lineLength + ( 1 * params.scale ) ) / 2 );
    } else if ( params.textAlign === Align.Right )
    {
      alignmentOffset = ~~-( lineLength - ( 1 * params.scale ) );
    }

    for ( const word of words )
    {
      for ( const letter of word.split( "" ) )
      {
        const t: Texture = font.get( letter );
        // @ifdef DEBUG
        if ( !t )
        {
          throw new Error( `No such texture as ${ letter }` );
        }
        // @endif
        x = orgx + offx + alignmentOffset;

        gl.draw( t.atlas, x, y, t.w, t.h, t.u0, t.v0, t.u1, t.v1, params.scale, params.scale );
        offx += letterSize;
      }
      offx += letterSize;
    }
    y += yInc;
    offx = 0;
  }
  gl.colour( 0xFFFFFFFF );
  return lines.length;
}
