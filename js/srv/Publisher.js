angular.module('app')

.factory('Publisher',function(){
    return {
        publishing:true,
        publish:function(project){
            var $this = this;
            var git = require("nodegit");
            $this.publishing = true;
            return git.Clone(project.git.url, "./workspace")
            .then(function(){
                $this.publishing = false;
            });
        }
    };
});
