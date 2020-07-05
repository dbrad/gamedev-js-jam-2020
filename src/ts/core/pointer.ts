import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../game";

import { V2 } from "./v2";
import { emit } from "./events";

export let mouseDown: boolean = false;
export const pointer: V2 = { x: 0, y: 0 };
export let inputFocus: boolean = false;
export let mouseSensitivity: number = 100;
export function setMouseSensitivity( value: number ): void
{
  mouseSensitivity = value;
}

let canvasBounds: DOMRect;
let screenScale: number = 1;
export function updateCanvasBounds( canvas: HTMLCanvasElement ): void
{
  canvasBounds = canvas.getBoundingClientRect();
  screenScale = canvasBounds.width / 512;
}

export function isTouchDevive(): boolean
{
  const prefixes: string[] = " -webkit- -moz- -o- -ms- ".split( " " );

  function mq( query: string ): boolean
  {
    return window.matchMedia( query ).matches;
  }

  if ( "ontouchstart" in window )
  {
    return true;
  }

  const q: string = [ "(", prefixes.join( "touch-enabled),(" ), "heartz", ")" ].join( "" );
  return mq( q );
}

export const isTouch: boolean = isTouchDevive();

export interface Interactive
{
  hover: boolean;
  pressed: boolean;
  onHover( mouseDown: boolean ): void;
  onBlur(): void;
  onMouseDown(): void;
  onMouseUp(): void;
}
type mouseListener = ( this: HTMLCanvasElement, e: MouseEvent | PointerEvent | TouchEvent ) => any;

export function initPointer( canvas: HTMLCanvasElement ): void
{
  const mouseClickHandler: mouseListener = ( event: MouseEvent ): void =>
  {
    updateCanvasBounds( canvas );
    if ( !isTouch )
    {
      pointer.x = ~~( ( event.clientX - canvasBounds.left ) / screenScale );
      pointer.y = ~~( ( event.clientY - canvasBounds.top ) / screenScale );

      canvas.removeEventListener( "click", mouseClickHandler, false );
      canvas.addEventListener( "pointerdown", mouseDownHandler, false );
      canvas.addEventListener( "pointerup", mouseUpHandler, false );
      document.addEventListener( "pointermove", updatePosition, false );
      inputFocus = true;
    } else
    {
      canvas.removeEventListener( "click", mouseClickHandler, false );
      canvas.addEventListener( "touchstart", mouseDownHandler, false );
      canvas.addEventListener( "touchend", mouseUpHandler, false );
      document.addEventListener( "touchmove", updatePosition, false );
      inputFocus = true;
    }
  };

  const mouseDownHandler: mouseListener = ( e: PointerEvent | TouchEvent ): void =>
  {
    updateCanvasBounds( canvas );
    if ( isTouch )
    {
      e = e as TouchEvent;
      e.preventDefault();
      const touch: Touch = e.touches[ 0 ];
      pointer.x = ~~( ( touch.clientX - canvasBounds.left ) / screenScale );
      pointer.y = ~~( ( touch.clientY - canvasBounds.top ) / screenScale );
    }
    mouseDown = true;
    emit( "mouse_down", V2.copy( pointer ) );
  };

  const mouseUpHandler: mouseListener = ( e: PointerEvent | TouchEvent ): void =>
  {
    mouseDown = false;
    emit( "mouse_up", V2.copy( pointer ) );
  };

  canvas.addEventListener( "click", mouseClickHandler, false );

  const updatePosition: mouseListener = ( e: PointerEvent | TouchEvent ): void =>
  {
    updateCanvasBounds( canvas );
    if ( isTouch )
    {
      e = e as TouchEvent;
      e.preventDefault();
      const touch: Touch = e.touches[ 0 ];
      pointer.x = ~~( ( touch.clientX - canvasBounds.left ) / screenScale );
      pointer.y = ~~( ( touch.clientY - canvasBounds.top ) / screenScale );
    } else
    {
      e = e as PointerEvent;
      pointer.x = ~~( ( e.clientX - canvasBounds.left ) / screenScale );
      pointer.y = ~~( ( e.clientY - canvasBounds.top ) / screenScale );
      if ( pointer.x >= SCREEN_WIDTH )
      {
        pointer.x = SCREEN_WIDTH - 1;
      }
      if ( pointer.y >= SCREEN_HEIGHT )
      {
        pointer.y = SCREEN_HEIGHT - 1;
      }
      if ( pointer.x < 0 )
      {
        pointer.x = 0;
      }
      if ( pointer.y < 0 )
      {
        pointer.y = 0;
      }
    }
  };
}
