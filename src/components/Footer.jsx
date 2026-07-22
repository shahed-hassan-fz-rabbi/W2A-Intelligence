import Link from "next/link";
import { Github, Mail, Leaf } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
                W2A
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold text-ink">
                  W2A Intelligence
                </span>
                <span className="block text-[11px] text-muted">
                  Smart Waste-to-Assets Management
                </span>
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              A centralized platform that transforms urban waste management from
              a reactive disposal process into a proactive, resource-oriented
              system where every type of waste is treated as a recoverable asset.
              Mainly Focus on Company Allocation.

            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-brand-700">
              <Leaf className="h-3.5 w-3.5" />
              Smart Waste-to-Assets Management
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-ink uppercase">
              Modules
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/collection" className="text-muted hover:text-brand-600">
                  Waste Collection
                </Link>
              </li>
              <li>
                <Link href="/assignments" className="text-muted hover:text-brand-600">
                  Company Allocation
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted hover:text-brand-600">
                  Assets Generated
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-muted hover:text-brand-600">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Project info */}
          <div>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-ink uppercase">
              Project
            </h3>
            <ul className="space-y-2 text-xs text-muted">
              <li>Department of CSE</li>
              <li>Comilla University</li>
              
              <li className="flex items-center gap-1.5 pt-1">
                <Mail className="h-3.5 w-3.5" />
                <a
                  href="mailto:info@w2a.com"
                  className="hover:text-brand-600"
                >
                  info@w2a.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line pt-5 text-xs text-muted sm:flex-row">
          <p>© {year} W2A Intelligence. Copyright</p>
          <div className="flex items-center gap-4">
            <Link href="/settings" className="hover:text-brand-600">
              Settings
            </Link>
            <span className="text-line">|</span>
            
          </div>
        </div>
      </div>
    </footer>
  );
}