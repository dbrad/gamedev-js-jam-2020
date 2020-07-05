// @ifdef DEBUG
let fpsTextNode: Text;
let msTextNode: Text;
let frameCount: number = 0;
let fps: number = 60;
let lastFps: number = 0;
let ms: number = 1000 / fps;

export function initStats(): void
{
    const container: HTMLDivElement = document.createElement( "div" );
    container.style.position = "relative";
    container.style.zIndex = "1000";

    document.body.prepend( container );

    const overlay: HTMLDivElement = document.createElement( "div" );
    overlay.style.position = "fixed";
    overlay.style.right = "0px";
    overlay.style.top = "0px";
    overlay.style.fontFamily = "Victor Mono";
    overlay.style.fontSize = "16px";
    overlay.style.fontWeight = "bold";
    overlay.style.padding = "0.5em 1em";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
    overlay.style.color = "white";
    overlay.style.textAlign = "right";
    overlay.style.borderLeft = "1px solid #FFFFFF";
    overlay.style.borderBottom = "1px solid #FFFFFF";
    overlay.style.userSelect = "none";
    container.appendChild( overlay );

    const fpsDOM: HTMLDivElement = document.createElement( "div" );
    overlay.appendChild( fpsDOM );
    const msDOM: HTMLDivElement = document.createElement( "div" );
    overlay.appendChild( msDOM );

    fpsTextNode = window.document.createTextNode( "" );
    fpsDOM.appendChild( fpsTextNode );
    msTextNode = window.document.createTextNode( "" );
    msDOM.appendChild( msTextNode );
}

export function tickStats( delta: number, now: number ): void
{
    ms = 0.9 * delta + 0.1 * ms;
    if ( now >= lastFps + 1000 )
    {
        fps = 0.9 * frameCount * 1000 / ( now - lastFps ) + 0.1 * fps;

        fpsTextNode.nodeValue = ( fps ).toFixed( 2 ) + " hz";
        msTextNode.nodeValue = ms.toFixed( 2 ) + " ms";

        lastFps = now - ( delta % 1000 / 60 );
        frameCount = 0;
    }
    frameCount++;
}
// @endif
