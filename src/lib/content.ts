import type { PostKind } from "../content/schema";

export type TimelineEntry = {
  id: string;
  href: string;
  date: Date;
  title: string;
  description: string;
  kind: "TECH" | "MEMORY" | "RESEARCH";
};

type PostEntry = {
  id: string;
  data: {
    title: string;
    description: string;
    publishDate: Date;
    kind: PostKind;
  };
};

type ResearchEntry = {
  id: string;
  data: {
    title: string;
    description: string;
    date: Date;
  };
};

type MomentEntry = ResearchEntry;

export const sortByDateDesc = <T extends { id: string; date: Date }>(entries: T[]): T[] =>
  [...entries].sort((left, right) => {
    const dateOrder = right.date.getTime() - left.date.getTime();
    if (dateOrder !== 0) return dateOrder;
    if (left.id < right.id) return -1;
    if (left.id > right.id) return 1;
    return 0;
  });

export const getPublishedPosts = <T extends { data: { draft?: boolean } }>(posts: T[]): T[] =>
  posts.filter((post) => post.data.draft !== true);

export const filterPostsByKind = <T extends { data: { kind: PostKind } }>(posts: T[], kind: PostKind): T[] =>
  posts.filter((post) => post.data.kind === kind);

export const getTagCounts = <T extends { data: { tags: readonly string[] } }>(posts: T[]): Map<string, number> => {
  const counts = new Map<string, number>();

  for (const post of posts) {
    const tags = new Set(post.data.tags.map((tag) => tag.trim().toLocaleLowerCase()).filter(Boolean));
    for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }

  return counts;
};

export const buildTimeline = (
  posts: PostEntry[],
  research: ResearchEntry[],
  moments: MomentEntry[],
): TimelineEntry[] =>
  sortByDateDesc([
    ...posts.map((post) => ({
      id: post.id,
      href: `/${post.data.kind}/${post.id}/`,
      date: post.data.publishDate,
      title: post.data.title,
      description: post.data.description,
      kind: post.data.kind === "tech" ? "TECH" as const : "MEMORY" as const,
    })),
    ...research.map((entry) => ({
      id: entry.id,
      href: `/research/#${entry.id}`,
      date: entry.data.date,
      title: entry.data.title,
      description: entry.data.description,
      kind: "RESEARCH" as const,
    })),
    ...moments.map((entry) => ({
      id: entry.id,
      href: `/memory/#${entry.id}`,
      date: entry.data.date,
      title: entry.data.title,
      description: entry.data.description,
      kind: "MEMORY" as const,
    })),
  ]);
