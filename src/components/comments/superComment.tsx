import { useState } from 'react';
import Comment from './comment';
import SubCommentsList from './subCommentsList';
import { Comment as CommentInterface } from '../../types/Data';
import useCursorAndOffset from '../../hooks/useCursorAndOffset';

/**
 * @param superCommentCursor {number} - cursor of comments
 * @param superCommentOffset {number} - duplicated number of comments that have the same value as cursor
 * @param comment {Comment} - comment
 * @param id {string} - id attribute of html element
 * @param userId {string} - signed in user's id
 * @param isAuthor {boolean} - is signed in user the author of the post
 * @param disabled {boolean} - is user not signed in
 * @param formHandlerCallbackHOF {function} - higher-order function which returns higher-order function which returns form handler
 * @param fetchMoreCallbackHOF {function} - higher-order function which returns fetchMore callback
 * @param deleteHandlerCallbackHOF {function} - higher-order function which returns delete handler callback
 */
export default function SuperComment({
  superCommentCursor,
  superCommentOffset,
  comment,
  id,
  formHandlerCallbackHOF,
  fetchMoreCallbackHOF,
  deleteHandlerCallbackHOF,
  isAuthor,
  userId,
  disabled,
}: {
  userId?: string;
  isAuthor?: boolean;
  disabled?: boolean;
  superCommentCursor: number;
  superCommentOffset: number;
  comment: CommentInterface;
  id: string;
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
  const subComments = comment.subComments;
  const [isSubCommentsListOpened, setIsSubCommentsListOpened] = useState(false);
  const {
    cursor: subCommentsCursor,
    offset: subCommentsOffset,
  } = useCursorAndOffset(subComments, 'commentNumber');

  return (
    <div id={id}>
      <Comment
        deleteHandlerCallback={deleteHandlerCallbackHOF(
          superCommentCursor,
          superCommentOffset,
          comment._id
        )}
        userId={userId}
        isAuthor={isAuthor}
        comment={comment}
        // if a comment's superComment exist then user is replying to a sub-comment of a super comment
        // so use sub-comment's superComment as a superComment
        // else user is replying to a super comment of a post

        // if a comment's superComment exist then user is replying to sub-comment of a comment
        // so mention should be a commenter of a sub-comment
        // else user is replying to a super comment of a post
        // so no need mention id
        replyHandlerCallbackHOF={formHandlerCallbackHOF(
          subCommentsCursor,
          subCommentsOffset,
          undefined,
          comment._id
        )}
        modifyHandlerCallbackHOF={formHandlerCallbackHOF(
          superCommentCursor,
          superCommentOffset,
          comment._id
        )}
        disabled={disabled}
      />

      {/* if comment has subComments */}
      {/* then render button to show and hide sub comments */}
      {comment.subCommentsCount > 0 && (
        <div>
          <button
            className="inline-block p-2 text-blue-600"
            onClick={() => {
              setIsSubCommentsListOpened(!isSubCommentsListOpened);
            }}
          >
            {`${comment.subCommentsCount}개의 답글 `}
            {/* TODO add up(down) icons on close(open) */}
            {isSubCommentsListOpened ? '펼치기' : '접기'}
          </button>
        </div>
      )}

      {isSubCommentsListOpened && (
        <SubCommentsList
          deleteHandlerCallbackHOF={deleteHandlerCallbackHOF}
          userId={userId}
          isAuthor={isAuthor}
          disabled={disabled}
          cursor={subCommentsCursor}
          offset={subCommentsOffset}
          comments={subComments}
          subCommentsCount={comment.subCommentsCount}
          superCommentId={comment._id}
          formHandlerCallbackHOF={formHandlerCallbackHOF}
          fetchMoreCallbackHOF={fetchMoreCallbackHOF}
        />
      )}
    </div>
  );
}
