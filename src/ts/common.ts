import { drawText, drawTexture } from "./core/draw";

import { PlayerCard } from "./player-cards";
import { V2 } from "./core/v2";
import { gl } from "./core/gl";

export function drawPlayerCard(card: PlayerCard, topLeft: V2, size: V2): void {
  // Art
  if (card) {
    drawTexture(card.art + "_small", topLeft.x, topLeft.y);
  } else {
    gl.colour(0xFF0000FF);
    drawTexture("solid", topLeft.x, topLeft.y + 1, 32, 32);
    gl.colour(0xFFFFFFFF);
  }
  
  // Card Skin
  drawTexture("card_player_small", topLeft.x, topLeft.y);

  if (card) {
    // Name + Level
    if (card.level > 0) {
      gl.colour(0xAA000000);
      drawTexture("solid", topLeft.x + size.x - 15, topLeft.y + 4, 11, 7);
      drawText(`+${card.level}`, topLeft.x + size.x - 15, topLeft.y + 5);
    }
    // Card Cost
    drawText(`${card.cost}`, topLeft.x + size.x - 11, topLeft.y + size.y - 9, { colour: 0xFF353330 });
  } else {
    // Default Card Cost
    drawText(`0`, topLeft.x + size.x - 9, topLeft.y + size.y - 9, { colour: 0xFF353330 });
  }
}
