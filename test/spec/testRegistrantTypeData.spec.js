import 'angular-mocks';

angular
  .module('confRegistrationWebApp')
  .service('testRegistrantTypeData', function () {
    this.conference = {
      id: '0dc61eeb-6932-4d09-b04f-9def3915fd4c',
      name: 'EVENT 607',
      description: null,
      abbreviation: null,
      registrationPages: [
        {
          id: 'ca2ea3a4-008b-4a9c-a653-8c5ecd980e82',
          conferenceId: '0dc61eeb-6932-4d09-b04f-9def3915fd4c',
          title: 'Your Information',
          position: 0,
          blocks: [
            {
              id: '965094e3-1dd0-48f2-a0ad-705e7e9f3c06',
              pageId: 'ca2ea3a4-008b-4a9c-a653-8c5ecd980e82',
              title: 'Name',
              exportFieldTitle: null,
              type: 'nameQuestion',
              required: true,
              position: 0,
              adminOnly: false,
              content: {
                default: '',
                ruleoperand: 'AND',
                forceSelections: {},
                forceSelectionRuleOperand: 'AND',
              },
              profileType: 'NAME',
              registrantTypes: [],
              rules: [],
              expenseType: null,
              startDateBlockId: null,
              endDateBlockId: null,
            },
            {
              id: 'f0c0e357-520a-4e30-809b-3320aa1007ca',
              pageId: 'ca2ea3a4-008b-4a9c-a653-8c5ecd980e82',
              title: 'Email',
              exportFieldTitle: null,
              type: 'emailQuestion',
              required: true,
              position: 1,
              adminOnly: false,
              content: {
                default: '',
                ruleoperand: 'AND',
                forceSelections: {},
                forceSelectionRuleOperand: 'AND',
              },
              profileType: 'EMAIL',
              registrantTypes: [],
              rules: [],
              expenseType: null,
              startDateBlockId: null,
              endDateBlockId: null,
            },
          ],
        },
      ],
      registrantTypes: [
        {
          id: '1728f920-01b8-4dcb-8eb7-2927829d6d87',
          conferenceId: '0dc61eeb-6932-4d09-b04f-9def3915fd4c',
          name: 'Default',
          hidden: false,
          createdTimestamp: null,
          lastUpdatedTimestamp: '2018-12-20T13:26:52.556Z',
          cost: 0,
          calculatedCurrentCost: 0,
          minimumDeposit: null,
          position: 0,
          customConfirmationEmailText: null,
          description: null,
          groupSubRegistrantType: false,
          allowGroupRegistrations: false,
          familyStatus: 'DISABLED',
          numberSlotsLimit: 0,
          useLimit: false,
          availableSlots: 0,
          acceptCreditCards: false,
          acceptTransfers: false,
          acceptScholarships: false,
          acceptChecks: false,
          acceptPayOnSite: false,
          defaultTypeKey: null,
          earlyRegistrationDiscounts: [],
          registrationCompleteRedirect: 'url1.com',
        },
        {
          id: '115f2658-aa1c-4c0a-8d8a-9a8ea3dd7e22',
          conferenceId: '0dc61eeb-6932-4d09-b04f-9def3915fd4c',
          name: 'Group 1',
          hidden: false,
          createdTimestamp: null,
          lastUpdatedTimestamp: '2018-12-20T13:26:52.556Z',
          cost: 0,
          calculatedCurrentCost: 0,
          minimumDeposit: null,
          position: 1,
          allowedRegistrantTypeSet: [
            {
              id: 'c',
              childRegistrantTypeId: 'ec98a7e5-94f2-4ecc-9dd8-964e2910df20',
              numberOfChildRegistrants: 2,
            },
            {
              id: 'd',
              childRegistrantTypeId: '85fcc4dc-9d38-4c7e-a8a5-d48ba6effdd3',
              numberOfChildRegistrants: 1,
            },
          ],
          customConfirmationEmailText: null,
          description: null,
          groupSubRegistrantType: false,
          allowGroupRegistrations: true,
          familyStatus: 'ENABLED',
          numberSlotsLimit: 0,
          useLimit: false,
          availableSlots: 0,
          acceptCreditCards: false,
          acceptTransfers: false,
          acceptScholarships: false,
          acceptChecks: false,
          acceptPayOnSite: false,
          defaultTypeKey: '',
          earlyRegistrationDiscounts: [],
          registrationCompleteRedirect: 'url2.com',
        },
        {
          id: 'a0c10ac3-f763-487a-a50d-e84822c89cd4',
          conferenceId: '0dc61eeb-6932-4d09-b04f-9def3915fd4c',
          name: 'Group 2',
          hidden: false,
          allowedRegistrantTypeSet: [
            {
              id: 'a',
              childRegistrantTypeId: 'fc10c9a0-018c-4536-9a46-14430caa5c93',
              numberOfChildRegistrants: 3,
            },
            {
              id: 'b',
              childRegistrantTypeId: '61a3a1ec-5c53-4010-8df1-46031b53bc78',
              numberOfChildRegistrants: 2,
            },
          ],
          createdTimestamp: null,
          lastUpdatedTimestamp: '2018-12-20T13:26:52.556Z',
          cost: 0,
          calculatedCurrentCost: 0,
          minimumDeposit: null,
          position: 2,
          customConfirmationEmailText: null,
          description: null,
          groupSubRegistrantType: false,
          allowGroupRegistrations: true,
          familyStatus: 'ENABLED',
          numberSlotsLimit: 0,
          useLimit: false,
          availableSlots: 0,
          acceptCreditCards: false,
          acceptTransfers: false,
          acceptScholarships: false,
          acceptChecks: false,
          acceptPayOnSite: false,
          defaultTypeKey: '',
          earlyRegistrationDiscounts: [],
          registrationCompleteRedirect: 'url3.com',
        },
        {
          id: 'ec98a7e5-94f2-4ecc-9dd8-964e2910df20',
          conferenceId: '0dc61eeb-6932-4d09-b04f-9def3915fd4c',
          name: 'Group 1 Dependant 1',
          hidden: false,
          createdTimestamp: null,
          lastUpdatedTimestamp: '2018-12-20T13:26:52.557Z',
          cost: 0,
          calculatedCurrentCost: 0,
          minimumDeposit: null,
          position: 3,
          customConfirmationEmailText: null,
          description: null,
          groupSubRegistrantType: true,
          allowGroupRegistrations: false,
          familyStatus: 'FAMILY_ONLY',
          numberSlotsLimit: 0,
          useLimit: false,
          availableSlots: 0,
          acceptCreditCards: false,
          acceptTransfers: false,
          acceptScholarships: false,
          acceptChecks: false,
          acceptPayOnSite: false,
          defaultTypeKey: '',
          earlyRegistrationDiscounts: [],
          registrationCompleteRedirect: null,
        },
        {
          id: '85fcc4dc-9d38-4c7e-a8a5-d48ba6effdd3',
          conferenceId: '0dc61eeb-6932-4d09-b04f-9def3915fd4c',
          name: 'Group 1 Dependant 2',
          hidden: false,
          createdTimestamp: null,
          lastUpdatedTimestamp: '2018-12-20T13:26:52.557Z',
          cost: 0,
          calculatedCurrentCost: 0,
          minimumDeposit: null,
          position: 4,
          customConfirmationEmailText: null,
          description: null,
          groupSubRegistrantType: true,
          allowGroupRegistrations: false,
          familyStatus: 'FAMILY_ONLY',
          numberSlotsLimit: 0,
          useLimit: false,
          availableSlots: 0,
          acceptCreditCards: false,
          acceptTransfers: false,
          acceptScholarships: false,
          acceptChecks: false,
          acceptPayOnSite: false,
          defaultTypeKey: '',
          earlyRegistrationDiscounts: [],
          registrationCompleteRedirect: null,
        },
        {
          id: 'fc10c9a0-018c-4536-9a46-14430caa5c93',
          conferenceId: '0dc61eeb-6932-4d09-b04f-9def3915fd4c',
          name: 'Group 2 Non-Group 1',
          hidden: false,
          createdTimestamp: null,
          lastUpdatedTimestamp: '2018-12-20T13:26:52.557Z',
          cost: 0,
          calculatedCurrentCost: 0,
          minimumDeposit: null,
          position: 5,
          customConfirmationEmailText: null,
          description: null,
          groupSubRegistrantType: false,
          allowGroupRegistrations: false,
          familyStatus: 'DISABLED',
          numberSlotsLimit: 0,
          useLimit: false,
          availableSlots: 0,
          acceptCreditCards: false,
          acceptTransfers: false,
          acceptScholarships: false,
          acceptChecks: false,
          acceptPayOnSite: false,
          defaultTypeKey: '',
          earlyRegistrationDiscounts: [],
          registrationCompleteRedirect: null,
        },
        {
          id: '61a3a1ec-5c53-4010-8df1-46031b53bc78',
          conferenceId: '0dc61eeb-6932-4d09-b04f-9def3915fd4c',
          name: 'Group 2 Dependant 2',
          hidden: false,
          createdTimestamp: null,
          lastUpdatedTimestamp: '2018-12-20T13:26:52.557Z',
          cost: 0,
          calculatedCurrentCost: 0,
          minimumDeposit: null,
          position: 6,
          customConfirmationEmailText: null,
          description: null,
          groupSubRegistrantType: true,
          allowGroupRegistrations: false,
          familyStatus: 'FAMILY_ONLY',
          numberSlotsLimit: 0,
          useLimit: false,
          availableSlots: 0,
          acceptCreditCards: false,
          acceptTransfers: false,
          acceptScholarships: false,
          acceptChecks: false,
          acceptPayOnSite: false,
          defaultTypeKey: '',
          earlyRegistrationDiscounts: [],
          registrationCompleteRedirect: null,
        },
        {
          id: 'a0c10ac3-f763-487a-a50d-e84822c89aaa',
          conferenceId: '0dc61eeb-6932-4d09-b04f-9def3915fd4c',
          name: 'Group 3',
          hidden: false,
          allowedRegistrantTypeSet: [
            {
              id: 'c',
              childRegistrantTypeId: '115f2658-aa1c-4c0a-8d8a-9a8ea3dd7e22',
              numberOfChildRegistrants: 2,
            },
            {
              id: 'd',
              childRegistrantTypeId: 'a0c10ac3-f763-487a-a50d-e84822c89aaa',
              numberOfChildRegistrants: 2,
            },
            {
              id: 'e',
              childRegistrantTypeId: '61a3a1ec-5c53-4010-8df1-46031b53bc78',
              numberOfChildRegistrants: 2,
            },
          ],
          createdTimestamp: null,
          lastUpdatedTimestamp: '2018-12-20T13:26:52.556Z',
          cost: 0,
          calculatedCurrentCost: 0,
          minimumDeposit: null,
          position: 2,
          customConfirmationEmailText: null,
          description: null,
          groupSubRegistrantType: false,
          allowGroupRegistrations: true,
          familyStatus: 'ENABLED',
          numberSlotsLimit: 0,
          useLimit: false,
          availableSlots: 0,
          acceptCreditCards: false,
          acceptTransfers: false,
          acceptScholarships: false,
          acceptChecks: false,
          acceptPayOnSite: false,
          defaultTypeKey: '',
          earlyRegistrationDiscounts: [],
          registrationCompleteRedirect: null,
        },
      ],
      promotions: [],
      eventStartTime: '2019-01-02 15:24:28',
      eventEndTime: '2019-01-08 15:24:28',
      registrationStartTime: '2018-12-19 15:24:28',
      registrationEndTime: '2019-01-02 15:24:28',
      eventTimezone: 'America/New_York',
      registrationOpen: true,
      contactPersonName: 'B W',
      contactPersonEmail: 'bartosz.w@toptal.com',
      contactPersonPhone: '',
      contactWebsite: null,
      locationName: null,
      locationAddress: null,
      locationCity: null,
      locationState: null,
      locationZipCode: null,
      relayLogin: true,
      facebookLogin: false,
      googleLogin: false,
      archived: false,
      paymentGatewayType: null,
      paymentGatewayId: null,
      paymentGatewayKey: null,
      paymentGatewayKeySaved: false,
      registrationCount: 0,
      completedRegistrationCount: 0,
      customPaymentEmailText: null,
      rideshareEnabled: false,
      rideshareEmailContent: null,
      allowEditRegistrationAfterComplete: true,
      checkPayableTo: null,
      checkMailingAddress: null,
      checkMailingCity: null,
      checkMailingState: null,
      checkMailingZip: null,
      businessUnit: null,
      operatingUnit: null,
      department: null,
      projectId: null,
      accountNumber: null,
      glAccount: null,
      combineSpouseRegistrations: false,
      loggedInUserPermissionLevel: null,
      cssUrl: null,
      cruEvent: false,
      eventType: null,
    };

    this.registration = {
      id: '16beeee4-0de1-4ecf-b8f8-5e3b987f89b5',
      userId: '38ff8f21-98a3-4eb3-9d97-454a6aa06939',
      conferenceId: '0dc61eeb-6932-4d09-b04f-9def3915fd4c',
      groupId: 'W-16beeee4',
      calculatedTotalDue: 0.0,
      calculatedPromotionDiscounts: 0,
      calculatedAdditionalDiscounts: 0,
      calculatedMinimumDeposit: 0.0,
      completed: false,
      completedTimestamp: null,
      createdTimestamp: '2018-12-19T23:25:35.643Z',
      lastUpdatedTimestamp: '2018-12-21T10:23:33.837Z',
      pastPayments: [],
      registrants: [
        {
          id: 'c0855056-efc8-4ea7-81aa-4b0902376dba',
          registrationId: '16beeee4-0de1-4ecf-b8f8-5e3b987f89b5',
          userId: '0678ed27-0780-4170-bdcb-1e12a659f49a',
          registrantTypeId: '115f2658-aa1c-4c0a-8d8a-9a8ea3dd7e22',
          calculatedTotalDue: 0.0,
          calculatedEarlyRegistrationDiscounts: 0,
          calculatedPromotionDiscounts: 0,
          createdTimestamp: '2018-12-21T10:23:33.494Z',
          lastUpdatedTimestamp: '2018-12-21T10:23:33.494Z',
          withdrawn: false,
          withdrawnTimestamp: null,
          checkedInTimestamp: null,
          answers: [
            {
              id: '073ec79c-e400-46a7-8609-e3d0609d531a',
              registrantId: 'c0855056-efc8-4ea7-81aa-4b0902376dba',
              blockId: 'f0c0e357-520a-4e30-809b-3320aa1007ca',
              value: 'bartosz.w@toptal.com',
              amount: 0.0,
            },
            {
              id: '7dc6a490-0b47-45b8-a68f-c13bdb650265',
              registrantId: 'c0855056-efc8-4ea7-81aa-4b0902376dba',
              blockId: '965094e3-1dd0-48f2-a0ad-705e7e9f3c06',
              value: { firstName: 'B', lastName: 'W' },
              amount: 0.0,
            },
          ],
          firstName: 'B',
          lastName: 'W',
          email: 'bartosz.w@toptal.com',
          groupId: 'W-16beeee4',
        },
      ],
      expenses: [],
      promotions: [],
      primaryRegistrantId: 'c0855056-efc8-4ea7-81aa-4b0902376dba',
      groupRegistrants: [
        {
          id: 'c0855056-efc8-4ea7-81aa-4b0902376dba',
          registrationId: '16beeee4-0de1-4ecf-b8f8-5e3b987f89b5',
          userId: '0678ed27-0780-4170-bdcb-1e12a659f49a',
          registrantTypeId: '115f2658-aa1c-4c0a-8d8a-9a8ea3dd7e22',
          calculatedTotalDue: 0.0,
          calculatedEarlyRegistrationDiscounts: 0,
          calculatedPromotionDiscounts: 0,
          createdTimestamp: '2018-12-21T10:23:33.494Z',
          lastUpdatedTimestamp: '2018-12-21T10:23:33.494Z',
          withdrawn: false,
          withdrawnTimestamp: null,
          checkedInTimestamp: null,
          answers: [
            {
              id: '7dc6a490-0b47-45b8-a68f-c13bdb650265',
              registrantId: 'c0855056-efc8-4ea7-81aa-4b0902376dba',
              blockId: '965094e3-1dd0-48f2-a0ad-705e7e9f3c06',
              value: { firstName: 'B', lastName: 'W' },
              amount: 0.0,
            },
            {
              id: '073ec79c-e400-46a7-8609-e3d0609d531a',
              registrantId: 'c0855056-efc8-4ea7-81aa-4b0902376dba',
              blockId: 'f0c0e357-520a-4e30-809b-3320aa1007ca',
              value: 'bartosz.w@toptal.com',
              amount: 0.0,
            },
          ],
          firstName: 'B',
          lastName: 'W',
          email: 'bartosz.w@toptal.com',
          groupId: 'W-16beeee4',
        },
      ],
      remainingBalance: 0.0,
      totalPaid: 0.0,
    };

    this.registrationWithLimit = {
      id: '16beeee4-0de1-4ecf-b8f8-5e3b987f89b5',
      userId: '38ff8f21-98a3-4eb3-9d97-454a6aa06939',
      conferenceId: '0dc61eeb-6932-4d09-b04f-9def3915fd4c',
      groupId: 'W-16beeee4',
      calculatedTotalDue: 0.0,
      calculatedPromotionDiscounts: 0,
      calculatedAdditionalDiscounts: 0,
      calculatedMinimumDeposit: 0.0,
      completed: false,
      completedTimestamp: null,
      createdTimestamp: '2018-12-19T23:25:35.643Z',
      lastUpdatedTimestamp: '2018-12-21T17:08:28.856Z',
      pastPayments: [],
      registrants: [
        {
          id: 'e33764af-d3e4-4bee-a11b-73ac72bd6fa3',
          registrationId: '16beeee4-0de1-4ecf-b8f8-5e3b987f89b5',
          userId: '06cd2a0f-d2cc-4e98-a287-72e90a05c217',
          registrantTypeId: '85fcc4dc-9d38-4c7e-a8a5-d48ba6effdd3',
          calculatedTotalDue: 0.0,
          calculatedEarlyRegistrationDiscounts: 0,
          calculatedPromotionDiscounts: 0,
          createdTimestamp: '2018-12-21T17:08:52.975Z',
          lastUpdatedTimestamp: '2018-12-21T17:08:58.594Z',
          withdrawn: false,
          withdrawnTimestamp: null,
          checkedInTimestamp: null,
          answers: [
            {
              id: '27e4dbf1-ff7b-4794-8d12-aab7700a8774',
              registrantId: 'e33764af-d3e4-4bee-a11b-73ac72bd6fa3',
              blockId: 'f0c0e357-520a-4e30-809b-3320aa1007ca',
              value: 'asdfcv@asd',
              amount: 0.0,
            },
            {
              id: 'c4f3ebdc-7276-41f7-8e6a-ad0c0d6decd7',
              registrantId: 'e33764af-d3e4-4bee-a11b-73ac72bd6fa3',
              blockId: '965094e3-1dd0-48f2-a0ad-705e7e9f3c06',
              value: { firstName: 'asxzcvz', lastName: 'zxcvasdv' },
              amount: 0.0,
            },
          ],
          firstName: 'asxzcvz',
          lastName: 'zxcvasdv',
          email: 'asdfcv@asd',
          groupId: 'W-16beeee4',
        },
        {
          id: '4ed0195d-60f4-4e99-8fd0-399e9fcb3350',
          registrationId: '16beeee4-0de1-4ecf-b8f8-5e3b987f89b5',
          userId: '210c1e36-7cda-4834-b8a2-be9b74200230',
          registrantTypeId: 'ec98a7e5-94f2-4ecc-9dd8-964e2910df20',
          calculatedTotalDue: 0.0,
          calculatedEarlyRegistrationDiscounts: 0,
          calculatedPromotionDiscounts: 0,
          createdTimestamp: '2018-12-21T17:08:39.423Z',
          lastUpdatedTimestamp: '2018-12-21T17:08:47.760Z',
          withdrawn: false,
          withdrawnTimestamp: null,
          checkedInTimestamp: null,
          answers: [
            {
              id: '2ddae775-d0a2-442e-bd43-63e5a5451a5e',
              registrantId: '4ed0195d-60f4-4e99-8fd0-399e9fcb3350',
              blockId: '965094e3-1dd0-48f2-a0ad-705e7e9f3c06',
              value: { firstName: 'asf', lastName: 'a' },
              amount: 0.0,
            },
            {
              id: 'cb8b0d5b-e812-4281-8404-ef941d4471ba',
              registrantId: '4ed0195d-60f4-4e99-8fd0-399e9fcb3350',
              blockId: 'f0c0e357-520a-4e30-809b-3320aa1007ca',
              value: 'asf@asdf',
              amount: 0.0,
            },
          ],
          firstName: 'asf',
          lastName: 'a',
          email: 'asf@asdf',
          groupId: 'W-16beeee4',
        },
        {
          id: '7a077aee-ae3e-4b2e-98ad-cd8318728e4c',
          registrationId: '16beeee4-0de1-4ecf-b8f8-5e3b987f89b5',
          userId: '0678ed27-0780-4170-bdcb-1e12a659f49a',
          registrantTypeId: '115f2658-aa1c-4c0a-8d8a-9a8ea3dd7e22',
          calculatedTotalDue: 0.0,
          calculatedEarlyRegistrationDiscounts: 0,
          calculatedPromotionDiscounts: 0,
          createdTimestamp: '2018-12-21T17:08:28.664Z',
          lastUpdatedTimestamp: '2018-12-21T17:08:28.664Z',
          withdrawn: false,
          withdrawnTimestamp: null,
          checkedInTimestamp: null,
          answers: [
            {
              id: 'da86e20c-4ae3-4ca2-8dea-293dd7b66c0b',
              registrantId: '7a077aee-ae3e-4b2e-98ad-cd8318728e4c',
              blockId: '965094e3-1dd0-48f2-a0ad-705e7e9f3c06',
              value: { firstName: 'B', lastName: 'W' },
              amount: 0.0,
            },
            {
              id: 'cc7f44b2-3bd4-4f44-bbcb-731626aa3ce5',
              registrantId: '7a077aee-ae3e-4b2e-98ad-cd8318728e4c',
              blockId: 'f0c0e357-520a-4e30-809b-3320aa1007ca',
              value: 'bartosz.w@toptal.com',
              amount: 0.0,
            },
          ],
          firstName: 'B',
          lastName: 'W',
          email: 'bartosz.w@toptal.com',
          groupId: 'W-16beeee4',
        },
      ],
      expenses: [],
      promotions: [],
      primaryRegistrantId: '7a077aee-ae3e-4b2e-98ad-cd8318728e4c',
      groupRegistrants: [
        {
          id: 'e33764af-d3e4-4bee-a11b-73ac72bd6fa3',
          registrationId: '16beeee4-0de1-4ecf-b8f8-5e3b987f89b5',
          userId: '06cd2a0f-d2cc-4e98-a287-72e90a05c217',
          registrantTypeId: '85fcc4dc-9d38-4c7e-a8a5-d48ba6effdd3',
          calculatedTotalDue: 0.0,
          calculatedEarlyRegistrationDiscounts: 0,
          calculatedPromotionDiscounts: 0,
          createdTimestamp: '2018-12-21T17:08:52.975Z',
          lastUpdatedTimestamp: '2018-12-21T17:08:58.594Z',
          withdrawn: false,
          withdrawnTimestamp: null,
          checkedInTimestamp: null,
          answers: [
            {
              id: 'c4f3ebdc-7276-41f7-8e6a-ad0c0d6decd7',
              registrantId: 'e33764af-d3e4-4bee-a11b-73ac72bd6fa3',
              blockId: '965094e3-1dd0-48f2-a0ad-705e7e9f3c06',
              value: { firstName: 'asxzcvz', lastName: 'zxcvasdv' },
              amount: 0.0,
            },
            {
              id: '27e4dbf1-ff7b-4794-8d12-aab7700a8774',
              registrantId: 'e33764af-d3e4-4bee-a11b-73ac72bd6fa3',
              blockId: 'f0c0e357-520a-4e30-809b-3320aa1007ca',
              value: 'asdfcv@asd',
              amount: 0.0,
            },
          ],
          firstName: 'asxzcvz',
          lastName: 'zxcvasdv',
          email: 'asdfcv@asd',
          groupId: 'W-16beeee4',
        },
        {
          id: '4ed0195d-60f4-4e99-8fd0-399e9fcb3350',
          registrationId: '16beeee4-0de1-4ecf-b8f8-5e3b987f89b5',
          userId: '210c1e36-7cda-4834-b8a2-be9b74200230',
          registrantTypeId: 'ec98a7e5-94f2-4ecc-9dd8-964e2910df20',
          calculatedTotalDue: 0.0,
          calculatedEarlyRegistrationDiscounts: 0,
          calculatedPromotionDiscounts: 0,
          createdTimestamp: '2018-12-21T17:08:39.423Z',
          lastUpdatedTimestamp: '2018-12-21T17:08:47.760Z',
          withdrawn: false,
          withdrawnTimestamp: null,
          checkedInTimestamp: null,
          answers: [
            {
              id: '2ddae775-d0a2-442e-bd43-63e5a5451a5e',
              registrantId: '4ed0195d-60f4-4e99-8fd0-399e9fcb3350',
              blockId: '965094e3-1dd0-48f2-a0ad-705e7e9f3c06',
              value: { firstName: 'asf', lastName: 'a' },
              amount: 0.0,
            },
            {
              id: 'cb8b0d5b-e812-4281-8404-ef941d4471ba',
              registrantId: '4ed0195d-60f4-4e99-8fd0-399e9fcb3350',
              blockId: 'f0c0e357-520a-4e30-809b-3320aa1007ca',
              value: 'asf@asdf',
              amount: 0.0,
            },
          ],
          firstName: 'asf',
          lastName: 'a',
          email: 'asf@asdf',
          groupId: 'W-16beeee4',
        },
        {
          id: '7a077aee-ae3e-4b2e-98ad-cd8318728e4c',
          registrationId: '16beeee4-0de1-4ecf-b8f8-5e3b987f89b5',
          userId: '0678ed27-0780-4170-bdcb-1e12a659f49a',
          registrantTypeId: '115f2658-aa1c-4c0a-8d8a-9a8ea3dd7e22',
          calculatedTotalDue: 0.0,
          calculatedEarlyRegistrationDiscounts: 0,
          calculatedPromotionDiscounts: 0,
          createdTimestamp: '2018-12-21T17:08:28.664Z',
          lastUpdatedTimestamp: '2018-12-21T17:08:28.664Z',
          withdrawn: false,
          withdrawnTimestamp: null,
          checkedInTimestamp: null,
          answers: [
            {
              id: 'cc7f44b2-3bd4-4f44-bbcb-731626aa3ce5',
              registrantId: '7a077aee-ae3e-4b2e-98ad-cd8318728e4c',
              blockId: 'f0c0e357-520a-4e30-809b-3320aa1007ca',
              value: 'bartosz.w@toptal.com',
              amount: 0.0,
            },
            {
              id: 'da86e20c-4ae3-4ca2-8dea-293dd7b66c0b',
              registrantId: '7a077aee-ae3e-4b2e-98ad-cd8318728e4c',
              blockId: '965094e3-1dd0-48f2-a0ad-705e7e9f3c06',
              value: { firstName: 'B', lastName: 'W' },
              amount: 0.0,
            },
          ],
          firstName: 'B',
          lastName: 'W',
          email: 'bartosz.w@toptal.com',
          groupId: 'W-16beeee4',
        },
      ],
      remainingBalance: 0.0,
      totalPaid: 0.0,
    };

    this.registrationDefault = {
      id: '16beeee4-0de1-4ecf-b8f8-5e3b987f89b5',
      userId: '38ff8f21-98a3-4eb3-9d97-454a6aa06939',
      conferenceId: '0dc61eeb-6932-4d09-b04f-9def3915fd4c',
      groupId: 'W-16beeee4',
      calculatedTotalDue: 0.0,
      calculatedPromotionDiscounts: 0,
      calculatedAdditionalDiscounts: 0,
      calculatedMinimumDeposit: 0.0,
      completed: false,
      completedTimestamp: null,
      createdTimestamp: '2018-12-19T23:25:35.643Z',
      lastUpdatedTimestamp: '2018-12-21T17:26:00.227Z',
      pastPayments: [],
      registrants: [
        {
          id: '4b8a025c-8963-45c6-88b9-00db8d145f57',
          registrationId: '16beeee4-0de1-4ecf-b8f8-5e3b987f89b5',
          userId: '0678ed27-0780-4170-bdcb-1e12a659f49a',
          registrantTypeId: '1728f920-01b8-4dcb-8eb7-2927829d6d87',
          calculatedTotalDue: 0.0,
          calculatedEarlyRegistrationDiscounts: 0,
          calculatedPromotionDiscounts: 0,
          createdTimestamp: '2018-12-21T17:25:45.646Z',
          lastUpdatedTimestamp: '2018-12-21T17:25:45.646Z',
          withdrawn: false,
          withdrawnTimestamp: null,
          checkedInTimestamp: null,
          answers: [
            {
              id: 'b6d73278-b71b-4427-adf5-6eba1dda86d9',
              registrantId: '4b8a025c-8963-45c6-88b9-00db8d145f57',
              blockId: '965094e3-1dd0-48f2-a0ad-705e7e9f3c06',
              value: { firstName: 'B', lastName: 'W' },
              amount: 0.0,
            },
            {
              id: 'cdcf524f-fe82-4639-999e-9145ce9a5a80',
              registrantId: '4b8a025c-8963-45c6-88b9-00db8d145f57',
              blockId: 'f0c0e357-520a-4e30-809b-3320aa1007ca',
              value: 'bartosz.w@toptal.com',
              amount: 0.0,
            },
          ],
          firstName: 'B',
          lastName: 'W',
          email: 'bartosz.w@toptal.com',
          groupId: 'W-16beeee4',
        },
      ],
      expenses: [],
      promotions: [],
      primaryRegistrantId: '4b8a025c-8963-45c6-88b9-00db8d145f57',
      groupRegistrants: [
        {
          id: '4b8a025c-8963-45c6-88b9-00db8d145f57',
          registrationId: '16beeee4-0de1-4ecf-b8f8-5e3b987f89b5',
          userId: '0678ed27-0780-4170-bdcb-1e12a659f49a',
          registrantTypeId: '1728f920-01b8-4dcb-8eb7-2927829d6d87',
          calculatedTotalDue: 0.0,
          calculatedEarlyRegistrationDiscounts: 0,
          calculatedPromotionDiscounts: 0,
          createdTimestamp: '2018-12-21T17:25:45.646Z',
          lastUpdatedTimestamp: '2018-12-21T17:25:45.646Z',
          withdrawn: false,
          withdrawnTimestamp: null,
          checkedInTimestamp: null,
          answers: [
            {
              id: 'b6d73278-b71b-4427-adf5-6eba1dda86d9',
              registrantId: '4b8a025c-8963-45c6-88b9-00db8d145f57',
              blockId: '965094e3-1dd0-48f2-a0ad-705e7e9f3c06',
              value: { firstName: 'B', lastName: 'W' },
              amount: 0.0,
            },
            {
              id: 'cdcf524f-fe82-4639-999e-9145ce9a5a80',
              registrantId: '4b8a025c-8963-45c6-88b9-00db8d145f57',
              blockId: 'f0c0e357-520a-4e30-809b-3320aa1007ca',
              value: 'bartosz.w@toptal.com',
              amount: 0.0,
            },
          ],
          firstName: 'B',
          lastName: 'W',
          email: 'bartosz.w@toptal.com',
          groupId: 'W-16beeee4',
        },
      ],
      remainingBalance: 0.0,
      totalPaid: 0.0,
    };
  });
