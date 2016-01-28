var fs = require('fs');
var Git = require("simple-git");
// override diff
// Git.prototype.diffWithCommit = function (hash, options, then) {
//    var command = ['diff'];
//
//    if (typeof options === 'string') {
//       command[0] += ' ' + options;
//       this._getLog('warn',
//          'Git#diff: supplying options as a single string is now deprecated, switch to an array of strings');
//    }
//    else if (Array.isArray(options)) {
//       command.push.apply(command, options);
//    }
//
//    if (typeof arguments[arguments.length - 1] === 'function') {
//       then = arguments[arguments.length - 1];
//    }
//
//    return this._run(command, function (err, data) {
//       then && then(err, data);
//    });
// };


angular.module('app')
.factory('Publisher',function(){
    return {
        publishing:true,
        publish:function(project){
            var $this = this;
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
            var params = ['--name-only','69b01f1fe404e742befff89d4b318a83ebf1fce6'];
            git.diff(params,function(err, data){
                var arr = data.split("\n");
                arr.pop();
                fn && fn(err, arr);
            });

        },
        clone: function(project){
            var $this = this;
            var git = Git();
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
