// App.tsx
import React, { useState, useEffect } from "react";
import "./App.css";
import DraggableCard from "./components/DraggableCard";
import { Card as CardType, GameState } from "./type/types";
import { canPlaceOnTop } from "./utils/cardUtils";
import {
  initializeGame,
  drawCards,
  moveCards,
  undoMove,
} from "./engine/gameEngine";

const App: React.FC = () => {
  // 游戏状态
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);

  // 初始化游戏
  const startNewGame = () => {
    const initialGameState = initializeGame();
    setGameState(initialGameState);
    setIsGameStarted(true);
  };

  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // 处理缩放变化
  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
  };

  // 处理卡牌点击
  const handleCardClick = (card: CardType) => {
    if (!gameState || !card.isFaceUp) return;

    // 如果已经选中了一张卡牌
    if (gameState.selectedCard) {
      // 如果点击的是同一张卡牌，取消选择
      if (gameState.selectedCard.id === card.id) {
        setGameState({
          ...gameState,
          selectedCard: null,
        });
        return;
      }

      // 检查是否可以移动
      if (
        card.columnIndex !== undefined &&
        gameState.selectedCard.columnIndex !== undefined
      ) {
        // 如果点击的是列中最后一张牌，尝试移动
        const column = gameState.columns[card.columnIndex];
        if (card.rowIndex === column.length - 1) {
          if (canPlaceOnTop(gameState.selectedCard, card)) {
            const newGameState = moveCards(
              gameState,
              gameState.selectedCard.columnIndex,
              gameState.selectedCard.rowIndex!,
              card.columnIndex,
            );
            setGameState(newGameState);
            return;
          }
        }
      }

      // 选择新卡牌
      setGameState({
        ...gameState,
        selectedCard: card,
      });
    } else {
      // 选择卡牌
      setGameState({
        ...gameState,
        selectedCard: card,
      });
    }
  };

  // 处理拖拽开始
  const handleDragStart = (e: React.DragEvent, card: CardType) => {
    if (!gameState || !card.isFaceUp || card.columnIndex === undefined) return;

    // 设置拖拽数据
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        cardId: card.id,
        columnIndex: card.columnIndex,
        rowIndex: card.rowIndex,
      }),
    );

    // 获取拖拽的所有卡牌
    const column = gameState.columns[card.columnIndex];
    const startIndex = card.rowIndex!;
    const cardsToDrag = column.slice(startIndex);

    setGameState({
      ...gameState,
      draggingCards: {
        cards: cardsToDrag,
        sourceColumnIndex: card.columnIndex,
        sourceRowIndex: startIndex,
      },
    });
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    if (!gameState) return;

    setGameState({
      ...gameState,
      draggingCards: null,
    });

    setDragOverColumn(null);
  };

  // 处理拖拽经过
  const handleDragOver = (e: React.DragEvent, columnIndex: number) => {
    e.preventDefault(); // 必须阻止默认行为以允许放置

    setDragOverColumn(columnIndex);
  };

  // 处理放置
  const handleDrop = (e: React.DragEvent, columnIndex: number) => {
    e.preventDefault();

    if (!gameState || !gameState.draggingCards) return;

    const { sourceColumnIndex, sourceRowIndex } = gameState.draggingCards;

    // 如果源列和目标列相同，不执行任何操作
    if (sourceColumnIndex === columnIndex) {
      setDragOverColumn(null);
      return;
    }

    // 获取目标列
    const targetColumn = gameState.columns[columnIndex];

    // 检查是否可以放置
    const canDrop =
      targetColumn.length === 0 ||
      canPlaceOnTop(
        gameState.columns[sourceColumnIndex][sourceRowIndex],
        targetColumn[targetColumn.length - 1],
      );

    if (canDrop) {
      const newGameState = moveCards(
        gameState,
        sourceColumnIndex,
        sourceRowIndex,
        columnIndex,
      );

      setGameState(newGameState);
    }

    setDragOverColumn(null);
  };

  // 处理发牌
  const handleDrawCards = () => {
    if (!gameState) return;

    const newGameState = drawCards(gameState);
    setGameState(newGameState);
  };

  // 处理撤销
  const handleUndo = () => {
    if (!gameState) return;

    const newGameState = undoMove(gameState);
    setGameState(newGameState);
  };

  // 渲染游戏列
  const renderColumns = () => {
    if (!gameState) return null;

    return (
      <div className="columns-container">
        {gameState.columns.map((column, colIndex) => {
          const isDropTarget = dragOverColumn === colIndex;

          return (
            <div
              key={`column-${colIndex}`}
              className={`column ${isDropTarget ? "column-drop-target" : ""} ${column.length === 0 ? "column-empty" : ""}`}
              onDragOver={(e) => handleDragOver(e, colIndex)}
              onDrop={(e) => handleDrop(e, colIndex)}
            >
              {column.map((card, cardIndex) => {
                // 判断这张卡牌是否正在被拖动
                const isDragging =
                  gameState.draggingCards !== null &&
                  card.columnIndex ===
                    gameState.draggingCards.sourceColumnIndex &&
                  card.rowIndex! >= gameState.draggingCards.sourceRowIndex;

                return (
                  <DraggableCard
                    key={card.id}
                    card={card}
                    index={cardIndex}
                    isSelected={gameState.selectedCard?.id === card.id}
                    isValidTarget={
                      gameState.selectedCard !== null &&
                      gameState.selectedCard.id !== card.id &&
                      card.isFaceUp &&
                      cardIndex === column.length - 1 &&
                      canPlaceOnTop(gameState.selectedCard, card)
                    }
                    isDragging={isDragging}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                    onClick={handleCardClick}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // 显示胜利消息
  useEffect(() => {
    if (gameState?.gameStatus === "won") {
      setTimeout(() => {
        alert("恭喜！你赢了！");
      }, 500);
    }
  }, [gameState?.gameStatus]);

  return (
    <div className="spider-solitaire-app">
      <div className="game-background">
        <header className="game-header">
          <h1>蜘蛛纸牌</h1>
          {!isGameStarted ? (
            <button className="start-button" onClick={startNewGame}>
              开始游戏
            </button>
          ) : (
            <div className="game-info">
              <span>抽牌堆: {gameState?.drawPile.length || 0}</span>
              <span>完成区: {gameState?.foundationPiles.length || 0}/8</span>
              <span>步数: {gameState?.moveHistory.length || 0}</span>
            </div>
          )}
        </header>

        {isGameStarted && gameState && (
          <div className="game-table">
            <div className="zoom-controls">
              <button
                onClick={() => handleZoomChange(Math.max(0.5, zoomLevel - 0.1))}
              >
                -
              </button>
              <span>{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => handleZoomChange(Math.min(1.5, zoomLevel + 0.1))}
              >
                +
              </button>
            </div>
            <div
              className="card-area"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
              }}
            >
              {renderColumns()}
            </div>

            <div className="control-area">
              <button
                className="control-button"
                onClick={() => {
                  setIsGameStarted(false);
                  setGameState(null);
                }}
              >
                新游戏
              </button>
              <button
                className="control-button"
                onClick={handleUndo}
                disabled={!gameState || gameState.moveHistory.length === 0}
              >
                撤销
              </button>
              <button
                className="control-button"
                onClick={handleDrawCards}
                disabled={!gameState || gameState.drawPile.length === 0}
              >
                发牌
              </button>
              <button className="control-button" onClick={startNewGame}>
                重新开始
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="game-footer">
        <p>© 2025 蜘蛛纸牌游戏</p>
      </footer>
    </div>
  );
};

export default App;
