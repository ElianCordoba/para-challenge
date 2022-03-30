# Activity summarization take home

Thanks for taking the time to interview with Para! We're very excited to see a small portion of what you can do with this takehome.

# Background
Para is building to help gigworkers better manage their lives. A key part of how we do that is by digesting information about their gig work (across many platforms) so we can surface to them aggregated insights. This can be answering some very simple questions like:
 - How much did I make across all platforms in the last day/week/month? 
 - How many rides did I do in the last day/week/month? 
 - What % of the time I’m working am I actively doing a job? Is this % different based on location?
 - What is my average $/hr? 

# Prompt - Part 1
We’re going to build an API that can collect information about gigwork done and answer some of those questions for a user. You can build this API from scratch, or use the skeleton we’ve prepared for you in this repo. 

Specifically, your REST API server should have the following endpoints:
 - POST `/delivery` which accepts in the body information about a delivery (driver_id, order accept time, customer name, business name, base pay, order subtotal, driver tip, and platform, pickup time, dropoff time)
 - GET `/driver/:driverId/delivery` returns all delivery id’s of deliveries made by the driver (you can ignore pagination)
 - PATCH `/driver/:driverId` with body {“isActive”: true | false, timestamp} to track when a driver is available for offers vs not available for offers. The timestamp field is optional - if missing, the backend uses the current time as the event timestamp. 
 - GET `/driver/:driverId/delivery?summary=1` should return the number of deliveries done by the driver + miles traveled + earnings made daily, weekly, and monthly for the last 2 months. Note summary is a query parameter here. 
 - GET `/driver/:driverId?summary=1` should return the following stats for each day, week, and month the driver was active:
   - numHours (number of hours active)
   - hourlyRate(amount earned / hours active)
   - utilizationRate (number of hours a driver was delivering something divided by the number of overall hours the driver was active) 

Once you’re done, please share your git repo with `cmishra` on Github and include instructions on the `readme.md` on how I can run it (if you don't build from this repo). 

A few notes to keep in mind as you’re implementing:
 - Please use a DB (either the in-memory one we provide or another one you connect)
 - Aim for reasonably clean code / a reasonably simple architecture - similar to what a ~10-50 person engineering team would have 
 - The coding style you use (OOP vs functional vs other) is up to you - bonus points in part 2 if you can tell us what conventions you followed and why 
 - We would recommend implementing some tests to help you make sure you’ve done the assignment correctly - but how much is up to you. It’s okay if minor edge cases sneak through - but it would be ideal to catch glaring / significant problems before submission 

# Prompt - Part 2 
There’s no coding in this part! We just want to understand how you would turn your app into something that’s ready for production. It’s totally okay for any of these questions if you don’t know exactly how you’d do it. It’s also okay if you’re not sure for any of the questions exactly how to do it – google a few things, and just list how you would go about exploring that topic. On the flip side, if you’re an expert in something, give us as many details as you think helps understand why you would do things a particular way. 

Specifically, we’d want to hear:
 - @ the code:
   - What about your implementation would you change before production? What additional tools, practices, monitoring, logging would you want to put in place? 
   - Would middleware would you want to add to your API server - or, if you would change API servers, which one would you go to? 
 - @ testing:
   - What testing frameworks should be used for unit tests? What about integration tests? 
   - What should be mocked? What shouldn't? 
   - What test did you implement? What additional tests would you want to see before this goes to prod? 
 - @ databases:
   - What database should we use for this type of app? 
   - Should we use the same data model that you designed or change it somehow? 
 - @ CI / CD:
   - What should the CI (continuous integration) process look like for this app? 
   - What checks should we ensure pass before letting the code merge? 
   - How should we trigger a deploy? 
   - How should we deploy the app? What are the tradeoffs between the different options? 



### To get started

Ensure you have node / nvm / npm installed. I have versions v12.22.7, 6.14.15, and 0.34.0 respectively - but feel free to use other versions. Making code changes or upgrading dependencies so you can use newer versions in your environment is totally fine.

Once your node environment is set up, fork this repo to get started with the assignment! Run `npm install` once you to do install the dependencies and `npm start` to run the server.

You can run some basic tests with `npm test`. Once submitted, we'll test this code more exhaustively and get back to you with feedback!

### Design

This repo is a fairly minimalist express.js REST API app with [NeDB](https://www.npmjs.com/package/@seald-io/nedb). NeDB is "sqlite for mongodb". In this mock, we've configured it to only store data in-memory (aka if you restart the server, the DB is cleared), but disk persistance (along with many other persistance models) are supported. ES6 syntax is supported via babel. 

Please refer to the google doc you were sent for specific instructions on what you should build and how you should build it! Only basic instructions on how to run this express server and test it are located in this readme!

Please fork this repo and push your changes to your own fork. Share your repo with `cmishra` (Chetan's Github ID) so he can see your work! 

As you are doing your assignment, please feel free to change or extend anything that is set up here like (but not limited to):
 - use reasonML / reason / TS instead of ES6 JS 
 - postgres / mongodb / any other DB instead of NeDB
 - nest.js / alternative API framework instead of express.js 
 - add request validation middleware or move basicIntegrationTest.js's tests into a testing framework 

In part 2 of the assignment, you can talk about things you'd want to change (without actually implementing the change) for bonus points. You could actually implement some of these changes if it's helpful for you to finish part 1 -- but there's no _extra_ bonus points from the implementation. Telling us about it is enough. 
