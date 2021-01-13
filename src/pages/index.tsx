import { Fragment, useReducer, useContext, useCallback } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import nodeFetch from 'node-fetch';
import { AccessTokenContext } from '../contexts';
import Link from '../components/link';
import InfiniteScroller from '../components/infiniteScroller';
import { Post } from '../types/Data';
import useCursorAndOffset from '../hooks/useCursorAndOffset';
import { constants } from '../utils';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const { POSTS_GET_LIMIT } = constants;
export const getServerSideProps: GetServerSideProps = async () => {
  const response = await nodeFetch(
    `https://api.simplecrudboard.click/browser/posts`
  );

  if (!response.ok) {
    return {
      props: {
        initialData: [],
      },
    };
  }

  const json: Post[] = await response.json();

  return {
    props: {
      initialData: json,
    },
  };
};

const dataReducer = (state: Post[], action: { payload: Post[] }): Post[] => {
  const newState: Post[] = [...state, ...action.payload];

  return newState;
};

const HomePage = ({ initialData }: { initialData: Post[] }) => {
  const { accessToken } = useContext(AccessTokenContext);
  const [data, setData] = useReducer(dataReducer, initialData);
  const { cursor, offset } = useCursorAndOffset(data, 'postNumber');

  const fetchMore = useCallback(async () => {
    if (data.length % POSTS_GET_LIMIT !== 0) {
      return;
    }

    const response = await fetch(
      `https://api.simplecrudboard.click/browser/posts?cursor=${cursor}&offset=${offset}`
    );

    if (response.ok) {
      const json: Post[] = await response.json();

      setData({ payload: json });
    }
  }, [cursor, data.length, offset]);

  return (
    <Fragment>
      <Head>
        <title>홈</title>
      </Head>

      <div>
        <h2 className="sr-only">전체 글 목록</h2>
        {accessToken && (
          <div className="text-right pr-4 sm:pr-6 md:pr-12 lg:pr-24 xl:pr-36 2xl:pr-48 mb-8">
            <Link
              href="/posts/form"
              className="bg-green-600 hover:bg-white py-2 px-4 font-semibold text-white hover:text-green-600 text-xl rounded-lg shadow-md"
            >
              글쓰기
            </Link>
          </div>
        )}

        <InfiniteScroller
          container="ul"
          items={data}
          fetchMore={fetchMore}
          idPrefix="post"
          render={(post: Post, index) => {
            return (
              <li
                key={post._id}
                id={`post-${index + 1}`}
                className="flex flex-col sm:flex-row sm:justify-center items-center sm:h-48 mb-4 sm:mb-6"
              >
                <h3 className="sm:w-60 md:w-96 sm:p-1 sm:mr-4 text-base md:text-lg text-center sm:text-left truncate order-2">
                  <Link href={`/posts/${post._id}`}>{post.title}</Link>
                </h3>

                <div className="w-48 h-48 sm:mr-6 md:mr-8 order-1 text-center">
                  <Link
                    href={`/posts/${post._id}`}
                    className="w-full h-full inline-block sm:block"
                  >
                    <img
                      className="w-full h-full"
                      src={post.thumbnail.src ?? ''}
                      alt={
                        post.thumbnail.src
                          ? `${post.title} thumbnail`
                          : 'No Image'
                      }
                    />
                  </Link>
                </div>

                <div className="sm:w-36 md:w-40 sm:p-1 sm:mr-4 text-base md:text-lg text-center truncate order-3">
                  {post.author.username}
                </div>
                <div className="sm:w-36 md:w-40 sm:p-1 sm:mr-4 text-base md:text-lg text-center order-4">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    locale: ko,
                    addSuffix: true,
                  })}
                </div>
              </li>
            );
          }}
        />
      </div>
    </Fragment>
  );
};

export default HomePage;
