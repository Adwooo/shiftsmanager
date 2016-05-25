# Shifts Manager
Manager of shifts

short description: this is an app for create and manage working shifts. This app is currently best use with two shifts per day. There are degree of employees - currently 3 - 'Resident', 'Doctor' and 'Associate Professor' and 3 roles of user levels which are - regular, admin adn superadmin. Also there are monopoly hierarchy which is determening when creating the shifts for the month which preferences to take in place from which person. If the person have lower monopoly number her/his preferences will be taken first. Last preferences will be taken in place by the person with the biggest monopoly number. The app is currently translated into two languages english and bulgarian.
 - Feature: Ability to choose which days the worker prefer to take shifts and which days prefer to have break (day or night shift)
 - Feature: When shifts are created user can still change her/his shift by switching the shift with someone else using the 'Change Shift' button at home page.
 - Feature: Ability to use google calendar API and store all shifts there when created.
 - Feature: When creating shifts for the day for all users that have degrees: degree1 - 'Resident' or degree2 - 'Doctor' it is also creating consulting shifts for 1 person per day for all users that have degree: degree2 - 'Doctor' which can be seen on the home page when shifts are created for a month.

You can use the code and reference the owner of the code (me). thanks.

basic usage: 
 1. Fill in in index.html all dependencies (you can see all of them on the bottom of this page)
 2. Fill your firebase and google calendar  /js/app.js - .constant {'BASE_URL': 'FILL_YOUR_FIREBASE_URL', 'API': 'FILL_YOUR_GOOGLE_CALENDAR_API_ID'}
 3. Fill your google calendar API data and refreshToken /calendar/oauth_callback.php (this is an optional step if you want to use google calendar API)
 4. Use the app
 
dependencies that have been used (you can take it from bower):
 - angular
 - angular-cookies
 - angularfire
 - angular-translate
 - angular-translate-handler-log
 - angular-translate-loader-static-files
 - angular-translate-storage-cookie
 - angular-translate-storage-local (this is not used, but it is great if you can use it)
 - bootstrap
 - firebase
 - jquery
 - noty
 - google calendar API (more details how to intall and work with the API from here: https://github.com/wanasit/google-calendar and https://developers.google.com/google-apps/calendar/quickstart/js - at the end of the day you should have a folder call 'vendor' and inside there should be the api. this is one way of doing it, there are other ways as well.)

if you have any issues using this app, please write them at the issue page. thanks!
