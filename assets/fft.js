const k = 1.41176470588235294117;
const smoothing = 0.84;

var song;
var fft;
var font;

var title;
var loadButton;
var playButton;
var songInput;
var colourAffectable;
var loopOption;
var smoothingSlider;

$(document).ready(function() {
  title = $('#title');
  loadButton = $('#btn-load');
  playButton = $('#btn-play');
  songInput = $('#input-url');
  colourAffectable = $('.colour-affectable');
  loopOption = $('#loop');

  playButton.attr('disabled', true);
  playButton.click(playPauseSongEvent);
  loadButton.click(loadSongEvent);
  loopOption.bootstrapToggle({on: 'Looping?', off: 'Looping?'});
  loopOption.bootstrapToggle('disable');
  loopOption.prop('checked', false).change()
  loopOption.change(toggleLoopEvent);
});

function setup() {
  createCanvas(windowWidth, windowHeight).parent('#canvas-parent');

  colorMode(HSB);
  strokeWeight(4);
  fill('#FFFFFF');
  font = loadFont('copse.ttf');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function managePlayButton(disable = false) {
  if(disable) {
    playButton.removeClass('btn-danger');
    playButton.addClass('btn-success');
    playButton.text('Play');
    playButton.attr('disabled', true);

    return;
  }

  if(song.isPlaying()) { // Now it's going to play.
    playButton.text('Pause');
    playButton.removeClass('btn-success');
    playButton.addClass('btn-danger');

    title.text('Audio Visualiser');
  } else { // Now it's paused.
    playButton.text('Play');
    playButton.removeClass('btn-danger');
    playButton.addClass('btn-success');

    title.text('Paused');
  }
}

function toggleLoopEvent() {
  if(songLoaded()) {
	song.setLoop(!song.isLooping());
  }
}

function loadSongEvent() {
  if(songLoaded()) {
    song.stop();
  }

  title.text('Loading...');

  song = loadSound(songInput.val(), function() {
    playButton.attr('disabled', false);
	loopOption.attr('disabled', false);
    title.text('Ready!');
  });

  song.onended(function(a) {
	if(!a._paused) {
      song = null;
      fft = null;
    }
	
    managePlayButton(!a._paused);
	loopOption.attr('disabled', !a._paused);
  });

  song.amp(0.05);
  fft = new p5.FFT(smoothing, 64);
}

function playPauseSongEvent() {
  playing = song.isPlaying();

  if(playing) {
    song.pause();
  } else {
    song.play();
    $('html, body').animate({scrollTop: $('#canvas-parent').offset().top}, 'slow');
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
  return (song != null && fft != null);
}

function draw() {
  background(0);

  if(!songLoaded()) {
    textAlign(CENTER, CENTER);
    displayText("Choose a song!", windowWidth / 2, windowHeight / 2, 45);
    textAlign(LEFT, CENTER);

    return;
  }

  applyStroke(fft.getEnergy("bass"));
  displayText(currentTime(), 20, 50, 30);

  var analysis = fft.analyze();

  for(var i = 0; i < analysis.length; i++) {
    var amplitude = analysis[i];
    if(amplitude == 0) continue;

    var x = (i + 1) * (windowWidth / analysis.length);
    var y2 =  windowHeight - (amplitude * (windowHeight / 255));

    line(x, windowHeight, x, y2);
  }
}

function applyStroke(energy) {
  if(songLoaded() && song.isPlaying()) {
    let hue = k * energy;

    stroke(hue, 100, 100, 1);
    colourAffectable.css({'color': 'hsl(' + hue + ', 100%, 50%)'});
  } else {
    colourAffectable.css({'color': 'hsl(0, 0%, 100%)'});
  }
}