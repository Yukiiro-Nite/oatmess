# Physics Server
## Function
- Physics should be calculated on the server.
- World state should be broadcasted to users

## Design
- Going to try to use rapier since it is one of the fastest engines around
- Server side physics allow users to throw items to each other

## Development Notes
Rapier uses ES6 import / export syntax. Run `npm run build` and use `./dist/router.js` as the route config in your [express-starter](https://github.com/Yukiiro-Nite/express-starter) https server.