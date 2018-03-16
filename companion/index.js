import { settingsStorage } from "settings";
import * as messaging from "messaging";

let dataUrl = JSON.parse(settingsStorage.getItem("dataSourceURL")).name;
let settingsUrl = JSON.parse(settingsStorage.getItem("settingsSourceURL")).name;

let bgDataType = JSON.parse(settingsStorage.getItem("dataType"));
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


messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
}

messaging.peerSocket.close = () => {
  console.log("Companion Socket Closed");
}

const dataPoll = () => {
  
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
        console.log('Get Data From Phone');
        response.text().then(data => {
          console.log('fetched Data from API');
          let obj = JSON.parse(data);
          buildGraphData(data);
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
};

const settingsPoll = () => {
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
        console.log('Get Settings From Phone');
        response.text().then(statusreply => {
          console.log("fetched settings from API");
          buildSettings(statusreply);
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
};

function buildSettings(settings) {
  // Need to setup High line, Low Line, Units.
  var obj = JSON.parse(settings);
  console.log(JSON.stringify(obj));
  bgHighLevel = obj.thresholds.bgHigh;
  console.log()
  bgLowLevel =  obj.thresholds.bgLow;
//  bgTargetTop =  obj.thresholds.bgTargetTop;
//  bgTargetBottom =  obj.thresholds.bgTargetBottom;
  bgDataUnits =  obj.settings.units;
  const messageContent = {"settings": {
      "bgDataUnits" : bgDataUnits,
//      "bgTargetTop" : bgTargetTop,
//      "bgTargetBottom" : bgTargetBottom,
      "bgHighLevel" : bgHighLevel,
      "bgLowLevel" : bgLowLevel
    },
}; // end of messageContent
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  }
}

function buildGraphData(data) {
  // Take the data in, move a step at a time from most recent back.
  // look at timestamps to determine if a missed poll happened and make that graph point disappear.
  let obj = JSON.parse(data);
  let graphpointindex = 0;
  lastTimestamp = new Date().getTime();
  var indexarray = [];

  // build the index
  for (var x in obj) {
     indexarray.push({ 'key': x, 'date': obj[x]['date'] });
  }

  // sort the index
  indexarray.sort(function (a, b) { 
     var as = a['date'], 
         bs = b['date']; 

     return as == bs ? 0 : (as < bs ? 1 : -1); 
  }); 
 
  let index = 0;
  for (graphpointindex = 0; graphpointindex <= 23; graphpointindex++) {
    if (index < indexarray.length) {
      while (((lastTimestamp - obj[indexarray[index]['key']].date) >= 301000) && (graphpointindex <= 23)) {
        points[graphpointindex] = undefined;
        console.log("Added a void to points array at " + graphpointindex);
        lastTimestamp = lastTimestamp - 300000;
        graphpointindex++;
      }
      points[graphpointindex] = obj[indexarray[index]['key']].sgv;
      lastTimestamp = obj[indexarray[index]['key']].date;
      console.log("Added a number to points array at " + graphpointindex);
    }
    if (obj[indexarray[index]['key']].date > lastTimestamp) {
      lastTimestamp = obj[indexarray[index]['key']].date;
      bgTrend = obj[indexarray[index]['key']].direction;
    }
    index++
  }
//  console.log("GraphData:" + points);
  const messageContent = {"bgdata" : {
      "graphData": points, 
      "lastPollTime": lastTimestamp, 
      "currentTrend": bgTrend
    }
  };
//  console.log("CompanionString:" + JSON.stringify(messageContent));
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  }
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
        console.log('dataSourceURL');
        console.log(JSON.parse(settingsStorage.getItem(key)).name);
        dataUrl = JSON.parse(settingsStorage.getItem(key)).name;
      }else if(key === "settingsSourceURL") {
        console.log('settingsUrl');
        console.log(JSON.parse(settingsStorage.getItem(key)).name);
        settingsUrl = JSON.parse(settingsStorage.getItem(key)).name;
      }else if(key === "unitsType") {
        console.log('unitsType');
        console.log(JSON.parse(settingsStorage.getItem(key)));
        bgDataType = JSON.parse(settingsStorage.getItem(key));
      }
  }
}

function processDisplayData () {
  if (sendSettings) {
    console.log("Grabbing Settings.");
    settingsPoll();
//    sendSettings = false;
  } 
  dataPoll()
  
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function initialSetup() {
  console.log("Waiting 5 seconds to send data to watch.");
  await sleep(5000);
  console.log("Process triggered");
  processDisplayData();
}



// Ok, so we will be having various message types going back and forth to the watch.
// Should we set a flag in the data bundle of each message to modularize the processing on the watch-side?
// After using until March 6, decided to move all processing here and make watch display/trigger.
// the only math I want the watch to do is calculate time since last reading so it is "independant" from watch and app message interactions.
// Created/ing:
// an array with 24 data points for graphing (leave in mg/dl format)
// units variable for display
// variable for current value in appropriate display units
// variable for last successful poll (as determined from timestamp of last value we get from xdrip/nightscout)

/*  Re-enable this after re-write to integrate into newer messaging format

settingsStorage.onchange = function(evt) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    let data = JSON.parse(evt.newValue);
    messaging.peerSocket.send(data["values"][0].value);
  } else {
    console.log("companion - no connection");
    me.wakeInterval = 2000;
    setTimeout(function(){let data = JSON.parse(evt.newValue); messaging.peerSocket.send(data["values"][0].value);}, 2500);
    me.wakeInterval = undefined;
  }
}

*/

/*
  Workflow thoughts:
  -Done: Grab configured high and low and units from endpoints in XDrip/Nightscout to be used to set the graph lines as well as for triggering vibe alerts.
  - Currently debugging: Grab JSON response from defined data source URL saved in settings (likely http://127.0.0.1:7850/sgv.json).
  
  Messages:
  1)array of data points for graph (24 BG values in mg units), along with trend at most recent value along with its timestamp
  2) Units, configured high and configured low
  3) Theme messages from flashring with incorporated theme settings for display data.

  "Age of readings":
  At this point I'm leaning toward a simple ring that uses color to count out 5 minutes then print a number in center of ring for number of missed polls.
    Simpler for display/user understanding than "XXmYYs since last poll" kind of display but that could just be me
    and should be verified by some users with different perspectives.
  Done:Trend data could be displayed as a 180 degree arc with a calculated arc segment on top for display.  fill of arc can change for extremes, etc.
  
  -Grab the Heartrate (easiest to grab it from what is currently displayed on the watchface)  and steps (today.local.steps) and send them back to companion as a message.
  -Companion makes a second WebAPI call with sgv.json?steps=StepsValue&heart=HeartRateValue
    -Look for the JSON resonse for steps_result and heart_result to be 200 indicating success, everything else for a value is some form of error.
      
  Possible mis-alignment of data points with the timing here but in all honesty we are talking about an interval so small it really doesn't matter I think.
  Of course I say all the above now based on my trying to incorporate user-activity into the companion app and it doesn't seem to work that way so rather than a single web transaction to update Xdrip and get BG values we instead do it in two steps.
*/
initialSetup();
setInterval(processDisplayData, 150000); // Run every 2.5 min.
