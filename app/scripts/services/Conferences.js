'use strict';

angular.module('confRegistrationWebApp')
  .factory('Conferences', function ($resource) {
    var Conference = $resource('conferences/:id');

    Conference.prototype.$blocks = function () {
      var blocks = [];
      if(this.pages && angular.isArray(this.pages)) {
        angular.forEach(this.pages, function (page) {
          if(page.blocks && angular.isArray(page.blocks)) {
            angular.forEach(page.blocks, function (block) {
              blocks.push(block);
            });
          }
        })
      }
      return blocks;
    };

    return  Conference;
  });
