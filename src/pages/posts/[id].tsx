import { GetServerSideProps } from 'next';
import nodeFetch from 'node-fetch';
import { useCallback, useContext, Fragment, useReducer, useState } from 'react';
import Head from 'next/head';
import { UserContext, AccessTokenContext, CsrfContext } from '../../contexts';
import { Post } from '../../types/Data';
import Link from '../../components/link';
import { CommentForm, SuperCommentsList } from '../../components/comments';
import { Comment } from '../../types/Data';
import useCursorAndOffset from '../../hooks/useCursorAndOffset';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const postId = context.params.id;
  const postResponse = nodeFetch(
    `https://api.simplecrudboard.click/browser/posts/${postId}`
  );
  const commentsResponse = nodeFetch(
    `https://api.simplecrudboard.click/browser/comments?postId=${postId}`
  );

  const awaitedPostResponse = await postResponse;
  const awaitedCommentsResponse = await commentsResponse;

  if (awaitedPostResponse.status === 404) {
    return {
      notFound: true,
    };
  }
  const post: Post = await awaitedPostResponse.json();

  if (!awaitedCommentsResponse.ok) {
    return {
      props: {
        data: { ...post, comments: [] },
      },
    };
  }

  const comments = await awaitedCommentsResponse.json();

  return {
    props: {
      data: { ...post, comments },
    },
  };
};

const Modal = dynamic(() => import('../../components/modal'), { ssr: false });

const commentsReducer = (
  state: Comment[],
  action: {
    type: 'add' | 'modify' | 'remove';
    payload: Comment[]; // payload will used when type is add
    superCommentId?: string; // is used to add subComments or modify subComemnt
    commentId?: string; // commentId is used when type is not add
    contents?: string; // contents is used when type is update
  }
) => {
  const { type, superCommentId, payload, commentId, contents } = action;

  if (type === 'add') {
    if (superCommentId) {
      const superCommentIndex = state.findIndex(
        (comment) => comment._id === superCommentId
      );

      const superComment = state[superCommentIndex];

      const newSubComments: Comment[] = [
        ...superComment.subComments,
        ...payload,
      ];

      const newSuperComment: Comment = {
        ...superComment,
        subComments: newSubComments,
        subCommentsCount: newSubComments.length,
      };

      const newState = [
        ...state.slice(0, superCommentIndex),
        newSuperComment,
        ...state.slice(superCommentIndex + 1),
      ];

      return newState;
    }

    return [...state, ...payload];
  }

  if (type === 'modify') {
    if (superCommentId) {
      const superCommentIndex = state.findIndex(
        (comment) => comment._id === superCommentId
      );

      const superComment = state[superCommentIndex];
      const updatedSubCommentIndex = superComment.subComments.findIndex(
        (comment) => comment._id === commentId
      );
      const updatedSubComment = {
        ...superComment.subComments[updatedSubCommentIndex],
        contents,
      };

      const newSubComments: Comment[] = [
        ...superComment.subComments.slice(0, updatedSubCommentIndex),
        updatedSubComment,
        ...superComment.subComments.slice(updatedSubCommentIndex + 1),
        ...payload,
      ];

      const newSuperComment: Comment = {
        ...superComment,
        subComments: newSubComments,
      };

      const newState = [
        ...state.slice(0, superCommentIndex),
        newSuperComment,
        ...state.slice(superCommentIndex + 1),
      ];

      return newState;
    }

    const updatedSuperCommentIndex = state.findIndex(
      (comment) => comment._id === commentId
    );
    const updatedSuperComment = {
      ...state[updatedSuperCommentIndex],
      contents,
    };

    return [
      ...state.slice(0, updatedSuperCommentIndex),
      updatedSuperComment,
      ...state.slice(updatedSuperCommentIndex + 1),
      ...payload,
    ];
  }

  if (type === 'remove') {
    if (superCommentId) {
      const superCommentIndex = state.findIndex(
        (comment) => comment._id === superCommentId
      );

      const superComment = state[superCommentIndex];

      const deletedSubComments = superComment.subComments.filter(
        (comment) => comment._id !== commentId
      );
      const newSuperComment: Comment = {
        ...superComment,
        subComments: deletedSubComments,
        subCommentsCount: deletedSubComments.length,
      };

      return [
        ...state.slice(0, superCommentIndex),
        newSuperComment,
        ...state.slice(superCommentIndex + 1),
      ];
    }

    return state.filter((comment) => comment._id !== commentId);
  }

  return state;
};

const PostPage = ({ data }: { data: Post }) => {
  const { user } = useContext(UserContext);
  const { accessToken } = useContext(AccessTokenContext);
  const csrfToken = useContext(CsrfContext);
  const [comments, setComments] = useReducer(commentsReducer, data.comments);
  const { cursor, offset } = useCursorAndOffset(comments, 'commentNumber');
  const router = useRouter();
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);

  const commentsFetch = useCallback(
    async (cursor: number, offset: number, superCommentId?: string) => {
      try {
        if (superCommentId) {
          // if superCommentId exist
          // then fetch super comment's sub-comments
          const response = await fetch(
            `https://api.simplecrudboard.click/browser/comments?postId=${data._id}&superCommentId=${superCommentId}&cursor=${cursor}&offset=${offset}`
          );

          if (!response.ok) {
            return [];
          }

          const json: Comment[] = await response.json();

          return json;
        }

        const response = await fetch(
          `https://api.simplecrudboard.click/browser/comments?postId=${data._id}&cursor=${cursor}&offset=${offset}`
        );

        if (!response.ok) {
          return [];
        }

        const json: Comment[] = await response.json();

        return json;
      } catch (e) {
        return [];
      }
    },
    [data._id]
  );

  const commentFormHandlerCallbackHOF = useCallback(
    (
      cursor: number,
      offset: number,
      commentId?: string,
      superCommentId?: string,
      mentionId?: string
    ) => (contents: string) => async () => {
      try {
        const formResponse = await fetch(
          `https://api.simplecrudboard.click/browser/comments/${
            commentId ?? ''
          }`,
          {
            method: commentId ? 'PATCH' : 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              contents,
              post: { _id: data._id },
              _csrf: csrfToken,
              superComment: superCommentId
                ? { _id: superCommentId }
                : undefined,
              mention: mentionId ? { _id: mentionId } : undefined,
            }),
          }
        );

        if (!formResponse.ok) {
          alert('댓글 등록에 실패했습니다');
          return;
        }

        const comments: Comment[] = await commentsFetch(
          cursor,
          offset,
          superCommentId
        );

        setComments({
          type: commentId ? 'modify' : 'add',
          payload: comments,
          superCommentId,
          commentId,
          contents: commentId ? contents : undefined,
        });
      } catch (e) {
        console.error(e);
      }
    },
    [accessToken, data._id, csrfToken, commentsFetch]
  );

  const commentsfetchMoreCallbackHOF = useCallback(
    (
      cursor: number,
      offset: number,
      noMore: boolean,
      superCommentId?: string
    ) => {
      return async function () {
        if (noMore) {
          return;
        }

        const comments = await commentsFetch(cursor, offset, superCommentId);
        setComments({ type: 'add', payload: comments, superCommentId });
      };
    },
    [commentsFetch]
  );

  const commentDeleteHandlerCallbackHOF = useCallback(
    (
      cursor: number,
      offset: number,
      commentId: string,
      superCommentId?: string
    ) => {
      return async () => {
        try {
          const deleteResponse = await fetch(
            `https://api.simplecrudboard.click/browser/comments/${commentId}`,
            {
              method: 'DELETE',
              mode: 'cors',
              credentials: 'include',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ _csrf: csrfToken }),
            }
          );

          if (!deleteResponse.ok) {
            alert('삭제에 실패했습니다');
            return;
          }

          const comments = await commentsFetch(cursor, offset, superCommentId);

          setComments({
            type: 'remove',
            commentId,
            superCommentId,
            payload: comments,
          });
        } catch (e) {
          console.error(e);
        }
      };
    },
    [accessToken, commentsFetch, csrfToken]
  );

  return (
    <Fragment>
      <Head>
        <title>{data.title}</title>
      </Head>
      {user._id === data.author._id && (
        <div className="mb-8 text-right pr-4">
          <button
            className="inline-block bg-red-600 hover:bg-white py-2 px-4 font-semibold text-white hover:text-red-600 text-lg rounded-lg shadow-md mr-2"
            onClick={() => {
              setIsDeleteModalOpened(true);
            }}
          >
            삭제
          </button>
          <Link
            href={`/posts/form?id=${data._id}`}
            className="inline-block bg-green-600 hover:bg-white py-2 px-4 font-semibold text-white hover:text-green-600 text-lg rounded-lg shadow-md"
          >
            수정
          </Link>
        </div>
      )}

      <article className="mb-36">
        <h2 className="m-2 px-4 py-2 max-h-24 overflow-hidden overflow-ellipsis font-extrabold text-4xl">
          {data.title}
        </h2>

        <div className="mx-2 mb-36 px-4">
          <div className="flex flex-col sm:flex-row items-center mb-12">
            <div className="p-2 mr-4 text-center">
              <span className="sr-only">작성자</span>
              {data.author.username}
            </div>

            <div className="p-2 mr-4 text-center">
              <span className="sr-only">작성 시간</span>
              {formatDistanceToNow(new Date(data.createdAt), {
                locale: ko,
                addSuffix: true,
              })}{' '}
              작성{' '}
              {data.updatedAt &&
                `(업데이트: ${formatDistanceToNow(new Date(data.updatedAt), {
                  locale: ko,
                  addSuffix: true,
                })})`}
            </div>
          </div>

          <span className="sr-only">내용</span>
          <div
            // TODO 컨텐츠 스타일링
            className="ql-container ql-editor ql-blank text-base"
            dangerouslySetInnerHTML={{ __html: data.contents }}
          />
        </div>

        {/* comment form that comments on the post */}
        <div>
          <div>
            <CommentForm
              placeholder={
                !accessToken ? '로그인 해주시기 바랍니다' : '댓글 입력'
              }
              formHandlerCallbackHOF={commentFormHandlerCallbackHOF(
                cursor,
                offset
              )}
              disabled={!accessToken}
            />
          </div>

          <SuperCommentsList
            comments={comments}
            userId={user._id}
            isAuthor={user._id === data.author._id}
            cursor={cursor}
            offset={offset}
            formHandlerCallbackHOF={commentFormHandlerCallbackHOF}
            fetchMoreCallbackHOF={commentsfetchMoreCallbackHOF}
            deleteHandlerCallbackHOF={commentDeleteHandlerCallbackHOF}
            disabled={!accessToken}
          />
        </div>
      </article>

      <Modal isOpened={isDeleteModalOpened}>
        <form
          className="bg-white p-4 rounded-lg shadow-md"
          onSubmit={async (e) => {
            e.preventDefault();
            const response = await fetch(
              `https://api.simplecrudboard.click/browser/posts/${data._id}`,
              {
                method: 'DELETE',
                mode: 'cors',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ _csrf: csrfToken }),
              }
            );

            if (!response.ok) {
              alert('삭제에 실패했습니다');
            }

            router.back();
          }}
        >
          <p className="text-gray-800 text-center text-lg mb-4">
            글을 삭제하시겠습니까?
          </p>

          <div className="text-center">
            <button
              className="inline-block px-4 py-2 bg-red-600 hover:bg-white text-white hover:text-red-600 text-semibold text-lg rounded-md shadow-md mr-4"
              type="button"
              onClick={() => {
                setIsDeleteModalOpened(false);
              }}
            >
              취소
            </button>
            <button
              className="inline-block px-4 py-2 bg-green-600 hover:bg-white text-white hover:text-green-600 text-semibold text-lg rounded-md shadow-md"
              type="submit"
            >
              삭제
            </button>
          </div>
        </form>
      </Modal>
    </Fragment>
  );
};

export default PostPage;
