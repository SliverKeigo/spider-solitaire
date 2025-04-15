// DraggableCard.tsx
import React, { useEffect, useRef } from "react";
import { Card as CardType } from "../type/types";
import { getCardFileName } from "../utils/cardUtils";
import "../style/Card.css";

interface DraggableCardProps {
  card: CardType;
  index: number;
  isSelected: boolean;
  isValidTarget: boolean;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, card: CardType) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, card: CardType) => void;
  onClick: (card: CardType) => void;
}

// 预加载所有卡牌图片
const cardImages = import.meta.glob("/src/assets/*.svg", { eager: true });

const DraggableCard: React.FC<DraggableCardProps> = ({
  card,
  index,
  isSelected,
  isValidTarget,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // 构建图片路径
  const fileName = getCardFileName(card);
  const imagePath = `/src/assets/${fileName}.svg`;

  // 获取图片URL
  const cardImageSrc = cardImages[imagePath]
    ? (cardImages[imagePath] as any).default
    : "";

  const cardClasses = [
    "card",
    isSelected ? "card-selected" : "",
    isValidTarget ? "card-valid-target" : "",
    !card.isFaceUp ? "card-back" : "",
    isDragging ? "card-dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cardStyle = {
    zIndex: index,
    top: `${index * 30}px`, // 卡牌堆叠效果
    opacity: isDragging ? 0.5 : 1,
  };

  // 只有正面朝上的卡牌才能拖动
  const draggable = card.isFaceUp;

  useEffect(() => {
    if (cardRef.current) {
      const offset = card.rowIndex === undefined ? 0 : card.isFaceUp ? 20 : 10; // 正面朝上的卡牌显示更多

      cardRef.current.style.setProperty("--card-offset", `${offset}px`);
    }
  }, [card.rowIndex, card.isFaceUp]);

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      style={cardStyle}
      draggable={draggable}
      onDragStart={(e) => draggable && onDragStart(e, card)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, card)}
      onClick={() => onClick(card)}
      data-card-id={card.id}
    >
      {cardImageSrc ? (
        <img
          src={cardImageSrc}
          alt={card.isFaceUp ? `${card.rank} of ${card.suit}` : "Card back"}
          draggable={false} // 防止图片本身被拖动
        />
      ) : (
        <div className="card-placeholder">
          {card.isFaceUp ? `${card.rank} of ${card.suit}` : "Back"}
        </div>
      )}
    </div>
  );
};

export default DraggableCard;
