import { gl } from "./gl";

export type Texture = {
  atlas: WebGLTexture;
  w: number;
  h: number;
  u0: number;
  v0: number;
  u1: number;
  v1: number;
};

export type TextureJson = {
  type: "sprite" | "row";
  name: string | string[];
  x: number;
  y: number;
  w: number;
  h: number;
};

export type FontJson = {
  type: "font";
  name: string;
  values: string[];
  x: number;
  y: number;
  w: number;
  h: number;
};

export type TextureAssetJson = {
  type: "textures";
  name: string;
  url: string;
  textures: (TextureJson | FontJson)[];
};

export const ATLAS_CACHE: Map<string, WebGLTexture> = new Map();
export const TEXTURE_CACHE: Map<string, Texture> = new Map();
export const FONT_CACHE: Map<string, Map<string, Texture>> = new Map();

export const loadSpriteSheet: (textureData: TextureAssetJson) => Promise<any> = (sheet: TextureAssetJson) =>
{
  const image: HTMLImageElement = new Image();

  return new Promise((resolve, reject) =>
  {
    try
    {
      image.addEventListener("load", () =>
      {
        const glTexture: WebGLTexture = gl.createTexture(image);
        ATLAS_CACHE.set(sheet.name, glTexture);

        for (const texture of sheet.textures)
        {
          if (texture.type === "sprite")
          {
            TEXTURE_CACHE.set(texture.name as string, {
              atlas: glTexture,
              w: texture.w,
              h: texture.h,
              u0: texture.x / image.width,
              v0: texture.y / image.height,
              u1: (texture.x + texture.w) / image.width,
              v1: (texture.y + texture.h) / image.height
            });
          }
          else if (texture.type === "font")
          {
            if (!FONT_CACHE.has(texture.name)) 
            {
              FONT_CACHE.set(texture.name, new Map());
            }
            const font: Map<string, Texture> = FONT_CACHE.get(texture.name);
            for (let ox: number = texture.x, i: number = 0; ox < image.width; ox += texture.w)
            {
              if (!texture.values[i])
              {
                break;
              }
              font.set(texture.values[i], {
                atlas: glTexture,
                w: texture.w,
                h: texture.h,
                u0: ox / image.width,
                v0: texture.y / image.height,
                u1: (ox + texture.w) / image.width,
                v1: (texture.y + texture.h) / image.height
              });
              i++;
            }
          }
          else
          {
            for (let ox: number = texture.x, i: number = 0; ox < image.width; ox += texture.w)
            {
              if (!texture.name[i])
              {
                break;
              }
              TEXTURE_CACHE.set(texture.name[i], {
                atlas: glTexture,
                w: texture.w,
                h: texture.h,
                u0: ox / image.width,
                v0: texture.y / image.height,
                u1: (ox + texture.w) / image.width,
                v1: (texture.y + texture.h) / image.height
              });
              i++;
            }
          }
        }
        resolve();
      });
      image.src = sheet.url;
    } catch (err)
    {
      reject(err);
    }
  });
};
