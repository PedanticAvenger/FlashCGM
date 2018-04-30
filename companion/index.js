import { settingsStorage } from "settings";
import * as messaging from "messaging";
import { me } from "companion"; 

//let bgDataType = JSON.parse(settingsStorage.getItem("dataType"));
let bgDataType = "mg";
let sendSettings = true;

var bgDataUnits = "mg";
var bgHighLevel = 0;
var bgLowLevel = 0;
var bgTargetTop = 0;
var bgTargetBottom = 0;
let bgTrend = "Flat";

var points = [220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220];
var currentTimestamp = Math.round(new Date().getTime()/1000);
var lastTimestamp = 0;
var dataUrl;
var settingsUrl;

messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
}

messaging.peerSocket.close = () => {
  console.log("Companion Socket Closed");
}

const dataPoll = () => {
  dataUrl = JSON.parse(settingsStorage.getItem("dataSourceURL")).name;
  if (dataUrl == "" || dataUrl == null) {
    dataUrl = "http://127.0.0.1:17580/sgv.json?count=24&brief_mode=Y";
  }
//  console.log('Open Data API CONNECTION');
//  console.log(dataUrl);
  if(dataUrl) {
    fetch(dataUrl,{
      method: 'GET',
      mode: 'cors',
      headers: new Headers({
        "Content-Type": 'application/json; charset=utf-8'
      })
    })
      .then(response => {
 //       console.log('Get Data From Phone');
        response.text().then(data => {
//          console.log('fetched Data from API');
          let obj = JSON.parse(data);
          let returnval = buildGraphData(data);
        })
        .catch(responseParsingError => {
          console.log("Response parsing error in data!");
          console.log(responseParsingError.name);
          console.log(responseParsingError.message);
          console.log(responseParsingError.toString());
          console.log(responseParsingError.stack);
        });
      }).catch(fetchError => {
        console.log("Fetch Error in data!");
        console.log(fetchError.name);
        console.log(fetchError.message);
        console.log(fetchError.toString());
        console.log(fetchError.stack);
      })
  } else {
    console.log('no url stored in settings to use to get data.');
  }
  return true;
};

const settingsPoll = () => {
  settingsUrl = JSON.parse(settingsStorage.getItem("settingsSourceURL")).name;
  if (dataUrl == "" || dataUrl == null) {
    dataUrl = "http://127.0.0.1:17580/status.json";
  }
//  console.log('Open Settings API CONNECTION');
//  console.log(settingsUrl);
  if (settingsUrl) {
    fetch(settingsUrl, {
      method: 'GET',
      mode: 'cors',
      headers: new Headers({
        "Content-Type": 'application/json; charset=utf-8',
      }),
    })
      .then(response => {
 //       console.log('Get Settings From Phone');
        response.text().then(statusreply => {
//          console.log("fetched settings from API");
          let returnval = buildSettings(statusreply);
        })
          .catch(responseParsingError => {
            console.log('Response parsing error in settings!');
            console.log(responseParsingError.name);
            console.log(responseParsingError.message);
            console.log(responseParsingError.toString());
            console.log(responseParsingError.stack);
          });
      }).catch(fetchError => {
        console.log('Fetch error in settings!');
        console.log(fetchError.name);
        console.log(fetchError.message);
        console.log(fetchError.toString());
        console.log(fetchError.stack);
      });
  } else {
    console.log("no url stored in app settings to use to get settings.");
  }
  return true;
};

function buildSettings(settings) {
  // Need to setup High line, Low Line, Units.
  var obj = JSON.parse(settings);
//  console.log(JSON.stringify(obj));
  bgHighLevel = obj.settings.thresholds.bgHigh;
  bgLowLevel = obj.settings.thresholds.bgLow;
  bgTargetTop = obj.settings.thresholds.bgTargetTop;
  bgTargetBottom = obj.settings.thresholds.bgTargetBottom;
  bgDataUnits = obj.settings.units;
  settingsStorage.setItem("unitsType", JSON.stringify(bgDataUnits));
  
  const messageContent = {"settings": {
      "bgDataUnits" : bgDataUnits,
      "bgTargetTop" : bgTargetTop,
      "bgTargetBottom" : bgTargetBottom,
      "bgHighLevel" : bgHighLevel,
      "bgLowLevel" : bgLowLevel
    },
}; // end of messageContent
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  }
  return true;
}

function buildGraphData(data) {
  // Take the data in, move a step at a time from most recent back.
  // look at timestamps to determine if a missed poll happened and make that graph point disappear.
  let obj = JSON.parse(data);
  let graphpointindex = 0;
  var runningTimestamp = new Date().getTime();
  var indexarray = [];

  // build the index
  obj.sort(function(a, b) { 
    return b.date - a.date
   })
 
  let index = 0;
  let validTimeStamp = false;
//  console.log(JSON.stringify(obj));
  for (graphpointindex = 0; graphpointindex < 24; graphpointindex++) {
    if (index < obj.length) {
      while (((runningTimestamp - obj[index].date) >= 305000) && (graphpointindex < 24)) {
        points[graphpointindex] = undefined;
        runningTimestamp = runningTimestamp - 300000;
        graphpointindex++;
      }
      if(graphpointindex <24) {
        points[graphpointindex] = obj[index].sgv;
       runningTimestamp = obj[index].date;
      }
        if (!validTimeStamp) {
        lastTimestamp = obj[index].date;
        bgTrend = obj[index].direction;
        validTimeStamp = true;
      }
    }
    index++
  }
  lastTimestamp = parseInt(lastTimestamp/1000, 10);
  var flippedPoints = points.reverse();
  const messageContent = {"bgdata" : {
      "graphData": flippedPoints, 
      "lastPollTime": lastTimestamp, 
      "currentTrend": bgTrend
    }
  };
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  }
  return true;
}

function restoreSettings() {
  for (let index = 0; index < settingsStorage.length; index++) {

    let key = settingsStorage.key(index);
      let data = {
        key: key,
        newValue: settingsStorage.getItem(key),
        dataType: true
      };

      if(key === "dataSourceURL") {
//        console.log("DataSourceURL: " + JSON.parse(settingsStorage.getItem(key)).name);
        dataUrl = JSON.parse(settingsStorage.getItem(key)).name;
      }else if(key === "settingsSourceURL") {
//        console.log("SettingsURL: " + JSON.parse(settingsStorage.getItem(key)).name);
        settingsUrl = JSON.parse(settingsStorage.getItem(key)).name;
      }else if(key === "unitsType") {
//        console.log("UnitsType: " + JSON.parse(settingsStorage.getItem(key)));
        bgDataType = JSON.parse(settingsStorage.getItem(key));
      }
  }
}

function processDisplayData () {
  if (sendSettings) {
//    console.log("Grabbing Settings.");
    var value = settingsPoll();
//    sendSettings = false;
  } 
  var value2 = dataPoll()
  
}

async function initialSetup() {
  if (settingsStorage.length === 0) {
    var defaultDataSourceURL = "http://127.0.0.1:17580/sgv.json?count=24&brief_mode=Y";
    var defaultSettingsURL = "http://127.0.0.1:17580/status.json";
    var defaultUnitsType = "mg/dl";
    var defaultTheme = {background: "#f8fcf8", foreground: "#707070"};
    var defaultbgColorTheme = "orangered";
    
    settingsStorage.setItem("theme", JSON.stringify(defaultTheme));
    settingsStorage.setItem("bgDisplayColor", JSON.stringify(defaultbgColorTheme));
    settingsStorage.setItem("dataSourceURL", JSON.stringify(defaultDataSourceURL));
    settingsStorage.setItem("settingsSourceURL", JSON.stringify(defaultSettingsURL));
    settingsStorage.setItem("unitsType", JSON.stringify(defaultUnitsType));

  }
  processDisplayData();
}


settingsStorage.onchange = function(evt) {
  restoreSettings();
  if (evt.key==="theme") {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      var data = JSON.parse(evt.newValue);
      var messageContent = {
        "theme" :
          data["values"][0].value
       };
      messaging.peerSocket.send(messageContent);
//      console.log("Sent Theme to watch:" + JSON.stringify(messageContent));
    } else {
      console.log("companion - no connection");
      me.wakeInterval = 2000;
      setTimeout(function(){var data = JSON.parse(evt.newValue); var messageContent = {"theme":[data["values"][0].value]}; messaging.peerSocket.send(messageContent);}, 2500);
      me.wakeInterval = undefined;
    }
  }
  if (evt.key==="bgDisplayColor") {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      var bgDisplayColor = settingsStorage.getItem("bgDisplayColor").replace(/^"(.*)"$/, '$1')
      var messageContent = {
        "bgDisplayColor" : bgDisplayColor
          
       };
      messaging.peerSocket.send(messageContent);
//      console.log("Sent bgTheme to watch:" + JSON.stringify(messageContent));
    } else {
      console.log("companion - no connection");
      me.wakeInterval = 2000;
      setTimeout(function(){var messageContent = {"bgDisplayColor":settingsStorage.getItem("bgDisplayColor")}; messaging.peerSocket.send(messageContent);}, 2500);
      me.wakeInterval = undefined;
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

initialSetup();
setInterval(processDisplayData, 150000); // Run every 2.5 min.