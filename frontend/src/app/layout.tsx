import { ThemeProvider } from "@/providers/ThemeProvider";
import Script from "next/script";
import "./globals.css";

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
    <html
      lang="en"
      className="h-full"
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
      </head>

      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}