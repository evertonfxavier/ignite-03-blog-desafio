import {
  ReactNode,
  Fragment,
  Key,
  ReactChild,
  ReactFragment,
  ReactPortal,
} from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";
import { format, parseISO } from "date-fns";
import { FiCalendar, FiUser, FiClock } from "react-icons/fi";

import ptBR from "date-fns/locale/pt-BR/index.js";
import Header from "../../components/Header";

import { getPrismicClient } from "../../services/prismic";

import commonStyles from "../../styles/common.module.scss";
import styles from "./post.module.scss";

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    contents: Array<any>;
  };
}

interface PostProps {
  post: Post;
  // contents: any;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  return (
    <>
      <Head>
        <title>Post | spacetraveling</title>
      </Head>
      {isFallback ? (
        <div>Carregando...</div>
      ) : (
        <div className={commonStyles.Container}>
          <Header />
          <main className={styles.PostContainer}>
            <img loading="lazy" src={post.data.banner.url} alt="unsplash" />
            <section className={styles.PostContent}>
              <h1>{post.data.title}</h1>
              <article className={styles.PostTitle}>
                <div>
                  <FiCalendar />
                  <time>{post.first_publication_date}</time>
                </div>
                <div>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
                <div>
                  <FiClock />
                  <time>4 min</time>
                </div>
              </article>
              <section>
                {post.data.contents.map((c: any, idx: Key) => (
                  <Fragment key={idx}>
                    <h2>{c.heading}</h2>
                    <div dangerouslySetInnerHTML={{ __html: c.body }} />
                  </Fragment>
                ))}
              </section>
            </section>
          </main>
        </div>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at("document.type", "post"),
  ]);

  const paths = posts.results.map((post) => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID("posts", String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: format(
      parseISO(response.first_publication_date),
      "d MMM yyy",
      { locale: ptBR }
    ),
    data: {
      title: response.data.title,
      author: response.data.author,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      contents: response.data.content.map(
        (item: { heading: string; body: string }) => {
          return {
            heading: RichText.asText(item.heading),
            body: RichText.asHtml(item.body),
          };
        }
      ),
    },
  };

  return {
    props: { post },
  };
};
