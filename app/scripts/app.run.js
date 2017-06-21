angular.module('confRegistrationWebApp')
  .run(function ($rootScope, $cookies, $location, $window, ProfileCache, analytics) {
    // eslint-disable-next-line angular/on-watch
    $rootScope.$on('$locationChangeStart', () => {
      //registration mode
      if (_.includes($location.path(), '/preview/')) {
        $rootScope.registerMode = 'preview';
      } else if(_.includes($location.path(), '/register/')) {
        $rootScope.registerMode = 'register';
      }
    });

    // eslint-disable-next-line angular/on-watch
    $rootScope.$on('$routeChangeSuccess', () => {
      $window.scrollTo(0, 0); // Scroll to top of page when new page is loaded

      analytics.firePageViewEvent();
    });

    $rootScope.generateTitle = function (title) {
      if (title) {
        return title + ' | Event Registration Tool';
      } else {
        return 'Event Registration Tool';
      }
    };

    $rootScope.globalGreetingName = function(){
      return ProfileCache.globalGreetingName();
    };
    ProfileCache.getCache();
  });
