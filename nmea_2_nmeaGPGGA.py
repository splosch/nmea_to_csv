# coding=utf-8
#
# Author @Mario Winkler
#
# Take raw NMEA log and strip out everything but GPGGA Senetences
# Main use: recover broken nmea Logs with corrupted EOF

# static vars
SEP = ","
NEWLINE = '\n'

exampleFolder = "conversion_example/"
GPSfile       = "20150917.nmea"
CSVfile       = "nmea_to_csv_debug.csv"

# getMilliSec
# hhmmss is a string timestamp of format hhmmss or hhmmss.ss
# 060400      ;0
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

fileIn  = open(exampleFolder + GPSfile, 'r')
fileOut = open(exampleFolder + CSVfile, 'w')

# write CSV header
line  = 'time (ms)' + SEP
line += 'sentence id' + SEP
line += 'time (hhmmss)' + SEP
line += 'lat (deg)' + SEP
line += 'lat type' + SEP
line += 'long (deg)' + SEP
line += 'long type' + SEP
line += 'fix quality' + SEP
line += 'satelites' + SEP
line += 'HDOP' + SEP
line += 'alt' + SEP
line += 'alt unit' + SEP
line += 'h above WGS84' + SEP
line += 'h unit' + SEP
line += SEP +'checksum' + NEWLINE #for debugging reasons transformed the hhmmss time into absolute ms time
fileOut.write(line)

for line in fileIn.readlines():
  GPSdataList = line.split(',')

  # no fix (6), no data ...
  # only one type of nema sentences accepted
  if (GPSdataList[0] == '$GPGGA') and (GPSdataList[6] != '0'):
	timestamp = GPSdataList[1]
	timeInMs  = getMilliSec(timestamp)
	#line += str(timestamp) + SEP
	line = str(timeInMs) + SEP + line
  	fileOut.write(line)

fileIn.close()
fileOut.close()