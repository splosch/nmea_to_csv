# coding=utf-8
#
# Author @Mario Winkler
#
# Parse and structure GPS-Data
#   - accept NMEA-Log and generate CSV-Position-Log
#   - calculate distance from Points
#
# Credits
#   - initial version of the parser was heavily inspired by @Ivan Pasic --> http://ipasic.com/article/converting-gps-nmea-data/
#   - distance calculation formula / script taken from --> http://www.movable-type.co.uk/scripts/latlong.html
#
# License (Code and Usage)
# This code is licenced within Creative Commons (Attribution CC BY) --> https://creativecommons.org/licenses/by/4.0/
# You can distribute, remix, tweak, and build upon this work, even commercially, as long as you credit you for the original creation (with name)
#

# Import the pyproj module previously required -- require pyproj https://pypi.python.org/pypi/pyproj/ prerun of &> pip install pyproj
import math
import pyproj

# static vars
SEP = ","
NEWLINE = '\n'

# LatLon with WGS84 datum used by GPS units and Google Earth
wgs84=pyproj.Proj("+init=EPSG:4326")

# helpers

# getMilliSec
# hhmmss is a string timestamp of format hhmmss or hhmmss.ss
def getMilliSec(hhmmss):
  if hhmmss:
    hh = int(hhmmss[0:2])
    mm = int(hhmmss[2:4])
    ss = int(hhmmss[4:6])
    ms = int(hhmmss[7:] or 0) # allow 2 digit ms if present otherwise fallback

    # check wheter there is no 0 timestamp
    if (hh + mm + ss):
      return (hh * 3600 + mm * 60 + ss) * 1000 + ms

  return 0

# rescale float number from source to target coordinate system
# @sval   number the value to be converted           e.g. 25.0
# @source [ min, max ] where min, max of type float  e.g. [0,100]
# @target [ min, max ] where min, max of type float  e.g. [0,30]
# @return target_value as number
# >>> rescale(25.0, [0,100], [0,30])
# >>> 7.5
def rescale(sval, source, target):
  smin, smax = source
  tmin, tmax = target

  sdiff = smax - smin
  tdiff = tmax - tmin

  factor = (sval - smin) / sdiff

  tval = tmin + (factor * tdiff)

  return tval

# Distance of two points on the earth surface
# ‘haversine’ formula isused for a simplified  great-circle distance calculation
# @pointA, pointB --> [lon, lat]
# lat, lon must be decimal degrees
def getDistanceHaversine(p1, p2):
  R  = 6371000    #Earth radius meters

  lat1 = math.radians(p1["lat"])
  lat2 = math.radians(p2["lat"])
  dlat = math.radians(p2["lat"] - p1["lat"])
  dlon = math.radians(p2["lon"] - p1["lon"])

  a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2) * math.sin(dlon/2);
  c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a));

  return R * c;

# Distance of two points on the earth surface
# Spherical Law of Cosines -- explained and talen from --> http://www.movable-type.co.uk/scripts/latlong.html#cosine-law
# @pointA, pointB --> [lon, lat]
# lat, lon must be decimal degrees
def getDistanceCosines(p1, p2):
  R  = 6371000    #Earth radius meters

  lat1 = math.radians(p1["lat"])
  lat2 = math.radians(p2["lat"])
  dlon = math.radians(p2["lon"] - p1["lon"])

  cosines = (math.sin(lat1) * math.sin(lat2) + math.cos(lat1) * math.cos(lat2) * math.cos(dlon))

  #invalid data can cause ABS(...) > 1 which is invalid for acos ... is close to 0 ... so 0-ing
  if (abs(cosines) > 1):
    return 0

  return math.acos(cosines) * R

# require pyproj https://pypi.python.org/pypi/pyproj/ prerun of &> pip install pyproj
exampleFolder = "conversion_example/"
GPSfile       = "example_biking.gpx"
CSVfile       = "example_biking.csv"
XYZfile       = "example_biking_wgs84_xyz.csv"

basetime = 0

refPoint = {"lon":0,"lat":0,"time":0}

fileIn     = open(exampleFolder + GPSfile, 'r')
fileOut    = open(exampleFolder + CSVfile, 'w')
xyzFileOut = open(exampleFolder + XYZfile, 'w')

# write CSV header
line  = 'time (ms)' + SEP
line += 'lon (deg)' + SEP
line += 'lat (deg)' + SEP
line += 'x (wgs84)' + SEP
line += 'y (wgs84)' + SEP
line += 'dist-hav (m)' + SEP
line += 'dist-cos (m)' + NEWLINE
fileOut.write(line)

xyzFileOut.write('x'+SEP+'y'+SEP+'z'+SEP+'data'+NEWLINE)

# example line
# 52.27726836,9.37029613,135.0,13:40:31
for line in fileIn.readlines():
    GPSdataList = line.split(',') # split line by comma to get list of all the values
    timestamp = getMilliSec(GPSdataList[3])  # time in UTC hhmmss.ss has the index 1 in the list # hhmmss.ss -> ms or 0
    longitude = float(GPSdataList[0])  # longitude value has the index 4 in the list
    latitude  = float(GPSdataList[1])  # latitude value has the index 2 in the list

    # keep first relevant timestamp as basetime
    if (not(basetime) and timestamp):
      basetime = timestamp

    #
    x, y = wgs84(longitude, latitude)

    currentPoint = {
      "lon"      : longitude,  # longitude (decimal degrees)
      "lat"      : latitude,  # latitude  (decimal degrees)
      "x"        : x,
      "y"        : y,
      "height"   : float(GPSdataList[2]),
      "time"     : timestamp or refPoint["time"]
    }

    # Compare different distance calculations
    # skip the first measurement
    if (currentPoint["time"] - basetime) == 0:
      distanceHaversine = 0
      distanceCosines   = 0
    else:
      distanceHaversine = getDistanceHaversine(currentPoint, refPoint)
      distanceCosines   = getDistanceCosines(currentPoint, refPoint)

    currentPoint["speed"] = distanceHaversine * 3.6

    # don't write duplicates
    if not (currentPoint["time"] == refPoint["time"]):
      line  = str(currentPoint["time"] - basetime) + SEP
      line += str(currentPoint["lon"]) + SEP
      line += str(currentPoint["lat"]) + SEP
      line += str(currentPoint["x"]) + SEP
      line += str(currentPoint["y"]) + SEP
      line += str(distanceHaversine) + SEP
      line += str(distanceCosines) + NEWLINE

      scaledSpeed = rescale(currentPoint["speed"], [0,40], [0,1]);

      # rescaling with [0,1] s target system is done to create a factor to be applied
      # for printing the xyz points within a 3d box
      # a 0.1 difference of two points in x direction is not equal to a 0.1 difference in y or z direction
      xyzLine  = str(currentPoint["x"]) + SEP
      xyzLine += str(currentPoint["height"]) + SEP
      xyzLine += str(currentPoint["y"]) + SEP
      xyzLine += str(scaledSpeed) + NEWLINE

      fileOut.write(line)
      xyzFileOut.write(xyzLine)
      # keep current point for next iteration as reference point
      refPoint = currentPoint

fileIn.close()
fileOut.close()