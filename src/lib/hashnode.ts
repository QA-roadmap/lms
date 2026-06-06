const GQL_ENDPOINT = "https://gql.hashnode.com";
const HOST = process.env.HASHNODE_PUBLICATION_HOST!;

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(GQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HASHNODE_ACCESS_TOKEN!}`,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 }, // ISR — refresh every hour
  });

  if (!res.ok) throw new Error(`Hashnode API error: ${res.status}`);
  const json = (await res.json()) as { data: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}

export type PostCard = {
  id: string;
  title: string;
  slug: string;
  brief: string;
  publishedAt: string;
  readTimeInMinutes: number;
  coverImage: { url: string } | null;
  tags: { name: string; slug: string }[];
};

export type PostFull = PostCard & {
  subtitle: string | null;
  content: { html: string };
  author: { name: string; profilePicture: string | null };
  seo: { title: string | null; description: string | null } | null;
};

const POST_CARD_FRAGMENT = `
  id
  title
  slug
  brief
  publishedAt
  readTimeInMinutes
  coverImage { url }
  tags { name slug }
`;

export async function getPosts(first = 20): Promise<PostCard[]> {
  const data = await gql<{
    publication: { posts: { edges: { node: PostCard }[] } };
  }>(
    `query Posts($host: String!, $first: Int!) {
      publication(host: $host) {
        posts(first: $first) {
          edges { node { ${POST_CARD_FRAGMENT} } }
        }
      }
    }`,
    { host: HOST, first }
  );
  return data.publication.posts.edges.map((e) => e.node);
}

export async function getPost(slug: string): Promise<PostFull | null> {
  const data = await gql<{
    publication: { post: PostFull | null };
  }>(
    `query Post($host: String!, $slug: String!) {
      publication(host: $host) {
        post(slug: $slug) {
          ${POST_CARD_FRAGMENT}
          subtitle
          content { html }
          author { name profilePicture }
          seo { title description }
        }
      }
    }`,
    { host: HOST, slug }
  );
  return data.publication.post;
}

export async function getPostSlugs(): Promise<string[]> {
  const posts = await getPosts(100);
  return posts.map((p) => p.slug);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
