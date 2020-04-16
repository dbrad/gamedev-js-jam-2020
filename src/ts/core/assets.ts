import { EncounterCardAssetJson, loadEncounterCards } from "../encounter-cards.js";
import { PlayerCardAssetJson, loadPlayerCards } from "../player-cards.js";
import { TextureAssetJson, loadSpriteSheet } from "./texture.js";

type AssetJson = TextureAssetJson | PlayerCardAssetJson | EncounterCardAssetJson;

export async function loadAsset(url: string): Promise<{}> {
  const response: Response = await fetch(url);
  const asset: AssetJson = await response.json();

  if (asset.type === "textures") {
    return loadSpriteSheet(asset);
  } else if (asset.type === "player_cards") {
    return loadPlayerCards(asset);
  } else if (asset.type === "encounter_cards") {
    return loadEncounterCards(asset);
  }
}
