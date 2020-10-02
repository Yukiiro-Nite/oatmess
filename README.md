# Joint Bug Example

This is a cut down example of what appears to be a bug with ball joints.

## Getting started
After cloning the project and changing directory to the project, run the following commands.
```
npm install
npm run build
npm start
```

You should now be able to access the demo on http://localhost:3000

## Bug Details
The user can grab and move objects by clicking and dragging with the mouse.

If a user grabs the long yellow object further from the center, the object will shoot off into the distance rapidly.

When a user grabs an object, a ball joint is [created on the server side](src\server\rapier.js#L278).