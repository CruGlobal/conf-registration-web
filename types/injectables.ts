import {
  IHttpService,
  IPromise,
  IQService,
  IRootScopeService,
  IWindowService,
} from 'angular';

export type $Filter = (filterName: string) => (...args: unknown[]) => string;

export type $Http = IHttpService;

export type $Q = IQService;

export interface $RootScope extends IRootScopeService {
  globalPage: {
    type: 'admin' | 'landing' | 'registration';
    mainClass: string;
    bodyClass: string;
    confId?: string | 0;
    footer: boolean;
  };
  loadingMsg: string;
}

export type $Window = IWindowService;

export interface $Route {
  reload(): void;
}

export interface $UibModal {
  open<Result = unknown>(options: unknown): { result: IPromise<Result> };
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
): IPromise<Result>;
declare function ConfirmModalMessageFunction<Result = unknown>(
  options: ConfirmModalMessageOptions,
): IPromise<Result>;
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
