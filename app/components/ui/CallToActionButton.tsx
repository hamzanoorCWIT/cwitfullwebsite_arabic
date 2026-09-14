"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface CallToActionButtonProps {
  variant?: "outline" | "filled" | "shiny";
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  href?: string;
  size?: "default" | "small";
  disabled?: boolean;
}

export default function CallToActionButton({
  variant = "outline",
  className = "",
  onClick,
  children = "Let's Talk",
  type = "button",
  href,
  size = "default",
  disabled = false,
}: CallToActionButtonProps) {
  const router = useRouter();
  const sizeClasses = size === "small"
    ? "w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px] xl:w-[200px] 2xl:w-[220px] h-[32px] sm:h-[36px] md:h-[40px] lg:h-[45px] xl:h-[50px] 2xl:h-[55px] rounded-full px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px] cta-button-small"
    : "w-[150px] sm:w-[180px] md:w-[200px] lg:w-[221px] xl:w-[240px] 2xl:w-[260px] h-[32px] sm:h-[36px] md:h-[42px] lg:h-[51px] xl:h-[56px] 2xl:h-[60px] rounded-full px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8 py-1.5 sm:py-2 md:py-2.5 lg:py-3 text-[10px] sm:text-[11px] md:text-[13px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px] cta-button";

  const baseClasses = `${sizeClasses} font-graphik-light-weight-300 text-white hover:cursor-pointer transition-all duration-300 relative items-center justify-center z-50`;

  const variantClasses =
     variant === "outline"
    ? "border-2 border-white bg-transparent hover:border-transparent overflow-hidden"
    : variant === "filled"
    ? "bg-zinc-900 hover:bg-zinc-800 overflow-hidden"
    : "shiny-cta";

  const content = (
    <>
      <span className="relative z-10 text-white font-[500] cta-button-text">{children}</span>
      <span 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        // style={{
        //   background: "linear-gradient(102.96deg, #EE66AD 0.02%, #758EF8 100.02%);",
        // }}
      />
    </>
  );

  // Add inline-flex as default if no display utility is in className
  // Check for any display utility classes (including responsive variants)
  const hasDisplayClass = /\b(hidden|flex|inline-flex|block|inline-block|grid|inline-grid|table|inline-table|contents|list-item)\b/.test(className);
  const displayClass = hasDisplayClass ? '' : 'inline-flex';

  // Handle navigation - scroll to form on specific pages, otherwise navigate to /contact-us
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // If type is submit, let the form handle it (don't prevent default or navigate)
    if (type === "submit") {
      if (onClick) {
        onClick();
      }
      return; // Let form submission happen naturally
    }
    
    // For non-submit buttons, prevent default and handle navigation
    e.preventDefault();
    
    // Check current pathname
    const currentPath = window.location.pathname;
    
    // If onClick is provided, let it handle navigation and skip default behavior
    if (onClick) {
      onClick();
      return;
    }
    
    // If on mobile-app, web-app, logo-app, etc. pages, scroll to project-contact-form
    if (
      currentPath === '/mobile-app' || 
      currentPath.startsWith('/mobile-app/') ||
      currentPath === '/web-app' || 
      currentPath.startsWith('/web-app/') ||
      currentPath === '/logo-app' || 
      currentPath.startsWith('/logo-app/') ||
      currentPath === '/seo-app' ||
      currentPath.startsWith('/seo-app/') ||
      currentPath === '/security-app' ||
      currentPath.startsWith('/security-app/') ||
      currentPath === '/ecommerce-app' ||
      currentPath.startsWith('/ecommerce-app/') ||
      currentPath === '/marketing-app' ||
      currentPath.startsWith('/marketing-app/') ||
      currentPath === '/salesforce' ||
      currentPath.startsWith('/salesforce/') ||
      currentPath === '/wordpress' ||
      currentPath.startsWith('/wordpress/') ||
      currentPath === '/react' ||
      currentPath.startsWith('/react/') ||
      currentPath === '/real-estate' ||
      currentPath.startsWith('/real-estate/') ||
      currentPath === '/education' ||
      currentPath.startsWith('/education/') ||
      currentPath === '/healthcare' ||
      currentPath.startsWith('/healthcare/') ||
      currentPath === '/retail-ecommerce' ||
      currentPath.startsWith('/retail-ecommerce/') ||
      currentPath === '/banking' ||
      currentPath.startsWith('/banking/') ||
      currentPath === '/digital-solutions' ||
      currentPath.startsWith('/digital-solutions/') ||
      currentPath === '/flutter-app' ||
      currentPath.startsWith('/flutter-app/') ||
      currentPath === '/ui-ux-app' ||
      currentPath.startsWith('/ui-ux-app/') ||
      currentPath === '/technology' ||
      currentPath.startsWith('/technology/')
    ) {
      const projectContactForm = document.getElementById('project-contact-form');
      if (projectContactForm) {
        projectContactForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    
    // For all other pages, navigate to /contact-us page
    router.push('/contact-us');
  };

  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`${baseClasses} ${variantClasses} ${displayClass} ${className} group`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${displayClass} ${className} group ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {content}
    </button>
  );
}

