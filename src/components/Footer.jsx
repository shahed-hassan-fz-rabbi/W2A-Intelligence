"use client";

import Link from "next/link";
import { Mail, Leaf, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn, FaGithub } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    "Modules": [
      { label: "Waste Collection", href: "/collection" },
      { label: "Company Allocation", href: "/assignments" },
      { label: "Assets Generated", href: "/products" },
      { label: "Analytics", href: "/analytics" },
    ],
    "Project Info": [
      { label: "Department of CSE", href: "#" },
      { label: "Comilla University", href: "#" },
      { label: "Academic Build v1.0.0", href: "#" },
    ],
  };

  const legalLinks = [
    { label: "Settings", href: "/settings" },
    { label: "Staff Portal", href: "/login" },
  ];

  const socialLinks = [
    { label: "Twitter", href: "#", icon: FaTwitter },
    { label: "Facebook", href: "#", icon: FaFacebookF },
    { label: "Instagram", href: "#", icon: FaInstagram },
    { label: "LinkedIn", href: "#", icon: FaLinkedinIn },
    { label: "GitHub", href: "#", icon: FaGithub },
  ];

  return (
    <footer
      className="border-t w-full relative z-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        marginTop: "clamp(3rem, 8vw, 6rem)",
      }}
    >
      <div
        className="max-w-7xl mx-auto pb-10"
        style={{
          paddingLeft: "clamp(1.5rem, 6vw, 5rem)",
          paddingRight: "clamp(1.5rem, 6vw, 5rem)",
          paddingTop: "clamp(4rem, 10vw, 6rem)",
        }}
      >
        {/* Balanced layout like Fable */}
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-10">
          
          {/* Brand + Description */}
          <div className="flex flex-col items-start space-y-5 max-w-sm shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <span className="text-xs font-black text-white tracking-wider">W2A</span>
              </div>
              <span className="text-2xl font-black tracking-tight" style={{ color: "var(--brand)" }}>
                W2A Intelligence
              </span>
            </Link>

            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              A centralized platform that transforms urban waste management from a reactive disposal process into a proactive, resource-oriented system where every type of waste is treated as a recoverable asset. Mainly Focus on Company Allocation.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2 w-full">
              <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--brand)" }}>
                <Leaf size={14} className="text-brand-600" />
                Stay Updated
              </p>
              <div className="relative flex items-center w-full">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-11 px-4 pr-12 rounded-xl text-sm border outline-none transition-colors"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--brand)" }}
                />
                <button
                  type="submit"
                  className="absolute right-1.5 w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-105"
                  style={{ backgroundColor: "var(--primary)", color: "white" }}
                  aria-label="Subscribe"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-x-16 gap-y-10">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="min-w-[140px]">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: "var(--brand)" }}>
                  {title}
                </h3>
                <ul className="space-y-3.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium transition-colors hover:underline underline-offset-4"
                        style={{ color: "var(--muted)", textDecorationColor: "var(--primary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Connect column with Motion animations */}
            <div className="min-w-[180px]">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: "var(--brand)" }}>
                Connect With Us
              </h3>
              <div className="flex flex-wrap gap-3 mb-5">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-colors"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--muted)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--card)";
                      e.currentTarget.style.color = "var(--primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--background)";
                      e.currentTarget.style.color = "var(--muted)";
                    }}
                    aria-label={label}
                  >
                    <Icon size={15} />
                  </motion.a>
                ))}
              </div>
              <p className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                <Mail size={14} />
                Email: info@w2a.com
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 mt-16 border-t flex flex-col items-center justify-between text-center gap-5 sm:flex-row"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs font-semibold display flex bg-center" style={{ color: "var(--muted)" }}>
            © {currentYear} W2A Intelligence. All rights reserved.
          </p>  
          
        </div>
      </div>
    </footer>
  );
}