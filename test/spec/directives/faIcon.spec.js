import 'angular-mocks';

describe('faIcon directive', () => {
  let $compile, $scope;
  beforeEach(() => {
    angular.mock.module('confRegistrationWebApp');
    inject((_$compile_, $rootScope) => {
      $compile = _$compile_;
      $scope = $rootScope.$new();
    });
  });

  it('adds aria-hidden="true" to Font Awesome icons', () => {
    const element = $compile('<i class="fa fa-plus" fa-icon></i>')($scope);
    $scope.$digest();

    expect(element.attr('aria-hidden')).toBe('true');
  });

  it('adds aria-hidden="true" to icons with multiple classes', () => {
    const element = $compile('<i class="fa fa-spinner fa-spin" fa-icon></i>')(
      $scope,
    );
    $scope.$digest();

    expect(element.attr('aria-hidden')).toBe('true');
  });

  it('adds aria-hidden="true" to icons with ng-class', () => {
    $scope.iconClass = 'fa-check';
    const element = $compile('<i class="fa" ng-class="iconClass" fa-icon></i>')(
      $scope,
    );
    $scope.$digest();

    expect(element.attr('aria-hidden')).toBe('true');
  });
});
