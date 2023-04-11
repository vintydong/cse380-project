import demoEnemyActor from "../AI/demo_enemy/demoEnemyActor";
import demoEnemyController from "../AI/demo_enemy/demoEnemyController";
import { PhysicsGroups } from "../Physics";
import AABB from "../Wolfie2D/DataTypes/Shapes/AABB";
import Spritesheet from "../Wolfie2D/DataTypes/Spritesheet";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import Circle from "../Wolfie2D/DataTypes/Shapes/Circle";
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import Level, { LevelLayers } from "./Level";
import Graphic from "../Wolfie2D/Nodes/Graphic";
import { GraphicType } from "../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Color from "../Wolfie2D/Utils/Color";
import GameEvent from "../Wolfie2D/Events/GameEvent";

import BubbleShaderType from "../Shaders/BubbleShaderType";

import BubbleAI from "../AI/BubbleBehavior";

import { GameEvents } from "../GameEvents";
import CanvasNode from "../Wolfie2D/Nodes/CanvasNode";

/**
 * A type for layers in the HW3Scene. It seems natural to want to use some kind of enum type to
 * represent the different layers in the HW3Scene, however, it is generally bad practice to use
 * Typescripts enums. As an alternative, I'm using a const object.
 * 
 * @author PeteyLumpkins
 * 
 * {@link https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums}
 */
export const HW2Layers = {
	PRIMARY: "PRIMARY",
	BACKGROUND: "BACKGROUND", 
	UI: "UI"
} as const;

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

    // Object pool for bubbles
	private bubbles: Array<Graphic>;
    
    // The padding of the world
	private worldPadding: Vec2;

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
        
        // Load in the shader for bubble.
      this.load.shader(
        BubbleShaderType.KEY,
        BubbleShaderType.VSHADER,
        BubbleShaderType.FSHADER
      );

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
        this.initObjectPools();
        this.subscribeToEvents();

        // Initialize demo_level enemies
        let enemies = this.load.getObject(DemoLevel.ENEMY_POSITIONS_KEY);
        console.log(enemies.positions[0].x);
        for(let i = 0; i < enemies.positions.length; i++){
            let enemy = this.factory.addAnimatedSprite(demoEnemyActor, DemoLevel.ENEMY_SPRITE_KEY, LevelLayers.PRIMARY) as demoEnemyActor
            enemy.position.set(enemies.positions[i].x * 6, enemies.positions[i].y * 6);
            enemy.addPhysics();
            enemy.setGroup(PhysicsGroups.NPC);
            console.log(enemy);
            enemy.setTrigger(PhysicsGroups.WEAPON, 'ENEMY_HIT', null);
            enemy.navkey = "navmesh";
            
            console.log("Enemy", enemy);
            // let healthbar = new HealthbarHUD(this, npc, "primary", {size: npc.size.clone().scaled(2, 1/2), offset: npc.size.clone().scaled(0, -1/2)});
            // this.healthbars.set(npc.id, healthbar);

            enemy.addAI(demoEnemyController, {tilemap: this.tilemapKey});
            enemy.animation.play("IDLE");
        }
        // Set the next level to be Level2
        // this.nextLevel = null;
    }

    public updateScene(deltaT: number) {
        // Handle all game events
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        
        // for (let bubble of this.bubbles) if (bubble.visible) this.handleScreenDespawn(bubble);
    }

    /**
	 * This method helps with handling events. 
	 * 
	 * @param event the event to be handled
	 * @see GameEvent
	 */
	protected handleEvent(event: GameEvent){
		switch(event.type) {
			case GameEvents.SKILL_1_FIRED: {
                console.log(event.data.get("direction"));
				this.spawnBubble(event.data.get("direction"));
                break;
			}
			default: {
				throw new Error(`Unhandled event with type ${event.type} caught in ${this.constructor.name}`);
			}
		}

	}

    /**
	 * This method initializes each of the object pools for this scene.
	 * 
	 * @remarks
	 * 
	 * There are three object pools that need to be initialized before the scene 
	 * can start running. They are as follows:
	 * 
	 * 1. The bubble object-pool
	 * 2. The mine object-pool
	 * 3. The laseer object-pool
	 * 
	 * For each object-pool, if an object is not currently in use, it's visible
	 * flag will be set to false. If an object is in use, then it's visible flag
	 * will be set to true. This makes returning objects to their respective pools
	 * as simple as just setting a flag.
	 * 
	 * @see {@link https://gameprogrammingpatterns.com/object-pool.html Object-Pools} 
	 */
	protected initObjectPools(): void {
		
		// Init bubble object pool
		this.bubbles = new Array(10);
		for (let i = 0; i < this.bubbles.length; i++) {
			this.bubbles[i] = this.add.graphic(GraphicType.RECT, HW2Layers.PRIMARY, {position: new Vec2(0, 0), size: new Vec2(50, 50)});
            
            // Give the bubbles a custom shader
			this.bubbles[i].useCustomShader(BubbleShaderType.KEY);
			this.bubbles[i].visible = false;
			this.bubbles[i].color = Color.BLUE;

            // Give the bubbles AI
			this.bubbles[i].addAI(BubbleAI);

            // Give the bubbles a collider
			let collider = new Circle(Vec2.ZERO, 25);
			this.bubbles[i].setCollisionShape(collider);
            this.bubbles[i].addPhysics();
            this.bubbles[i].setGroup(PhysicsGroups.WEAPON);
            this.bubbles[i].setTrigger(PhysicsGroups.NPC, 'ENEMY_HIT', null);
		}
    }

    protected spawnBubble(direction: string): void {
		// Find the first visible bubble
		let bubble: Graphic = this.bubbles.find((bubble: Graphic) => { return !bubble.visible });
        console.log("BUBBLE:", bubble);
		if (bubble){
			// Bring this bubble to life
			bubble.visible = true;

            bubble.position = this.player.position.clone();

            // bubble.addAI(BubbleAI);
			bubble.setAIActive(true, {direction: direction});
		}
	}

    public handleScreenDespawn(node: CanvasNode): void {
        // Extract the size of the viewport
		let paddedViewportSize = this.viewport.getHalfSize().scaled(2).add(this.worldPadding);
		let viewportSize = this.viewport.getHalfSize().scaled(2);
		
		let leftBound = (paddedViewportSize.x - viewportSize.x) - (2 * this.worldPadding.x); 
		let topBound = (paddedViewportSize.y - viewportSize.y) - (2 * this.worldPadding.y);

		if(node.position.x < leftBound || node.position.y < topBound ) {
			node.position.copy(Vec2.ZERO);
			node.visible = false;
		}
	}

    protected subscribeToEvents(): void {
        this.receiver.subscribe(GameEvents.SKILL_1_FIRED);
    }
}