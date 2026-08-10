import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { getAllCourses } from "./lib/content";

export const metadata: Metadata = {
  title: "ML 课程笔记 · AI Tutorial",
  description: "李宏毅老师课程学习笔记 — 机器学习、深度学习、强化学习、生成式 AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const courses = getAllCourses();

  return (
    <html lang="zh-CN">
      <body>
        <Sidebar courses={courses} />
        <main className="ml-72 min-h-screen">{children}</main>
      </body>
    </html>
  );
}