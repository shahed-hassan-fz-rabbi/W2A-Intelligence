// Location: src/app/layout.js
import "./globals.css";
import { Toaster } from "sonner";
import W2AChatbot from "@/components/W2AChatbot";

export const metadata = {
  title: "W2A Intelligence",
  description: "Smart Waste-to-Assets Management Ai integratedand Company Allocation System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* Floating Database-Aware AI Assistant */}
        <W2AChatbot />

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: { borderRadius: "12px", fontSize: "14px" },
          }}
        />
      </body>
    </html>
  );
}