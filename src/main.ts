import Game from "./Wolfie2D/Loop/Game";
import MainMenu from "./Scenes/MenuScenes/MainMenu";
import RegistryManager from "./Wolfie2D/Registry/RegistryManager";
import { PlayerControls } from "./AI/Player/PlayerController";
import SplashScreen from "./Scenes/MenuScenes/SplashScreen";

import ParticleShaderType from "./Shaders/ParticleShaderType"
import BasicAttackShaderType from "./Shaders/BasicAttackShaderType";

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
            {name: PlayerControls.SKILL_BOOK, keys: ["k"]},
            {name: PlayerControls.SKILL_ONE, keys: ["u"]},
            {name: PlayerControls.SKILL_TWO, keys: ["i"]},
            {name: PlayerControls.SKILL_THREE, keys: ["o", "q"]},
            {name: PlayerControls.SKILL_FOUR, keys: ["p", "e"]},
        ],
        useWebGL: false,                        // Tell the game we want to use webgl
        showDebug: false                      // Whether to show debug messages. You can change this to true if you want
    }

    // We have a custom shader, so lets add it to the registry and preload it
    // The registry essentially just ensures that we can locate items by name later, rather than needing
    // the class constructor. Here, we additionally make sure to preload the data so our
    // shader is available throughout the application
    RegistryManager.shaders.registerAndPreloadItem(
        BasicAttackShaderType.KEY,   // The key of the shader program
        BasicAttackShaderType,           // The constructor of the shader program
        BasicAttackShaderType.VSHADER,   // The path to the vertex shader
        BasicAttackShaderType.FSHADER  // the path to the fragment shader*/
    );

    RegistryManager.shaders.registerAndPreloadItem(
        ParticleShaderType.KEY,   // The key of the shader program
        ParticleShaderType,           // The constructor of the shader program
        ParticleShaderType.VSHADER,   // The path to the vertex shader
        ParticleShaderType.FSHADER  // the path to the fragment shader*/
    );
    // Create a game with the options specified
    const game = new Game(options);

    // Start our game
    game.start(SplashScreen, {});

})();

function runTests(){};