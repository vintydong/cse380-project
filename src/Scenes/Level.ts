import BasicAttack from "../AI/BasicAttackBehavior";
import ParticleBehavior from "../AI/ParticleBehavior";
import PlayerController from "../AI/Player/PlayerController";
import PlayerParticleSystem from "../AI/Player/PlayerParticleSystem";
import { CustomGameEvent, CustomGameEvents, MenuEvent, MenuEvents } from "../CustomGameEvents";
import CustomFactoryManager from "../Factory/CustomFactoryManager";
import { PhysicsCollisionMap, PhysicsGroups } from "../Physics";
import BasicAttackShaderType from "../Shaders/BasicAttackShaderType";
import ParticleShaderType from "../Shaders/ParticleShaderType";
import { SkillManager } from "../Systems/SkillManager";
import AABB from "../Wolfie2D/DataTypes/Shapes/AABB";
import Circle from "../Wolfie2D/DataTypes/Shapes/Circle";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import Input from "../Wolfie2D/Input/Input";
import CanvasNode from "../Wolfie2D/Nodes/CanvasNode";
import Graphic from "../Wolfie2D/Nodes/Graphic";
import { GraphicType } from "../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Particle from "../Wolfie2D/Nodes/Graphics/Particle";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import Layer from "../Wolfie2D/Scene/Layer";
import Scene from "../Wolfie2D/Scene/Scene";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import Color from "../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../Wolfie2D/Utils/EaseFunctions";
import DemoLevel from "./DemoLevel";
import { LayerManager } from "./LayerManager";
import MainMenu from "./MainMenu";

export const LevelLayers = {
    PRIMARY: "PRIMARY",
    UI: "UI",
    SKILL_BOOK: "SKILL_BOOK",
} as const;

export type LevelLayer = typeof LevelLayers[keyof typeof LevelLayers]

export default abstract class Level extends Scene {
    public factory: CustomFactoryManager;
    protected layer_manager: LayerManager;
    protected skill_manager: SkillManager;

    /** Attributes for the level */
    protected tilemapKey: string;
    protected tilemapScale: Vec2;
    // protected tilemaps: Array<Tilemap>;

    protected levelMusicKey: string;
    // protected jumpAudioKey: string;

    /** Attributes for the player */
    public static readonly PLAYER_SPRITE_KEY = "PLAYER_SPRITE_KEY";
    public static readonly PLAYER_SPRITE_PATH = "assets/spritesheets/Player/Shadow_Knight.json";
    public static readonly PLAYER_SPAWN = new Vec2(128, 256);

    protected playerSpriteKey: string;
    protected player: AnimatedSprite;
    protected playerSpawn: Vec2;

    public static readonly ABILITY_ICONS_KEY = "ABILITY_ICONS_KEY";
    public static readonly ABILITY_ICONS_PATH = "assets/sprites/ability_icons.png";
    protected abilityIconsKey: string;

    protected weaponParticles: PlayerParticleSystem;
    // Object pool for basic attacks and bubbles
    protected basicAttacks: Array<Graphic>;
	protected bubbles: Array<Graphic>;

    /** Attributes for the UI */
    protected healthBar: Label;
    protected healthBarBg: Label;

    protected resourceBar: Label;
    protected abilityBar: Label;    

    // Layers in each Level
    protected primary: Layer;
    protected ui: Layer;
    
    protected enemies: AnimatedSprite[];

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, { ...options, physics: PhysicsCollisionMap });

        this.playerSpriteKey = Level.PLAYER_SPRITE_KEY;
        this.abilityIconsKey = Level.ABILITY_ICONS_KEY;
        this.factory = new CustomFactoryManager(this, this.tilemaps);
        this.enemies = [];
    }

    // /** Load common things for all levels */
    public loadScene(): void {
        this.load.spritesheet(Level.PLAYER_SPRITE_KEY, Level.PLAYER_SPRITE_PATH);

        this.load.image(LayerManager.PAUSE_SPRITE_KEY, LayerManager.PAUSE_SPRITE_PATH);
        this.load.image(LayerManager.CONTROL_SPRITE_KEY, LayerManager.CONTROL_SPRITE_PATH);
        this.load.image(LayerManager.HELP_SPRITE_KEY, LayerManager.HELP_SPRITE_PATH);
        this.load.image(SkillManager.SKILL_BOOK_SPRITE_KEY, SkillManager.SKILL_BOOK_SPRITE_PATH);
        
        this.load.image(Level.ABILITY_ICONS_KEY, Level.ABILITY_ICONS_PATH);
    }

    /** Common initializations between all levels */
    public startScene(): void {
        // Initialize Layers
        this.layer_manager = new LayerManager(this);
        this.primary = this.addLayer(LevelLayers.PRIMARY);
        this.ui = this.addUILayer(LevelLayers.UI);
        this.layers.add(LevelLayers.PRIMARY, this.primary);
        this.layers.add(LevelLayers.UI, this.ui);

        // Initialize Tilemaps
        if (this.tilemapKey === undefined || this.tilemapScale === undefined)
            throw new Error("Missing tilemap key or scale");

        this.factory.tilemap(this.tilemapKey, this.tilemapScale);

        this.initWeaponParticles();
        this.initObjectPools();

        // Initialize UI layer components such as health bar, ability bar, etc.
        this.initUI();

        // Initialize player
        if (this.playerSpawn === undefined) throw new Error("Player spawn missing!");
        this.player = this.factory.animatedSprite(this.playerSpriteKey, LevelLayers.PRIMARY);
        this.player.scale.set(2, 2);
        this.player.position.copy(this.playerSpawn)
        this.player.addAI(PlayerController, { tilemap: this.tilemapKey });

        // Add player physics
        this.player.addPhysics(new AABB(this.player.position.clone(), this.player.boundary.getHalfSize().clone()))
        this.player.setGroup(PhysicsGroups.PLAYER);

        // Initialize Skill Manager
        this.skill_manager = new SkillManager(this, this.player);

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
        this.receiver.subscribe(CustomGameEvents.UPDATE_HEALTH);
        this.receiver.subscribe(CustomGameEvents.TOGGLE_SKILL_BOOK);

        this.receiver.subscribe(MenuEvents.RESUME);
        this.receiver.subscribe(MenuEvents.PAUSE);
        this.receiver.subscribe(MenuEvents.RESTART);
        this.receiver.subscribe(MenuEvents.CONTROLS);
        this.receiver.subscribe(MenuEvents.HELP);
        this.receiver.subscribe(MenuEvents.EXIT);
    }

    public updateScene(deltaT: number) {
        let escButton = Input.isKeyJustPressed("escape");
        let paused = this.layer_manager.isPaused();

        let skillButton = Input.isKeyJustPressed("k");

        if(skillButton)
            this.emitter.fireEvent(CustomGameEvents.TOGGLE_SKILL_BOOK);

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
                // this.spawnBasicAttack(event.data.get("direction"));
                this.skill_manager.activateSkill(0, {direction: event.data.get("direction")})
                break;
            }
            case CustomGameEvents.SKILL_2_FIRED: {
                // this.spawnBubble(event.data.get("direction"));
                this.skill_manager.activateSkill(1, {direction: event.data.get("direction")})
                break;
            }
            case CustomGameEvents.UPDATE_HEALTH: {
                let currentHealth = event.data.get('currentHealth');
				let maxHealth = event.data.get('maxHealth');
				this.handleHealthChange(currentHealth, maxHealth);
				break;
            }

            case CustomGameEvents.TOGGLE_SKILL_BOOK: {
                this.skill_manager.toggleSkillBook();
                break;
            }

            //Main menu options
            case MenuEvents.PAUSE:
                this.layer_manager.showPauseMenu();
                for (let enemy of this.enemies) {
                    enemy.animation.pause();
                    enemy.freeze();
                }
                this.player.freeze();
                break;

            case MenuEvents.RESUME:
                this.layer_manager.hidePauseMenu();
                for (let enemy of this.enemies) {
                    enemy.animation.resume();
                    enemy.unfreeze();
                }
                this.player.unfreeze();
                break;

            case MenuEvents.RESTART:
                this.layer_manager.hidePauseMenu();
                for (let enemy of this.enemies) {
                    enemy.animation.play("IDLE");
                    enemy.unfreeze();
                }
                this.player.unfreeze();
                this.sceneManager.changeToScene(DemoLevel);
                break;

            case MenuEvents.CONTROLS:
                this.layer_manager.showControlLayer();
                break;

            case MenuEvents.HELP:
                this.layer_manager.showHelpLayer();
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

        // HealthBar Border
		this.healthBarBg = <Label>this.add.uiElement(UIElementType.LABEL, LevelLayers.UI, {position: new Vec2(125, 60), text: ""});
		this.healthBarBg.size = new Vec2(200, 25);
		this.healthBarBg.borderColor = Color.BLACK;

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
            ability.scale = new Vec2(2.5, 2.5);
        }
    }

    protected initWeaponParticles(): void {
        // Init particle system of 50 particles
        const particle_size = 3;
        this.weaponParticles = new PlayerParticleSystem(50, Vec2.ZERO, 3000, particle_size, 0, 50);
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

    protected initObjectPools(): void {
        // Init basic attack object pool
        this.basicAttacks = new Array(10);
        for (let i = 0; i < this.basicAttacks.length; i++) {
            this.basicAttacks[i] = this.add.graphic(GraphicType.RECT, LevelLayers.PRIMARY, {position: new Vec2(0, 0), size: new Vec2(75, 100)});
            
            // Give the basic attacks a custom shader
            this.basicAttacks[i].useCustomShader(BasicAttackShaderType.KEY);
            this.basicAttacks[i].visible = false;
            this.basicAttacks[i].color = Color.BLUE;

            // Give the basic attacks AI
            this.basicAttacks[i].addAI(BasicAttack);

            // Give the basic attacks a collider
            let collider = new Circle(Vec2.ZERO, 25);
            this.basicAttacks[i].setCollisionShape(collider);
            this.basicAttacks[i].addPhysics();
            this.basicAttacks[i].setGroup(PhysicsGroups.WEAPON);
            this.basicAttacks[i].setTrigger(PhysicsGroups.NPC, CustomGameEvents.ENEMY_HIT, null);

            // Add tween to particle
            this.basicAttacks[i].tweens.add("fadeout", {
                startDelay: 0,
                duration: 200,
                effects: [
                    {
                        property: "alpha",
                        start: 1,
                        end: 0,
                        ease: EaseFunctionType.IN_OUT_SINE
                    }
                ]
            });
        }
    }

    protected spawnBubble(direction: string): void {
        // Find the first visible particle
        let particle: Particle = this.weaponParticles.getPool().find((bubble: Particle) => { return !bubble.visible });
        if (particle) {
            // Bring this bubble to life
            particle.visible = true;

            particle.position = this.player.position.clone();

            particle.setAIActive(true, { direction: direction });
        }
    }

    protected spawnBasicAttack(direction: string): void {
		// Find the first visible basic attack
		let basicAttack: Graphic = this.basicAttacks.find((basicAttack: Graphic) => { return !basicAttack.visible });
        console.log("basicAttack:", basicAttack);
		if (basicAttack){
			// Bring this basic attack to life
			basicAttack.visible = true;
            basicAttack.alpha = 1;

            // Calculate basic attack offset from player center
            let newPosition = this.player.position.clone();
            let xOffset = basicAttack.boundary.getHalfSize().x
            newPosition.x += (direction == "left")? -1 * xOffset : xOffset;
            basicAttack.position = newPosition;

			basicAttack.setAIActive(true, {direction: direction});
            basicAttack.tweens.play("fadeout");
		}
	}

    public handleScreenDespawn(node: CanvasNode): void {
        // Extract the size of the viewport
		// let paddedViewportSize = this.viewport.getHalfSize().scaled(2).add(this.worldPadding);
		let viewportSize = this.viewport.getHalfSize().scaled(2);

        // Check if node is outside viewport
        let padding = 100
        let leftBound = 0 - padding
        let topBound = 0 - padding
        let rightBound = viewportSize.x + padding
        let botBound = viewportSize.y + padding
        let outOfBounds = node.position.x < leftBound || node.position.y < topBound || node.position.x > rightBound || node.position.y > botBound

		if(outOfBounds || node.alpha == 0) {
			node.position.copy(Vec2.ZERO);
			node.visible = false;
		}
	}

    protected handleHealthChange(currentHealth: number, maxHealth: number): void {
		let unit = this.healthBarBg.size.x / maxHealth;

		this.healthBar.size.set(this.healthBarBg.size.x - unit * (maxHealth - currentHealth), this.healthBarBg.size.y);
		this.healthBar.position.set(this.healthBarBg.position.x - (unit / 2) * (maxHealth - currentHealth), this.healthBarBg.position.y);

		this.healthBar.backgroundColor = currentHealth < maxHealth * 1/4 ? Color.RED: currentHealth < maxHealth * 3/4 ? Color.YELLOW : Color.GREEN;
	}
}