import { Conference } from 'conference';
import { JournalQueryParams, JournalUploadService } from 'injectables';
import { find, partition, reject } from 'lodash';
import { Promotion } from 'promotion';
import { PromotionRegistrationInfo, PromotionReport } from 'promotionReport';
import { useMemo, useState } from 'react';
import { Registration } from 'registration';
import { RegistrationsData } from 'registrations';

export interface PromoRegistration {
  promotion: Promotion;
  registration: Registration;
  successfullyPosted: boolean;
  error: string | undefined;
}

export interface PromoTransaction {
  promotion: Promotion;
  count: number;
}

// This hook provides access to promotion-registrations, categorized by whether they have errors or
// not, from either a report or the registrations in a conference that haven't been submitted yet.
// When creating the hook, `initialRegistrationsData` is passed in, and the promotion-registrations
// are sourced from that registrations data. `loadFromUnposted` can be called to asynchronously
// populate the promotion-registrations with fresh data from the server. `loadFromReport` can also
// be called to synchronously populate the promotion-registrations with data from the provided report.
export const usePromoRegistrationList = ({
  conference,
  journalUploadService,
  initialRegistrationsData,
}: {
  journalUploadService: JournalUploadService;
  conference: Conference;
  initialRegistrationsData: RegistrationsData;
}): {
  // registrations and meta will be null if the transfers source is a report, i.e. if
  // loadReportRegistrations was called more recently than loadConferenceRegistrations
  meta: RegistrationsData['meta'];
  registrations: RegistrationsData['registrations'];

  allPromoRegistrations: Array<PromoRegistration>;
  promoRegistrationsWithoutErrors: Array<PromoRegistration>;
  promoRegistrationsWithErrors: Array<PromoRegistration>;

  // An array of the unposted promo transactions for the registrations
  // It tracks how many times each promo code has been applied in the current registration set
  promoTransactions: Array<PromoTransaction>;

  // Query the server for a batch of registrations and update the promo registration list with all
  // the unposted promo registrations contained in that batch
  loadFromUnposted(
    conferenceId: string,
    queryParameters: JournalQueryParams,
  ): Promise<void>;

  // Update the promo registration list with all the promo registrations contained in a promotion report
  loadFromReport(report: PromotionReport): void;
} => {
  const [registrationsData, setRegistrationsData] = useState<RegistrationsData>(
    initialRegistrationsData,
  );
  const [report, setReport] = useState<PromotionReport | null>(null);

  // Use registrationsData.meta.promotionRegistrationInfoList to determine whether a promotion has posted
  function getPromoRegistrationInfo(
    promotionId: string,
    registrationId: string,
  ): PromotionRegistrationInfo | undefined {
    return find(registrationsData.meta.promotionRegistrationInfoList, {
      promotionId,
      registrationId,
    });
  }

  // Return a list of the unposted promo registrations
  function getPendingPromoRegistrations(): Array<PromoRegistration> {
    return registrationsData.registrations.flatMap((registration) =>
      registration.promotions.map((promotion) => {
        const postedInfo = getPromoRegistrationInfo(
          promotion.id,
          registration.id,
        );
        return {
          promotion,
          registration,
          successfullyPosted: Boolean(postedInfo && !postedInfo.error),
          error: postedInfo?.error,
        };
      }),
    );
  }

  // Get a list of promo registrations from the current report if a report is active, or from the registrations data otherwise
  function getPromoRegistrationList(): Array<PromoRegistration> {
    if (report) {
      return report.promotionRegistrationInfoList.map(
        ({ promotionId, registrationId, error }) => {
          const promotion = find(conference.promotions, {
            id: promotionId,
          });
          if (!promotion) {
            throw new Error(`Couldn't find promotion with id ${promotionId}`);
          }

          const registration = find(initialRegistrationsData.registrations, {
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
    }

    return getPendingPromoRegistrations();
  }

  const allPromoRegistrations = useMemo(
    () =>
      reject(
        getPromoRegistrationList(),
        ({ successfullyPosted }) => !report && successfullyPosted,
      ),
    [registrationsData, report],
  );
  const [promoRegistrationsWithErrors, promoRegistrationsWithoutErrors] =
    useMemo(
      () => partition(allPromoRegistrations, 'error'),
      [allPromoRegistrations],
    );

  const promoTransactions = useMemo(() => {
    if (report) {
      return [];
    }

    const promoTransactions = new Map<string, PromoTransaction>();
    getPendingPromoRegistrations().forEach(
      ({ promotion, registration, successfullyPosted: posted }) => {
        // Ignore posted promotions
        if (posted) {
          return;
        }

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
      },
    );
    return Array.from(promoTransactions.values());
  }, [registrationsData.registrations]);

  const loadConferenceRegistrations = async (
    conferenceId: string,
    queryParameters: JournalQueryParams,
  ) => {
    const registrationsData = await journalUploadService.getRegistrationData(
      conferenceId,
      { ...queryParameters, includePromotions: true },
    );
    setRegistrationsData(registrationsData);
  };

  const loadReportPromoRegistrations = (report: PromotionReport) => {
    setReport(report);
  };

  return {
    allPromoRegistrations,
    promoRegistrationsWithoutErrors,
    promoRegistrationsWithErrors,
    promoTransactions,
    meta: registrationsData.meta,
    registrations: registrationsData.registrations,
    loadFromUnposted: loadConferenceRegistrations,
    loadFromReport: loadReportPromoRegistrations,
  };
};
