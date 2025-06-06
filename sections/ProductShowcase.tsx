"use client";
import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

import appScreen from "../assets/images/app-screen.png";

export const ProductShowcase = () => {
  const imageRef = useRef<HTMLImageElement>(null);

  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0]);

  return (
    <section className="py-[72px] md:py-24 bg-gradient-to-b from-black to-[#5d2ca8]">
      <div className="container">
        <h2 className="text-center text-8xl md:text-9xl font-bold tracking-tighter">Интуитивно понятный интерфейс</h2>
        <div className="max-w-xl mx-auto">
          <p className="text-xl text-center mt-5">Мы предлагаем интуитивно понятный интерфейс, который делает взаимодействие с сайтом простым и комфортным. Благодаря продуманному дизайну и логичной структуре, вы сможете быстро освоить все функции без лишних усилий. Удобство и эффективность — в каждом клике!</p>
        </div>
        <motion.div
          style={{
            opacity,
            rotateX,
            transformPerspective: "800px",
          }}
        >
          <Image ref={imageRef} src={appScreen} alt="Product screenshot" className="mt-14" />
        </motion.div>
      </div>
    </section>
  );
};
