import { Conference } from 'conference';
import { RegistrationQueryParams, JournalUploadService } from 'injectables';
import { find, uniqBy } from 'lodash';
import { Promotion } from 'promotion';
import { PromotionReport } from 'promotionReport';
import { PromoRegistration } from 'promoRegistration';
import { useMemo, useState } from 'react';
import { RegistrationsData } from 'registrations';
import { useWatch } from './useWatch';

export interface PromoTransaction {
  promotion: Promotion;
  count: number;
}

// This hook provides access to promotion-registrations. The source for the promo registrations can be
// a report by passing in a non-null report. Alternatively, if the report is null, the source will be
// pending registrations found using the provided registration query params.
export const usePromoRegistrationList = ({
  conference,
  initialPendingRegistrations,
  journalUploadService,
  registrationQueryParams,
  report,
}: {
  conference: Conference;
  initialPendingRegistrations: RegistrationsData;
  journalUploadService: JournalUploadService;
  registrationQueryParams: RegistrationQueryParams;
  report: PromotionReport | null;
}): {
  // An array of the promo registrations for the report or the pending registrations list
  promoRegistrations: Array<PromoRegistration>;

  // Holds additional data, depending on the source of the promo registrations
  metadata:
    | {
        source: 'report';
        report: PromotionReport;
      }
    | {
        source: 'pending-registrations';
        meta: RegistrationsData['meta'];

        // An array of the unposted promo transactions for the registrations
        // It tracks how many times each promo code has been applied in the current registration set
        promoTransactions: Array<PromoTransaction>;
      };

  // Reload the pending registrations with fresh data from the server
  refreshPendingRegistrations: () => void;
} => {
  const [pendingRegistrations, setPendingRegistrations] =
    useState<RegistrationsData>(initialPendingRegistrations);

  // Calculate the list of unposted promo registrations from the current page of registrations
  const pendingPromoRegistrations = useMemo(
    () =>
      // pendingRegistrations has one item per registrant, so remove duplicates to get one item per registration
      uniqBy(pendingRegistrations.registrations, 'id')
        .flatMap((registration) =>
          registration.promotions.map((promotion): PromoRegistration => {
            const postedInfo = find(
              pendingRegistrations.meta.promotionRegistrationInfoList,
              {
                promotionId: promotion.id,
                registrationId: registration.id,
              },
            );
            return {
              promotion,
              registration,
              successfullyPosted: Boolean(postedInfo && !postedInfo.error),
              error: postedInfo?.error,
            };
          }),
        )
        .filter((item) => !item.successfullyPosted),
    [pendingRegistrations],
  );

  // Calculate the list of promo registrations from the current report if there is one, or null otherwise
  const reportPromoRegistrations = useMemo(() => {
    if (!report) {
      return [];
    }

    return report.promotionRegistrationInfoList.map(
      ({ promotionId, registrationId, error }): PromoRegistration => {
        const promotion = find(conference.promotions, {
          id: promotionId,
        });
        if (!promotion) {
          throw new Error(`Couldn't find promotion with id ${promotionId}`);
        }

        const registration = find(report.registrationList, {
          id: registrationId,
        });
        if (!registration) {
          throw new Error(
            `Couldn't find registration with id ${registrationId}`,
          );
        }

        return {
          promotion,
          registration,
          successfullyPosted: !error,
          error,
        };
      },
    );
  }, [report]);

  const promoTransactions = useMemo(() => {
    if (!pendingPromoRegistrations) {
      return [];
    }

    const promoTransactions = new Map<string, PromoTransaction>();
    pendingPromoRegistrations.forEach(({ promotion, registration }) => {
      let promoTransactionsEntry = promoTransactions.get(promotion.id);
      if (!promoTransactionsEntry) {
        promoTransactionsEntry = {
          promotion,
          count: 0,
        };
        promoTransactions.set(promotion.id, promoTransactionsEntry);
      }
      promoTransactionsEntry.count += promotion.applyToAllRegistrants
        ? registration.groupRegistrants.length
        : 1;
    });
    return Array.from(promoTransactions.values());
  }, [pendingRegistrations.registrations, pendingPromoRegistrations]);

  const refreshPendingRegistrations = () => {
    journalUploadService
      .getRegistrationData(conference.id, {
        ...registrationQueryParams,
        includePromotions: true,
      })
      .then((pendingRegistrations) => {
        setPendingRegistrations(pendingRegistrations);
      });
  };

  // Reload the registrations whenever the query params or the conference changes
  useWatch(() => {
    // If the promo registrations are sourced from a report, there is no need to refresh the registrations data
    if (!report) {
      refreshPendingRegistrations();
    }
  }, [conference, registrationQueryParams, report]);

  return {
    refreshPendingRegistrations,
    ...(report
      ? {
          promoRegistrations: reportPromoRegistrations,
          metadata: {
            source: 'report',
            report,
          },
        }
      : {
          promoRegistrations: pendingPromoRegistrations,
          metadata: {
            source: 'pending-registrations',
            meta: pendingRegistrations.meta,
            promoTransactions,
          },
        }),
  };
};
