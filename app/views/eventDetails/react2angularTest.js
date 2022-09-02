// // React component creation (ORIGINAL APPROACH BASED OFF REACT2ANGULAR README)
// import { Component } from 'react';
// import { react2angular } from 'react2angular';

// class checkAdmin extends Component {
//     render() {
//         return <div class="row form-group">
//             <div class="col-sm-4">
//                 <label translate>Check Status</label>
//                 <select ng-model="currentPayment.status" class="form-control">
//                 <option value="PENDING" translate>Pending</option>
//                 <option value="RECEIVED" translate>Received</option>
//                 </select>
//             </div>
//             <div class="col-sm-8">
//                 <label translate>Check Number</label>
//                 <input
//                 ng-model="currentPayment.check.checkNumber"
//                 type="text"
//                 class="form-control"
//                 />
//             </div>
//         </div>
//     }
// }

// // react2angular (angular code)

// angular
//   .module('myModule', [])
//   .component('checkAdmin', react2angular(checkAdmin))

import angular from 'angular';
import { react2angular } from 'react2angular';

import checkAdmin from '../components/checkAdmin';

angular
  .module('react.components', [])
  .component('checkAdmin', react2angular(checkAdmin, []));
