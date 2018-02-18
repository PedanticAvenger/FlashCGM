import { settingsStorage } from "settings";
import * as messaging from "messaging";

let url = null;
let BgDataUnits = false;

messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
}

messaging.peerSocket.close = () => {
  console.log("Companion Socket Closed");
}

const dataPoll = () => {
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
        console.log('Get Data On Phone');
        response.text().then(data => {
          console.log('fetched Data from API');
          sendVal(data);
        })
        .catch(responseParsingError => {
          console.log('fetchError');
          console.log(responseParsingError.name);
          console.log(responseParsingError.message);
          console.log(responseParsingError.toString());
          console.log(responseParsingError.stack);
        });
      }).catch(fetchError => {
        console.log('fetchError');
        console.log(fetchError.name);
        console.log(fetchError.message);
        console.log(fetchError.toString());
        console.log(fetchError.stack);
      })
  } else {
    console.log('no url stored in settings to use to get data.')
  }
};

function sendVal(data) {
  console.log('in sendVal')

    // send BG Data type first
    messaging.peerSocket.send( '{"type":'+BgDataType+'}');

    //Can't we just send the full data point array to the watch in a single message?
    //And set the numbers to the correct units first?
  if(renderAllPoints) {
    for(let index = 23; index >= 0; index--) {

      console.log( JSON.parse(data)[index])
      if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
          console.log('Sending Values')
          messaging.peerSocket.send(JSON.parse(data)[index]);
      }

    }
      renderAllPoints = false;

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

      if(key === "restURL") {
        console.log('restURL')
        console.log(JSON.parse(settingsStorage.getItem(key)).name)
        url = JSON.parse(settingsStorage.getItem(key)).name;
      }else if(key === "dataType") {
        console.log('dataType')
        console.log(JSON.parse(settingsStorage.getItem(key)))
        BgDataType = JSON.parse(settingsStorage.getItem(key))
      }
  }
}

// Ok, so we will be having various message types going back and forth to the watch.
// Should we set a flag in the data bundle of each message to modularize the processing on the watch-side?
// Also, currently this is inherited from flashring and only sends theme info so it needs to be updated.
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

/*
  Workflow:
  -Grab configured high and low from new endpoints in XDrip to be used to set the graph lines as well as for triggering vibe alerts.
  -Grab JSON response from defined data source URL saved in settings (likely http://127.0.0.1:17850/sgv.json).
  -Look for units_hint in the first record and use that to determine required calculations and set units on locally stored settings just because.
    -If no units_hint returned look for the internally stored value
  -Build array of data (Units, trend at most current reading, appropriate timestamp of last query, 24 BG values in appropriate units) and send as message to watch.
    -At this point I'm leaning toward a simple ring that uses color to count out 5 minutes then print a number in center of ring for number of missed polls.
    Simpler for display/user understanding than "XXmYYs since last poll" kind of display.
    -Trend data could be displayed as a 180 degree arc with a calculated arc segment on top for display.  fill of arc can change for extremes, etc.
  -Watch updates main watchface and potentially graph if that can be pre-built, otherwise hold onto the values.
  -Grab the Heartrate (easiest to grab it from what is currently displayed on the watchface)  and steps (today.local.steps) and send them back to companion as a message.
  -Companion makes a second WebAPI call with sgv.json?steps=StepsValue&heart=HeartRateValue
    -Look for the JSON resonse for steps_result and heart_result to be 200 indicating success, everything else for a value is some form of error.
      Possible mis-alignment of data points with the timing here but in all honesty we are talking about an interval so small it really doesn't matter I think.
      Of course I say all the above now based on my trying to incorporate user-activity into the companion app and it doesn't seem to work that way so rather than a single web transaction to update Xdrip and get BG values we instead do it in two steps.
*/
setInterval(dataPoll, 300000); //Run every 5 min.
