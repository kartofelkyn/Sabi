import { ThemeProvider } from "@/providers/ThemeProvider";
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

      </head>

      <body className="flex min-h-screen flex-col">

        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}