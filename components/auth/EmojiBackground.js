import React, { useState, useEffect } from'react';
import './EmojiBackground.css';


const EmojiBackground = () => {
  const [emojis, setEmojis] = useState([
    { emoji: '👌', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '👍', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '👎', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '🤟', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '🤙', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '💪', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '✍️', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '👀', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '🤝', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '🤲', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '👌', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '👍', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '👎', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '🤟', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '🤙', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '💪', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '✍️', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '👀', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '🤝', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
    { emoji: '🤲', left: Math.random() * 100, top: Math.random() * 100, scale: Math.random() * 0.5 + 0.5, dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 },
  ]); 

  useEffect(() => {
    const intervalId = setInterval(() => {
      setEmojis(emojis.map(emoji => {
        const newLeft = emoji.left + emoji.dx * 0.2;
        const newTop = emoji.top + emoji.dy * 0.2;

        if (newLeft < 0 || newLeft > 99) {
          emoji.dx = -emoji.dx;
        }
        if (newTop < 0 || newTop > 99) {
          emoji.dy = -emoji.dy;
        }

        return {
         ...emoji,
          left: newLeft,
          top: newTop,
          scale: emoji.scale + (Math.random() * 2 - 1) * 0.015,
        };
      }));
    }, 1000 / 30); // анимация 120 раз в секунду

    return () => clearInterval(intervalId);
  }, [emojis]);

  const handleEmojiClick = (index) => {
    setEmojis(emojis.filter((emoji, i) => i!== index));
  };

  return (
    <div className="emoji-background">
      {emojis.map((emoji, index) => (
        <div
          key={index}
          className="emoji"
          style={{
            left: `${emoji.left}%`,
            top: `${emoji.top}%`,
            transform: `scale(${emoji.scale})`,
            zIndex: index,
          }}
          onClick={() => handleEmojiClick(index)}
        >
          {emoji.emoji}
        </div>
      ))}
    </div>
  );
};

export default EmojiBackground;