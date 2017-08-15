# Goal
take GPS Readings from Smartphones and project them onto a XYZ 3D Cube to 
- visualize path
- Data Quality
- visual Outliers detection
- High Speed Sections

# nmea_to_csv
Parse GPGGA sentences in raw *.NMEA log or *.GPX files, correct and enrich readings and store as CSV

## No clue what that means? :)
This Demo displays GPS-Coordinates (here Freeriding Track) in 3D.

### The 3D-Visualization
- Light-Levels indicate Speed (White is VMAX, Black is STOP)
- the red highlighted area is a Range of time-wise adjecent coordinates - This range can be steered by the sliders below.
- its 3D you can turn it :)

### The data
The Python Script `convert_gpx_to_csv.py` converts GPX files to CSV & CSV_XYZ (using WGS84 to xyz projection)
2 Different Ways to estimate the distances are included 
