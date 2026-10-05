"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Gamepad2, Users } from "lucide-react";

const navItems = [
  {
    href: "/about",
    label: "About Us",
    icon: <Users size={48} aria-hidden="true" />,
    colSpan: "col-span-1",
    rowSpan: "row-span-1",
  },
  {
    href: "/archive",
    label: "Game Archive",
    icon: <Gamepad2 size={48} aria-hidden="true" />,
    colSpan: "col-span-1",
    rowSpan: "row-span-1",
  },
  {
    href: "/library",
    label: "Library",
    icon: <BookOpen size={48} aria-hidden="true" />,
    colSpan: "col-span-1",
    rowSpan: "row-span-1",
  },
];

const BentoNav = () => {
  return (
    <motion.nav
      aria-label="주요 메뉴"
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mx-auto justify-center"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {navItems.map((item) => (
        <Link
          href={item.href}
          key={item.href}
          className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-4 focus-visible:ring-offset-dark-bg"
        >
          <motion.div
            className={`${item.colSpan} ${item.rowSpan} h-full`}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div className="h-full p-6 bg-glass-bg border border-gray-700 rounded-xl backdrop-blur-xl hover:bg-brand-purple/30 transition-colors duration-300 flex flex-col items-center justify-center">
              {item.icon}
              <span className="mt-2 text-lg font-semibold">{item.label}</span>
            </div>
          </motion.div>
        </Link>
      ))}
    </motion.nav>
  );
};

export default BentoNav;
