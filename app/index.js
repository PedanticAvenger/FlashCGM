import clock from "clock";
import document from "document";
import userActivity from "user-activity";
import { me as device } from "device";
import { HeartRateSensor } from "heart-rate";
import { locale } from "user-settings";
import { preferences } from "user-settings";
import * as messaging from "messaging";
import * as fs from "fs";
import * as util from "../common/utils";
import { vibration } from "haptics";
import Graph from "./graph.js";

if (!device.screen) device.screen = { width: 348, height: 250 };

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//
// Clock/Sensor related defines
//
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// Update the clock every minute
clock.granularity = "seconds";
const clockPref = preferences.clockDisplay;
let lastValueTimestamp = Date.now();

try {
  let stats = fs.statSync("theme.txt");
  let json_themeread = fs.readFileSync("theme.txt", "json");
} catch (err) {
  let json_theme = {"backg": "#f8fcf8", "foreg": "#707070"};
  fs.writeFileSync("theme.txt", json_theme, "json");
  let json_themeread = fs.readFileSync("theme.txt", "json");
}

let backgdcol = json_themeread.backg || "#f8fcf8";
let foregdcol = json_themeread.foreg || "#707070";

// Get Goals to reach
const distanceGoal = userActivity.goals.distance;
const caloriesGoal = userActivity.goals["calories"];
const stepsGoal = userActivity.goals.steps;
const elevationGoal = userActivity.goals.elevationGain;

// Get a handle on the <text> element
let myClock = document.getElementById("myLabel");
let myDate = document.getElementById("myDate");

//Normal Flashring handles below.
let dailysteps = document.getElementById("mySteps");
let dailystairs = document.getElementById("myStairs");
let dailycals = document.getElementById("myCals");
let currentheart = document.getElementById("myHR");
let heartRing = document.getElementById("hrtArc");
let stepRing = document.getElementById("stepsArc");
let calRing = document.getElementById("calsArc");
let heart = document.getElementById("myHR");
let otherData = document.getElementById("otherData");
let upperLine = document.getElementById("upperLine");
let bottomLine = document.getElementById("bottomLine");


//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//
// CGM Functionality related defines
//
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

//Define screen change stuff and display stuff
let MainScreen = document.getElementById("MainScreen");
let GraphScreen= document.getElementById("GraphScreen");
let scale1 = document.getElementById("scale1");
let scale2 = document.getElementById("scale2");
let scale3 = document.getElementById("scale3");
let scale4 = document.getElementById("scale4");
let scale5 = document.getElementById("scale5");
let button1 = document.getElementById("button1");
let button2 = document.getElementById("button2");
let arrowIcon = {"Flat":"\u{2192}","DoubleUp":"\u{2191}\u{2191}","SingleUp":"\u{2191}","FortyFiveUp":"\u{2197}","FortyFiveDown":"\u{2198}","SingleDown":"\u{2193}","DoubleDown":"\u{2193}\u{2193}","None":"-","NOT COMPUTABLE":"-","RATE OUT OF RANGE":"-"};

//Inserted for main screen CGM Data
let myCurrentBG = document.getElementById("myCurrentBG");
let myBGUnits = document.getElementById("myBGUnits");
let myBGPollCounterLabel1 = document.getElementById("myBGPollCounterLabel1");
let myMissedBGPollCounter = document.getElementById("myMissedBGPollCounter");
let myBGTrend = document.getElementById("myBGTrend");
let bgCount = 24;
let docGraph = document.getElementById("docGraph");
let myGraph = new Graph(docGraph);
let prefBgUnits = "unset";
let defaultBGColor = "grey";
let reminderTimer = 0;
let showAlertModal = true;
myBGUnits.text = prefBgUnits;  
myCurrentBG.style.fill = "grey";
myBGUnits.style.fill = "grey";
myBGPollCounterLabel1.style.fill = "grey";
myMissedBGPollCounter.style.fill = "grey";
let vibrationTimeout; 

// The pref values below are completely arbitrary and should be discussed.  They get overwritten as soon as xdrip or nightscout is polled for settings.
let prefHighLevel = 260;
let prefLowLevel = 55;
let prefHighTarget = 200;
let prefLowTarget = 80;
var d = new Date();
// Initialize so the face thinks it doesn't need to update for 5 seconds or so just to make sure everything is properly loaded.
var currSeconds = Math.round(Date.now()/1000);
var lastReadingTimestamp = currSeconds-295;
var lastSettingsUpdate = 0;


//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//
// Clock/Sensor related functions
//
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function applyTheme(background, foreground) {
  //Add Theme settings for Main screen color, and anything else we add as customizable.
//  console.log("Called applyTheme!");
  myClock.style.fill = background;
  dailysteps.style.fill = background;
  dailystairs.style.fill = background;
  dailycals.style.fill = background;
  heart.style.fill = background;
  myDate.style.fill = foreground;
  upperLine.style.fill = foreground;
  bottomLine.style.fill = foreground;
}

function updateStats() {
  const metricSteps = "steps";  // distance, calories, elevationGain, activeMinutes
  const amountSteps = userActivity.today.adjusted[metricSteps] || 0;
  const metricCals = "calories";  // distance, calories, elevationGain, activeMinutes
  const amountCals = userActivity.today.adjusted[metricCals] || 0;
  const metricElevation = "elevationGain";
  const amountElevation = userActivity.today.adjusted[metricElevation] || 0
  dailystairs.text = amountElevation;
  let stepString = util.thsdDot(amountSteps);
  let calString = util.thsdDot(amountCals);
  dailysteps.text = stepString;
  let stepAngle = Math.floor(360*(amountSteps/stepsGoal));
  if ( stepAngle > 360 ) {
    stepAngle = 360;
    stepRing.fill="#58e078";
  }
  stepRing.sweepAngle = stepAngle;
  dailycals.text = calString;
  let calAngle = Math.floor(360*(amountCals/caloriesGoal));
  if ( calAngle > 360 ) {
    calAngle = 360;
    calRing.fill="#58e078";
  }
  calRing.sweepAngle = calAngle;
}

var hrm = new HeartRateSensor();

hrm.onreading = function () {
  currentheart.text = ( hrm.heartRate > 0 ) ? hrm.heartRate : "--";
  lastValueTimestamp = Date.now();
  let heartAngle = Math.floor(360*((hrm.heartRate-30)/170)); //heartrate lower than 30 should not occur and 200 schould be enough anyway
  if ( heartAngle > 360 ) {
    heartAngle = 360;
  } else if ( heartAngle < 0 ) {
    heartAngle = 0;
  }
  heartRing.sweepAngle = heartAngle;
}
hrm.start();

// Update the <text> element with the current time
function updateClock() {
  let lang = locale.language;
  let today = new Date();
  let day = util.zeroPad(today.getDate());
  let wday = today.getDay();
  let month = util.zeroPad(today.getMonth()+1);
  let year = today.getFullYear();
  //  let hours = util.zeroPad(util.formatHour(today.getHours(), clockPref));
  let hours = util.formatHour(today.getHours(), clockPref);
  let mins = util.zeroPad(today.getMinutes());
  let prefix = lang.substring(0,2);
  if ( typeof util.weekday[prefix] === 'undefined' ) {
    prefix = 'en';
  }
  let divide = "/";
  if ( prefix == 'de' ) {
    divide = ".";
  } else if ( prefix == "nl" || prefix == "ko") {
    divide = "-"
  }
  let datestring = day + divide + month + divide + year;
  if ( lang == "en-US" ) {
    datestring = month + divide + day + divide + year;
  } else if ( prefix == "zh" || prefix == "ja" || prefix == "ko") {
    datestring = year + divide + month + divide + day;
  }
  myClock.text = `${hours}:${mins}`;
  myDate.text = `${util.weekday[prefix][wday]}, ${datestring}`;

  updateStats();
  if ( (Date.now() - lastValueTimestamp)/1000 > 5 ) {
    currentheart.text = "--";
    heartRing.sweepAngle = 0;
  }
 
}

// Update the clock every tick event
clock.ontick = () => updateClock();

// Don't start with a blank screen
applyTheme(backgdcol, foregdcol);
updateClock();


//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//
// CGM related functions
//
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function mmol( bg ) {
  let mmolBG = myNamespace.round( (bg / 18.0182), 2 );
  let mmolBG2 = parseFloat(Math.round(mmolBG * 100) / 100).toFixed(1);
  return mmolBG2;
}

//functions for screen switching to/from graph
function showMainScreen() {
  console.log("Show main screen");
  MainScreen.style.display = "inline";
  GraphScreen.style.display = "none";
}

function showGraphScreen() {
  console.log("Show graph screen");
  MainScreen.style.display = "none";
  GraphScreen.style.display = "inline";
}

button1.onclick = function() {
  showGraphScreen();
}

button2.onclick = function () {
  showMainScreen();
}

function setBGColor(bgValue) {
  console.log("Low to High: " + prefLowLevel + "/" + prefLowTarget + "/" + prefHighTarget + "/" + prefHighLevel);
  if (bgValue <= prefLowTarget) {
    myCurrentBG.style.fill = "red";
    myBGUnits.style.fill = "red";
    myBGPollCounterLabel1.style.fill = "red";
    myMissedBGPollCounter.style.fill = "red";
    if (bgValue <= prefLowLevel) {
      myCurrentBG.style.fill = "magenta";
      myBGUnits.style.fill = "magenta";
      myBGPollCounterLabel1.style.fill = "magenta";
      myMissedBGPollCounter.style.fill = "magenta";
    }
  } else if ((bgValue > prefLowTarget) && (bgValue <= prefHighTarget)) {
    myCurrentBG.style.fill = "fb-green";
    myBGUnits.style.fill = "fb-green";
    myBGPollCounterLabel1.style.fill = "fb-green";
    myMissedBGPollCounter.style.fill = "fb-green"; 
  } else if (bgValue > prefHighTarget) {
    myCurrentBG.style.fill = "yellow";
    myBGUnits.style.fill = "yellow";
    myBGPollCounterLabel1.style.fill = "yellow";
    myMissedBGPollCounter.style.fill = "yellow";  
    if (bgValue >= prefHighLevel) {
      myCurrentBG.style.fill = "red";
      myBGUnits.style.fill = "red";
      myBGPollCounterLabel1.style.fill = "red";
      myMissedBGPollCounter.style.fill = "red";
    }
  }
}

function updategraph(data) {
  var points = data.bgdata.graphData;
  var trend = data.bgdata.currentTrend;
  var lastPollTime = data.bgdata.lastPollTime;
  lastReadingTimestamp = data.bgdata.lastPollTime;

  // Check to see if we have a reading or a missed reading and update display appropriately
  // Also triger an alert if we are outside of target range.
  if (points[23] != undefined) {
    setBGColor(points[23]);
    if(prefBgUnits === "mg/dl") {
      myCurrentBG.text = points[23];
      if ((points[23] >= prefHighTarget) && (reminderTimer <= Math.round(Date.now()/1000))) {
        let message = points[23];
        startAlertProcess(message);
      }
      if ((points[23] <= prefLowTarget) && (reminderTimer <= Math.round(Date.now()/1000)))  {
        let message = points[23];
        startAlertProcess(message);
      }
    } else if (prefBgUnits === "mmol") {
      myCurrentBG.text = mmol(points[23]);
      if ((points[23] >= prefHighTarget) && (reminderTimer <= Math.round(Date.now()/1000))) {
        let message = mmol(points[23]);
        startAlertProcess(message);
      }
      if ((points[23] <= prefLowTarget) && (reminderTimer <= Math.round(Date.now()/1000)))  {
        let message = mmol(points[23]);
        startAlertProcess(message);
      }
    }

  } else if (points[23] == undefined) {
    function findValid(element) {
     return element != undefined;
    }     
    if(prefBgUnits === "mg/dl") {
      myCurrentBG.text = points[points.findIndex(findValid)];
      myCurrentBG.style.fill = "grey";
    } else if (prefBgUnits === "mmol") {
      myCurrentBG.text = mmol(points[points.findIndex(findValid)]);
      myCurrentBG.style.fill = "grey";
    }
  }

  // Update the trend arrow based on the data poll
  let newFill = "#008600";
  if (trend === "DoubleUp" || trend === "DoubleDown") {
    newFill = "#FF0000";
  } else if (trend === "FortyFiveUp" || trend === "Flat" || trend === "FortyFiveDown") {
    newFill = "fb-green";
  } else if (trend === "SingleUp" || trend === "SingleDown") {
    newFill = "fb-yellow"
  }
  myBGTrend.style.fill = newFill;
  myBGTrend.text = arrowIcon[trend];

  //Setup for the graphing function library, do some device checks, etc. to get the right display.
  let docGraph = document.getElementById("docGraph");
  let myGraph = new Graph(docGraph);
  var testvalues = points.map(function(o) { return o; }).filter(isFinite);
  var datavalues = points.map(function(val) { return val == null ? -60 : val;});

  if (device.screen.width === 300) {
    myGraph.setSize(300,172);
    myGraph.setPosition(0,64);      
  } else {
    myGraph.setSize(348,200);
    myGraph.setPosition(0,25);
  }
  myGraph.setHiLo(prefHighTarget, prefLowTarget, prefHighLevel, prefLowLevel);
  console.log("Hi/Lo: " + prefHighTarget + "/" + prefLowTarget);
  
  let minval = Math.min.apply(null,testvalues);  
  let maxval = Math.max.apply(null,testvalues);

  // Adding some scaling to ensure that we have at least 3 mmol/L (54/dL) range on the graph to keep it looking smoother.
  while ((maxval - minval) <= 54) {
    if (maxval <= 400) {maxval = maxval + 18;}
    if (minval >= 40) {minval = minval - 18;}
  }
  myGraph.setYRange(minval, maxval);

  // Update Y axis labels
  if (prefBgUnits == "mmol") {
    maxval = mmol(maxval);
    minval = mmol(minval);
    scale1.text = maxval;
    scale2.text = (maxval-(maxval-minval) * 0.25).toFixed(1);
    scale3.text = (maxval-(maxval-minval) * 0.5).toFixed(1);
    scale4.text = (maxval-(maxval-minval) * 0.75).toFixed(1);
    scale5.text = minval;
  } else {
    scale1.text = maxval;
    scale2.text = Math.round(maxval-(maxval-minval) * 0.25);
    scale3.text = Math.round(maxval-(maxval-minval) * 0.5);
    scale4.text = Math.round(maxval-(maxval-minval) * 0.25);
    scale5.text = minval;
  }
  myGraph.update(datavalues);
}

function updateBGPollingStatus() {
  //  console.log("Called Polling Status Update: " + timeCheck);
  let timeCheck = Math.round(Date.now()/1000 -  lastReadingTimestamp);
  var newMissedCounter = parseInt((timeCheck / 60), 10);
    myMissedBGPollCounter.text = newMissedCounter;
    // If it's been > 5 min since last update ask for data.
  if (lastSettingsUpdate < (Date.now()/1000 - 3600)) {
    requestData("Settings");
  }
  if (timeCheck >= 320 && lastSettingsUpdate != 0) {
    requestData("Data");
  }
    
  }

function updateSettings(data) {
  //  console.log("Whatsettings:" + JSON.stringify(settings));
    prefBgUnits = data.settings.bgDataUnits;
    prefHighTarget = data.settings.bgTargetTop;
    prefLowTarget = data.settings.bgTargetBottom;
    prefHighLevel = data.settings.bgHighLevel;
    prefLowLevel = data.settings.bgLowLevel;
    defaultBGColor = data.settings.bgColor;
    myBGUnits.text = prefBgUnits;
    lastSettingsUpdate = Date.now()/1000;
  }

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//
// Messaging related functions/events
//
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
}

messaging.peerSocket.close = () => {
  console.log("App Socket Closed");
}

function requestData(DataType) {
  console.log("Asking for a data update from companion.");
  var messageContent = {"RequestType" : DataType };
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
    console.log("Sent request to companion.");
  } else {
    console.log("companion - no connection");
    me.wakeInterval = 2000;
    setTimeout(function(){messaging.peerSocket.send(messageContent);}, 2500);
    me.wakeInterval = undefined;
  }
}

messaging.peerSocket.onmessage = function(evt) {
  // console.log(JSON.stringify(evt));
  if (evt.data.hasOwnProperty("settings")) {
   // console.log("Triggered watch settings update: " + JSON.stringify(evt.data));
    updateSettings(evt.data)
  } else if (evt.data.hasOwnProperty("bgdata")) {
  //  console.log("Triggered watch data update: " + JSON.stringify(evt.data));
    updategraph(evt.data);
  } else if (evt.data.hasOwnProperty("bgDisplayColor")) {
   // console.log("Triggered watch bgtheme update: " + JSON.stringify(evt.data));
    var newcolor = evt.data.bgDisplayColor;
    defaultBGColor = evt.data.bgDisplayColor;
  } else if (evt.data.hasOwnProperty("theme")) {
   // console.log("Triggered a theme update." + JSON.stringify(evt));
    applyTheme(evt.data.theme.background, evt.data.theme.foreground);
    let json_theme = {"backg": evt.data.theme.background, "foreg": evt.data.theme.foreground};
    fs.writeFileSync("theme.txt", json_theme, "json");
  }
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//
// Vibration handling
//
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

function startAlertProcess(message) {
  showAlert(message);
  startVibration("ping");
  vibrationTimeout = setTimeout(function(){ startVibration("ping"); console.log("triggered vibe by setTimeout"); }, 10000);
}

function startVibration(type) {
  vibration.start(type);
}

function stopVibration() {
  clearTimeout(vibrationTimeout);
  vibration.stop();
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//
// Alert Handling
//
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

let myPopup = document.getElementById("popup");
let btnLeft = myPopup.getElementById("btnLeft");
let btnRight = myPopup.getElementById("btnRight");
let alertHeader = document.getElementById("alertHeader");


function showAlert(message) {
  console.log('ALERT BG')
  console.log(message)
  alertHeader.text = message
  myPopup.style.display = "inline";
 
}

btnLeft.onclick = function(evt) {
  console.log("Snooze 4hr");
  reminderTimer = (Math.round(Date.now()/1000) + 14400); 
  console.log("Sleep until: " + reminderTimer); 
  console.log("Now: " + Math.round(Date.now()/1000));
  stopVibration();
  myPopup.style.display = "none";
}

btnRight.onclick = function(evt) {
  console.log("Snooze 30min");
  reminderTimer = (Math.round(Date.now()/1000) + 1800); 
  console.log("Sleep until: " + reminderTimer); 
  console.log("Now: " + Math.round(Date.now()/1000));
  stopVibration();
  myPopup.style.display = "none";
} 

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//
// Do I need data? functions.
//
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
setInterval(updateBGPollingStatus, 5000);

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//
// Polyfills and generic functions.
//
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = len-1;

      // 6. Repeat, while k < len
      while (k >= 0) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Decrease k by 1.
        k--;
      }

      // 7. Return -1.
      return -1;
    }
  });
}

//Add a rounding function that displays BG values more "nicely".
var myNamespace = {};

myNamespace.round = function(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};
