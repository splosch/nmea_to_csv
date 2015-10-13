# coding=utf-8
#
# Author @Mario Winkler
#
# Take raw NMEA log and strip out everything but GPGGA Senetences
# Main use: recover broken nmea Logs with corrupted EOF

exampleFolder = "conversion_example/"
GPSfile       = "20150917.nmea"
CSVfile       = "example.nmea"

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

for line in fileIn.readlines():
  GPSdataList = line.split(',')

  if (GPSdataList[0] == '$GPGGA') and (GPSdataList[6] != '0'): 	# only one type of nea sentences accepted # no fix (quality), no data ...
	timestamp = GPSdataList[1]
	timeInMs  = getMilliSec(timestamp)
	line += str(timestamp) + ';'
	line += str(timeInMs) + ''
  	fileOut.write(line)

fileIn.close()
fileOut.close()