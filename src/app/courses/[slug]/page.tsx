import { notFound } from "next/navigation";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { CourseHero } from "@/components/marketing/CourseHero";
import { CourseForWhom } from "@/components/marketing/CourseForWhom";
import { CourseSkillsSection } from "@/components/marketing/CourseSkillsSection";
import { ModuleAccordion } from "@/components/marketing/ModuleAccordion";
import { CourseTestimonials } from "@/components/marketing/CourseTestimonials";
import { CourseFAQ } from "@/components/marketing/CourseFAQ";
import { Pricing } from "@/components/marketing/Pricing";
import { getCourses, getCourseBySlug } from "@/lib/sanity";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((course: { slug: string }) => ({ slug: course.slug }));
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const isAvailable = course.status === "available";

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      {/* Hero */}
      <CourseHero course={course} />

      {/* For whom */}
      <CourseForWhom />

      {/* Skills covered */}
      <CourseSkillsSection courseSlug={slug} />

      {/* Curriculum */}
      <section id="curriculum" className="bg-zinc-950 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-500">
              Програма
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Що всередині курсу
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              {course.modules.length} модулів, кожен з практичними завданнями та фінальним проєктом
            </p>
          </div>
          <ModuleAccordion
            modules={course.modules}
            defaultOpenId={course.modules[0]?._id ?? null}
          />
        </div>
      </section>

      {/* Testimonials */}
      <CourseTestimonials />

      {/* Pricing CTA */}
      {isAvailable && course.priceUSD !== undefined && <Pricing course={course} />}

      {/* FAQ */}
      <CourseFAQ />

      {/* Final bottom CTA for coming soon */}
      {!isAvailable && (
        <section className="bg-zinc-950 px-4 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-600">Незабаром</p>
          <h2 className="mt-3 text-2xl font-bold text-white">Курс ще готується</h2>
          <p className="mx-auto mt-3 max-w-sm text-zinc-500">
            Залиш email і ми повідомимо, коли відкриється доступ
          </p>
        </section>
      )}

      <Footer />
    </div>
  );
}
