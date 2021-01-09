import { useContext } from 'react';
import Link from './link';
import { AccessTokenContext, CsrfContext, UserContext } from '../contexts';
import {
  promisifyFacebookGetLoginStatus,
  promisifyFacebookLogout,
} from '../utils';

// TODO 로고 넣기
const LogoComponent = () => (
  <h1 className="p-5 ml-2 md:ml-6 lg:ml-10 text-2xl text-white font-medium">
    <Link href="/">홈</Link>
  </h1>
);

// eslint-disable-next-line no-unused-vars
const SignInLink = () => {
  const { accessToken, setAccessToken } = useContext(AccessTokenContext);
  const { user, setUser } = useContext(UserContext);
  const csrfToken = useContext(CsrfContext);

  if (accessToken) {
    return (
      <div className="p-5 mr-4 sm:mr-8 md:mr-16 lg:mr-24">
        <button
          className="text-white font-semibold"
          // TODO 페이스북 로그아웃 속도 높이기
          onClick={async () => {
            const FB = (window as any).FB;
            const gapi = (window as any).gapi;

            if (!FB || !gapi) {
              return;
            }

            // FIXME remove this if statement in production
            if (user.username === 'Fake Account') {
              const response = await fetch(
                'http://localhost:4000/browser/signout',
                {
                  method: 'POST',
                  mode: 'cors',
                  credentials: 'include',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ _csrf: csrfToken }),
                }
              );

              if (!response.ok) {
                alert('로그아웃에 실패했습니다');
                return;
              }

              setAccessToken('');
              setUser({ _id: '', username: '' });
              return;
            }

            try {
              await Promise.all([
                gapi.auth2.getAuthInstance(),
                promisifyFacebookGetLoginStatus(FB),
                fetch('http://localhost:4000/browser/signout', {
                  method: 'POST',
                  mode: 'cors',
                  credentials: 'include',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ _csrf: csrfToken }),
                }),
              ])
                .then((values) => {
                  // if google logged in
                  if (values[0] && values[0].isSignedIn.get()) {
                    values[0].disconnect();
                  }

                  // if facebook logged in then assign promise to variable
                  // and return it
                  let facebookLogoutResult;
                  if (values[1].status === 'connected') {
                    facebookLogoutResult = promisifyFacebookLogout(FB);
                  }

                  if (!values[2].ok) {
                    throw new Error('Sign out failed');
                  }

                  return [facebookLogoutResult];
                })
                .then(() => {
                  setAccessToken('');
                  setUser({ _id: '', username: '' });
                });
            } catch (e) {
              alert('로그아웃에 실패했습니다');
              console.error(e);
            }
          }}
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 mr-4 sm:mr-8 md:mr-16 lg:mr-24">
      <Link className="text-white font-semibold" href="/signin">
        로그인
      </Link>
    </div>
  );
};

const Header = () => {
  return (
    <header className="fixed top-0 left-0 h-auto w-full flex flex-row justify-between bg-green-600 z-10">
      <LogoComponent />
      <SignInLink />
    </header>
  );
};

export default Header;
