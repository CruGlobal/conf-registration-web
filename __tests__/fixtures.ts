import { Conference } from 'conference';
import { Promotion } from 'promotion';
import { PromotionRegistrationInfo } from 'promotionReport';
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
  currency: {
    currencyCode: 'USD',
  },
  promotions: [promotionAll, promotionOne],
  registrantTypes: [
    { id: 'registrant-type-1', name: 'Type 1' },
    { id: 'registrant-type-2', name: 'Type 2' },
    { id: 'registrant-type-3', name: 'Type 3' },
  ],
} as Conference;

export const registrationDoe = {
  id: 'registration-doe',
  promotions: [promotionAll, promotionOne],
  groupRegistrants: [
    { id: 'registrant-john', firstName: 'John', lastName: 'Doe' },
    { id: 'registrant-jane', firstName: 'Jane', lastName: 'Doe' },
  ],
  primaryRegistrantId: 'registrant-john',
} as Registration;

export const registrationBright = {
  id: 'registration-bright',
  promotions: [promotionOne],
  groupRegistrants: [
    { id: 'registrant-bill', firstName: 'Bill', lastName: 'Bright' },
  ],
  primaryRegistrantId: 'registrant-bill',
} as Registration;

export const registrationMouse = {
  id: 'registration-mouse',
  promotions: [promotionAll, promotionOne],
  groupRegistrants: [
    { id: 'registrant-mickey', firstName: 'Mickey', lastName: 'Mouse' },
    { id: 'registrant-minnie', firstName: 'Minnie', lastName: 'Mouse' },
  ],
  primaryRegistrantId: 'registrant-mickey',
} as Registration;

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

export const registrationsData: RegistrationsData = {
  meta: {
    totalRegistrants: 5,
    totalRegistrantsFilter: 5,
    currentPage: 1,
    totalPages: 1,
    accountTransferEvents: [],
    promotionRegistrationInfoList,
  },
  registrations: [registrationDoe, registrationBright, registrationMouse],
};

export const registrationsDataWithoutErrors: RegistrationsData = {
  meta: {
    totalRegistrants: 5,
    totalRegistrantsFilter: 5,
    currentPage: 1,
    totalPages: 1,
    accountTransferEvents: [],
    promotionRegistrationInfoList: [
      {
        ...promotionRegistrationInfoList[0],
        error: '',
      },
      ...promotionRegistrationInfoList,
    ],
  },
  registrations: [registrationDoe, registrationBright, registrationMouse],
};
