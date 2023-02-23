import { AccountTransfer } from 'accountTransfer';
import { Conference } from 'conference';
import { JournalReport } from 'journalReport';
import { PromoRegistration } from 'promoRegistration';
import { Promotion } from 'promotion';
import { PromotionRegistrationInfo, PromotionReport } from 'promotionReport';
import { Registration } from 'registration';
import { RegistrationsData } from 'registrations';

export const promotionAll = {
  id: 'promotion-all',
  applyToAllRegistrants: true,
  code: '50ALL',
  amount: 50,
} as Promotion;

export const promotionOne = {
  id: 'promotion-one',
  applyToAllRegistrants: false,
  code: '100ONE',
  amount: 100,
} as Promotion;

export const conference = {
  id: 'conference-1',
  contactPersonName: 'Conference Admin',
  contactPersonPhone: '123-456-7890',
  contactPersonEmail: 'conference.admin@cru.org',
  currency: {
    currencyCode: 'USD',
  },
  name: 'Test Conference',
  promotions: [promotionAll, promotionOne],
  registrantTypes: [
    { id: 'registrant-type-1', name: 'Type 1' },
    { id: 'registrant-type-2', name: 'Type 2' },
    { id: 'registrant-type-3', name: 'Type 3' },
  ],
} as Conference;

const makeAccountTransfer = (
  id: number,
  registrationId: string,
  firstName: string,
  lastName: string,
): AccountTransfer => ({
  id: `account-transfer-${id}`,
  registrationId,
  firstName,
  lastName,
  error: '',
  businessUnit: '',
  operatingUnit: '',
  departmentId: '',
  projectId: null,
  glAccount: '10000',
  account: '1234567',
  amount: 100,
  description: 'Transfer',
  expenseType: '',
  paymentId: `payment-${id}`,
  productCode: '',
  reportId: null,
});

export const registrationDoe = {
  id: 'registration-doe',
  accountTransfers: [
    makeAccountTransfer(1, 'registration-doe', 'John', 'Doe'),
    makeAccountTransfer(2, 'registration-doe', 'Jane', 'Doe'),
  ],
  promotions: [promotionAll, promotionOne],
  groupRegistrants: [
    { id: 'registrant-john', firstName: 'John', lastName: 'Doe' },
    { id: 'registrant-jane', firstName: 'Jane', lastName: 'Doe' },
  ],
  primaryRegistrantId: 'registrant-john',
  remainingBalance: 100,
} as Registration;

export const registrationBright = {
  id: 'registration-bright',
  accountTransfers: [
    makeAccountTransfer(3, 'registration-bright', 'Bill', 'Bright'),
  ],
  promotions: [promotionOne],
  groupRegistrants: [
    { id: 'registrant-bill', firstName: 'Bill', lastName: 'Bright' },
  ],
  primaryRegistrantId: 'registrant-bill',
} as Registration;

export const registrationMouse = {
  id: 'registration-mouse',
  accountTransfers: [
    makeAccountTransfer(4, 'registration-mouse', 'Mickey', 'Mouse'),
    makeAccountTransfer(5, 'registration-mouse', 'Minnie', 'Mouse'),
  ],
  promotions: [promotionAll, promotionOne],
  groupRegistrants: [
    { id: 'registrant-mickey', firstName: 'Mickey', lastName: 'Mouse' },
    { id: 'registrant-minnie', firstName: 'Minnie', lastName: 'Mouse' },
  ],
  primaryRegistrantId: 'registrant-mickey',
} as Registration;

export const accountTransfer: AccountTransfer =
  registrationDoe.accountTransfers[0];

export const journalReport: JournalReport = {
  id: 'report-1',
  conferenceId: conference.id,
  accountTransfers: [accountTransfer],
  transactionTimestamp: '2022-01-01 12:00:00',
};

export const promoRegistration: PromoRegistration = {
  promotion: promotionAll,
  registration: registrationDoe,
  successfullyPosted: false,
  error: '',
};

export const promotionRegistrationInfoList: Array<PromotionRegistrationInfo> = [
  {
    id: '1',
    promotionId: promotionOne.id,
    registrationId: registrationBright.id,
    glAccount: '00000',
    productCode: null,
    error: 'Failed to post',
    reportId: 'report-1',
  },
  {
    id: '2',
    promotionId: promotionAll.id,
    registrationId: registrationMouse.id,
    glAccount: '00000',
    productCode: null,
    error: '',
    reportId: 'report-1',
  },
];
export const promotionRegistrationInfoListAllErrors: Array<PromotionRegistrationInfo> =
  [
    [registrationDoe, promotionAll],
    [registrationDoe, promotionOne],
    [registrationBright, promotionOne],
    [registrationMouse, promotionAll],
    [registrationMouse, promotionOne],
  ].map(([registration, promotion], index) => ({
    id: (index + 1).toString(),
    promotionId: promotion.id,
    registrationId: registration.id,
    glAccount: '00000',
    productCode: null,
    error: 'Failed to post',
    reportId: 'report-1',
  }));

const accountTransferEvent = {
  amount: 100,
  businessUnit: 'BUNIT',
  departmentId: 'DEPID',
  description: 'Description',
  expenseType: 'REGISTRATION',
  glAccount: '12345',
  operatingUnit: 'OUNIT',
  productCode: 'Code',
  projectId: 'PROJID',
};

export const registrationsData: RegistrationsData = {
  meta: {
    totalRegistrants: 5,
    totalRegistrantsFilter: 5,
    currentPage: 1,
    totalPages: 1,
    accountTransferEvents: [
      accountTransferEvent,
      {
        ...accountTransferEvent,
        projectId: 'PROJID2',
        expenseType: 'MISCELLANEOUS_ITEM',
      },
    ],
    promotionRegistrationInfoList,
  },
  registrations: [registrationDoe, registrationBright, registrationMouse],
};

export const registrationsDataWithoutErrors: RegistrationsData = {
  ...registrationsData,
  meta: {
    ...registrationsData.meta,
    promotionRegistrationInfoList: [
      {
        ...promotionRegistrationInfoList[0],
        error: '',
      },
      ...promotionRegistrationInfoList,
    ],
  },
};

export const promoReport: PromotionReport = {
  id: 'promo-report-1',
  conferenceId: conference.id,
  transactionTimestamp: '2022-01-01 12:00:00',
  promotionRegistrationInfoList: [
    {
      promotionId: promotionAll.id,
      registrationId: registrationDoe.id,
      error: '',
    },
    {
      promotionId: promotionOne.id,
      registrationId: registrationDoe.id,
      error: 'Error',
    },
  ] as PromotionRegistrationInfo[],
  registrationList: [registrationDoe],
};
