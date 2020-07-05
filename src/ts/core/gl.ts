export namespace gl
{
  let ctx: WebGLRenderingContext;
  let width: number;
  let height: number;

  // xy + uv + argb
  const VERTEX_SIZE: number = ( 4 * 2 ) + ( 4 * 2 ) + ( 4 );
  const MAX_BATCH: number = 10922;
  const VERTICES_PER_QUAD: number = 6;
  const VERTEX_DATA_SIZE: number = VERTEX_SIZE * MAX_BATCH * 4;
  const INDEX_DATA_SIZE: number = MAX_BATCH * ( 2 * VERTICES_PER_QUAD );

  const vertexData: ArrayBuffer = new ArrayBuffer( VERTEX_DATA_SIZE );
  const vPositionData: Float32Array = new Float32Array( vertexData );
  const vColorData: Uint32Array = new Uint32Array( vertexData );
  const vIndexData: Uint16Array = new Uint16Array( INDEX_DATA_SIZE );

  let indexBuffer: WebGLBuffer;
  let vertexBuffer: WebGLBuffer;
  let count: number = 0;
  let currentTexture: WebGLTexture = null;
  let vertexAttr: number;
  let textureAttr: number;
  let colourAttr: number;
  let c: number = 0xFFFFFFFF; // AABBGGRR

  export function initialize( canvas: HTMLCanvasElement ): void
  {
    width = canvas.width;
    height = canvas.height;
    ctx = canvas.getContext( "webgl", { alpha: false, antialias: false, depth: false, powerPreference: "high-performance", preserveDrawingBuffer: true } );

    function compileShader( source: string, type: number ): WebGLShader
    {
      const glShader: WebGLShader = ctx.createShader( type );
      ctx.shaderSource( glShader, source );
      ctx.compileShader( glShader );
      return glShader;
    }

    function createShaderProgram( vsSource: string, fsSource: string ): WebGLProgram
    {
      const program: WebGLProgram = ctx.createProgram();
      const vShader: WebGLShader = compileShader( vsSource, ctx.VERTEX_SHADER );
      const fShader: WebGLShader = compileShader( fsSource, ctx.FRAGMENT_SHADER );
      ctx.attachShader( program, vShader );
      ctx.attachShader( program, fShader );
      ctx.linkProgram( program );
      return program;
    }

    function createBuffer( bufferType: number, size: number, usage: number ): WebGLBuffer
    {
      const buffer: WebGLBuffer = ctx.createBuffer();
      ctx.bindBuffer( bufferType, buffer );
      ctx.bufferData( bufferType, size, usage );
      return buffer;
    }

    const shader: WebGLShader = createShaderProgram(
      `precision lowp float;
      attribute vec2 v,t;
      attribute vec4 c;
      varying vec2 uv;
      varying vec4 col;
      uniform vec2 res;

      void main() {
        gl_Position = vec4((((v / res) * 2.0) - 1.0) * vec2(1, -1), 0, 1);
        uv = t;
        col = c;
      }`,
      `precision lowp float;
      varying vec2 uv;
      varying vec4 col;
      uniform sampler2D s;
      void main() {
        gl_FragColor = texture2D(s, uv) * col;
      }`
    );

    indexBuffer = createBuffer( ctx.ELEMENT_ARRAY_BUFFER, vIndexData.byteLength, ctx.STATIC_DRAW );
    vertexBuffer = createBuffer( ctx.ARRAY_BUFFER, vertexData.byteLength, ctx.DYNAMIC_DRAW );

    ctx.blendFunc( ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA );
    ctx.enable( ctx.BLEND );
    ctx.useProgram( shader );
    ctx.bindBuffer( ctx.ELEMENT_ARRAY_BUFFER, indexBuffer );
    for ( let indexA: number = 0, indexB: number = 0; indexA < MAX_BATCH * VERTICES_PER_QUAD; indexA += VERTICES_PER_QUAD, indexB += 4 )
    {
      vIndexData[ indexA + 0 ] = indexB;
      vIndexData[ indexA + 1 ] = indexB + 1;
      vIndexData[ indexA + 2 ] = indexB + 2;
      vIndexData[ indexA + 3 ] = indexB + 0;
      vIndexData[ indexA + 4 ] = indexB + 3;
      vIndexData[ indexA + 5 ] = indexB + 1;
    }

    ctx.bufferSubData( ctx.ELEMENT_ARRAY_BUFFER, 0, vIndexData );
    ctx.bindBuffer( ctx.ARRAY_BUFFER, vertexBuffer );

    vertexAttr = ctx.getAttribLocation( shader, "v" );
    textureAttr = ctx.getAttribLocation( shader, "t" );
    colourAttr = ctx.getAttribLocation( shader, "c" );

    ctx.enableVertexAttribArray( vertexAttr );
    ctx.vertexAttribPointer( vertexAttr, 2, ctx.FLOAT, false, VERTEX_SIZE, 0 );
    ctx.enableVertexAttribArray( textureAttr );
    ctx.vertexAttribPointer( textureAttr, 2, ctx.FLOAT, false, VERTEX_SIZE, 8 );
    ctx.enableVertexAttribArray( colourAttr );
    ctx.vertexAttribPointer( colourAttr, 4, ctx.UNSIGNED_BYTE, true, VERTEX_SIZE, 16 );
    ctx.uniform2f( ctx.getUniformLocation( shader, "res" ), width, height );
    ctx.activeTexture( ctx.TEXTURE0 );
  }

  export function createTexture( image: HTMLImageElement ): WebGLTexture
  {
    const texture: WebGLTexture = ctx.createTexture();
    ctx.bindTexture( ctx.TEXTURE_2D, texture );
    ctx.texParameteri( ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE );
    ctx.texParameteri( ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE );
    ctx.texParameteri( ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST );
    ctx.texParameteri( ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST );
    ctx.texImage2D( ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, image );
    ctx.bindTexture( ctx.TEXTURE_2D, null );
    return texture;
  }

  export function colour( AABBGGRR: number ): void
  {
    c = AABBGGRR;
  }

  let background: [ number, number, number ] = [ 0, 0, 0 ];
  export function setBackground( r: number, g: number, b: number ): void
  {
    background = [ r / 255, g / 255, b / 255 ];
    ctx.clearColor( background[ 0 ], background[ 1 ], background[ 2 ], 1 );
  }

  export function getBackground(): [ number, number, number ]
  {
    return [ background[ 0 ] * 255, background[ 1 ] * 255, background[ 2 ] * 255 ];
  }

  export function clear(): void
  {
    ctx.clear( ctx.COLOR_BUFFER_BIT );
  }

  export function draw( texture: WebGLTexture, x: number, y: number, w: number, h: number, u0: number, v0: number, u1: number, v1: number, sx: number = 1, sy: number = 1 ): void
  {
    w *= sx;
    h *= sy;
    const x0: number = x;
    const y0: number = y;
    const x1: number = x + w;
    const y1: number = y + h;
    const x2: number = x;
    const y2: number = y + h;
    const x3: number = x + w;
    const y3: number = y;
    const argb: number = c;

    if ( texture !== currentTexture || count + 1 >= MAX_BATCH )
    {
      ctx.bufferSubData( ctx.ARRAY_BUFFER, 0, vertexData );
      ctx.drawElements( 4, count * VERTICES_PER_QUAD, ctx.UNSIGNED_SHORT, 0 );
      count = 0;
      if ( currentTexture !== texture )
      {
        currentTexture = texture;
        ctx.bindTexture( ctx.TEXTURE_2D, currentTexture );
      }
    }

    let offset: number = count * VERTEX_SIZE;

    // Vertex Order
    // Vertex Position | UV | ARGB
    // Vertex 1
    vPositionData[ offset++ ] = x0;
    vPositionData[ offset++ ] = y0;
    vPositionData[ offset++ ] = u0;
    vPositionData[ offset++ ] = v0;
    vColorData[ offset++ ] = argb;

    // Vertex 2
    vPositionData[ offset++ ] = x1;
    vPositionData[ offset++ ] = y1;
    vPositionData[ offset++ ] = u1;
    vPositionData[ offset++ ] = v1;
    vColorData[ offset++ ] = argb;

    // Vertex 3
    vPositionData[ offset++ ] = x2;
    vPositionData[ offset++ ] = y2;
    vPositionData[ offset++ ] = u0;
    vPositionData[ offset++ ] = v1;
    vColorData[ offset++ ] = argb;

    // Vertex 4
    vPositionData[ offset++ ] = x3;
    vPositionData[ offset++ ] = y3;
    vPositionData[ offset++ ] = u1;
    vPositionData[ offset++ ] = v0;
    vColorData[ offset++ ] = argb;

    if ( ++count >= MAX_BATCH )
    {
      ctx.bufferSubData( ctx.ARRAY_BUFFER, 0, vertexData );
      ctx.drawElements( 4, count * VERTICES_PER_QUAD, ctx.UNSIGNED_SHORT, 0 );
      count = 0;
    }
  }

  export function flush(): void
  {
    if ( count === 0 )
    {
      return;
    }
    ctx.bufferSubData( ctx.ARRAY_BUFFER, 0, vPositionData.subarray( 0, count * VERTEX_SIZE ) );
    ctx.drawElements( 4, count * VERTICES_PER_QUAD, ctx.UNSIGNED_SHORT, 0 );
    count = 0;
  }
}
