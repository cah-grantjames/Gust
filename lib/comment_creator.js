function CommentCreator() {
    if(!(this instanceof CommentCreator)) {
       return new CommentCreator();
    };

    this.prefix = "\n* ";

    this.addHeadersFileDescriptions = function(fileDescriptions) {
        for (var i = 0; i < fileDescriptions.length; i++) {
            fileDescriptions[i].header = this.createHeader(fileDescriptions[i]);
        }
        return fileDescriptions;
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
        } else {
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
        header += fileDescription.associatedClasses.join(", ") + "]";
        if(fileDescription.broadcastReceiverInfo.declared.length > 0 || fileDescription.broadcastReceiverInfo.used.length > 0) {
            header += prefix + "Broadcast Receivers:";
            header += this.createBroadcastReceiversCSV(fileDescription.broadcastReceiverInfo.declared, "Declared");
            header += this.createBroadcastReceiversCSV(fileDescription.broadcastReceiverInfo.used, "Used");
        }
        header = "\n/**" + header + "\n*/";

        if(fileDescription.className == "BaseVm" || fileDescription.className == "AccessMedicationVm")
            console.log(header);

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
            brsCSV += brs.join(", ");
        }
        return brsCSV;
    }

}
module.exports = CommentCreator;
