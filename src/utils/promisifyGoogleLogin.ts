export function promisifyLoadGoogleAuth(gapi: any): Promise<any> {
  return new Promise((resolve) => {
    gapi.load('auth2', function () {
      const googleAuth = gapi.auth2.init({
        client_id:
          '542160721075-hruso9or8rvl61uehr484pp57g95pluq.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
      });

      resolve(googleAuth);
    });
  });
}

export function promisifyGetGoogleUserWhenLoginSucceeded(
  googleAuth: any,
  button: HTMLElement
): Promise<any> {
  return new Promise((resolve) => {
    googleAuth.attachClickHandler(
      button,
      {},
      (googleUser: any) => {
        resolve(googleUser);
      },
      () => {
        console.log('google login failed');
      }
    );
  });
}
