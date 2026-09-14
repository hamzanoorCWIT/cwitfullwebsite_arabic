"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CallToActionButton from "../ui/CallToActionButton";
import { SECTION_HEADING_CENTER_CLASS, SECTION_HEADING_SIZE_CLASS } from "./section-heading";
import {
  CONTACT_FORM_FIELD_LIMITS,
  DEFAULT_CONTACT_FORM_FIELDS,
  withRequiredIndicator,
  type ResolvedContactFormProps,
} from "@/app/lib/contact-form-config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProjectContactFormProps {
  title?: string;
  /** CMS Contact Heading Line 1 (landing pages). */
  titleLine1?: string;
  /** CMS Contact Heading Line 2 (landing pages). */
  titleLine2?: string;
  className?: string;
  figmaLayout?: boolean;
  contactForm?: ResolvedContactFormProps;
}

export default function ProjectContactForm({
  title = "HAVE A PROJECT? LET'S TALK ABOUT IT!",
  titleLine1 = "",
  titleLine2 = "",
  className = "",
  figmaLayout = false,
  contactForm,
}: ProjectContactFormProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | null)[]>([]);

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

  const visibleFields = contactForm ? contactForm.fields : DEFAULT_CONTACT_FORM_FIELDS;
  const fieldMap = new Map(visibleFields.map((field) => [field.name, field]));
  const inputFieldNames = visibleFields
    .filter((field) => field.name !== "message")
    .map((field) => field.name);
  const messageField = fieldMap.get("message");

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // Animate heading
      if (headingRef.current) {
        gsap.set(headingRef.current, { opacity: 0, y: 30 });
        tl.to(headingRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        });
      }

      // Animate form elements
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
            index === 0 ? "-=0.4" : "<0.1"
          );
        }
      });
    },
    sectionRef,
    []
  );

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
          message:
            contactForm?.successMessage ||
            "Thank you! Your message has been sent successfully.",
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

  // Landing: CMS Line 1 + Line 2 each on their own row.
  // Legacy non-figma: optional "?" split into two lines.
  const cmsLine1 = titleLine1.trim();
  const cmsLine2 = titleLine2.trim();
  const useCmsTwoLines = figmaLayout && Boolean(cmsLine1 || cmsLine2);
  const hasQuestionSplit = !figmaLayout && title.includes("?");
  const titleLines = hasQuestionSplit ? title.split("?") : [title];
  const firstLine = useCmsTwoLines
    ? cmsLine1
    : hasQuestionSplit
      ? `${titleLines[0]}?`
      : titleLines[0];
  const secondLine = useCmsTwoLines
    ? cmsLine2
    : hasQuestionSplit
      ? titleLines.slice(1).join("?").trim()
      : "";
  const sectionClassName = figmaLayout
    ? "relative bg-black pt-[130px] pb-[188px] overflow-hidden"
    : "relative min-h-screen bg-black py-20 md:py-32 overflow-hidden";
  const outerClassName = figmaLayout
    ? "mx-auto w-full max-w-[1130px] px-5 sm:px-8 xl:px-0"
    : "container mx-auto px-4 sm:px-6 lg:px-8";
  const contentClassName = figmaLayout
    ? "mx-auto project-contact-form-content-container"
    : "max-w-[1000px] mx-auto project-contact-form-content-container";
  const headingClassName = figmaLayout
    ? `mx-auto mb-[105px] max-w-[599px] text-center font-graphik ${SECTION_HEADING_SIZE_CLASS} leading-[42px] text-white md:leading-[1.28]`
    : `${SECTION_HEADING_CENTER_CLASS} text-white mb-8 sm:mb-10 md:mb-12 lg:mb-14 xl:mb-16`;
  const fieldClassName =
    "w-full h-[60px] px-[30px] rounded-[8px] bg-black text-white placeholder:text-white/50 focus:placeholder:text-white border border-[#4E4E4E] focus:outline-none focus:border-[#0DFCC1] transition-colors text-[16px]";
  const defaultFieldClassName =
    "w-full h-[50px] md:h-[60px] px-4 md:px-6 rounded-lg bg-[#1a1a1a] text-white placeholder:text-white/50 focus:placeholder:text-white placeholder:text-[14px] md:placeholder:text-[16px] border focus:outline-none transition-colors text-sm md:text-base";
  const textareaClassName =
    "w-full h-[200px] px-[30px] py-[30px] rounded-[8px] bg-black text-white placeholder:text-white/50 focus:placeholder:text-white border border-[#4E4E4E] focus:outline-none focus:border-[#0DFCC1] transition-colors resize-none text-[16px]";
  const defaultTextareaClassName =
    "w-full min-h-[150px] md:min-h-[180px] px-4 md:px-6 py-4 md:py-6 rounded-lg bg-[#1a1a1a] text-white placeholder:text-white/50 focus:placeholder:text-white placeholder:text-[14px] md:placeholder:text-[16px] border focus:outline-none transition-colors resize-none text-sm md:text-base";
  const fieldTypes = {
    fullName: "text",
    email: "email",
    phone: "tel",
    company: "text",
  } as const;
  const fieldLimits = {
    fullName: CONTACT_FORM_FIELD_LIMITS.fullName,
    email: CONTACT_FORM_FIELD_LIMITS.email,
    phone: CONTACT_FORM_FIELD_LIMITS.phone,
    company: CONTACT_FORM_FIELD_LIMITS.company,
  } as const;

  return (
    <section
      id="project-contact-form"
      ref={sectionRef}
      className={`${sectionClassName} ${className}`}
    >
      <div className={outerClassName}>
        <div className={contentClassName}>
          {/* Heading */}
          <h2
            ref={headingRef}
            className={headingClassName}
          >
            {useCmsTwoLines ? (
              <>
                {firstLine ? <span className="block">{firstLine}</span> : null}
                {secondLine ? <span className="block">{secondLine}</span> : null}
              </>
            ) : figmaLayout ? (
              title
            ) : (
              <>
                <span className="block">{firstLine}</span>
                {secondLine ? <span className="block">{secondLine}</span> : null}
              </>
            )}
          </h2>

          {/* Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className={figmaLayout ? "flex flex-col gap-[30px]" : "flex flex-col gap-6 md:gap-8"}
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
            <div className={figmaLayout ? "grid grid-cols-1 gap-[30px] md:grid-cols-2" : "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"}>
              {inputFieldNames.map((rawFieldName, index) => {
                const fieldName = rawFieldName as keyof typeof fieldTypes;
                const field = fieldMap.get(fieldName);
                const error = errors[fieldName];
                const placeholder = withRequiredIndicator(
                  field?.placeholder || fieldName,
                  field?.required
                );

                return (
                  <div key={fieldName}>
                    <input
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type={fieldTypes[fieldName]}
                      name={fieldName}
                      value={formData[fieldName]}
                      onChange={handleInputChange}
                      placeholder={placeholder}
                      maxLength={fieldLimits[fieldName]}
                      className={`${figmaLayout ? fieldClassName : defaultFieldClassName} ${
                        error
                          ? "border-red-500"
                          : "border-[#4E4E4E] focus:border-[#0DFCC1]"
                      }`}
                      disabled={isSubmitting}
                    />
                    {error && (
                      <p className="text-red-500 text-xs mt-1 ml-1">
                        {error}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {messageField ? (
              <div>
                <textarea
                  ref={(el) => {
                    inputRefs.current[inputFieldNames.length] = el;
                  }}
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={
                    withRequiredIndicator(
                      messageField.placeholder || "Type your message here...",
                      messageField.required
                    )
                  }
                  rows={6}
                  maxLength={CONTACT_FORM_FIELD_LIMITS.message}
                  className={`${figmaLayout ? textareaClassName : defaultTextareaClassName} ${errors.message
                      ? "border-red-500"
                      : "border-[#4E4E4E] focus:border-[#0DFCC1]"
                    }`}
                  disabled={isSubmitting}
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1 ml-1">
                    {errors.message}
                  </p>
                )}
              </div>
            ) : null}

            {/* Status Message */}
            {submitStatus.type && (
              <div
                className={`px-4 py-3 rounded-lg text-sm ${submitStatus.type === "success"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
              >
                {submitStatus.message}
              </div>
            )}

            {/* Submit Button */}
            <div ref={(el) => { inputRefs.current[inputFieldNames.length + (messageField ? 1 : 0)] = el as unknown as HTMLButtonElement; }}>
              <CallToActionButton type="submit" variant="shiny" disabled={isSubmitting}>
                {isSubmitting ? "SENDING..." : contactForm?.submitButtonText || "SEND MESSAGE"}
              </CallToActionButton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

