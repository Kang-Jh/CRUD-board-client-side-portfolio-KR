import { Fragment, useState } from 'react';
import CommentBody from './commentBody';
import CommentForm from './commentForm';
import { Comment as CommentInterface } from '../../types/Data';
import dynamic from 'next/dynamic';

const Modal = dynamic(() => import('../../components/modal'), { ssr: false });

/**
 * Comment component that shows a comment
 * @param comment {Comment} - comment
 * @param userId {string} - signed in user's id
 * @param isAuthor {boolean} - sgined in user is the author of the post
 * @param disabled {boolean} - is form disabled
 * @param replyHandlerCallbackHOF {function} - higher-order function which returns reply form handler
 * @param modifyHandlerCallbackHOF {function} - higher-order function which returns modify form handler
 * @param deleteHandlerCallback {function} - callback when delete is executed
 */
export default function Comment({
  comment,
  disabled,
  userId,
  isAuthor,
  replyHandlerCallbackHOF,
  modifyHandlerCallbackHOF,
  deleteHandlerCallback,
}: {
  userId?: string;
  isAuthor?: boolean;
  disabled?: boolean;
  comment: CommentInterface;
  replyHandlerCallbackHOF: (contents: string) => () => Promise<void>;
  modifyHandlerCallbackHOF: (contents: string) => () => Promise<void>;
  deleteHandlerCallback: () => Promise<void>;
}) {
  const [isReplyclicked, setIsReplyClicked] = useState(false);
  const [isModifyClicked, setIsModifyClicked] = useState(false);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);

  return (
    <Fragment>
      <div>
        <CommentBody comment={comment} />

        <div className="mt-2 mb-2">
          <button
            className="inline-block bg-gray-600 hover:bg-white px-4 py-2 text-white hover:text-gray-600 text-lg font-medium rounded-md shadow-md mr-2"
            onClick={() => {
              setIsReplyClicked(true);
              setIsModifyClicked(false);
            }}
          >
            답글
          </button>

          {/* only commenter can see modify button */}
          {userId === comment.commenter._id && (
            <button
              className="inline-block bg-gray-600 hover:bg-white px-4 py-2 text-white hover:text-gray-600 font-medium text-lg rounded-md shadow-md mr-2"
              onClick={() => {
                setIsReplyClicked(false);
                setIsModifyClicked(true);
              }}
            >
              수정
            </button>
          )}

          {/* if signed in user is author of the post */}
          {/* or commenter show delete button */}
          {(isAuthor || userId === comment.commenter._id) && (
            <button
              className="inline-block bg-red-600 hover:bg-white px-4 py-2 text-white hover:text-red-600 text-lg font-medium rounded-md shadow-md"
              onClick={() => {
                setIsDeleteModalOpened(true);
              }}
            >
              삭제
            </button>
          )}
        </div>

        {/* form for new comment */}
        {isReplyclicked && (
          <CommentForm
            disabled={disabled}
            placeholder={!disabled ? '답글 입력' : '로그인 해주시기 바랍니다'}
            closeCallback={() => {
              setIsModifyClicked(false);
              setIsReplyClicked(false);
            }}
            formHandlerCallbackHOF={replyHandlerCallbackHOF}
          />
        )}

        {/* form to modify existing comment */}
        {isModifyClicked && (
          <CommentForm
            placeholder="답글 입력"
            closeCallback={() => {
              setIsModifyClicked(false);
              setIsReplyClicked(false);
            }}
            initialContents={comment.contents}
            formHandlerCallbackHOF={modifyHandlerCallbackHOF}
          />
        )}
      </div>

      <Modal isOpened={isDeleteModalOpened}>
        <form
          className="bg-white p-4 rounded-lg shadow-md"
          onSubmit={async (e) => {
            e.preventDefault();
            await deleteHandlerCallback();
          }}
        >
          <p className="text-gray-800 text-center text-lg mb-4">
            댓글을 삭제하시겠습니까?
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
}
