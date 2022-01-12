//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//
// Vibration handling
//
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

import { vibration } from "haptics";
import document from "document";

// Alert handles
let myPopup = document.getElementById("popup");
let btnLeft = myPopup.getElementById("btnLeft");
let btnRight = myPopup.getElementById("btnRight");
let alertHeader = document.getElementById("alertHeader");
let vibrationTimeout;

export function startAlertProcess(message) {
  showAlert(message);
  startVibration("ring");
  vibrationTimeout = setInterval(startVibration("ring"), 15000);
}

export function startVibration(type) {
  vibration.start(type);
}

export function stopVibration() {
  clearInterval(vibrationTimeout);
  vibration.stop();
}

export function showAlert(message) {
  // console.log('ALERT BG')
  // console.log(message)
  alertHeader.text = message
  myPopup.style.display = "inline";
}