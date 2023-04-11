import demoEnemyActor from "../AI/demo_enemy/demoEnemyActor";
import demoEnemyController from "../AI/demo_enemy/demoEnemyController";
import { PhysicsGroups } from "../Physics";
import AABB from "../Wolfie2D/DataTypes/Shapes/AABB";
import Spritesheet from "../Wolfie2D/DataTypes/Spritesheet";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import Level, { LevelLayers } from "./Level";

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

        // Initialize demo_level enemies
        let enemies = this.load.getObject(DemoLevel.ENEMY_POSITIONS_KEY);
        console.log(enemies.positions[0].x);
        for(let i = 0; i < enemies.positions.length; i++){
            let enemy = this.factory.addAnimatedSprite(demoEnemyActor, DemoLevel.ENEMY_SPRITE_KEY, LevelLayers.PRIMARY) as demoEnemyActor
            enemy.position.set(enemies.positions[i].x * 6, enemies.positions[i].y * 6);
            enemy.addPhysics(new AABB(enemy.position.clone(), enemy.boundary.getHalfSize().clone()), null, true);
            enemy.navkey = "navmesh";
            
            console.log("Enemy", enemy);
            // let healthbar = new HealthbarHUD(this, npc, "primary", {size: npc.size.clone().scaled(2, 1/2), offset: npc.size.clone().scaled(0, -1/2)});
            // this.healthbars.set(npc.id, healthbar);

            enemy.addAI(demoEnemyController, {tilemap: this.tilemapKey});
            enemy.setGroup(PhysicsGroups.NPC);
            enemy.animation.play("IDLE");
        }

        // Set the next level to be Level2
        // this.nextLevel = null;
    }
}