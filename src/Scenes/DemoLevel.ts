import demoEnemyActor from "../AI/demo_enemy/demoEnemyActor";
import demoEnemyController from "../AI/demo_enemy/demoEnemyController";
import { PhysicsGroups } from "../Physics";
import AABB from "../Wolfie2D/DataTypes/Shapes/AABB";
import Spritesheet from "../Wolfie2D/DataTypes/Spritesheet";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import Input from "../Wolfie2D/Input/Input";
import { TweenableProperties } from "../Wolfie2D/Nodes/GameNode";
import Sprite from "../Wolfie2D/Nodes/Sprites/Sprite";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import Layer from "../Wolfie2D/Scene/Layer";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import Color from "../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../Wolfie2D/Utils/EaseFunctions";
import Level, { LevelLayers } from "./Level";
import Button from "../Wolfie2D/Nodes/UIElements/Button";
import Controls from "./Controls";
import Help from "./Help";
import MainMenu from "./MainMenu";

/**
 * The first level for HW4 - should be the one with the grass and the clouds.
 */
export default class DemoLevel extends Level {

    public static readonly PLAYER_SPAWN = new Vec2(128, 256);
    public static readonly PLAYER_SPRITE_KEY = "PLAYER_SPRITE_KEY";
    public static readonly PLAYER_SPRITE_PATH = "assets/sprites/Shadow_Knight.json";

    public static readonly ENEMY_SPRITE_KEY = "DEMO_ENEMY_KEY";
    public static readonly ENEMY_SPRITE_PATH = "assets/sprites/Slime.json";
    public static readonly ENEMY_POSITIONS_KEY = "DEMO_ENEMY_POSITIONS";
    public static readonly ENEMY_POSIITIONS_PATH = "assets/data/demo_enemy.json";


    public static readonly TILEMAP_KEY = "DemoLevel";
    public static readonly TILEMAP_PATH = "assets/tilemaps/demo_tilemap.json";
    public static readonly TILEMAP_SCALE = new Vec2(6, 6);

    public static readonly ABILITY_ICONS_KEY = "ABILITY_ICONS_KEY";
    public static readonly ABILITY_ICONS_PATH = "assets/sprites/ability_icons.png";

    private escMenu: Layer;
    private esc: Sprite;
    private escMenuButtons: Layer;

    private allEnemies = [];

    // public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    // public static readonly LEVEL_MUSIC_PATH = "hw4_assets/music/hw5_level_music.wav";

    // public static readonly JUMP_AUDIO_KEY = "PLAYER_JUMP";
    // public static readonly JUMP_AUDIO_PATH = "hw4_assets/sounds/jump.wav";

    // public static readonly TILE_DESTROYED_KEY = "TILE_DESTROYED";
    // public static readonly TILE_DESTROYED_PATH = "hw4_assets/sounds/switch.wav";

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = DemoLevel.TILEMAP_KEY;
        this.tilemapScale = DemoLevel.TILEMAP_SCALE;

        // Set the key for the player's sprite
        this.playerSpriteKey = DemoLevel.PLAYER_SPRITE_KEY;
        // Set the player's spawn
        this.playerSpawn = DemoLevel.PLAYER_SPAWN;

        this.abilityIconsKey = DemoLevel.ABILITY_ICONS_KEY;

        // Music and sound
    }

    /**
     * Load in our resources for level 1
     */
    public loadScene(): void {
        // Load in the tilemap
        this.load.tilemap(this.tilemapKey, DemoLevel.TILEMAP_PATH);
        // Load in the player's sprite
        this.load.spritesheet(this.playerSpriteKey, DemoLevel.PLAYER_SPRITE_PATH);
        // Load in ability icons
        this.load.image(this.abilityIconsKey, DemoLevel.ABILITY_ICONS_PATH);

        // Load in demo level enemies
        this.load.spritesheet(DemoLevel.ENEMY_SPRITE_KEY, DemoLevel.ENEMY_SPRITE_PATH);
        this.load.object(DemoLevel.ENEMY_POSITIONS_KEY, DemoLevel.ENEMY_POSIITIONS_PATH);

        //Load Escape menu
        this.load.image("esc", "assets/sprites/menus/escMenu.png");
        // Audio and music
    }

    /**
     * Unload resources for level 1
     */
    public unloadScene(): void {
        // TODO decide which resources to keep/cull 
    }

    public startScene(): void {
        super.startScene();
        let center = this.viewport.getView().center;

        // Initialize demo_level enemies
        let enemies = this.load.getObject(DemoLevel.ENEMY_POSITIONS_KEY);
        // console.log(enemies.positions[0].x);
        for(let i = 0; i < enemies.positions.length; i++){
            let enemy = this.factory.addAnimatedSprite(demoEnemyActor, DemoLevel.ENEMY_SPRITE_KEY, LevelLayers.PRIMARY) as demoEnemyActor
            enemy.position.set(enemies.positions[i].x * 6, enemies.positions[i].y * 6);
            enemy.addPhysics(new AABB(enemy.position.clone(), enemy.boundary.getHalfSize().clone()), null, true);
            enemy.navkey = "navmesh";
        
            // let healthbar = new HealthbarHUD(this, npc, "primary", {size: npc.size.clone().scaled(2, 1/2), offset: npc.size.clone().scaled(0, -1/2)});
            // this.healthbars.set(npc.id, healthbar);

            enemy.addAI(demoEnemyController, {tilemap: this.tilemapKey});
            enemy.setGroup(PhysicsGroups.NPC);
            enemy.animation.play("IDLE");
            this.allEnemies.push(enemy);
        }

        //INITIALIZE PAUSE MENU
        this.escMenu = this.addLayer("escMenu", 0);
        this.escMenuButtons = this.addUILayer("escMenuButtons");
        this.escMenuButtons.setDepth(10);
        this.esc = this.add.sprite("esc", "escMenu");
        this.esc.position.set(center.x, center.y);
        this.esc.scale = new Vec2(0.71, 0.71);
        this.esc.tweens.add('fadeOut', {
            startDelay: 0,
            duration: 750,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.OUT_IN_SINE
                }
            ]
        });
        this.escMenu.disable();
        this.escMenuButtons.disable();

        const resume = this.add.uiElement(UIElementType.BUTTON, "escMenuButtons", {position: new Vec2(center.x, center.y), text: "Resume"}) as Button;
        resume.size.set(150, 50);
        resume.borderWidth = 2;
        resume.borderColor = Color.WHITE;
        resume.backgroundColor = Color.WHITE;
        resume.textColor = Color.BLACK;
        resume.fontSize = 14;
        resume.onClickEventId = "resume";

        const newGame = this.add.uiElement(UIElementType.BUTTON, "escMenuButtons", {position: new Vec2(center.x, center.y), text: "New Game"}) as Button;
        newGame.size.set(150, 50);
        newGame.borderWidth = 2;
        newGame.borderColor = Color.WHITE;
        newGame.backgroundColor = Color.WHITE;
        newGame.textColor = Color.BLACK;
        newGame.fontSize = 14;
        newGame.onClickEventId = "newGame";

        const controls = this.add.uiElement(UIElementType.BUTTON, "escMenuButtons", {position: new Vec2(center.x, center.y), text: "Controls"}) as Button;
        controls.size.set(150, 50);
        controls.borderWidth = 2;
        controls.borderColor = Color.WHITE;
        controls.backgroundColor = Color.WHITE;
        controls.textColor = Color.BLACK;
        controls.fontSize = 14;
        controls.onClickEventId = "controls";

        const help = this.add.uiElement(UIElementType.BUTTON, "escMenuButtons", {position: new Vec2(center.x, center.y), text: "Help"}) as Button;
        help.size.set(150, 50);
        help.borderWidth = 2;
        help.borderColor = Color.WHITE;
        help.backgroundColor = Color.WHITE;
        help.textColor = Color.BLACK;
        help.fontSize = 14;
        help.onClickEventId = "help";

        const exit = this.add.uiElement(UIElementType.BUTTON, "escMenuButtons", {position: new Vec2(center.x, center.y), text: "Exit Game"}) as Button;
        exit.size.set(150, 50);
        exit.borderWidth = 2;
        exit.borderColor = Color.WHITE;
        exit.backgroundColor = Color.WHITE;
        exit.textColor = Color.BLACK;
        exit.fontSize = 14;
        exit.onClickEventId = "exit";

        // Set the next level to be Level2
        // this.nextLevel = null;

        this.receiver.subscribe("resume");
        this.receiver.subscribe("newGame");
        this.receiver.subscribe("controls");
        this.receiver.subscribe("help");
        this.receiver.subscribe("exit");
    }

    public updateScene(){
        let escButton = Input.isKeyJustPressed("escape");
        if (escButton){
            if (this.escMenu.isHidden()){
                let center = this.viewport.getView().center;
                this.escMenu.enable();
                this.escMenuButtons.enable();
                this.esc.position.set(center.x, center.y);
                for (let i = 0; i < this.escMenuButtons.getItems().length; i++){
                    this.escMenuButtons.getItems()[i].position.set(center.x, center.y - (100 - (60 * i)))
                }
                for (let enemy of this.allEnemies){
                    enemy.animation.pause();
                    enemy.freeze();
                }
                this.player.freeze();
            }
            else{
                this.escMenu.disable();
                this.escMenuButtons.disable();
                let center = this.viewport.getView().center;
                this.esc.position.set(center.x, center.y);
                for (let i = 0; i < this.escMenuButtons.getItems().length; i++){
                    this.escMenuButtons.getItems()[i].position.set(center.x, center.y - (100 - (60 * i)))
                }
                for (let enemy of this.allEnemies){
                    enemy.animation.play("IDLE");
                    enemy.unfreeze();
                }
                this.player.unfreeze();
            }
        }
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            //Main menu options
            case "resume":
                this.escMenu.disable();
                this.escMenuButtons.disable();

                for (let enemy of this.allEnemies){
                    enemy.animation.play("IDLE");
                    enemy.unfreeze();
                }
                this.player.unfreeze();
                break;

            case "newGame":
                this.escMenu.disable();
                this.escMenuButtons.disable();
                for (let enemy of this.allEnemies){
                    enemy.animation.play("IDLE");
                    enemy.unfreeze();
                }
                this.player.unfreeze();
                this.sceneManager.changeToScene(DemoLevel);
                break;

            case "controls":
                this.escMenu.disable();
                this.escMenuButtons.disable();
                for (let enemy of this.allEnemies){
                    enemy.animation.play("IDLE");
                    enemy.unfreeze();
                }
                this.player.unfreeze();
                this.sceneManager.changeToScene(Controls);
                break;

            case "help":
                this.escMenu.disable();
                this.escMenuButtons.disable();
                for (let enemy of this.allEnemies){
                    enemy.animation.play("IDLE");
                    enemy.unfreeze();
                }
                this.player.unfreeze();
                this.sceneManager.changeToScene(Help);
                break;

            case "exit":
                this.escMenu.disable();
                this.escMenuButtons.disable();
                for (let enemy of this.allEnemies){
                    enemy.animation.play("IDLE");
                    enemy.unfreeze();
                }
                this.player.unfreeze();
                this.sceneManager.changeToScene(MainMenu);
                break;

            default:
                throw new Error(`Event handler not implemented for event type ${event.type}`)
        }
    }
}