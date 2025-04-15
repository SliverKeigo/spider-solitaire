// cardUtils.ts
import { Card, Suit, Rank } from "../type/types";

// 生成唯一ID
export const generateCardId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// 创建一副全新的牌
export const createDeck = (numDecks: number = 2): Card[] => {
  const deck: Card[] = [];
  const suits = [Suit.Hearts, Suit.Diamonds, Suit.Clubs, Suit.Spades];

  for (let deckNum = 0; deckNum < numDecks; deckNum++) {
    for (const suit of suits) {
      for (let rank = Rank.Ace; rank <= Rank.King; rank++) {
        deck.push({
          id: generateCardId(),
          suit,
          rank,
          isFaceUp: false,
        });
      }
    }
  }

  return shuffleDeck(deck);
};

// 洗牌
export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

// 检查卡牌是否可以放在目标卡牌上面
export const canPlaceOnTop = (source: Card, target: Card): boolean => {
  // 在蜘蛛纸牌中，你可以把一张牌放在任何比它大1的牌上面，不考虑花色
  return source.rank === target.rank - 1;
};

export const getCardFileName = (card: Card): string => {
  if (!card.isFaceUp) {
    // 牌背图片 - 使用蓝色牌背
    return "Suit=Other, Number=Back Blue";
  }

  // 正面牌的文件名
  return `Suit=${card.suit}, Number=${card.rank}`;
};
