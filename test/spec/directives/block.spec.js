import 'angular-mocks';
import _ from 'lodash';

describe('Directive: blocks', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  describe('nameQuestion', () => {
    let $compile, $rootScope, $scope;
    beforeEach(inject((_$compile_, _$rootScope_, $templateCache, testData) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;

      $scope = $rootScope.$new();
      $scope.currentRegistration = testData.registration;
      $scope.answer = {};
      $templateCache.put('views/blocks/nameQuestion.html', '');

      $scope.block = _.cloneDeep(
        testData.conference.registrationPages[1].blocks[1],
      );
    }));

    describe('lockedStaffProfileBlock', () => {
      let globalUserSpy;
      beforeEach(() => {
        globalUserSpy = spyOn($rootScope, 'globalUser').and.returnValue({
          employeeId: '0123456',
        });
        $scope.adminEditRegistrant = null;
        $scope.currentRegistrant =
          $scope.currentRegistration.primaryRegistrantId;
      });

      it('is true when staff are editing a NAME field on the primary registrant', () => {
        $compile('<name-question></name-question>')($scope);
        $scope.$digest();

        expect($scope.lockedStaffProfileBlock).toBe(true);
      });

      it('is false when profile has not loaded', () => {
        globalUserSpy.and.returnValue(null);

        $compile('<name-question></name-question>')($scope);
        $scope.$digest();

        expect($scope.lockedStaffProfileBlock).toBe(false);
      });

      it('is false when currentRegistration is null', () => {
        $scope.currentRegistration = null;
        globalUserSpy.and.returnValue(null);

        $compile('<name-question></name-question>')($scope);
        $scope.$digest();

        expect($scope.lockedStaffProfileBlock).toBe(false);
      });

      it('is false for non-staff', () => {
        globalUserSpy.and.returnValue({ employeeId: null });

        $compile('<name-question></name-question>')($scope);
        $scope.$digest();

        expect($scope.lockedStaffProfileBlock).toBe(false);
      });

      it('is false when an admin is editing', () => {
        $scope.adminEditRegistrant = {};

        $compile('<name-question></name-question>')($scope);
        $scope.$digest();

        expect($scope.lockedStaffProfileBlock).toBe(false);
      });

      it('is false when the profile type is not NAME', () => {
        $scope.block.profileType = null;

        $compile('<name-question></name-question>')($scope);
        $scope.$digest();

        expect($scope.lockedStaffProfileBlock).toBe(false);
      });

      it('is false when editing a secondary registrant', () => {
        $scope.currentRegistrant = 'other';

        $compile('<name-question></name-question>')($scope);
        $scope.$digest();

        expect($scope.lockedStaffProfileBlock).toBe(false);
      });
    });
  });

  describe('emailQuestion', () => {
    let $compile, $rootScope, $scope;
    beforeEach(inject((_$compile_, _$rootScope_, $templateCache, testData) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;

      $scope = $rootScope.$new();
      $scope.currentRegistration = testData.registration;
      $templateCache.put('views/blocks/emailQuestion.html', '');

      $scope.block = _.cloneDeep(
        testData.conference.registrationPages[0].blocks[0],
      );
    }));

    describe('lockedStaffProfileBlock', () => {
      let globalUserSpy;
      beforeEach(() => {
        globalUserSpy = spyOn($rootScope, 'globalUser').and.returnValue({
          employeeId: '0123456',
        });
        $scope.adminEditRegistrant = null;
        $scope.currentRegistrant =
          $scope.currentRegistration.primaryRegistrantId;
      });

      it('is true when staff are editing an EMAIL field on the primary registrant', () => {
        $compile('<email-question></email-question>')($scope);
        $scope.$digest();

        expect($scope.lockedStaffProfileBlock).toBe(true);
      });

      it('is false when profile has not loaded', () => {
        globalUserSpy.and.returnValue(null);

        $compile('<email-question></email-question>')($scope);
        $scope.$digest();

        expect($scope.lockedStaffProfileBlock).toBe(false);
      });

      it('is false for non-staff', () => {
        globalUserSpy.and.returnValue({ employeeId: null });

        $compile('<email-question></email-question>')($scope);
        $scope.$digest();

        expect($scope.lockedStaffProfileBlock).toBe(false);
      });

      it('is false when an admin is editing', () => {
        $scope.adminEditRegistrant = {};

        $compile('<email-question></email-question>')($scope);
        $scope.$digest();

        expect($scope.lockedStaffProfileBlock).toBe(false);
      });

      it('is false when the profile type is not EMAIL', () => {
        $scope.block.profileType = null;

        $compile('<email-question></email-question>')($scope);
        $scope.$digest();

        expect($scope.lockedStaffProfileBlock).toBe(false);
      });

      it('is false when editing a secondary registrant', () => {
        $scope.currentRegistrant = 'other';

        $compile('<email-question></email-question>')($scope);
        $scope.$digest();

        expect($scope.lockedStaffProfileBlock).toBe(false);
      });
    });
  });

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

      $scope.conference = testData.conference;
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
      $scope.$digest();
      $timeout.flush();

      expect($scope.answer.value).toBe('Option 1');

      $scope.selectedAnswer = '__other__';
      $scope.otherAnswer = 'Other';
      $scope.$digest();
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

  describe('campusQuestion', () => {
    let $compile, $rootScope, $scope, $httpBackend;
    beforeEach(inject((
      _$compile_,
      _$rootScope_,
      _$timeout_,
      $templateCache,
      testData,
      _$httpBackend_,
    ) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;

      $scope = $rootScope.$new();
      $templateCache.put('views/blocks/campusQuestion.html', '');
      $scope.block = _.cloneDeep(
        testData.conference.registrationPages[1].blocks[4],
      );
      $scope.block.content.showInternationalCampuses = true;
    }));

    it('forms the searchCampuses params correctly', () => {
      $scope.block.content.showInternationalCampuses = true;
      $compile('<campus-question></campus-question>')($scope);
      $scope.$digest();

      $scope.searchCampuses('San');

      expect($scope.params.limit).toBeDefined();

      expect($scope.params.includeInternational).toBeDefined();
    });

    it("doesn't add includeInternational", () => {
      $scope.block.content.showInternationalCampuses = false;
      $compile('<campus-question></campus-question>')($scope);
      $scope.$digest();

      $scope.searchCampuses('San');

      expect($scope.params.includeInternational).not.toBeDefined();
    });

    it('checks the campus database if a answer is present on page load', () => {
      $httpBackend
        .whenGET('campuses/SFSU?includeInternational=true&limit=15')
        .respond(() => [200, []]);

      $scope.answer = { value: 'SFSU' };
      $compile('<campus-question></campus-question>')($scope);

      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();

      expect($scope.answer.value).toBe('');
    });
  });

  describe('ethnicityQuestion', () => {
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
      $templateCache.put('views/blocks/ethnicityQuestion.html', '');

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
      $compile('<ethnicity-question></ethnicity-question>')($scope);
      $scope.$digest();

      expect($scope.selectedAnswer).toBe('');

      expect($scope.otherAnswer).toBe('');
    });

    it('has no selection when answer value is empty', () => {
      $scope.answer = { value: '' };
      $compile('<ethnicity-question></ethnicity-question>')($scope);
      $scope.$digest();

      expect($scope.selectedAnswer).toBe('');

      expect($scope.otherAnswer).toBe('');
    });

    it('has answer selection when answer is provided', () => {
      $scope.answer = { value: 'Multi-racial/Multi-ethnic' };
      $compile('<ethnicity-question></ethnicity-question>')($scope);
      $scope.$digest();

      expect($scope.selectedAnswer).toBe('Multi-racial/Multi-ethnic');

      expect($scope.otherAnswer).toBe('');
    });

    it('has other selection when answer not in options is provided', () => {
      $scope.answer = { value: 'Other' };
      $compile('<ethnicity-question></ethnicity-question>')($scope);
      $scope.$digest();

      expect($scope.selectedAnswer).toBe('__other__');

      expect($scope.otherAnswer).toBe('Other');
    });

    it('updates the answer value when the selection changes', () => {
      $scope.answer = { value: '' };
      $compile('<ethnicity-question></ethnicity-question>')($scope);
      $scope.$digest();

      expect($scope.answer.value).toBe('');

      $scope.selectedAnswer = 'Option 1';
      $scope.$digest();
      $timeout.flush();

      expect($scope.answer.value).toBe('Option 1');

      $scope.selectedAnswer = '__other__';
      $scope.otherAnswer = 'Other';
      $scope.$digest();
      $timeout.flush();

      expect($scope.answer.value).toBe('Other');
    });

    it('selects the other answer', () => {
      $scope.answer = { value: 'Multi-racial/Multi-ethnic' };
      $compile('<ethnicity-question></ethnicity-question>')($scope);
      $scope.$digest();

      $scope.selectOtherAnswer();

      expect($scope.selectedAnswer).toBe('Multi-racial/Multi-ethnic');

      $scope.otherAnswer = 'Other';
      $scope.selectOtherAnswer();

      expect($scope.selectedAnswer).toBe('__other__');
    });

    it('clears the answer', () => {
      $scope.answer = { value: 'Multi-racial/Multi-ethnic' };
      $compile('<ethnicity-question></ethnicity-question>')($scope);
      $scope.$digest();

      expect($scope.selectedAnswer).toBe('Multi-racial/Multi-ethnic');

      $scope.clearOther();

      expect($scope.otherAnswer).toBe('');
    });

    it('debounces answer updates', () => {
      $scope.answer = { value: '' };
      $compile('<ethnicity-question></ethnicity-question>')($scope);
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
