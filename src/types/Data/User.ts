import { BaseData } from './Data';
import { Post } from './Post';
import { Comment } from './Comment';

export interface User extends BaseData {
  oauthID: string; // oauthID is app-scoped unique id provided by social login service provider
  oauthServer: string; // oauthServer is what provider users use to social log in
  email: string;
  username: string;
  posts?: (Required<Pick<Post, '_id'>> & Partial<Post>)[];
  comments?: (Required<Pick<Comment, '_id'>> & Partial<Comment>)[];
}
