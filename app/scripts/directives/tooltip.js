import tippy from 'tippy.js';

/**
 * @ngdoc directive
 * @name confRegistrationWebApp.directive:tooltip
 * @restrict E
 * @description
 * Accessible tooltip component directive using tippy.js.
 * Displays a question-circle icon with tooltip content on hover/focus.
 * Supports both text content and HTML templates.
 *
 * @example
 * <tooltip content="Simple tooltip text"></tooltip>
 *
 * <tooltip tooltip-template="'path/to/template.html'" tooltip-placement="bottom"></tooltip>
 *
 * <tooltip content="More info" aria-labelledby="field-label"></tooltip>
 */
angular
  .module('confRegistrationWebApp')
  .directive('tooltip', function ($compile, $http, $templateCache) {
    return {
      restrict: 'E',
      transclude: false,
      scope: {
        content: '@',
        tooltipTemplate: '@',
        tooltipPlacement: '@',
        tooltipTrigger: '@',
        ariaLabelledby: '@',
      },
      template:
        '<span class="tooltip-wrapper"><span tabindex="0"><fa-icon icon="question-circle"></fa-icon></span></span>',
      link: function (scope, element, attrs) {
        let tippyInstance;
        const triggerElement =
          element[0].querySelector('.tooltip-wrapper').firstElementChild;

        if (attrs.ariaLabelledby) {
          triggerElement.setAttribute('aria-labelledby', attrs.ariaLabelledby);
        } else {
          triggerElement.setAttribute('aria-label', 'More information');
        }

        triggerElement.setAttribute('role', 'img');

        const createTooltip = (content) => {
          if (tippyInstance) tippyInstance.destroy();

          tippyInstance = tippy(triggerElement, {
            content,
            allowHTML: true,
            interactive: true,
            theme: 'light',
            placement: scope.tooltipPlacement || 'top',
            trigger: scope.tooltipTrigger || 'focus click mouseenter',
            appendTo: 'parent',
            aria: { content: 'describedby' },
          });

          element.data('tippyInstance', tippyInstance);
          scope.tippyInstance = tippyInstance;
          return tippyInstance;
        };

        if (attrs.content) {
          createTooltip(attrs.content);
        }

        // Fetch template content if provided
        if (attrs.tooltipTemplate) {
          attrs.$observe('tooltipTemplate', (url) => {
            if (!url) return;

            const cached = $templateCache.get(url);
            const load = (html) => {
              const compiled = $compile(html)(scope);
              createTooltip(compiled[0]);
            };

            cached
              ? load(cached)
              : $http.get(url).then((res) => load(res.data));
          });
        }

        scope.$on('$destroy', () => tippyInstance?.destroy());
      },
    };
  });
