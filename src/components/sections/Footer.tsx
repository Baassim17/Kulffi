"use client";

import { SOCIAL_LINKS } from "@/lib/constants/navigation";

export default function Footer() {

  return (
    <footer
      id="footer"
      className="relative bg-[#A31D1D] pt-24 pb-12 md:pt-32"
      style={{
        clipPath: "ellipse(150% 100% at 50% 100%)",
      }}
    >
      <div className="px-6 md:px-12">
        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-cream/10 pt-8 md:flex-row">
          <p className="text-sm text-muted-custom">
            © Kulffi / All Rights Reserved
          </p>
          <div className="flex gap-6">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative text-sm text-cream/60 transition-colors duration-350 hover:text-terracotta"
                data-cursor-hover
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
