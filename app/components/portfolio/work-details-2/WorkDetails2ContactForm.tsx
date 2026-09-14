"use client";

import ContactForm from "@/app/components/ui/ContactForm";
import type { ResolvedContactFormProps } from "@/app/lib/contact-form-config";
import styles from "./work-details-2.module.css";

type WorkDetails2ContactFormProps = {
  headingSub?: string;
  headingMain?: string;
  contactForm: ResolvedContactFormProps;
};

export default function WorkDetails2ContactForm({
  headingSub,
  headingMain,
  contactForm,
}: WorkDetails2ContactFormProps) {
  if (!contactForm.fields.length) return null;

  const hasHeading = Boolean(headingSub?.trim() || headingMain?.trim());

  return (
    <section
      className={styles.contact}
      aria-label="Contact"
      {...(hasHeading ? { "aria-labelledby": "work-details-contact-heading" } : {})}
    >
      <div className={styles.contactInner}>
        {hasHeading ? (
          <div className={styles.contactHeading} id="work-details-contact-heading">
            {headingSub?.trim() ? <span>{headingSub}</span> : null}
            {headingMain?.trim() ? <strong>{headingMain}</strong> : null}
          </div>
        ) : null}

        <ContactForm
          theme="light"
          fields={contactForm.fields}
          submitButtonText={contactForm.submitButtonText}
          successMessage={contactForm.successMessage}
        />
      </div>
    </section>
  );
}
