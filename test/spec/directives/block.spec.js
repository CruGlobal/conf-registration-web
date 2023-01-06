import 'angular-mocks';
import _ from 'lodash';

describe('Directive: blocks', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  describe('radioQuestion', () => {
    let $compile, $rootScope, $scope;
    beforeEach(inject((_$compile_, _$rootScope_, $templateCache, testData) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;

      $scope = $rootScope.$new();
      $templateCache.put('views/blocks/radioQuestion.html', '');

      $scope.block = _.cloneDeep(
        testData.conference.registrationPages[1].blocks[4],
      );
      $scope.block.content.otherOption = { enabled: true };
      $scope.block.content.choices = [
        { value: 'Option 1', desc: '', operand: 'OR' },
        { value: 'Option 2', desc: '', operand: 'OR' },
        { value: 'Option 3', desc: '', operand: 'OR' },
      ];
    }));

    it('has no selection when answer is undefined', () => {
      $scope.answer = undefined;
      $compile('<radio-question></radio-question>')($scope);
      $scope.$digest();

      expect($scope.selectedAnswer).toBe('');

      expect($scope.otherAnswer).toBe('');
    });

    it('has no selection when answer value is empty', () => {
      $scope.answer = { value: '' };
      $compile('<radio-question></radio-question>')($scope);
      $scope.$digest();

      expect($scope.selectedAnswer).toBe('');

      expect($scope.otherAnswer).toBe('');
    });

    it('has answer selection when answer is provided', () => {
      $scope.answer = { value: 'Option 3' };
      $compile('<radio-question></radio-question>')($scope);
      $scope.$digest();

      expect($scope.selectedAnswer).toBe('Option 3');

      expect($scope.otherAnswer).toBe('');
    });

    it('has other selection when answer not in options is provided', () => {
      $scope.answer = { value: 'Other' };
      $compile('<radio-question></radio-question>')($scope);
      $scope.$digest();

      expect($scope.selectedAnswer).toBe('__other__');

      expect($scope.otherAnswer).toBe('Other');
    });

    it('updates the answer value when the selection changes', () => {
      $scope.answer = { value: '' };
      $compile('<radio-question></radio-question>')($scope);
      $scope.$digest();

      expect($scope.answer.value).toBe('');

      $scope.selectedAnswer = 'Option 1';
      $scope.$digest();

      expect($scope.answer.value).toBe('Option 1');

      $scope.selectedAnswer = '__other__';
      $scope.otherAnswer = 'Other';
      $scope.$digest();

      expect($scope.answer.value).toBe('Other');
    });
  });
});
