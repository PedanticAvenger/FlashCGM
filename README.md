# FlashCGM
Repository of work to alter Fitbit Ionic Flashring Watch Face to support Blood Glucose data display from XDrip+/Spike/etc. and directly from nightscout sites.

Design Goals:
   1) Perform as much processing on phone companion app as possible to maintain watch battery life.
   2) Provide at-a-glance info about current BG, trend, and polling status.
   3) Tap BG Value to view chart of last 4 hours (48 readings) graphically.  Tap to return.
   4) Units, High/Low limits, Target High/Low limits for alerts all configured on watch face to reduce polling and battery use.

Current Watch Face Status:
Screens currently look as follows. Tap the upper right box of main display to get to graph, anywhere on graph to get back to main.
This is a v1.0 release and any v0.9 faces WILL have to redo settings for the watch to work.  Settings are simpler now and only require the preferences and the URL to your sgv.json on data source to work. 

Ionic Main: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/WebContent/FlashCGM-Ionic-Main.png">
Ionic Graph: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/WebContent/FlashCGM-Ionic-Graph.png">
Ionic Alert: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/WebContent/FlashCGM-Ionic-Alert.png">


Versa Main: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/WebContent/FlashCGM-Versa-Main.png">
Versa Graph: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/WebContent/FlashCGM-Versa-Graph.png">
Versa Alert: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/WebContent/FlashCGM-Versa-Alert.png">


Versa Lite Main: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/WebContent/FlashCGM-VLite-Main.png">
Versa Lite Graph: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/WebContent/FlashCGM-VLite-Graph.png">
Versa Lite Alert: <img align="middle" src="https://github.com/PedanticAvenger/FlashCGM/blob/master/WebContent/FlashCGM-VLite-Alert.png">
