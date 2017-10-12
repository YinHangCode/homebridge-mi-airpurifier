require('./Base');

const inherits = require('util').inherits;
const miio = require('miio');

var Accessory, PlatformAccessory, Service, Characteristic, UUIDGen;

AirPurifier = function(platform, config) {
    this.init(platform, config);
    
    Accessory = platform.Accessory;
    PlatformAccessory = platform.PlatformAccessory;
    Service = platform.Service;
    Characteristic = platform.Characteristic;
    UUIDGen = platform.UUIDGen;
    
    this.device = new miio.Device({
        address: this.config['ip'],
        token: this.config['token']
    });
    
    this.accessories = {};
    if(!this.config['airPurifierDisable'] && this.config['airPurifierName'] && this.config['airPurifierName'] != "" && this.config['silentModeSwitchName'] && this.config['silentModeSwitchName'] != "") {
        this.accessories['airPurifierAccessory'] = new AirPurifierAirPurifierAccessory(this);
    }
    if(!this.config['buzzerSwitchDisable'] && this.config['buzzerSwitchName'] && this.config['buzzerSwitchName'] != "") {
        this.accessories['buzzerSwitchAccessory'] = new AirPurifierBuzzerSwitchAccessory(this);
    }
    if(!this.config['ledBulbDisable'] && this.config['ledBulbName'] && this.config['ledBulbName'] != "") {
        this.accessories['ledBulbAccessory'] = new AirPurifierLEDBulbAccessory(this);
    }
    if(!this.config['airQualityDisable'] && this.config['airQualityName'] && this.config['airQualityName'] != "") {
        this.accessories['airQualityAccessory'] = new AirPurifierAirQualityAccessory(this);
    }
    var accessoriesArr = this.obj2array(this.accessories);
    
    this.platform.log.debug("[MiAirPurifierPlatform][DEBUG]Initializing " + this.config["type"] + " device: " + this.config["ip"] + ", accessories size: " + accessoriesArr.length);
    
    return accessoriesArr;
}
inherits(AirPurifier, Base);

AirPurifierAirPurifierAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['airPurifierName'];
    this.silentModeSwitchDisable = dThis.config['silentModeSwitchDisable'];
    this.silentModeSwitchName = dThis.config['silentModeSwitchName'];
    this.platform = dThis.platform;
}

AirPurifierAirPurifierAccessory.prototype.getServices = function() {
    var that = this;
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "AirPurifier")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);

    var silentModeSwitch = new Service.Switch(this.silentModeSwitchName);
    var silentModeOnCharacteristic = silentModeSwitch.getCharacteristic(Characteristic.On);
    if(!this.silentModeSwitchDisable) {
        services.push(silentModeSwitch);
    }
    
    var airPurifierService = new Service.AirPurifier(this.name);
    var activeCharacteristic = airPurifierService.getCharacteristic(Characteristic.Active);
    var currentAirPurifierStateCharacteristic = airPurifierService.getCharacteristic(Characteristic.CurrentAirPurifierState);
    var targetAirPurifierStateCharacteristic = airPurifierService.getCharacteristic(Characteristic.TargetAirPurifierState);
//  var lockPhysicalControlsCharacteristic = airPurifierService.addCharacteristic(Characteristic.LockPhysicalControls);
    var rotationSpeedCharacteristic = airPurifierService.addCharacteristic(Characteristic.RotationSpeed);
    services.push(airPurifierService);
    
    silentModeOnCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["mode"]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - SilentModeSwitch - getOn: " + result);
                
                if(result[0] === "silent") {
                    callback(null, true);
                } else {
                    callback(null, false);
                }
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - SilentModeSwitch - getOn Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - SilentModeSwitch - setOn: " + value);
            if(value) {
                that.device.call("set_mode", ["silent"]).then(result => {
                    that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - SilentModeSwitch - setOn Result: " + result);
                    if(result[0] === "ok") {
                        targetAirPurifierStateCharacteristic.updateValue(Characteristic.TargetAirPurifierState.AUTO);
                        callback(null);
                        
                        if(Characteristic.Active.INACTIVE == activeCharacteristic.value) {
                            activeCharacteristic.updateValue(Characteristic.Active.ACTIVE);
                            currentAirPurifierStateCharacteristic.updateValue(Characteristic.CurrentAirPurifierState.PURIFYING_AIR);
                        }
                    } else {
                        callback(new Error(result[0]));
                    }
                }).catch(function(err) {
                    that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - SilentModeSwitch - setOn Error: " + err);
                    callback(err);
                });
            } else {
                if(Characteristic.Active.INACTIVE == activeCharacteristic.value) {
                    callback(null);
                } else {
                    var nowModel = that.getModeByRotationSpeed(rotationSpeedCharacteristic.value);
                    that.device.call("set_mode", [Characteristic.TargetAirPurifierState.AUTO == value ? 'auto' : nowModel]).then(result => {
                        that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - SilentModeSwitch - setOn Result: " + result);
                        if(result[0] === "ok") {
                            callback(null);
                        } else {
                            callback(new Error(result[0]));
                        }
                    }).catch(function(err) {
                        that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - SilentModeSwitch - setOn Error: " + err);
                        callback(err);
                    });
                }
            }
        }.bind(this));
    
    activeCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["mode"]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - Active - getActive: " + result);
                
                if(result[0] === "idle") {
                    callback(null, Characteristic.Active.INACTIVE);
                } else {
                    callback(null, Characteristic.Active.ACTIVE);
                }
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - Active - getActive Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - Active - setActive: " + value);
            that.device.call("set_mode", [value ? "auto" : "idle"]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - Active - setActive Result: " + result);
                if(result[0] === "ok") {
                    currentAirPurifierStateCharacteristic.updateValue(Characteristic.CurrentAirPurifierState.IDLE);
                    callback(null);
                    if(value) {
                        currentAirPurifierStateCharacteristic.updateValue(Characteristic.CurrentAirPurifierState.PURIFYING_AIR);
                        that.device.call("get_prop", ["mode"]).then(result => {
                            if(result[0] === "silent") {
                                silentModeOnCharacteristic.updateValue(true);
                            } else {
                                silentModeOnCharacteristic.updateValue(false);
                            }
                        }).catch(function(err) {
                            that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifier2AirPurifierAccessory - Active - setActive Error: " + err);
                            callback(err);
                        });
                    } else {
                        currentAirPurifierStateCharacteristic.updateValue(Characteristic.CurrentAirPurifierState.INACTIVE);
                        silentModeOnCharacteristic.updateValue(false);
                    }
                } else {
                    callback(new Error(result[0]));
                }
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - Active - setActive Error: " + err);
                callback(err);
            });
        }.bind(this));
       
    currentAirPurifierStateCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["mode"]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - CurrentAirPurifierState - getCurrentAirPurifierState: " + result);
                
                if(result[0] === "idle") {
                    callback(null, Characteristic.CurrentAirPurifierState.INACTIVE);
                } else {
                    callback(null, Characteristic.CurrentAirPurifierState.PURIFYING_AIR);
                }
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - CurrentAirPurifierState - getCurrentAirPurifierState Error: " + err);
                callback(err);
            });
        }.bind(this));
/*
    lockPhysicalControlsCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["child_lock"]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - LockPhysicalControls - getLockPhysicalControls: " + result);
                callback(null, result[0] === "on" ? Characteristic.LockPhysicalControls.CONTROL_LOCK_ENABLED : Characteristic.LockPhysicalControls.CONTROL_LOCK_DISABLED);
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - LockPhysicalControls - getLockPhysicalControls Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.device.call("set_child_lock", [value ? "on" : "off"]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - LockPhysicalControls - setLockPhysicalControls Result: " + result);
                if(result[0] === "ok") {
                    callback(null);
                } else {
                    callback(new Error(result[0]));
                }
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - LockPhysicalControls - setLockPhysicalControls Error: " + err);
                callback(err);
            });
        }.bind(this));
*/
    targetAirPurifierStateCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["mode"]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - TargetAirPurifierState - getTargetAirPurifierState: " + result);
                
                if(result[0] === "auto" || result[0] === "silent") {
                    callback(null, Characteristic.TargetAirPurifierState.AUTO);
                } else {
                    callback(null, Characteristic.TargetAirPurifierState.MANUAL);
                }
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - TargetAirPurifierState - getTargetAirPurifierState: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - TargetAirPurifierState - setTargetAirPurifierState: " + value);
            var nowModel = that.getModeByRotationSpeed(rotationSpeedCharacteristic.value);
            that.device.call("set_mode", [Characteristic.TargetAirPurifierState.AUTO == value ? (silentModeOnCharacteristic.value ? "silent" : "auto") : nowModel]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - TargetAirPurifierState - setTargetAirPurifierState Result: " + result);
                if(result[0] === "ok") {
                    callback(null);
                } else {
                    callback(new Error(result[0]));
                }
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - TargetAirPurifierState - setTargetAirPurifierState Error: " + err);
                callback(err);
            });
        }.bind(this));
    
    rotationSpeedCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["mode"]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - RotationSpeed - getRotationSpeed: " + result);
                if(result[0] === "low") {
                    if(rotationSpeedCharacteristic.value > 0 && rotationSpeedCharacteristic.value <= 25) {
                        callback(null, rotationSpeedCharacteristic.value);
                    } else {
                        callback(null, 25);
                    }
                } else if(result[0] === "medium") {
                    if(rotationSpeedCharacteristic.value > 25 && rotationSpeedCharacteristic.value <= 50) {
                        callback(null, rotationSpeedCharacteristic.value);
                    } else {
                        callback(null, 50);
                    }
                } else if(result[0] === "high") {
                    if(rotationSpeedCharacteristic.value > 50 && rotationSpeedCharacteristic.value <= 75) {
                        callback(null, rotationSpeedCharacteristic.value);
                    } else {
                        callback(null, 75);
                    }
                } else if(result[0] === "strong") {
                    if(rotationSpeedCharacteristic.value > 75 && rotationSpeedCharacteristic.value <= 100) {
                        callback(null, rotationSpeedCharacteristic.value);
                    } else {
                        callback(null, 100);
                    }
                } else {
                    callback(null, 0);
                }
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - RotationSpeed - getRotationSpeed Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - RotationSpeed - setRotationSpeed set: " + value);
            if(value == 0) {
                callback(null);
            } else {
                var nowModel = that.getModeByRotationSpeed(rotationSpeedCharacteristic.value);
                var valueModel = that.getModeByRotationSpeed(value);
                if(nowModel != valueModel) {
                    that.device.call("set_mode", valueModel).then(result => {
                        that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - RotationSpeed - setRotationSpeed Result: " + result);
                        if(result[0] === "ok") {
                            callback(null);
                        } else {
                            callback(new Error(result[0]));
                        }
                    }).catch(function(err) {
                        that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - TargetAirPurifierState - getRotationSpeed: " + err);
                        callback(err);
                    })
                } else {
                    callback(null);
                }
            }
        }.bind(this));
/*
    var filterMaintenanceService = new Service.FilterMaintenance(this.name);
    var filterChangeIndicationCharacteristic = filterMaintenanceService.getCharacteristic(Characteristic.FilterChangeIndication);
    var filterLifeLevelCharacteristic = filterMaintenanceService.addCharacteristic(Characteristic.FilterLifeLevel);

    filterChangeIndicationCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["filter1_life"]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - FilterChangeIndication - getFilterChangeIndication: " + result);
                callback(null, result[0] < 5 ? Characteristic.FilterChangeIndication.CHANGE_FILTER : Characteristic.FilterChangeIndication.FILTER_OK);
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - FilterChangeIndication - getFilterChangeIndication Error: " + err);
                callback(err);
            });
        }.bind(this));
    filterLifeLevelCharacteristic
        .on('get', function(callback) {
            that.device.call("get_prop", ["filter1_life"]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirPurifierAccessory - FilterLifeLevel - getFilterLifeLevel: " + result);
                callback(null, result[0]);
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirPurifierAccessory - FilterLifeLevel - getFilterLifeLevel Error: " + err);
                callback(err);
            });
        }.bind(this));
    services.push(filterMaintenanceService);
*/

    return services;
}

AirPurifierAirPurifierAccessory.prototype.getModeByRotationSpeed = function(value) {
    if(value > 0 && value <= 25) {
        mode = 'low';
    } else if(value > 25 && value <= 50) {
        mode = 'medium';
    } else if(value > 50 && value <= 70) {
        mode = 'high';
    } else if(value > 75 && value <= 100) {
        mode = 'strong';
    } else {
        mode = 'low';
    }
}

AirPurifierBuzzerSwitchAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['buzzerSwitchName'];
    this.platform = dThis.platform;
}

AirPurifierBuzzerSwitchAccessory.prototype.getServices = function() {
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "AirPurifier")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);
    
    var switchService = new Service.Switch(this.name);
    switchService
        .getCharacteristic(Characteristic.On)
        .on('get', this.getBuzzerState.bind(this))
        .on('set', this.setBuzzerState.bind(this));
    services.push(switchService);

    return services;
}

AirPurifierBuzzerSwitchAccessory.prototype.getBuzzerState = function(callback) {
    var that = this;
    this.device.call("get_prop", ["buzzer"]).then(result => {
        that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierBuzzerSwitchAccessory - BuzzerSwitch - getBuzzerState: " + result);
        callback(null, result[0] === "on" ? 1 : 0);
    }).catch(function(err) {
        that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierBuzzerSwitchAccessory - BuzzerSwitch - getBuzzerState Error: " + err);
        callback(err);
    });
}

AirPurifierBuzzerSwitchAccessory.prototype.setBuzzerState = function(value, callback) {
    var that = this;
    that.device.call("set_buzzer", [value ? "on" : "off"]).then(result => {
        that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierBuzzerSwitchAccessory - BuzzerSwitch - setBuzzerState Result: " + result);
        if(result[0] === "ok") {
            callback(null);
        } else {
            callback(new Error(result[0]));
        }            
    }).catch(function(err) {
        that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierBuzzerSwitchAccessory - BuzzerSwitch - setBuzzerState Error: " + err);
        callback(err);
    });
}

AirPurifierLEDBulbAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['ledBulbName'];
    this.platform = dThis.platform;
}

AirPurifierLEDBulbAccessory.prototype.getServices = function() {
    var that = this;
    var services = [];

    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "AirPurifier")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);
    
    var switchLEDService = new Service.Lightbulb(this.name);
    var onCharacteristic = switchLEDService.getCharacteristic(Characteristic.On);
    
    onCharacteristic
        .on('get', function(callback) {
            this.device.call("get_prop", ["led"]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierProLEDBulbAccessory - switchLED - getLEDPower: " + result);
                callback(null, result[0] === "on" ? true : false);
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierProLEDBulbAccessory - switchLED - getLEDPower Error: " + err);
                callback(err);
            });
        }.bind(this))
        .on('set', function(value, callback) {
            that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierProLEDBulbAccessory - switchLED - setLEDPower: " + value + ", nowValue: " + onCharacteristic.value);
            this.device.call("set_led", [value ? "on" : "off"]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierProLEDBulbAccessory - switchLED - setLEDPower Result: " + result);
                if(result[0] === "ok") {
                    callback(null);
                } else {
                    callback(new Error(result[0]));
                }
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierProLEDBulbAccessory - switchLED - setLEDPower Error: " + err);
                callback(err);
            });
        }.bind(this));
    services.push(switchLEDService);

    return services;
}

AirPurifierAirQualityAccessory = function(dThis) {
    this.device = dThis.device;
    this.name = dThis.config['airQualityName'];
    this.platform = dThis.platform;
}

AirPurifierAirQualityAccessory.prototype.getServices = function() {
    var that = this;
    var services = [];
    
    var infoService = new Service.AccessoryInformation();
    infoService
        .setCharacteristic(Characteristic.Manufacturer, "XiaoMi")
        .setCharacteristic(Characteristic.Model, "AirPurifier")
        .setCharacteristic(Characteristic.SerialNumber, "Undefined");
    services.push(infoService);
    
    var pmService = new Service.AirQualitySensor(this.name);
    var pm2_5Characteristic = pmService.addCharacteristic(Characteristic.PM2_5Density);
    pmService
        .getCharacteristic(Characteristic.AirQuality)
        .on('get', function(callback) {
            that.device.call("get_prop", ["aqi"]).then(result => {
                that.platform.log.debug("[MiAirPurifierPlatform][DEBUG]AirPurifierAirQualityAccessory - AirQuality - getAirQuality: " + result);
                
                pm2_5Characteristic.updateValue(result[0]);
                
                if(result[0] <= 50) {
                    callback(null, Characteristic.AirQuality.EXCELLENT);
                } else if(result[0] > 50 && result[0] <= 100) {
                    callback(null, Characteristic.AirQuality.GOOD);
                } else if(result[0] > 100 && result[0] <= 200) {
                    callback(null, Characteristic.AirQuality.FAIR);
                } else if(result[0] > 200 && result[0] <= 300) {
                    callback(null, Characteristic.AirQuality.INFERIOR);
                } else if(result[0] > 300) {
                    callback(null, Characteristic.AirQuality.POOR);
                } else {
                    callback(null, Characteristic.AirQuality.UNKNOWN);
                }
            }).catch(function(err) {
                that.platform.log.error("[MiAirPurifierPlatform][ERROR]AirPurifierAirQualityAccessory - AirQuality - getAirQuality Error: " + err);
                callback(err);
            });
        }.bind(this));
    services.push(pmService);

    return services;
}