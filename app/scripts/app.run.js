angular
  .module('confRegistrationWebApp')
  .run(function (
    $rootScope,
    $cookies,
    $location,
    $window,
    ProfileCache,
    analytics,
    $timeout,
  ) {
    $rootScope.getMainContentUrl = () => $location.path() + '#main';

    $rootScope.year = new Date().getFullYear();

    // eslint-disable-next-line angular/on-watch
    $rootScope.$on('$locationChangeStart', () => {
      //registration mode
      if (_.includes($location.path(), '/preview/')) {
        $rootScope.registerMode = 'preview';
      } else if (_.includes($location.path(), '/register/')) {
        $rootScope.registerMode = 'register';
      }
    });

    // eslint-disable-next-line angular/on-watch
    $rootScope.$on('$routeChangeSuccess', (event, next) => {
      $rootScope.pageTitle = next.title;
      $rootScope.currentEventName =
        next.locals && next.locals.conference && next.locals.conference.name;

      $window.scrollTo(0, 0); // Scroll to top of page when new page is loaded

      $timeout(() => {
        analytics.firePageViewEvent();
      });
    });

    $rootScope.globalUser = function () {
      return ProfileCache.globalUser();
    };

    $rootScope.globalGreetingName = function () {
      return ProfileCache.globalGreetingName();
    };

    ProfileCache.getCache();
  });
