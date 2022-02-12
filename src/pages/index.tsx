import { ReactNode, useCallback, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import Prismic from "@prismicio/client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { GetStaticProps } from "next";
import { FiCalendar, FiUser } from "react-icons/fi";

import { getPrismicClient } from "../services/prismic";

import commonStyles from "../styles/common.module.scss";
import styles from "./home.module.scss";
import { RichText } from "prismic-dom";

interface Post {
  slug?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactNode {
  const { next_page, results } = postsPagination;

  const [posts, setPosts] = useState<Post[]>(() => {
    const formatedPosts = results;

    return formatedPosts;
  });

  const handleFetchNewPagePosts = useCallback(() => {
    fetch(next_page)
      .then((response) => response.json())
      .then((data) => {
        data.results.map(
          (result: {
            uid: string;
            first_publication_date: string;
            data: { title: string; subtitle: any[]; author: string };
          }) => {
            const formatedResult = {
              slug: result.uid,
              first_publication_date: format(
                parseISO(result.first_publication_date),
                "d MMM yyy",
                { locale: ptBR }
              ),
              data: {
                title: RichText.asText(result.data.title),
                subtitle:
                  result.data.subtitle.find(
                    (subtitle: { type: string }) =>
                      subtitle.type === "paragraph"
                  )?.text ?? "",
                author: RichText.asText(result.data.author),
              },
            };

            return setPosts((prevPosts) => [...prevPosts, formatedResult]);
          }
        );
      });
  }, [next_page]);

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <div className={commonStyles.Container}>
        <main className={styles.Wrapper}>
          <section className={styles.Content}>
            <img src="/images/logo.svg" alt="logo" />

            <div className={styles.postsContainer}>
              {posts.map((post) => (
                <Link key={post.slug} href={`/post/${post.slug}`}>
                  <a className={styles.postContent}>
                    <header>
                      <h1>{post.data.title}</h1>
                      <p>{post.data.subtitle}</p>
                    </header>
                    <footer>
                      <div>
                        <FiCalendar />
                        <time>{post.first_publication_date}</time>
                      </div>
                      <div>
                        <FiUser />
                        <span>{post.data.author}</span>
                      </div>
                    </footer>
                  </a>
                </Link>
              ))}
            </div>

            {next_page && (
              <button type="button" onClick={handleFetchNewPagePosts}>
                Carregar mais posts
              </button>
            )}
          </section>
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at("document.type", "posts")],
    {
      fetch: ["posts.title", "posts.author", "posts.subtitle"],
      pageSize: 1,
    }
  );

  const results = postsResponse.results.map((post) => {
    return {
      slug: post.uid,
      first_publication_date: format(
        parseISO(post.first_publication_date),
        "d MMM yyy",
        { locale: ptBR }
      ),
      data: {
        title: RichText.asText(post.data.title),
        subtitle:
          post.data.subtitle.find(
            (subtitle: { type: string }) => subtitle.type === "paragraph"
          )?.text ?? "",
        author: RichText.asText(post.data.author),
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
