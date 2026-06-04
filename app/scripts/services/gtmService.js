angular
  .module('confRegistrationWebApp')
  .service('GtmService', function GtmService($rootScope, $document) {
    this.loadGtmScript = function (scriptId, gtmTagId) {
      if (!/^GTM-[A-Z0-9]+$/.test(gtmTagId)) {
        return;
      }

      if (!$document[0].getElementById(scriptId)) {
        const script = $document[0].createElement('script');
        script.id = scriptId;
        script.innerHTML = `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmTagId}');
                `;
        $document[0].head.insertBefore(script, $document[0].head.firstChild);

        const noScript = $document[0].createElement('noscript');
        noScript.innerHTML = `
                <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmTagId}"
                height="0" width="0" style="display:none;visibility:hidden"></iframe>
                `;
        $document[0].body.insertBefore(noScript, $document[0].body.firstChild);

        var unsubscribe = $rootScope.$on(
          '$routeChangeStart',
          function (event, next) {
            var path = next.originalPath;
            if (
              !(
                path.startsWith('/register/') ||
                path.startsWith('/reviewRegistration/')
              )
            ) {
              script.remove();
              noScript.remove();
              unsubscribe();
            }
          },
        );
      }
    };
  });
