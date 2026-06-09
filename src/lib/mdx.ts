import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

/** Shared MDXRemote config for blog posts and skill guides — GFM tables/strikethrough,
 *  Shiki syntax highlighting, and rehype-slug so headings get id attributes for TOC links. */
export const mdxOptions: MDXRemoteProps["options"] = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: "one-dark-pro",
          keepBackground: false,
        },
      ],
    ],
  },
};
