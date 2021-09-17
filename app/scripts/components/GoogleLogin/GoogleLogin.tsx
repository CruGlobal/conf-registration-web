import React, { useEffect, useState } from 'react';
import angular, { IHttpService } from 'angular';
import { react2angular } from 'react2angular';

interface GoogleLoginProps {
  $http: IHttpService;
  envService: any;
}

const GoogleLogin = ({ $http, envService }: GoogleLoginProps) => {
  const [googleNonce, setGoogleNonce] = useState('');
  useEffect(() => {
    $http
      .get('auth/google/authorization')
      // @ts-ignore
      .then(({ data }: { data: { googleNonce: string } }) => {
        const { googleNonce } = data;
        setGoogleNonce(googleNonce);
      });
  }, []);
  return (
    <>
      <div
        id="g_id_onload"
        data-client_id="489812205323-7dbar0imd3vhsmjargo36md9iro0o146.apps.googleusercontent.com"
        data-auto_prompt="true"
        data-nonce={googleNonce}
        data-login_uri={`${envService.read('apiUrl')}auth/google/login`}
      />
      <div
        className="g_id_signin"
        data-type="standard"
        data-theme="outline"
        data-text="sign_in_with"
        data-shape="rectangular"
        data-logo_alignment="left"
        data-width="269"
      />
    </>
  );
};

angular
  .module('confRegistrationWebApp')
  .component(
    'googleLogin',
    react2angular(GoogleLogin, [], ['$http', 'envService']),
  );
