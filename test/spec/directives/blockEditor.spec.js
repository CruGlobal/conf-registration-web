import 'angular-mocks';
import { familyLifeMinistryId } from '../../../app/scripts/directives/blockEditor';

// Mock HTTP response to populate the service's internal blockTagTypes
const mockBlockTagTypes = [
  {
    id: 'TYPE1',
    ministryId: null,
    name: 'Tag_Type_1',
    prettyName: 'Block Tag Type 1',
  },
  {
    id: 'TYPE2',
    ministryId: null,
    name: 'Tag_Type_2',
    prettyName: 'Block Tag Type 2',
  },
  {
    id: 'TYPE3',
    ministryId: null,
    name: 'Tag_Type_3',
    prettyName: 'Block Tag Type 3',
  },
];

describe('Directive: blockEditor', function () {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  var element, scope, $compile, $rootScope, testData, mockBlockTagTypeMapping;
  beforeEach(inject(function (
    _$compile_,
    _$rootScope_,
    $templateCache,
    _testData_,
  ) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    testData = _testData_;

    scope = $rootScope.$new();
    $templateCache.put('views/components/blockEditor.html', '');

    scope.conference = testData.conference;
    scope.block = testData.conference.registrationPages[1].blocks[5];

    element = $compile('<div block-editor></div>')(scope);
    scope.$digest();

    const parentScope = $rootScope.$new();
    parentScope.fetchBlockTagTypeMapping = jasmine.createSpy(
      'fetchBlockTagTypeMapping',
    );

    mockBlockTagTypeMapping = [
      {
        ...testData.blockTagTypeMapping[0],
        blockId: 'block1',
        blockTagTypeId: 'TYPE1',
      },
      {
        ...testData.blockTagTypeMapping[1],
        blockId: 'block2',
        blockTagTypeId: 'TYPE2',
      },
      {
        ...testData.blockTagTypeMapping[2],
        blockId: 'block3',
        blockTagTypeId: null,
      },
    ];

    parentScope.blockTagTypeMapping = mockBlockTagTypeMapping;
    scope.$parent = parentScope;
    parentScope.blockTagTypes = mockBlockTagTypes;

    scope = element.isolateScope() || element.scope();
  }));

  it('updates forceSelection', function () {
    scope.block.content.forceSelections = { someValue: true };

    scope.onChoiceOptionChange();

    expect(scope.block.content.forceSelections['someValue']).toBeUndefined();
  });

  it('should open modal for Advanced Option', function () {
    scope.conference.currency = {
      code: 'USD',
      name: 'US Dollar',
      shortSymbol: 'US',
    };
    scope.editBlockOptionAdvanced();
  });

  it('set new answer rules operand to OR by default', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {
      id: '18ccfb09-3006-4981-ab5e-bbbbbbbbbbbb',
    });
    scope.block = block;

    scope.editBlockAddOption('EEE');

    expect(scope.block.content.choices[4].operand).toBe('OR');
  });

  it('should not create an error message if there are not multiple questions with the same Cru Profile type', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {
      id: '9b83eebd-b064-4edf-92d0-7982a330272b',
    });
    scope.block = block;
    scope.block.profileType = null;

    scope.toggleProfileType(true);

    expect(scope.pType).toBeUndefined();
  });

  it('Duplicate Cru Profile Gender Question: Changes gender to sex in error message', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {
      id: '9b83eebd-b064-4edf-92d0-7982a330272a',
    });
    scope.block = block;

    scope.toggleProfileType(true);

    expect(scope.pType).toBe('Sex');
  });

  it('returns whether a question type exists or not using eventHasQuestionType()', function () {
    const block = _.find(testData.conference.registrationPages[1].blocks, {
      id: '9b83eebd-b064-4edf-92d0-7982a330272a',
    });
    scope.block = block;

    expect(scope.eventHasQuestionType('genderQuestion')).toBe(true);

    expect(scope.eventHasQuestionType('ethnicityQuestion')).toBe(false);
  });

  describe('blockTagTypeTypeChanged', function () {
    let blockTagTypeService, $httpBackend;

    beforeEach(inject(function (_blockTagTypeService_, _$httpBackend_) {
      blockTagTypeService = _blockTagTypeService_;
      $httpBackend = _$httpBackend_;

      $httpBackend
        .whenGET(/^blockTagTypes\/.+$/)
        .respond(200, mockBlockTagTypes);

      // Call loadBlockTagTypes to populate the service's internal state
      blockTagTypeService.loadBlockTagTypes(
        'test-conference-id',
        familyLifeMinistryId,
      );
      $httpBackend.flush();

      // Set up blockTagTypeMapping with test data
      scope.blockTagTypeMapping = testData.blockTagTypeMapping;
      scope.block.id = 'block3';

      // Set blockTagTypes on scope so the directive can access them
      scope.blockTagTypes = blockTagTypeService.blockTagTypes();

      // Spy on the service method to verify it's called correctly
      spyOn(blockTagTypeService, 'validateFieldSelection').and.callThrough();
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should store validation result when block tag type is valid', function () {
      // Select a block tag type that is not already used
      scope.blockTagTypeTypeChanged('TYPE3');

      expect(scope.blockTagTypeValidation).toEqual({
        valid: true,
        message: '',
      });

      expect(scope.$parent.fetchBlockTagTypeMapping).toHaveBeenCalledWith();
    });

    it('should not save new block tag type when validation fails due to conflicting Registrant Types on the same block tag type', function () {
      // Set the block's block tag type to TYPE2
      scope.block.blockTagType = mockBlockTagTypes[1];
      scope.block.id = 'block2';

      // Try to select TYPE1 which is already used by block1
      scope.blockTagTypeTypeChanged('TYPE1');

      expect(scope.blockTagTypeValidation).toEqual({
        valid: false,
        message: `Block Tag Type 1 has been selected on block "First Name Question" with the following conflicting Registrant Types: Default`,
      });
      // Should reset to TYPE2 because validation failed
      expect(scope.block.blockTagType.id).toBe('TYPE2');
    });

    it('should save correctly with no validation errors when selecting null block tag type', function () {
      scope.block.blockTagType = mockBlockTagTypes[0];

      scope.blockTagTypeTypeChanged(null);

      expect(scope.blockTagTypeValidation).toEqual({
        valid: true,
        message: '',
      });

      expect(scope.block.blockTagType).toBe(null);
    });

    it('should allow re-selecting the same block tag type for the same block', function () {
      // block3 currently has TYPE3
      scope.block.blockTagType = mockBlockTagTypes[2];
      scope.blockTagTypeMapping[2].blockTagTypeId = 'TYPE3';

      // Re-select TYPE3 for the same block
      scope.blockTagTypeTypeChanged('TYPE3');

      expect(scope.blockTagTypeValidation).toEqual({
        valid: true,
        message: '',
      });
      // Should not reset because it's the same block
      expect(scope.block.blockTagType.id).toBe('TYPE3');
    });
  });

  describe('showBlockTagTypeDropdown', function () {
    it('should not show the block tag type dropdown when the conference is not a FamilyLife conference', function () {
      scope.conference.ministry = 'other-ministry-id';

      expect(scope.showBlockTagTypeDropdown()).toBe(false);
    });

    it('should show the block tag type dropdown when the conference is a FamilyLife conference', function () {
      scope.conference.ministry = familyLifeMinistryId;

      expect(scope.showBlockTagTypeDropdown()).toBe(true);
    });
  });

  describe('isBlockTagTypeDisabled', function () {
    beforeEach(function () {
      scope.blockTagTypeMapping = [
        ...testData.blockTagTypeMapping,
        {
          blockId: 'block4',
          title: 'Phone',
          blockTagTypeId: 'TYPE4',
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: [],
        },
      ];

      // Set current block to block3 (which has no tag type assigned)
      scope.block.id = 'block3';
      scope.block.blockTagType = null;
    });

    it('should not disable the "None" option (null)', function () {
      const result = scope.isBlockTagTypeDisabled(null);

      expect(result).toBe(false);
    });

    it('should not disable a blockTagType that is not yet assigned to any block', function () {
      const result = scope.isBlockTagTypeDisabled('TYPE5');

      expect(result).toBe(false);
    });

    it('should not disable the currently selected blockTagType for this block', function () {
      scope.block.blockTagType = mockBlockTagTypes[0];
      const result = scope.isBlockTagTypeDisabled('TYPE1');

      expect(result).toBe(false);
    });

    it('should not disable a blockTagType that is assigned to another block, but not all registrant types are included', function () {
      const result = scope.isBlockTagTypeDisabled('TYPE1');

      expect(result).toBe(false);
    });

    it('should disable a blockTagType that is assigned to another block, where all registrant types are included', function () {
      scope.conference.registrantTypes = [
        { id: 'reg-type-1', name: 'Type 1' },
        { id: 'reg-type-2', name: 'Type 2' },
        { id: 'reg-type-3', name: 'Type 3' },
      ];

      scope.$parent.blockTagTypeMapping = [
        {
          blockId: 'block4',
          title: 'Phone',
          blockTagTypeId: 'TYPE4',
          hiddenFromRegistrantTypes: [],
          includedInRegistrantTypes: [
            { id: 'reg-type-1', name: 'Type 1' },
            { id: 'reg-type-2', name: 'Type 2' },
            { id: 'reg-type-3', name: 'Type 3' },
          ],
        },
      ];

      scope.block.id = 'block3';
      scope.block.blockTagType = null;

      const isDisabled = scope.isBlockTagTypeDisabled('TYPE4');

      expect(isDisabled).toBe(true);
    });

    it('should not disable if conference has 4 registrant types, but only 3 are assigned to the blockTagType', function () {
      scope.conference.registrantTypes = [
        { id: 'reg-type-1', name: 'Type 1' },
        { id: 'reg-type-2', name: 'Type 2' },
        { id: 'reg-type-3', name: 'Type 3' },
        { id: 'reg-type-4', name: 'Type 4' },
      ];

      // TYPE4 is assigned to block4 with only 3 of the 4 registrant types
      scope.$parent.blockTagTypeMapping = [
        {
          blockId: 'block4',
          title: 'Phone',
          blockTagTypeId: 'TYPE4',
          hiddenFromRegistrantTypes: [{ id: 'reg-type-4', name: 'Type 4' }],
          includedInRegistrantTypes: [
            { id: 'reg-type-1', name: 'Type 1' },
            { id: 'reg-type-2', name: 'Type 2' },
            { id: 'reg-type-3', name: 'Type 3' },
          ],
        },
      ];

      scope.block.id = 'block3';
      scope.block.blockTagType = null;

      const isDisabled = scope.isBlockTagTypeDisabled('TYPE4');

      expect(isDisabled).toBe(false);
    });

    it('should disable if 2 separate blocks have the same blockTagType assigned, and together they cover all registrant types', function () {
      scope.conference.registrantTypes = [
        { id: 'reg-type-1', name: 'Type 1' },
        { id: 'reg-type-2', name: 'Type 2' },
        { id: 'reg-type-3', name: 'Type 3' },
        { id: 'reg-type-4', name: 'Type 4' },
      ];

      // Two blocks share TYPE4, and together they cover all registrant types
      scope.$parent.blockTagTypeMapping = [
        {
          blockId: 'block4',
          title: 'Phone',
          blockTagTypeId: 'TYPE4',
          hiddenFromRegistrantTypes: [
            { id: 'reg-type-3', name: 'Type 3' },
            { id: 'reg-type-4', name: 'Type 4' },
          ],
          includedInRegistrantTypes: [
            { id: 'reg-type-1', name: 'Type 1' },
            { id: 'reg-type-2', name: 'Type 2' },
          ],
        },
        {
          blockId: 'block5',
          title: 'Email',
          blockTagTypeId: 'TYPE4',
          hiddenFromRegistrantTypes: [
            { id: 'reg-type-1', name: 'Type 1' },
            { id: 'reg-type-2', name: 'Type 2' },
          ],
          includedInRegistrantTypes: [
            { id: 'reg-type-3', name: 'Type 3' },
            { id: 'reg-type-4', name: 'Type 4' },
          ],
        },
      ];

      scope.block.id = 'block3';
      scope.block.blockTagType = null;

      const isDisabled = scope.isBlockTagTypeDisabled('TYPE4');

      expect(isDisabled).toBe(true);
    });
  });
});
