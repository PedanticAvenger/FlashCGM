import { settingsStorage } from "settings";
import * as messaging from "messaging";

let url = JSON.parse(settingsStorage.getItem("restURL")).name;
let settingsUrl = JSON.parse(settingsStorage.getItem("restURL")).name;

let bgDataType = JSON.parse(settingsStorage.getItem("dataType"));
let sendAllData = true;

var bgDataUnits = "mg";
var bgHighLevel = 0;
var bgLowLevel = 0;
var bgTargetTop = 0;
var bgTargetBottom = 0;

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
  if(sendAllData) {
      console.log('Grabbing Settings.')
      settingsPoll();
      sendAllData = false;
    }
  console.log('Open Data API CONNECTION')
  console.log(url)
  if(url) {
    //url = url + "?count=14";
    fetch(url,{
      method: 'GET',
      mode: 'cors',
      headers: new Headers({
        "Content-Type": 'application/json; charset=utf-8'
      })
    })
      .then(response => {
        //debug logging console.log('Get Data From Phone');
        response.text().then(data => {
          //debug logging console.log('fetched Data from API');
          //sendVal(data);
          buildGraphData(data);
        })
        .catch(responseParsingError => {
          console.log('fetchError1');
          console.log(responseParsingError.name);
          console.log(responseParsingError.message);
          console.log(responseParsingError.toString());
          console.log(responseParsingError.stack);
        });
      }).catch(fetchError => {
        console.log('fetchError2');
        console.log(fetchError.name);
        console.log(fetchError.message);
        console.log(fetchError.toString());
        console.log(fetchError.stack);
      })
  } else {
    console.log('no url stored in settings to use to get data.')
  }
}
const settingsPoll = () => {
  console.log('Open Settings API CONNECTION')
  console.log(settingsUrl)
  if(settingsUrl) {
    //url = url + "?count=14";
    fetch(settingsUrl,{
      method: 'GET',
      mode: 'cors',
      headers: new Headers({
        "Content-Type": 'application/json; charset=utf-8'
      })
    })
      .then(response => {
        //debug logging console.log('Get Data From Phone');
        response.text().then(settings => {
          //debug logging console.log('fetched Data from API');
          buildSettings(settings);
        })
        .catch(responseParsingError => {
          console.log('fetchError1');
          console.log(responseParsingError.name);
          console.log(responseParsingError.message);
          console.log(responseParsingError.toString());
          console.log(responseParsingError.stack);
        });
      }).catch(fetchError => {
        console.log('fetchError2');
        console.log(fetchError.name);
        console.log(fetchError.message);
        console.log(fetchError.toString());
        console.log(fetchError.stack);
      })
  } else {
    console.log('no url stored in app settings to use to get settings.')
  }
};

function buildSettings(settings) {
  //Need to setup High line, Low Line, Units.
  bgHighLevel = JSON.parse(settings[thresholds.bgHigh]);
  bgLowLevel =  JSON.parse(settings[thresholds.bgLow]);
  bgTargetTop =  JSON.parse(settings[thresholds.bgTargetTop]);
  bgTargetBottom =  JSON.parse(settings[thresholds.bgTargetBottom]);
  bgDataUnits =  JSON.parse(settings[thresholds.bgHigh]);
  var messageContent = {"settings": [
    {"bgDataUnits" : bgDataUnits, "bgTargetTop" : bgTargetTop, "bgTargetBottom" : bgTargetBottom, "bgHighLevel" : bgHighLevel, "bgLowLevel" : bgLowLevel}
    ] //end of settings array
  } //end of messageContent
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  }
}

function buildGraphData(data) {
  // Take the data in, move a step at a time from most recent back.
  // look at timestamps to determine if a missed poll happened and make that graph point disappear.
  let graphpointindex = 23;
  lastTimestamp = 0;
  for (let index = 0; index <= 23; index++) {
    if (index===0) {
      bgDataUnits = JSON.parse(data[0].units_hint);
    }
    if (graphpointindex >= 0) {
      while ((currentTimestamp - JSON.parse(data[index].date)) >= 300) {
        points[graphpointindex] = -10;
        currentTimestamp = currentTimestamp - 300;
        graphpointindex--;
      }
      points[graphpointindex] = JSON.parse(data[index].sgv);
      graphpointindex--;
      if (JSON.parse(data[index].date) > lastTimestamp) {
        lastTimestamp = JSON.parse(data[index].date);
        bgTrend = JSON.parse(data[index].direction);
      }
    }
  }
  console.log("GraphData:"+points);
  var messageContent = {"bgdata" : [
    {"graphdata" : points, "lastPollTime" : lastTimestamp, "currentTrend" : bgTrend}
  ];
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  }
}

function sendVal(data) {
  //Looking to deprecate this function completely in favor of buildSettings/BuildGraphData/buildTheme.....;

    // send BG Data type first
    messaging.peerSocket.send('{"units":'+bgDataType+'}');

    //Can't we just send the full data point array to the watch in a single message?
    //And set the numbers to the correct units first?
  if(sendAllData) {
    for(let index = 23; index >= 0; index--) {

      if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
          //debug logging console.log('Sending Values - '+JSON.parse(data)[index]);
          messaging.peerSocket.send(JSON.parse(data)[index]);
      }

    }
      sendAllData = false;

  } else {
        if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
            messaging.peerSocket.send(JSON.parse(data)[0]);
        }
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
        url = JSON.parse(settingsStorage.getItem(key)).name;
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

// Ok, so we will be having various message types going back and forth to the watch.
// Should we set a flag in the data bundle of each message to modularize the processing on the watch-side?
// Also, currently this is inherited from flashring which only sends theme info so it needs to be updated.
// After using until March 6, decided to move all processing here and make watch display/trigger.
// the only math I want the watch to do is calculate time since last reading so it is "independant" from watch and app message interactions.
// Will create:
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
  -Grab configured high and low and units from endpoints in XDrip/Nightscout to be used to set the graph lines as well as for triggering vibe alerts.
  -Grab JSON response from defined data source URL saved in settings (likely http://127.0.0.1:17850/sgv.json).
  -Look for units_hint in the first record and use that to determine required calculations and set units on locally stored settings just because.
    -If no units_hint returned look for the internally stored value
  Messages:
  1)array of data points for graph, 24 BG values in appropriate units
  2)Current reading, trend at most current reading, appropriate timestamp of most recent result,
  3) Units, configured high and configured low
  4) Theme messages from flashring with incorporated theme settings for display data.

    -At this point I'm leaning toward a simple ring that uses color to count out 5 minutes then print a number in center of ring for number of missed polls.
    Simpler for display/user understanding than "XXmYYs since last poll" kind of display but that could just be me
    and should be verified by some users with different perspectives.
    -Trend data could be displayed as a 180 degree arc with a calculated arc segment on top for display.  fill of arc can change for extremes, etc.
  -Grab the Heartrate (easiest to grab it from what is currently displayed on the watchface)  and steps (today.local.steps) and send them back to companion as a message.
  -Companion makes a second WebAPI call with sgv.json?steps=StepsValue&heart=HeartRateValue
    -Look for the JSON resonse for steps_result and heart_result to be 200 indicating success, everything else for a value is some form of error.
      Possible mis-alignment of data points with the timing here but in all honesty we are talking about an interval so small it really doesn't matter I think.
      Of course I say all the above now based on my trying to incorporate user-activity into the companion app and it doesn't seem to work that way so rather than a single web transaction to update Xdrip and get BG values we instead do it in two steps.


   The more I look at this the more I'm certain that all the data processing from the JSON datasource needs to be done in the companion and simple messages of an array of glucose values, current trend, timestamp should be all that is sent.  Theme settings could be used to alter units display, etc.  Should in general be much more stable and battery friendly on the watch.
*/

setInterval(dataPoll, 300000); //Run every 5 min.
