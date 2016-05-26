// https://github.com/streamproc/MediaStreamRecorder
var mediaRecorder;
var LiveCall = {
  voice: null,
  initial: function() {

    navigator.getUserMedia = ( navigator.getUserMedia ||
     navigator.webkitGetUserMedia ||
     navigator.mozGetUserMedia ||
     navigator.msGetUserMedia);

    if (navigator.getUserMedia) {
      console.log('getUserMedia supported.');

      var constraints = { audio: true };
      var chunks = [];

      var onSuccess = function(stream) {
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.mimeType = 'audio/ogg; codecs=opus';
        mediaRecorder.audioChannels = 2;

        mediaRecorder.onstop = function() {
          // console.log("data available after MediaRecorder.stop() called.");
          var audio = document.createElement('audio');
          audio.controls = true;
          var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
          chunks = [];
          LiveCall.voice = blob;
        }

        mediaRecorder.ondataavailable = function(e) {
          chunks.push(e.data);
        }
      }

      var onError = function(err) {
        console.log('The following error occured: ' + err);
      }

      navigator.getUserMedia(constraints, onSuccess, onError);
    } else {
     console.log('getUserMedia not supported on your browser!');
   }
 }
};