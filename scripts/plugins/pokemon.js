var ek6Funcs = require("./scripts/plugins/ek6Funcs.js");
var electron = require('electron');
var dialog = electron.remote.dialog;
var win = electron.remote.getCurrentWindow();

var pid = 0,
    boxOffset = 0x08C9E134,
    orasB1S1 = 0x08C9E134,
    xyB1S1 = 0x08C861C8,
    ek6Size = 232;

//-------Generic Functions (Editing Needed)------------
function errCall(reject) {
    writeConsole("Process Unsuccessful in pokemon.js!  Reason: " + reject);
}

function sucCall(){
    writeConsole("Success!");
}
//-------End of Generic Functions-----------------------


//-------App functions----------------------------------
function idSelect(item) {
    return document.querySelector("#" + item);
}

function writeConsole(val) {
    var console = document.querySelector("#console");
    console.value += val + "\n";
    console.scrollTop = console.scrollHeight;
}
//-------End of App functions---------------------------


//-------Get Ek6----------------------------------------
function getEk6() {
    if(document.client){
        document.shuffle = 1;
        var options = {
              filters: [
                {name: 'Pk6 - Pokemon', extensions: ['pk6']}
              ]
            };
        dialog.showSaveDialog(options, function(result, err){
            if(err){
                writeConsole(err);
            } else if(result){
                idSelect("fileLoc").value = result;
                document.client.listProcesses().then(sucGetCall, errCall);
            }
        });
    } else {
        writeConsole("Please Connect to a 3ds First");
    }
}

function sucGetCall(result) {
    for (var i = 0; i < result.length; i++) {
        if (result[i].name.includes("sango")) {
            pid = result[i].pid;
            boxOffset = orasB1S1;
            writeConsole("Pokemon game PID = " + pid);
        } else if (result[i].name.includes("kujira")) {
            pid = result[i].pid;
            boxOffset = xyB1S1;
            writeConsole("Pokemon game PID = " + pid);
        }
    }
    if (pid != 0) {
        writeConsole("Found Pokemon Game");
        document.client.readMemory(boxOffset, ek6Size, pid).then(sucGetEk6, errCall);
    } else {
        writeConsole("No Pokemon Game detected as running.");
        ntrDisconnect();
        process.exit();
    }
}

function sucGetEk6(result) {
    var data = result.toString('hex').match(/.{2}/g);
    for (var i = 0; i < data.length; i++) {
        data[i] = parseInt(data[i], 16);
    }
    var saveData = data;
    var unShuffEk6 = new Promise(function (resolve, reject) {
        var pk6 = ek6Funcs.cryptoPoke(data);
        resolve(pk6);
    }).then(ek6Funcs.puzzlePoke, errCall).then(ek6Funcs.pk6Info, errCall);
}
//-------End of Get Ek6---------------------------------


//-------Send Pk6---------------------------------------
function sendPoke() {
    if(document.client){
        document.shuffle = 0;
        var options = {
              filters: [
                {name: 'Pk6 - Pokemon', extensions: ['pk6']}
              ]
            };
        dialog.showOpenDialog(options, function(result, err){
            if(err){
                writeConsole(err);
            } else if(result){
                idSelect("fileLoc").value = result;
                document.client.listProcesses().then(sucSendCall, errCall);
            }
        });
    } else {
        writeConsole("Please Connect to a 3ds First");
    }
}

function sucSendCall(result) {
    for (var i = 0; i < result.length; i++) {
        if (result[i].name.includes("sango")) {
            pid = result[i].pid;
            boxOffset = orasB1S1;
            writeConsole("Pokemon game PID = " + pid);
        } else if (result[i].name.includes("kujira")) {
            pid = result[i].pid;
            boxOffset = xyB1S1;
            writeConsole("Pokemon game PID = " + pid);
        }
    }
    if (pid != 0) {
        writeConsole("Found Pokemon Game");
        readEk6File();
    } else {
        writeConsole("No Pokemon Game detected as running.");
        ntrDisconnect();
        process.exit();
    }
}

function readEk6File(data, err) {
    fs.readFile(idSelect("fileLoc").value, function read(err, data) {
        if(err){
            errCall(err);
        }
    var unShuffEk6 = new Promise(function (resolve, reject) {
        var pk6 = ek6Funcs.puzzlePoke(data);
        resolve(pk6);
    }).then(ek6Funcs.cryptoPoke, errCall).then(sendPk6File, errCall);
});
}

function sendPk6File(data) {
    var dataOut="";
    for(var i=0; i<data.length; i++){
        dataOut+=data[i].toString(16).paddingLeft("00");
    }
    var dataBuf = new Buffer.from(dataOut, 'hex');
    console.log("\n dataBuf = \n"+dataBuf.toString('hex'));
    document.client.writeMemory(boxOffset, pid, dataBuf);
    writeConsole("Wrote Pokemon to Box 1, Slot 1!");
}
//-------End of Send Pk6--------------------------------


//-------Prototype Functions----------------------------
String.prototype.paddingLeft = function (paddingValue) {
    return String(paddingValue + this).slice(-paddingValue.length);
};
//-------End of Prototype Functions---------------------

//-------Plugin Running---------------------------------
//Get Pk6 Button
var getPk6 = document.createElement("a");
getPk6.innerHTML = "Get Pk6";
getPk6.className = "button blue subBtn";
getPk6.addEventListener('click', getEk6);
idSelect("plugins").appendChild(getPk6);

//Create Break Between Buttons
var br = document.createElement("br");
idSelect("plugins").appendChild(br);


//Send Pk6 Button
var sendPk6 = document.createElement("a");
sendPk6.innerHTML = "Send Pk6";
sendPk6.className = "button blue subBtn";
sendPk6.addEventListener('click', sendPoke);
idSelect("plugins").appendChild(sendPk6);

//Resize Window and console, then show new buttons
win.setSize(900, 700);
idSelect("console").style.width = "660px"
idSelect("plugins").style.display = "";

//Tell user the plugin has loaded
writeConsole("Loaded Plugin!");
//-------End of Plugin Running--------------------------