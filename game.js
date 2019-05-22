let width = 1125;
let height = 2436;

let app = new PIXI.Application({ width: width, height: height });
document.body.appendChild(app.view);

let symbolsSRC = [
	"cards_icons/bat.png",
	"cards_icons/cinema-tickets.png",
	"cards_icons/coin-toss.png",
	"cards_icons/dices.png",
	"cards_icons/eye.png",
	"cards_icons/girl.png",
	"cards_icons/hippopotamus.png",
	"cards_icons/humming-bird.png",
	"cards_icons/man.png",
	"cards_icons/sampling.png",
	"cards_icons/shuffle.png",
	"cards_icons/shuffle_1.png"
];

let fieldsPosition = [
	[316, 1210],
	[563, 1210],
	[808, 1210],
	[316, 1455],
	[563, 1455],
	[808, 1455],
	[316, 1702],
	[563, 1702],
	[808, 1702],
	[316, 1948],
	[563, 1948],
	[808, 1948]
];

let spineLoaderOptions = { metadata: { spineAtlasSuffix: '.txt' } };

PIXI.loader
.add('char', 'character_spine/Emma_animation.json')
.add(symbolsSRC)
.add([
  	"assets_UI/Artboard.png",
	"assets_UI/Artboard_12.png",
	"assets_UI/BG.png",
	"assets_UI/button_1.png",
	"assets_UI/card_1.png",
	"assets_UI/card_2.png",
	"assets_UI/card_3.png",
	"assets_UI/close_icon.png",
	"assets_UI/coin_1.png",
	"assets_UI/coin_2.png",
	"assets_UI/coin_3.png",
	"assets_UI/dollar_icon.png",
	"assets_UI/flip_em_all_match_any_two.png",
	"assets_UI/glow.png",
	"assets_UI/how_to_play.png",
	"assets_UI/icon_2.png",
	"assets_UI/pop_up_1.png",
	"assets_UI/pop_up_2.png",
	"assets_UI/pop_up_3.png",
	"assets_UI/question_1.png",
	"assets_UI/question_2.png",
	"assets_UI/sparkle_small.png",
	"assets_UI/star.png",
	"assets_UI/star_coin_icon.png",
])
.load(draw);

function draw(loader, res) {
	drawGame(loader, res);
	drawStart(loader, res);	
	createChar(loader, res);
}

function loadRes(link) {
	return PIXI.loader.resources[link].texture;
}

function drawGame(loader, res) {
	let bg = new PIXI.Sprite( loadRes("assets_UI/BG.png") );
	app.stage.addChild(bg);

	let titleText = new PIXI.Sprite( loadRes("assets_UI/flip_em_all_match_any_two.png") );	
	titleText.position.set((bg.width - titleText.width) / 2, 375);
	app.stage.addChild(titleText);

	let boardCard = new PIXI.Sprite( loadRes("assets_UI/Artboard.png") );	
	boardCard.position.set((bg.width - boardCard.width) / 2, 1030);
	app.stage.addChild(boardCard);

	let card = new PIXI.Sprite( loadRes("assets_UI/Artboard_12.png") );	
	card.position.set((bg.width - card.width) / 2, boardCard.y + 70);
	app.stage.addChild(card);

	gameGroup = new PIXI.Container();	
	app.stage.addChild(gameGroup);
}

let char;
function createChar(loader, res) {
	char = new PIXI.spine.Spine(res.char.spineData);
	char.skeleton.setToSetupPose();
	char.update(0);
	char.autoUpdate = false;
	let charCage = new PIXI.Container();
	charCage.addChild(char);
	let localRect = char.getLocalBounds();
	char.position.set(-localRect.x, -localRect.y);
	app.stage.addChild(charCage);
	charCage.position.set((width - localRect.width) / 2, 565);
	animationChar('idle', true);

	requestAnimationFrame(skeletonAnimation);
}

let charLastFrame = 0;
function skeletonAnimation(newframe) {
	let frameTime = (newframe - charLastFrame)/1000;
	charLastFrame = newframe;
	char.update(frameTime);
	requestAnimationFrame(skeletonAnimation);
}

let isWin;
let winSymbol;
let winCoin;
let symbolList;
let gameGroup;
let openCount;
let openCountWin;
let currentAnimation = 'idle';
let gameOver = false
function startGame(loader, res) {
	symbolList = [];
	openCount = 0;
	openCountWin = 0;
	winSymbol = -1;
	winCoin = 0;
	let random = Math.round(Math.random()*100);
	if (random < 50){
		winCoin = 0;
	}else {
		winSymbol = randomInt(0, 11);
		winCoin = 500;
	}
	function severalRandom(min, max, num, winSymbol) {		
	    var i, arr = [], res = [];
	    for (i = min; i < max; i++ ) {
	    	arr.push(i);
	    }
	    if (winSymbol !== undefined) arr.splice(winSymbol, 1)
	    for (i = 0; i < num; i++) {
	    	res.push(arr.splice(Math.floor(Math.random() * (arr.length)), 1)[0])
	    }
	    return res;
	}

	let symbolCount = [];
	if (winSymbol > -1) {
		isWin = true;
		symbolList = severalRandom(0, 12, 10, winSymbol);
		symbolList.push(winSymbol);
		symbolList.push(winSymbol);
		symbolList.forEach((symbol, ind) => {
			let changeInd;
			do {
				changeInd = randomInt(0, 9);
			} while(changeInd == ind)
			symbolList[ind] = symbolList[changeInd];
			symbolList[changeInd] = symbol;
		});
	} else {
		isWin = false;
		symbolList = severalRandom(0, 12, 12);
	}
	drawSymbols();
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawSymbols() {
	let arrIndexWin = [];
	let filedCardTexture = loadRes("assets_UI/card_3.png");
	symbolList.forEach((symbolID, i) => {

		let ticker = new PIXI.ticker.Ticker();
		let symbol = new PIXI.Sprite( loadRes(symbolsSRC[symbolID]) );		
		symbol.position.set(fieldsPosition[i][0], fieldsPosition[i][1]);
		symbol.anchor.set(0.5);
		symbol.scale.x = 0;
		symbol.index = i;
		if (winSymbol !== -1) {
			if (symbolsSRC[symbolID] === symbolsSRC[winSymbol]) symbol.win = true;
			else symbol.win = false;
		}
		else symbol.win = false;

		let filedCard = new PIXI.Sprite( filedCardTexture );
		filedCard.name = 'filedCard'	
		filedCard.position.set(fieldsPosition[i][0], fieldsPosition[i][1]);
		filedCard.anchor.set(0.5);
		filedCard.interactive = true;	
		filedCard.index = i;	

		gameGroup.addChild(symbol, filedCard);

		filedCard.on('touchend', pointerUp);
		filedCard.on('mouseup', pointerUp);
		scaleFiled = 0.08
		let anim = () => {
			if (filedCard.scale.x <= 0) {
				filedCard.alpha = 0;				
				symbol.scale.x += scaleFiled;
				if (symbol.scale.x >= 1) {
					ticker.stop();
					ticker.remove(anim);
					filedCard.destroy();
					if (gameOver === true) destroyCover();					
				}				
			} else filedCard.scale.x -= scaleFiled;
		}		
		ticker.add(anim);
		
		function pointerUp(event) {				
			filedCard.interactive = false;
			ticker.start();

			if (!gameOver) {
				if (currentAnimation !== 'worry') {
					animationChar('worry', false);
					currentAnimation = 'worry';
				}
				if (symbol.win === true) {
					arrIndexWin.push(symbol.index)
					if(++openCountWin === 2) {						
						gameOver = true;
						currentAnimation = 'happy';
						animationChar('happy', true)						
						destroyCover();
						brightCard(arrIndexWin);
					}
				} else {
					if(++openCount === 12) {
						currentAnimation = 'sad';
						animationChar('sad', true)
						finishGame('TRY AGAIN');
					}
				}
			}
	    }
	    filedCard.fun = pointerUp;
	});
}

function animationChar(key, bool) {
	currentAnimation = key;
	if (bool === false) {
		char.state.setAnimation(0, key, true, 0);
	}
	else {
		char.state.setAnimation(0, key, false)
		char.state.addAnimation(0, 'idle', true, 0);
	}
}

let startAnimation;
let cover;
let startBarGroup, finishBarGroup;
let coinWinText;
let WonText;
let helpIconCoin;

function drawStart() {
	cover = new PIXI.Graphics();
	cover.alpha = 0.5;
	cover.beginFill(0x000000);
	cover.drawRect(0, 0, width, height);
	cover.interactive = true;
	app.stage.addChild(cover);

	startBarGroup = new PIXI.Container();	

	let startBarBG = new PIXI.Sprite( loadRes('assets_UI/pop_up_2.png') );
	startBarBG.position.set(0, 0);
	startBarGroup.position.set(0, height - startBarBG.height);
	app.stage.addChild(startBarGroup);
	startBarGroup.addChild(startBarBG);

	let startButton = new PIXI.Sprite( loadRes('assets_UI/button_1.png') );
	startButton.name = 'startButton';
	startButton.position.set((width - startButton.width) / 2, 191);
	startButton.interactive = true;
	startBarGroup.addChild(startButton);

	startButton.on('touchend', pointerUp);
	startButton.on('mouseup', pointerUp);
	function pointerUp(event) {

		startButton.interactive = false;
		startAnimation = performance.now();
		requestAnimationFrame(startGameAnimation);
		while (gameGroup.children[0]) {
			gameGroup.children[0].destroy();
		}
		gameOver = false;
		startGame();
    }

	let howToPlayTextStyle = new PIXI.TextStyle({
		fontFamily: "MuseoSlabRegular",
		fontSize: 72,
		fill: "#fc6400"
	});
	let howToPlayText = new PIXI.Text("How To Play", howToPlayTextStyle);
	let helpIconQuestion = new PIXI.Sprite( loadRes('assets_UI/question_2.png') );
	howToPlayText.position.set((width - howToPlayText.width + helpIconQuestion.width + 20) / 2, 60);
	startBarGroup.addChild(howToPlayText);

	helpIconQuestion.position.set(howToPlayText.x - helpIconQuestion.width - 10, 60);
	startBarGroup.addChild(helpIconQuestion);

	let startButtonTextStyle = new PIXI.TextStyle({
		fontFamily: "MuseoSlabRegular",
		fontSize: 72,
		fill: "#ffffff"
	});
	let startButtonText = new PIXI.Text("Play for 5", startButtonTextStyle);
	let helpIcon = new PIXI.Sprite( loadRes('assets_UI/coin_3.png') );
	let startButtonBounds = startButtonText.getLocalBounds();
	startButtonText.position.set((width - startButtonBounds.width - helpIcon.width / 2) / 2, 230);
	startBarGroup.addChild(startButtonText);
	
	helpIcon.position.set(startButtonText.x + startButtonBounds.width + 10, 238);
	startBarGroup.addChild(helpIcon);

	finishBarGroup = new PIXI.Container();
	finishBarGroup.position.set(0, 350);
	app.stage.addChild(finishBarGroup);

	let finishBarBG = new PIXI.Sprite( loadRes('assets_UI/pop_up_1.png') );
	finishBarBG.position.set((width - finishBarBG.width) / 2, 0);
	finishBarGroup.addChild(finishBarBG);

	let WonTextStyle = new PIXI.TextStyle({
		fontFamily: "MuseoSlabRegular",
		fontSize: 72,
		fill: "#fc6400"
	});
	WonText = new PIXI.Text("WIN COINS UP TO", WonTextStyle);
	WonText.position.set((width - WonText.width) / 2, 65);
	finishBarGroup.addChild(WonText);

	let coinWinTextStyle = new PIXI.TextStyle({
		fontFamily: "MuseoSlabRegular",
		fontSize: 72,
		fill: "#fc6400"
	});
	coinWinText = new PIXI.Text('1000', coinWinTextStyle);
	helpIconCoin = new PIXI.Sprite( loadRes('assets_UI/coin_2.png') );
	coinWinText.position.set((width - coinWinText.width - helpIconCoin.width / 2) / 2, 165);
	helpIconCoin.position.set(coinWinText.x + coinWinText.width + 10, 165);

	finishBarGroup.addChild(coinWinText);
	finishBarGroup.addChild(helpIconCoin);
}

let ticker = new PIXI.ticker.Ticker();

function destroyCover() {
	let cardChild = gameGroup.getChildByName('filedCard');
	if (cardChild === null) {
		ticker.stop();
		finishGame('YOU WIN');
	} else {
		ticker.add(cardChild.fun);
		ticker.start();
	}
}

function randomPosition(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}

function brightCard(arr) {
	createFrame(arr[0]);
	createFrame(arr[1]);
}

function createFrame (index) {

	let ticker = new PIXI.ticker.Ticker();
	let frame = new PIXI.Sprite( loadRes("assets_UI/glow.png") );
	frame.position.set(fieldsPosition[index][0], fieldsPosition[index][1]);
	frame.anchor.set(0.5);
	let scaleInd = 0.02;
	let anim = () => {
		if (frame.scale.x >= 1.2) {
			scaleInd = -0.02;			
		}
		if (frame.scale.x < 1) {
			ticker.stop();
			ticker.remove(anim);
		}
		frame.scale.x = frame.scale.y += scaleInd;
	}
	ticker.add(anim);
	ticker.start();
	gameGroup.addChild(frame);

	let timerId = setInterval(function() {
		if (!gameOver) {
			clearInterval(timerId);
			return;
		}
		let light = new PIXI.Sprite( loadRes("assets_UI/star.png") );
		light.x = frame.x + randomPosition(-110, 110);
		light.y = frame.y + randomPosition(-110, 110);
		light.anchor.set(0.5);
		gameGroup.addChild(light);
		destroyLight(light, 2000);
	}, 500  );

	let timerId2 = setInterval(function() {
		if (!gameOver) {
			clearInterval(timerId2);
			return;
		}
		let ticker = new PIXI.ticker.Ticker();
		let light = new PIXI.Sprite( loadRes("assets_UI/sparkle_small.png") );
		light.x = frame.x + randomPosition(-110, 110);
		light.y = frame.y + randomPosition(-110, 110);		
		light.anchor.set(0.5);
		gameGroup.addChild(light);
		
		let anim = () => {
			if (!gameOver) {
				return;
			}
			light.rotation += 0.1;
		}
		ticker.add(anim);
		ticker.start();
		destroyLight(light, 1300, ticker);
	}, 300  );
}

function destroyLight(light, timer, ticker) {
	setTimeout(function() {
		if (ticker) {
			ticker.stop();
			ticker.destroy();
		};		
		light.destroy();
	}, timer)		
}

function startGameAnimation(newFrame) {	
	let progress = (newFrame - startAnimation)/1000 * 2;

	if (progress >= 1) {
		progress = 1;
		cover.interactive = false;
	} else {
		requestAnimationFrame(startGameAnimation);
	}
	cover.alpha = (1-progress) * 0.5;
	finishBarGroup.y = 350 - 680*progress;
	startBarGroup.y = height - 430 + 519*progress;
}

function finishGame(text) {

	startBarGroup.getChildByName('startButton').interactive = true;
	cover.interactive = true;
	WonText.text = text;
	WonText.position.x = (width - WonText.width) / 2;
	if (winCoin !== 0) {
		coinWinText.text = winCoin;
		coinWinText.visible = true;
		helpIconCoin.visible = true;
		WonText.y = 65;
	} else {
		coinWinText.visible = false;
		helpIconCoin.visible = false;
		WonText.y = 120;
	}

	startAnimation = performance.now();
	requestAnimationFrame(finishGameAnimation);
}

function finishGameAnimation(newFrame) {
	let progress = (newFrame - startAnimation)/1000 * 2;

	if (progress >= 1) {
		progress = 1;
	} else {
		requestAnimationFrame(finishGameAnimation);
	}

	finishBarGroup.y = 350 - 680*(1-progress);
	cover.alpha = progress * 0.5;
	startBarGroup.y = height - 430 + 519*(1-progress);
}
