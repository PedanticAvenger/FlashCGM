import { me as device } from "device";

// Screen dimension fallback for older firmware
if (!device.screen) device.screen = { width: 336, height: 336 };

export default class Graph {

  constructor(id) {

    this._id = id;
    this._xscale = 0;
    this._yscale = 0;
    this._xmin = 0;
    this._xmax = 0;
    this._ymin = 0;
    this._ymax = 0;
    this._pointsize = 2;
    this._width = 220;
    this._height = 200;

    this._bg = this._id.getElementById("bg");

    this._vals = this._id.getElementsByClassName("gval");

    this._aHigh = 260;
    this._aLow = 55;

    this._tHighLine = this._id.getElementById("tHigh");
    this._tLowLine = this._id.getElementById("tLow");

    this._defaultYmin = 40;
    this._defaultYmax = 400;

  }

  setPosition(x, y) {
    this._id.x = x;
    this._id.y = y;
  }

  setSize(w, h) {
    this._width = w;
    this._height = h;
  }

  setXRange(xmin, xmax) {

    this._xmin = xmin;
    this._xmax = xmax;
    this._xscale = (xmax - xmin) / this._width;
    // console.log("XSCALE: " + this._xscale);

  }

  setYRange(ymin, ymax) {

    this._ymin = ymin - 1;
    this._ymax = ymax + 1;
    this._yscale = (ymax - ymin) / this._height;
    // console.log("YMIN: "+ ymin);
    // console.log("YMAX: "+ ymax);
    // console.log("YSCALE: " + this._yscale);

  }

  getYmin() {
    return this._ymin + 2;
  }

  getYmax() {
    return this._ymax;
  }

  setBGColor(c) {
    this._bgcolor = c;
    this._bg.style.fill = c;
  }

  setHiLo(ah, al) {
    this._aHigh = ah;
    this._aLow = al;
  }


  update(v) {

    // console.log("Updating Graph...");
    var scalingfactor = 0;
    var redline = this._aHigh + 36;
    //this._bg.style.fill = this._bgcolor;
    if (device.screen.width === 300) {
      scalingfactor = -3;
    } else {
      scalingfactor = -3;
    }
    this._tHighLine.y1 = this._height - ((this._aHigh - this._ymin) / this._yscale) - scalingfactor;
    this._tHighLine.y2 = this._height - ((this._aHigh - this._ymin) / this._yscale) - scalingfactor;
    this._tLowLine.y1 = this._height - ((this._aLow - this._ymin) / this._yscale) - scalingfactor;
    this._tLowLine.y2 = this._height - ((this._aLow - this._ymin) / this._yscale) - scalingfactor;


    // console.log("Low/High/Red: " + this._aLow+"/"+this._aHigh+"/"+ redline);
    for (var index = 0; index < this._vals.length; index++) {

      // console.log(`V${index}: ${v[index].sgv}`);

      // console.log("SGV" + index + ": " + v[index].sgv + " TIME: " + v[index].date);
      //Commented out as I have a fixed view of between 2 and 4 hours, currently 4 hr so x positions fixed. 
      //this._vals[index].cx = this._width - ((v[index]-this._xmin) / this._xscale);

      this._vals[index].cy = this._height - ((v[index] - this._ymin) / this._yscale) - scalingfactor;
      if (v[index] <= this._aLow) {
        this._vals[index].style.fill = "red"
      } else if ((this._aLow < v[index]) && (v[index] <= this._aHigh)) {
        this._vals[index].style.fill = "fb-green";
      } else if ((this._aHigh < v[index]) && (v[index] <= (36 + this._aHigh))) {
        this._vals[index].style.fill = "yellow";
      } else if (redline < v[index]) {
        this._vals[index].style.fill = "red";
      }
      //this._vals[index].cy = this._height - 20;
    }

  }

};
