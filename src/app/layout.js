import "./globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "W2A Intelligence",
  description: "Smart Waste-to-Assets Management and Company Allocation System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
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