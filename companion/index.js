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
Ok, connect to the appropriate data source (likely http://127.0.0.1:17850/sgv.json) and grab the data set.
Format it to match the set units and send it out to the watch for display.  Look for the units first in the response from sgv.json and if units_hint not present in first record look for local setting.
If it is present, should we record it and store value and blank out settings?  Or simply have an "unset" value in settings available and look for hint if that is chosen?
Use the units to perform the unit conversions here and pass array of 24 values to watch, use most recent record on main screen and full array for graph construction.
Remember a timestamp for the last collected value so we can send that to watch for display of this data.  At this point I'm leaning toward a simple ring that uses color to count out 5 minutes then
print a number in center of ring for number of missed polls.  Simpler for display/understanding than "XXmYYs since last poll" kind of display.
Perhaps we should consider a message type to flag out to the watch if we miss X or more regular polling intervals or Xdrip+ indicates that they have been missed for this display.

Also, integration of steps and heartrate communicated back to XDrip+ needs to be incorporated here, see https://github.com/NightscoutFoundation/xDrip/blob/master/Documentation/technical/Local_Web_Services.md
So for the Web API call we first get the current steps and heartrate values, verify them against previous values to ensure they are changed, then build our URL for the query to xDrip

*/
