"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

import EcosystemIcon from "@/assets/icons/ecosystem.svg";

export const Feature = ({ title, description }: { title: string; description: string }) => {
    const borderRef = useRef<HTMLDivElement>(null);
    const offsetX = useMotionValue(-100);
    const offsetY = useMotionValue(-100);
    const maskImage = useMotionTemplate`radial-gradient(100px 100px at ${offsetX}px ${offsetY}px, black, transparent)`

    const updateMousePosition = (e: MouseEvent) => {
        if (!borderRef.current) return;

        const borderRect = borderRef.current.getBoundingClientRect();

        offsetX.set(e.x - borderRect.x);
        offsetY.set(e.y - borderRect.y);
    }

    useEffect(() => {
        window.addEventListener("mousemove", updateMousePosition);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
        }
    }, []);

    return (
        <div className="relative border border-white/30 px-5 py-10 text-center rounded-xl sm:flex-1">
            <motion.div
                ref={borderRef}
                className="absolute inset-0 border-2 border-purple-400 rounded-xl"
                style={{
                    maskImage
                }}
            ></motion.div>
            <div className="inline-flex size-14 bg-white text-black justify-center items-center rounded-lg">
                <EcosystemIcon />
            </div>
            <h3 className="mt-6 font-bold">{title}</h3>
            <p className="mt-2">{description}</p>
        </div>
    )
}
