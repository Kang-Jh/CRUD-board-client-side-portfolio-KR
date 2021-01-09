import { BaseData } from './Data';
import { Post } from './Post';
import { User } from './User';

export interface Comment extends BaseData {
  commentNumber: number;
  post: Partial<Post>; // must store post's id
  superComment: Partial<Comment> | undefined | null;
  subComments?: Comment[]; // childComments doesn't stored in document, this field is computed
  subCommentsCount?: number; // value doesn't store in document, it is only computed by counting childComments
  mention: Partial<User> | undefined | null; // if mention exist, then it must store user's id
  contents: string; // contents is not s3 key. it is actual contents for the comment
  commenter: Partial<User>; // must store user's id
}
