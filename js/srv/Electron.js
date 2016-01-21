angular.module('app')

.factory('$electron',function(){
    return require('electron').remote;
});
