import { Align, drawText, drawTexture } from "../core/draw";
import { GameState, drawFromEncounterDeck, drawFromPlayerDeck } from "../game-state";
import { PlayerDiscardPileNode, toBeDiscarded } from "../scene-nodes/player-discard-pile-node";

import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { Easing } from "../core/interpolation";
import { EncounterCard } from "../encounter-cards";
import { EncounterDeckNode } from "../scene-nodes/encounter-deck-node";
import { EncountersActiveNode } from "../scene-nodes/encounters-active-node";
import { GameOverSceneName } from "./game-over-scene";
import { PlayerCard } from "../player-cards";
import { PlayerDeckNode } from "../scene-nodes/player-deck-node";
import { PlayerHandNode } from "../scene-nodes/player-hand-node";
import { PlayerPermanentSlotsNode } from "../scene-nodes/player-permanent-slots-node";
import { Scene } from "../core/scene";
import { SceneManager } from "../core/scene-manager";
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

export const GameSceneName: string = "Game";
export class GameScene extends Scene {
  private phase: GamePhase = GamePhase.Pregame;
  private permanents: PlayerPermanentSlotsNode;
  private playerDeck: PlayerDeckNode;
  private hand: PlayerHandNode;
  private discardPile: PlayerDiscardPileNode;
  private encounterDeck: EncounterDeckNode;
  private encountersActive: EncountersActiveNode;
  private store: StoreNode;
  private storeDiscard: StoreDiscardPileNode;

  private endTurnButton: ButtonNode;
  private clearStoreButton: ButtonNode;
  private upgradeStoreButton: ButtonNode;

  private tempActiveEncounters: EncounterCard[] = [];
  private phaseText: string = "";
  private awaitingPhase: boolean = false;

  constructor() {
    super();
    this.id = GameSceneName;
    this.phase = GamePhase.Pregame;

    this.encounterDeck = new Builder(EncounterDeckNode).build();
    this.encounterDeck.moveTo({ x: 0, y: 1 });
    this.root.add(this.encounterDeck);

    this.encountersActive = new Builder(EncountersActiveNode).build();
    this.encountersActive.moveTo({ x: 34, y: 1 });
    this.root.add(this.encountersActive);

    this.store = new Builder(StoreNode).build();
    this.store.moveTo({ x: 0, y: this.root.size.y / 2 - 24 });
    this.root.add(this.store);

    this.storeDiscard = new Builder(StoreDiscardPileNode).build();
    this.storeDiscard.moveTo({ x: 272, y: this.root.size.y / 2 - 24 });
    this.root.add(this.storeDiscard);

    this.permanents = new Builder(PlayerPermanentSlotsNode).build();
    this.permanents.moveTo({ x: 0, y: 185 });
    this.root.add(this.permanents);

    this.hand = new Builder(PlayerHandNode).build();
    this.hand.moveTo({ x: 34, y: this.root.size.y - 48 });
    this.root.add(this.hand);

    this.playerDeck = new Builder(PlayerDeckNode).build();
    this.playerDeck.moveTo({ x: 0, y: this.root.size.y - 48 });
    this.root.add(this.playerDeck);

    this.discardPile = new Builder(PlayerDiscardPileNode).build();
    this.discardPile.moveTo({ x: 374, y: this.root.size.y - 48 });
    this.root.add(this.discardPile);

    this.endTurnButton =
      new Builder(ButtonNode)
        .with("size", { x: 110, y: 48 })
        .with("colour", 0xFF448844)
        .with("text", "end turn")
        .with("onMouseUp", () => {
          if (this.phase === GamePhase.Player && GameState.playerMode === "play") {
            this.phase = GamePhase.Rift;
            this.phaseText = "rift";
          }
        })
        .build();
    this.endTurnButton.moveTo({ x: this.root.size.x - 112, y: this.root.size.y / 2 - 24 });
    this.root.add(this.endTurnButton);

    this.clearStoreButton =
      new Builder(ButtonNode)
        .with("size", { x: 60, y: 20 })
        .with("colour", 0xFF4444CC)
        .with("text", "refresh")
        .with("textScale", 1)
        .with("onHover", () => {
          emit("refresh_store_tooltip", true);
        })
        .with("onBlur", () => {
          emit("refresh_store_tooltip", false);
        })
        .with("onMouseUp", () => {
          if (this.phase === GamePhase.Player && GameState.playerMode === "play" && GameState.playerMoney > 0) {
            GameState.playerMoney -= 1;
            for (let i: number = 0, len: number = GameState.storeActive.length; i < len; i++) {
              const card: PlayerCard = GameState.storeActive.pop();
              emit("store_card_discarded", card);
            }
          }
        })
        .build();
    this.clearStoreButton.moveTo({ x: this.root.topLeft.x + 207, y: this.root.size.y / 2 - 22 });
    this.root.add(this.clearStoreButton);

    this.upgradeStoreButton =
      new Builder(ButtonNode)
        .with("size", { x: 60, y: 20 })
        .with("colour", 0xFF448844)
        .with("text", "upgrade")
        .with("textScale", 1)
        .with("onHover", () => {
          emit("upgrade_store_tooltip", true);
        })
        .with("onBlur", () => {
          emit("upgrade_store_tooltip", false);
        })
        .with("onMouseUp", () => {
          if (this.phase === GamePhase.Player && GameState.playerMode === "play" && GameState.playerMoney > 0) {
            GameState.playerMoney -= 1;
            for (const card of GameState.storeActive) {
              card.levelUp();
            }
          }
        })
        .build();
    this.upgradeStoreButton.moveTo({ x: this.root.topLeft.x + 207, y: this.root.size.y / 2 + 2 });
    this.root.add(this.upgradeStoreButton);
  }
  public transitionIn(): Promise<any> {

    return this.root.moveTo({ x: 0, y: this.root.size.y }).then(() => {
      return this.root.moveTo({ x: 0, y: 0 }, 500, Easing.easeOutQuad).then(() => {
        if (this.phase === GamePhase.Pregame) {
          this.phase = GamePhase.Begin;
        }
        return super.transitionIn();
      });
    });
  }
  public transitionOut(): Promise<any> {
    super.transitionOut();
    return this.root.moveTo({ x: 0, y: this.root.size.y }, 500, Easing.easeOutQuad).then(() => {
      if (this.phase === GamePhase.Pregame) {
        this.phase = GamePhase.Begin;
      }
    });
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
    if (this.phase === GamePhase.Player && GameState.playerMode === "play") {
      this.endTurnButton.colour = 0xFF448844;
      if (GameState.playerMoney < 1) {
        this.clearStoreButton.colour = 0xFF2d2d2d;
        this.upgradeStoreButton.colour = 0xFF2d2d2d;
      } else {
        this.clearStoreButton.colour = 0xFF4444CC;
        this.upgradeStoreButton.colour = 0xFF448844;
      }
    } else {
      this.endTurnButton.colour = 0xFF2d2d2d;
      this.clearStoreButton.colour = 0xFF2d2d2d;
      this.upgradeStoreButton.colour = 0xFF2d2d2d;
    }

    switch (this.phase) {
      case GamePhase.Pregame:
        break;
      case GamePhase.Begin:
        // check for level 5 containment field
        // check counter on Old One's Favour
        if (this.awaitingPhase) {
          break;
        }
        if (GameState.playerPermanents.length > 0) {
          // If the are permanents to play...
          if (!GameState.playerPermanentPlaying) {
            if (GameState.playerPermanentPlayingIndex < GameState.playerPermanents.length) {
              // if one isn't in play, grab the next one
              GameState.playerPermanentPlaying = GameState.playerPermanents[GameState.playerPermanentPlayingIndex];
              GameState.playerPermanentPlayingIndex++;
            } else {
              // if we hit the end of the permanents in play, time to move on
              GameState.playerPermanentPlayingIndex = 0;
              this.delay(() => {
                GameState.turn++;
                this.phase = GamePhase.Draw;
                this.phaseText = "draw";
                this.awaitingPhase = false;
              }, 300);
              this.awaitingPhase = true;
            }
          }
        } else {
          this.delay(() => {
            GameState.turn++;
            this.phase = GamePhase.Draw;
            this.phaseText = "draw";
            this.awaitingPhase = false;
          }, 300);
          this.awaitingPhase = true;
        }
        break;
      case GamePhase.Draw:
        //#region Draw Phase
        if (this.awaitingPhase) {
          break;
        }
        if (GameState.encountersActive.length >= 10 && GameState.encounterDeck.length > 0) {
          SceneManager.push(GameOverSceneName); // LOSE - OVERRUN
          return;
        } else {
          if (GameState.riftStability >= GameState.riftStabilityMax) {
            // DRAW ALL REMAINING ENCOUNTER CARDS
            while (GameState.encounterDeck.length > 0) {
              drawFromEncounterDeck();
              if (GameState.encountersActive.length >= 10 && GameState.encounterDeck.length > 0) {
                SceneManager.push(GameOverSceneName); // LOSE - OVERRUN
                return;
              }
            }
          } else {
            drawFromEncounterDeck();
          }
          for (let i: number = 0; i < 6; i++) {
            drawFromPlayerDeck();
          }
        }
        if (!this.awaitingPhase) {
          this.delay(() => {
            this.phase = GamePhase.Player;
            this.phaseText = "player";
            this.awaitingPhase = false;
          }, 750);
          this.awaitingPhase = true;
        }
        break;
      //#endregion Draw Phase
      case GamePhase.Player:
        if (GameState.playerMode === "discard" && GameState.discardsRequired <= 0) {
          GameState.playerMode = "play";
        }
        if (GameState.playerMode === "destroy" && GameState.destroysRequired <= 0) {
          GameState.playerMode = "play";
        }
        // check for rift stitches count - VC
        // check for all encounters done - VC
        break;
      case GamePhase.Rift:
        if (this.awaitingPhase) {
          break;
        }

        if (GameState.encountersActive.length === 0) {
          GameState.riftStability += ~~((GameState.turn - 1) / 5) + 1;
          if (GameState.riftStability > GameState.riftStabilityMax) {
            GameState.riftStability = GameState.riftStabilityMax;
          }
          this.delay(() => {
            this.phase = GamePhase.Discard;
            this.phaseText = "discard";
            this.awaitingPhase = false;
          }, 300);
          this.awaitingPhase = true;
          break;
        }

        if (this.tempActiveEncounters.length === 0) {
          this.tempActiveEncounters = [...GameState.encountersActive];
        }

        if (!GameState.encounterPlaying) {
          if (GameState.encounterPlayingIndex < this.tempActiveEncounters.length) {
            GameState.encounterPlaying = this.tempActiveEncounters[GameState.encounterPlayingIndex];
            GameState.encounterPlayingIndex++;
          } else {
            GameState.encounterPlayingIndex = 0;
            this.tempActiveEncounters.length = 0;
            GameState.riftStability += ~~((GameState.turn - 1) / 5) + 1;
            if (GameState.riftStability > GameState.riftStabilityMax) {
              GameState.riftStability = GameState.riftStabilityMax;
            }
            this.delay(() => {
              GameState.turn++;
              this.phase = GamePhase.Discard;
              this.phaseText = "discard";
              this.awaitingPhase = false;
            }, 300);
            this.awaitingPhase = true;
          }
        }
        break;
      case GamePhase.Discard:
        GameState.playerMoney = 0;
        while (GameState.playerHand.length > 0) {
          const card: PlayerCard = GameState.playerHand.pop();
          emit("card_discarded", card);
        }
        if (toBeDiscarded.length === 0) {
          if (!this.awaitingPhase) {
            this.delay(() => {
              this.phase = GamePhase.End;
              this.phaseText = "end";
              this.awaitingPhase = false;
            }, 300);
            this.awaitingPhase = true;
          }
        }
        break;
      case GamePhase.End:
        if (!this.awaitingPhase) {
          this.delay(() => {
            this.phase = GamePhase.Begin;
            this.phaseText = "begin";
            this.awaitingPhase = false;
          }, 300);
          this.awaitingPhase = true;
        }
        break;
      default:
    }

    super.update(now, delta);
  }

  public draw(now: number, delta: number): void {
    gl.colour(0x99000000);
    drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y, this.root.size.x, 50);
    drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y + this.root.size.y - 110, this.root.size.x, 110);
    drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y + this.root.size.y / 2 - 25, this.root.size.x, 50);
    gl.colour(0xFFFFFFFF);

    //#region Rift Stability
    drawText(
      `rift stability`,
      this.root.topLeft.x + this.root.size.x - 69,
      this.root.topLeft.y + 8,
      { textAlign: Align.Center });
    drawText(
      `${GameState.riftStability}`.padStart(2, "0") + `/${GameState.riftStabilityMax}`,
      this.root.topLeft.x + this.root.size.x - 69,
      this.root.topLeft.y + 18,
      { textAlign: Align.Center, scale: 4 });
    drawText(
      `current rate: +${~~((GameState.turn - 1) / 5) + 1}`,
      this.root.topLeft.x + this.root.size.x - 69,
      this.root.topLeft.y + 43,
      { textAlign: Align.Center });
    //#endregion Rift Stability

    drawText(`turn ${GameState.turn}`, this.root.topLeft.x + this.root.size.x - 50, this.root.topLeft.y + 187, { scale: 2, textAlign: Align.Center });
    drawText(`${this.phaseText} phase`, this.root.topLeft.x + this.root.size.x - 50, this.root.topLeft.y + 200, { scale: 1, textAlign: Align.Center });

    super.draw(now, delta);

    //#region Money Display
    drawText(`funds`, this.root.topLeft.x + this.root.size.x - 160, this.root.topLeft.y + this.root.size.y / 2 - 18, { textAlign: Align.Center, scale: 2 });
    drawTexture("money_icon", this.root.topLeft.x + this.root.size.x - 198, this.root.topLeft.y + this.root.size.y / 2 - 4, 3, 3);
    drawText(`x`, this.root.topLeft.x + this.root.size.x - 169, this.root.topLeft.y + this.root.size.y / 2 + +3, { scale: 2 });
    drawText(`${(GameState.playerMoney + "").padStart(2, "0")}`, this.root.topLeft.x + this.root.size.x - 156, this.root.topLeft.y + this.root.size.y / 2 + 1, { scale: 3 });
    //#endregion Money Display

    this.playerDeck.draw(now, delta);
    this.encounterDeck.draw(now, delta);

    if (this.phase === GamePhase.Player && GameState.playerMode !== "play") {
      gl.colour(0xFF000000);
      drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y, this.root.size.x, this.root.size.y - 110);
      if (GameState.playerMode === "destroy") {
        drawText(`destroy ${GameState.destroysRequired} more cards`, this.root.topLeft.x + this.root.size.x / 2, this.root.topLeft.y + this.root.size.y / 2, { textAlign: Align.Center, scale: 3 });
      } else {
        drawText(`discard ${GameState.discardsRequired} more cards`, this.root.topLeft.x + this.root.size.x / 2, this.root.topLeft.y + this.root.size.y / 2, { textAlign: Align.Center, scale: 3 });
      }
    }
  }
}
