import {
  promisifyFacebookGetLoginStatus,
  promisifyFacebookLogin,
  promisifyFacebookGetUserInfo,
} from '../utils';
import { User } from '../types/Data';
import { Dispatch, SetStateAction } from 'react';
import Image from 'next/image';

export default function FacebookLoginButton({
  csrfToken,
  setUser,
  styles,
}: {
  csrfToken: string;
  setUser: Dispatch<SetStateAction<Partial<User>>>;
  styles: {
    readonly [key: string]: string;
  };
}) {
  return (
    <button
      className={styles.facebookLoginBtn}
      onClick={async () => {
        const FB = (window as any).FB;
        try {
          const loginStatus: any = await promisifyFacebookGetLoginStatus(FB);

          if (loginStatus?.status === 'connected') {
            const response = await fetch(
              'http://localhost:4000/browser/signin',
              {
                method: 'post',
                mode: 'cors',
                credentials: 'include',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: loginStatus.authResponse.userID,
                  _csrf: csrfToken,
                  oauthServer: 'facebook',
                  accessToken: loginStatus.authResponse.accessToken,
                }),
              }
            );

            const json: {
              user: User;
            } = await response.json();
            const { user } = json;
            setUser(user);
            return;
          }

          const loginResponse: any = await promisifyFacebookLogin(FB);

          if (loginResponse?.status !== 'connected') {
            return;
          }

          const userInfo: any = await promisifyFacebookGetUserInfo(FB);

          if (userInfo && !userInfo.error) {
            const response = await fetch(
              'http://localhost:4000/browser/signin',
              {
                method: 'post',
                mode: 'cors',
                credentials: 'include',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: userInfo.id,
                  _csrf: csrfToken,
                  oauthServer: 'facebook',
                  accessToken: loginResponse.authResponse.accessToken,
                }),
              }
            );

            const json: {
              user: User;
            } = await response.json();
            const { user } = json;
            setUser(user);
          }
        } catch (e) {
          console.error(e);
        }
      }}
    >
      <Image
        className={styles.facebookLogo}
        src="/images/f_logo_RGB-White_58.png"
        alt="Facebook logo"
        width="40"
        height="40"
      />
      <span className={styles.facebookLoginText}>페이스북 아이디로 로그인</span>
    </button>
  );
}
