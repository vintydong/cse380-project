import PlayerController from "../AI/Player/PlayerController";
import PlayerParticleSystem from "../AI/Player/PlayerParticleSystem";
import { CustomGameEvent, CustomGameEvents, MenuEvent, MenuEvents } from "../CustomGameEvents";
import CustomFactoryManager from "../Factory/CustomFactoryManager";
import { PhysicsCollisionMap, PhysicsGroups } from "../Physics";
import PlayerHUD from "../Systems/HUD/PlayerHUD";
import { LayerManager } from "../Systems/LayerManager";
import { SkillBookEvent, SkillBookEvents, SkillManager } from "../Systems/SkillManager";
import Melee from "../Systems/Skills/Melee";
import Repel from "../Systems/Skills/Repel";
import Slash from "../Systems/Skills/Slash";
import Spin from "../Systems/Skills/Spin";
import AABB from "../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import Input from "../Wolfie2D/Input/Input";
import Graphic from "../Wolfie2D/Nodes/Graphic";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Label from "../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import RenderingManager from "../Wolfie2D/Rendering/RenderingManager";
import Layer from "../Wolfie2D/Scene/Layer";
import Scene from "../Wolfie2D/Scene/Scene";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import Viewport from "../Wolfie2D/SceneGraph/Viewport";
import Color from "../Wolfie2D/Utils/Color";
import MainMenu from "./MenuScenes/MainMenu";

export const LevelLayers = {
    // SKILLS: "SKILLS",
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

    protected nextLevel: new (...args: any) => Level;

    protected levelMusicKey: string;

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

    /** Sounds for the player */
    public static readonly JUMP_AUDIO_KEY = "JUMP_AUDIO_KEY";
    public static readonly JUMP_AUDIO_PATH = "assets/sounds/jump.wav";

    public static readonly DASH_AUDIO_KEY = "DASH_AUDIO_KEY";
    public static readonly DASH_AUDIO_PATH = "assets/sounds/dash.wav";

    public static readonly ATTACK_AUDIO_KEY = "ATTACK_AUDIO_KEY";
    public static readonly ATTACK_AUDIO_PATH = "assets/sounds/attack.wav";

    public static readonly HURT_AUDIO_KEY = "HURT_AUDIO_KEY";
    public static readonly HURT_AUDIO_PATH = "assets/sounds/hurt.wav";

    public static readonly DYING_AUDIO_KEY = "DYING_AUDIO_KEY";
    public static readonly DYING_AUDIO_PATH = "assets/sounds/dying.wav";

    protected jumpAudioKey: string;
    protected dashAudioKey: string;
    protected attackAudioKey: string;
    protected hurtAudioKey: string;
    protected dyingAudioKey: string;

    // Object pool for basic attacks and bubbles
    protected basicAttacks: Array<Graphic>;
    protected bubbles: Array<Graphic>;
    protected weaponParticles: PlayerParticleSystem;

    /** Attributes for the UI */
    protected healthBar: Label;
    protected healthBarBg: Label;
    protected playerHUD: PlayerHUD;

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
        this.jumpAudioKey = Level.JUMP_AUDIO_KEY;
        this.dashAudioKey = Level.DASH_AUDIO_KEY;
        this.attackAudioKey = Level.ATTACK_AUDIO_KEY;
        this.hurtAudioKey = Level.HURT_AUDIO_KEY;
        this.dyingAudioKey = Level.DYING_AUDIO_KEY;

        this.factory = new CustomFactoryManager(this, this.tilemaps);
        this.enemies = [];
    }

    /** Load common things for all levels */
    public loadScene(): void {
        this.load.spritesheet(Level.PLAYER_SPRITE_KEY, Level.PLAYER_SPRITE_PATH);

        this.load.image(LayerManager.PAUSE_SPRITE_KEY, LayerManager.PAUSE_SPRITE_PATH);
        this.load.image(LayerManager.CONTROL_SPRITE_KEY, LayerManager.CONTROL_SPRITE_PATH);
        this.load.image(LayerManager.HELP_SPRITE_KEY, LayerManager.HELP_SPRITE_PATH);
        this.load.image(SkillManager.SKILL_BOOK_SPRITE_KEY, SkillManager.SKILL_BOOK_SPRITE_PATH);
        this.load.image(Level.ABILITY_ICONS_KEY, Level.ABILITY_ICONS_PATH);

        this.load.image(Melee.MELEE_SPRITE_KEY, Melee.MELEE_SPRITE_PATH);
        this.load.image(Melee.MELEE_ICON_KEY, Melee.MELEE_ICON_PATH);
        this.load.image(Slash.SLASH_SPRITE_KEY, Slash.SLASH_SPRITE_PATH);
        this.load.image(Slash.SLASH_ICON_KEY, Slash.SLASH_ICON_PATH);
        this.load.image(Repel.REPEL_SPRITE_KEY, Repel.REPEL_SPRITE_PATH);
        this.load.image(Repel.REPEL_ICON_KEY, Repel.REPEL_ICON_PATH);
        this.load.spritesheet(Spin.SPIN_SPRITE_KEY, Spin.SPIN_SPRITE_PATH);
        this.load.image(Spin.SPIN_ICON_KEY, Spin.SPIN_ICON_PATH);

        /* Audio and Sounds */
        this.load.audio(Level.JUMP_AUDIO_KEY, Level.JUMP_AUDIO_PATH);
        this.load.audio(Level.DASH_AUDIO_KEY, Level.DASH_AUDIO_PATH);
        this.load.audio(Level.ATTACK_AUDIO_KEY, Level.ATTACK_AUDIO_PATH);
        this.load.audio(Level.HURT_AUDIO_KEY, Level.HURT_AUDIO_PATH);
        this.load.audio(Level.DYING_AUDIO_KEY, Level.DYING_AUDIO_PATH);
    }

    /** Common resources that should be kept across all levels */
    public unloadScene(): void {
        
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
        console.log("Initializing skil manager");
        this.skill_manager = SkillManager.getInstance(this, this.player);

        // Initialize UI layer components such as health bar, ability bar, etc.
        this.playerHUD = new PlayerHUD(this, this.player._ai as PlayerController, LevelLayers.UI);

        // Initialize viewport
        if (this.player === undefined) {
            throw new Error("Player must be initialized before setting the viewport to folow the player");
        }
        this.viewport.follow(this.player);
        this.viewport.setZoomLevel(1);
        this.viewport.setBounds(0, 0, 1366, 768);

        this.subscribeEvents();

        // Fire events to start game (e.g. music)
        // this.emitter.fireEvent(CustomGameEvents.LEVEL_START)
        this.layer_manager.startLevel();
        // Input.disableInput();
        // this.ui.disable();
    }

    private subscribeEvents() {
        this.receiver.subscribe(CustomGameEvents.SKILL_1_FIRED);
        this.receiver.subscribe(CustomGameEvents.SKILL_2_FIRED);
        this.receiver.subscribe(CustomGameEvents.SKILL_3_FIRED);
        this.receiver.subscribe(CustomGameEvents.SKILL_4_FIRED);
        
        this.receiver.subscribe(CustomGameEvents.UPDATE_HEALTH);
        this.receiver.subscribe(CustomGameEvents.TOGGLE_SKILL_BOOK);
        this.receiver.subscribe(CustomGameEvents.CHANGED_ACTIVE_SKILLS);

        this.receiver.subscribe(CustomGameEvents.LEVEL_START);
        this.receiver.subscribe(CustomGameEvents.PLAYER_ENTER_LEVEL_END);
        this.receiver.subscribe(CustomGameEvents.LEVEL_NEXT);
        this.receiver.subscribe(CustomGameEvents.LEVEL_END);
        this.receiver.subscribe(CustomGameEvents.LEVEL_FAILED);

        this.receiver.subscribe(SkillBookEvents.LEVEL_DOWN_MELEE);
        this.receiver.subscribe(SkillBookEvents.LEVEL_UP_MELEE);
        this.receiver.subscribe(SkillBookEvents.LEVEL_DOWN_SLASH);
        this.receiver.subscribe(SkillBookEvents.LEVEL_UP_SLASH);
        this.receiver.subscribe(SkillBookEvents.LEVEL_DOWN_REPEL);
        this.receiver.subscribe(SkillBookEvents.LEVEL_UP_REPEL);
        this.receiver.subscribe(SkillBookEvents.LEVEL_DOWN_SPIN);
        this.receiver.subscribe(SkillBookEvents.LEVEL_UP_SPIN);

        this.receiver.subscribe(MenuEvents.RESUME);
        this.receiver.subscribe(MenuEvents.PAUSE);
        this.receiver.subscribe(MenuEvents.RESTART);
        this.receiver.subscribe(MenuEvents.CONTROLS);
        this.receiver.subscribe(MenuEvents.HELP);
        this.receiver.subscribe(MenuEvents.EXIT);

        /** Skill Binding Events */
        for(let i = 2; i < 6; i++){
            this.receiver.subscribe(`SET-Q-${i}`)
            this.receiver.subscribe(`SET-E-${i}`)
        }
    }

    public updateScene(deltaT: number) {
        let escButton = Input.isKeyJustPressed("escape");
        let paused = this.layer_manager.isPaused();
        let skillbookOpen = this.skill_manager.isOpen();

        let skillButton = Input.isKeyJustPressed("k");

        if (skillButton && !paused)
            this.emitter.fireEvent(CustomGameEvents.TOGGLE_SKILL_BOOK);

        if (escButton) {
            switch (skillbookOpen){
                case true:
                    this.emitter.fireEvent(CustomGameEvents.TOGGLE_SKILL_BOOK);
                    break;
                case false:
                    paused
                        ? this.emitter.fireEvent(MenuEvents.RESUME)
                        : this.emitter.fireEvent(MenuEvents.PAUSE);
                    break;
            }
        }

        // Update player HUD
        this.playerHUD.update(deltaT);

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
        let type = event.type as MenuEvent | CustomGameEvent | SkillBookEvent;
        console.log("Handling event type", type);

        if(type.startsWith('SET-Q-') || type.startsWith('SET-E-')){
            return this.skill_manager.handleSetSkill(type);
        }

        switch (type) {
            // Let Level.ts handle it by default
            case CustomGameEvents.UPDATE_HEALTH: {
                let currentHealth = event.data.get('currentHealth');
                let maxHealth = event.data.get('maxHealth');
                this.handleHealthChange(currentHealth, maxHealth);
                break;
            }

            case CustomGameEvents.SKILL_1_FIRED: {
                this.skill_manager.activateSkill(0, { direction: event.data.get("direction") })
                break;
            }
            case CustomGameEvents.SKILL_2_FIRED: {
                this.skill_manager.activateSkill(1, { direction: event.data.get("direction") })
                break;
            }
            case CustomGameEvents.SKILL_3_FIRED: {
                this.skill_manager.activateSkill(2, { direction: event.data.get("direction") })
                break;
            }
            case CustomGameEvents.SKILL_4_FIRED: {
                this.skill_manager.activateSkill(3, { direction: event.data.get("direction") })
                break;
            }
            case CustomGameEvents.CHANGED_ACTIVE_SKILLS: {
                this.playerHUD.updateHUD();
                break;
            }
            
            case CustomGameEvents.LEVEL_START: {
                Input.enableInput();
                this.ui.enable();
                break;
            }

            case CustomGameEvents.PLAYER_ENTER_LEVEL_END: {
                console.log("PLAYER_ENTER_LEVEL_END should be overridden in Levels!");
                break;
            }

            case CustomGameEvents.LEVEL_END: {
                this.ui.disable();
                this.layer_manager.endLevel();
                break;
            }

            case CustomGameEvents.LEVEL_NEXT: {
                this.sceneManager.changeToScene(this.nextLevel);
                break;
            }

            case CustomGameEvents.LEVEL_FAILED: {
                this.sceneManager.changeToScene(MainMenu);
                break;
            }

            case CustomGameEvents.TOGGLE_SKILL_BOOK: {
                this.skill_manager.toggleSkillBook();
                break;
            }

            //Main menu options
            case MenuEvents.PAUSE:
                this.layer_manager.showPauseMenu();
                this.freezeLevel();
                break;

            case MenuEvents.RESUME:
                this.layer_manager.hidePauseMenu();
                this.unfreezeLevel();
                break;
            // This should be overriden in individual levels
            case MenuEvents.RESTART:
                this.layer_manager.hidePauseMenu();
                this.unfreezeLevel();
                this.sceneManager.changeToScene(MainMenu);
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

            case SkillBookEvents.LEVEL_DOWN_MELEE:
            case SkillBookEvents.LEVEL_UP_MELEE:
            case SkillBookEvents.LEVEL_DOWN_SLASH:
            case SkillBookEvents.LEVEL_UP_SLASH:
            case SkillBookEvents.LEVEL_DOWN_REPEL:
            case SkillBookEvents.LEVEL_UP_REPEL:
            case SkillBookEvents.LEVEL_DOWN_SPIN:
            case SkillBookEvents.LEVEL_UP_SPIN:
                this.skill_manager.handleLevelEvent(event.type as SkillBookEvent);
                break;

            // Default: Throw an error! No unhandled events allowed.
            default: {
                throw new Error(`Unhandled event caught in scene with type ${event.type}`)
            }
        }
    }

    protected initUI() {
        
    }

    protected freezeLevel() {
        for (let enemy of this.enemies) {
            enemy.animation.pause();
            enemy.freeze();
        }
        this.player.freeze();
        this.ui.disable();
    }

    protected unfreezeLevel() {
        for (let enemy of this.enemies) {
            enemy.animation.resume();
            enemy.unfreeze();
        }
        this.player.unfreeze();
        this.ui.enable();
    }

    protected handleHealthChange(currentHealth: number, maxHealth: number): void {
        // let unit = this.healthBarBg.size.x / maxHealth;

        // this.healthBar.size.set(this.healthBarBg.size.x - unit * (maxHealth - currentHealth), this.healthBarBg.size.y);
        // this.healthBar.position.set(this.healthBarBg.position.x - (unit / 2) * (maxHealth - currentHealth), this.healthBarBg.position.y);

        // this.healthBar.backgroundColor = currentHealth < maxHealth * 1 / 4 ? Color.RED : currentHealth < maxHealth * 3 / 4 ? Color.YELLOW : Color.GREEN;
    }

    public getPlayer() {
        return this.player;
    }

    public getSkillManager() {
        return this.skill_manager;
    }
    public getJumpAudioKey(): string {
        return this.jumpAudioKey
    }

    public getDashAudioKey(): string {
        return this.dashAudioKey
    }

    public getAttackAudioKey(): string {
        return this.attackAudioKey
    }

    public getHurtAudioKey(): string {
        return this.hurtAudioKey
    }

    public getDyingAudioKey(): string {
        return this.dyingAudioKey
    }
}