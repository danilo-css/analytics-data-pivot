import Link from "next/link";
import React from "react";
import { FiShield } from "react-icons/fi";
import { GiEagleEmblem } from "react-icons/gi";

export default function Logo() {
  return (
    <div className="flex flex-row items-center justify-center rounded-lg py-4 px-4">
      <Link
        href="/"
        className="flex flex-row items-center justify-center gap-1 px-3"
      >
        <div className="relative flex items-center justify-center border border-neutral-700 bg-black shadow-lg rounded-lg pr-[2px] pl-[1px]">
          <FiShield size={50} />
          <div className="absolute">
            <GiEagleEmblem size={30} />
          </div>
        </div>
        <div className="flex flex-col items-left ">
          <span className="text-md font-heading">DATA PIVOT</span>
          <div className="flex flex-row items-center text-[9px]">
            <span>ANALYTICSDATA.PRO</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
