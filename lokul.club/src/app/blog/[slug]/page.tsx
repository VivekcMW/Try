"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  User,
  Calendar,
  Tag,
  Share2,
  Heart,
  MessageCircle,
  Bookmark,
  Mail,
  Link2,
  ChevronRight,
  Shield,
  BookOpen,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ════════════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════════ */

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: { name: string; role: string; bio: string };
  category: string;
  tags: string[];
  publishedAt: Date;
  updatedAt?: Date;
  readTime: number;
  featured: boolean;
  locality?: string;
};

const MOCK_POSTS: Record<string, BlogPost> = {
  "monsoon-safety-guide-2026": {
    slug: "monsoon-safety-guide-2026",
    title: "Monsoon Safety Guide 2026: Protect Your Home & Family",
    excerpt: "Essential tips to prepare your home for the monsoon season.",
    content: `
# Monsoon Safety Guide 2026

The monsoon season brings much-needed relief from the summer heat, but it also brings its share of challenges. From waterlogging to electrical hazards, here's a comprehensive guide to keeping your home and family safe.

## Before the Monsoon

### 1. Waterproofing Your Home

Start by inspecting your roof, walls, and windows for any cracks or leaks. Small cracks can let in significant amounts of water during heavy rains.

- **Roof inspection**: Check for loose tiles or damaged waterproofing membrane
- **Wall treatment**: Apply waterproof coating on external walls
- **Window sealing**: Replace worn-out rubber seals around windows

### 2. Drainage System

Ensure your balcony and terrace drains are clear of debris. Clogged drains are a major cause of water seepage.

### 3. Electrical Safety

This is crucial! Water and electricity are a dangerous combination.

- Get your electrical wiring inspected by a certified electrician
- Install earth leakage circuit breakers (ELCBs)
- Keep electrical appliances elevated from the floor
- Never use extension cords near areas that might get wet

## During Heavy Rains

### Emergency Kit Essentials

Keep these items ready in a waterproof bag:

1. Flashlight with extra batteries
2. First aid kit
3. Important documents in waterproof pouches
4. Emergency contact numbers
5. Portable phone charger
6. Basic medicines
7. Non-perishable food items
8. Clean drinking water

### If Waterlogging Occurs

- **Turn off main power supply** immediately if water enters your home
- Move to higher floors if you live in a flood-prone area
- Do not walk through flowing water - it may be deeper than it appears
- Stay away from electric poles and fallen power lines

## Children's Safety

- Educate children about monsoon hazards
- Keep them away from accumulated water (breeding ground for mosquitoes)
- Ensure they wear appropriate footwear
- Teach them not to touch electrical switches with wet hands

## Vehicle Safety

- Check your vehicle's wipers, brakes, and lights
- Maintain safe distance from other vehicles
- Avoid driving through waterlogged roads
- Keep emergency numbers handy

## Community Preparedness

Work with your RWA to:

- Identify community emergency contacts
- Set up a monsoon emergency WhatsApp group
- Plan evacuation routes for flood-prone areas
- Organize a community first aid training session

---

Stay safe this monsoon! If you found this guide helpful, share it with your neighbors on Lokul.

**Emergency Numbers:**
- Municipal Corporation: 1916
- Fire Brigade: 101
- Ambulance: 108
- Disaster Management: 1077
    `,
    author: {
      name: "Lokul Safety Team",
      role: "Community Safety",
      bio: "Dedicated to making neighborhoods safer through awareness and community action.",
    },
    category: "safety",
    tags: ["monsoon", "safety", "home-tips", "emergency"],
    publishedAt: new Date("2026-06-25"),
    readTime: 8,
    featured: true,
    locality: "Mumbai",
  },
  "how-rwa-lokhandwala-reduced-water-bills": {
    slug: "how-rwa-lokhandwala-reduced-water-bills",
    title: "How Lokhandwala RWA Reduced Water Bills by 40%",
    excerpt: "A success story of community-driven water conservation.",
    content: `
# How Lokhandwala RWA Reduced Water Bills by 40%

In 2025, Lokhandwala Complex's monthly water bills were spiraling out of control. The society of 450 families was paying over ₹8 lakhs per month. Today, that number has dropped to ₹4.8 lakhs - a 40% reduction. Here's how they did it.

## The Problem

Like many large societies in Mumbai, Lokhandwala Complex was grappling with:

- Leaky pipes and taps going unreported
- Water tankers adding to costs during supply cuts
- No system to track water consumption
- Lack of awareness among residents

## The Solution: A Three-Pronged Approach

### 1. Smart Metering

The RWA installed individual smart water meters for each flat. This brought immediate accountability.

> "When residents could see exactly how much water they were using, consumption dropped within the first month itself." - Vikram Desai, RWA President

### 2. Leak Detection Drive

A comprehensive leak detection drive found:
- 23 leaky taps
- 8 running toilets
- 3 underground pipe leaks

Total water being wasted: approximately 50,000 liters per day!

### 3. Rainwater Harvesting

The society invested ₹12 lakhs in rainwater harvesting infrastructure. During monsoon, they now collect and reuse over 15 lakh liters of rainwater annually.

## Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Monthly Water Bill | ₹8.2L | ₹4.8L | -40% |
| Per-flat Average | ₹1,822 | ₹1,067 | -41% |
| Tanker Orders/Month | 45 | 12 | -73% |

## Key Learnings

1. **Start with awareness** - Hold workshops, share data
2. **Make it visible** - Display water consumption publicly
3. **Fix the basics first** - Leaks are the biggest culprits
4. **Invest in infrastructure** - Rainwater harvesting pays for itself
5. **Create accountability** - Individual metering changes behavior

## What You Can Do

Interested in replicating this in your society? Here's a step-by-step plan:

1. Form a water committee
2. Conduct a water audit
3. Fix all leaks
4. Install smart meters
5. Set up rainwater harvesting
6. Track and celebrate progress

---

*Want to connect with Lokhandwala RWA to learn more? Join Lokul and we'll make the introduction!*
    `,
    author: {
      name: "Priya Sharma",
      role: "RWA Secretary",
      bio: "Passionate about sustainable community living. Leading water conservation efforts in Andheri.",
    },
    category: "community",
    tags: ["success-story", "water-conservation", "rwa", "sustainability"],
    publishedAt: new Date("2026-06-20"),
    readTime: 5,
    featured: true,
    locality: "Andheri West",
  },
};

const CATEGORY_ICONS: Record<string, typeof Shield> = {
  safety: Shield,
  community: BookOpen,
  tips: Lightbulb,
  news: TrendingUp,
};

/* ════════════════════════════════════════════════════════════════════════ */

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" });
}

function MarkdownContent({ content }: { content: string }) {
  // Basic markdown-like rendering (in production, use a proper markdown library)
  const lines = content.trim().split("\n");

  return (
    <div className="prose prose-lg max-w-none">
      {lines.map((line, i) => {
        // Headers
        if (line.startsWith("# ")) {
          return (
            <h1 key={i} className="text-3xl font-bold mt-8 mb-4" style={{ color: "var(--color-heading)" }}>
              {line.slice(2)}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-2xl font-bold mt-8 mb-4" style={{ color: "var(--color-heading)" }}>
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-xl font-semibold mt-6 mb-3" style={{ color: "var(--color-heading)" }}>
              {line.slice(4)}
            </h3>
          );
        }

        // Blockquotes
        if (line.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="border-l-4 pl-4 my-4 italic"
              style={{ borderColor: "var(--color-brand-600)", color: "var(--color-text-secondary)" }}
            >
              {line.slice(2)}
            </blockquote>
          );
        }

        // Horizontal rule
        if (line === "---") {
          return <hr key={i} className="my-8" style={{ borderColor: "var(--color-border)" }} />;
        }

        // Lists
        if (line.match(/^[0-9]+\. /)) {
          return (
            <p key={i} className="ml-4 mb-2" style={{ color: "var(--color-text-primary)" }}>
              {line}
            </p>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <p key={i} className="ml-4 mb-2 flex gap-2" style={{ color: "var(--color-text-primary)" }}>
              <span>•</span>
              <span>{line.slice(2)}</span>
            </p>
          );
        }

        // Empty lines
        if (line.trim() === "") {
          return <div key={i} className="h-4" />;
        }

        // Regular paragraphs
        return (
          <p key={i} className="mb-4 leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = MOCK_POSTS[slug];

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-surface-muted)" }}>
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--color-heading)" }}>
              Article Not Found
            </h1>
            <p className="text-lg mb-6" style={{ color: "var(--color-text-secondary)" }}>
              The article you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium"
              style={{ background: "var(--color-brand-600)", color: "white" }}
            >
              <ArrowLeft size={18} />
              Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const Icon = CATEGORY_ICONS[post.category] || BookOpen;

  return (
    <>
      <Navbar />
      <main className="min-h-screen" style={{ background: "var(--color-surface-muted)" }}>
        {/* Hero */}
        <section
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-800) 100%)" }}
        >
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Blog
            </Link>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Icon size={12} />
                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
              </span>
              {post.locality && (
                <span className="text-xs text-white/70">{post.locality}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {post.title}
            </h1>

            {/* Author & date */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <User size={16} className="text-white" />
                </div>
                <div>
                  <span className="font-medium text-white">{post.author.name}</span>
                  <span className="text-white/60"> · {post.author.role}</span>
                </div>
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {post.readTime} min read
              </span>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Main content */}
            <div className="lg:col-span-8">
              <div
                className="rounded-2xl border p-6 sm:p-10"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <MarkdownContent content={post.content} />

                {/* Tags */}
                <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                        style={{ background: "var(--color-surface-muted)", color: "var(--color-text-secondary)" }}
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Share */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Share:</span>
                    <button type="button" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Mail size={18} style={{ color: "var(--color-text-secondary)" }} />
                    </button>
                    <button type="button" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Link2 size={18} style={{ color: "var(--color-text-secondary)" }} />
                    </button>
                    <button type="button" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Share2 size={18} style={{ color: "var(--color-text-secondary)" }} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Heart size={18} style={{ color: "var(--color-text-secondary)" }} />
                    </button>
                    <button type="button" className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Bookmark size={18} style={{ color: "var(--color-text-secondary)" }} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Author card */}
              <div
                className="mt-6 rounded-2xl border p-6"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
                    style={{ background: "var(--color-brand-600)" }}
                  >
                    {post.author.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--color-heading)" }}>
                      {post.author.name}
                    </h3>
                    <p className="text-sm mb-2" style={{ color: "var(--color-brand-600)" }}>
                      {post.author.role}
                    </p>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {post.author.bio}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* CTA */}
              <div
                className="rounded-xl p-6 text-white"
                style={{ background: "linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-700) 100%)" }}
              >
                <h3 className="font-bold mb-2">Join Your Neighborhood</h3>
                <p className="text-sm text-white/80 mb-4">
                  Get local updates, safety alerts, and connect with verified neighbors.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 w-full justify-center rounded-lg py-2.5 text-sm font-semibold"
                  style={{ background: "var(--color-accent-500)" }}
                >
                  Sign Up Free
                  <ChevronRight size={16} />
                </Link>
              </div>

              {/* Related posts */}
              <div
                className="rounded-xl border p-5"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <h3 className="font-semibold mb-4" style={{ color: "var(--color-heading)" }}>
                  Related Articles
                </h3>
                <div className="space-y-4">
                  {Object.values(MOCK_POSTS)
                    .filter((p) => p.slug !== slug)
                    .slice(0, 3)
                    .map((relatedPost) => (
                      <Link
                        key={relatedPost.slug}
                        href={`/blog/${relatedPost.slug}`}
                        className="block group"
                      >
                        <h4 className="text-sm font-medium group-hover:text-brand-600 transition-colors line-clamp-2" style={{ color: "var(--color-heading)" }}>
                          {relatedPost.title}
                        </h4>
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                          {relatedPost.readTime} min read
                        </p>
                      </Link>
                    ))}
                </div>
              </div>

              {/* Newsletter */}
              <div
                className="rounded-xl border p-5"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <h3 className="font-semibold mb-2" style={{ color: "var(--color-heading)" }}>
                  Weekly Newsletter
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
                  Local news and safety updates, delivered every Friday.
                </p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border px-4 py-2.5 text-sm mb-2"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                />
                <button
                  type="button"
                  className="w-full rounded-lg py-2.5 text-sm font-medium text-white"
                  style={{ background: "var(--color-brand-600)" }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
