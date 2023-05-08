import { KnightBossActor, KnightBossController } from "../AI/Bosses/KnightBoss";
import demoEnemyActor from "../AI/demo_enemy/demoEnemyActor";
import { CustomGameEvents } from "../CustomGameEvents";
import { PhysicsGroups } from "../Physics";
import AABB from "../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import Level, { LevelLayers } from "./Level";
import Level5 from "./Level5";

export default class Level4 extends Level {    
    public static readonly ENEMY_SPRITE_KEY = "LEVEL4_ENEMY_KEY";
    public static readonly ENEMY_SPRITE_PATH = "assets/spritesheets/Bosses/Enemy_Knight_Boss.json";
    public static readonly ENEMY_POSITIONS_KEY = "LEVEL4_ENEMY_POSITIONS";
    // public static readonly ENEMY_POSIITIONS_PATH = "assets/data/demo_enemy.json";

    public static readonly TILEMAP_KEY = "Level4";
    public static readonly TILEMAP_PATH = "assets/tilemaps/level4_tilemap.json";
    public static readonly TILEMAP_SCALE = new Vec2(6, 6);

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "assets/music/area2_music.wav";

    // The padding of the world
	private worldPadding: Vec2;

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = Level4.TILEMAP_KEY;
        this.tilemapScale = Level4.TILEMAP_SCALE;
        this.levelMusicKey = Level4.LEVEL_MUSIC_KEY;

        // Set the player's spawn
        this.playerSpawn = new Vec2(6 * 8 * 6, 15 * 6 * 8);
        // Music and sound
    }

    /**
     * Load in our resources for the level
     */
    public loadScene(): void {
        super.loadScene();

        // Load in the tilemap
        this.load.tilemap(this.tilemapKey, Level4.TILEMAP_PATH);
        
        // Load in level 4 enemies
        this.load.spritesheet(Level4.ENEMY_SPRITE_KEY, Level4.ENEMY_SPRITE_PATH);
        this.load.object(Level4.ENEMY_POSITIONS_KEY, Level4.TILEMAP_PATH);

        this.load.audio(this.levelMusicKey, Level4.LEVEL_MUSIC_PATH)
    }

    public startScene(): void {
        super.startScene();
        // Initialize demo_level enemies
        let tilemap_json = this.load.getObject(Level4.ENEMY_POSITIONS_KEY);
        let enemies = tilemap_json.layers.find(layer => layer.name === "Enemy")

        // Level 2 is boss level -- only one enemy
        let enemy = this.factory.addAnimatedSprite(KnightBossActor, Level4.ENEMY_SPRITE_KEY, LevelLayers.PRIMARY) as KnightBossActor
        enemy.position.set(enemies.objects[0].x * this.tilemapScale.x, enemies.objects[0].y * this.tilemapScale.y);
        enemy.scale = new Vec2(2.5,2.5);
        enemy.addPhysics(new AABB(enemy.position, new Vec2(16 * 2.5, 16 * 2.5)));
        enemy.setGroup(PhysicsGroups.NPC);
        enemy.setTrigger(PhysicsGroups.PLAYER, CustomGameEvents.PLAYER_ENEMY_COLLISION, null);
        enemy.navkey = "navmesh";

        // let healthbar = new HealthbarHUD(this, npc, "primary", {size: npc.size.clone().scaled(2, 1/2), offset: npc.size.clone().scaled(0, -1/2)});
        // this.healthbars.set(npc.id, healthbar);

        enemy.addAI(KnightBossController, { tilemap: this.tilemapKey });
        enemy.animation.play("IDLE");
        this.enemies.push(enemy);

        
        // Set level end
        // const levelEnd = new Vec2(20.5, 14).scale(this.tilemapScale.x * 8, this.tilemapScale.y * 8);
        // let rect = this.factory.addGraphic(GraphicType.RECT, LevelLayers.PRIMARY, levelEnd, new Vec2(3 * 8 * 6, 4 * 8 * 6));
        // rect.color = Color.RED;
        // rect.addPhysics();
        // rect.setGroup(PhysicsGroups.LEVEL_END);
        // rect.setTrigger(PhysicsGroups.PLAYER, CustomGameEvents.PLAYER_ENTER_LEVEL_END, null);

        this.viewport.setBounds(8 * 6, 8 * 6, 8 * 6 * 36, 8 * 6 * 19);

        this.nextLevel = Level5;

        this.emitter.fireEvent(GameEventType.PLAY_MUSIC, {key: this.levelMusicKey, loop: true, holdReference: true});
    }

    public updateScene(deltaT) {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        let allEnemiesDefeated = true
        for(let i = 0; i < this.enemies.length; i++){
            if(this.enemies[i].visible) allEnemiesDefeated = false;
        }

        super.updateScene(deltaT);

        if(allEnemiesDefeated)
            this.emitter.fireEvent(CustomGameEvents.LEVEL_END)
    }

    /**
     * This method helps with handling events. 
     * 
     * @param event the event to be handled
     * @see GameEvent
     */
    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            default:
                super.handleEvent(event);
                break;
                // throw new Error(`Event handler not implemented for event type ${event.type}`)
        }
    }
}