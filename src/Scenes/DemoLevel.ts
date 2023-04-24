import demoEnemyActor from "../AI/demo_enemy/demoEnemyActor";
import demoEnemyController from "../AI/demo_enemy/demoEnemyController";
import { PhysicsGroups } from "../Physics";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import Level, { LevelLayers } from "./Level";
import ParticleShaderType from "../Shaders/ParticleShaderType";
import Circle from "../Wolfie2D/DataTypes/Shapes/Circle";
import BasicAttackShaderType from "../Shaders/BasicAttackShaderType";
import MainMenu from "./MenuScenes/MainMenu";
import { CustomGameEvents } from "../CustomGameEvents";

export default class DemoLevel extends Level {    
    public static readonly ENEMY_SPRITE_KEY = "DEMO_ENEMY_KEY";
    public static readonly ENEMY_SPRITE_PATH = "assets/spritesheets/Enemies/Slime.json";
    public static readonly ENEMY_POSITIONS_KEY = "DEMO_ENEMY_POSITIONS";
    public static readonly ENEMY_POSIITIONS_PATH = "assets/data/demo_enemy.json";

    public static readonly TILEMAP_KEY = "DemoLevel";
    public static readonly TILEMAP_PATH = "assets/tilemaps/demo_tilemap.json";
    public static readonly TILEMAP_SCALE = new Vec2(6, 6);

    // public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    // public static readonly LEVEL_MUSIC_PATH = "hw4_assets/music/hw5_level_music.wav";

    // public static readonly JUMP_AUDIO_KEY = "PLAYER_JUMP";
    // public static readonly JUMP_AUDIO_PATH = "hw4_assets/sounds/jump.wav";

    // public static readonly TILE_DESTROYED_KEY = "TILE_DESTROYED";
    // public static readonly TILE_DESTROYED_PATH = "hw4_assets/sounds/switch.wav";
    
    // The padding of the world
	private worldPadding: Vec2;

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = DemoLevel.TILEMAP_KEY;
        this.tilemapScale = DemoLevel.TILEMAP_SCALE;

        this.playerSpawn = new Vec2(128, 256);
        // Set the player's spawn
        // Music and sound
    }

    /**
     * Load in our resources for demo level
     * These things should be laoded in Level 1 and then kept in the resource manager
     */
    public loadScene(): void {
        super.loadScene();

        // Load in the tilemap
        this.load.tilemap(this.tilemapKey, DemoLevel.TILEMAP_PATH);
        // // Load in the player's sprite
        // this.load.spritesheet(this.playerSpriteKey, DemoLevel.PLAYER_SPRITE_PATH);
        // Load in ability icons
        // this.load.image(this.abilityIconsKey, DemoLevel.ABILITY_ICONS_PATH);
        
        // Load in the shader for basic attack.
        this.load.shader(
            BasicAttackShaderType.KEY,
            BasicAttackShaderType.VSHADER,
            BasicAttackShaderType.FSHADER
        );

        // Load in demo level enemies
        this.load.spritesheet(DemoLevel.ENEMY_SPRITE_KEY, DemoLevel.ENEMY_SPRITE_PATH);
        this.load.object(DemoLevel.ENEMY_POSITIONS_KEY, DemoLevel.ENEMY_POSIITIONS_PATH);
        
        // Load in the shader for bubble.
        this.load.shader(
            ParticleShaderType.KEY,
            ParticleShaderType.VSHADER,
            ParticleShaderType.FSHADER
        );

        // Load UI layer sprites
        // Audio and music
    }

    /**
     * Unload resources for level 1
     */
    // public unloadScene(): void {
    //     // TODO decide which resources to keep/cull 
    // }

    public startScene(): void {
        super.startScene();
        // Initialize demo_level enemies
        let enemies = this.load.getObject(DemoLevel.ENEMY_POSITIONS_KEY);

        for (let i = 0; i < enemies.positions.length; i++) {
            let enemy = this.factory.addAnimatedSprite(demoEnemyActor, DemoLevel.ENEMY_SPRITE_KEY, LevelLayers.PRIMARY) as demoEnemyActor
            enemy.position.set(enemies.positions[i].x * 6, enemies.positions[i].y * 6);
            enemy.addPhysics(new Circle(enemy.position, 16));
            enemy.setGroup(PhysicsGroups.NPC);
            enemy.setTrigger(PhysicsGroups.WEAPON, CustomGameEvents.ENEMY_HIT, null);
            enemy.setTrigger(PhysicsGroups.PLAYER, 'ENEMY_COLLISION', null);
            enemy.navkey = "navmesh";

            // let healthbar = new HealthbarHUD(this, npc, "primary", {size: npc.size.clone().scaled(2, 1/2), offset: npc.size.clone().scaled(0, -1/2)});
            // this.healthbars.set(npc.id, healthbar);

            enemy.addAI(demoEnemyController, { tilemap: this.tilemapKey });
            enemy.animation.play("IDLE");
            this.enemies.push(enemy);
        }
    }

    public updateScene(deltaT) {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
        super.updateScene(deltaT);
    }

    /**
     * This method helps with handling events. 
     * 
     * @param event the event to be handled
     * @see GameEvent
     */
    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            // Let Level.ts handle it by default
            default:
                super.handleEvent(event);
                break;
        }
    }
}