import "./globals.css";

export const metadata = {
  title: "W2A Intelligence",
  description: "Smart Waste-to-Assets Management and Company Allocation System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}