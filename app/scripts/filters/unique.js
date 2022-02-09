angular.module('confRegistrationWebApp').filter('unique', function () {
  return function (items, filterOn) {
    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var newItems = [];

      var extractValueToCompare = function (item) {
        if (angular.isObject(item) && angular.isString(filterOn)) {
          return item[filterOn];
        } else {
          return item;
        }
      };

      angular.forEach(items, function (item) {
        var isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (
            angular.equals(
              extractValueToCompare(newItems[i]),
              extractValueToCompare(item),
            )
          ) {
            isDuplicate = true;
            newItems[i]._count++;
            break;
          }
        }
        if (!isDuplicate) {
          item._count = 1;
          newItems.push(item);
        }
      });
      items = newItems;
    }
    return items;
  };
});
