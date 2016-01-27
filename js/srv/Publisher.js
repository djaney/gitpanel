var fs = require('fs');
var git = require("simple-git")();

angular.module('app')
.factory('Publisher',function(){
    return {
        publishing:true,
        publish:function(project){
            return this.clone(project);
        },
        clone: function(project){
            var $this = this;

            var directoryName = this.getProjectFolderName(project);
            this.deleteFolder(directoryName);
            var url;
            if(project.git.url && project.git.username && project.git.password){

                if(/^https:\/\/.+@/.test(project.git.url)){
                    url = project.git.url.replace(/^https:\/\/(.+)@/,'https://$1:' + project.git.password + '@');
                }else{
                    console.log('url',url);
                    url = project.git.url.replace(/^https:\/\//,'https://' + project.git.username + ':' + project.git.password + '@');
                }

            }else{
                url = project.git.url;
            }

            return git.clone(url,directoryName);
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
