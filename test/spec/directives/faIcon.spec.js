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
    return element.find('fa-icon');
  };

  it('renders icon with correct attributes and classes', () => {
    const icon = compile('<fa-icon icon="spinner" class="fa-spin"></fa-icon>');

    expect(icon.hasClass('fa')).toBe(true);
    expect(icon.hasClass('fa-spinner')).toBe(true);
    expect(icon.hasClass('fa-spin')).toBe(true);
    expect(icon.attr('aria-hidden')).toBe('true');
  });

  it('supports ng-class', () => {
    $scope.iconClass = 'fa-check';
    const icon = compile('<fa-icon ng-class="iconClass"></fa-icon>');

    expect(icon.hasClass('fa')).toBe(true);
    expect(icon.hasClass('fa-check')).toBe(true);
  });

  it('supports style attribute', () => {
    const icon = compile(
      '<fa-icon icon="check" style="padding-top: 14px"></fa-icon>',
    );

    expect(icon.attr('style')).toContain('padding-top');
  });

  it('supports ng-if', () => {
    $scope.show = true;
    let icon = compile('<fa-icon icon="check" ng-if="show"></fa-icon>');

    expect(icon.length).toBe(1);

    $scope.show = false;
    $scope.$digest();
    icon = compile('<fa-icon icon="check" ng-if="show"></fa-icon>');

    expect(icon.length).toBe(0);
  });

  it('supports ng-show', () => {
    $scope.visible = true;
    let icon = compile('<fa-icon icon="user" ng-show="visible"></fa-icon>');

    expect(icon.hasClass('ng-hide')).toBe(false);

    $scope.visible = false;
    $scope.$digest();

    expect(icon.hasClass('ng-hide')).toBe(true);
  });
});
