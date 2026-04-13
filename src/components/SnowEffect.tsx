import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Snowflake {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export function SnowEffect() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const count = 50;
    const initialSnowflakes = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    }));
    setSnowflakes(initialSnowflakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {snowflakes.map((snow) => (
        <motion.div
          key={snow.id}
          initial={{ y: -10, x: `${snow.x}%` }}
          animate={{ 
            y: ['0vh', '110vh'],
            x: [`${snow.x}%`, `${snow.x + (Math.random() * 10 - 5)}%`]
          }}
          transition={{
            duration: 10 / snow.speed,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10
          }}
          style={{
            position: 'absolute',
            width: snow.size,
            height: snow.size,
            backgroundColor: 'white',
            borderRadius: '50%',
            opacity: snow.opacity,
            filter: 'blur(1px)',
          }}
        />
      ))}
    </div>
  );
}
