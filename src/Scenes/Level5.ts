import demoEnemyActor from "../AI/demo_enemy/demoEnemyActor";
import demoEnemyController from "../AI/demo_enemy/demoEnemyController";
import { PhysicsGroups } from "../Physics";
import BasicAttackShaderType from "../Shaders/BasicAttackShaderType";
import ParticleShaderType from "../Shaders/ParticleShaderType";
import Circle from "../Wolfie2D/DataTypes/Shapes/Circle";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import Level, { LevelLayers } from "./Level";

export default class Level5 extends Level {    
    public static readonly ENEMY_SPRITE_KEY = "LEVEL5_ENEMY_KEY";
    public static readonly ENEMY_SPRITE_PATH = "assets/spritesheets/Enemies/Slime.json";
    public static readonly ENEMY_POSITIONS_KEY = "LEVEL5_ENEMY_POSITIONS";
    // public static readonly ENEMY_POSIITIONS_PATH = "assets/data/demo_enemy.json";

    public static readonly TILEMAP_KEY = "Level5";
    public static readonly TILEMAP_PATH = "assets/tilemaps/level5_tilemap.json";
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
        this.tilemapKey = Level5.TILEMAP_KEY;
        this.tilemapScale = Level5.TILEMAP_SCALE;

        this.playerSpawn = new Vec2(66.5 * 6, 40 * 6);
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
        this.load.tilemap(this.tilemapKey, Level5.TILEMAP_PATH);
        // Load in the player's sprite
        this.load.spritesheet(this.playerSpriteKey, Level5.PLAYER_SPRITE_PATH);
        // Load in ability icons
        this.load.image(this.abilityIconsKey, Level5.ABILITY_ICONS_PATH);
        
        // Load in the shader for basic attack.
        this.load.shader(
            BasicAttackShaderType.KEY,
            BasicAttackShaderType.VSHADER,
            BasicAttackShaderType.FSHADER
        );

        // Load in demo level enemies
        this.load.spritesheet(Level5.ENEMY_SPRITE_KEY, Level5.ENEMY_SPRITE_PATH);
        this.load.object(Level5.ENEMY_POSITIONS_KEY, Level5.TILEMAP_PATH);
        
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
        let tilemap_json = this.load.getObject(Level5.ENEMY_POSITIONS_KEY);
        let enemies = tilemap_json.layers.find(layer => layer.name === "Enemy")

        for (let i = 0; i < enemies.objects.length; i++) {
            let enemy = this.factory.addAnimatedSprite(demoEnemyActor, Level5.ENEMY_SPRITE_KEY, LevelLayers.PRIMARY) as demoEnemyActor
            enemy.position.set(enemies.objects[i].x * 6, enemies.objects[i].y * 6);
            enemy.addPhysics(new Circle(enemy.position, 16));
            enemy.setGroup(PhysicsGroups.NPC);
            enemy.setTrigger(PhysicsGroups.PLAYER, 'ENEMY_COLLISION', null);
            enemy.navkey = "navmesh";

            // let healthbar = new HealthbarHUD(this, npc, "primary", {size: npc.size.clone().scaled(2, 1/2), offset: npc.size.clone().scaled(0, -1/2)});
            // this.healthbars.set(npc.id, healthbar);

            enemy.addAI(demoEnemyController, { tilemap: this.tilemapKey });
            enemy.animation.play("IDLE");
            this.enemies.push(enemy);
        }

        this.viewport.setBounds(0, 0, 8 * 6 * 30, 8 * 6 * 60);
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