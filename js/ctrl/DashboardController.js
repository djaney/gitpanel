angular.module('app')
.controller('DashboardController', function($scope, $mdSidenav, $mdDialog) {
    $scope.project = null;
    $scope.editMode = false;
    $scope.projects = [{
        name:'Weapon X',
        description: 'Lorem Ipsum',
        lastDeploy:null
    },{
        name:'Weapon I',
        description: 'Lorem Ipsum',
        lastDeploy:null
    },{
        name:'Weapon IX',
        description: 'Lorem Ipsum',
        lastDeploy:null
    }];
    $scope.selectProject = function(p){
        $scope.project = p;
        $scope.editMode = false;
        $mdSidenav('projects').close();
    };
    $scope.toggleProjects = function() {
        $mdSidenav('projects').toggle();
    };
    $scope.toggleEditMode = function(){
        $scope.editMode = !$scope.editMode;
    };
    $scope.deploy = function(){
        if(!$scope.project) return;
        var confirm = $mdDialog.confirm()
            .title('Confirm')
            .textContent('Are you sure you want to deploy ' + $scope.project.name + "?")
            .ok('Deploy')
            .cancel('Cancel')
        ;
        $mdDialog.show(confirm);
    }
})
;
