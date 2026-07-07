angular
  .module('confRegistrationWebApp')
  .service(
    'staffAccountService',
    function StaffAccountService($http, gettextCatalog) {
      this.searchStaff = function (val, registrationId) {
        return $http
          .get('registrations/' + registrationId + '/staffsearch', {
            params: { name: val },
          })
          .then(function (response) {
            return response.data;
          });
      };

      function searchStaffAccountNumber(val, conferenceId) {
        return $http
          .get('conferences/' + conferenceId + '/staffAccountNumber', {
            params: { email: val },
          })
          .then(function (response) {
            return response.data;
          });
      }

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
