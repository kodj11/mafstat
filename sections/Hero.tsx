"use client";
import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import ArrowWIcon from "@/assets/icons/arrow-w.svg";
import cursorImage from "@/assets/images/cursor.png";
import messageImage from "@/assets/images/message.png";

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative py-[72px] md:py-24 text-white bg-[linear-gradient(to_bottom,#000,#200d42_34%,#4f21a1_65%,#a46edb_82%)] overflow-clip">
      <div className="absolute h-[375px] w-[750px] md:w-[1536px] md:h-[768px] lg:w-[2400px] lg:h-[1200px] rounded-[100%] bg-black left-1/2 -translate-x-1/2 border border-[#b48cde] bg-[radial-gradient(closest-side,#000_82%,#9560eb)] top-[calc(100%-96px)] md:top-[calc(100%-120px)]"></div>
      <div className="container relative">
        <div className="flex items-center justify-center">
          <a href="#" className="border border-white/30 py-1 px-2 rounded-lg inline-flex gap-3">
            <span className="bg-[linear-gradient(to_right,#f87aff,#fb93d0,#ffdd99,#c3f0b2,#2fd8fe)] bg-clip-text text-transparent">Больше информации по Мафии</span>
            <span className="inline-flex items-center gap-1">
              <span>Ищи тут</span>
              <ArrowWIcon />
            </span>
          </a>
        </div>
        <div className="flex justify-center mt-8">
          <div className="inline-flex relative">
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-center inline-flex">
              Одна игра
              <br /> один Сайт
            </h1>
            <motion.div
              drag
              dragConstraints={sectionRef}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 10 }}
              whileTap={{ cursor: "grabbing" }}
              className="size-[200px] absolute right-[536px] top-[108px] hidden md:inline cursor-grab"
            >
              <Image src={cursorImage} alt="Cursor image" draggable="false" />
            </motion.div>
            <motion.div
              drag
              dragConstraints={sectionRef}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 10 }}
              whileTap={{ cursor: "grabbing" }}
              className="size-[200px] absolute left-[548px] top-[66px] hidden md:inline cursor-grab"
            >
              <Image src={messageImage} alt="Message image" draggable="false" />
            </motion.div>
          </div>
        </div>
        <div className="flex justify-center">
          <p className="text-center text-xl mt-8 max-w-md">Celebrate the joy of accomplishment with an app designed to track progress, motivate your efforts, and celebrate your success.</p>
        </div>
        <div className="flex justify-center mt-8">
          <button className="bg-white text-black py-3 px-5 rounded-lg font-medium">Зарегистрируйся сейчас!</button>
        </div>
      </div>
    </section>
  );
};
