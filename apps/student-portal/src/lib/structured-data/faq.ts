/** FAQ answer islands: 20–30 words each, liftable verbatim by LLMs. FBA-focused. */
export const landingFaqItems = [
  {
    question: "What is Amazon FBA private label?",
    answer:
      "Amazon FBA private label means sourcing your own branded product, storing it in Amazon warehouses, and selling under your brand. ScaleX LaunchPad teaches the full path from research to first sale.",
  },
  {
    question: "Who is ScaleX LaunchPad for?",
    answer:
      "ScaleX LaunchPad is for beginners and early sellers who want a structured Amazon FBA private label system with mentor-validated tasks, not passive video courses without accountability.",
  },
  {
    question: "How does the 8-milestone roadmap work?",
    answer:
      "You progress through Foundation, Business Setup, Brand Research, Product Hunting, Sourcing, Brand Development, Launch, and Scaling. Each milestone ends with a task mentors must approve.",
  },
  {
    question: "Does AI auto-approve my milestone tasks?",
    answer:
      "No. The AI Mentor answers questions and pre-scores submissions. Final approval on milestone-gating tasks always belongs to a human mentor, preserving quality and accountability.",
  },
  {
    question: "What is the difference between Standard and Premium?",
    answer:
      "Standard includes recorded curriculum, AI Mentor, community, and templates. Premium Launch Program adds live classes, private mentor calls, priority review, and hands-on launch support.",
  },
  {
    question: "How does payment work on ScaleX LaunchPad?",
    answer:
      "Enrollment uses a configurable split—typically 70% due first and 30% remaining. Stripe Checkout handles payment; your account activates after the first successful payment webhook.",
  },
  {
    question: "What do I submit for product hunting?",
    answer:
      "Milestone four requires a Product Hunting Sheet with demand, competition, and profit signals. Mentors review the sheet before you advance to supplier sourcing.",
  },
  {
    question: "Can I launch on Amazon without prior experience?",
    answer:
      "Yes. The program starts at beginner level and ladders each lesson into a real deliverable—business plan, brand direction, supplier finalization, launch checklist—so experience builds through execution.",
  },
  {
    question: "What support do students get between lessons?",
    answer:
      "Students get AI Mentor chat grounded in academy content, community posts, support tickets, and—on Premium—live sessions and private mentor calls for launch blockers.",
  },
  {
    question: "How is progress tracked?",
    answer:
      "Dashboards show current milestone, completion percentage, and next action. Lesson completions and approved tasks roll up so stage and next step stay visible at a glance.",
  },
  {
    question: "What is private label versus wholesale on Amazon?",
    answer:
      "Private label sells your branded product; wholesale resells existing brands. ScaleX LaunchPad focuses on private label because brand equity and margins compound as you scale.",
  },
  {
    question: "When should I start product research?",
    answer:
      "After foundation and business setup. ScaleX sequences Brand Research and Product Hunting so you validate demand and competition before locking suppliers or brand assets.",
  },
] as const;

export type FaqItem = (typeof landingFaqItems)[number];
