"use client";

import { useState } from "react";
import WhatsAppButton from "./WhatsAppButton";
import WhatsAppChat from "./WhatsAppChat";

export default function WhatsAppWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <WhatsAppButton onClick={() => setIsChatOpen(!isChatOpen)} />
      <WhatsAppChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
