var song;
var fft;
var font;

$(document).ready(function() {
  $('#btn-load').click(loadSongEvent);
  $('#btn-play').attr('disabled', true);
  $('#btn-play').click(playPauseSongEvent);
});

function setup() {
  createCanvas(windowWidth, windowHeight).parent('#canvas');

  strokeWeight(4);
  fill('#FFFFFF');
  font = loadFont('copse.ttf');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function managePlayButton(disable = false) {
  var btn = $('#btn-play');
  
  if(disable) {
    btn.removeClass('btn-danger');
    btn.addClass('btn-success');
    btn.text('Play');
    btn.attr('disabled', true);

    return;
  }

  var playing = song.isPlaying();
    
  if(playing) {
    btn.text('Pause');
    btn.removeClass('btn-success');
    btn.addClass('btn-danger');
  } else {
    btn.text('Play');
    btn.removeClass('btn-danger');
    btn.addClass('btn-success');
  }
}

function loadSongEvent() {
  var url = $('#input-url').val();

  if(songLoaded()) {
    song.stop();
  }

  song = loadSound(url, function() {
    $('#btn-play').attr('disabled', false);
  });

  song.onended(function(a) {
    managePlayButton(!a._paused);

    if(!a._paused) {
      song = null;
      fft = null;
      managePlayButton(true);
    }
  });

  song.amp(0.05);
  fft = new p5.FFT(0.84, 64);
}

function playPauseSongEvent() {
  playing = song.isPlaying();

  if(playing) {
    song.pause();
  } else {
    song.play();
    $('html, body').animate({scrollTop: $('#canvas').offset().top}, 'slow');
  }

  managePlayButton();
}

function currentTime() {
  if(!songLoaded()) return 0;
  var time = song.currentTime();

  minutes = Math.floor(time / 60);
  seconds = Math.floor(time % 60);

  return minutes + " mins " + seconds + " secs";
}

function displayText(str, x, y, size) {
  strokeWeight(1);

  textFont(font, size);
  text(str, x, y);

  strokeWeight(4);
}

function songLoaded() {
  return song != null && fft != null;
}

function draw() {
  background(0);

  if(!songLoaded()) {
    textAlign(CENTER, CENTER);
    displayText("Choose a song!", windowWidth / 2, windowHeight / 2, 45);
    textAlign(LEFT, CENTER);

    return;
  }

  displayText(currentTime(), 20, 50, 30);
  applyStroke(fft.getEnergy("bass"));

  var analysis = fft.analyze();
  for(var i = 0; i < analysis.length; ++i) {
    var amplitude = analysis[i];
    if(amplitude == 0) continue;

    var x = (i + 1) * (windowWidth / analysis.length);
    var y2 =  windowHeight - (amplitude * (windowHeight / 255));

    line(x, windowHeight, x, y2);
  }
}

function applyStroke(energy) {
  colorMode(HSB);

  let hue = 1.4117647059 * energy;
  stroke(hue, 100, 100, 1);

  /*
  This is a shortcut method using the HSB (Hue, Saturation, Brightness) colour mode
  compared to the previous method of making a colour selector algorithm...

  The factor 1.41176... is calculated by doing (360 / 255) as 360 is the maximum H value
  for HSB and 255 is the maximum energy value.
  */
}