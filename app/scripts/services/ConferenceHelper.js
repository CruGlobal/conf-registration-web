'use strict';

angular.module('confRegistrationWebApp')
  .service('ConferenceHelper', function ConferenceHelper(U) {

    this.getRegistrations = function (registrations, onlyCompleted) {
        if(onlyCompleted) {
            return _.filter(registrations, function (item) {
                return item.completed !== false;
            });
        } else{
            return registrations;
        }
    };

    this.getContentByBlockType = function (value, type) {

      if (U.isEmpty(value)) {

        var content = [];

        if (angular.equals(type, 'nameQuestion')) {
          content.push('');
        }
        else if (angular.equals(type, 'addressQuestion')) {
          content.push('');
          content.push('');
          content.push('');
          content.push('');
        }

        content.push('');

        return content;
      }

      return _getContentByBlockType(value, type);
    };

    var _getContentByBlockType = function (value, type) {
      var content = [];

      if (angular.equals(type, 'nameQuestion')) {
        content.push(window.S(U.getValue(value.firstName)).capitalize());
        content.push(window.S(U.getValue(value.lastName)).capitalize());
      }
      else if (angular.equals(type, 'checkboxQuestion')) {
        content.push(U.joiner(U.getValue(U.getKeysWhere(value, true)), ' '));
      }
      else if (angular.equals(type, 'addressQuestion')) {
        content.push(U.getValue(value.address1));
        content.push(U.getValue(value.address2));
        content.push(U.getValue(value.city));
        content.push(U.getValue(value.state));
        content.push(U.getValue(value.zip));
      } else {
        content.push(U.getValue(value));
      }

      return content;
    };

    this.getRegistrantName = function (answers, blocks) {
      var answer = this.findAnswerByBlockType(answers, blocks, 'nameQuestion', 'NAME');

      return this.getContentByBlockType(U.isEmpty(answer) ? answer : answer.value, 'nameQuestion');
    };

    this.findAnswerByBlockType = function (answers, blocks, blockType, profileType) {
      var block = this.findBlockByType(blocks, blockType, profileType);
      if (!U.isEmpty(block)) {
        return this.findAnswerByBlockId(answers, block.id);
      }

      block = this.findBlockByType(blocks, blockType);
      if (!U.isEmpty(block)) {
        return this.findAnswerByBlockId(answers, block.id);
      }

      return null;
    };

    this.findBlockByType = function (blocks, blockType, profileType) {
      return _.find(blocks, function (block) {
        if (!U.isEmpty(profileType)) {
          return block.type === blockType && block.profileType === profileType;
        }

        return block.type === blockType && block.type;
      });
    };

    this.findAnswerByBlockId = function (answers, blockId) {
      return _.find(answers, function (answer) {
        return angular.equals(answer.blockId, blockId);
      });
    };

    this.getPageBlocks = function (pages) {
      var blocks = [];
      angular.forEach(pages, function (page) {
        angular.forEach(page.blocks, function (block) {
          if (block.type.indexOf('Content') === -1) {
            blocks.push(block);
          }
        });
      });

      return blocks;
    };

    this.hasCost = function (conference) {
      return conference.conferenceCost && conference.conferenceCost > 0;
    };
  });
