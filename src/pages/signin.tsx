import { useContext, useEffect, Fragment } from 'react';
import { useRouter } from 'next/router';
import NextHead from 'next/head';
import { AccessTokenContext, CsrfContext, UserContext } from '../contexts';
import GoogleLoginButton from '../components/googleLoginButton';
import FacebookLoginButton from '../components/facebookLoginButton';
import styles from '../styles/signin.module.css';

const SignInPage = () => {
  const router = useRouter();
  const { accessToken } = useContext(AccessTokenContext);
  const { setUser } = useContext(UserContext);
  const csrfToken = useContext(CsrfContext);

  // redirect effect
  // when id exist go back to previous page
  useEffect(() => {
    if (accessToken) {
      router.back();
    }
  }, [accessToken, router]);

  if (accessToken) {
    return null;
  }

  return (
    <Fragment>
      <NextHead>
        <title>로그인</title>
      </NextHead>

      <div className="flex justify-center items-center">
        <div className="flex flex-col p-4 border border-gray-200 rounded-lg shadow-md justify-center items-center">
          <form
            className="mb-8"
            action="POST"
            onSubmit={async (e) => {
              e.preventDefault();

              const response = await fetch(
                'https://api.simplecrudboard.click/browser/signin',
                {
                  method: 'POST',
                  mode: 'cors',
                  credentials: 'include',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    oauthServer: 'fake',
                    _csrf: csrfToken,
                  }),
                }
              );

              if (!response.ok) {
                alert('로그인에 실패했습니다');
                return;
              }

              const json = await response.json();
              const { user } = json;
              setUser(user);
            }}
          >
            <div className="flex flex-row justify-center items-center">
              <div className="mr-2">
                <div className="px-1 py-2">
                  <label
                    className="inline-block w-24 text-right mr-2"
                    htmlFor="accountId"
                  >
                    아이디
                  </label>
                  <input
                    className="inline-block px-4 border border-gray-200 rounded-md shadow-md"
                    type="text"
                    name="accountId"
                    id="accountId"
                  />
                </div>

                <div className="px-1 py-2">
                  <label
                    className="inline-block w-24 text-right mr-2"
                    htmlFor="password"
                  >
                    비밀번호
                  </label>
                  <input
                    className="inline-block px-4 border border-gray-200 rounded-md shadow-md"
                    type="password"
                    name="password"
                    id="password"
                  />
                </div>
              </div>

              <div>
                <button
                  className="inline-block px-4 py-4 bg-green-600 hover:bg-white text-white hover:text-green-600 text-lg font-bold rounded-lg shadow-md"
                  type="submit"
                >
                  로그인
                </button>
              </div>
            </div>

            <p className="text-center text-gray-600 text-sm mt-4">
              어떠한 아이디와 비밀번호를 입력해도 로그인됩니다
            </p>
          </form>

          <div className="mb-4">
            <GoogleLoginButton
              csrfToken={csrfToken}
              setUser={setUser}
              styles={styles}
            />
          </div>

          <div>
            <FacebookLoginButton
              csrfToken={csrfToken}
              setUser={setUser}
              styles={styles}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default SignInPage;
