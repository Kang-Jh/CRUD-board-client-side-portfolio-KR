export function promisifyFacebookGetLoginStatus(FB: any): Promise<any> {
  return new Promise((resolve) => {
    FB.getLoginStatus((response: any) => {
      resolve(response);
    });
  });
}

export function promisifyFacebookLogin(FB: any) {
  return new Promise((resolve) => {
    FB.login((response: any) => {
      resolve(response);
    });
  });
}

export function promisifyFacebookGetUserInfo(FB: any) {
  return new Promise((resolve) => {
    FB.api('/me', { fields: 'email' }, (response: any) => {
      resolve(response);
    });
  });
}

export function promisifyFacebookLogout(FB: any) {
  return new Promise((resolve) => {
    FB.logout((response: any) => {
      resolve(response);
    });
  });
}
