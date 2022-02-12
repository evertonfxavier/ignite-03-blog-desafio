import { ReactNode, Fragment } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { format, parseISO } from 'date-fns';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import ptBR from 'date-fns/locale/pt-BR/index.js';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  // first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactNode {
  const { isFallback } = useRouter();
  // const datePost = format(parseISO(post.first_publication_date), 'd MMM yyy', {
  //   locale: ptBR,
  // });

  // const formattedPost = {
  //   ...post,
  //   data: {
  //     ...post.data,
  //     content: post.data.content.map(c => ({
  //       ...c,
  //       body: RichText.asHtml(c.body),
  //     })),
  //   },
  // };

  return (
    <>
      <Head>
        <title>Post | spacetraveling</title>
      </Head>
      {/* {isFallback ? (
        <div>Carregando...</div>
      ) : ( */}
        <div className={commonStyles.Container}>
          <Header />
          <main className={styles.PostContainer}>
            {/* <img loading="lazy" src={post.data.banner.url} alt="unsplash" /> */}
            <section className={styles.PostContent}>
              {/* <h1>{post.data.title}</h1> */}
              <article className={styles.PostTitle}>
                <div>
                  <FiCalendar />
                  {/* <time>{datePost}</time> */}
                </div>
                <div>
                  <FiUser />
                  {/* <span>{post.data.author}</span> */}
                </div>
                <div>
                  <FiClock />
                  <time>4 min</time>
                </div>
              </article>
              <section>
                {/* {formattedPost.data.content.map(c => (
                  <Fragment key={c.heading}>
                    <h2>{c.heading}</h2>
                    <div dangerouslySetInnerHTML={{ __html: c.body }} />
                  </Fragment>
                ))} */}
              </section>
            </section>
          </main>
        </div>
      {/* // )} */}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ]);

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid,
    // first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      author: response.data.author,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map((c: { heading: any; body: any[]; }) => ({
        heading: c.heading,
        body: c.body.map((b: any) => ({
          ...b,
        })),
      })),
    },
  };

  return {
    props: {
      post,
    },
  };
};