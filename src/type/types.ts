export enum Suit {
  Hearts = "Hearts",
  Diamonds = "Diamonds",
  Clubs = "Clubs",
  Spades = "Spades",
  Other = "Other",
}

export enum Rank {
  Ace = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Six = 6,
  Seven = 7,
  Eight = 8,
  Nine = 9,
  Ten = 10,
  Jack = 11,
  Queen = 12,
  King = 13,
}

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isFaceUp: boolean;
  columnIndex?: number; // 卡牌所在的列
  rowIndex?: number; // 卡牌在列中的位置
}

export interface DraggingCards {
  cards: Card[];
  sourceColumnIndex: number;
  sourceRowIndex: number;
}

export interface GameState {
  deck: Card[];
  columns: Card[][];
  foundationPiles: Card[][];
  drawPile: Card[];
  selectedCard: Card | null;
  draggingCards: DraggingCards | null;
  moveHistory: GameMove[];
  gameStatus: "playing" | "won" | "paused";
}

export interface GameMove {
  source: {
    type: "column" | "drawPile";
    columnIndex?: number;
    cards: Card[];
  };
  destination: {
    type: "column" | "foundation";
    columnIndex?: number;
    foundationIndex?: number;
  };
  // 新增：记录是否是完成序列的移动
  isSequenceCompletion?: boolean;
  // 新增：如果是完成序列，记录移动到哪个完成区索引
  completedFoundationIndex?: number;
}
