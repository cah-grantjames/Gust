function FileDescriber() {
    if(!(this instanceof FileDescriber)) {
       return new FileDescriber();
    };
    this.path = require('path');
    this.fs = require('fs');

    this.findAndDescribeJavaFiles = function(dir) {
        var fileDescriptions = [];
        var filePaths = new require(__dirname + "/file_finder.js")().fromDir(dir, ".java", []);
        var classes = [];
        for (var i = 0; i < filePaths.length; i++) {
            var fileDescription = this.createFileDescription(filePaths[i]);
            classes.push(fileDescription.className);
            fileDescriptions.push(fileDescription);
        }
        for (var i = 0; i < fileDescriptions.length; i++) {
            fileDescriptions[i].associatedClasses = this.getAssociatedClasses(fileDescriptions[i].filePath, fileDescriptions[i].package, classes);
        }
        for (var i = 0; i < fileDescriptions.length; i++) {
            var fileDescription = fileDescriptions[i];
            if(fileDescription.isDao) {
                var daoInfo = fileDescription.daoInfo;
                if(daoInfo.model.dto && daoInfo.model.domain) {
                    this.associateDomainAndDto(fileDescriptions, fileDescription.className, daoInfo.model.domain, daoInfo.model.dto);
                }
            }
        }

        for (var i = 0; i < fileDescriptions.length; i++) {
            this.findBroadcastReceiverDeclarations(fileDescriptions[i]);
        }
        var allBroadcastReceivers = this.getAllBroadcastReceivers(fileDescriptions);
        for (var i = 0; i < fileDescriptions.length; i++) {
            this.findBroadcastReceiverUsages(allBroadcastReceivers, fileDescriptions[i]);
        }

        return fileDescriptions;
    };

    this.getAllBroadcastReceivers = function(fileDescriptions) {
        var allBroadcastReceivers = [];
        for (var i = 0; i < fileDescriptions.length; i++) {
            var fd = fileDescriptions[i];
            if(fd.isBroadcastReceiver) {
                allBroadcastReceivers.push({package : fd.package, name: fd.className});
            }
            for(j = 0; j < fd.broadcastReceiverInfo.declared.length; j++) {
                allBroadcastReceivers.push(fd.broadcastReceiverInfo.declared[j]);
            }
        }
        return allBroadcastReceivers;
    };

    this.findBroadcastReceiverUsages = function(allBroadcastReceivers, fileDescription) {
        if(!fileDescription.broadcastReceiverInfo) {
            fileDescription.broadcastReceiverInfo = new BroadcastReceiverInfo();
        }
        var contents = this.fs.readFileSync(fileDescription.filePath).toString();
        if(fileDescription.className != "AccessMedicationVm"){
            return;
        }
        for(var x = 0; x < allBroadcastReceivers.length; x++) {
            var broadcastReceiver = allBroadcastReceivers[x];
            if(contents.indexOf(broadcastReceiver.package) != -1) {
                var lines = contents.split(/\r?\n/);
                for(var i = 0; i < lines.length; i++) {
                    if(lines[i].indexOf(broadcastReceiver.name) != -1) {
                        if(!this.getDeclaredBroadcastReceiver(fileDescription, lines[i])) {
                            fileDescription.broadcastReceiverInfo.used.push(broadcastReceiver);
                        }
                    }
                }
            }
        }
    };

    this.findBroadcastReceiverDeclarations = function(fileDescription) {
        if(!fileDescription.broadcastReceiverInfo) {
            fileDescription.broadcastReceiverInfo = new BroadcastReceiverInfo();
        }
        var contents = this.fs.readFileSync(fileDescription.filePath).toString();
        var lines = contents.split(/\r?\n/);
        for(var i = 0; i < lines.length; i++) {
            var l = lines[i];
            var declaredBroadcastReceiver = this.getDeclaredBroadcastReceiver(fileDescription, lines[i]);
            if(declaredBroadcastReceiver) {
                fileDescription.broadcastReceiverInfo.declared.push(declaredBroadcastReceiver);
            }
        }
    };

    this.getDeclaredBroadcastReceiver = function(fileDescription, line) {
        var l = line;
        var declaredBroadcastReceiver = null;
        var finds = {type : {
                index : -1,
                str : " BroadcastReceiver "
            },
            instantiation : {
                index : -1,
                str : " = new BroadcastReceiver() {"
            }
        };
        finds.type.index = l.indexOf(finds.type.str);
        finds.instantiation.index = l.indexOf(finds.instantiation.str);
        if(finds.type.index != -1 && finds.instantiation.index != -1){
            var brname = l.substring(finds.type.index + finds.type.str.length, finds.instantiation.index).trim();
            declaredBroadcastReceiver = {package: fileDescription.package + "." + fileDescription.className, name: brname};
        }
        return declaredBroadcastReceiver;
    };

    this.associateDomainAndDto = function(fileDescriptions, dao, domain, dto) {
        for (var i = 0; i < fileDescriptions.length; i++) {
            if(!fileDescriptions[i].daoAssociations) {
                fileDescriptions[i].daoAssociations = {hasAssociations: false, daos:[], dtos:[], domains:[]};
            }
            if(fileDescriptions[i].className == dao) {
                fileDescriptions[i].daoAssociations.hasAssociations = true;
                fileDescriptions[i].daoAssociations.domains.push(domain);
                fileDescriptions[i].daoAssociations.dtos.push(dto);
            }
            if(fileDescriptions[i].className == domain) {
                fileDescriptions[i].daoAssociations.hasAssociations = true;
                fileDescriptions[i].daoAssociations.daos.push(dao);
                fileDescriptions[i].daoAssociations.dtos.push(dto);
            }
            if(fileDescriptions[i].className == dto) {
                fileDescriptions[i].daoAssociations.hasAssociations = true;
                fileDescriptions[i].daoAssociations.daos.push(dao);
                fileDescriptions[i].daoAssociations.domains.push(domain);
            }
            fileDescriptions[i].daoAssociations.daos = fileDescriptions[i].daoAssociations.daos.getUnique()
            fileDescriptions[i].daoAssociations.dtos = fileDescriptions[i].daoAssociations.dtos.getUnique()
            fileDescriptions[i].daoAssociations.domains = fileDescriptions[i].daoAssociations.domains.getUnique()

//            if(fileDescriptions[i].daoAssociations.hasAssociations) {
//                console.log(fileDescriptions[i].className, fileDescriptions[i].daoAssociations);
//            }
        }
    };

    this.createFileDescription = function(filePath) {
        var fileDescription = {};
        var contents = this.fs.readFileSync(filePath).toString();

        fileDescription.filePath = filePath;
        fileDescription.fileName = this.getFileName(filePath);
        fileDescription.className = this.getClassName(filePath);
        fileDescription.package = this.getPackage(contents);

        fileDescription.isVm = this.isVm(fileDescription.className);
        fileDescription.isWorkflow = this.isWorkflow(fileDescription.className);

        fileDescription.isDao = this.isDao(fileDescription.className);
        fileDescription.isDomain = this.isDomain(fileDescription.fileName, fileDescription.filePath);
        fileDescription.isDto = this.isDto(fileDescription.className);
        fileDescription.isBroadcastReceiver = this.isBroadcastReceiver(contents, fileDescription.className);
        fileDescription.constructorInfo = this.getConstructorInfo(fileDescription.className, contents);

        if(fileDescription.isDao){
            fileDescription.daoInfo = this.getDaoInfo(fileDescription.className, contents);
        };

        return fileDescription;
    };

    this.getPackage = function(contents) {
        var package = null;
        var lines = contents.split(/\r?\n/);
        if(lines[0] && lines[0].indexOf("package") != -1) {
            package = lines[0].replace("package", "").replace(";", "").trim();
        }
        return package;
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

    this.isBroadcastReceiver = function(contents, className) {
        var lines = contents.split(/\r?\n/);
        var isBroadcastReceiver = false;
        for(var i = 0; i < lines.length; i++) {
            if(lines[i].indexOf("public class " + className + " extends BroadcastReceiver") != -1) {
                isBroadcastReceiver = true;
                break;
            }
        }
        return isBroadcastReceiver;
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

    this.getDaoInfo = function(className, contents) {
        var daoInfo = {model: {domain: null, dto: null}};
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
        for(var i = 0; i < lines.length; i++) {
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

    this.getAssociatedClasses = function(filePath, package, allClasses) {
        var associatedClasses = [];
        var contents = this.fs.readFileSync(filePath).toString();
        var lines = contents.split(/\r?\n/);
        var inComment = false;
        for(var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if(line.trim().substr(0, 2) == "/*") {
                inComment = true;
            }
            if(inComment && line.trim().substr(0, 2) == "*/"){
                inComment = false;
            }

            if(!inComment && line.trim().substr(0, 2) != "//") {
                for(var j = 0; j < allClasses.length; j++) {
                    var className = allClasses[j];
                    if(line.indexOf(className) != -1) {
                        associatedClasses.push(package + "." + className);
                    }
                }
            }
        }
        return associatedClasses.getUnique();
    };

    function BroadcastReceiverInfo() {
        this.declared = [];
        this.used =  [];
    };

}
module.exports = FileDescriber;
