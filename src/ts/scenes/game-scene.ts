import { Align, drawText, drawTexture } from "../core/draw";
import { ENCOUNTER_CARD_CACHE, EncounterCard, EncounterCardData } from "../encounter-cards";
import { GameState, drawFromEncounterDeck, drawFromPlayerDeck } from "../game-state";
import { PlayerDiscardPileNode, toBeDiscarded } from "../scene-nodes/player-discard-pile-node";
import { buttonHover, buttonMouseUp, cardFwip } from "../core/zzfx";

import { Builder } from "../core/builder";
import { ButtonNode } from "../scene-nodes/button-node";
import { Easing } from "../core/interpolation";
import { EncounterDeckNode } from "../scene-nodes/encounter-deck-node";
import { EncountersActiveNode } from "../scene-nodes/encounters-active-node";
import { GameOverSceneName } from "./game-over-scene";
import { HelpSceneName } from "./help-scene";
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

enum GamePhase
{
  Pregame,
  Begin,
  Draw,
  Player,
  Rift,
  Discard,
  End,
  GameOver
}

export const GameSceneName: string = "Game";
export class GameScene extends Scene
{
  private phase: GamePhase = GamePhase.Pregame;
  private phases: Map<GamePhase, string> = new Map([
    [GamePhase.Begin, "Begin"],
    [GamePhase.Draw, "Draw"],
    [GamePhase.Player, "Player"],
    [GamePhase.Rift, "Rift"],
    [GamePhase.Discard, "Discard"],
    [GamePhase.End, "End"],
  ]);
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
  private helpButton: ButtonNode;

  private tempActiveEncounters: EncounterCard[] = [];
  private phaseText: string = "";
  private awaitingPhase: boolean = false;

  constructor()
  {
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
        .with("onMouseUp", () =>
        {
          buttonMouseUp();
          if (this.phase === GamePhase.Player && GameState.playerMode === "play")
          {
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
        .with("onHover", () =>
        {
          buttonHover();
          emit("refresh_store_tooltip", true);
        })
        .with("onBlur", () =>
        {
          emit("refresh_store_tooltip", false);
        })
        .with("onMouseUp", () =>
        {
          buttonMouseUp();
          if (this.phase === GamePhase.Player && GameState.playerMode === "play" && GameState.playerMoney > 0)
          {
            GameState.playerMoney -= 1;
            for (let i: number = 0, len: number = GameState.storeActive.length; i < len; i++)
            {
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
        .with("onHover", () =>
        {
          buttonHover();
          emit("upgrade_store_tooltip", true);
        })
        .with("onBlur", () =>
        {
          emit("upgrade_store_tooltip", false);
        })
        .with("onMouseUp", () =>
        {
          buttonMouseUp();
          if (this.phase === GamePhase.Player && GameState.playerMode === "play" && GameState.playerMoney > 0)
          {
            GameState.playerMoney -= 1;
            for (const card of GameState.storeActive)
            {
              card.levelUp();
            }
          }
        })
        .build();
    this.upgradeStoreButton.moveTo({ x: this.root.topLeft.x + 207, y: this.root.size.y / 2 + 2 });
    this.root.add(this.upgradeStoreButton);

    this.helpButton =
      new Builder(ButtonNode)
        .with("size", { x: 60, y: 16 })
        .with("colour", 0xFF448844)
        .with("text", "help!")
        .with("textScale", 1)
        .with("onMouseUp", () =>
        {
          buttonMouseUp();
          if (this.phase === GamePhase.Player && GameState.playerMode === "play")
          {
            SceneManager.push(HelpSceneName);
          }
        })
        .build();
    this.helpButton.moveTo({ x: this.root.size.x - 80, y: this.root.size.y - 17 });
    this.root.add(this.helpButton);
  }
  public transitionIn(): Promise<any>
  {
    return this.root.moveTo({ x: 0, y: this.root.size.y }).then(() =>
    {
      return this.root.moveTo({ x: 0, y: 0 }, 500, Easing.easeOutQuad).then(() =>
      {
        if (this.phase === GamePhase.Pregame || this.phase === GamePhase.GameOver)
        {
          this.phase = GamePhase.Begin;
        }
        return super.transitionIn();
      });
    });
  }
  public transitionOut(): Promise<any>
  {
    super.transitionOut();
    return this.root.moveTo({ x: 0, y: this.root.size.y }, 500, Easing.easeOutQuad);
  }

  public update(now: number, delta: number): void
  {
    // Keep the store at 5 cards, if possible
    if (GameState.storeActive.length < 5)
    {
      if (GameState.storeDeck.length === 0)
      {
        if (GameState.storeDiscard.length > 0)
        {
          GameState.storeDeck = rand.shuffle(GameState.storeDiscard);
          GameState.storeDiscard.length = 0;
          cardFwip();
        }
      } else
      {
        GameState.storeActive.push(GameState.storeDeck.pop());
        cardFwip();
      }
    }

    // Make button looks diabled / enabled
    if (this.phase === GamePhase.Player && GameState.playerMode === "play")
    {
      this.endTurnButton.colour = 0xFF448844;
      this.helpButton.colour = 0xFF448844;
      if (GameState.playerMoney < 1)
      {
        this.clearStoreButton.colour = 0xFF2d2d2d;
        this.upgradeStoreButton.colour = 0xFF2d2d2d;
      } else
      {
        this.clearStoreButton.colour = 0xFF4444CC;
        this.upgradeStoreButton.colour = 0xFF448844;
      }
    } else
    {
      this.endTurnButton.colour = 0xFF2d2d2d;
      this.clearStoreButton.colour = 0xFF2d2d2d;
      this.upgradeStoreButton.colour = 0xFF2d2d2d;
      this.helpButton.colour = 0xFF2d2d2d;
    }

    switch (this.phase)
    {
      case GamePhase.Pregame:
        break;
      case GamePhase.Begin:
        //#region Begin Phase
        if (this.awaitingPhase)
        {
          break;
        }
        if (GameState.playerPermanents.length > 0)
        {
          // If the are permanents to play...
          if (!GameState.playerPermanentPlaying)
          {
            if (GameState.playerPermanentPlayingIndex < GameState.playerPermanents.length)
            {
              // if one isn't in play, grab the next one
              GameState.playerPermanentPlaying = GameState.playerPermanents[GameState.playerPermanentPlayingIndex];
              GameState.playerPermanentPlayingIndex++;
            } else
            {
              // if we hit the end of the permanents in play, time to move on
              GameState.playerPermanentPlayingIndex = 0;
              this.delay(() =>
              {
                GameState.turn++;
                this.phase = GamePhase.Draw;
                this.phaseText = "draw";
                this.awaitingPhase = false;
              }, 300);
              this.awaitingPhase = true;
            }
          }
        } else
        {
          this.delay(() =>
          {
            GameState.turn++;
            this.phase = GamePhase.Draw;
            this.phaseText = "draw";
            this.awaitingPhase = false;
          }, 300);
          this.awaitingPhase = true;
        }
        break;
      //#endregion Begin Phase
      case GamePhase.Draw:
        //#region Draw Phase
        if (this.awaitingPhase)
        {
          break;
        }
        if (GameState.encountersActive.length > 10
          || (GameState.encountersActive.length === 10 && GameState.encounterDeck.length > 0))
        {
          GameState.gameOverReason = "overrun";
          SceneManager.push(GameOverSceneName); // LOSE - OVERRUN
          this.phase = GamePhase.GameOver;
          break;
        } else
        {
          if (GameState.riftStability >= GameState.riftStabilityMax)
          {
            if (GameState.encounterDeck.length > 0)
            {
              // DRAW ALL REMAINING ENCOUNTER CARDS
              while (GameState.encounterDeck.length > 0)
              {
                drawFromEncounterDeck();
                if (GameState.encountersActive.length >= 10 && GameState.encounterDeck.length > 0)
                {
                  GameState.gameOverReason = "overrun";
                  SceneManager.push(GameOverSceneName); // LOSE - OVERRUN
                  this.phase = GamePhase.GameOver;
                  break;
                }
              }
            } else
            {
              // summon rift horror
              const cardData: EncounterCardData = ENCOUNTER_CARD_CACHE.get("rift horror");
              const card: EncounterCard = new EncounterCard(cardData);
              GameState.encountersActive.push(card);
            }
          } else
          {
            drawFromEncounterDeck();
          }
          for (let i: number = 0; i < 6; i++)
          {
            drawFromPlayerDeck();
          }
        }
        if (!this.awaitingPhase && this.phase === GamePhase.Draw)
        {
          this.delay(() =>
          {
            this.phase = GamePhase.Player;
            this.phaseText = "player";
            this.awaitingPhase = false;
          }, 750);
          this.awaitingPhase = true;
        }
        break;
      //#endregion Draw Phase
      case GamePhase.Player:
        //#region Player Phase
        if (GameState.playerMode === "discard" && GameState.discardsRequired <= 0)
        {
          GameState.playerMode = "play";
        }
        if (GameState.playerMode === "destroy" && GameState.destroysRequired <= 0)
        {
          GameState.playerMode = "play";
        }
        if (GameState.encounterDeck.length === 0 && GameState.encountersActive.length === 0)
        {
          GameState.gameOverReason = "clear";
          SceneManager.push(GameOverSceneName); // WIN - STANDARD
          this.phase = GamePhase.GameOver;
          break;
        }
        if (GameState.stitchCounter >= 10)
        {
          GameState.gameOverReason = "stitch";
          SceneManager.push(GameOverSceneName); // WIN - Rift stitched closed
          this.phase = GamePhase.GameOver;
          break;
        }
        if (GameState.oldOnesFavourCounter >= 10)
        {
          GameState.gameOverReason = "oldOne";
          SceneManager.push(GameOverSceneName); // WIN - Old One Summoned
          this.phase = GamePhase.GameOver;
          break;
        }
        break;
      //#endregion Player Phase
      case GamePhase.Rift:
        //#region Rift Phase
        if (this.awaitingPhase)
        {
          break;
        }

        if (GameState.encountersActive.length === 0)
        {
          GameState.riftStability += ~~((GameState.turn - 1) / 5) + 1;
          if (GameState.riftStability > GameState.riftStabilityMax)
          {
            GameState.riftStability = GameState.riftStabilityMax;
          }
          this.delay(() =>
          {
            this.phase = GamePhase.Discard;
            this.phaseText = "discard";
            this.awaitingPhase = false;
          }, 300);
          this.awaitingPhase = true;
          break;
        }

        if (this.tempActiveEncounters.length === 0)
        {
          this.tempActiveEncounters = [...GameState.encountersActive];
        }

        if (!GameState.encounterPlaying)
        {
          if (GameState.encounterPlayingIndex < this.tempActiveEncounters.length)
          {
            GameState.encounterPlaying = this.tempActiveEncounters[GameState.encounterPlayingIndex];
            GameState.encounterPlayingIndex++;
          } else
          {
            GameState.encounterPlayingIndex = 0;
            this.tempActiveEncounters.length = 0;
            GameState.riftStability += ~~((GameState.turn - 1) / 5) + 1;
            if (GameState.riftStability > GameState.riftStabilityMax)
            {
              GameState.riftStability = GameState.riftStabilityMax;
            }
            this.delay(() =>
            {
              this.phase = GamePhase.Discard;
              this.phaseText = "discard";
              this.awaitingPhase = false;
            }, 300);
            this.awaitingPhase = true;
          }
        }
        break;
      //#endregion Rift Phase
      case GamePhase.Discard:
        //#region Discard Phase
        GameState.playerMoney = 0;
        while (GameState.playerHand.length > 0)
        {
          const card: PlayerCard = GameState.playerHand.pop();
          emit("card_discarded", card);
        }
        if (toBeDiscarded.length === 0)
        {
          if (!this.awaitingPhase)
          {
            this.delay(() =>
            {
              this.phase = GamePhase.End;
              this.phaseText = "end";
              this.awaitingPhase = false;
            }, 300);
            this.awaitingPhase = true;
          }
        }
        break;
      //#endregion Discard Phase
      case GamePhase.End:
        //#region End Phase
        if (!this.awaitingPhase)
        {
          this.delay(() =>
          {
            this.phase = GamePhase.Begin;
            this.phaseText = "begin";
            this.awaitingPhase = false;
          }, 300);
          this.awaitingPhase = true;
        }
        break;
      //#endregion End Phase
      default:
    }
    super.update(now, delta);
  }

  public draw(now: number, delta: number): void
  {
    gl.colour(0x33000000);
    drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y, this.root.size.x, 51);
    drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y + this.root.size.y - 110, this.root.size.x, 110);
    drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y + this.root.size.y / 2 - 25, this.root.size.x, 50);
    gl.colour(0xFFFFFFFF);

    //#region Rift Stability
    drawText(
      `Rift Stability`,
      this.root.topLeft.x + this.root.size.x - 69,
      this.root.topLeft.y + 6,
      { textAlign: Align.Center, font: "gb" });

    let colour: number = 0xFFCCFFCC;
    if (GameState.riftStability / GameState.riftStabilityMax >= 0.75)
    {
      colour = 0xFFCCCCFF;
    } else if (GameState.riftStability / GameState.riftStabilityMax >= 0.50)
    {
      colour = 0xFFCCFFFF;
    }

    drawText(
      `${ GameState.riftStability }`.padStart(2, "0") + `/${ GameState.riftStabilityMax }`,
      this.root.topLeft.x + this.root.size.x - 69,
      this.root.topLeft.y + 16,
      { textAlign: Align.Center, scale: 3, colour, font: "gb" });

    drawText(
      `Stab. Rate: +${ ~~((GameState.turn - 1) / 5) + 1 }`,
      this.root.topLeft.x + this.root.size.x - 69,
      this.root.topLeft.y + 41,
      { textAlign: Align.Center, font: "gb", colour: 0xCCEEEEEE });
    //#endregion Rift Stability

    let i: number = 0;
    for (const [phase, text] of this.phases)
    {
      if (this.phase === phase)
      {
        gl.colour(0xFF448844);
      } else
      {
        gl.colour(0xFF202020);
      }
      drawTexture("solid", this.root.topLeft.x + this.root.size.x - 92, this.root.topLeft.y + this.root.size.y - 105 + (i * 10) - 2, 85, 9);
      drawText(`${ text } phase`, this.root.topLeft.x + this.root.size.x - 50, this.root.topLeft.y + this.root.size.y - 105 + (i * 10), { colour: 0xFFEEEEEE, textAlign: Align.Center });
      i++;
    }

    drawText(`turn ${ GameState.turn }`, this.root.topLeft.x + this.root.size.x - 50, this.root.topLeft.y + this.root.size.y - 38, { scale: 2, textAlign: Align.Center });

    super.draw(now, delta);

    //#region Money Display
    drawText(`Funding`, this.root.topLeft.x + this.root.size.x - 160, this.root.topLeft.y + this.root.size.y / 2 - 18, { textAlign: Align.Center, scale: 1, font: "gb" });
    drawTexture("money_icon", this.root.topLeft.x + this.root.size.x - 198, this.root.topLeft.y + this.root.size.y / 2 - 4, 3, 3);
    drawText(`X`, this.root.topLeft.x + this.root.size.x - 167, this.root.topLeft.y + this.root.size.y / 2 + 6, { scale: 1, font: "gb" });
    drawText(`${ (GameState.playerMoney + "").padStart(2, "0") }`, this.root.topLeft.x + this.root.size.x - 155, this.root.topLeft.y + this.root.size.y / 2 + 1, { scale: 2, font: "gb" });
    //#endregion Money Display

    this.playerDeck.draw(now, delta);
    this.encounterDeck.draw(now, delta);

    if (this.phase === GamePhase.Player && GameState.playerMode !== "play")
    {
      gl.colour(0x88000000);
      drawTexture("solid", this.root.topLeft.x, this.root.topLeft.y, this.root.size.x, this.root.size.y - 110);
      if (GameState.playerMode === "destroy")
      {
        drawText(`destroy ${ GameState.destroysRequired } more cards`, this.root.topLeft.x + this.root.size.x / 2, this.root.topLeft.y + this.root.size.y / 2, { textAlign: Align.Center, scale: 3 });
      } else
      {
        drawText(`discard ${ GameState.discardsRequired } more cards`, this.root.topLeft.x + this.root.size.x / 2, this.root.topLeft.y + this.root.size.y / 2, { textAlign: Align.Center, scale: 3 });
      }
    }
  }
}
