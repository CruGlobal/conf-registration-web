
angular.module('confRegistrationWebApp')
  .directive('questionToolbar', function ($document, $timeout) {
    return {
      restrict: 'A',
      link: function($scope) {
        //Debouncing plugin for jQuery from http://www.paulirish.com/2009/throttled-smartresize-jquery-event-handler/
        (function(jQuery,sr){
          // debouncing function from John Hann
          // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
          var debounce = function (func, threshold, execAsap) {
            var timeout;

            return function debounced () {
              var obj = this, args = arguments;
              function delayed () {
                if (!execAsap) {
                  func.apply(obj, args);
                }
                timeout = null;
              }

              if (timeout) {
                clearTimeout(timeout);
              }else if (execAsap) {
                func.apply(obj, args);
              }
              timeout = $timeout(delayed, threshold || 500);
            };
          };
          // smartresize
          jQuery.fn[sr] = function(fn){  return fn ? this.on('resize', debounce(fn)) : this.trigger(sr); };

        })(angular.element,'smartresize');

        //keep placeholder the same size when the toolbar is affixed
        function setQuestionToolbarSize(){
          var placeholder = angular.element('.questions-toolbar-placeholder');
          if(placeholder.length){
            angular.element('.questions-toolbar').data('bs.affix').options.offset.top = placeholder.offset().top;
            placeholder.css('min-height', function(){
              return angular.element('.questions-toolbar').outerHeight(true);
            });
          }
        }

        $scope.questionsToolbarVisible = true;
        $scope.toggleQuestionsToolbar = function() {
          $scope.questionsToolbarVisible = !$scope.questionsToolbarVisible;
          $timeout(setQuestionToolbarSize, 0);
        };

        angular.element(function () {
          angular.element('.questions-toolbar').affix({
            offset: {
              top: function () {
                return (this.top = angular.element('.questions-toolbar-placeholder').offset().top);
              }
            }
          });
          $timeout(setQuestionToolbarSize, 0);
          angular.element(window).smartresize(function(){
            setQuestionToolbarSize();
          });
        });

        $scope.questions = [
          {
            'id': 'paragraphContent',
            'defaultTitle': 'Information',
            'iconClass': 'fa-info-circle',
            'name': 'Information'
          },
          {
            'id': 'textQuestion',
            'defaultTitle': 'Question',
            'iconClass': 'fa-pencil-square-o',
            'name': 'Text'
          },
          {
            'id': 'textareaQuestion',
            'defaultTitle': 'Question',
            'iconClass': 'fa-text-height',
            'name': 'Multi Line Text'
          },
          {
            'id': 'radioQuestion',
            'defaultTitle': 'Multiple Choice Question',
            'iconClass': 'fa-list',
            'name': 'Multiple Choice',
            'tooltip': 'Choose one'
          },
          {
            'id': 'checkboxQuestion',
            'defaultTitle': 'Checkbox Question',
            'iconClass': 'fa-check-square-o',
            'name': 'Checkbox',
            'tooltip': 'Choose one or more'
          },
          {
            'id': 'selectQuestion',
            'defaultTitle': 'Dropdown Question',
            'iconClass': 'fa-chevron-down',
            'name': 'Dropdown'
          },
          {
            'id': 'numberQuestion',
            'defaultTitle': 'Number',
            'iconClass': 'fa-superscript',
            'name': 'Number'
          },
          {
            'id': 'dateQuestion',
            'defaultTitle': 'Date',
            'iconClass': 'fa-calendar',
            'name': 'Date'
          },
          {
            'id': 'nameQuestion',
            'defaultTitle': 'Name',
            'iconClass': 'fa-user',
            'name': 'Name'
          },
          {
            'id': 'emailQuestion',
            'defaultTitle': 'Email',
            'iconClass': 'fa-envelope-o',
            'name': 'Email'
          },
          {
            'id': 'phoneQuestion',
            'defaultTitle': 'Telephone',
            'defaultProfile': 'PHONE',
            'iconClass': 'fa-phone-square',
            'name': 'Telephone'
          },
          {
            'id': 'addressQuestion',
            'defaultTitle': 'Address',
            'defaultProfile': 'ADDRESS',
            'iconClass': 'fa-home',
            'name': 'Address'
          },
          {
            'id': 'genderQuestion',
            'defaultTitle': 'Gender',
            'defaultProfile': 'GENDER',
            'iconClass': 'fa-male',
            'name': 'Gender'
          },
          {
            'id': 'yearInSchoolQuestion',
            'defaultTitle': 'Year in School',
            'defaultProfile': 'YEAR_IN_SCHOOL',
            'iconClass': 'fa-graduation-cap',
            'name': 'Year in School'
          },
          {
            'id': 'birthDateQuestion',
            'defaultTitle': 'Date of Birth',
            'defaultProfile': 'BIRTH_DATE',
            'iconClass': 'fa-calendar',
            'name': 'Date of Birth'
          },
          {
            'id': 'campusQuestion',
            'defaultTitle': 'Campus',
            'defaultProfile': 'CAMPUS',
            'iconClass': 'fa-graduation-cap',
            'name': 'Campus'
          }];
      }
    };
  });
