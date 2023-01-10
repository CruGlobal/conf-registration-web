import 'angular-mocks';

describe('readFile directive', () => {
  beforeEach(angular.mock.module('confRegistrationWebApp'));

  const file = new File(['contents'], 'file.txt', {
    type: 'text/plain',
  });

  let $compile, $scope;
  beforeEach(inject((_$compile_, $rootScope) => {
    $compile = _$compile_;

    $scope = $rootScope.$new();
    $scope.file = '';
  }));

  it('handles file uploads', (done) => {
    const element = $compile(
      '<input type="file" ng-model="file" read-file></div>',
    )($scope);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const fileInput = element[0];
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event('change'));

    // Wait for the file reader to finish reading
    // eslint-disable-next-line angular/timeout-service
    setTimeout(() => {
      // "contents" base64 encoded
      expect($scope.file).toBe('data:text/plain;base64,Y29udGVudHM=');

      // Remove the file to test the change event handler when target.files is an empty array
      fileInput.files = new DataTransfer().files;
      fileInput.dispatchEvent(new Event('change'));
      // eslint-disable-next-line angular/timeout-service
      setTimeout(() => {
        expect($scope.file).toBe('');
        done();
      }, 100);
    }, 100);
  });
});
