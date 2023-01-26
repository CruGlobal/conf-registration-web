import {
  IHttpService,
  IQService,
  IRootScopeService,
  IWindowService,
} from 'angular';

export type $filter = (filterName: string) => (...args: unknown[]) => string;

export type $http = IHttpService;

export type $q = IQService;

export interface $rootScope extends IRootScopeService {
  globalPage: {
    type: 'admin' | 'landing' | 'registration';
    mainClass: string;
    bodyClass: string;
    confId: string | 0;
    footer: boolean;
  };
  loadingMsg: string;
}

export type $window = IWindowService;

export interface $route {
  reload(): void;
}

export interface $uibModal {
  open<Result = unknown>(options: unknown): { result: Promise<Result> };
}

interface ModalMessageOptions {
  title: string;
  message: string;
  forceAction?: boolean;
  okString?: string;
}

interface ConfirmModalMessageOptions {
  title: string;
  question: string;
  yesString?: string;
  noString?: string;
  normalSize?: boolean;
}

declare function ConfirmModalMessageFunction<Result = unknown>(
  message: string,
): Promise<Result>;
declare function ConfirmModalMessageFunction<Result = unknown>(
  options: ConfirmModalMessageOptions,
): Promise<Result>;
declare function ModalMessageFunction(message: string): void;
declare function ModalMessageFunction(options: ModalMessageOptions): void;

export interface ModalMessage {
  confirm: typeof ConfirmModalMessageFunction;
  info: typeof ModalMessageFunction;
  error: typeof ModalMessageFunction;
}

export interface RegistrationQueryParams {
  page: number;
  limit: number;
  orderBy: string;
  order: string;
  filter: string;
  filterAccountTransferErrors: string;
  filterAccountTransfersByExpenseType: string;
  filterAccountTransfersByPaymentType: string;
  filterPayment: string;
  filterRegType: string;
  includeAccountTransfers: boolean;
  includeCheckedin: string;
  includeWithdrawn: string;
  includeIncomplete: string;
  primaryRegistrantOnly: boolean;
  includePromotions: boolean;
}
