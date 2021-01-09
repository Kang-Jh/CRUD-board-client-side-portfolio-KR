import { Comment } from '../../types/Data';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function CommentBody({ comment }: { comment: Comment }) {
  return (
    <div>
      <div className="flex flex-row mb-1">
        <div className="mr-2">
          <span className="sr-only">댓글 작성자</span>
          {comment.commenter.username}
        </div>

        <div>
          <span className="sr-only">댓글 작성시간</span>
          {formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
            locale: ko,
          })}
          {comment.updatedAt &&
            `(업데이트: ${formatDistanceToNow(new Date(comment.updatedAt), {
              addSuffix: true,
              locale: ko,
            })})`}
        </div>
      </div>

      <div>
        <span className="sr-only">댓글 내용</span>
        <p className="whitespace-pre-line">
          {comment.mention &&
            comment.mention._id !== comment.commenter._id && (
              // TODO change span to link
              <span className="text-blue-600">@{comment.mention.username}</span>
            )}{' '}
          {comment.contents}
        </p>
      </div>
    </div>
  );
}
