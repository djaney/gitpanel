var fs = require('fs');
var Git = require("simple-git");
var walk    = require('walk');


angular.module('app')
.factory('Publisher',function(){
    return {
        publishing:true,
        publish:function(project){
            var $this = this;
            this.clean(project);
            return this.clone(project)
            .then(function(){
                $this.diff(project,function(err, data){
                    console.log('files to upload',data);
                });
            });
        },
        diff: function(project,fn){
            var directoryName = this.getProjectFolderName(project);
            var git = Git(directoryName);
            var params = ['--name-only'];
            var lastHash = null;

            if(lastHash){
                params.push(lastHash);
                git.diff(params,function(err, data){
                    var arr = data.split("\n");
                    arr.pop();
                    for(var i in arr){
                        if( /(\.git|\.gitignore)/.test(arr[i]) ){
                            arr.splice(i,1);
                        }
                    }
                    fn && fn(err, arr);
                });
            }else{
                var files   = [];
                var walker  = walk.walk(directoryName, { followLinks: false });
                walker.on('file', function(root, stat, next) {
                    // Add this file to the list of files
                    if(/(\.git)/.test(root)){
                        next();
                    }else if(/(\.gitignore)/.test(stat.name)){
                        next();
                    }else{
                        var fullname = root + '/' + stat.name;
                        fullname = fullname.slice(directoryName.length+1);
                        files.push(fullname);
                        next();
                    }


                });
                walker.on('end', function() {
                    fn && fn(null, files);
                });
            }


        },
        clean:function(project){
            var directoryName = this.getProjectFolderName(project);
            this.deleteFolder(directoryName);
        },
        clone: function(project){
            var $this = this;
            var git = Git();
            var directoryName = this.getProjectFolderName(project);
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
            var git = Git()
            return git.clone(url, directoryName);
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
