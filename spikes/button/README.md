# Button and interaction spike
## Function
- The player needs to be able to naturally interact with buttons and other elements.
- The player should be able to press buttons and not need to point lasers from afar.

## Design
- I initially built buttons in the networking spike using [aframe-physics-system](https://github.com/donmccurdy/aframe-physics-system)
  - Cannonjs lock constraints have flexibility, which result in the buttons moving around more than I want them to. They occationally collide with eachother.
  - The way that bounding boxes are constructed around the buttons occationally glitches out and results in a much larger bounding box. I found that it happens rarely on the rift and close to 100% of the time on the quest.
- Going forward, I'm going to raycast from the user's finger. I may use several rays to support different kinds of interaction.
  - A ray from the tip of the finger to -z would help support a poking motion.
  - A ray from the top of the finger to -y would help support a tapping motion.
  - I'm considering other rays, however, poking and tapping appear to be the most natural motions.
- Raycasting also makes it much easier to support desktop mouse, mobile device tap, and gaze based casting.