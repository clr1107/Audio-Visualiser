var song;
var fft;
var font;

$(document).ready(function() {
  $('#btn-load').click(loadSong);
  $('#btn-play').click(togglePlayPause);
});

function setup() {
	var measurements = getMeasurements();

  createCanvas(measurements[0], measurements[1]).parent('#canvas');
  strokeWeight(4);

  font = loadFont('copse.ttf');
}

function windowResized() {
	var measurements = getMeasurements();
  resizeCanvas(measurements[0], measurements[1]);
}

function loadSong() {
  var videoID = $('#input-youtube-url').val();
  var btn = $('#btn-play');
  if(song != null) stopSong();
  song = loadSound(videoID);

  song.onended(function(a) {
    var btn = $('#btn-play');

    btn.text('Play');
    btn.removeClass('btn-danger');
    btn.addClass('btn-success');

    btn.attr('disabled', a._paused);
  });

  fft = new p5.FFT(0.85, 64);
}

function togglePlayPause() {
  if(song == null) return;

  if($('#btn-play').hasClass('btn-success')) {
    playSong();
  } else {
    pauseSong();
  }
}

function draw() {
  background(0);

  if(fft == null) {
    textAlign(CENTER, CENTER);
    displayText("Choose a song!", windowWidth / 2, windowHeight / 2, 45);

    textAlign(LEFT, CENTER);
    return;
  }

  displayText(currentTime(), 20, 50, 30);
  var analysis = fft.analyze();
  var energy = fft.getEnergy("bass");

  for(var i = 0; i < analysis.length; ++i) {
    var length = analysis.length;
    var amplitude = analysis[i];

    if(amplitude == 0) continue;

    var x = (i + 1) * (windowWidth / length);
    var y2 =  windowHeight - (amplitude * (windowHeight / 255));

    applyStroke(energy);
    line(x, windowHeight, x, y2);
  }
}

function applyStroke(energy) {
  var red = 255;
  var green = 0;
  var blue = 0;

  var value = energy * 6;
  green += value;
  
  if(green > 255) {
    green = 255;
    value = value - 255;

    red -= value;
  }

  if(red < 0) {
    red = 0;
    value = value - 255;

    blue += value;
  }

  if(blue > 255) {
    blue = 255;
    value = value - 255;

    green -= value;
  }

  if(green < 0) {
    green = 0;
    value -= 255;

    red += value;
  }

  if(red > 255) {
    red = 255;
    value -= 255;

    blue -= value;
  }


  stroke(red, green, blue);
}

function currentTime() {
  if(song == null) return 0;
  var time = song.currentTime();

  minutes = Math.floor(time / 60);
  seconds = Math.floor(time % 60);

  return minutes + " mins " + seconds + " secs";
}

function displayText(str, x, y, size) {
  fill('#FFFFFF');
  stroke('#FFFFFF');
  strokeWeight(1);

  textFont(font, size);
  text(str, x, y);

  strokeWeight(4);
}

function stopSong() {
  if(song == null) return;

  song.stop();
  song = null;
}

function pauseSong() {
  if(song == null) return;

  song.pause();
}

function playSong() {
  if(song == null) return;

  song.play();
  song.amp(0.05);

  var btn = $('#btn-play');
  btn.text('Pause');
  btn.removeClass('btn-success');
  btn.addClass('btn-danger');
  btn.attr('disabled', false);
}

function getMeasurements() {
  return [windowWidth, windowHeight];
}