import { settingsStorage } from "settings";
import * as messaging from "messaging";

messaging.peerSocket.onopen = () => {
  console.log("Companion Socket Open");
}

messaging.peerSocket.close = () => {
  console.log("Companion Socket Closed");
}

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
