import { BasicEnemyController } from "../AI/BasicEnemyController";
import { SlimeBossActor, SlimeBossController } from "../AI/Bosses/SlimeBoss";
import demoEnemyActor from "../AI/demo_enemy/demoEnemyActor";
import { CustomGameEvents } from "../CustomGameEvents";
import { PhysicsGroups } from "../Physics";
import BossHUD from "../Systems/HUD/BossHUD";
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
import Level3 from "./Level3";

export default class Level2 extends Level {    
    public static readonly ENEMY_SPRITE_KEY = "LEVEL2_ENEMY_KEY";
    public static readonly ENEMY_SPRITE_PATH = "assets/spritesheets/Bosses/Slime_Boss.json";
    public static readonly ENEMY_POSITIONS_KEY = "LEVEL2_ENEMY_POSITIONS";
    // public static readonly ENEMY_POSIITIONS_PATH = "assets/data/demo_enemy.json";

    public static readonly TILEMAP_KEY = "Level2";
    public static readonly TILEMAP_PATH = "assets/tilemaps/level2_tilemap.json";
    public static readonly TILEMAP_SCALE = new Vec2(6, 6);

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "assets/music/exploration.mp3";
    
    // The padding of the world
	private worldPadding: Vec2;

    private spawnedSlimes: boolean = false;
    private bossHP: BossHUD;

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = Level2.TILEMAP_KEY;
        this.tilemapScale = Level2.TILEMAP_SCALE;
        this.levelMusicKey = Level2.LEVEL_MUSIC_KEY;

        // Set the player's spawn
        this.playerSpawn = new Vec2(2 * 8 * 6, 2 * 8 * 6);
        // Music and sound
    }

    /**
     * Load in our resources for the level
     */
    public loadScene(): void {
        super.loadScene();

        // Load in the tilemap
        this.load.tilemap(this.tilemapKey, Level2.TILEMAP_PATH);
        // Load in music
        this.load.audio(this.levelMusicKey, Level2.LEVEL_MUSIC_PATH)
        
        // Load in level 2 enemies
        this.load.spritesheet(Level2.ENEMY_SPRITE_KEY, Level2.ENEMY_SPRITE_PATH);
        this.load.object(Level2.ENEMY_POSITIONS_KEY, Level2.TILEMAP_PATH);
    }

    /**
     * Unload resources for level 2
     */
    public unloadScene(): void {
        super.unloadScene();

        this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: this.levelMusicKey });
    }

    public startScene(): void {
        super.startScene();
        // Initialize demo_level enemies
        let tilemap_json = this.load.getObject(Level2.ENEMY_POSITIONS_KEY);
        let enemies = tilemap_json.layers.find(layer => layer.name === "Enemy")

        // Level 2 is boss level -- only one enemy
        let enemy = this.factory.addAnimatedSprite(SlimeBossActor, Level2.ENEMY_SPRITE_KEY, LevelLayers.PRIMARY) as SlimeBossActor
        enemy.position.set(enemies.objects[0].x * this.tilemapScale.x, enemies.objects[0].y * this.tilemapScale.y);
        enemy.scale = new Vec2(2,2);
        enemy.addPhysics(new Circle(enemy.position, 16 * 2));
        enemy.setGroup(PhysicsGroups.NPC);
        enemy.setTrigger(PhysicsGroups.PLAYER, CustomGameEvents.PLAYER_ENEMY_COLLISION, null);
        enemy.navkey = "navmesh";

        enemy.addAI(SlimeBossController, { tilemap: this.tilemapKey });

        this.bossHP = new BossHUD(this, enemy._ai as BasicEnemyController, LevelLayers.UI);

        enemy.animation.play("IDLE");
        this.enemies.push(enemy);

        // Add in two more slimes that will spawn when the boss dies
        for(let i = 0; i < 2; i++){
            let enemy = this.factory.addAnimatedSprite(SlimeBossActor, Level2.ENEMY_SPRITE_KEY, LevelLayers.PRIMARY) as SlimeBossActor;
            enemy.position.set(3000, 3000);
            enemy.visible = false;
            this.enemies.push(enemy);
        }

        // Set level end
        const levelEnd = new Vec2(20.5, 14).scale(this.tilemapScale.x * 8, this.tilemapScale.y * 8);
        let rect = this.factory.addGraphic(GraphicType.RECT, LevelLayers.PRIMARY, levelEnd, new Vec2(3 * 8 * 6, 4 * 8 * 6));
        // rect.color = Color.RED;
        rect.color = Color.TRANSPARENT;
        rect.addPhysics();
        rect.setGroup(PhysicsGroups.LEVEL_END);
        rect.setTrigger(PhysicsGroups.PLAYER, CustomGameEvents.PLAYER_ENTER_LEVEL_END, null);

        this.viewport.setBounds(8 * 6, 0, 8 * 6 * 40, 8 * 6 * 25);

        this.nextLevel = Level3;
        this.emitter.fireEvent(GameEventType.PLAY_MUSIC, {key: this.levelMusicKey, loop: true, holdReference: true});
    }

    public updateScene(deltaT) {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        // if(this.enemies[0].visible)
            this.bossHP.update(deltaT);
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
            // TODO: Remove temporarily change to main menu
            case CustomGameEvents.PLAYER_ENTER_LEVEL_END: {
                let allEnemiesDefeated = true
                for(let i = 0; i < this.enemies.length; i++)
                    if(this.enemies[i].visible) allEnemiesDefeated = false;

                if(allEnemiesDefeated) this.emitter.fireEvent(CustomGameEvents.LEVEL_END)
                break;
            }
            case CustomGameEvents.LEVEL_NEXT: {
                this.sceneManager.changeToScene(Level3);
                break;
            }
            default:
                super.handleEvent(event);
                break;
                // throw new Error(`Event handler not implemented for event type ${event.type}`)
        }
    }

    public spawnEnemy(pos: Vec2): void {
        if(this.spawnedSlimes) return;
        for(let i = 1; i < this.enemies.length; i++){
            let enemy = this.enemies[i] as demoEnemyActor;
            enemy.position = pos.clone()
            if(i > 1)
                enemy.position.x = enemy.position.x + (Math.random() * 20) - 10
            
            enemy.scale = new Vec2(1.5,1.5);
            enemy.addPhysics(new Circle(enemy.position, 16 * 1.5));
            enemy.setGroup(PhysicsGroups.NPC);
            enemy.setTrigger(PhysicsGroups.PLAYER, CustomGameEvents.PLAYER_ENEMY_COLLISION, null);
            enemy.navkey = "navmesh";

            // let healthbar = new HealthbarHUD(this, npc, "primary", {size: npc.size.clone().scaled(2, 1/2), offset: npc.size.clone().scaled(0, -1/2)});
            // this.healthbars.set(npc.id, healthbar);
            enemy.addAI(SlimeBossController, { tilemap: this.tilemapKey, hp: 50 });

            enemy.visible = true;
        }
        this.spawnedSlimes = true;
    }
}