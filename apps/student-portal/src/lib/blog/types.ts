export interface BlogAuthor {
  name: string;
  jobTitle: string;
  bio: string;
  portfolioUrl: string;
  credentials: string[];
  sameAs: string[];
}

export interface BlogSection {
  heading: string;
  level: 2 | 3;
  /** Target 134–167 words per section for RAG extraction efficiency. */
  content: string;
  bullets?: string[];
  table?: {
    caption: string;
    headers: string[];
    rows: string[][];
  };
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** Answer-first lead: 40–60 words summarizing the core question. */
  answerLead: string;
  category: string;
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
  /** ISO date for quarterly refresh tracking. */
  nextRefreshDue: string;
  author: BlogAuthor;
  sections: BlogSection[];
  citations: { claim: string; source: string; url: string }[];
}
