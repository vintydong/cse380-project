import Game from "./Wolfie2D/Loop/Game";
import MainMenu from "./Scenes/MainMenu";
import { PlayerControls } from "./AI/Player/PlayerController";
import SplashScreen from "./Scenes/SplashScreen";

// The main function is your entrypoint into Wolfie2D. Specify your first scene and any options here.
(function main(){
    // Run any tests
    runTests();

    // Set up options for our game
    let options = {
        canvasSize: {x: 1366, y: 768},          // The size of the game
        clearColor: {r: 0.1, g: 0.1, b: 0.1},   // The color the game clears to
        inputs: [
            {name: PlayerControls.MOVE_UP, keys: ["w", "space"]},
            {name: PlayerControls.MOVE_DOWN, keys: ["s"]},
            {name: PlayerControls.MOVE_LEFT, keys: ["a"]},
            {name: PlayerControls.MOVE_RIGHT, keys: ["d"]},
            {name: PlayerControls.DASH, keys: ["shift"]},
            {name: PlayerControls.SKILL_ONE, keys: ["u"]},
            {name: PlayerControls.SKILL_TWO, keys: ["i"]},
            {name: PlayerControls.SKILL_THREE, keys: ["o"]},
            {name: PlayerControls.SKILL_FOUR, keys: ["p"]},
        ],
        useWebGL: false,                        // Tell the game we want to use webgl
        showDebug: false                      // Whether to show debug messages. You can change this to true if you want
    }

    // Create a game with the options specified
    const game = new Game(options);

    // Start our game
    game.start(SplashScreen, {});

})();

function runTests(){};