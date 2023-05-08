import { SlimeActor, SlimeController } from "../AI/Enemies/Slime";
import { CustomGameEvents } from "../CustomGameEvents";
import { PhysicsGroups } from "../Physics";
import Circle from "../Wolfie2D/DataTypes/Shapes/Circle";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import { GraphicType } from "../Wolfie2D/Nodes/Graphics/GraphicTypes";
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import Color from "../Wolfie2D/Utils/Color";
import Level, { LevelLayers } from "./Level";
import Level2 from "./Level2";

export default class Level1 extends Level {
    public static readonly ENEMY_SPRITE_KEY = "LEVEL1_ENEMY_KEY";
    public static readonly ENEMY_SPRITE_PATH = "assets/spritesheets/Enemies/Slime.json";
    public static readonly ENEMY_POSITIONS_KEY = "LEVEL1_ENEMY_POSITIONS";

    public static readonly TILEMAP_KEY = "Level1";
    public static readonly TILEMAP_PATH = "assets/tilemaps/level1_tilemap.json";
    public static readonly TILEMAP_SCALE = new Vec2(6, 6);

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "assets/music/area1_music.mp3";

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = Level1.TILEMAP_KEY;
        this.tilemapScale = Level1.TILEMAP_SCALE;
        this.levelMusicKey = Level1.LEVEL_MUSIC_KEY;

        // Set the player's spawn
        this.playerSpawn = new Vec2(128, 600);
        // Music and sound
    }

    /**
     * Load in our resources for demo level
     * These things should be laoded in Level 1 and then kept in the resource manager
     */
    public loadScene(): void {
        super.loadScene();

        // Load in the tilemap
        this.load.tilemap(Level1.TILEMAP_KEY, Level1.TILEMAP_PATH);
        // Load in music
        this.load.audio(Level1.LEVEL_MUSIC_KEY, Level1.LEVEL_MUSIC_PATH);

        // Load in level 1 enemies
        this.load.spritesheet(Level1.ENEMY_SPRITE_KEY, Level1.ENEMY_SPRITE_PATH);
        this.load.object(Level1.ENEMY_POSITIONS_KEY, Level1.TILEMAP_PATH);
    }

    /**
     * Unload resources for level 1
     */
    public unloadScene(): void {
        super.unloadScene();
        
        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: this.levelMusicKey });
    }

    public startScene(): void {
        super.startScene();
        // Initialize demo_level enemies
        let tilemap_json = this.load.getObject(Level1.ENEMY_POSITIONS_KEY);
        let enemies = tilemap_json.layers.find(layer => layer.name === "Enemy")

        for (let i = 0; i < enemies.objects.length; i++) {
            let enemy = this.factory.addAnimatedSprite(SlimeActor, Level1.ENEMY_SPRITE_KEY, LevelLayers.PRIMARY) as SlimeActor
            enemy.position.set(enemies.objects[i].x * 6, enemies.objects[i].y * 6);
            enemy.scale = new Vec2(1.5, 1.5);
            enemy.addPhysics(new Circle(enemy.position, 16 * 1.5));
            enemy.setGroup(PhysicsGroups.NPC);
            enemy.setTrigger(PhysicsGroups.PLAYER, 'ENEMY_COLLISION', null);
            enemy.navkey = "navmesh";

            // let healthbar = new HealthbarHUD(this, npc, "primary", {size: npc.size.clone().scaled(2, 1/2), offset: npc.size.clone().scaled(0, -1/2)});
            // this.healthbars.set(npc.id, healthbar);

            enemy.addAI(SlimeController, { tilemap: this.tilemapKey });
            enemy.animation.play("IDLE");
            this.enemies.push(enemy);
        }

        // Set level end
        const levelEnd = new Vec2(54.5, 14).scale(this.tilemapScale.x * 8, this.tilemapScale.y * 8);
        let rect = this.factory.addGraphic(GraphicType.RECT, LevelLayers.PRIMARY, levelEnd, new Vec2(3 * 8 * 6, 4 * 8 * 6));
        rect.color = Color.TRANSPARENT;
        rect.addPhysics();
        rect.setGroup(PhysicsGroups.LEVEL_END);
        rect.setTrigger(PhysicsGroups.PLAYER, CustomGameEvents.PLAYER_ENTER_LEVEL_END, null);

        this.viewport.setBounds(8 * 6, 0, 8 * 6 * 78, 8 * 6 * 21);

        this.nextLevel = Level2;
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
                break;
            }
            default:
                super.handleEvent(event);
                break;
            // throw new Error(`Event handler not implemented for event type ${event.type}`)
        }
    }
}