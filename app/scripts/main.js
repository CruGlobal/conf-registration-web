import './vendor';

import 'scripts/app.module.js';
import 'scripts/app.js';
import 'scripts/app_enforceAuth.js';

// Controllers
import 'scripts/controllers/angularUiTreeConfig.js';
import 'scripts/controllers/accessEvent.js';
import 'scripts/controllers/activatePermission.js';
import 'scripts/controllers/cloneEvent.js';
import 'scripts/controllers/editRegistrationModal.js';
import 'scripts/controllers/eventDashboard.js';
import 'scripts/controllers/eventDetails.js';
import 'scripts/controllers/eventForm.js';
import 'scripts/controllers/eventOverview.js';
import 'scripts/controllers/eventPermissions.js';
import 'scripts/controllers/eventRegistrations.js';
import 'scripts/controllers/exportData.js';
import 'scripts/controllers/help.js';
import 'scripts/controllers/landing.js';
import 'scripts/controllers/paymentApproval.js';
import 'scripts/controllers/paymentModal.js';
import 'scripts/controllers/registration.js';
import 'scripts/controllers/registrationModal.js';
import 'scripts/controllers/reviewRegistration.js';

// Directives
import 'scripts/directives/adminNav.js';
import 'scripts/directives/autoFocus.js';
import 'scripts/directives/blockEditor.js';
import 'scripts/directives/blockRegistration.js';
import 'scripts/directives/blocks.js';
import 'scripts/directives/datepicker.js';
import 'scripts/directives/questionToolbar.js';
import 'scripts/directives/ngEnter.js';
import 'scripts/directives/page.js';
import 'scripts/directives/payment.js';
import 'scripts/directives/pickadate.js';
import 'scripts/directives/registrationTypeSelect.js';
import 'scripts/directives/selectOnClick.js';
import 'scripts/directives/showAnswer.js';
import 'scripts/directives/showErrors.js';
import 'scripts/directives/stringToNumber.js';
import 'scripts/directives/rule.js';

// Filters
import 'scripts/filters/evtDateFormat.js';
import 'scripts/filters/joiner.js';
import 'scripts/filters/paymentTypeFormat.js';
import 'scripts/filters/phoneFormat.js';
import 'scripts/filters/toTrustedHtml.js';
import 'scripts/filters/unique.js';
import 'scripts/filters/dateRangeFormat.js';
import 'scripts/filters/showQuestionFilter.js';

// Services
import 'scripts/services/authorizationInterceptor.js';
import 'scripts/services/ConfCache.js';
import 'scripts/services/constants.js';
import 'scripts/services/currentRegistrationInterceptor.js';
import 'scripts/services/error.js';
import 'scripts/services/growlService.js';
import 'scripts/services/httpReturnStatusInterceptor.js';
import 'scripts/services/httpUrlInterceptor.js';
import 'scripts/services/loginDialog.js';
import 'scripts/services/modalMessage.js';
import 'scripts/services/payment.js';
import 'scripts/services/PermissionCache.js';
import 'scripts/services/ProfileCache.js';
import 'scripts/services/registration.js';
import 'scripts/services/RegistrationCache.js';
import 'scripts/services/unauthorizedInterceptor.js';
import 'scripts/services/uuid.js';
import 'scripts/services/validateRegistrant.js';

// App styles
import '../styles/style.scss';