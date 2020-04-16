import { drawText, drawTexture } from "../core/draw";

import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { Easing } from "../core/interpolation";
import { GameState } from "../game-state";
import { PlayerCard } from "../player-cards";
import { PlayerHandNode } from "../scene-nodes/player-hand-node";
import { Scene } from "../core/scene";
import { SmallCardNode } from "../scene-nodes/small-card-node";
import { gl } from "../core/gl";
import { rand } from "../core/random";

enum GamePhase {
  Begin,
  Draw,
  Player,
  Rift,
  Discard,
  End
}

let Phase: GamePhase = GamePhase.Begin;

let hand: PlayerHandNode;

export const GameSceneName: string = "Game";
export class GameScene extends Scene {
  constructor() {
    super();
    this.id = GameSceneName;

    hand = new Builder(PlayerHandNode)
      .with("size", { x: 338, y: 48 })
      .build();
    hand.moveTo({ x: 34, y: this.root.size.y - 48 });
    this.root.add(hand);

    for (let i: number = 0; i < 10; i++) {
      const card: SmallCardNode = new Builder(SmallCardNode).build();
      card.moveTo({ x: 34 + (34 * i), y: this.root.topLeft.y + 16 });
      this.root.add(card);
    }

    const storeButton: ButtonNode =
      new Builder(ButtonNode)
        .with("size", { x: 80, y: 38 })
        .with("colour", 0xFF448844)
        .with("text", "store")
        .with("onMouseUp", () => {
          this.drawPlayerCard();
        })
        .build();
    storeButton.moveTo({ x: this.root.topLeft.x + this.root.size.x - 88, y: this.root.topLeft.y + this.root.size.y - 42 });
    this.root.add(storeButton);
  }
  public transitionIn(): Promise<any> {
    super.transitionIn();
    return this.root.moveTo({ x: this.root.size.x, y: 0 }).then(() => {
      return this.root.moveTo({ x: 0, y: 0 }, 500, Easing.easeOutQuad).then(() => Phase = GamePhase.Draw);
    });
  }
  public transitionOut(): Promise<any> {
    return super.transitionOut();
  }

  public drawPlayerCard(): void {
    if (GameState.playerDeck.length === 0) {
      GameState.playerDeck = rand.shuffle(GameState.discardPile);
      // TODO(dbrad): shuffle animation?
      GameState.discardPile = [];
    }
    const cardData: PlayerCard = GameState.playerDeck.pop();
    if (GameState.playerHand.length < 10) {
      GameState.playerHand.push(cardData);
    } else {
      // discard pile
    }
  }

  public update(now: number, delta: number): void {
    switch (Phase) {
      case GamePhase.Begin:
        GameState.turn++;
        break;
      case GamePhase.Draw:
        if (GameState.activeEncounters.length >= 10 && GameState.encounterDeck.length > 0) {
          // LOSE - OVERRUN
        } else {
          if (GameState.riftStability >= GameState.riftStabilityMax) {
            // DRAW ALL REMAINING ENCOUNTER CARDS
            if (GameState.activeEncounters.length >= 10) {
              // LOSE - OVERRUN
            }
          } else {
            // DRAW 1 ENCOUNTER
          }
          // DRAW 5 PLAYER CARDS
          for (let i: number = 0; i < 5; i++) {
            this.drawPlayerCard();
          }
          Phase = GamePhase.Player;
        }
        break;
      case GamePhase.Player:
        // enable input
        // check for rift stitches count
        // check for all encounters done
        break;
      case GamePhase.Rift:
        // disable input
        break;
      case GamePhase.Discard:
        // Animate discarding all unplayed card_small
        // move hand to discard
        break;
      case GamePhase.End:
        // check for level 5 containment field
        // check counter on Old One's Favour
        break;
      default:
        Phase = GamePhase.Begin;
    }

    super.update(now, delta);
  }

  public draw(now: number, delta: number): void {
    drawTexture("pistol_large", this.root.topLeft.x + this.root.size.x - 96, this.root.topLeft.x + this.root.size.y - 216);
    drawTexture("card_large", this.root.topLeft.x + this.root.size.x - 96, this.root.topLeft.x + this.root.size.y - 216);
    drawText("pewpewpew", this.root.topLeft.x + this.root.size.x - 82, this.root.topLeft.x + this.root.size.y - 120);
    drawTexture("card_small", this.root.topLeft.x + 384, this.root.topLeft.y + this.root.size.y - 48);
    drawTexture("card_small_back", this.root.topLeft.x, this.root.topLeft.y + 16);
    gl.colour(0xCC000000);
    drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y, this.root.size.x, 16);
    gl.colour(0xFFFFFFFF);
    super.draw(now, delta);
    drawTexture("card_small_back", this.root.topLeft.x, this.root.topLeft.y + this.root.size.y - 48);
  }
}
