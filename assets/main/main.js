const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "USER-PLAYER";

const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const player = $(".player");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

// 1. Render songs -> oke
// 2. scroll top -> oke
// 3. Play , pause / seek -> oke
// 4. Cd rotate -> oke
// 5. Next, prev song -> oke
// 6. Random song -> oke
// 7. Next / Repeat when ended -> oke
// 8. Active song -> oke
// 9. Scroll active song into view -> oke

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isReapeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "All For Love - Remix",
      singer: "Thereon Remix",
      path: "../assets/songs/song9.mp3",
      image: "../assets/img/cdThumb/imgSong9.jpg",
    },
    {
      name: "Dưới Tòa Sen Vàng - Remix",
      singer: "Thùy Trang",
      path: "../assets/songs/song1.mp3",
      image: "../assets/img/cdThumb/imgSong1.jpg",
    },
    {
      name: "Dadada Thereon Remix",
      singer: "Thereon Remix",
      path: "../assets/songs/song2.mp3",
      image: "../assets/img/cdThumb/imgSong2.jpg",
    },
    {
      name: "Shape Of You JAPAN Remix",
      singer: "Pháp Sư VN Remix",
      path: "../assets/songs/song3.mp3",
      image: "../assets/img/cdThumb/imgSong3.jpg",
    },
    {
      name: "NEVADA ft. LANTERNS Remix",
      singer: "Thereon Remix",
      path: "../assets/songs/song4.mp3",
      image: "../assets/img/cdThumb/imgSong4.jpg",
    },
    {
      name: "TỪ CỬU MÔN HỒI ỨC x THỦ ĐÔ CYPHER",
      singer: "Remix",
      path: "../assets/songs/song5.mp3",
      image: "../assets/img/cdThumb/imgSong5.jpg",
    },
    {
      name: "Wolves JAPAN Remix",
      singer: "Remix",
      path: "../assets/songs/song6.mp3",
      image: "../assets/img/cdThumb/imgSong6.jpg",
    },
    {
      name: "You Me",
      singer: "H Slang Choco",
      path: "../assets/songs/song7.mp3",
      image: "../assets/img/cdThumb/imgSong7.jpg",
    },
    {
      name: "Whoa",
      singer: "XXXTENTACION",
      path: "../assets/songs/song8.mp3",
      image: "../assets/img/cdThumb/imgSong8.jpg",
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${index === 0 ? "active" : ""}" data-index="${index}">
            <div class="thumb" style="background-image: url(${song.image});" ></div>
    
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
              
            </div>
    
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
           
        </div>
            `;
    });

    playlist.innerHTML = htmls.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // Handle rotate Cdthumb.
    const keyFrames = [
      {
        transform: "rotate(360deg)",
      },
    ];
    const options = {
      duration: 10000,
      iterations: Infinity,
    };
    const cdThumbAnimate = cdThumb.animate(keyFrames, options);
    cdThumbAnimate.pause();

    // Handle resize Cd when scroll
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Handle when click Play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // When song is playing
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // When song is pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // When song progress has changes
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Handle when seek song progress
    progress.oninput = function (e) {
      const seekTime = (e.target.value * audio.duration) / 100;
      audio.currentTime = seekTime;
    };

    //When next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }

      audio.play();
      // _this.render();
      _this.activeSong();
      _this.scrollToActiveSong();
    };

    // When prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }

      audio.play();
      // _this.render();
      _this.activeSong();
      _this.scrollToActiveSong();
    };

    //Handle on / off random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);

      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Handle when loop song
    repeatBtn.onclick = function () {
      _this.isReapeat = !_this.isReapeat;
      _this.setConfig("isReapeat", _this.isReapeat);
      repeatBtn.classList.toggle("active", _this.isReapeat);
    };

    // Handle next song when current song ended.
    audio.onended = function () {
      if (_this.isReapeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Behevior listener click in playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      const songOption = e.target.closest(".option");

      if (songNode || songOption) {
        // Handle when click song
        if (songNode && !songOption) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.activeSong();
          audio.play();
        }
        // Handle when click song option
        if (songOption) {
          // update...
        }
      }
    };
  },

  scrollToActiveSong: function () {
    const options = {
      behavior: "smooth",
      block: "nearest",
    };

    if (this.currentIndex === 0) {
      options.block = "end";
    }

    $(".song.active").scrollIntoView(options);
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isReapeat = this.config.isReapeat;

    // Assignment first config of user
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isReapeat);
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex > this.songs.length - 1) {
      this.currentIndex = 0;
    }

    this.loadCurrentSong();
  },
  prevSong: function () {
    this.currentIndex--;

    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }

    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  activeSong: function () {
    $(".song.active").classList.remove("active");

    $$(".song")[this.currentIndex].classList.add("active");
  },

  start: function () {
    // Assign config on app.
    this.loadConfig();
    // Define properties in object.
    this.defineProperties();

    // Events Listener / handle Events (DOM EVENTS).
    this.handleEvents();

    // Load current song and infor song when app start .
    this.loadCurrentSong();

    // Render playlist.
    this.render();
  },
};

app.start();
