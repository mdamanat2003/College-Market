import React from "react";
import {
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Search,
  BadgeCheck,
  Sparkles,
  Users,
  Star,
  CreditCard,
  GraduationCap,
  CircleDollarSign,
} from "lucide-react";

const features = [
  {
    title: "Secure Escrow Payments",
    description:
      "Hold funds safely until both sides confirm the handoff is complete.",
    icon: ShieldCheck,
  },
  {
    title: "Live Chat",
    description:
      "Negotiate details instantly with a fast, distraction-free messaging flow.",
    icon: MessageCircle,
  },
  {
    title: "Smart Search",
    description:
      "Find listings by category, price, campus, and intent in one glance.",
    icon: Search,
  },
  {
    title: "Verified Campus Users",
    description:
      "Keep your marketplace trusted with college email verification and badges.",
    icon: BadgeCheck,
  },
];

const highlights = [
  { label: "Campus groups", value: "120+" },
  { label: "Average response", value: "< 2 min" },
  { label: "Trusted sellers", value: "98.6%" },
];

export default function Home() {
  return (
    <>
      {/* CSS Keyframes for continuous color spectrum animation */}
      <style>{`
        @keyframes rainbow-text {
          0% { color: #FF0000; }
          14% { color: #FF7F00; }
          28% { color: #FFFF00; }
          42% { color: #00FF00; }
          56% { color: #0000FF; }
          70% { color: #4B0082; }
          84% { color: #9400D3; }
          100% { color: #FF0000; }
        }
        .animate-rainbow-text {
          animation: rainbow-text 7s linear infinite;
        }
      `}</style>

      <main
        id="top"
        className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 md:px-6 lg:px-8 lg:pt-12"
      >
        {/* Animated Welcome Banner */}
        <div className="relative mb-12 flex w-full items-center justify-center overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-r from-emerald-100/60 to-cyan-100/60 py-16 shadow-sm md:mb-16 md:py-24 lg:py-32">
          <div className="absolute inset-0 rounded-[2rem] border border-white/50 mix-blend-overlay"></div>
          
          <h1
            className="animate-rainbow-text z-10 text-center font-black uppercase leading-[0.85] tracking-[-0.07em] drop-shadow-sm md:tracking-[-0.09em]"
            style={{ fontSize: "clamp(3.5rem, 10vw, 11rem)" }}
          >
            Welcome to CampusCart
          </h1>
        </div>

        {/* 1. Hero Section */}
        <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Trusted campus trading for students
            </div>

            <h1 className="max-w-xl text-5xl font-semibold tracking-[-0.04em] text-gray-900 md:text-7xl lg:text-8xl">
              Buy, sell, and chat across campus with confidence.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
              CampusCart is the premium marketplace for college communities,
              combining escrow-backed safety, verified profiles, and instant
              messaging in one polished experience.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="http://localhost:8081"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </a>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100">
                <CreditCard className="h-4 w-4 text-blue-600" />
                View Demo
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-gray-200 bg-white p-4"
                >
                  <p className="text-2xl font-semibold tracking-tight text-gray-900">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Mockup Card */}
          <div className="relative min-w-0">
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                    CampusCart Dashboard
                  </p>
                  <p className="mt-1 text-lg font-semibold leading-6 text-gray-900">
                    Student commerce at a glance
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <Users className="h-3.5 w-3.5 text-emerald-700" />
                  247 online
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-[1.5rem] border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Featured listing</p>
                      <h2 className="mt-1 text-xl font-semibold text-gray-900">
                        MacBook Air M2
                      </h2>
                    </div>
                    <div className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      Escrow ready
                    </div>
                  </div>

                  <div className="mt-4 h-44 rounded-[1.25rem] border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="h-3 w-24 rounded-full bg-gray-200" />
                        <div className="h-8 w-36 rounded-full bg-gray-200" />
                        <div className="h-3 w-28 rounded-full bg-gray-150" />
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-white p-3">
                        <Star className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-5 gap-2">
                      {[46, 68, 55, 82, 64].map((height, index) => (
                        <div
                          key={index}
                          className="flex h-28 items-end rounded-full bg-gray-100 p-1"
                        >
                          <div
                            className="w-full rounded-full bg-gradient-to-b from-blue-300 to-blue-500"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] border border-gray-200 bg-white p-4">
                    <p className="text-sm text-gray-600">Live chat</p>
                    <div className="mt-3 space-y-3">
                      <div className="ml-auto w-fit rounded-2xl rounded-br-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900">
                        Is this still available?
                      </div>
                      <div className="w-fit rounded-2xl rounded-bl-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                        Yes, can meet near the library at 5 PM.
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-gray-200 bg-white p-4">
                    <p className="text-sm text-gray-600">Verified seller</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-lg font-semibold text-blue-700">
                        A
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Aarav, Computer Science
                        </p>
                        <p className="text-sm text-gray-600">
                          4.9 rating · 31 sales
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. About CampusCart Section (Centered & Enlarged) */}
        <section className="mt-24 flex flex-col items-center justify-center text-center px-4">
          <p className="text-sm uppercase tracking-[0.4em] text-blue-600 font-bold">
            About CampusCart
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl max-w-4xl">
            A polished marketplace built for student life.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
            CampusCart blends the calm confidence of premium SaaS design with the practical needs of a campus marketplace, making every step from discovery to payment feel effortless.
          </p>
        </section>

        {/* 4. Features Section (Symmetrical & Vertical Layout) */}
        <section id="features" className="mt-20 pt-10 border-t border-gray-100">
          <div className="mb-12 flex flex-col items-center justify-center text-center gap-4">
            <p className="text-sm uppercase tracking-[1em] text-blue-600 font-bold">
              Features
            </p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Everything you need, built to last.
            </h2>
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-600">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              Made for college communities
            </div>
          </div>

          {/* Symmetrical Vertical Grid Layout */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-md min-h-[250px]"
                >
                  <div className="flex h-full flex-col justify-between gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <CircleDollarSign className="h-5 w-5 text-gray-300 transition group-hover:text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 5. Pricing CTA */}
        <section
          id="pricing"
          className="mt-24 rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm md:p-12"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              {/* <p className="text-sm uppercase tracking-[0.4em] text-gray-500">
                Ready to launch
              </p> */}
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-5xl">
                A premium campus marketplace that feels safe, fast, and built just for you.
              </h2>
            </div>
            <a
              href="http://localhost:8081/register"
              className="group rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 shrink-0 text-center"
            >
              <span className="inline-flex items-center gap-2">
                Sign Up Now
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </a>
          </div>
        </section>
      </main>
    </>
  );
}