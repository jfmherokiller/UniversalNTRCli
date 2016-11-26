"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.nextRandom = nextRandom;
exports.pk6Info = pk6Info;
exports.cryptoPoke = cryptoPoke;
exports.puzzlePoke = puzzlePoke;

var _bigint = require("./bigint.js");

var _bigint2 = _interopRequireDefault(_bigint);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ndexarr = require("./ndex.js");
var ek6Size = 232;


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


//-------Ek6<->Pk6 functions----------------------------
function nextRandom(obj) {
    obj.seed = obj.seed.multiply(0x41C64E6D).add(0x00006073).and(0xFFFFFFFF);
    return obj.seed >>> 16;
}

function cryptoPoke(data) {
    writeConsole("Un/Encrypting Data");
    var dataOut = {},
        aux = 0,
        seed = {};
    seed.seed = (0, _bigint2.default)(data[0] + (data[1] << 8) + (data[2] << 16) + data[3] * 0x1000000);
    for (var i = 8; i < ek6Size; i += 2) {
        aux = (data[i] + (data[i + 1] << 8)) ^ nextRandom(seed);
        data[i] = aux & 0xFF;
        data[i + 1] = aux >>> 8;
    }
    return data;
}

function puzzlePoke(data) {
    writeConsole("Un/Shuffling Data");
    return new Promise(function(resolve, reject){
        var dataOut = new Array(ek6Size),
            aux = [],
            mode = document.shuffle,
            order = ((data[0] + (data[1] << 8) + (data[2] << 16) & 0x3E000) >>> 0xD) % 24,
            A = 0,
            B = 1,
            C = 2,
            D = 3,
            aSize = 0x40,
            bSize = 0x39,
            cSize = 0x37,
            dSize = 0x7F,
            specOffset = 0x08,
            blocks = [
        /*   enc   */ /*   dec   */
        /* 00 */[[A, B, C, D], [A, B, C, D]],
        /* 01 */[[A, B, D, C], [A, B, D, C]],
        /* 02 */[[A, C, B, D], [A, C, B, D]],
        /* 03 */[[A, C, D, B], [A, D, B, C]],
        /* 04 */[[A, D, B, C], [A, C, D, B]],
        /* 05 */[[A, D, C, B], [A, D, C, B]],
        /* 06 */[[B, A, C, D], [B, A, C, D]],
        /* 07 */[[B, A, D, C], [B, A, D, C]],
        /* 08 */[[B, C, A, D], [C, A, B, D]],
        /* 09 */[[B, C, D, A], [D, A, B, C]],
        /* 10 */[[B, D, A, C], [C, A, D, B]],
        /* 11 */[[B, D, C, A], [D, A, C, B]],
        /* 12 */[[C, A, B, D], [B, C, A, D]],
        /* 13 */[[C, A, D, B], [B, D, A, C]],
        /* 14 */[[C, B, A, D], [C, B, A, D]],
        /* 15 */[[C, B, D, A], [D, B, A, C]],
        /* 16 */[[C, D, A, B], [C, D, A, B]],
        /* 17 */[[C, D, B, A], [D, C, A, B]],
        /* 18 */[[D, A, B, C], [B, C, D, A]],
        /* 19 */[[D, A, C, B], [B, D, C, A]],
        /* 20 */[[D, B, A, C], [C, B, D, A]],
        /* 21 */[[D, B, C, A], [D, B, C, A]],
        /* 22 */[[D, C, A, B], [C, D, B, A]],
        /* 23 */[[D, C, B, A], [D, C, B, A]]];
        for (var i = 0; i < ek6Size; ++i) {
            aux[i] = data[i];
        }
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 56; ++j) {
                data[j + 56 * i + 8] = aux[j + 56 * blocks[order][mode][i] + 8];
            }
        }
        resolve(data);
    });
}

function pk6Info(data) {
    var dataOut="",
        ivStats = parseInt(data[0x77].toString(16) + data[0x76].toString(16) + data[0x75].toString(16) + data[0x74].toString(16), 16),
        spec = parseInt(data[0x9].toString(16) + data[0x8].toString(16), 16),
        msg = "Deposited " + ndexarr.ndexarr[spec - 1] + "!",
        ivs = {
        "hp": ivStats >> 0 & 0x1F,
        "atk": ivStats >> 5 & 0x1F,
        "def": ivStats >> 10 & 0x1F,
        "spe": ivStats >> 15 & 0x1F,
        "spa": ivStats >> 20 & 0x1F,
        "spd": ivStats >> 25 & 0x1F
    };
    msg += "\nIV List:";
    msg += "\nHP: " + ivs.hp;
    msg += "\nAtk: " + ivs.atk;
    msg += "\nDef: " + ivs.def;
    msg += "\nSpA: " + ivs.spa;
    msg += "\nSpD: " + ivs.spd;
    msg += "\nSpe: " + ivs.spe;
    writeConsole(msg);
    for(var i=0; i<data.length; i++){
        dataOut+=data[i].toString(16).paddingLeft("00");
    }
    var fileBuf = new Buffer.from(dataOut, 'hex');
    fs.writeFile(idSelect("fileLoc").value, fileBuf, function (result, err) {
        if (err) {
            return writeConsole(err);
        } else if(result){
            return writeConsole("Successfully wrote file " + fileName);
        }
    });
    writeConsole("Wrote file!");
}
//-------End of Ek6<->Pk6 functions---------------------