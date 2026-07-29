"use client";

import Link from "next/link";
import { Mail, Leaf, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn, FaGithub } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Modules: [
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

  const socialLinks = [
    { label: "Twitter", href: "#", icon: FaTwitter },
    { label: "Facebook", href: "#", icon: FaFacebookF },
    { label: "Instagram", href: "#", icon: FaInstagram },
    { label: "LinkedIn", href: "#", icon: FaLinkedinIn },
    { label: "GitHub", href: "#", icon: FaGithub },
  ];

  return (
    <footer
      className="relative w-full overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: "var(--card)",
        marginTop: "clamp(1.5rem, 8vw, 6rem)",
      }}
    >
      {/* Green gradient top border */}
      <div
        className="absolute top-0 left-0 w-full h-[3px]"
        style={{
          background:
            "linear-gradient(90deg,#22c55e 0%,#16a34a 25%,#10b981 50%,#16a34a 75%,#22c55e 100%)",
        }}
      />

      <div
        className="max-w-7xl mx-auto pb-10"
        style={{
          paddingLeft: "clamp(1.5rem, 6vw, 5rem)",
          paddingRight: "clamp(1.5rem, 6vw, 5rem)",
          paddingTop: "clamp(1rem, 5vw, 3rem)",
        }}
      >
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-10">
          {/* Brand + Description */}
          <div className="flex flex-col items-start space-y-5 max-w-sm shrink-0">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border transition-transform group-hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg,#22c55e 0%,#16a34a 50%,#15803d 100%)",
                  borderColor: "rgba(255,255,255,.15)",
                }}
              >
                <Leaf size={22} color="white" strokeWidth={2.5} />
              </div>

              <div>
                <h2
                  className="text-2xl font-black tracking-tight leading-none"
                  style={{ color: "#16a34a" }}
                >
                  W2A Intelligence
                </h2>
                <p
                  className="text-[10px] font-semibold tracking-[0.25em] uppercase mt-1.5"
                  style={{ color: "var(--muted)" }}
                >
                  Smart Waste Management Platform
                </p>
              </div>
            </Link>

            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              A centralized platform that transforms urban waste management from a
              reactive disposal process into a proactive, resource-oriented system
              where every type of waste is treated as a recoverable asset. Mainly
              focused on Company Allocation.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2 w-full">
              <p
                className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: "#16a34a" }}
              >
                <Leaf size={14} style={{ color: "#16a34a" }} />
                Stay Updated
              </p>
              <div className="relative flex items-center w-full">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-11 px-4 pr-12 rounded-xl text-sm border outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--brand)",
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-1.5 w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-105"
                  style={{ backgroundColor: "#16a34a", color: "white" }}
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
                <h3
                  className="text-sm font-bold uppercase tracking-wider mb-5"
                  style={{ color: "#16a34a" }}
                >
                  {title}
                </h3>
                <ul className="space-y-3.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm font-medium transition-colors hover:underline underline-offset-4"
                        style={{ color: "var(--muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#16a34a")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Connect column */}
            <div className="min-w-[180px]">
              <h3
                className="text-sm font-bold uppercase tracking-wider mb-5"
                style={{ color: "#16a34a" }}
              >
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
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                      color: "var(--muted)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#16a34a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--muted)";
                    }}
                    aria-label={label}
                  >
                    <Icon size={15} />
                  </motion.a>
                ))}
              </div>
              <p
                className="text-sm font-medium flex items-center gap-1.5"
                style={{ color: "var(--muted)" }}
              >
                <Mail size={14} />
                Email: info@w2a.com
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar — centered copyright */}
        <div
          className="pt-8 mt-16 border-t flex justify-center text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
            © {currentYear} W2A Intelligence. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}