const hideForOneSecond = function() {
  const target = event.target;
  target.style.visibility = 'hidden';
  setTimeout(function() {
    target.style.visibility = 'visible';
  }, 1000);
};

window.onload = function() {
  const jarImage = document.getElementById('jar');
  jarImage.onclick = hideForOneSecond;
};
