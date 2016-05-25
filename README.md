# Shifts Manager
Manager of shifts

short description: this is an app for create and manage working shifts. This app is currently best use with two shifts per day. There are degree of employees - currently 3 - 'Resident', 'Doctor' and 'Associate Professor' and 3 roles of user levels which are - regular, admin adn superadmin. Also there are monopoly hierarchy which is determening when creating the shifts for the month which preferences to take in place from which person. If the person have lower monopoly number her/his preferences will be taken first. Last preferences will be taken in place by the person with the biggest monopoly number. 
  Feature: Ability to choose which days the worker prefer to take shifts and which days prefer to have break (day or night shift)
  Feature: When shifts are created user can still change her/his shift by switching the shift with someone else using the 'Change Shift' button at home page.
  Feature: Ability to use google calendar API and store all shifts there when created.
You can use the code and reference the owner of the code (me). thanks.

basic usage: 
 1. Fill your firebase 
 2. Fill your google calendar API refreshToken
 3. Use the app
 
technology that have been used:
 - firebase
 - google calendar API
 - Angularjs (1.5)
 - javascript
 - css/html

if you have any issues using this app, please write them at the issue page. thanks!
