function FileDescriber() {
    if(!(this instanceof FileDescriber)) {
       return new FileDescriber();
    };
    this.path = require('path');
    this.fs = require('fs');

    this.createFileDescription = function(filePath) {
        var fileDescription = {};
        var contents = this.fs.readFileSync(filePath).toString();

        fileDescription.filePath = filePath;
        fileDescription.fileName = this.getFileName(filePath);
        fileDescription.className = this.getClassName(filePath);

        fileDescription.isVm = this.isVm(fileDescription.className);
        fileDescription.isWorkflow = this.isWorkflow(fileDescription.className);

        fileDescription.isDao = this.isDao(fileDescription.className);
        fileDescription.isDomain = this.isDomain(fileDescription.fileName, fileDescription.filePath);
        fileDescription.isDto = this.isDto(fileDescription.className);

        fileDescription.constructorInfo = this.getConstructorInfo(fileDescription.className, contents);
        fileDescription.propertyClasses = this.getPropertyClasses(fileDescription.className, contents);

        if(fileDescription.isDao){
            fileDescription.daoInfo = this.getDaoInfo(fileDescription.className, contents);
        };

        //if(fileDescription.isDto)
            console.log("\n");
            console.dir(fileDescription);
        return fileDescription;
    };

    this.getFileName = function(filePath) {
        return this.path.basename(filePath);
    };

    this.getClassName = function(filePath) {
        return this.getFileName(filePath).replace(".java", "");
    };

    this.isVm = function(className) {
        return this.endsWith(className, "Vm");
    };

    this.isDao = function(className) {
        return this.endsWith(className, "Dao");
    };

    this.isWorkflow = function(className) {
        return this.endsWith(className, "Workflow");
    };

    this.isDomain = function(fileName, filePath) {
        return this.endsWith(filePath.replace("/" + fileName, ""), "domain");
    };

    this.isDto = function(className) {
        return this.endsWith(className, "Dto");
    };

    this.endsWith = function(str, suffix) {
        return str && suffix && str.substr(-1*suffix.length) == suffix;
    };

    this.getConstructorInfo = function(className, contents) {
        var lines = contents.split(/\r?\n/);
        var constructorInfo = this.getBasicConstructorInfo(className, contents);
        constructorInfo.parameterClasses = [];
        if(constructorInfo.hasConstructor) {
            for(var i = 0; i < constructorInfo.definitions.length; i++) {
                var c = constructorInfo.definitions[i];
                c = c.substr(c.indexOf("("))
                c = c.replace(")", "");
                var params = c.split(",");
                for(var j = 0; j < params.length; j++) {
                    var split = params[j].split(' ');
                    if(split && split[0]){
                        constructorInfo.parameterClasses.push(split[0]);
                    }
                }
            }
        }
        //console.log(className, "[", constructorInfo, "]");
        return constructorInfo;
    };

    this.getPropertyClasses = function(className, contents) {
        var propertyClasses = [];
        var lines = contents.split(/\r?\n/);
        return propertyClasses;
    };

    this.getDaoInfo = function(className, contents) {
        var daoInfo = {model: {domain: "", dto: ""}};
        var genericDao = "GenericDao<";
        if(contents.indexOf(genericDao) != -1) {
            var str = contents.substr(contents.indexOf(genericDao) + genericDao.length);
            str = str.substring(0, str.indexOf(">"));
            if(str) {
                var classes = str.split(",");
                daoInfo.model.domain = classes[0] ? classes[0].trim() : "";
                daoInfo.model.dto = classes[1] ? classes[1].trim() : "";
            }
        }
        //console.log("\n", className, "\n[", JSON.stringify(daoInfo), "]");
        return daoInfo;
    };

    this.getBasicConstructorInfo = function(className, contents) {
        var lines = contents.split(/\r?\n/);
        var inConstructor = false;
        var constructorInfo = {hasConstructor : false, definitions : []};
        var constructor = "";
        for(var i=0; i<lines.length; i++) {
            if(!inConstructor) {
                if(lines[i].indexOf(className + "(") != -1 && lines[i].indexOf("new") == -1) {
                    inConstructor = true;
                    constructorInfo.hasConstructor = true;
                    constructor = "";
                }
            }
            if(inConstructor) {
                var line = lines[i].trim().replace(/\r?\n/, "");
                if(line.length > 0) {
                    constructor += line;
                }
                if(constructor.split("(").length === constructor.split(")").length) {
                    inConstructor = false;
                    var I = constructor.indexOf(")");
                    constructor = constructor.substring(0, I+1);
                    constructorInfo.definitions.push(constructor);
                }
            }
        }
        return constructorInfo;
    };

}
module.exports = FileDescriber;
