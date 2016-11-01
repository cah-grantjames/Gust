function FileFinder() {
    if(!(this instanceof FileFinder)) {
       return new FileFinder();
    };
    this.path = require('path');
    this.fs = require('fs');

    this.findAllJavaFiles = function(dir) {
        var fileDescriptions = [];
        var filePaths = this.fromDir(dir, ".java", []);
        var fileDescriber = new require(__dirname + "/file_describer.js")();
        for (var i=0; i<filePaths.length; i++) {
            fileDescriptions.push(fileDescriber.createFileDescription(filePaths[i]));
        }
        return fileDescriptions;
    };

    this.fromDir = function(startPath, filter, foundFiles){
        if (!this.fs.existsSync(startPath)){
            return;
        }

        var files = this.fs.readdirSync(startPath);
        for(var i=0;i<files.length;i++){
            var filePath = this.path.join(startPath,files[i]);
            var stat = this.fs.lstatSync(filePath);
            if (stat.isDirectory()){
                this.fromDir(filePath, filter, foundFiles);
            }
            else if (filePath.indexOf(filter)>=0) {
                foundFiles.push(filePath);
            };
        };
        return foundFiles;
    };

}

module.exports = FileFinder;
