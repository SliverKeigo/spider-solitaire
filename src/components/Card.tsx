// Card.tsx
import React, { useEffect } from "react";
import { Card as CardType } from "../type/types";
import { getCardFileName } from "../utils/cardUtils";
import "../style/Card.css";

// 预加载所有卡牌图片 - 确保路径正确
const cardImages = import.meta.glob("/src/assets/*.svg", { eager: true });

// 开发环境下输出所有可用图片
if (import.meta.env.DEV) {
  console.log("可用卡牌图片:", Object.keys(cardImages));
}

interface CardProps {
  card: CardType;
  index: number;
  isSelected: boolean;
  isValidTarget: boolean;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({
  card,
  index,
  isSelected,
  isValidTarget,
  onClick,
}) => {
  const fileName = getCardFileName(card);
  const fullFileName = `${fileName}.svg`;

  // 构建完整的图片路径 - 确保与import.meta.glob路径保持一致
  const imagePath = `/src/assets/${fullFileName}`;

  // 尝试找到对应的图片
  const cardImageSrc = cardImages[imagePath]
    ? (cardImages[imagePath] as any).default
    : "";

  // 开发环境下打印调试信息
  useEffect(() => {
    if (import.meta.env.DEV && !cardImageSrc) {
      console.warn(`未找到图片: ${imagePath}`);
      console.log("文件名:", fileName);
      console.log("完整路径:", imagePath);
    }
  }, [cardImageSrc, fileName, imagePath]);

  const cardClasses = [
    "card",
    isSelected ? "card-selected" : "",
    isValidTarget ? "card-valid-target" : "",
    !card.isFaceUp ? "card-back" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cardStyle = {
    zIndex: index,
    top: `${index * 30}px`,
  };

  return (
    <div className={cardClasses} style={cardStyle} onClick={onClick}>
      {cardImageSrc ? (
        <img
          src={cardImageSrc}
          alt={card.isFaceUp ? `${card.rank} of ${card.suit}` : "Card back"}
          onError={(e) => {
            console.error(`图片加载失败: ${fullFileName}`);
            // 设置为透明背景或默认图片
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="card-placeholder">
          {card.isFaceUp ? `${card.rank} of ${card.suit}` : "Back"}
        </div>
      )}
    </div>
  );
};

export default Card;
