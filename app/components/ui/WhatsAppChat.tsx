"use client";

import Image from "next/image";
import whatsAppImg from "@/app/assets/imgs/whatsApp_img.png";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { Lato } from "next/font/google";

const lato = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

interface WhatsAppChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppChat({ isOpen, onClose }: WhatsAppChatProps) {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Animate chat widget
  useEffect(() => {
    if (chatRef.current && isOpen) {
      gsap.fromTo(
        chatRef.current,
        {
          opacity: 0,
          scale: 0.8,
          y: 20,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        }
      );
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div
      ref={chatRef}
      className={`fixed bottom-[20px] right-[20px] md:right-[70px] z-50 rounded-lg shadow-2xl overflow-hidden ${lato.className}`}
      style={{
        width: '380px',
        maxWidth: '90vw',
        height: '600px',
        maxHeight: '80vh',
        zIndex: 50,
        opacity: 0,
        backgroundColor: '#00000052', // Dark green background
        fontFamily: 'Lato, sans-serif',
      }}
    >
      {/* Chat Header with Close Button */}
      <div className="bg-[#00000052] text-white p-3 flex items-center justify-end">
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Chat Messages Area - Dark Green Background */}
      <div className="h-[calc(100%-120px)] overflow-y-auto-2 sidebar-scrollbar p-6 flex flex-col gap-4" style={{ backgroundColor: '#00000052' }}>
        {/* Welcome Message - Large White Bubble */}
        {messages.length === 0 && (
          <>
            <div className="flex items-start gap-3">
              <div className="bg-white rounded-tl-[10px] rounded-tr-[10px] rounded-bl-[10px] rounded-br-none p-4 shadow-lg max-w-[85%]">
                <p className="text-[14px] text-[#121212] leading-relaxed">
                  Welcome to Clear Wave. We're here to help! If you have any questions or need assistance, just drop us a message - we'll get back to you shortly.
                </p>
              </div>
            </div>

            {/* Quick Reply Options - Pink/Magenta Bubbles, Right Aligned */}
            <div className="flex flex-col items-end gap-3 mt-2">
              <button
                onClick={() => {
                  const message = "I have a question";
                  setMessages([{ text: message, isUser: true }]);
                }}
                className="text-[#DD0DCE] border border-[#DD0DCE] rounded-[8px] px-3 py-2 text-sm font-[400] transition-all shadow-md max-w-[75%] text-right hover:opacity-90"
                style={{ backgroundColor: '#ffffff' }}
              >
                I have a question
              </button>

              <button
                onClick={() => {
                  const message = "Can I get a quote for a project?";
                  setMessages([{ text: message, isUser: true }]);
                }}
                className="text-[#DD0DCE] border border-[#DD0DCE] rounded-[8px] px-3 py-2 text-sm font-[400] transition-all shadow-md max-w-[75%] text-right hover:opacity-90"
                style={{ backgroundColor: '#ffffff' }}
              >
                Can I get a quote for a project?
              </button>

              <button
                onClick={() => {
                  const message = "Can I schedule a consultation with your team?";
                  setMessages([{ text: message, isUser: true }]);
                }}
                className="text-[#DD0DCE] border border-[#DD0DCE] rounded-[8px] px-3 py-2 text-sm font-[400] transition-all shadow-md max-w-[75%] text-right hover:opacity-90"
                style={{ backgroundColor: '#ffffff' }}
              >
                Can I schedule a consultation with your team?
              </button>
            </div>
          </>
        )}

        {/* Display Messages */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg px-4 py-3 text-[14px] font-[400] shadow-md max-w-[75%] ${message.isUser
                ? 'text-[#DD0DCE] border border-[#DD0DCE]'
                : 'bg-white text-black border border-[#DD0DCE]'
                }`}
              style={message.isUser ? { backgroundColor: '#ffffff' } : { backgroundColor: '#ffffff' }}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area */}
      <div className="p-3" style={{ backgroundColor: '#00000052' }}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && inputMessage.trim()) {
                setMessages([...messages, { text: inputMessage.trim(), isUser: true }]);
                setInputMessage("");
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-white border border-[#DD0DCE] rounded-full focus:outline-none focus:ring-[#DD0DCE] text-sm text-gray-800"
          />
          <button
            onClick={() => {
              if (inputMessage.trim()) {
                setMessages([...messages, { text: inputMessage.trim(), isUser: true }]);
                setInputMessage("");
              }
            }}
            className="bg-transparent hover:bg-transparent text-white border border-[#000000] rounded-full p-2.5 transition-colors flex items-center justify-center"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

