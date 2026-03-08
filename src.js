let currentSong = new Audio();
let songsData = []; // Store songs data globally
let currentSongName = ''; // Track current song name
let currentIndex = 0;
let currentFolder = 'songs'; // Track current folder

let videoSongs = [
  { name: "God's Masterpiece", url: 'https://youtu.be/oRX6_x7y_lo?si=MeGk6NrMdQUHeOwQ' }
]




const playMusik = (track) => {
  currentSong.src = `/${currentFolder}/${track}`;
  currentSongName = track; // Store current song name
  
  currentIndex = songsData.findIndex(song => song === track);
  console.log("Current index updated to:", currentIndex, "for song:", track);
  
  currentSong.play().catch(err => console.error("Error playing song:", err));
  
  const playbarSongInfo = document.querySelector(".playbar .songInfo");
  if (playbarSongInfo) {
    playbarSongInfo.innerHTML = track;
  }
  
  const playBtnImg = document.getElementById("btnImg");
  if (playBtnImg) {
    playBtnImg.src = 'resourses/pause.svg';
  }
}

function playPrevious() {
  if (songsData.length > 0) {
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = songsData.length - 1;
    }
    playMusik(songsData[prevIndex]);
  }
}

function playNext() {
  if (songsData.length > 0) {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= songsData.length) {
      nextIndex = 0;
    }
    playMusik(songsData[nextIndex]);
  }
}

function setupNavigationListeners() {
  const hamburger = document.querySelector("#hamburger");
  const closeButton = document.querySelector(".closeCont");
  const leftPanel = document.querySelector(".left");

  if (hamburger && leftPanel) {
    hamburger.addEventListener('click', () => {
      leftPanel.style.left = "0";
    });
  }

  if (closeButton && leftPanel) {
    closeButton.addEventListener('click', () => {
      leftPanel.style.left = "-100%";
    });
  }
}

function setupCardListeners() {
  const cards = document.querySelectorAll('.card');
  
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      const folders = [
        'songs/cs',
        'songs/rock',
        'songs/pop',
        'songs/mala'
        
      ];
      const folderToLoad = folders[index] || 'songs';
      loadMusicFolder(folderToLoad);
      const mainHeading = document.getElementById('main-h1');
      if (mainHeading) {
        const folderNames = ['Mr Chatman', 'Rock Songs', 'Pop Songs', 'All Songs'];
        mainHeading.textContent = folderNames[index] || 'Songs';
      }
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });
}

function getSongs(folder = 'songs') {
  currentFolder = folder;
  let endpoint;
  if (folder === 'songs') {
    endpoint = '/songs';
  } else {
    const folderName = folder.split('/').pop();
    endpoint = `/songs/${folderName}`;
  }
  fetch(endpoint)
    .then(res => res.json())
    .then(data => {
      songsData = data;
      const songsUl = document.querySelector('.songsList').getElementsByTagName("ul")[0];
      songsUl.innerHTML = '';
      for (const song of data) {
      // <div>Produced by Fasol</div>
        songsUl.innerHTML += ` <li>
                            <img class="invert" src="https://raw.githubusercontent.com/warisnew2121-pixel/music-app/refs/heads/main/resourses/musik.svg">
                            <div class="songInfo">
                                <div>${song}</div>
                            </div>
                            <div class="playCont">
                                <div class="playNow">
                                    <span>Play Now</span>
                                    <img class="invert" src="https://raw.githubusercontent.com/warisnew2121-pixel/music-app/refs/heads/main/resourses/play-button.svg">
                                </div>
                            </div>
                        </li>`;
      }
      Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach((listItem, index) => {
        const playButton = listItem.querySelector(".playNow");
        const songName = listItem.querySelector(".songInfo").firstElementChild.innerHTML.trim();
        playButton.addEventListener("click", () => {
          playMusik(songName);
        });
      });
      setupPlaybarListeners(data);
    })
    .catch(err => {
      const songsUl = document.querySelector('.songsList').getElementsByTagName("ul")[0];
      songsUl.innerHTML = '<li style="color: #ff6b6b; padding: 20px;">Error loading songs from this folder</li>';
    });
}

function setupPlaybarListeners(data) {
  const playBtn = document.getElementById("playBtn");
  if (playBtn) {
    const newPlayBtn = playBtn.cloneNode(true);
    playBtn.parentNode.replaceChild(newPlayBtn, playBtn);
    newPlayBtn.addEventListener("click", () => {
      if (currentSong.paused) {
        if (currentSong.src) {
          currentSong.play();
          document.getElementById("btnImg").src = 'https://raw.githubusercontent.com/warisnew2121-pixel/music-app/refs/heads/main/resourses/pause.svg';
        } else if (data.length > 0) {
          playMusik(data[0]);
        }
      } else {
        currentSong.pause();
        document.getElementById("btnImg").src = 'https://raw.githubusercontent.com/warisnew2121-pixel/music-app/refs/heads/main/resourses/play-button.svg';
      }
    });
  }
  currentSong.removeEventListener("timeupdate", updateTimeDisplay);
  currentSong.removeEventListener("ended", handleSongEnd);
  currentSong.addEventListener("timeupdate", updateTimeDisplay);
  currentSong.addEventListener("ended", handleSongEnd);
  setupControlButtons();
  setupVolumeControl();
  setupSeekBar();
}

function updateTimeDisplay() {
  const playbarSongInfo = document.querySelector(".playbar .songDetail");
  const songTime = document.querySelector(".songTime");
  const seekBar = document.querySelector(".seekBar");
  const seekCircle = document.querySelector(".seekCircle");
  
  if (playbarSongInfo && currentSongName) {
    playbarSongInfo.innerHTML = currentSongName;
  }
  
  if (songTime) {
    const currentTime = Math.floor(currentSong.currentTime);
    const duration = Math.floor(currentSong.duration) || 0;
    const currentMin = Math.floor(currentTime / 60);
    const currentSec = currentTime % 60;
    const durationMin = Math.floor(duration / 60);
    const durationSec = duration % 60;
    songTime.innerHTML = `${currentMin}:${currentSec.toString().padStart(2, '0')} / ${durationMin}:${durationSec.toString().padStart(2, '0')}`;
  }
  
  // Update seekbar progress with sunset gradient
  if (seekBar && currentSong.duration) {
    const percent = (currentSong.currentTime / currentSong.duration) * 100;
    seekBar.style.setProperty('--seek-percent', percent + '%');
    
    if (seekCircle) {
      seekCircle.style.left = percent + "%";
      
      // Add playing animation
      if (!currentSong.paused) {
        seekCircle.classList.add('playing');
      } else {
        seekCircle.classList.remove('playing');
      }
    }
  }
}

function handleSongEnd() {
  playNext();
}

function setupControlButtons() {
  const songControls = document.querySelector('.songControlls');
  if (!songControls) return;
  const controlImages = songControls.querySelectorAll('img');
  controlImages.forEach((img) => {
    const newImg = img.cloneNode(true);
    img.parentNode.replaceChild(newImg, img);
  });
  const newControlImages = songControls.querySelectorAll('img');
  newControlImages.forEach((img, index) => {
    if (img.src.includes('previuse.svg')) {
      img.addEventListener("click", () => {
        playPrevious();
      });
    } else if (img.src.includes('next.svg')) {
      img.addEventListener("click", () => {
        playNext();
      });
    }
  });
}

function setupVolumeControl() {
  const volInput = document.querySelector(".volDiv input");
  if (volInput) {
    const newVolInput = volInput.cloneNode(true);
    volInput.parentNode.replaceChild(newVolInput, volInput);
    newVolInput.addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100
      if (currentSong.volume > 0) {
        document.querySelector(".volDiv img").src = document.querySelector(".volDiv img").src.replace("mute.svg", "volume.svg")
      }
    });
  }
}

function setupSeekBar() {
  const seekBar = document.querySelector(".seekBar");
  if (seekBar) {
    const newSeekBar = seekBar.cloneNode(false);
    seekBar.parentNode.replaceChild(newSeekBar, seekBar);
    
    // Recreate seekCircle inside
    const seekCircle = document.createElement('div');
    seekCircle.className = 'seekCircle';
    newSeekBar.appendChild(seekCircle);
    
    newSeekBar.addEventListener("click", e => {
      let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
      seekCircle.style.left = percent + "%";
      newSeekBar.style.setProperty('--seek-percent', percent + '%');
      currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });
  }
}

function loadMusicFolder(folderName) {
  getSongs(folderName);
}

document.addEventListener('DOMContentLoaded', () => {
  setupNavigationListeners();
  setupCardListeners();
  getSongs();
  setupVideoSection();
});

// ─────────────────────────────────────────
//  VIDEO SECTION
// ─────────────────────────────────────────

function setupVideoSection() {
  // Inject "Videos" card into existing cardContainer
  const cardContainer = document.querySelector('.cardContainer');
  if (cardContainer) {
    const videoCard = document.createElement('div');
    videoCard.className = 'card video-card';
    videoCard.id = 'videoAlbumCard';
    videoCard.innerHTML = `
      <div class="play">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
      </div>
      <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=200&fit=crop" alt="Music Videos">
      <h1>Music Videos</h1>
      <p>Watch video albums</p>
    `;
    cardContainer.appendChild(videoCard);
    videoCard.addEventListener('click', openVideoPopup);
  }

  // Inject popup HTML into body
  const popup = document.createElement('div');
  popup.id = 'videoPopup';
  popup.innerHTML = `
    <div id="videoPopupInner">
      <div id="videoPopupHeader">
        <span id="videoPopupTitle">🎬 Music Videos</span>
        <button id="videoPopupClose">✕</button>
      </div>
      <div id="videoPopupBody">
        <div id="videoPlayerWrap">
          <iframe
            id="videoPlayer"
            src=""
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
          ></iframe>
          <div id="videoNowPlaying"></div>
        </div>
        <ul id="videoSongList"></ul>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #videoPopup {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      z-index: 9999;
      align-items: center;
      justify-content: center;
    }
    #videoPopup.open { display: flex; }
    #videoPopupInner {
      background: #1a1a1a;
      border-radius: 14px;
      width: 90%;
      max-width: 820px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 40px rgba(0,0,0,0.7);
    }
    #videoPopupHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: #111;
      border-bottom: 1px solid #333;
    }
    #videoPopupTitle {
      color: #fff;
      font-size: 1.1rem;
      font-weight: 600;
    }
    #videoPopupClose {
      background: none;
      border: none;
      color: #aaa;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.2s;
    }
    #videoPopupClose:hover { background: #333; color: #fff; }
    #videoPopupBody {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    #videoPlayerWrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #000;
      min-width: 0;
    }
    #videoPlayer {
      width: 100%;
      aspect-ratio: 16/9;
      border: none;
    }
    #videoNowPlaying {
      color: #ccc;
      font-size: 0.85rem;
      padding: 10px 16px;
      background: #111;
      min-height: 36px;
    }
    #videoSongList {
      width: 230px;
      min-width: 180px;
      overflow-y: auto;
      background: #161616;
      list-style: none;
      margin: 0;
      padding: 8px 0;
      border-left: 1px solid #2a2a2a;
    }
    #videoSongList li {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      color: #ccc;
      cursor: pointer;
      font-size: 0.88rem;
      border-bottom: 1px solid #222;
      transition: background 0.15s;
    }
    #videoSongList li:hover { background: #252525; color: #fff; }
    #videoSongList li.active { background: #2a2a2a; color: #fff; }
    #videoSongList li .vid-icon { font-size: 1.1rem; flex-shrink: 0; }
    @media (max-width: 600px) {
      #videoPopupBody { flex-direction: column; }
      #videoSongList { width: 100%; border-left: none; border-top: 1px solid #2a2a2a; max-height: 180px; }
    }
  `;
  document.head.appendChild(style);

  // Close popup on button or backdrop click
  document.getElementById('videoPopupClose').addEventListener('click', closeVideoPopup);
  popup.addEventListener('click', (e) => {
    if (e.target === popup) closeVideoPopup();
  });
}

function openVideoPopup() {
  const popup = document.getElementById('videoPopup');
  const list = document.getElementById('videoSongList');
  list.innerHTML = '';

  videoSongs.forEach((video, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="vid-icon">▶</span><span>${video.name}</span>`;
    li.addEventListener('click', () => playVideoSong(video, li));
    list.appendChild(li);
  });

  // Auto-play first video
  if (videoSongs.length > 0) {
    playVideoSong(videoSongs[0], list.firstChild);
  }

  popup.classList.add('open');
}

function closeVideoPopup() {
  const popup = document.getElementById('videoPopup');
  popup.classList.remove('open');
  // Stop video on close
  document.getElementById('videoPlayer').src = '';
  document.getElementById('videoNowPlaying').textContent = '';
}

function playVideoSong(video, listItem) {
  // Highlight active item
  document.querySelectorAll('#videoSongList li').forEach(li => li.classList.remove('active'));
  if (listItem) listItem.classList.add('active');

  // Convert YouTube watch URL to embed URL
  let embedUrl = video.url;
  const ytMatch = video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) {
    embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  }

  document.getElementById('videoPlayer').src = embedUrl;
  document.getElementById('videoNowPlaying').textContent = '▶ Now Playing: ' + video.name;
}
