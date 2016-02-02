var fs = require('fs');
var Git = require("simple-git");
var walk    = require('walk');
var Ftp = require('ftp');

angular.module('app')
.factory('Publisher',function(){
    return {
        publishing:true,
        publish:function(project, done, progress){
            var $this = this;
            this.clean(project);
            progress(0, 'Cloning');
            return this.clone(project)
            .then(function(){
                $this.diff(project,function(err, data){
                    $this.upload(project, data, function(err){
                        done && done(err);
                    },function(percent, status){
                        progress && progress(percent, status);
                    });
                });
            });
        },
        upload:function(project, files, fn, progress){
            var ftp = new Ftp();
            var directoryName = this.getProjectFolderName(project);
            var directoriesCreated = [];
            var uploadedCount = 0;
            var git = Git(directoryName);
            var hashBuffer = null;

            ftp.on('end',function(){
                progress && progress(1, 'Done');
                fn && fn();
            });
            ftp.on('error',function(err){
                fn && fn(err);
            });

            git.log({'max-count': 1},function(err, data){
                var hash = data.latest.hash.slice(1);
                hashBuffer = new Buffer(hash);
                ftp.on('ready', function() {
                    ftp.put(hashBuffer, project.ftp.directory + '/.gitpanel', function(err) {
                        if (err) throw err;
                    });
                    for(var i in files){
                        var fullname = directoryName + '/' + files[i];
                        var remoteName = fullname.slice(directoryName.length+1);
                        if(project.ftp.directory){
                            remoteName = project.ftp.directory + '/' + remoteName;
                        }

                        var tmp = remoteName.split('/');
                        tmp.pop();
                        var newDir = tmp.join('/',tmp);

                        if(directoriesCreated.indexOf(newDir)<0){
                            directoriesCreated.push(newDir);
                            ftp.mkdir(newDir, true, function(){});
                        }

                        ftp.put(fullname, remoteName, function(err) {
                            progress(uploadedCount++/files.length, 'Uploading');
                            if (err) throw err;
                            ftp.end();
                        });


                    }

                });
                var config = {
                    host: project.ftp.host
                };
                if(project.ftp.username){
                    config.user = project.ftp.username;
                }
                if(project.ftp.password){
                    config.password = project.ftp.password;
                }
                ftp.connect(config);
            });




        },
        diff: function(project,fn){
            var directoryName = this.getProjectFolderName(project);
            var git = Git(directoryName);
            var params = ['--name-only'];
            var lastHash = null;


            // READ THE HASH HERE
            // var ftp = new Ftp();
            //
            // ftp.on('ready',function(err){
            //     ftp.get(project.ftp.directory + '/.gitpanel', function(err, stream) {
            //         if(err){
            //             throw err;
            //         }else{
            //             var hash = stream.read();
            //             console.log(hash);
            //         }
            //
            //         ftp.end();
            //     });
            // });
            //
            // var config = {
            //     host: project.ftp.host
            // };
            // if(project.ftp.username){
            //     config.user = project.ftp.username;
            // }
            // if(project.ftp.password){
            //     config.password = project.ftp.password;
            // }
            // ftp.connect(config);



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
