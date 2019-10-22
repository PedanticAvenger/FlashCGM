import { settingsStorage } from "settings";
import * as messaging from "messaging";
import { me } from "companion"; 

//let bgDataType = JSON.parse(settingsStorage.getItem("dataType"));
var bgDataType = "mg/dl";
var sendSettings = true;

var bgDataUnits = "mg/dl";
var bgHighLevel = 0;
var bgLowLevel = 0;
var bgTargetTop = 0;
var bgTargetBottom = 0;
var bgTrend = "Flat";
var dateFormat;

var points = [220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220,220];
var currentTimestamp = Math.round(new Date().getTime()/1000);
var lastTimestamp = 0;
var dataUrl;
var settingsUrl;
var lastSettingsUpdate = 0;

messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
}

messaging.peerSocket.close = () => {
  console.log("Companion Socket Closed");
}

const dataPoll = () => {
  dataUrl = JSON.parse(settingsStorage.getItem("dataSourceURL")).name;
  if (dataUrl == "" || dataUrl == null) {
    dataUrl = "http://127.0.0.1:17580/sgv.json";
  }
  dataUrl = dataUrl + "?count=48&brief_mode=Y";
  console.log('Open Data API CONNECTION');
  console.log(dataUrl);
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
          console.log('fetched Data from API');
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
  if ((lastSettingsUpdate+4800) <= (Date.now()/1000)) {
    settingsUrl = JSON.parse(settingsStorage.getItem("settingsSourceURL")).name;
    if (settingsUrl == "" || settingsUrl == null) {
      settingsUrl = "http://127.0.0.1:17580/status.json";
    }
    console.log('Open Settings API CONNECTION');
    console.log(settingsUrl);
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
            console.log("fetched settings from API");
            lastSettingsUpdate = Date.now()/1000;
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
  } else {
  }

  return true;
};

function buildSettings(settings) {
  // Need to setup High line, Low Line, Units.
  var obj = JSON.parse(settings);
//  console.log(JSON.stringify(obj));
  bgHighLevel = obj.settings.thresholds.bgHigh;
  bgLowLevel = obj.settings.thresholds.bgLow;
  bgDataUnits = obj.settings.units;
  settingsStorage.setItem("unitsType", JSON.stringify(bgDataUnits));
  
  const messageContent = {"settings": {
      "bgDataUnits" : bgDataUnits,
      "bgHighLevel" : bgHighLevel,
      "bgLowLevel" : bgLowLevel
    },
  }; // end of messageContent
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  } else {
    console.log("companion - no connection");
    me.wakeInterval = 2000;
    setTimeout(function(){messaging.peerSocket.send(messageContent);}, 2500);
    me.wakeInterval = undefined;
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
  for (graphpointindex = 0; graphpointindex < 48; graphpointindex++) {
    if (index < obj.length) {
      while (((runningTimestamp - obj[index].date) >= 305000) && (graphpointindex < 48)) {
        points[graphpointindex] = undefined;
        runningTimestamp = runningTimestamp - 300000;
        graphpointindex++;
      }
      if(graphpointindex < 48) {
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
  console.log(JSON.stringify(messageContent));
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  } else {
    console.log("companion - no connection");
    me.wakeInterval = 2000;
    setTimeout(function(){messaging.peerSocket.send(messageContent);}, 2500);
    me.wakeInterval = undefined;
  }
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  } else {
    console.log("companion - no connection");
    me.wakeInterval = 2000;
    setTimeout(function(){messaging.peerSocket.send(messageContent);}, 2500);
    me.wakeInterval = undefined;
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
  if (evt.key==="dateFormat") {
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      var data = JSON.parse(evt.newValue);
      console.log("field:" + data["values"][0].value.dateFormat);
      //settingsStorage.getItem("dateFormat") //.replace(/^"(.*)"$/, '$1')
      var messageContent = {
        "dateFormat" : data["values"][0].value.dateFormat
       };
      messaging.peerSocket.send(messageContent);
      console.log("Sent DateFormat to watch:" + JSON.stringify(messageContent));
    } else {
      console.log("companion - no connection");
      me.wakeInterval = 2000;
      setTimeout(function(){var messageContent = {"bgDisplayColor":settingsStorage.getItem("bgDisplayColor")}; messaging.peerSocket.send(messageContent);}, 2500);
      me.wakeInterval = undefined;
    }
  }
}

messaging.peerSocket.onmessage = function(evt) {
  console.log(JSON.stringify(evt.data));
  if (evt.data.hasOwnProperty("RequestType")) {
  if (evt.data.RequestType === "Settings" ) {
     settingsPoll();
  }
  if (evt.data.RequestType === "Data" ) {
   dataPoll();
  }
  }  
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// var value = settingsPoll(dataPoll);
//setInterval(processDisplayData, 75000); // Run every 2.5 min.