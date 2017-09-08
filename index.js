require('./Devices/AirPurifier');
require('./Devices/AirPurifier2');
require('./Devices/AirPurifierPro');

var fs = require('fs');
var packageFile = require("./package.json");
var PlatformAccessory, Accessory, Service, Characteristic, UUIDGen;

module.exports = function(homebridge) {
    if(!isConfig(homebridge.user.configPath(), "platforms", "MiAirPurifierPlatform")) {
        return;
    }
    
    PlatformAccessory = homebridge.platformAccessory;
    Accessory = homebridge.hap.Accessory;
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerPlatform('homebridge-mi-airpurifier', 'MiAirPurifierPlatform', MiAirPurifierPlatform, true);
}

function isConfig(configFile, type, name) {
    var config = JSON.parse(fs.readFileSync(configFile));
    if("accessories" === type) {
        var accessories = config.accessories;
        for(var i in accessories) {
            if(accessories[i]['accessory'] === name) {
                return true;
            }
        }
    } else if("platforms" === type) {
        var platforms = config.platforms;
        for(var i in platforms) {
            if(platforms[i]['platform'] === name) {
                return true;
            }
        }
    } else {
    }
    
    return false;
}

function MiAirPurifierPlatform(log, config, api) {
    if(null == config) {
        return;
    }
    
    this.Accessory = Accessory;
    this.PlatformAccessory = PlatformAccessory;
    this.Service = Service;
    this.Characteristic = Characteristic;
    this.UUIDGen = UUIDGen;
    
    this.log = log;
    this.config = config;

    if (api) {
        this.api = api;
    }
    
    this.log.info("[MiAirPurifierPlatform][INFO]*******************************************************************");
    this.log.info("[MiAirPurifierPlatform][INFO]          MiAirPurifierPlatform v%s By YinHang", packageFile.version);
    this.log.info("[MiAirPurifierPlatform][INFO]  GitHub: https://github.com/YinHangCode/homebridge-mi-airpurifier ");
    this.log.info("[MiAirPurifierPlatform][INFO]                                              QQ Group: 107927710  ");
    this.log.info("[MiAirPurifierPlatform][INFO]*******************************************************************");
    this.log.info("[MiAirPurifierPlatform][INFO]start success...");
}

MiAirPurifierPlatform.prototype = {
    accessories: function(callback) {
        var myAccessories = [];

        var deviceCfgs = this.config['deviceCfgs'];
        if(deviceCfgs instanceof Array) {
            for (var i = 0; i < deviceCfgs.length; i++) {
                var deviceCfg = deviceCfgs[i];
                if(null == deviceCfg['type'] || "" == deviceCfg['type']) {
                  continue;
                }
                if(null == deviceCfg['token'] || "" == deviceCfg['token'] || null == deviceCfg['ip'] || "" == deviceCfg['ip']) {
                    continue;
                }
                
                if (deviceCfg['type'] == "AirPurifier") {
                    new AirPurifier(this, deviceCfg).forEach(function(accessory, index, arr){
                        myAccessories.push(accessory);
                    });
                } else if (deviceCfg['type'] == "AirPurifier2") {
                    new AirPurifier2(this, deviceCfg).forEach(function(accessory, index, arr){
                        myAccessories.push(accessory);
                    });
                } else if (deviceCfg['type'] == "AirPurifierPro") {
                    new AirPurifierPro(this, deviceCfg).forEach(function(accessory, index, arr){
                        myAccessories.push(accessory);
                    });
                } else {
                }
            }
            this.log.info("[MiAirPurifierPlatform][INFO]device size: " + deviceCfgs.length + ", accessories size: " + myAccessories.length);
        }
        
        callback(myAccessories);
    }
}