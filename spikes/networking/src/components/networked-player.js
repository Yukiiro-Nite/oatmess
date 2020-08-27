AFRAME.registerSystem('networked-player', {
  schema: {},
  init: function () {
    this.socket = io()
  },
});