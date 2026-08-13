import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllCourses } from "./lib/content";

export default function Home() {
  const courses = getAllCourses();
  const firstWithLecture = courses.find((c) => c.lectures.length > 0);

  if (firstWithLecture) {
    redirect(`/courses/${firstWithLecture.slug}/${firstWithLecture.lectures[0].slug}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-neutral-500">暂无课程内容</p>
    </div>
  );
}
