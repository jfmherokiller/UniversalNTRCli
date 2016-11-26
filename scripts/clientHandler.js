"use strict";

var seq=0, fs = require('fs');

var NtrClient = require('ntrclient');

var dialog = require('electron').remote.dialog;

//-------Generic Functions (Editing Needed)------------
function errCall(reject) {
    writeConsole("Process Unsuccessful!  Reason: " + reject);
}

function idSelect(item) {
    return document.querySelector("#" + item);
}
//-------End of Generic Functions-----------------------


//-------Connection Functions---------------------------
function toggle3ds() {
    if(idSelect("conNTR").innerHTML=="Connect"){
        if(idSelect("ip").value.isEmpty()){
            writeConsole("Please type in an IP Address");
        } else {
            idSelect("conNTR").disabled = true;
            writeConsole("Attempting to connect to 3ds...");
            document.client = new NtrClient.default(idSelect("ip").value, conCall, ntrDisconnect);
        }
    } else if(idSelect("conNTR").innerHTML=="Disconnect"){
        document.client.disconnect();
    }
};

function conCall() {
    writeConsole("3ds Connected!");
    idSelect("conNTR").innerHTML = "Disconnect";
    idSelect("conNTR").disabled = false;
}

function ntrDisconnect() {
    writeConsole("3ds Disconnected!");
    idSelect("conNTR").innerHTML = "Connect";
    idSelect("conNTR").disabled = false;
}
//-------End of Connection Functions--------------------


//-------NTR Read/Write Functions-----------------------
function sucListCall(result) {
    var option, msg="", pidMenu = idSelect("pidList");
    removeOptions("pidList");
    for(var i=0; i<result.length; i++){
        option = document.createElement("option");
        option.text = result[i].name+" | "+result[i].pid.toString(16);
        option.value = result[i].pid;
        pidMenu.add(option);
        msg+="pid: 0x"+result[i].pid.toString(16).paddingLeft("00000000")+", pname: "+result[i].name+", tid: "+result[i].tid.toString(16).paddingLeft("0000000000000000")+", kpobj: "+result[i].kpobj.toString(16).paddingLeft("00000000")+"\n";
    }
    writeConsole(msg);
    memLayout();
}

function hello(){
    if(document.client){
        writeConsole("Sending Hello!");
        document.client.hello();
    } else {
        writeConsole("Please connect to a console.");
    }
}

function listProcess(){
    if(document.client){
        document.client.listProcesses().then(sucListCall, errCall);
    }
}

function memLayout(){
    if(document.client){
        writeConsole("Updating memory list...");
        var pidList = idSelect("pidList");
        removeOptions("memLoc");
        var pid = pidList.options[pidList.selectedIndex].value;
        document.client.getMemlayout(pid).then(writeMemLocConsole, errCall);
    } else {
        writeConsole("Please connect to a console.");
    }
}

function memSave(){
    if(document.client){
        var file, pidList, curPid, memLoc, memArea, memDump,
            options = {};
        dialog.showSaveDialog(options, function(result, err){
            if(err){
                writeConsole(err);
            } else if(result){
                file = result;
                idSelect("fileLoc").value = file;
                pidList = idSelect("pidList");
                curPid = pidList.options[pidList.selectedIndex].value;
                memLoc = idSelect("memLoc");
                if(!curPid.isEmpty()){
                    memArea = memLoc.options[memLoc.selectedIndex].value.split(";");
                    fs.closeSync(fs.openSync(idSelect("fileLoc").value, 'w'));
                    memArea[0]=parseInt(memArea[0], 16);
                    memArea[2]=parseInt(memArea[2], 16);
                    seq=Math.floor(memArea[2]/0x1000);
                    if((memArea[2]%0x1000)!=0){
                        seq++;
                    }
                    writeConsole("seq = "+seq);
                    writeConsole("Writing...");
                    while(memArea[2]>0){
                        if(memArea[2]>=0x1000){
                            document.client.readMemory(memArea[0], "0x1000", curPid).then(fileDump, errCall);
                        } else {
                            document.client.readMemory("0x"+memArea[0], memArea[2].toString(16), curPid).then(fileDump, errCall);
                        }
                        memArea[0]=memArea[0]+0x1000;
                        memArea[2]=memArea[2]-0x1000;
                        seq--;
                        if(seq==0){
                            writeConsole("Finished!\n");
                        }
                    }
                } else {
                    writeConsole("Please fill in the required fields.");
                }
            }
        });
    } else {
        writeConsole("Please connect to a console.");
    }
}

function fileDump(data){
    if(idSelect("fileLoc").value!=null){
        var fileBuf = new Buffer(data, 'hex');
        fs.appendFile(idSelect("fileLoc").value, fileBuf, function (err) {
            if (err) {
                writeConsole(err);
            }
        });
    } else {
        writeConsole("Please enter a filename for the Memory Dump.");
    }
}

function readAddr(){
    if(!idSelect("readAddrField").value.isEmpty() && !idSelect("readAddrLength").value.isEmpty()){
        var pidList = idSelect("pidList"),
            pid = pidList.options[pidList.selectedIndex].value,
            byteLen = idSelect("readAddrLength").value;
        document.client.readMemory("0x"+idSelect("readAddrField").value, byteLen, pid).then(writeDumpConsole, errCall);
    } else {
        writeConsole("Please fill in the required fields");
    }
}

function writeAddr(){
    if(!idSelect("valueAddrField").value.isEmpty() && !idSelect("writeAddrField").value.isEmpty()){
        var pidList = idSelect("pidList"),
            pid = pidList.options[pidList.selectedIndex].value,
            addr = "0x"+idSelect("writeAddrField").value,
            value = new Buffer.from(idSelect("valueAddrField").value, 'hex');
        document.client.writeMemory(addr, pid, value);
        writeConsole("Wrote value");
    } else {
        writeConsole("Please fill in the required fields");
    }
}
//-------End of NTR Read/Write Functions----------------


//-------Prototype Functions----------------------------
String.prototype.paddingLeft = function (paddingValue) {
    return String(paddingValue + this).slice(-paddingValue.length);
};

String.prototype.isEmpty = function() {
    if(this.length === 0 || !this.trim()){
        return true;
    } else {
        return false;
    }
}
//-------End of Prototype Functions---------------------


//-------GUI functions----------------------------------
function writeConsole(val) {
    var console = document.querySelector("#console");
    console.value += val + "\n";
    console.scrollTop = console.scrollHeight;
}

function writeDumpConsole(val){
    var msg="";
    var data = JSON.parse(JSON.stringify(val));
    for(var i=0; i<data.data.length; i++){
        msg+=data.data[i].toString(16).paddingLeft("00");
    }
    writeConsole(msg);
}

function writeMemLocConsole(val){
    var option, msg="", memMenu=idSelect("memLoc"), console=idSelect("console");
    for(var i = 0; i<val.length; i++){
        msg+=val[i].start.toString(16).paddingLeft("00000000")+" - "+val[i].end.toString(16).paddingLeft("00000000")+", size: "+val[i].size.toString(16).paddingLeft("00000000")+"\n";
        option = document.createElement("option");
        option.text = val[i].start.toString(16)+" -> "+val[i].end.toString(16)+" ["+val[i].size.toString(16)+"]";
        option.value = val[i].start.toString(16)+";"+val[i].end.toString(16)+";"+val[i].size.toString(16);
        memMenu.add(option);
        
    }
    console.value += msg + "\n";
    console.scrollTop = console.scrollHeight;
}

function writeCredits(){
    var msg = "\n";
    msg+="Credits:\n";
    msg+="Cell9 - NTR\n";
    msg+="Cu3PO42 - Node NTR Client Library\n";
    msg+="Imthe666st - UI Inspiration\n";
    msg+="Yoshiog1 - Ek6<->Pk6 Functions for Example Plugin\n";
    msg+="Peterolson - Javascript BigInt Library\n";
    msg+="http://codepen.io/benague/pen/bLBCd - CSS3 Buttons\n";
    msg+="Zaksabeast - The Frontend for this Debugger\n";
    writeConsole(msg);
}

function removeOptions(selectTagId){
    var selectObj = idSelect(selectTagId);
    for(var i = selectObj.options.length - 1 ; i >= 0 ; i--){
        selectObj.remove(i);
    }
}

function pluginAct(){
    var custPlug = document.createElement("script");
    custPlug.src="./scripts/plugins/pokemon.js";
    idSelect("header").appendChild(custPlug);
    idSelect("pluginLoad").style.display = "none";
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#conNTR').addEventListener('click', toggle3ds);
    document.querySelector('#hello').addEventListener('click', hello);
    document.querySelector('#listProc').addEventListener('click', listProcess);
    document.querySelector('#pidList').addEventListener('change', memLayout);
    document.querySelector('#saveMemDump').addEventListener('click', memSave);
    document.querySelector('#readAddrAct').addEventListener('click', readAddr);
    document.querySelector('#writeAddrAct').addEventListener('click', writeAddr);
    document.querySelector('#credits').addEventListener('click', writeCredits);
    document.querySelector('#pluginLoad').addEventListener('click', pluginAct);
});
//-------End of GUI functions---------------------------