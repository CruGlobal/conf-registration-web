angular.module('confRegistrationWebApp').constant('expenseTypesConstants', {
  REGISTRATION: 'Registration',
  MISCELLANEOUS_ITEM: 'Misc. Item',
  CHILDCARE: 'Childcare',
  STAFF_TAXABLE_ITEM: 'Staff Taxable Expense',
});

angular.module('confRegistrationWebApp').constant('ruleTypeConstants', {
  SHOW_QUESTION: 'SHOW_QUESTION',
  FORCE_SELECTION: 'FORCE_SELECTION',
  SHOW_OPTION: 'SHOW_OPTION',
});

angular.module('confRegistrationWebApp').constant('addressConstants', {
  maxLengths: {
    address1: 100,
    address2: 100,
    city: 50,
    state: 50,
    zip: 10,
  },
  patterns: {
    /*
     * One rule for every country: at least one number, and nothing but letters,
     * numbers, spaces and hyphens. Loose enough for '32832', '32832-1234',
     * 'SW1A 1AA', 'K1A 0B1' and '01310-100', while still rejecting a wholly
     * alphabetic value.
     */
    zip: /^(?=.*\d)[A-Za-z0-9][A-Za-z0-9 -]*$/,
    /* At least one letter in some language, which rejects inputs like '12345' and '-----' */
    city: /\p{L}/u,
  },
});
