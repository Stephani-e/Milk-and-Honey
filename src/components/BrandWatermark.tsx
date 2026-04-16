import Image from "next/image";

export default function BrandWatermark() {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-[-1] opacity-[0.03] select-none pointer-events-none overflow-hidden">

            <div className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] opacity-[0.03] grayscale">
                <Image
                    src="/Church-Logo.png"
                    alt="MH Logo Watermark"
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 300px, 600px"
                />
            </div>

            <h1 className="absolute text-[20vw] font-serif font-bold text-brand-primary opacity-[0.02] whitespace-nowrap">
                M&H
            </h1>
        </div>
    );
}