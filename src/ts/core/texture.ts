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

export type TextureAssetJson = {
  type: "textures";
  name: string;
  url: string;
  textures: TextureJson[];
};

export const ATLAS_CACHE: Map<string, WebGLTexture> = new Map();
export const TEXTURE_CACHE: Map<string, Texture> = new Map();

export const loadSpriteSheet: (textureData: TextureAssetJson) => Promise<any> = (sheet: TextureAssetJson) => {
  const image: HTMLImageElement = new Image();

  return new Promise((resolve, reject) => {
    try {
      image.addEventListener("load", () => {
        const glTexture: WebGLTexture = gl.createTexture(image);
        ATLAS_CACHE.set(sheet.name, glTexture);

        for (const texture of sheet.textures) {
          if (texture.type === "sprite") {
            TEXTURE_CACHE.set(texture.name as string, {
              atlas: glTexture,
              w: texture.w,
              h: texture.h,
              u0: texture.x / image.width,
              v0: texture.y / image.height,
              u1: (texture.x + texture.w) / image.width,
              v1: (texture.y + texture.h) / image.height
            });
          } else {
            for (let ox: number = texture.x, i: number = 0; ox < image.width; ox += texture.w) {
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
    } catch (err) {
      reject(err);
    }
  });
};
