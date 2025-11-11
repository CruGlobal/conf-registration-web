import 'angular-mocks';

describe('faIcon component directive', () => {
  let $compile, $scope;

  beforeEach(() => {
    angular.mock.module('confRegistrationWebApp');
    inject((_$compile_, $rootScope) => {
      $compile = _$compile_;
      $scope = $rootScope.$new();
    });
  });

  const compile = (html) => {
    const element = $compile(`<div>${html}</div>`)($scope);
    $scope.$digest();
    return element.find('i');
  };

  it('renders icon with correct attributes and classes', () => {
    const icon = compile('<fa-icon icon="spinner" class="fa-spin"></fa-icon>');

    expect(icon.hasClass('fa fa-spinner fa-spin')).toBe(true);
    expect(icon.attr('aria-hidden')).toBe('true');
  });

  it('supports ng-class', () => {
    $scope.iconClass = 'fa-check';
    const icon = compile('<fa-icon ng-class="iconClass"></fa-icon>');

    expect(icon.hasClass('fa')).toBe(true);
    expect(icon.attr('ng-class')).toBe('iconClass');
  });
});
