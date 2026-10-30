
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";
import Script from "next/script";

const themeScript = `
(function () {
  var theme = "neutral";

  try {
    var saved = localStorage.getItem("sabi-theme");

    if (
      saved === "light" ||
      saved === "neutral" ||
      saved === "dark"
    ) {
      theme = saved;
    }
  } catch (error) {}

  document.documentElement.dataset.theme = theme;
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className="h-full" lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>

      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}