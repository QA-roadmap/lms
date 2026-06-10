import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
import { auth } from "@/auth";
import { getActiveCourseSlugs } from "@/lib/access";
import { SITE_NAME, courseSchema } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((course: { slug: string }) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};

  const description = course.tagline ?? course.description;

  return {
    title: course.title,
    description,
    alternates: { canonical: `/courses/${slug}` },
    openGraph: {
      type: "website",
      title: course.title,
      description,
      url: `/courses/${slug}`,
      siteName: SITE_NAME,
      locale: "uk_UA",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description,
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const [course, session] = await Promise.all([getCourseBySlug(slug), auth()]);
  if (!course) notFound();

  const isAvailable = course.status === "available";

  let hasPurchased = false;
  if (session?.user?.id) {
    const activeSlugs = await getActiveCourseSlugs(session.user.id);
    hasPurchased = activeSlugs.has(slug);
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema(course)) }}
      />

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

      {/* Pricing CTA or purchased banner */}
      {isAvailable && (
        hasPurchased ? (
          <section id="pricing" className="bg-zinc-950 px-4 py-24">
            <div className="mx-auto max-w-xl rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Ти вже маєш доступ</h2>
              <p className="mt-2 text-zinc-400">Цей курс доступний у твоєму кабінеті</p>
              <Link
                href={`/academy/${slug}`}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-500"
              >
                Продовжити навчання →
              </Link>
            </div>
          </section>
        ) : (
          course.priceUSD !== undefined && <Pricing course={course} />
        )
      )}

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
