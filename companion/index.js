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
Format it to match the set units and send it out to the watch for display.
Remember a timestamp for the last collected value so we can send that to watch for display of this data.
Perhaps we should consider a message type to flag out to the watch if we miss X or more regular polling intervals or Xdrip+ indicates that they have been missed.
*/
