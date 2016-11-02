function CommentCreator() {
    if(!(this instanceof CommentCreator)) {
       return new CommentCreator();
    };
    this.fs = require('fs');
    this.TOKEN_START = "//%DOC>%";
    this.TOKEN_END = "//%DOC<%";

    this.prefix = "\n* ";

    this.addHeadersFileDescriptions = function(fileDescriptions) {
        for (var i = 0; i < fileDescriptions.length; i++) {
            fileDescriptions[i].header = this.createHeader(fileDescriptions[i]);
        }
        return fileDescriptions;
    };

    this.writeHeadersToAllFiles = function(fileDescriptions) {
        for (var i = 0; i < fileDescriptions.length; i++) {
            var filePath = fileDescriptions[i].filePath;
            var contents = this.fs.readFileSync(filePath).toString();
            if(contents.indexOf(this.TOKEN_START) == -1) {
                console.log(("Error: token not found in file " + filePath).error);
                console.log("\tFirst add tokens to all files.".error);
                return;
            }
            var lines = contents.split(/\r?\n/);
            var above = "";
            var below = "";

            var isAbove = true;
            var isWithin = false;
            for(var j = 0; j < lines.length; j++) {
                var l = lines[j];
                if(l.indexOf(this.TOKEN_START) != -1) {
                    above += l + "\n";
                    isWithin = true;
                    isAbove = false;
                }
                if(l.indexOf(this.TOKEN_END) != -1) {
                    full += l + "\n";
                    isWithin = false;
                }
                if(!isWithin) {
                    if(isAbove){
                        above += l + "\n";
                    } else {
                        below += l + "\n";
                    }
                }
            }
            var full = above;
            full += "\n"
            full += fileDescriptions[i].header;
            full += "\n"
            full += below;

            this.fs.writeFileSync(filePath, full);
        }
    };

    this.addTokenToAllFiles = function(fileDescriptions) {
        for (var i = 0; i < fileDescriptions.length; i++) {
            var filePath = fileDescriptions[i].filePath;
            var contents = this.fs.readFileSync(filePath).toString();
            if(contents.indexOf(this.TOKEN_START) == -1) {
                var lines = contents.split(/\r?\n/);
                var above = "";
                var below = "";
                var isAbove = true;
                for(var j = 0; j < lines.length; j++) {
                    var l = lines[j];
                    if(l.indexOf("class") != -1 || l.indexOf("@") != -1) {
                        isAbove = false;
                    }
                    if(isAbove) {
                        above += l + "\n";
                    } else {
                        below += l + "\n";
                    }
                }
                var full = above +  "\n" + this.TOKEN_START + "\n" + this.TOKEN_END + "\n" + below;
                this.fs.writeFileSync(filePath, full);
            }
        }
    };

    this.createTitle = function(type, className) {
        return this.prefix + "|| @" + type + "@ \"" + className + "\" ||";
    };

    this.createHeader = function(fileDescription) {
        var header = "";
        var prefix = this.prefix;

        if(fileDescription.isDao) {
            header += this.createTitle("DAO", fileDescription.className);
        } else if(fileDescription.isDto) {
            header += this.createTitle("DTO", fileDescription.className);
        } else if(fileDescription.isDomain) {
             header += this.createTitle("DOMAIN", fileDescription.className);
        } else if(fileDescription.isVm) {
             header += this.createTitle("VM", fileDescription.className);
        } else if(fileDescription.isWorkflow) {
            header += this.createTitle("WORKFLOW", fileDescription.className);
        } else if(fileDescription.isBroadcastReceiver) {
            header += this.createTitle("BROADCAST_RECEIVER", fileDescription.className);
        } else if(fileDescription.isActivity) {
            header += this.createTitle("ACTIVITY", fileDescription.className);
        }else {
            header += this.createTitle("POJO", fileDescription.className);
        }
        header += prefix + "Associations:"
        var associationsPrefix = prefix + "  > ";
        if(fileDescription.daoAssociations) {
            if(fileDescription.daoAssociations.daos.length > 0) {
                header += associationsPrefix + "Daos: " + fileDescription.daoAssociations.daos;
            }
            if(fileDescription.daoAssociations.domains.length > 0) {
                header += associationsPrefix + "Domains: " + fileDescription.daoAssociations.domains;
            }
            if(fileDescription.daoAssociations.dtos.length > 0) {
                header += associationsPrefix + "Dtos: " + fileDescription.daoAssociations.dtos;
            }
        }

        header += associationsPrefix + "Classes: [";
        header += fileDescription.associatedClasses.join(","+this.prefix) + "]";
        if(fileDescription.broadcastReceiverInfo.declared.length > 0 || fileDescription.broadcastReceiverInfo.used.length > 0) {
            header += prefix + "Broadcast Receivers:";
            header += this.createBroadcastReceiversCSV(fileDescription.broadcastReceiverInfo.declared, "Declared");
            header += this.createBroadcastReceiversCSV(fileDescription.broadcastReceiverInfo.used, "Used");
        }
        header = "\n/**" + header + "\n*/";

        //if(fileDescription.className == "BaseVm" || fileDescription.className == "AccessMedicationVm")
//            console.log(header);

        return header;
    };

    this.createBroadcastReceiversCSV = function(brArray, type){
        var brsCSV = "";
        if(brArray.length > 0) {
            brsCSV += this.prefix + " - " + type + ": ";
            var brs = [];
            for(var i = 0; i < brArray.length; i++){
                var br = brArray[i];
                brs.push(br.package + "." + br.name);
            }
            brsCSV += brs.join(","+this.prefix);
        }
        return brsCSV;
    }

}
module.exports = CommentCreator;
