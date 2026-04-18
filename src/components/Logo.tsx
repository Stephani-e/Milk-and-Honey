"use client";
import Image from "next/image";

interface LogoProps {
    orientation?: "horizontal" | "vertical";
    className?: string;
}

export default function Logo({ orientation = "horizontal", className = "" }: LogoProps) {
    return (
        <div className={`flex items-center gap-4 ${orientation === "vertical" ? "flex-col text-center" : "flex-row"} ${className}`}>

            {/* THE SEAL */}
            <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0">
                <Image
                    src="/seal.png" // The cropped circular seal
                    alt="RCCG Seal"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            {/* THE TEXT */}
            <div className="flex flex-col select-none">
                <div className="flex items-center gap-1">
                    <span className="text-[#E31E24] font-serif font-[900] text-3xl md:text-4xl tracking-tighter uppercase italic">
                        Milk
                    </span>

                    {/* The Blue Circle '&' */}
                    <div className="bg-[#0B237B] text-white w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-serif font-black text-lg md:text-xl shadow-sm">
                        &
                    </div>
                </div>

                <span className="text-[#E31E24] font-serif font-[900] text-3xl md:text-4xl tracking-tighter uppercase italic -mt-2">
                    Honey
                </span>
            </div>
        </div>
    );
}