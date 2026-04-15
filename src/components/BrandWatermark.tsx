import Image from "next/image";

export default function BrandWatermark() {
    return (
        <div className="fixed inset-0 flex items-center justify-center -z-10 select-none pointer-events-none overflow-hidden">

            <div className="relative w-[600px] h-[600px] opacity-[0.1] grayscale">
                <Image
                    src="/Church-Logo.png"
                    alt="MH Logo Watermark"
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 300px, 600px"
                />
            </div>

            {/* Optional: Large Background Initials if you don't want to use an image */}
            <h1 className="text-[30rem] font-serif font-bold text-brand-primary opacity-[0.03]"> M&H </h1>
        </div>
    );
}