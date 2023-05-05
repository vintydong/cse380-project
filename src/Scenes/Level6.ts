import { TalonActor, TalonController, TalonProjectile, TalonProjectileAI } from "../AI/Enemies/Talon";
import { CustomGameEvents, MenuEvents } from "../CustomGameEvents";
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
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import Color from "../Wolfie2D/Utils/Color";
import Level, { LevelLayers } from "./Level";
import MainMenu from "./MenuScenes/MainMenu";

export default class Level6 extends Level {    
    public static readonly TALON_SPRITE_KEY = "LEVEL6_ENEMY_KEY";
    public static readonly TALON_SPRITE_PATH = "assets/spritesheets/Enemies/Talon/Talon.json";
    public static readonly ENEMY_POSITIONS_KEY = "LEVEL6_ENEMY_POSITIONS";

    public static readonly TALON_PROJECTILE_KEY = "TALON_PROJECTILE_KEY"
    public static readonly TALON_PROJECTILE_PATH = "assets/spritesheets/Enemies/Talon/Talon_Projectile.json";

    public static readonly TALON_DYING_AUDIO_KEY = "TALON_DYING_AUDIO_KEY";
    public static readonly TALON_DYING_AUDIO_PATH = "assets/sounds/talon_dying.wav";

    public static readonly TILEMAP_KEY = "Level6";
    public static readonly TILEMAP_PATH = "assets/tilemaps/Level6_tilemap.json";
    public static readonly TILEMAP_SCALE = new Vec2(6, 6);

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "assets/music/hw5_level_music.wav";

    protected platFormPositions: Array<Vec2>;
    protected talonDyingAudioKey: string;
    
    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = Level6.TILEMAP_KEY;
        this.tilemapScale = Level6.TILEMAP_SCALE;
        // this.levelMusicKey = Level6.LEVEL_MUSIC_KEY;

        // Set the player's spawn
        this.playerSpawn = new Vec2(8 * 6 * 7, 8 * 6 * 8);

        // Music and sound
        this.talonDyingAudioKey = Level6.TALON_DYING_AUDIO_KEY;

        //Extras
        this.platFormPositions = [new Vec2(720, 256), new Vec2(720, 544), new Vec2(336, 400), new Vec2(1104, 400)]
    }

    /**
     * Load in our resources for demo level
     * These things should be laoded in Level 1 and then kept in the resource manager
     */
    public loadScene(): void {
        super.loadScene();
        
        /* Tilemap */
        this.load.tilemap(this.tilemapKey, Level6.TILEMAP_PATH);
                
        /* Audio and Sounds */
        // this.load.audio(this.levelMusicKey, Level6.LEVEL_MUSIC_PATH)

        /* AI */
        this.load.spritesheet(Level6.TALON_SPRITE_KEY, Level6.TALON_SPRITE_PATH);
        this.load.spritesheet(Level6.TALON_PROJECTILE_KEY, Level6.TALON_PROJECTILE_PATH);
        this.load.object(Level6.ENEMY_POSITIONS_KEY, Level6.TILEMAP_PATH);

        /* Abilities */
        this.load.image(Repel.REPEL_SPRITE_KEY, Repel.REPEL_SPRITE_PATH);
    }

    /**
     * Unload resources for level 6
     */
    public unloadScene(): void {
        // Unload all resources
        // this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.levelMusicKey});
    }

    public startScene(): void {
        super.startScene();

        // Initialize enemies
        let tilemap_json = this.load.getObject(Level6.ENEMY_POSITIONS_KEY);
        let enemies = tilemap_json.layers.find(layer => layer.name === "Enemy")

        for (let i = 0; i < enemies.objects.length; i++) {
            // Initialize Enemy
            let enemy = this.factory.addAnimatedSprite(TalonActor, Level6.TALON_SPRITE_KEY, LevelLayers.PRIMARY) as TalonActor
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

        // Initialize Viewport
        this.viewport.setBounds(0, 0, 8 * 6 * 30, 8 * 6 * 19);
        // Set Level End
        this.initializeLevelEnd();
    }

    public updateScene(deltaT) {
        console.log(this.player.position.x, this.player.position.y)
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
                for (let i = 0; i < this.enemies.length; i++) {
                    if (this.enemies[i].visible) return;
                }
                this.emitter.fireEvent(CustomGameEvents.LEVEL_END)
                break;
            }
            case CustomGameEvents.LEVEL_NEXT: {
                this.sceneManager.changeToScene(MainMenu);
                break;
            }
            // Let Level.ts handle it by default
            default:
                super.handleEvent(event);
                break;
        }
    }

    private initializeLevelEnd(): void {
        const levelEnd = new Vec2(23, 55.5).scale(this.tilemapScale.x * 8, this.tilemapScale.y * 8);
        let rect = this.factory.addGraphic(GraphicType.RECT, LevelLayers.PRIMARY, levelEnd, new Vec2(2 * 8 * 6, 3 * 8 * 6));
        rect.color = Color.TRANSPARENT;
        rect.addPhysics();
        rect.setGroup(PhysicsGroups.LEVEL_END);
        rect.setTrigger(PhysicsGroups.PLAYER, CustomGameEvents.PLAYER_ENTER_LEVEL_END, null);

        this.emitter.fireEvent(GameEventType.PLAY_MUSIC, { key: this.levelMusicKey, loop: true, holdReference: true });
    }

    /* Getters */
    public getNewRandomPlatform(curPos: Vec2): Vec2 {
        var newIndex: number
        let prevIndex = this.platFormPositions.indexOf(curPos)
        while (!newIndex || newIndex === prevIndex) { 
            newIndex = Math.round(Math.random() * 3)
        }
        return this.platFormPositions[newIndex]
    }

    public getTalonDyingAudioKey(): string {
        return this.talonDyingAudioKey
    }

    /*  Platform Positions 
        Top - (720, 256)
        Bottom - (720, 544)
        Left - (336, 400) 
        Right - (1104, 400)
    */
}