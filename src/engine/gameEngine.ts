// gameEngine.ts
import { Card, Rank, GameState, GameMove } from "../type/types";
import { createDeck, canPlaceOnTop } from "../utils/cardUtils";

// 初始化游戏
export const initializeGame = (): GameState => {
  const deck = createDeck();
  const columns: Card[][] = Array.from({ length: 10 }, () => []);

  // 按照蜘蛛纸牌规则发牌
  for (let i = 0; i < 4; i++) {
    // 前4行每列都发牌
    for (let col = 0; col < 10; col++) {
      if (deck.length > 0) {
        const card = deck.pop()!;
        card.columnIndex = col;
        card.rowIndex = columns[col].length;
        // 最后一行牌正面朝上
        card.isFaceUp = i === 3;
        columns[col].push(card);
      }
    }
  }

  // 更新牌列中所有卡牌的位置索引
  for (let colIndex = 0; colIndex < columns.length; colIndex++) {
    for (let rowIndex = 0; rowIndex < columns[colIndex].length; rowIndex++) {
      columns[colIndex][rowIndex].columnIndex = colIndex;
      columns[colIndex][rowIndex].rowIndex = rowIndex;
    }
  }

  return {
    deck: [],
    columns,
    foundationPiles: [],
    drawPile: deck,
    selectedCard: null,
    moveHistory: [],
    draggingCards: null,
    gameStatus: "playing",
  };
};

// 从抽牌堆发牌
export const drawCards = (gameState: GameState): GameState => {
  if (gameState.drawPile.length === 0) return gameState;

  const newColumns = [...gameState.columns];
  const newDrawPile = [...gameState.drawPile];

  // 每列发一张牌
  for (let i = 0; i < 10; i++) {
    if (newDrawPile.length > 0) {
      const card = newDrawPile.pop()!;
      card.isFaceUp = true;
      card.columnIndex = i;
      card.rowIndex = newColumns[i].length;
      newColumns[i].push(card);
    }
  }

  return {
    ...gameState,
    columns: newColumns,
    drawPile: newDrawPile,
    selectedCard: null,
    draggingCards: null,
  };
};

// 移动卡牌
export const moveCards = (
  gameState: GameState,
  sourceColumnIndex: number,
  sourceRowIndex: number,
  targetColumnIndex: number,
): GameState => {
  if (sourceColumnIndex === targetColumnIndex) return gameState;

  const newColumns = JSON.parse(JSON.stringify(gameState.columns));
  const sourceColumn = newColumns[sourceColumnIndex];
  const targetColumn = newColumns[targetColumnIndex];

  // 检查目标列是否为空或者可以放置
  const canMove =
    targetColumn.length === 0 ||
    canPlaceOnTop(
      sourceColumn[sourceRowIndex],
      targetColumn[targetColumn.length - 1],
    );

  if (!canMove) return gameState;

  // 获取要移动的卡牌
  const cardsToMove = sourceColumn.splice(sourceRowIndex);

  // 记录移动前的状态用于撤销
  const moveRecord: GameMove = {
    source: {
      type: "column",
      columnIndex: sourceColumnIndex,
      cards: [...cardsToMove], // 深拷贝防止引用问题
    },
    destination: {
      type: "column",
      columnIndex: targetColumnIndex,
    },
  };

  // 将卡牌添加到目标列
  targetColumn.push(...cardsToMove);

  // 更新卡牌的列索引和行索引
  for (let i = 0; i < targetColumn.length; i++) {
    targetColumn[i].columnIndex = targetColumnIndex;
    targetColumn[i].rowIndex = i;
  }

  // 如果源列有剩余卡牌且最后一张是背面朝上，则翻转它
  if (
    sourceColumn.length > 0 &&
    !sourceColumn[sourceColumn.length - 1].isFaceUp
  ) {
    sourceColumn[sourceColumn.length - 1].isFaceUp = true;
  }

  // 检查是否完成了一组花色序列
  const newGameState = {
    ...gameState,
    columns: newColumns,
    moveHistory: [...gameState.moveHistory, moveRecord],
    selectedCard: null,
    draggingCards: null,
  };

  console.log("---------");

  return checkForCompletedSequences(newGameState);
};

export const checkForCompletedSequences = (gameState: GameState): GameState => {
  const newGameState = { ...gameState };
  const newColumns = [...newGameState.columns];
  const newFoundationPiles = [...newGameState.foundationPiles];
  const newMoveHistory = [...newGameState.moveHistory];

  let foundSequence = false;

  // 检查每一列
  for (let colIndex = 0; colIndex < newColumns.length; colIndex++) {
    const column = newColumns[colIndex];

    // 列必须至少有13张牌才可能形成完整序列
    if (column.length >= 13) {
      // 从最后一张牌开始向上检查是否有完整序列
      let endIndex = column.length - 1;

      // 确保最后一张是A（1）
      if (column[endIndex].rank === Rank.Ace) {
        let isSequence = true;

        // 检查从A向上的13张牌是否按照正确的顺序排列
        for (let i = 0; i < 13; i++) {
          const cardIndex = endIndex - i;
          const card = column[cardIndex];

          // 确保卡牌存在且顺序正确（从A到K）
          if (!card || card.rank !== i + 1) {
            isSequence = false;
            break;
          }
        }

        if (isSequence) {
          foundSequence = true;
          // 移除这13张牌（从K开始的索引到A的索引）
          const startIndex = endIndex - 12; // A是endIndex，K是endIndex-12
          const completedSequence = column.splice(startIndex, 13);

          // 记录这个移动到历史中
          const sequenceMove: GameMove = {
            source: {
              type: "column",
              columnIndex: colIndex,
              cards: [...completedSequence], // 深拷贝防止引用问题
            },
            destination: {
              type: "foundation",
              foundationIndex: newFoundationPiles.length, // 移动到新的完成区
            },
            isSequenceCompletion: true,
            completedFoundationIndex: newFoundationPiles.length,
          };

          newMoveHistory.push(sequenceMove);

          // 添加到完成区
          newFoundationPiles.push(completedSequence);

          // 如果列中还有牌且最后一张是背面朝上，则翻转它
          if (column.length > 0 && !column[column.length - 1].isFaceUp) {
            column[column.length - 1].isFaceUp = true;
          }

          // 更新列中剩余卡牌的索引
          for (let i = 0; i < column.length; i++) {
            column[i].rowIndex = i;
          }

          console.log(`在列 ${colIndex} 找到并移除了完整序列`);
        }
      }
    }
  }

  // 检查游戏是否胜利
  let gameStatus = newGameState.gameStatus;
  if (newFoundationPiles.length === 8) {
    gameStatus = "won";
  }

  // 如果找到了序列，递归检查是否还有更多序列
  if (foundSequence) {
    return checkForCompletedSequences({
      ...newGameState,
      columns: newColumns,
      foundationPiles: newFoundationPiles,
      moveHistory: newMoveHistory,
      gameStatus,
    });
  }

  return {
    ...newGameState,
    columns: newColumns,
    foundationPiles: newFoundationPiles,
    moveHistory: newMoveHistory,
    gameStatus,
  };
};

// 撤销上一步移动
export const undoMove = (gameState: GameState): GameState => {
  if (gameState.moveHistory.length === 0) return gameState;

  const newGameState = { ...gameState };
  const lastMove =
    newGameState.moveHistory[newGameState.moveHistory.length - 1];
  const newColumns = JSON.parse(JSON.stringify(newGameState.columns));
  const newFoundationPiles = JSON.parse(
    JSON.stringify(newGameState.foundationPiles),
  );

  // 处理从列到列的移动撤销
  if (
    lastMove.source.type === "column" &&
    lastMove.destination.type === "column"
  ) {
    const sourceColumnIndex = lastMove.source.columnIndex!;
    const destColumnIndex = lastMove.destination.columnIndex!;
    const sourceColumn = newColumns[sourceColumnIndex];
    const destColumn = newColumns[destColumnIndex];

    // 确定要移回的卡牌数量
    const numCardsToMove = lastMove.source.cards.length;

    // 从目标列拿出卡牌
    const cardsToMoveBack = destColumn.splice(
      destColumn.length - numCardsToMove,
    );

    // 将卡牌放回源列
    sourceColumn.push(...cardsToMoveBack);

    // 更新卡牌的列索引和行索引
    for (let i = 0; i < sourceColumn.length; i++) {
      sourceColumn[i].columnIndex = sourceColumnIndex;
      sourceColumn[i].rowIndex = i;
    }

    for (let i = 0; i < destColumn.length; i++) {
      destColumn[i].columnIndex = destColumnIndex;
      destColumn[i].rowIndex = i;
    }
  }
  // 处理从列到完成区的移动撤销（即完成序列的撤销）
  else if (
    lastMove.source.type === "column" &&
    lastMove.destination.type === "foundation"
  ) {
    const sourceColumnIndex = lastMove.source.columnIndex!;
    const foundationIndex = lastMove.completedFoundationIndex!;

    // 检查完成区是否存在
    if (foundationIndex < newFoundationPiles.length) {
      // 从完成区拿出卡牌
      const cardsToMoveBack = newFoundationPiles.splice(foundationIndex, 1)[0];

      // 将卡牌放回源列
      newColumns[sourceColumnIndex].push(...cardsToMoveBack);

      // 更新卡牌的列索引和行索引
      for (let i = 0; i < newColumns[sourceColumnIndex].length; i++) {
        newColumns[sourceColumnIndex][i].columnIndex = sourceColumnIndex;
        newColumns[sourceColumnIndex][i].rowIndex = i;
      }

      // 可能需要将最后一张牌翻回背面，取决于游戏规则
      // 这里假设我们不需要翻回
    }
  }

  // 移除最后一步移动记录
  newGameState.moveHistory.pop();

  return {
    ...newGameState,
    columns: newColumns,
    foundationPiles: newFoundationPiles,
    selectedCard: null,
    draggingCards: null,
  };
};
