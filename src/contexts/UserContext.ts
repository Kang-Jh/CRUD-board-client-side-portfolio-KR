import { createContext } from 'react';
import { Dispatch, SetStateAction } from 'react';
import { User } from '../types/Data';

interface UserContextInterface {
  user: Partial<User>;
  setUser: Dispatch<SetStateAction<Partial<User>>>;
}

const UserContext = createContext<UserContextInterface>(null);

export default UserContext;
