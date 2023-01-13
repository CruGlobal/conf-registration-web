import { Promotion } from 'promotion';

export interface RegistrationBlock {
  id: string;
  pageId: string;
  title: string;
  exportFieldTitle: string | null;
  type: string;
  required: boolean;
  position: number;
  adminOnly: boolean;
  content: {
    default: string;
    ruleoperand: string;
    forceSelections: Record<string, boolean>;
    forceSelectionRuleOperand: string;
  };
  profileType: string;
  tag: null;
  registrantTypes: [];
  rules: [];
  expenseType: null;
  startDateBlockId: null;
  endDateBlockId: null;
}

export interface RegistrationPage {}

export interface Conference {
  id: string;
  name: string;
  description: string | null;
  abbreviation: string | null;
  promotions: Array<Promotion>;
  eventStartTime: string;
  eventEndTime: string;
  registrationStartTime: string;
  registrationEndTime: string;
  eventTimezone: string;
  registrationTimezone: string;
  registrationOpen: boolean;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  contactWebsite: string | null;
  locationName: string | null;
  locationAddress: string | null;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  locationZipCode: string | null;
  relayLogin: boolean;
  facebookLogin: boolean;
  instagramLogin: boolean;
  googleLogin: boolean;
  archived: boolean;
  paymentGatewayType: string;
  paymentGatewayId: string;
  paymentGatewayKey: string | null;
  paymentGatewayOwnerEmail: string | null;
  paymentGatewayKeySaved: boolean;
  registrationCount: number;
  completedRegistrationCount: number;
  customPaymentEmailText: string | null;
  rideshareEnabled: string;
  rideshareEmailContent: string | null;
  allowEditRegistrationAfterComplete: boolean;
  checkPayableTo: string | null;
  checkMailingAddress: string | null;
  checkMailingCity: string | null;
  checkMailingState: string | null;
  checkMailingZip: string | null;
  businessUnit: string | null;
  operatingUnit: string | null;
  department: string | null;
  projectId: string | null;
  accountNumber: string | null;
  glAccount: string | null;
  combineSpouseRegistrations: boolean;
  loggedInUserPermissionLevel: null;
  image: {
    image: string | null;
    includeImageToAllPages: boolean;
    displayType: 'ALIGNED_LEFT' | 'ALIGNED_RIGHT' | 'CENTERED' | null;
  };
  cssUrl: string | null;
  currency: {
    currencyCode: string;
    localeCode: string;
    shortSymbol: string;
    name: string;
  };
  ministry: string;
  strategy: string | null;
  ministryActivity: string | null;
  type: string;
  eform: boolean;
  workProject: boolean;
  virtual: boolean;
  cruEvent: boolean;
}
