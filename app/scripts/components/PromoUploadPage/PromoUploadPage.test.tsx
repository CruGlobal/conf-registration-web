import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cloneDeep } from 'lodash';
import { $Http, $RootScope, $Window, ModalMessage } from 'injectables';
import { Permissions } from 'permissions';
import {
  conference,
  promoReport,
  promotionRegistrationInfoListAllErrors,
  registrationsData,
  registrationsDataWithoutErrors,
} from '../../../../__tests__/fixtures';
import { JournalUploadService } from '../../services/journalUploadService';
import { PromoReportService } from '../../services/promoReportService';
import { PromoUploadPage, PromoUploadPageProps } from './PromoUploadPage';

jest.mock('../../hooks/usePaymentsModal', () => {
  const openModalPromise = Promise.resolve();
  return {
    openModalPromise,
    usePaymentsModal: () => ({
      open: () => openModalPromise,
    }),
  };
});

const openModal = jest.fn();
const scrollTo = jest.fn();

describe('PromoUploadPage component', () => {
  const getRegistrationData = jest
    .fn()
    .mockResolvedValue(registrationsDataWithoutErrors);
  const journalUploadService = {
    getRegistrationData,
  } as unknown as JournalUploadService;

  const submitPromise = Promise.resolve(promoReport);
  const submitPromos = jest.fn().mockReturnValue(submitPromise);
  const loadPromoReportPromise = Promise.resolve(promoReport);
  const loadPromoReport = jest.fn().mockReturnValue(loadPromoReportPromise);
  const loadPromoReportsPromise = Promise.resolve([promoReport]);
  const loadAllPromoReports = jest
    .fn()
    .mockReturnValue(loadPromoReportsPromise);
  const promoReportService = {
    loadPromoReport,
    loadAllPromoReports,
    submitPromos,
  } as unknown as PromoReportService;

  const props: PromoUploadPageProps = {
    $filter: jest.fn().mockReturnValue((str: string) => str),
    $rootScope: {} as $RootScope,
    $http: { get: jest.fn() } as unknown as $Http,
    $window: { scrollTo } as unknown as $Window,
    $uibModal: { open: openModal },
    journalUploadService,
    promoReportService,
    modalMessage: { error: jest.fn() } as unknown as ModalMessage,
    resolve: {
      registrationsData: registrationsDataWithoutErrors,
      conference,
      permissions: {} as Permissions,
    },
  };

  it('scrolls to the top when the page changes', async () => {
    const propsMultiplePages = {
      ...props,
      resolve: {
        ...props.resolve,
        registrationsData: {
          ...props.resolve.registrationsData,
          meta: {
            ...props.resolve.registrationsData.meta,
            totalRegistrantsFilter: 100,
          },
        },
      },
    };
    const { getByRole } = render(<PromoUploadPage {...propsMultiplePages} />);

    await userEvent.click(getByRole('button', { name: '3' }));

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('does not scroll to the top when another filter changes', async () => {
    const { getByRole } = render(<PromoUploadPage {...props} />);

    await userEvent.selectOptions(
      getByRole('combobox', { name: 'Registrant type:' }),
      ['Type 1'],
    );

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('scrolls to the top when the report changes', async () => {
    const { getByRole } = render(<PromoUploadPage {...props} />);

    await act(async () => {
      await loadPromoReportsPromise;
    });

    await userEvent.selectOptions(
      getByRole('combobox', { name: 'Report creation date:' }),
      ['2022-01-01 12:00:00'],
    );

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('shows a placeholder when there are no transactions', async () => {
    const { getByText } = render(
      <PromoUploadPage
        {...props}
        resolve={{
          ...props.resolve,
          registrationsData: {
            ...registrationsDataWithoutErrors,
            registrations: [],
          },
        }}
      />,
    );

    await act(async () => {
      await loadPromoReportsPromise;
    });

    expect(
      getByText('No transactions have been found to match your filter.'),
    ).toBeInTheDocument();
  });

  it('shows a placeholder when there are no transactions on the page', async () => {
    const registrationsData = cloneDeep(registrationsDataWithoutErrors);
    registrationsData.meta.totalPages = 2;
    registrationsData.registrations = [];
    const { getByText } = render(
      <PromoUploadPage
        {...props}
        resolve={{
          ...props.resolve,
          registrationsData: {
            ...registrationsDataWithoutErrors,
            meta: {
              ...registrationsDataWithoutErrors.meta,
              totalPages: 2,
            },
            registrations: [],
          },
        }}
      />,
    );

    await act(async () => {
      await loadPromoReportsPromise;
    });

    expect(
      getByText(
        'No transactions have been found to match your filter on this page.',
      ),
    ).toBeInTheDocument();
  });

  it('add all checks all', async () => {
    const { getAllByRole, getByRole } = render(<PromoUploadPage {...props} />);

    await userEvent.click(
      getByRole('button', { name: 'Add All To Promo Report' }),
    );

    expect(getAllByRole('checkbox', { checked: true })).toHaveLength(4);
  });

  it('add all is still visible after adding one', async () => {
    const { getAllByRole, getByRole } = render(<PromoUploadPage {...props} />);

    await userEvent.click(getAllByRole('checkbox')[0]);
    await userEvent.click(
      getByRole('button', { name: 'Add All To Promo Report' }),
    );

    expect(getAllByRole('checkbox', { checked: true })).toHaveLength(4);
  });

  it('remove all unselects all', async () => {
    const { getAllByRole, getByRole } = render(<PromoUploadPage {...props} />);

    await userEvent.click(
      getByRole('button', { name: 'Add All To Promo Report' }),
    );
    await userEvent.click(
      getByRole('button', { name: 'Remove All From Promo Report' }),
    );

    expect(getAllByRole('checkbox', { checked: false })).toHaveLength(4);
  });

  describe('with errors', () => {
    const propsSomeErrors = cloneDeep(props);
    propsSomeErrors.resolve.registrationsData = registrationsData;

    it('hides add all when all have errors', async () => {
      const propsAllErrors = cloneDeep(props);
      propsAllErrors.resolve.registrationsData.meta.promotionRegistrationInfoList =
        promotionRegistrationInfoListAllErrors;

      const { queryByRole } = render(<PromoUploadPage {...propsAllErrors} />);

      await act(async () => {
        await loadPromoReportsPromise;
      });

      expect(
        queryByRole('button', { name: 'Add All To Promo Report' }),
      ).not.toBeInTheDocument();
    });

    it('add all only checks registrations without errors', async () => {
      const { getAllByRole, getByRole } = render(
        <PromoUploadPage {...propsSomeErrors} />,
      );

      await act(async () => {
        await loadPromoReportsPromise;
      });

      await userEvent.click(
        getByRole('button', { name: 'Add All To Promo Report' }),
      );

      expect(getAllByRole('checkbox', { checked: true })).toHaveLength(4);
      expect(getAllByRole('checkbox', { checked: false })).toHaveLength(1);
    });

    it('remove all only unchecks registrations without errors', async () => {
      const { getAllByRole, getByRole } = render(
        <PromoUploadPage {...propsSomeErrors} />,
      );

      await act(async () => {
        await loadPromoReportsPromise;
      });

      expect(getAllByRole('checkbox')).toHaveLength(5);
      for (const checkbox of getAllByRole('checkbox') as HTMLInputElement[]) {
        // Skip checking registrants that were already checked by another registrant in the group being added
        if (!checkbox.checked) {
          await userEvent.click(checkbox);
        }
      }
      await userEvent.click(
        getByRole('button', { name: 'Remove All From Promo Report' }),
      );

      expect(getAllByRole('checkbox', { checked: true })).toHaveLength(1);
      expect(getAllByRole('checkbox', { checked: false })).toHaveLength(4);
    });
  });

  it('handles submit and viewing the report', async () => {
    const { getByRole } = render(<PromoUploadPage {...props} />);

    const openModalPromise = Promise.resolve('promo-report-2');
    openModal.mockImplementation(({ resolve }) => {
      resolve.conference();
      resolve.queryParameters();
      resolve.report();
      return { result: openModalPromise };
    });

    await act(async () => {
      await loadPromoReportsPromise;
    });
    await userEvent.click(
      getByRole('button', { name: 'Add All To Promo Report' }),
    );
    await userEvent.click(getByRole('button', { name: 'Submit Promo Upload' }));
    await act(async () => {
      await submitPromise;
    });

    expect(submitPromos).toHaveBeenCalledTimes(1);
    expect(submitPromos.mock.calls[0][0]).toMatchObject([
      {
        id: 'registration-doe',
        groupRegistrants: [
          { id: 'registrant-john' },
          { id: 'registrant-jane' },
        ],
        promotions: [{ id: 'promotion-all' }, { id: 'promotion-one' }],
      },
      {
        id: 'registration-mouse',
        groupRegistrants: [
          { id: 'registrant-mickey' },
          { id: 'registrant-minnie' },
        ],
        promotions: [{ id: 'promotion-one' }],
      },
    ]);

    expect(loadPromoReport).toHaveBeenCalledWith(
      'conference-1',
      'promo-report-2',
    );
  });

  it('handles submit and not viewing the report', async () => {
    const { getByRole } = render(<PromoUploadPage {...props} />);

    openModal.mockReturnValue({
      result: Promise.resolve(null),
    });

    await userEvent.click(
      getByRole('button', { name: 'Add All To Promo Report' }),
    );
    await userEvent.click(getByRole('button', { name: 'Submit Promo Upload' }));
    await act(async () => {
      await submitPromise;
    });

    expect(getRegistrationData).toHaveBeenCalledTimes(1);
  });

  it('handles submit and timeout', async () => {
    const { getByRole } = render(<PromoUploadPage {...props} />);

    submitPromos.mockResolvedValue(null);

    await userEvent.click(
      getByRole('button', { name: 'Add All To Promo Report' }),
    );
    await userEvent.click(getByRole('button', { name: 'Submit Promo Upload' }));
    await act(async () => {
      await submitPromise;
    });

    expect(openModal).not.toHaveBeenCalled();
  });

  it('payment modal refreshes the registrations on close', async () => {
    // Get the promise from the mock
    const module = await import('../../hooks/usePaymentsModal');
    const openModalPromise = (module as any).openModalPromise;

    const { getAllByRole } = render(<PromoUploadPage {...props} />);

    expect(getRegistrationData).toHaveBeenCalledTimes(0);

    await userEvent.click(
      getAllByRole('button', {
        description: 'View/Edit Payments & Expenses',
      })[0],
    );

    await act(async () => {
      await openModalPromise;
    });

    expect(getRegistrationData).toHaveBeenCalledTimes(1);
  });
});
