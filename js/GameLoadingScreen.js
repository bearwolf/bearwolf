/* global MainGameContainer */
MainGameContainer.GameLoadingScreen = function (game) {};

MainGameContainer.GameLoadingScreen.prototype = {
  // Game Objects or Groups
  
  preloadBar: undefined,
  bck: undefined,
  ready: false,
  // Game Assets
  gameAssets: {
    images: [
      { name: 'wood_bg', src: './assets/img/stripebg.jpg', },
      { name: 'knife_texture', src: './assets/img/knife_texture.png', },
      { name: 'knife_texture2', src: './assets/img/knife_texture2.png', },
      { name: 'apple', src: './assets/img/butt1.png', },
      { name: 'apple_cut', src: './assets/img/heart.png', },
      { name: 'carrot', src: './assets/img/butt2.png', },
      { name: 'carrot_cut', src: './assets/img/heart.png', },
      { name: 'orange', src: './assets/img/butt3.png', },
      { name: 'orange_cut', src: './assets/img/heart.png', },
      { name: 'pear', src: './assets/img/butt4.png', },
      { name: 'pear_cut', src: './assets/img/heart.png', },
      { name: 'tomato', src: './assets/img/butt5.png', },
      { name: 'tomato_cut', src: './assets/img/heart.png', },
      { name: 'bomb', src: './assets/img/virus4.png', },
    ],
    sounds: [
      { name: 'confirm', src: './assets/sound/lick.mp3' },
      { name: 'error', src: './assets/sound/error4.mp3' },
      { name: 'loadsave', src: './assets/sound/loadsave.wav' },
    ],
    music: [
      { name: 'blue_beat', src: './assets/music/carelessfart.mp3' },
    ],
    spritesheets: [],
  },
	preload: function () {

		//Show the load bar
		this.bck = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBackground');
		this.bck.anchor.setTo(0.5,0.5);
		this.bck.scale.setTo(1,1);
		this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBar');
		this.preloadBar.anchor.setTo(0,0.5);
		this.preloadBar.scale.setTo(1,1);
		this.preloadBar.x = this.world.centerX - this.preloadBar.width/2;

		this.load.setPreloadSprite(this.preloadBar);
		
		//Start loading assets
    
    // load image assets
    var x = 0;
    var imagesn = this.gameAssets.images.length;
    for (x=0; x<imagesn; x++) {
      this.game.load.image(
        this.gameAssets.images[x].name,
        this.gameAssets.images[x].src
      );
    }
    
    // load music assets
    var x = 0;
    var soundsn = this.gameAssets.music.length;
    for (x=0; x<soundsn; x++) {
      this.game.load.audio(
        this.gameAssets.music[x].name,
        this.gameAssets.music[x].src
      );
    }
    
    // load sounds assets
    var x = 0;
    var soundsn = this.gameAssets.sounds.length;
    for (x=0; x<soundsn; x++) {
      this.game.load.audio(
        this.gameAssets.sounds[x].name,
        this.gameAssets.sounds[x].src
      );
    }
    
    // load sprite sheets
    var x = 0;
    var spritesheetsn = this.gameAssets.spritesheets.length;
    for (x=0; x<spritesheetsn; x++) {
      this.load.spritesheet(
        this.gameAssets.spritesheets[x].name,
        this.gameAssets.spritesheets[x].src,
        this.gameAssets.spritesheets[x].w,
        this.gameAssets.spritesheets[x].h,
        this.gameAssets.spritesheets[x].frameMax,
        this.gameAssets.spritesheets[x].m,
        this.gameAssets.spritesheets[x].s,
      );
    }
    
    // load json maps
    this.game.load.tilemap("LEVEL1x1xObjFix", "./assets/maps/smb1-1-obj.json", null, Phaser.Tilemap.TILED_JSON);
	},

	create: function () {
		this.preloadBar.cropEnabled = false;
	},

	update: function () {
		if (this.ready == false)
		{
			this.ready = true;
			this.state.start('GamePlay');
		}
	}

};
