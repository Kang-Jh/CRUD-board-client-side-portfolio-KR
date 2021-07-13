import { BaseData } from './Data';
import { Image } from './Image';
import { User } from './User';
import { Comment } from './Comment';

export interface Post extends BaseData {
  postNumber: number;
  title: string;
  author: Required<Pick<User, '_id'>> & Partial<User>;
  thumbnail?: Image;
  contents: string;
  images: Image[];
  comments?: Comment[];
}
