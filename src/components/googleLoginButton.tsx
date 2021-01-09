import { Dispatch, SetStateAction, useLayoutEffect, useRef } from 'react';
import {
  promisifyLoadGoogleAuth,
  promisifyGetGoogleUserWhenLoginSucceeded,
} from '../utils';
import { User } from '../types/Data';
import Image from 'next/image';

export default function GoogleLoginButton({
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
  const googleLoginBtnRef = useRef<HTMLButtonElement>();

  // google login api effect
  useLayoutEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    (async () => {
      const gapi = (window as any).gapi;

      if (!gapi) {
        return;
      }

      await (async () => {
        try {
          const googleAuth = await promisifyLoadGoogleAuth(gapi);
          const googleUser = await promisifyGetGoogleUserWhenLoginSucceeded(
            googleAuth,
            googleLoginBtnRef.current
          );

          const id_token = googleUser.getAuthResponse().id_token;
          const response = await fetch('http://localhost:4000/browser/signin', {
            method: 'post',
            mode: 'cors',
            credentials: 'include',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: id_token,
              _csrf: csrfToken,
              oauthServer: 'google',
            }),
            signal,
          });

          const json: {
            user: Partial<User>;
          } = await response.json();
          const { user } = json;
          setUser(user);
        } catch (e) {
          console.error(e);
        }
      })();
    })();

    return () => {
      abortController.abort();
    };
  }, [csrfToken, setUser]);

  return (
    <button className={styles.googleLoginBtn} ref={googleLoginBtnRef}>
      <Image
        className={styles.googleLogo}
        src="/images/g-logo.png"
        alt="Google logo"
        width="40"
        height="40"
      />
      <span className={styles.googleLoginText}>구글 아이디로 로그인</span>
    </button>
  );
}
