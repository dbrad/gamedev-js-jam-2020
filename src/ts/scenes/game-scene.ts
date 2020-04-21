import { Align, drawText, drawTexture } from "../core/draw";
import { GameState, drawFromEncounterDeck, drawFromPlayerDeck } from "../game-state";
import { PlayerDiscardPileNode, toBeDiscarded } from "../scene-nodes/player-discard-pile-node";

import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { Easing } from "../core/interpolation";
import { EncounterDeckNode } from "../scene-nodes/encounter-deck-node";
import { EncountersActiveNode } from "../scene-nodes/encounters-active-node";
import { PlayerCard } from "../player-cards";
import { PlayerDeckNode } from "../scene-nodes/player-deck-node";
import { PlayerHandNode } from "../scene-nodes/player-hand-node";
import { PlayerPermanentSlotsNode } from "../scene-nodes/player-permanent-slots-node";
import { Scene } from "../core/scene";
import { StoreDiscardPileNode } from "../scene-nodes/store-discard-pile";
import { StoreNode } from "../scene-nodes/store-node";
import { emit } from "../core/events";
import { gl } from "../core/gl";
import { rand } from "../core/random";

enum GamePhase {
  Pregame,
  Begin,
  Draw,
  Player,
  Rift,
  Discard,
  End
}

let Phase: GamePhase = GamePhase.Pregame;

let permanents: PlayerPermanentSlotsNode;
let playerDeck: PlayerDeckNode;
let hand: PlayerHandNode;
let discard: PlayerDiscardPileNode;
let encounterDeck: EncounterDeckNode;
let encountersActive: EncountersActiveNode;
let store: StoreNode;
let storeDiscard: StoreDiscardPileNode;

let endTurnButton: ButtonNode;
let clearStoreButton: ButtonNode;
let upgradeStoreButton: ButtonNode;

export const GameSceneName: string = "Game";
export class GameScene extends Scene {
  constructor() {
    super();
    this.id = GameSceneName;

    encounterDeck = new Builder(EncounterDeckNode).build();
    encounterDeck.moveTo({ x: 0, y: 0 });
    this.root.add(encounterDeck);

    encountersActive = new Builder(EncountersActiveNode).build();
    encountersActive.moveTo({ x: 34, y: 0 });
    this.root.add(encountersActive);

    store = new Builder(StoreNode).build();
    store.moveTo({ x: 0, y: this.root.size.y / 2 - 24 });
    this.root.add(store);

    storeDiscard = new Builder(StoreDiscardPileNode).build();
    storeDiscard.moveTo({ x: 272, y: this.root.size.y / 2 - 24 });
    this.root.add(storeDiscard);

    permanents = new Builder(PlayerPermanentSlotsNode).build();
    permanents.moveTo({ x: 0, y: 185 });
    this.root.add(permanents);

    hand = new Builder(PlayerHandNode).build();
    hand.moveTo({ x: 34, y: this.root.size.y - 48 });
    this.root.add(hand);

    playerDeck = new Builder(PlayerDeckNode).build();
    playerDeck.moveTo({ x: 0, y: this.root.size.y - 48 });
    this.root.add(playerDeck);

    discard = new Builder(PlayerDiscardPileNode).build();
    discard.moveTo({ x: 374, y: this.root.size.y - 48 });
    this.root.add(discard);

    endTurnButton =
      new Builder(ButtonNode)
        .with("size", { x: 110, y: 48 })
        .with("colour", 0xFF448844)
        .with("text", "end turn")
        .with("onMouseUp", () => {
          if (Phase === GamePhase.Player && GameState.playerMode === "play") {
            Phase = GamePhase.Rift;
          }
        })
        .build();
    endTurnButton.moveTo({ x: this.root.size.x - 112, y: this.root.size.y / 2 - 24 });
    this.root.add(endTurnButton);

    clearStoreButton =
      new Builder(ButtonNode)
        .with("size", { x: 60, y: 20 })
        .with("colour", 0xFF4444CC)
        .with("text", "clear")
        .with("textScale", 1)
        .with("onMouseUp", () => {
          if (Phase === GamePhase.Player && GameState.playerMode === "play" && GameState.playerMoney > 0) {
            GameState.playerMoney -= 1;
            for (let i: number = 0, len: number = GameState.storeActive.length; i < len; i++) {
              const card: PlayerCard = GameState.storeActive.pop();
              emit("store_card_discarded", card);
            }
          }
        })
        .build();
    clearStoreButton.moveTo({ x: this.root.topLeft.x + 207, y: this.root.size.y / 2 - 22 });
    this.root.add(clearStoreButton);

    upgradeStoreButton =
      new Builder(ButtonNode)
        .with("size", { x: 60, y: 20 })
        .with("colour", 0xFF448844)
        .with("text", "upgrade")
        .with("textScale", 1)
        .with("onMouseUp", () => {
          if (Phase === GamePhase.Player && GameState.playerMode === "play" && GameState.playerMoney > 0) {
            GameState.playerMoney -= 1;
            for (const card of GameState.storeActive) {
              card.levelUp();
            }
          }
        })
        .build();
    upgradeStoreButton.moveTo({ x: this.root.topLeft.x + 207, y: this.root.size.y / 2 + 2 });
    this.root.add(upgradeStoreButton);
  }
  public transitionIn(): Promise<any> {
    super.transitionIn();
    return this.root.moveTo({ x: this.root.size.x, y: 0 }).then(() => {
      return this.root.moveTo({ x: 0, y: 0 }, 500, Easing.easeOutQuad).then(() => Phase = GamePhase.Begin);
    });
  }
  public transitionOut(): Promise<any> {
    return super.transitionOut();
  }

  public update(now: number, delta: number): void {
    // Keep the store at 5 cards, if possible
    if (GameState.storeActive.length < 5) {
      // if the store deck is out of cards...
      if (GameState.storeDeck.length === 0) {
        // check the store's discard pule for card...
        if (GameState.storeDiscard.length > 0) {
          // shuffle those card back into the deck
          GameState.storeDeck = rand.shuffle(GameState.storeDiscard);
          GameState.storeDiscard.length = 0;
        }
      } else {
        // we will only add to the store is the store deck has cards to add
        GameState.storeActive.push(GameState.storeDeck.pop());
      }
    }

    // Make button looks diabled / enabled
    if (Phase === GamePhase.Player && GameState.playerMode === "play") {
      endTurnButton.colour = 0xFF448844;
      if (GameState.playerMoney < 1) {
        clearStoreButton.colour = 0xFF2d2d2d;
        upgradeStoreButton.colour = 0xFF2d2d2d;
      } else {
        clearStoreButton.colour = 0xFF4444CC;
        upgradeStoreButton.colour = 0xFF448844;
      }
    } else {
      endTurnButton.colour = 0xFF2d2d2d;
      clearStoreButton.colour = 0xFF2d2d2d;
      upgradeStoreButton.colour = 0xFF2d2d2d;
    }

    switch (Phase) {
      case GamePhase.Pregame:
        break;
      case GamePhase.Begin:
        GameState.turn++;
        // check for level 5 containment field
        // check counter on Old One's Favour
        Phase = GamePhase.Draw;
        break;
      case GamePhase.Draw:
        if (GameState.encountersActive.length >= 10 && GameState.encounterDeck.length > 0) {
          // LOSE - OVERRUN
        } else {
          if (GameState.riftStability >= GameState.riftStabilityMax) {
            // DRAW ALL REMAINING ENCOUNTER CARDS
            while (GameState.encounterDeck.length > 0) {
              drawFromEncounterDeck();
              if (GameState.encountersActive.length >= 10 && GameState.encounterDeck.length > 0) {
                // LOSE - OVERRUN
              }
            }
          } else {
            drawFromEncounterDeck();
          }
          for (let i: number = 0; i < 6; i++) {
            drawFromPlayerDeck();
          }
        }
        Phase = GamePhase.Player;
        break;
      case GamePhase.Player:
        if (GameState.playerMode === "discard" && GameState.discardsRequired <= 0) {
          GameState.playerMode = "play";
        }
        if (GameState.playerMode === "destroy" && GameState.destroysRequired <= 0) {
          GameState.playerMode = "play";
        }
        // check for rift stitches count
        // check for all encounters done
        break;
      case GamePhase.Rift:
        GameState.riftStability += GameState.turn;
        if (GameState.riftStability > GameState.riftStabilityMax) {
          GameState.riftStability = GameState.riftStabilityMax;
        }
        for (const card of GameState.encountersActive) {
          card.effects.map(fn => fn());
        }
        Phase = GamePhase.Discard;
        break;
      case GamePhase.Discard:
        GameState.playerMoney = 0;
        while (GameState.playerHand.length > 0) {
          const card: PlayerCard = GameState.playerHand.pop();
          emit("card_discarded", card);
        }
        if (toBeDiscarded.length === 0) {
          Phase = GamePhase.End;
        }
        break;
      case GamePhase.End:
        Phase = GamePhase.Begin;
        break;
      default:
    }

    super.update(now, delta);
  }

  public draw(now: number, delta: number): void {
    gl.colour(0x99000000);
    drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y, this.root.size.x, 49);
    drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y + this.root.size.y - 110, this.root.size.x, 110);
    drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y + this.root.size.y / 2 - 25, this.root.size.x, 50);
    gl.colour(0xFFFFFFFF);

    // Rift Stability
    drawText(
      `rift stability`,
      this.root.topLeft.x + this.root.size.x - 69,
      this.root.topLeft.y + 8,
      { textAlign: Align.Center });
    drawText(
      `${GameState.riftStability}`.padStart(2, "0") + `/${GameState.riftStabilityMax}`,
      this.root.topLeft.x + this.root.size.x - 69,
      this.root.topLeft.y + 20,
      { textAlign: Align.Center, scale: 4 });

    gl.colour(0x99000000);
    drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y + 65, this.root.size.x, 16);
    drawText(`turn ${GameState.turn}`, this.root.topLeft.x, this.root.topLeft.y + 67);

    super.draw(now, delta);

    // Money Display
    drawText(`funds`, this.root.topLeft.x + this.root.size.x - 160, this.root.topLeft.y + this.root.size.y / 2 - 18, { textAlign: Align.Center, scale: 2 });
    drawTexture("money_icon", this.root.topLeft.x + this.root.size.x - 198, this.root.topLeft.y + this.root.size.y / 2 - 4, 3, 3);
    drawText(`x`, this.root.topLeft.x + this.root.size.x - 169, this.root.topLeft.y + this.root.size.y / 2 + +3, { scale: 2 });
    drawText(`${(GameState.playerMoney + "").padStart(2, "0")}`, this.root.topLeft.x + this.root.size.x - 156, this.root.topLeft.y + this.root.size.y / 2 + 1, { scale: 3 });

    playerDeck.draw(now, delta);
    encounterDeck.draw(now, delta);

    if (Phase === GamePhase.Player && GameState.playerMode !== "play") {
      gl.colour(0xDD000000);
      drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y, this.root.size.x, this.root.size.y / 2 + 24);
      if (GameState.playerMode === "destroy") {
        drawText(`destroy ${GameState.destroysRequired} more cards`, this.root.topLeft.x + this.root.size.x / 2, this.root.topLeft.y + this.root.size.y / 2, { textAlign: Align.Center, scale: 3 });
      } else {
        drawText(`discard ${GameState.discardsRequired} more cards`, this.root.topLeft.x + this.root.size.x / 2, this.root.topLeft.y + this.root.size.y / 2, { textAlign: Align.Center, scale: 3 });
      }
    }
  }
}
