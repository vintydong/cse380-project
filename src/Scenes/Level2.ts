import { SlimeBossActor, SlimeBossController } from "../AI/Bosses/SlimeBoss";
import { SlimeBehavior, SlimeController } from "../AI/Bosses/SlimeBossAI";
import demoEnemyActor from "../AI/demo_enemy/demoEnemyActor";
import demoEnemyController from "../AI/demo_enemy/demoEnemyController";
import { CustomGameEvents } from "../CustomGameEvents";
import { PhysicsGroups } from "../Physics";
import Circle from "../Wolfie2D/DataTypes/Shapes/Circle";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import Level, { LevelLayers } from "./Level";

export default class Level2 extends Level {    
    public static readonly ENEMY_SPRITE_KEY = "LEVEL2_ENEMY_KEY";
    public static readonly ENEMY_SPRITE_PATH = "assets/spritesheets/Bosses/Slime_Boss.json";
    public static readonly ENEMY_POSITIONS_KEY = "LEVEL2_ENEMY_POSITIONS";
    // public static readonly ENEMY_POSIITIONS_PATH = "assets/data/demo_enemy.json";

    public static readonly TILEMAP_KEY = "Level2";
    public static readonly TILEMAP_PATH = "assets/tilemaps/level2_tilemap.json";
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
        this.tilemapKey = Level2.TILEMAP_KEY;
        this.tilemapScale = Level2.TILEMAP_SCALE;

        // Set the player's spawn
        this.playerSpawn = new Vec2(164 * 6, 112 * 6);
        // Music and sound
    }

    /**
     * Load in our resources for the level
     */
    public loadScene(): void {
        super.loadScene();

        // Load in the tilemap
        this.load.tilemap(this.tilemapKey, Level2.TILEMAP_PATH);
        // Load in the player's sprite
        this.load.spritesheet(this.playerSpriteKey, Level2.PLAYER_SPRITE_PATH);
        // Load in ability icons
        this.load.image(this.abilityIconsKey, Level2.ABILITY_ICONS_PATH);
        
        // Load in level 2 enemies
        this.load.spritesheet(Level2.ENEMY_SPRITE_KEY, Level2.ENEMY_SPRITE_PATH);
        this.load.object(Level2.ENEMY_POSITIONS_KEY, Level2.TILEMAP_PATH);

        // Load UI layer sprites
        // Audio and music
    }

    /**
     * Unload resources for level 2
     */
    // public unloadScene(): void {
    //     // TODO decide which resources to keep/cull 
    // }

    public startScene(): void {
        super.startScene();
        // Initialize demo_level enemies
        let tilemap_json = this.load.getObject(Level2.ENEMY_POSITIONS_KEY);
        let enemies = tilemap_json.layers.find(layer => layer.name === "Enemy")

        // Level 2 is boss level -- only one enemy
        let enemy = this.factory.addAnimatedSprite(SlimeBossActor, Level2.ENEMY_SPRITE_KEY, LevelLayers.PRIMARY) as demoEnemyActor
        enemy.position.set(enemies.objects[0].x * this.tilemapScale.x, enemies.objects[0].y * this.tilemapScale.y);
        enemy.scale = new Vec2(2,2);
        enemy.addPhysics(new Circle(enemy.position, 16 * 2));
        enemy.setGroup(PhysicsGroups.NPC);
        enemy.setTrigger(PhysicsGroups.WEAPON, CustomGameEvents.ENEMY_HIT, null);
        enemy.setTrigger(PhysicsGroups.PLAYER, CustomGameEvents.PLAYER_ENEMY_COLLISION, null);
        enemy.navkey = "navmesh";

        // let healthbar = new HealthbarHUD(this, npc, "primary", {size: npc.size.clone().scaled(2, 1/2), offset: npc.size.clone().scaled(0, -1/2)});
        // this.healthbars.set(npc.id, healthbar);

        enemy.addAI(SlimeBossController, { tilemap: this.tilemapKey });
        enemy.animation.play("IDLE");
        this.enemies.push(enemy);

        
        // Set level end
        // const levelEnd = new Vec2(20.5, 14).scale(this.tilemapScale.x * 8, this.tilemapScale.y * 8);
        // let rect = this.factory.addGraphic(GraphicType.RECT, LevelLayers.PRIMARY, levelEnd, new Vec2(3 * 8 * 6, 4 * 8 * 6));
        // rect.color = Color.RED;
        // rect.addPhysics();
        // rect.setGroup(PhysicsGroups.LEVEL_END);
        // rect.setTrigger(PhysicsGroups.PLAYER, CustomGameEvents.PLAYER_ENTER_LEVEL_END, null);

        this.viewport.setBounds(8 * 6, 0, 8 * 6 * 40, 8 * 6 * 25);
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