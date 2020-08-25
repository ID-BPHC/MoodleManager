# CMS Timetable Changes Automation Script

## Setup
### Manual Usage ( Preferred )
* Ensure Node.js is installed
* Change directory to root of this project.
* Run ```npm install```
* Ensure that database passwords and usernames are correct in config.js , use ```config-template.js``` to make ```config.js```
* Ensure TD Database is live.
* Place the required files in the ```uploads``` folder. Which files are required ? See sample in ```uploads-template``` folder.
* There are 2 options either to update the existing Database or to reset the Database
* To reset the Database uncomment the last line of ```scripts/processData.js``` and exectue the file ```scripts/processData.js``` by using ```node uploads/processData```
* To update the Database uncomment the last line of ```scripts/updateData.js``` and exectue the file ```scripts/updateData.js``` by using ```node uploads/updateData```

### GUI ( Web ) Usage 

* Ensure Node.js is installed
* Change directory to root of this project.
* Run ```npm install```
* Ensure that database passwords and usernames are correct in config.js , use ```config-template.js``` to make ```config.js```
* Start the server using ```npm start```
* Open ```http://localhost/port``` in your browser.
* Login and upload the files and wait as they are processed. 

## Credits

Script prepared by Divyanshu Agrawal for Timetable Division.