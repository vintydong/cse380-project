import { TalonActor, TalonController, TalonProjectile, TalonProjectileAI } from "../AI/Enemies/Talon";
import { CustomGameEvents } from "../CustomGameEvents";
import { PhysicsGroups } from "../Physics";
import { LayerManager } from "../Systems/LayerManager";
import { SkillManager } from "../Systems/SkillManager";
import Melee from "../Systems/Skills/Melee";
import Repel from "../Systems/Skills/Repel";
import Slash from "../Systems/Skills/Slash";
import AABB from "../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import { GraphicType } from "../Wolfie2D/Nodes/Graphics/GraphicTypes";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import Color from "../Wolfie2D/Utils/Color";
import Level, { LevelLayers } from "./Level";
import Level6 from "./Level6";

export default class Level5 extends Level {    
    public static readonly ENEMY_SPRITE_KEY = "LEVEL5_ENEMY_KEY";
    public static readonly ENEMY_SPRITE_PATH = "assets/spritesheets/Enemies/Talon.json";
    public static readonly ENEMY_POSITIONS_KEY = "LEVEL5_ENEMY_POSITIONS";

    public static readonly TALON_PROJECTILE_KEY = "TALON_PROJECTILE_KEY"
    public static readonly TALON_PROJECTILE_PATH = "assets/spritesheets/Enemies/Talon_Projectile.json";

    public static readonly TILEMAP_KEY = "Level5";
    public static readonly TILEMAP_PATH = "assets/tilemaps/level5_tilemap.json";
    public static readonly TILEMAP_SCALE = new Vec2(6, 6);

    public static readonly GROUND_LAYER_KEY = "Ground";
    public static readonly WALLS_LAYER_KEY = "Walls";

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "assets/music/hw5_level_music.wav";
    
    /** The destrubtable layer of the tilemap */
    protected ground: OrthogonalTilemap;
    /** The wall layer of the tilemap */
    protected walls: OrthogonalTilemap;

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = Level5.TILEMAP_KEY;
        this.tilemapScale = Level5.TILEMAP_SCALE;
        // this.levelMusicKey = Level5.LEVEL_MUSIC_KEY;

        // Set the player's spawn
        this.playerSpawn = new Vec2(66.5 * 6, 40 * 6);
        // Music and sound
    }

    /**
     * Load in our resources for demo level
     * These things should be laoded in Level 1 and then kept in the resource manager
     */
    public loadScene(): void {
        super.loadScene();
        
        /* Tilemap */
        this.load.tilemap(this.tilemapKey, Level5.TILEMAP_PATH);
                
        /* Audio and Sounds */
        // this.load.audio(this.levelMusicKey, Level5.LEVEL_MUSIC_PATH)

        /* AI */
        this.load.spritesheet(Level5.ENEMY_SPRITE_KEY, Level5.ENEMY_SPRITE_PATH);
        this.load.spritesheet(Level5.TALON_PROJECTILE_KEY, Level5.TALON_PROJECTILE_PATH);
        this.load.object(Level5.ENEMY_POSITIONS_KEY, Level5.TILEMAP_PATH);
    }

    /**
     * Unload resources for level 1
     */
    public unloadScene(): void {
        super.unloadScene();
        this.load.keepImage(Repel.REPEL_SPRITE_KEY);

        // this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.levelMusicKey});
    }

    public startScene(): void {
        super.startScene();

        // Initialize layer physics
        // this.initializeTilemap()

        // Initialize enemies
        let tilemap_json = this.load.getObject(Level5.ENEMY_POSITIONS_KEY);
        let enemies = tilemap_json.layers.find(layer => layer.name === "Enemy")

        for (let i = 0; i < enemies.objects.length; i++) {
            // Initialize Enemy
            let enemy = this.factory.addAnimatedSprite(TalonActor, Level5.ENEMY_SPRITE_KEY, LevelLayers.PRIMARY) as TalonActor
            enemy.scale.set(2, 2);
            enemy.position.set(enemies.objects[i].x * this.tilemapScale.x, enemies.objects[i].y * this.tilemapScale.y);
            
            enemy.addPhysics(new AABB(enemy.position.clone(), enemy.boundary.getHalfSize().clone()));
            enemy.setGroup(PhysicsGroups.NPC);
            enemy.setTrigger(PhysicsGroups.PLAYER, CustomGameEvents.PLAYER_ENEMY_COLLISION, null);
            enemy.navkey = "navmesh";

            enemy.addAI(TalonController, { tilemap: this.tilemapKey });
            enemy.animation.play("IDLE");
            this.enemies.push(enemy);
        }

        // Set Level End
        const levelEnd = new Vec2(23, 55.5).scale(this.tilemapScale.x * 8, this.tilemapScale.y * 8);
        let rect = this.factory.addGraphic(GraphicType.RECT, LevelLayers.PRIMARY, levelEnd, new Vec2(2 * 8 * 6, 3 * 8 * 6));
        rect.color = Color.TRANSPARENT;
        rect.addPhysics();
        rect.setGroup(PhysicsGroups.LEVEL_END);
        rect.setTrigger(PhysicsGroups.PLAYER, CustomGameEvents.PLAYER_ENTER_LEVEL_END, null);

        this.viewport.setBounds(0, 0, 8 * 6 * 30, 8 * 6 * 60);

        this.nextLevel = Level6;
        this.emitter.fireEvent(GameEventType.PLAY_MUSIC, { key: this.levelMusicKey, loop: true, holdReference: true });
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
            case CustomGameEvents.PLAYER_ENTER_LEVEL_END: {
                let allEnemiesDefeated = true
                for (let i = 0; i < this.enemies.length; i++) {
                    if (this.enemies[i].visible) allEnemiesDefeated = false;
                }

                if (allEnemiesDefeated)
                    this.emitter.fireEvent(CustomGameEvents.LEVEL_END)
            }
            // Let Level.ts handle it by default
            default:
                super.handleEvent(event);
                break;
        }
    }

    /**
     * Initializes the tilemaps
     * @param key the key for the tilemap data
     * @param scale the scale factor for the tilemap
     */
    protected initializeTilemap(): void {
        // Get the ground and wall layers 
        this.ground = this.getTilemap(Level5.GROUND_LAYER_KEY) as OrthogonalTilemap;
        this.walls = this.getTilemap(Level5.WALLS_LAYER_KEY) as OrthogonalTilemap;

        // Add physics to the ground layer
        this.ground.addPhysics();
        this.ground.setGroup(PhysicsGroups.GROUND);

        // Add physicss to the wall layer
        this.walls.addPhysics();
        this.walls.setGroup(PhysicsGroups.GROUND);
    }
}