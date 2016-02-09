angular.module('app')
.controller('DashboardController', function($scope, $mdSidenav, $mdDialog, Publisher, Projects, $mdToast) {
    $scope.project = null;
    $scope.editMode = false;
    $scope.projects = Projects.all();
    $scope.deploying = false;
    $scope.deployProgress = 0;
    $scope.deployStatus = '';

    $scope.isProcessing = function(){
        return $scope.deploying && $scope.project;
    }
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
        if(!$scope.project && !$scope.isProcessing()) return;
        var confirm = $mdDialog.confirm()
            .title('Confirm')
            .textContent('Are you sure you want to deploy ' + $scope.project.name + "?")
            .ok('Deploy')
            .cancel('Cancel')
        ;
        $mdDialog.show(confirm)
        .then(function(){
            $scope.deploying = true;

            Publisher.publish($scope.project,function(err){
                if(err){
                    var errorDialog = $mdDialog.alert()
                        .title('Error')
                        .textContent(err.message)
                        .ok('Ok');
                    $mdDialog.show(errorDialog)

                }else{
                    $mdToast.showSimple('Project deployed');
                }
                $scope.$apply(function(){
                    $scope.deploying = false;
                });
            },function(percent, status){
                $scope.deployProgress = percent * 100;
                if(1==percent){
                    $scope.deployStatus = '';
                }else{
                    $scope.deployStatus = status;
                }
                if(!$scope.$$phase) $scope.$apply();
            });



        });
    }

    $scope.save = function(){
        $scope.toggleEditMode();
        Projects.save();
    }
})
;
