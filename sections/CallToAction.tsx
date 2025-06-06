"use client";
import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

import helixImage from "@/assets/images/helix2.png";
import emojiStarImage from "@/assets/images/emojistar.png";

export const CallToAction = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["0 1", "1 0"], // Adjusted for proper scroll progress calculation
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section 
      ref={sectionRef} 
      className="bg-black text-white py-[72px] md:py-24 text-center overflow-x-hidden"
    >
      <div className="container max-w-xl relative px-4">
        {/* Helix Image */}
        <motion.div
          style={{ translateY }}
          className="hidden md:block"
        >
          <Image
            src={helixImage}
            alt=""
            className="absolute top-6 right-full transform translate-x-1 md:-translate-x-1/4 lg:translate-x-0" // Adjust for different screen sizes
            objectFit="cover"
            width={150}
            height={110}
          />
        </motion.div>

        {/* Emoji Star Image */}
        <motion.div
          style={{ translateY }}
          className="hidden md:block"
        >
          <Image
            src={emojiStarImage}
            alt=""
            className="absolute -top-[80px] left-full transform translate-x-24 md:translate-x-10 lg:translate-x-2" // Adjust for different screen sizes
            objectFit="cover"
            width={100}
            height={100}
          />
        </motion.div>

        {/* Fallback for mobile */}
        <div className="md:hidden flex justify-center">
          <Image
            src={helixImage}
            alt=""
            className="w-12 h-12"
            objectFit="cover"
            width={68}
            height={40}
          />
          <Image
            src={emojiStarImage}
            alt=""
            className="w-12 h-12"
            objectFit="cover"
            width={48}
            height={48}
          />
        </div>

        <h2 className="text-5xl md:text-6xl font-bold tracking-tighter">
          Get instant access
        </h2>
        <p className="text-xl text-white/70 mt-5">
          Celebrate the joy of accomplishment with an app designed to track your progress and motivate your efforts.
        </p>
        <form className="mt-10 flex flex-col gap-2.5 max-w-sm mx-auto md:flex-row">
          <input
            type="email"
            placeholder="your@email.com"
            className="h-12 bg-white/20 rounded-lg px-5 font-medium placeholder:text-[#9ca3af] md:flex-1"
          />
          <button
            type="submit"
            className="bg-white text-black h-12 rounded-lg px-5"
          >
            Get access
          </button>
        </form>
      </div>
    </section>
  );
};