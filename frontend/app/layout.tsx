import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { SkillProvider } from "@/context/skillContext";
import { AssessmentProvider } from "@/context/assessmentContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career Intelligence",
  description: "AI-powered skill tracking and roadmap generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <SkillProvider>
            <AssessmentProvider>
              {children}
            </AssessmentProvider>
          </SkillProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
