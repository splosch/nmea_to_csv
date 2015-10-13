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

import math

# static vars
SEP = ","
NEWLINE = '\n'

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
GPSfile       = "20150917.nmea"
CSVfile       = "20150917_GPGGA_converted.csv"

basetime = 0

refPoint = {"lon":0,"lat":0,"time":0}

fileIn  = open(exampleFolder + GPSfile, 'r')
fileOut = open(exampleFolder + CSVfile, 'w')

# write CSV header
line  = 'time (ms)' + SEP
line += 'lon (deg)' + SEP
line += 'lat (deg)' + SEP
line += 'dist-hav (m)' + SEP
line += 'dist-cos (m)' + NEWLINE
fileOut.write(line)

for line in fileIn.readlines():
    GPSdataList = line.split(',') # split line by comma to get list of all the values
    if (GPSdataList[0] == '$GPGGA') and (GPSdataList[6] != '0'):  # Validate Sentence-Type and fix-qualtiy parsing
        timestamp = getMilliSec(GPSdataList[1])  # time in UTC hhmmss.ss has the index 1 in the list # hhmmss.ss -> ms or 0
        longitude = GPSdataList[4]  # longitude value has the index 4 in the list
        latitude  = GPSdataList[2]  # latitude value has the index 2 in the list

        # keep first relevant timestamp as basetime
        if (not(basetime) and timestamp):
          basetime = timestamp

        # Change latitue and longitude to decimal degrees format
        degrees_lon  = float(longitude[:3] or 0)
        fraction_lon = float(longitude[3:] or 0) / 60
        degrees_lat  = float(latitude[:2] or 0)
        fraction_lat = float(latitude[2:] or 0) / 60

        currentPoint = {
          "lon" : degrees_lon + fraction_lon,  # longitude (decimal degrees)
          "lat" : degrees_lat + fraction_lat,   # latitude (decimal degrees)
          "time": timestamp or refPoint["time"]
        }

        # Compare different distance calculations
        # skip the first measurement
        if (currentPoint["time"] - basetime) == 0:
          distanceHaversine = 0
          distanceCosines   = 0
        else:
          distanceHaversine = getDistanceHaversine(currentPoint, refPoint)
          distanceCosines   = getDistanceCosines(currentPoint, refPoint)

        # don't write duplicates
        if not (currentPoint["time"] == refPoint["time"]):
          line  = str(currentPoint["time"] - basetime) + SEP
          line += str(currentPoint["lon"]) + SEP
          line += str(currentPoint["lat"]) + SEP
          line += str(distanceHaversine) + SEP
          line += str(distanceCosines) + NEWLINE

          fileOut.write(line)
          # keep current point for next iteration as reference point
          refPoint = currentPoint

fileIn.close()
fileOut.close()