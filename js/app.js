angular.module('app',['ngMaterial','ui.router'])

.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/dashboard");

    $stateProvider
        .state('dashboard', {
            url: "/dashboard",
            templateUrl: "templates/dashboard.html"
        })
    ;
})


;
