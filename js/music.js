/* ============================================
   MUSIC CONTROLLER
   Auto-play background music with play/stop toggle
   ============================================ */
(function () {
  const audio = document.getElementById('bg-music');
  const btn = document.getElementById('music-toggle');
  const icon = document.getElementById('music-icon');

  if (!audio || !btn || !icon) return;

  let isPlaying = false;

  function play() {
    audio.play().then(function () {
      isPlaying = true;
      icon.textContent = 'volume_up';
      btn.classList.add('playing');
      btn.classList.remove('stopped');
      btn.setAttribute('aria-label', 'Stop music');
    }).catch(function () {
      // Autoplay blocked — will start on first user interaction
    });
  }

  function stop() {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    icon.textContent = 'volume_off';
    btn.classList.remove('playing');
    btn.classList.add('stopped');
    btn.setAttribute('aria-label', 'Play music');
  }

  // Toggle on button click
  btn.addEventListener('click', function () {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  });

  // Attempt autoplay on load
  play();

  // If autoplay was blocked, start on first user interaction anywhere on page
  function startOnInteraction() {
    if (!isPlaying) {
      play();
    }
    document.removeEventListener('click', startOnInteraction);
    document.removeEventListener('touchstart', startOnInteraction);
    document.removeEventListener('keydown', startOnInteraction);
    document.removeEventListener('scroll', startOnInteraction);
  }

  document.addEventListener('click', startOnInteraction);
  document.addEventListener('touchstart', startOnInteraction);
  document.addEventListener('keydown', startOnInteraction);
  document.addEventListener('scroll', startOnInteraction);
})();
