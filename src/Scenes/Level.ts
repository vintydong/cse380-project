import CustomFactoryManager from "../Factory/CustomFactoryManager";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import Input from "../Wolfie2D/Input/Input";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import FactoryManager from "../Wolfie2D/Scene/Factories/FactoryManager";
import Scene from "../Wolfie2D/Scene/Scene";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import PlayerController from "../AI/Player/PlayerController";
import AABB from "../Wolfie2D/DataTypes/Shapes/AABB";
import { PhysicsCollisionMap, PhysicsGroups } from "../Physics";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Color from "../Wolfie2D/Utils/Color";
import Layer from "../Wolfie2D/Scene/Layer";
import PlayerWeapon from "../AI/Player/PlayerWeapon";
import ParticleShaderType from "../Shaders/ParticleShaderType";
import ParticleBehavior from "../AI/ParticleBehavior";
import Circle from "../Wolfie2D/DataTypes/Shapes/Circle";
import Particle from "../Wolfie2D/Nodes/Graphics/Particle";
import demoEnemyActor from "../AI/demo_enemy/demoEnemyActor";
import { LayerManager } from "./LayerManager";
import { CustomGameEvent, CustomGameEvents, MenuEvent, MenuEvents } from "../CustomGameEvents";
import DemoLevel from "./DemoLevel";
import MainMenu from "./MainMenu";

export const LevelLayers = {
    PRIMARY: "PRIMARY",
    UI: "UI",
} as const;

export type LevelLayer = typeof LevelLayers[keyof typeof LevelLayers]

export default abstract class Level extends Scene {
    public factory: CustomFactoryManager;
    protected layer_manager: LayerManager;

    /** Attributes for the level */
    protected tilemapKey: string;
    protected tilemapScale: Vec2;
    // protected tilemaps: Array<Tilemap>;

    protected levelMusicKey: string;
    // protected jumpAudioKey: string;

    /** Attributes for the player */
    // public static readonly PLAYER_SPRITE_KEY = "PLAYER_SPRITE_KEY";
    // public static readonly PLAYER_SPRITE_PATH = "assets/sprites/Shadow_Knight.json";
    // public static readonly PLAYER_SPAWN = new Vec2(128, 256);

    protected playerSpriteKey: string;
    protected player: AnimatedSprite;
    protected playerSpawn: Vec2;

    protected weaponParticles: PlayerWeapon;

    /** Attributes for the UI */
    protected healthBar: Label;
    protected resourceBar: Label;
    protected abilityBar: Label;

    protected abilityIconsKey: string;
    // public static readonly ABILITY_ICONS_KEY = "ABILITY_ICONS_KEY";
    // public static readonly ABILITY_ICONS_PATH = "assets/sprites/ability_icons.png";

    // Layers in each Level
    protected primary: Layer;
    protected ui: Layer;
    
    protected enemies: AnimatedSprite[];

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, { ...options, physics: PhysicsCollisionMap });

        // this.playerSpriteKey = Level.PLAYER_SPRITE_KEY;
        // this.abilityIconsKey = Level.ABILITY_ICONS_KEY;
        this.factory = new CustomFactoryManager(this, this.tilemaps);
        this.enemies = [];
    }

    // /** Load common things for all levels */
    // public loadScene(): void {
    // }

    /** Common initializations between all levels */
    public startScene(): void {
        // Initialize Layers
        this.layer_manager = new LayerManager(this);
        this.primary = this.addLayer(LevelLayers.PRIMARY);
        this.ui = this.addLayer(LevelLayers.UI);
        // this.layers.add(LevelLayers.PRIMARY, this.primary);
        // this.layers.add(LevelLayers.UI, this.ui);

        // Initialize Tilemaps
        if (this.tilemapKey === undefined || this.tilemapScale === undefined)
            throw new Error("Missing tilemap key or scale");

        this.factory.tilemap(this.tilemapKey, this.tilemapScale);

        this.initWeaponParticles();

        // Initialize UI layer components such as health bar, ability bar, etc.
        this.initUI();

        // Initialize player
        if (this.playerSpawn === undefined) throw new Error("Player weapon system must be initialized before initializing the player!");
        this.player = this.factory.animatedSprite(this.playerSpriteKey, LevelLayers.PRIMARY);
        this.player.scale.set(2, 2);
        this.player.position.copy(this.playerSpawn)
        this.player.addAI(PlayerController, { tilemap: this.tilemapKey });

        // Add player physics
        this.player.addPhysics(new AABB(this.player.position.clone(), this.player.boundary.getHalfSize().clone()))
        this.player.setGroup(PhysicsGroups.PLAYER);

        // Initialize viewport
        if (this.player === undefined) {
            throw new Error("Player must be initialized before setting the viewport to folow the player");
        }
        this.viewport.follow(this.player);
        this.viewport.setZoomLevel(1);
        this.viewport.setBounds(0, 0, 1366, 768);

        this.subscribeEvents();

        // TODO: Probably want a level transition here
        // See hw3

        // Fire events to start game (e.g. music)

        // Input.disableInput();
    }
    
    private subscribeEvents() {
        this.receiver.subscribe(CustomGameEvents.SKILL_1_FIRED);
        this.receiver.subscribe(CustomGameEvents.SKILL_2_FIRED);
        this.receiver.subscribe(CustomGameEvents.SKILL_3_FIRED);
        this.receiver.subscribe(CustomGameEvents.SKILL_4_FIRED);

        this.receiver.subscribe(MenuEvents.RESUME);
        this.receiver.subscribe(MenuEvents.PAUSE);
        this.receiver.subscribe(MenuEvents.RESTART);
        this.receiver.subscribe(MenuEvents.CONTROLS);
        this.receiver.subscribe(MenuEvents.HELP);
        this.receiver.subscribe(MenuEvents.EXIT);
    }

    public updateScene(deltaT: number) {
        let escButton = Input.isKeyJustPressed("escape");
        // let paused = this.layer_manager.isPaused();
        let paused = false;
        if(escButton)
            paused 
                ? this.emitter.fireEvent(MenuEvents.RESUME)
                : this.emitter.fireEvent(MenuEvents.PAUSE);

        // Handle all game events
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    /**
     * Handle game events. 
     * @param event the game event
     */
    protected handleEvent(event: GameEvent): void {
        let type = event.type as MenuEvent | CustomGameEvent;
        switch (type) {
            case CustomGameEvents.SKILL_1_FIRED: {
                console.log(event.data.get("direction"));
                this.spawnBubble(event.data.get("direction"));
                break;
            }
            //Main menu options
            case MenuEvents.PAUSE:
                this.layer_manager.enablePauseLayer();
                for (let enemy of this.enemies) {
                    enemy.animation.play("IDLE");
                    enemy.freeze();
                }
                this.player.freeze();
                break;

            case MenuEvents.RESUME:
                this.layer_manager.disablePauseLayer();
                for (let enemy of this.enemies) {
                    enemy.animation.play("IDLE");
                    enemy.unfreeze();
                }
                this.player.unfreeze();
                break;

            case MenuEvents.RESTART:
                this.layer_manager.disablePauseLayer();
                for (let enemy of this.enemies) {
                    enemy.animation.play("IDLE");
                    enemy.unfreeze();
                }
                this.player.unfreeze();
                this.sceneManager.changeToScene(DemoLevel);
                break;

            case MenuEvents.CONTROLS:
                this.layer_manager.enableControlLayer();
                break;

            case MenuEvents.HELP:
                this.layer_manager.enableHelpLayer();
                break;

            case MenuEvents.EXIT:
                this.sceneManager.changeToScene(MainMenu);
                break;

            // Default: Throw an error! No unhandled events allowed.
            default: {
                throw new Error(`Unhandled event caught in scene with type ${event.type}`)
            }
        }
    }

    protected initUI() {
        // this.healthLabel = this.factory.addLabel(LevelLayers.UI, new Vec2(50, 20), "HP");
        // this.healthLabel.size.set(300, 30);
        // this.healthLabel.textColor = Color.RED;
        // this.healthLabel.fontSize = 24;
        // this.healthLabel.font = "Courier";

        this.healthBar = this.factory.addLabel(LevelLayers.UI, new Vec2(125, 60), "");
        this.healthBar.size = new Vec2(200, 25);
        this.healthBar.backgroundColor = Color.GREEN;
        this.healthBar.borderColor = Color.BLACK;

        // Resource Bar
        this.resourceBar = this.factory.addLabel(LevelLayers.UI, new Vec2(125, 105), "");
        this.resourceBar.size = new Vec2(200, 25);
        this.resourceBar.backgroundColor = Color.BLACK;
        this.resourceBar.borderColor = Color.MAGENTA;

        // Ability Bar
        const abilityBarCenter = new Vec2(150, 735);
        const abilityBarSize = new Vec2(300, 50);
        this.abilityBar = this.factory.addLabel(LevelLayers.UI, abilityBarCenter, "");
        this.abilityBar.size = abilityBarSize;
        this.abilityBar.backgroundColor = Color.TRANSPARENT;
        // this.abilityBar.borderColor = Color.MAGENTA

        const abilityBarPadding = 15;
        const abilitySquareSize = 40;
        const abilityBarStart = new Vec2(abilityBarCenter.x - abilityBarSize.x / 2, abilityBarCenter.y - abilityBarSize.y / 2);

        const abilityPositions = [new Vec2(0, 0), new Vec2(16, 0), new Vec2(0, 16), new Vec2(16, 16)]

        for (let i = 1; i < 6; i++) {
            let squarePos = new Vec2(abilityBarStart.x + abilitySquareSize * i + abilityBarPadding * (i - 1), abilityBarCenter.y)
            let square = this.factory.addLabel(LevelLayers.UI, squarePos, "")
            square.size = new Vec2(abilitySquareSize, abilitySquareSize);
            square.backgroundColor = new Color(115, 115, 115);

            let offset = i < abilityPositions.length ? abilityPositions[i - 1] : abilityPositions[abilityPositions.length - 1]
            let ability = this.factory.addSprite(this.abilityIconsKey, LevelLayers.UI, offset);
            ability.position = squarePos;
            ability.size = new Vec2(16, 16);
            ability.scale = new Vec2(2, 2);
        }
    }

    protected initWeaponParticles(): void {
        // Init particle system of 50 particles
        const particle_size = 3;
        this.weaponParticles = new PlayerWeapon(50, Vec2.ZERO, 3000, particle_size, 0, 50);
        this.weaponParticles.initializePool(this, LevelLayers.PRIMARY);

        let pool = this.weaponParticles.getPool();

        for (let i = 0; i < this.weaponParticles.getPool().length; i++) {
            pool[i].useCustomShader(ParticleShaderType.KEY);
            pool[i].visible = false;
            pool[i].color = Color.BLUE;

            // Give the particles AI
            pool[i].addAI(ParticleBehavior);

            // Give the particles a collider
            let collider = new Circle(Vec2.ZERO, particle_size*particle_size);
            pool[i].setCollisionShape(collider);
            pool[i].addPhysics();
            pool[i].setGroup(PhysicsGroups.WEAPON);
            pool[i].setTrigger(PhysicsGroups.NPC, 'ENEMY_HIT', null);
        }
    }

    protected spawnBubble(direction: string): void {
        // Find the first visible bubble
        // let particle: Particle = this.weaponParticles.getPool().find((bubble: Particle) => { return !bubble.visible });
        // if (bubble) {
        //     // Bring this bubble to life
        //     bubble.visible = true;

        //     bubble.position = this.player.position.clone();

        //     bubble.setAIActive(true, { direction: direction });
        // }
    }

    // public handleScreenDespawn(node: CanvasNode): void {
    //     // Extract the size of the viewport
    //     let paddedViewportSize = this.viewport.getHalfSize().scaled(2).add(this.worldPadding);
    //     let viewportSize = this.viewport.getHalfSize().scaled(2);

    //     let leftBound = (paddedViewportSize.x - viewportSize.x) - (2 * this.worldPadding.x);
    //     let topBound = (paddedViewportSize.y - viewportSize.y) - (2 * this.worldPadding.y);

    //     if (node.position.x < leftBound || node.position.y < topBound) {
    //         node.position.copy(Vec2.ZERO);
    //         node.visible = false;
    //     }
    // }
}