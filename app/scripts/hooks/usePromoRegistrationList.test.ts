import { renderHook } from '@testing-library/react-hooks';
import { JournalUploadService, RegistrationQueryParams } from 'injectables';
import { PromotionReport } from 'promotionReport';
import {
  conference,
  promotionAll,
  promotionOne,
  registrationBright,
  registrationMouse,
  registrationDoe,
  registrationsData as initialPendingRegistrations,
  registrationsData,
} from '../../../__tests__/fixtures';
import { usePromoRegistrationList } from './usePromoRegistrationList';

const getRegistrationData = jest
  .fn()
  .mockResolvedValue(initialPendingRegistrations);
const journalUploadService = {
  getRegistrationData,
} as unknown as JournalUploadService;

describe('usePromoRegistrationList', () => {
  it('refreshes the transactions', () => {
    const { result } = renderHook(() =>
      usePromoRegistrationList({
        journalUploadService,
        conference,
        initialPendingRegistrations,
        registrationQueryParams: {} as RegistrationQueryParams,
        report: null,
      }),
    );

    expect(getRegistrationData).not.toHaveBeenCalled();
    result.current.refreshPendingRegistrations();

    expect(getRegistrationData).toHaveBeenCalledTimes(1);
  });

  it('updates when the query params or conference change', () => {
    let query = { filter: 'Name' } as RegistrationQueryParams;
    let currentConference = conference;
    const { rerender } = renderHook(() =>
      usePromoRegistrationList({
        journalUploadService,
        conference: currentConference,
        initialPendingRegistrations,
        registrationQueryParams: query,
        report: null,
      }),
    );

    expect(getRegistrationData).not.toHaveBeenCalled();

    query = { ...query, filter: 'Name 2' };
    rerender();

    expect(getRegistrationData).toHaveBeenCalledTimes(1);

    currentConference = { ...conference, id: 'conference-2' };
    rerender();

    expect(getRegistrationData).toHaveBeenCalledTimes(2);
  });

  it('calculates pending promo registrations', () => {
    const { result } = renderHook(() =>
      usePromoRegistrationList({
        journalUploadService,
        conference,
        initialPendingRegistrations,
        registrationQueryParams: {} as RegistrationQueryParams,
        report: null,
      }),
    );

    expect(result.current).toMatchObject({
      promoRegistrations: [
        {
          promotion: promotionAll,
          registration: { id: registrationDoe.id },
          successfullyPosted: false,
          error: undefined,
        },
        {
          promotion: promotionOne,
          registration: { id: registrationDoe.id },
          successfullyPosted: false,
          error: undefined,
        },
        {
          promotion: promotionOne,
          registration: { id: registrationBright.id },
          successfullyPosted: false,
          error: 'Failed to post',
        },
        {
          promotion: promotionOne,
          registration: { id: registrationMouse.id },
          successfullyPosted: false,
          error: undefined,
        },
      ],
      metadata: {
        source: 'pending-registrations',
        meta: initialPendingRegistrations.meta,
        promoTransactions: [
          { promotion: promotionAll, count: 2 },
          { promotion: promotionOne, count: 3 },
        ],
      },
    });
  });

  it('calculates report promo registrations', () => {
    const report = {
      id: 'report-1',
      promotionRegistrationInfoList:
        registrationsData.meta.promotionRegistrationInfoList,
      registrationList: [registrationBright, registrationMouse],
    } as PromotionReport;
    const { result } = renderHook(() =>
      usePromoRegistrationList({
        journalUploadService,
        conference,
        initialPendingRegistrations,
        registrationQueryParams: {} as RegistrationQueryParams,
        report,
      }),
    );

    expect(result.current).toMatchObject({
      promoRegistrations: [
        {
          promotion: promotionOne,
          registration: { id: registrationBright.id },
          successfullyPosted: false,
          error: 'Failed to post',
        },
        {
          promotion: promotionAll,
          registration: { id: registrationMouse.id },
          successfullyPosted: true,
          error: '',
        },
      ],
      metadata: {
        source: 'report',
        report,
      },
    });
  });
});
