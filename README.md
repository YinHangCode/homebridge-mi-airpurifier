# homebridge-mi-airpurifier
[![npm version](https://badge.fury.io/js/homebridge-mi-airpurifier.svg)](https://badge.fury.io/js/homebridge-mi-airpurifier)

XiaoMi air purifier plugins for HomeBridge.   
Thanks for [nfarina](https://github.com/nfarina)(the author of [homebridge](https://github.com/nfarina/homebridge)), [OpenMiHome](https://github.com/OpenMiHome/mihome-binary-protocol), [aholstenson](https://github.com/aholstenson)(the author of [miio](https://github.com/aholstenson/miio)), [licuhui](https://github.com/licuhui), [superszy](https://github.com/superszy), all other developer and testers.   

**Note: I have only a part of these devices, so some devices don't have tested. If you find bugs, please submit them to [issues](https://github.com/YinHangCode/homebridge-mi-airpurifier/issues) or [QQ Group: 107927710](//shang.qq.com/wpa/qunwpa?idkey=8b9566598f40dd68412065ada24184ef72c6bddaa11525ca26c4e1536a8f2a3d).**   

![](https://raw.githubusercontent.com/YinHangCode/homebridge-mi-airpurifier/master/images/MiAirPurifier.jpg)
![](https://raw.githubusercontent.com/YinHangCode/homebridge-mi-airpurifier/master/images/MiAirPurifier2.jpg)
![](https://raw.githubusercontent.com/YinHangCode/homebridge-mi-airpurifier/master/images/MiAirPurifierPro.jpg)
![](https://raw.githubusercontent.com/YinHangCode/homebridge-mi-airpurifier/master/images/MiAirPurifier2S.jpg)

## Supported Devices
1.MiAirPurifier(小米空气净化器)   
2.MiAirPurifier2(小米空气净化器2)   
3.MiAirPurifierPro(小米空气净化器Pro)   
4.MiAirPurifier2S(小米空气净化器2S)   

## Pre-Requirements
1.Make sure your IOS version is ios11 or later.   

## Installation
1. Install HomeBridge, please follow it's [README](https://github.com/nfarina/homebridge/blob/master/README.md).   
If you are using Raspberry Pi, please read [Running-HomeBridge-on-a-Raspberry-Pi](https://github.com/nfarina/homebridge/wiki/Running-HomeBridge-on-a-Raspberry-Pi).   
2. Make sure you can see HomeBridge in your iOS devices, if not, please go back to step 1.   
3. Install packages.   
```
npm install -g miio homebridge-mi-airpurifier
```

## Configuration
```
"platforms": [{
    "platform": "MiAirPurifierPlatform",
    "deviceCfgs": [{
        "type": "MiAirPurifier",
        "ip": "192.168.88.xx",
        "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "airPurifierDisable": false,
        "airPurifierName": "MiAirPurifier",
        "silentModeSwitchDisable": false,
        "silentModeSwitchName": "MiAirPurifier Silent Mode Switch",
        "buzzerSwitchDisable": true,
        "buzzerSwitchName": "MiAirPurifier Buzzer Switch",
        "ledBulbDisable": true,
        "ledBulbName": "MiAirPurifier LED Switch",
        "airQualityDisable": false,
        "airQualityName": "MiAirPurifier AirQuality"
    }, {
        "type": "MiAirPurifier2",
        "ip": "192.168.88.xx",
        "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "airPurifierDisable": false,
        "airPurifierName": "MiAirPurifier2",
        "silentModeSwitchDisable": false,
        "silentModeSwitchName": "MiAirPurifier2 Silent Mode Switch",
        "temperatureDisable": false,
        "temperatureName": "MiAirPurifier2 Temperature",
        "humidityDisable": false,
        "humidityName": "MiAirPurifier2 Humidity",
        "buzzerSwitchDisable": true,
        "buzzerSwitchName": "MiAirPurifier2 Buzzer Switch",
        "ledBulbDisable": true,
        "ledBulbName": "MiAirPurifier2 LED Switch",
        "airQualityDisable": false,
        "airQualityName": "MiAirPurifier2 AirQuality"
    }, {
        "type": "MiAirPurifierPro",
        "ip": "192.168.88.xx",
        "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "airPurifierDisable": false,
        "airPurifierName": "MiAirPurifierPro",
        "silentModeSwitchDisable": false,
        "silentModeSwitchName": "MiAirPurifierPro Silent Mode Switch",
        "temperatureDisable": false,
        "temperatureName": "MiAirPurifierPro Temperature",
        "humidityDisable": false,
        "humidityName": "MiAirPurifierPro Humidity",
        "buzzerSwitchDisable": true,
        "buzzerSwitchName": "MiAirPurifierPro Buzzer Switch",
        "ledBulbDisable": true,
        "ledBulbName": "MiAirPurifierPro LED Switch",
        "airQualityDisable": false,
        "airQualityName": "MiAirPurifierPro AirQuality"
    }, {
        "type": "MiAirPurifier2S",
        "ip": "192.168.88.xx",
        "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "airPurifierDisable": false,
        "airPurifierName": "MiAirPurifier2S",
        "silentModeSwitchDisable": false,
        "silentModeSwitchName": "MiAirPurifier2S Silent Mode Switch",
        "temperatureDisable": false,
        "temperatureName": "MiAirPurifier2S Temperature",
        "humidityDisable": false,
        "humidityName": "MiAirPurifier2S Humidity",
        "buzzerSwitchDisable": true,
        "buzzerSwitchName": "MiAirPurifier2S Buzzer Switch",
        "ledBulbDisable": true,
        "ledBulbName": "MiAirPurifier2S LED Switch",
        "airQualityDisable": false,
        "airQualityName": "MiAirPurifier2S AirQuality"
    }]
}]
```

## Get token
### Get token by miio2.db
setup MiJia(MiHome) app in your android device or android virtual machine.   
open MiJia(MiHome) app and login your account.   
refresh device list and make sure device display in the device list.   
get miio2.db(path: /data/data/com.xiaomi.smarthome/databases/miio2.db) file from your android device or android virtual machine.   
open website [Get MiIo Tokens By DataBase File](http://miio2.yinhh.com/), upload miio2.db file and submit.    
### Get token by network
Open command prompt or terminal. Run following command:
```
miio --discover
```
Wait until you get output similar to this:
```
Device ID: xxxxxxxx   
Model info: Unknown   
Address: 192.168.88.xx   
Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx via auto-token   
Support: Unknown   
```
"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" is token.   
If token is "???", then reset device and connect device created Wi-Fi hotspot.   
Run following command:   
```
miio --discover --sync
```
Wait until you get output.   
For more information about token, please refer to [OpenMiHome](https://github.com/OpenMiHome/mihome-binary-protocol) and [miio](https://github.com/aholstenson/miio).   

## Version Logs
### [2017-11-16]0.1.0
1.support for XiaoMi AirPurifier2S.   
2.modify class name, reduce the probability of conflicts due to the same class name and other plugins.   
### 0.0.9 (2017-10-28)
1.fixed bug that XiaoMi AirPurifierPro power status display inaccurate.   
### 0.0.8 (2017-10-12)
1.fixed bug that XiaoMi AirPurifier can not work.   
### 0.0.7 (2017-10-01)
1.fixed bug that linkage issues between silent mode switch accessory and air purifier accessory.   
### 0.0.6 (2017-09-22)
1.fixed bug that silent mode switch accessory don't display.   
2.fixed bug that XiaoMi AirPurifierPro led light accessory display brightness.    
### 0.0.5 (2017-09-21)
1.fixed bug that XiaoMi AirPurifier and XiaoMi AirPurifierPro air purifier accessory don't display.   
### 0.0.4 (2017-09-11)
1.optimized code.   
### 0.0.3 (2017-09-10)
1.fixed bug that air purifier accessory disable when set "silentModeSwitchDisable" value is true.   
### 0.0.2 (2017-09-09)
1.fixed bug that can not startup.   
2.add setting silent mode switch disable feature.   
3.optimized code.   
### 0.0.1 (2017-09-09)
1.support for XiaoMi AirPurifier.   
2.support for XiaoMi AirPurifier2.   
3.support for XiaoMi AirPurifierPro.   
