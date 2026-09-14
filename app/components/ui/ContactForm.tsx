"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CallToActionButton from "./CallToActionButton";
import { useLocalePreference } from "@/app/components/providers/DirectionPreference";
import {
  DEFAULT_CONTACT_SUBMIT_BUTTON_TEXT,
  DEFAULT_CONTACT_SUCCESS_MESSAGE,
  CONTACT_FORM_FIELD_LIMITS,
  withRequiredIndicator,
} from "@/app/lib/contact-form-config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ContactFormProps {
  className?: string;
  submitButtonText?: string;
  successMessage?: string;
  fields?: ContactFormFieldConfig[];
  theme?: "banner" | "light";
}

type ContactFieldName = "fullName" | "email" | "phone" | "company" | "message";

export type ContactFormFieldConfig = {
  name: ContactFieldName;
  placeholder: string;
  required?: boolean;
};

export default function ContactForm({
  className = "",
  submitButtonText = DEFAULT_CONTACT_SUBMIT_BUTTON_TEXT,
  successMessage = DEFAULT_CONTACT_SUCCESS_MESSAGE,
  fields,
  theme = "banner",
}: ContactFormProps) {
  const { locale } = useLocalePreference();
  const isRtl = locale === "ar";
  const formRef = useRef<HTMLFormElement>(null);
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | HTMLDivElement | null)[]>([]);
  const visibleFields = fields ?? [];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    company?: string;
    message?: string;
  }>({});

  useEffect(() => {
    if (!formRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: formRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });

      // Animate field wrappers (not inputs) so transforms do not break click targets.
      inputRefs.current.forEach((el, index) => {
        if (el) {
          gsap.set(el, { opacity: 0, y: 30 });
          tl.to(
            el,
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
            },
            index === 0 ? 0 : "<0.1"
          );
        }
      });
    }, formRef);

    return () => ctx.revert();
  }, [visibleFields.length]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    const fieldMap = new Map(visibleFields.map((field) => [field.name, field]));

    if (fieldMap.get("fullName")?.required && !formData.fullName.trim()) {
      newErrors.fullName = "Name is required";
    }

    if (fieldMap.get("email")?.required && !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (fieldMap.has("email") && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (fieldMap.get("phone")?.required && !formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (fieldMap.get("company")?.required && !formData.company.trim()) {
      newErrors.company = "Company is required";
    }

    if (fieldMap.get("message")?.required && !formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          website: honeypot,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: successMessage,
        });
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          company: "",
          message: "",
        });
        setHoneypot("");
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus({ type: null, message: "" });
        }, 5000);
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Something went wrong. Please try again.",
        });
        // Auto-hide error message after 5 seconds
        setTimeout(() => {
          setSubmitStatus({ type: null, message: "" });
        }, 5000);
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Failed to send message. Please try again later.",
      });
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: null, message: "" });
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visibleFields.length) {
    return null;
  }

  const isLight = theme === "light";
  const inputClass = isLight
    ? "w-full min-h-[61px] px-[30px] py-5 rounded-[10px] bg-white text-[#374151] placeholder:text-[#374151] border-0 text-[20px] focus:outline-none focus:shadow-[0_0_0_2px_#1e3a8a] transition-shadow"
    : "w-full h-[42px] md:h-[62px] px-4 py-4 md:px-6 md:py-4 rounded-full bg-[#1a1a1a52] text-white placeholder:text-white placeholder:text-[16px] md:placeholder:text-[20px] border focus:outline-none transition-colors text-sm md:text-base";
  const inputBorderClass = isLight
    ? ""
    : "border-[#4E4E4E] focus:border-[#00d4aa]";
  const inputErrorClass = isLight ? "shadow-[0_0_0_2px_#ef4444]" : "border-red-500";
  const textareaClass = isLight
    ? "w-full min-h-[190px] px-[30px] py-5 rounded-[10px] bg-white text-[#374151] placeholder:text-[#374151] border-0 text-[20px] focus:outline-none focus:shadow-[0_0_0_2px_#1e3a8a] transition-shadow resize-y"
    : "w-full h-[130px] md:h-[190px] px-4 py-4 md:px-6 md:py-4 rounded-[30px] bg-[#1a1a1a52] text-white placeholder:text-white placeholder:text-[16px] md:placeholder:text-[20px] border focus:outline-none transition-colors resize-none text-sm md:text-base";
  const statusSuccessClass = isLight
    ? "bg-[#00d4aa]/15 text-[#047857] border border-[#00d4aa]/30"
    : "bg-[#00d4aa]/20 text-[#00d4aa] border border-[#00d4aa]/30";
  const statusErrorClass = isLight
    ? "bg-red-50 text-red-600 border border-red-200"
    : "bg-red-500/20 text-red-400 border border-red-500/30";
  const gridClass = isLight
    ? "grid grid-cols-1 gap-4"
    : "grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-2 xl:grid-cols-1";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      dir={isRtl ? "rtl" : "ltr"}
      className={`${gridClass} ${className}`}
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0 overflow-hidden"
      />
      {visibleFields.map((field, index) => {
        const placeholderText = withRequiredIndicator(field.placeholder, field.required) || "";

        if (field.name === "message") {
          return (
            <div
              key={field.name}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              className={isLight ? "relative z-[1]" : "relative z-[1] lg:col-span-2 xl:col-span-1"}
            >
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder={placeholderText}
                rows={isLight ? undefined : 4}
                maxLength={CONTACT_FORM_FIELD_LIMITS.message}
                className={`${textareaClass} ${
                  errors.message
                    ? isLight
                      ? inputErrorClass
                      : "border-red-500"
                    : isLight
                      ? ""
                      : "border-[#4E4E4E] focus:border-[#00d4aa]"
                }`}
                disabled={isSubmitting}
              />
              {errors.message && (
                <p className={`text-red-500 text-xs mt-1 ${isRtl ? "mr-4" : "ml-4"}`}>
                  {errors.message}
                </p>
              )}
            </div>
          );
        }

        const inputType =
          field.name === "email" ? "email" :
          field.name === "phone" ? "tel" :
          "text";
        const value = formData[field.name];
        const error = errors[field.name as keyof typeof errors];
        const needsValidationStyle =
          field.name === "fullName" ||
          field.name === "email" ||
          field.name === "phone" ||
          field.name === "company";

        return (
          <div
            key={field.name}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            className="relative z-[1]"
          >
            <input
              type={inputType}
              name={field.name}
              value={value}
              onChange={handleInputChange}
              placeholder={placeholderText}
              dir={field.name === "phone" && isRtl ? "rtl" : undefined}
              inputMode={field.name === "phone" ? "tel" : undefined}
              maxLength={
                field.name === "fullName"
                  ? CONTACT_FORM_FIELD_LIMITS.fullName
                  : field.name === "email"
                    ? CONTACT_FORM_FIELD_LIMITS.email
                    : field.name === "phone"
                      ? CONTACT_FORM_FIELD_LIMITS.phone
                      : field.name === "company"
                        ? CONTACT_FORM_FIELD_LIMITS.company
                        : undefined
              }
              className={`${inputClass} ${
                field.name === "phone" && isRtl ? "text-right" : ""
              } ${
                needsValidationStyle
                  ? error
                    ? inputErrorClass
                    : inputBorderClass
                  : inputBorderClass
              }`}
              disabled={isSubmitting}
            />
            {error && (
              <p className={`text-red-500 text-xs mt-1 ${isRtl ? "mr-4" : "ml-4"}`}>
                {error}
              </p>
            )}
          </div>
        );
      })}

      {/* Radio Buttons */}
      {/* <div className="flex gap-4 md:gap-6 flex-wrap">
        <label className="flex items-center gap-2 md:gap-3 cursor-pointer group">
          <input
            type="radio"
            name="contactType"
            value="meeting"
            checked={formData.contactType === "meeting"}
            onChange={handleRadioChange}
            className="w-4 h-4 md:w-5 md:h-5 appearance-none rounded-full border-2 border-[#00d4aa] checked:bg-[#00d4aa] checked:border-[#00d4aa] relative checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:transform checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full transition-all flex-shrink-0"
          />
          <span className="text-white text-sm md:text-base font-light">
            I want to book a meeting
          </span>
        </label>

        <label className="flex items-center gap-2 md:gap-3 cursor-pointer group">
          <input
            type="radio"
            name="contactType"
            value="call"
            checked={formData.contactType === "call"}
            onChange={handleRadioChange}
            className="w-4 h-4 md:w-5 md:h-5 appearance-none rounded-full border-2 border-[#00d4aa] checked:bg-[#00d4aa] checked:border-[#00d4aa] relative checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:transform checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full transition-all flex-shrink-0"
          />
          <span className="text-white text-sm md:text-base font-light">
            I want to book a call
          </span>
        </label>
      </div> */}

      {/* Status Message */}
      {submitStatus.type && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${isLight ? "" : "lg:col-span-2 xl:col-span-1"} ${
            submitStatus.type === "success" ? statusSuccessClass : statusErrorClass
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      {/* Submit Button */}
      <div className={isLight ? "relative z-[1] mt-2" : "relative z-[1] mt-2 md:mt-4 lg:col-span-2 xl:col-span-1"}>
        <CallToActionButton type="submit" variant="shiny" disabled={isSubmitting}>
          {isSubmitting ? "SENDING..." : submitButtonText || "SEND MESSAGE"}
        </CallToActionButton>
      </div>
    </form>
  );
}

