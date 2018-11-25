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
  var percentage = $('#loaded-percentage');
  if(song != null) song.stop();
  
  song = loadSound(videoID, function() {
    btn.attr('disabled', false)
  })
  ;
  song.onended(function(a) {
    btn.attr('disabled', true)
    console.log(a);
  });
  fft = new p5.FFT(0.85, 64);
}

function togglePlayPause() {
  if(song == null) return;

  var btn = $('#btn-play');
  btn.toggleClass('btn-danger', 'btn-success');

  if(btn.hasClass('btn-danger')) { // should say pause && now needs to play.   
    btn.text('Pause');
    song.play();
    song.amp(0.05);
  } else { // should say play && now needs to pause.
    btn.text('Play');
    song.pause();
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
  var green = (energy - 170);
  var blue = (energy - 85);

  green = green < 0 ? 0 : green % 256;
  blue = blue < 0 ? 0 : blue % 256;

  stroke(
    /* red */   energy,
    /* green */ green,
    /* blue */  blue
  );
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

function getMeasurements() {
  return [windowWidth, windowHeight];
}

function error(str) {
  console.log("new error");
  var alert = $("<div role=\"alert\" class=\"alert alert-info div-top-border-1\">" + str + "</div>").appendTo('#alerts');

  setTimeout(function() {
    $('#alerts').remove(alert);
  }, 3000);
}






