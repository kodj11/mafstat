"use client";
import React from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

import PlusIcon from "@/assets/icons/plus.svg";
import MinusIcon from "@/assets/icons/minus.svg";

export const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    return (
        <div className="py-7 border-b border-white/30 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            <div className="flex items-center">
                <span className="flex-1 text-lg font-bold">{question}</span>
                {isOpen ? <MinusIcon /> : <PlusIcon />}
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            height: 0,
                            marginTop: 0,
                        }}
                        animate={{
                            opacity: 1,
                            height: "auto",
                            marginTop: "16px",
                        }}
                        exit={{
                            opacity: 0,
                            height: 0,
                            marginTop: 0,
                        }}
                    >
                        {answer}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
