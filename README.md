Sensor fusion experiment
========

This repo contains a collection of  tools and examples to help me wrappign my head around GIS / GPS / Accelleration data and how to sanitize them

This Demo visualizes GPS readings aquired by a phone to outline GPS coordinate accuracy issues
Demo: http://splosch.github.io/nmea_to_csv/
------


Starting Point (raw smartphone sensor data)
* GPS readings from a NMEA log (/conversion_example/20150917.nmea)
* Accelarometer data (tbd.)

Tools
* Python Script
 * to extract Position, Timing, Altitude
 * sanitize Readings
 * uniform time to ms
 * cal distances based on different algorithms, to compare error
 * spit out a csv file for further analysis
 * spit out a csv file with wgs84 projected xyz(+speed) coordinates
* demo to visualize the xyz(+speed) projection
 * spot misreadings
 * (tbd.) project acceleration vectors
 * (tbd.) compare averaging algorithm
 * (tbd.) compare with accelerometer vector (Kalman Filter for interplation?)


CREDITS
=========
* Visualization http://bl.ocks.org/phil-pedruco/raw/9852362/
* Initial version taken from Phil Pedruco & refactored to split modules out that can be used for data-segment analysis & comparison
* NMEA Parsing heavily inspired by @Ivan Pasic --> http://ipasic.com/article/converting-gps-nmea-data/
* distance calculation formula / script taken from --> http://www.movable-type.co.uk/scripts/latlong.html
