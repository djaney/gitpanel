var fs = require('fs');
var git = require("simple-git")();

angular.module('app')
.factory('Publisher',function(){
    return {
        publishing:true,
        publish:function(project){
            var $this = this;

            var directoryName = this.getProjectFolderName(project);
            this.deleteFolder(directoryName);
            return git.clone(project.git.url,directoryName);
        },
        getProjectFolderName: function(project){
            return './workspace/'+project.name.replace(/[^a-zA-Z0-9]/i,'');
        },
        deleteFolder: function(path) {
            $this = this;
            if( fs.existsSync(path) ) {
                fs.readdirSync(path).forEach(function(file,index){
                    var curPath = path + "/" + file;
                    if(fs.lstatSync(curPath).isDirectory()) { // recurse
                        $this.deleteFolder(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            }
        }
    };
});
