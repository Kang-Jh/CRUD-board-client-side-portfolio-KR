import { useEffect } from 'react';
import CommentComponent from './comment';
import { Comment } from '../../types/Data';
import { constants } from '../../utils';

const { COMMENTS_GET_LIMIT } = constants;
/**
 * @param cursor {number} - cursor of comments
 * @param offset {number} - duplicated number of comments that have the same value as cursor
 * @param comments {Comment[]} - comments
 * @param subCommentsCount {number} - comment's subCommentsCount
 * @param superCommentId {string}
 * @param userId {string} - signed in user's id
 * @param isAuthor {boolean} - is signed in user the author of the post
 * @param disabled {boolean} - is user not signed in
 * @param formHandlerCallbackHOF {function} - higher-order function which returns higher-order function which returns form handler
 * @param fetchMoreCallbackHOF {function} - higher-order function which returns fetchMore callback
 * @param deleteHandlerCallbackHOF {function} - higher-order function which returns delete handler callback
 */
export default function SubCommentsList({
  cursor,
  offset,
  comments,
  subCommentsCount,
  superCommentId,
  formHandlerCallbackHOF,
  fetchMoreCallbackHOF,
  deleteHandlerCallbackHOF,
  userId,
  isAuthor,
  disabled,
}: {
  userId?: string;
  isAuthor?: boolean;
  disabled?: boolean;
  cursor: number;
  offset: number;
  subCommentsCount: number;
  comments: Comment[];
  superCommentId: string;
  formHandlerCallbackHOF: (
    cursor: number,
    offset: number,
    commentId?: string,
    superCommentId?: string,
    mentionId?: string
  ) => (contents: string) => () => Promise<void>;
  fetchMoreCallbackHOF: (
    cursor: number,
    offset: number,
    noMore: boolean,
    superCommentId?: string
  ) => () => Promise<void>;
  deleteHandlerCallbackHOF: (
    cursor: number,
    offset: number,
    commentId: string,
    superCommentId?: string
  ) => () => Promise<void>;
}) {
  const noMore = comments.length % COMMENTS_GET_LIMIT !== 0;
  const fetchMoreCallback = fetchMoreCallbackHOF(
    cursor,
    offset,
    noMore,
    superCommentId
  );

  // initial subComments load
  useEffect(() => {
    if (comments.length === 0 && subCommentsCount > 0) {
      fetchMoreCallback();
    }
  }, [
    comments.length,
    cursor,
    fetchMoreCallback,
    noMore,
    offset,
    subCommentsCount,
    superCommentId,
  ]);

  return (
    <div className="pl-8 mt-2">
      <div className="sr-only">답글 목록</div>
      <ol>
        {comments.map((comment) => {
          return (
            <li key={comment._id}>
              <CommentComponent
                userId={userId}
                isAuthor={isAuthor}
                disabled={disabled}
                comment={comment}
                replyHandlerCallbackHOF={formHandlerCallbackHOF(
                  cursor,
                  offset,
                  undefined,
                  comment.superComment?._id,
                  // if user is replying to user's own comment
                  // mention should be undefined
                  comment.commenter?._id !== userId
                    ? comment.commenter._id
                    : undefined
                )}
                modifyHandlerCallbackHOF={formHandlerCallbackHOF(
                  cursor,
                  offset,
                  comment._id,
                  comment.superComment?._id
                )}
                deleteHandlerCallback={deleteHandlerCallbackHOF(
                  cursor,
                  offset,
                  comment._id,
                  comment.superComment?._id
                )}
              />
            </li>
          );
        })}
      </ol>

      {comments.length > 0
        ? !noMore && <button onClick={fetchMoreCallback}>더 보기</button>
        : null}
    </div>
  );
}
