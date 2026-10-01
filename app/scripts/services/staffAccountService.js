angular
  .module('confRegistrationWebApp')
  .service(
    'staffAccountService',
    function StaffAccountService($http, gettextCatalog, ProfileCache) {
      this.searchStaff = function (name, registrationId) {
        return $http
          .get('registrations/' + registrationId + '/staffsearch', {
            params: { name },
          })
          .then(function (response) {
            return response.data;
          });
      };

      function searchStaffAccountNumber(email, conferenceId) {
        return $http
          .get('conferences/' + conferenceId + '/staffAccountNumber', {
            params: { email },
          })
          .then(function (response) {
            return response.data;
          });
      }

      // Fill in the logged-in staff member's own account number from their
      // profile. Resolves to the account number, or '' when none is on the
      // profile or the fetch fails.
      this.getProfileStaffAccountNumber = function () {
        // staffAccountNumber is fetched asynchronously after login and may not
        // be in the cached profile yet, so refetch to pick it up.
        ProfileCache.clearCache();
        return ProfileCache.getCache().then(
          function (profile) {
            return profile.staffAccountNumber || '';
          },
          function () {
            return '';
          },
        );
      };

      this.staffAccountNumberLookup = function (email, conferenceId) {
        return searchStaffAccountNumber(email, conferenceId).then(
          function (data) {
            if (data && data.staffAccountNumber) {
              return { accountNumber: data.staffAccountNumber, message: null };
            }
            // 204: no staff member found in the Global Registry
            return {
              accountNumber: '',
              message: gettextCatalog.getString(
                'No staff member was found with that email address.',
              ),
            };
          },
          function (response) {
            return {
              accountNumber: '',
              message:
                response.status === 403
                  ? gettextCatalog.getString(
                      'You do not have admin permission to look up staff accounts for this event.',
                    )
                  : response.status === 404
                  ? gettextCatalog.getString(
                      'Unable to find a staff account number for this staff member.',
                    )
                  : gettextCatalog.getString(
                      'An error occurred while looking up the staff account number.',
                    ),
            };
          },
        );
      };
    },
  );
