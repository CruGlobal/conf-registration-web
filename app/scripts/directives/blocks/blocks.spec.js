import 'angular-mocks';
import _ from 'lodash';
import { getCurrentRegions } from '../../filters/eventAddressFormat';

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
      $templateCache.put('scripts/directives/blocks/nameQuestion.html', '');

      $scope.block = _.cloneDeep(
        testData.conference.registrationPages[1].blocks[1],
      );
    }));

    describe('lockedStaffProfileBlock', () => {
      let globalUserSpy;
      beforeEach(() => {
        globalUserSpy = spyOn($rootScope, 'globalUser').and.returnValue({
          orca: true,
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
        globalUserSpy.and.returnValue({ orca: false });

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
      $templateCache.put('scripts/directives/blocks/emailQuestion.html', '');

      $scope.block = _.cloneDeep(
        testData.conference.registrationPages[0].blocks[0],
      );
    }));

    describe('lockedStaffProfileBlock', () => {
      let globalUserSpy;
      beforeEach(() => {
        globalUserSpy = spyOn($rootScope, 'globalUser').and.returnValue({
          orca: true,
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
        globalUserSpy.and.returnValue({ orca: false });

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
      $templateCache.put('scripts/directives/blocks/radioQuestion.html', '');

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

  describe('selectQuestion', () => {
    let $compile, $rootScope, $scope;
    beforeEach(inject((_$compile_, _$rootScope_, $templateCache, testData) => {
      $compile = _$compile_;
      $rootScope = _$rootScope_;

      $scope = $rootScope.$new();
      $templateCache.put('scripts/directives/blocks/selectQuestion.html', '');

      $scope.conference = testData.conference;
      $scope.block = _.cloneDeep(
        testData.conference.registrationPages[1].blocks[4],
      );
      $scope.block.content.choices = [{ value: 'Option A', amount: 10 }];
      $scope.daysForBlock = () => 1;
    }));

    it('includes amount in visibleValues when hideAmount is false', () => {
      $scope.block.hideAmount = false;
      $compile('<select-question></select-question>')($scope);
      $scope.$digest();

      expect($scope.visibleValues[0]).toContain('Option A');
      expect($scope.visibleValues[0]).toContain('10');
    });

    it('excludes amount from visibleValues when hideAmount is true', () => {
      $scope.block.hideAmount = true;
      $compile('<select-question></select-question>')($scope);
      $scope.$digest();

      expect($scope.visibleValues[0]).toBe('Option A');
      expect($scope.visibleValues[0]).not.toContain('10');
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
      $templateCache.put('scripts/directives/blocks/campusQuestion.html', '');
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

      expect($scope.params.limit).toBe(15);

      expect($scope.params.includeInternational).toBe(true);
    });

    it("doesn't add includeInternational", () => {
      $scope.block.content.showInternationalCampuses = false;
      $compile('<campus-question></campus-question>')($scope);
      $scope.$digest();

      $scope.searchCampuses('San');

      expect($scope.params.includeInternational).toBeUndefined();
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

  describe('campusV2Question', () => {
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
      $templateCache.put('scripts/directives/blocks/campusV2Question.html', '');
      $scope.block = _.cloneDeep(
        testData.conference.registrationPages[1].blocks[4],
      );
    }));

    it('forms the searchV2Campuses params correctly', () => {
      $scope.answer = {};
      $compile('<campus-v2-question></campus-v2-question>')($scope);
      $scope.$digest();

      $httpBackend.expectGET('campuses/connections/search?name=San');
      $scope.searchV2Campuses('San');

      expect($scope.params.name).toBe('San');
      expect($scope.params.limit).toBeUndefined();
      expect($scope.params.includeInternational).toBeUndefined();
    });

    it('clears the answer if campus is not found', () => {
      $httpBackend
        .whenGET('campuses/connections/search?name=SFSU')
        .respond(() => [200, { records: [] }]);

      $scope.answer = { value: { id: '123', name: 'SFSU' } };
      $compile('<campus-v2-question></campus-v2-question>')($scope);

      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();

      expect($scope.answer.value).toBe('');
    });

    it('gets campus name from enriched value on page load', () => {
      $httpBackend
        .whenGET('campuses/connections/search?name=SFSU')
        .respond(() => [200, { records: [{ id: 123, name: 'SFSU' }] }]);

      $scope.answer = { value: { id: 123, name: 'SFSU' } };
      $compile('<campus-v2-question></campus-v2-question>')($scope);

      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();

      expect($scope.campusName).toBe('SFSU');
    });

    it('sets the answer value when a campus is selected', () => {
      $scope.answer = {};
      $compile('<campus-v2-question></campus-v2-question>')($scope);
      $scope.$digest();

      $scope.selectCampus({ id: 123, name: 'SFSU' });

      expect($scope.answer.value).toBe(123);
      expect($scope.campusName).toBe('SFSU');
    });

    it('does not wipe answer when no campusName is set', () => {
      $scope.answer = { value: '123' };
      $compile('<campus-v2-question></campus-v2-question>')($scope);
      $scope.$digest();

      $httpBackend.verifyNoOutstandingRequest();

      expect($scope.answer.value).toBe('123');
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
      $templateCache.put(
        'scripts/directives/blocks/ethnicityQuestion.html',
        '',
      );

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

  describe('addressQuestion', () => {
    let $compile, $scope, $timeout;
    beforeEach(inject((_$compile_, _$rootScope_, _$timeout_, testData) => {
      $compile = _$compile_;
      $timeout = _$timeout_;

      $scope = _$rootScope_.$new();
      $scope.block = testData.conference.registrationPages[1].blocks[7];
      $scope.answer = testData.registration.registrants[0].answers[8];
    }));

    const compile = () => {
      $compile('<address-question></address-question>')($scope);
      $scope.$digest();
      return $scope.addressForm;
    };

    const setField = (form, field, value) => {
      $scope.answer.value[field] = value;
      $scope.$digest();
      return form[field];
    };

    const setCountry = (country) => {
      $scope.answer.value.country = country;
      $scope.$digest();
    };

    const stateSelectOf = (element) =>
      element[0].querySelector('select[aria-label="State/Region"]');

    const stateInputOf = (element) =>
      element[0].querySelector('input[placeholder="State/Region"]');

    it('accepts a well formed address', () => {
      const form = compile();

      expect(form.$valid).toBe(true);
    });

    it('rejects a zip with no numbers in it', () => {
      const form = compile();

      expect(setField(form, 'zip', 'ABCDEFG').$error.pattern).toBe(true);
    });

    it('accepts a US zip code', () => {
      const form = compile();

      expect(setField(form, 'zip', '11111').$valid).toBe(true);
    });

    it('accepts a US zip+4 code', () => {
      const form = compile();

      expect(setField(form, 'zip', '32832-1234').$valid).toBe(true);
    });

    it('accepts a UK postcode', () => {
      const form = compile();

      expect(setField(form, 'zip', 'SW1A 1AA').$valid).toBe(true);
    });

    it('accepts a Canadian postal code', () => {
      const form = compile();

      expect(setField(form, 'zip', 'K1A 0B1').$valid).toBe(true);
    });

    it('accepts a Dutch postal code', () => {
      const form = compile();

      expect(setField(form, 'zip', '1234 AB').$valid).toBe(true);
    });

    it('rejects a city with no letters in it', () => {
      const form = compile();

      expect(setField(form, 'city', '12345').$error.pattern).toBe(true);
    });

    it('accepts a city name with an umlaut', () => {
      const form = compile();

      expect(setField(form, 'city', 'Zürich').$valid).toBe(true);
    });

    it('accepts a city name with a tilde', () => {
      const form = compile();

      expect(setField(form, 'city', 'São Paulo').$valid).toBe(true);
    });

    it('accepts a city name written in Japanese', () => {
      const form = compile();

      expect(setField(form, 'city', '東京').$valid).toBe(true);
    });

    it('accepts a city name written in Cyrillic', () => {
      const form = compile();

      expect(setField(form, 'city', 'Москва').$valid).toBe(true);
    });

    it('rejects a city longer than 50 characters', () => {
      const form = compile();

      expect(setField(form, 'city', 'a'.repeat(51)).$error.maxlength).toBe(
        true,
      );
    });

    it('accepts a city of exactly 50 characters', () => {
      const form = compile();

      expect(setField(form, 'city', 'a'.repeat(50)).$valid).toBe(true);
    });

    it('rejects an address line longer than 100 characters', () => {
      const form = compile();

      expect(setField(form, 'address1', 'a'.repeat(101)).$error.maxlength).toBe(
        true,
      );
    });

    it('accepts an address line of exactly 100 characters', () => {
      const form = compile();

      expect(setField(form, 'address1', 'a'.repeat(100)).$valid).toBe(true);
    });

    it('ignores empty and null subfields', () => {
      const form = compile();

      $scope.answer.value = {
        ...$scope.answer.value,
        address1: null,
        city: null,
        zip: '',
      };
      $scope.$digest();

      expect(form.city.$error.pattern).toBeUndefined();
      expect(form.zip.$error.pattern).toBeUndefined();
      expect(form.address1.$error.maxlength).toBeUndefined();
    });

    it('keeps an invalid value on the model so the page gate can see it', () => {
      const form = compile();

      form.zip.$setViewValue('ABCDE');
      $timeout.flush();

      expect(form.zip.$error.pattern).toBe(true);
      expect($scope.answer.value.zip).toBe('ABCDE');
    });

    it('offers a state select for a country with regions', () => {
      $scope.currentRegions = getCurrentRegions;
      const element = $compile('<address-question></address-question>')($scope);
      $scope.$digest();

      expect(stateSelectOf(element)).not.toBeNull();
      expect(stateInputOf(element)).toBeNull();
    });

    it('offers a free text state field for a country without regions', () => {
      $scope.currentRegions = getCurrentRegions;
      const element = $compile('<address-question></address-question>')($scope);
      $scope.$digest();

      setCountry('VA');

      expect(stateSelectOf(element)).toBeNull();
      expect(stateInputOf(element)).not.toBeNull();
    });

    it('rejects a state longer than 50 characters', () => {
      $scope.currentRegions = getCurrentRegions;
      const form = compile();
      setCountry('VA');

      expect(setField(form, 'state', 'a'.repeat(51)).$error.maxlength).toBe(
        true,
      );
    });

    it('accepts a state of exactly 50 characters', () => {
      $scope.currentRegions = getCurrentRegions;
      const form = compile();
      setCountry('VA');

      expect(setField(form, 'state', 'a'.repeat(50)).$valid).toBe(true);
    });
  });
});
