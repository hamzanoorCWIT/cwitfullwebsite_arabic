"use client";

import Image from "next/image";
import whatsAppImg from "@/app/assets/imgs/whatsApp_img.svg";

interface WhatsAppButtonProps {
  onClick: () => void;
  showOnDesktop?: boolean;
  showOnMobile?: boolean;
}

export default function WhatsAppButton({ 
  onClick, 
  showOnDesktop = true, 
  showOnMobile = true 
}: WhatsAppButtonProps) {
  const handleClick = () => {
    // Dubai number: +971 58 8279426
    // Cleaned number for URL: 971588279426
    window.open("https://wa.me/971588279426", "_blank");
  };
  return (
    <>
      {/* WhatsApp Button - Fixed Position (Desktop) */}
      {showOnDesktop && (
        <button
          onClick={handleClick}
          className="fixed hidden md:block right-[70px] bottom-[36px] z-30 cursor-pointer hover:scale-110 transition-transform duration-300 whatsapp-button"
          style={{
            zIndex: 30,
          }}
        >
          <Image
            src={whatsAppImg}
            alt="WhatsApp"
            width={60}
            height={60}
            className="w-[40px] h-[40px] object-contain"
          />
        </button>
      )}

      {/* WhatsApp Button - Fixed Position (Mobile) */}
      {showOnMobile && (
        <button
          onClick={handleClick}
          className="fixed md:hidden right-[15px] bottom-[28px] z-30 cursor-pointer hover:scale-110 transition-transform duration-300"
          style={{
            zIndex: 30,
          }}
        >
          <Image
            src={whatsAppImg}
            alt="WhatsApp"
            width={50}
            height={50}
            className="w-[40px] h-[40px] object-contain"
          />
        </button>
      )}
    </>
  );
}

