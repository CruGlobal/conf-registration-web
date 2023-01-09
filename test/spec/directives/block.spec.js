import 'angular-mocks';
import _ from 'lodash';

describe('Directive: blocks', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  describe('radioQuestion', () => {
    let $compile, $rootScope, $scope, $timeout;
    beforeEach(inject((
      _$compile_,
      _$rootScope_,
      _$timeout_,
      $templateCache,
      testData,
    ) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;

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

    it('handles other option disabled', () => {
      $scope.block.content.otherOption = undefined;
      $compile('<radio-question></radio-question>')($scope);
      $scope.$digest();

      expect($scope.selectedAnswer).toBe('');
    });

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
      $timeout.flush();

      expect($scope.answer.value).toBe('Option 1');

      $scope.selectedAnswer = '__other__';
      $scope.otherAnswer = 'Other';
      $timeout.flush();

      expect($scope.answer.value).toBe('Other');
    });

    it('selects the other answer', () => {
      $scope.answer = { value: 'Option 1' };
      $compile('<radio-question></radio-question>')($scope);
      $scope.$digest();

      $scope.selectOtherAnswer();

      expect($scope.selectedAnswer).toBe('Option 1');

      $scope.otherAnswer = 'Other';
      $scope.selectOtherAnswer();

      expect($scope.selectedAnswer).toBe('__other__');
    });

    it('clears the answer', () => {
      $scope.answer = { value: 'Option 1' };
      $compile('<radio-question></radio-question>')($scope);
      $scope.$digest();

      expect($scope.selectedAnswer).toBe('Option 1');

      $scope.clearAnswer();

      expect($scope.selectedAnswer).toBe('');
    });

    it('debounces answer updates', () => {
      $scope.answer = { value: '' };
      $compile('<radio-question></radio-question>')($scope);
      $scope.$digest();

      expect($scope.answer.value).toBe('');

      $scope.selectedAnswer = 'Option 1';
      $scope.$digest();

      expect($scope.answer.value).toBe('');

      $scope.selectedAnswer = 'Option 2';
      $scope.$digest();

      expect($scope.answer.value).toBe('');

      $scope.otherAnswer = 'Other';
      $scope.selectOtherAnswer();

      expect($scope.answer.value).toBe('');

      $scope.selectedAnswer = 'Option 1';
      $scope.$digest();

      expect($scope.answer.value).toBe('');

      $timeout.flush();

      expect($scope.answer.value).toBe('Option 1');
    });
  });
});
