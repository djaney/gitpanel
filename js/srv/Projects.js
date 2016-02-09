// var fs = require('fs');
var path = require('path');

angular.module('app')
.factory('Projects',function(){

    var Projects = {
        projects:[],
        storePath: './data/projects.json',
        load:function(){
            // if(fs.existsSync(this.storePath)){
                // var file = fs.readFileSync(this.storePath, {encoding: 'utf-8'});
                this.projects = angular.fromJson(localStorage.getItem('projects')) || [];
                // this.projects = angular.fromJson(file) || [];
            // }

        },
        all:function(){
            return this.projects;
        },
        save: function(){
            localStorage.setItem('projects',angular.toJson(this.projects));
            // fs.writeFileSync(this.storePath, angular.toJson(this.projects), {encoding: 'utf-8',flag: 'w+'});
        }
    };
    Projects.load();
    return Projects;
});
