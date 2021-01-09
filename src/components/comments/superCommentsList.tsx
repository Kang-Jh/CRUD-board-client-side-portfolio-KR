import InfiniteScroller from '../infiniteScroller';
import { Comment as CommentInterface } from '../../types/Data';
import SuperComment from './superComment';
import { constants } from '../../utils';
import { useMemo } from 'react';

const { COMMENTS_GET_LIMIT } = constants;

/**
 * @param cursor {number} - cursor of comments
 * @param offset {number} - duplicated number of comments that have the same value as cursor
 * @param comments {Comment[]} - comment
 * @param id {string} - id attribute of html element
 * @param userId {string} - signed in user's id
 * @param isAuthor {boolean} - is signed in user the author of the post
 * @param disabled {boolean} - is user not signed in
 * @param formHandlerCallbackHOF {function} - higher-order function which returns higher-order function which returns form handler
 * @param fetchMoreCallbackHOF {function} - higher-order function which returns fetchMore callback
 * @param deleteHandlerCallbackHOF {function} - higher-order function which returns delete handler callback
 */
export default function SuperCommentsList({
  comments,
  cursor,
  offset,
  formHandlerCallbackHOF,
  fetchMoreCallbackHOF,
  deleteHandlerCallbackHOF,
  isAuthor,
  userId,
  disabled,
}: {
  comments: CommentInterface[];
  cursor: number;
  offset: number;
  userId?: string;
  isAuthor?: boolean;
  disabled?: boolean;
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
  ) => (...args: any[]) => Promise<void>;
  deleteHandlerCallbackHOF: (
    cursor: number,
    offset: number,
    commentId: string,
    superCommentId?: string
  ) => () => Promise<void>;
}) {
  const noMore = comments.length % COMMENTS_GET_LIMIT !== 0;
  const fetchMore = useMemo(() => {
    return fetchMoreCallbackHOF(cursor, offset, noMore);
  }, [cursor, fetchMoreCallbackHOF, noMore, offset]);

  return (
    <InfiniteScroller
      container="ol"
      idPrefix="superComment"
      items={comments}
      fetchMore={fetchMore}
      render={(comment: CommentInterface, index: number) => {
        return (
          <li key={comment._id}>
            <SuperComment
              deleteHandlerCallbackHOF={deleteHandlerCallbackHOF}
              disabled={disabled}
              userId={userId}
              isAuthor={isAuthor}
              superCommentCursor={cursor}
              superCommentOffset={offset}
              id={`superComment-${index}`}
              comment={comment}
              formHandlerCallbackHOF={formHandlerCallbackHOF}
              fetchMoreCallbackHOF={fetchMoreCallbackHOF}
            />
          </li>
        );
      }}
    />
  );
}
