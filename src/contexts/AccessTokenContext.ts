import { createContext } from 'react';
import { Dispatch, SetStateAction } from 'react';
import { AccessToken } from '../types/Data';

interface AccessTokenContextInterface {
  accessToken: AccessToken;
  setAccessToken: Dispatch<SetStateAction<AccessToken>>;
}

const AccessTokenContext = createContext<AccessTokenContextInterface>(null);

export default AccessTokenContext;
