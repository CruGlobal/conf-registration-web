import React, { useEffect, useState } from 'react';
import angular, { IHttpService, IDocumentService } from 'angular';
import { react2angular } from 'react2angular';

interface GoogleLoginProps {
  $http: IHttpService;
  $document: IDocumentService;
  envService: any;
}

const GoogleLogin = ({ $http, $document, envService }: GoogleLoginProps) => {
  const [googleNonce, setGoogleNonce] = useState('');
  const loadGoogle = () => {
    // @ts-ignore
    const script = $document[0].createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.type = 'text/javascript';
    script.async = true;
    // @ts-ignore
    $document[0].body.appendChild(script);
  };

  useEffect(() => {
    $http
      .get('auth/google/authorization')
      // @ts-ignore
      .then(({ data }: { data: { googleNonce: string } }) => {
        const { googleNonce } = data;
        setGoogleNonce(googleNonce);
        if (googleNonce !== '') {
          loadGoogle();
        }
      });
  }, []);

  if (googleNonce == '') return null;

  return (
    <>
      <div
        id="g_id_onload"
        data-client_id="832792323918-g5kjaf3tbgq5fammukgev37if64ud1o8.apps.googleusercontent.com"
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
    react2angular(GoogleLogin, [], ['$http', '$document', 'envService']),
  );
