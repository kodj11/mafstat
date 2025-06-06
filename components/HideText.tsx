'use client'

import styles from '@/css/page.module.scss'
import { useState } from 'react';  
import { motion } from 'framer-motion';
import useMousePosition from '@/components/useMousePosition';

export default function Hide() {

  const [isHovered, setIsHovered] = useState(false);
  let { x, y } = useMousePosition();
  const size = isHovered ? 400 : 40;
  if (!x) {
    x = 0;
  }
  if (!y) {
    y = 0;
  }
  return (
    <main className={styles.main}>
      <motion.div 
        className={styles.mask}
        animate={{
          WebkitMaskPosition: `${x - (size/0.75)}px ${y - (size/1.3)}px`,
          WebkitMaskSize: `${size}px`,
        }}
        transition={{ type: "tween", ease: "backOut", duration:0.5}}
      >
          <p onMouseEnter={() => {setIsHovered(true)}} onMouseLeave={() => {setIsHovered(false)}}>
            В общем, это правильные мысли, но скорее всего мнение у вас поменяется, после того как вы узнаете такие термины как: "Неблагодарный красный", "3 в 3", "Слом" и многое другое.
          </p>
      </motion.div>

      <div className={styles.body}>
        <p>В целом играть в <span>мафию</span> весело и интересно. Каждая игра непохожа на другую, из-за большого количества вариантов рассадки и большого количества людей.</p>
      </div>

    </main>
  )
}