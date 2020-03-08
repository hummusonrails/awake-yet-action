const { Toolkit } = require('actions-toolkit')
const Geocoder = require('node-geocoder');
const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios').default;
const Client = require("@googlemaps/google-maps-services-js").Client;
const client = new Client({api_key: process.env.GOOGLE_API_KEY});
// Create variables for future values
var user = '';
var person = '';
var person_info = '';
var user_location = '';
var body = '';
var issue_number = '';
var date_time = '';
var date_string = '';

// Run your GitHub Action!
Toolkit.run(async tools => {
  // Assign repo data to variables
  const owner = tools.context.payload.repository.owner.login;
  const repo = tools.context.payload.repository.name;
  const actor = tools.context.actor;

  // Events the action is looking for
  const expected_events= ['opened', 'edited', 'reopened', 'created', 'submitted'];

  if (expected_events.includes(tools.context.payload.action) && tools.context.payload.issue) {
    // Issue details
    const action = tools.context.payload.issue.action
    user = tools.context.payload.issue.user
    body = tools.context.payload.issue.body
    issue_number = tools.context.payload.issue.number
  } else if (expected_events.includes(tools.context.payload.action) && tools.context.payload.pull_request) {
  // Pull Request details
    const action = tools.context.payload.pull_request.action
    user = tools.context.payload.pull_request.user
    body = tools.context.payload.pull_request.body
  };

  // Check for string that triggers time check
  body = body.toLowerCase();
  if (body.includes('is') && body.includes('awake?')) {
    // If it does, get user info
    var question = body.substring(
      body.lastIndexOf('is'),
      body.lastIndexOf('awake?')
    );
    var question_arr = question.split(' ');
    person = question_arr[1].replace(/@/g, '');
    person_info = (await tools.github.users.getByUsername({
      username: person
    })).data;

    // Get the location specified in their profile
    user_location = person_info.location;

    // Check if location is defined

    // If it is then gather the time information for it
    if (person_info.location != '' || person_info.location.length != 0) {

      // Get the time in that location, first get lat and long then get the time for those coordinates
      // Set options for the Geocoder
      var options = {
        provider: 'google',
        httpAdapter: 'https',
        apiKey: process.env.GOOGLE_API_KEY,
        formatter: null
      };
      // Initialize the Geocoder with the options and get the data
      var geocoder = Geocoder(options);
      var geocode_data = (await geocoder.geocode(`${user_location}`));


      var timestamp = Math.floor((new Date()).getTime() / 1000);
      const getTimezoneData = () => {
        return axios ({
          method: 'get',
          url: `https://maps.googleapis.com/maps/api/timezone/json?location=${geocode_data[0]['latitude']},${geocode_data[0]['longitude']}&timestamp=${timestamp}&key=${process.env.GOOGLE_API_KEY}`
        })
      }
      timeZoneData = (await getTimezoneData()).data;
      console.log(JSON.stringify(timeZoneData));

      // Assign the date and time in the user's location to the date_time variable
      // date_time = new Date(tz.local_timestamp * 1000);
      // date_string = date_time.toDateString() + ' - ' + date_time.getHours() + ':' + date_time.getMinutes();
      // console.log(tz.local_timestamp)
      // console.log(date_string)

      const responseMsg = `
        Hi there, ${actor}! 👋
        \n
        You asked if ${person} was awake yet. I can't tell you about their personal sleeping habits, sadly.\n
        I can tell you though that the date and time for ${person} is currently:\n
        ${date_string}\n
        I hope that helps clarify the matter for you!
      `;
      await tools.github.issues.createComment({
        owner: owner,
        repo: repo,
        issue_number: issue_number,
        body: responseMsg
      });
    } else {
      // If it is not, formulate a response that lets the questioner know that
      const responseMsg = `
        Sorry, but ${person} did not specify a location in their profile!\n
        I can't look up the time in an undefined location.
      `;
      await tools.github.issues.createComment({
        owner: owner,
        repo: repo,
        issue_number: issue_number,
        body: responseMsg
      });
    };
  };
  tools.exit.success('Completed successfully!')
});
