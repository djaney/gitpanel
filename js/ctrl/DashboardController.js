angular.module('app')
.controller('DashboardController', function($scope, $mdSidenav, $mdDialog, $electron) {
    $scope.project = null;
    $scope.editMode = false;
    $scope.projects = [];
    $scope.selectProject = function(p){
        $scope.project = p;
        $scope.editMode = false;
        $mdSidenav('projects').close();
    };
    $scope.toggleProjects = function() {
        $mdSidenav('projects').toggle();
    };
    $scope.toggleEditMode = function(){
        if($scope.editMode){
            if($scope.projects.indexOf($scope.project)<0){
                $scope.projects.push($scope.project);
            }
        }
        $scope.editMode = !$scope.editMode;
    };

    $scope.newProject = function(){
        $scope.project = {};
        $scope.editMode = true;
    }

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

    $scope.save = function(){

    }
    console.log($electron);
})
;
