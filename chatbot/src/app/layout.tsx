import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Andrew Trinh — AI Interview Bot",
  description: "Ask Andrew Trinh's AI persona about his experience, skills, research, and projects.",
};

// Runs before hydration to set data-theme from localStorage, avoiding a
// dark->light (or light->dark) flash for returning visitors — inline and
// synchronous, so it must stay a plain string rather than an imported module.
const THEME_INIT_SCRIPT = `
  try {
    var t = localStorage.getItem('ctp-theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-ctp-base text-ctp-text">{children}</body>
    </html>
  );
}
