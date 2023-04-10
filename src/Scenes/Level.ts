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

export const LevelLayers = {
    PRIMARY: "PRIMARY",
    UI: "UI"
} as const;

export type LevelLayer = typeof LevelLayers[keyof typeof LevelLayers]

export default abstract class Level extends Scene {
    public factory: CustomFactoryManager;

    /** Attributes for the level */
    protected tilemapKey: string;
    protected tilemapScale: Vec2;
    // protected tilemaps: Array<Tilemap>;
    
    protected levelMusicKey: string;
    // protected jumpAudioKey: string;

    /** Attributes for the player */
    protected playerSpriteKey: string;
    protected player: AnimatedSprite;
    protected playerSpawn: Vec2;

    private healthLabel: Label;
    private healthBar: Label;
    private healthBarBg: Label;

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, {...options, physics: PhysicsCollisionMap });

        this.factory = new CustomFactoryManager(this, this.tilemaps);
    }

    public startScene(): void {
        /** Common initializations between all levels */

        // this.initLayers();
        this.addLayer(LevelLayers.PRIMARY);
        this.addUILayer(LevelLayers.UI);

        // this.initTilemaps();
        if(this.tilemapKey === undefined || this.tilemapScale === undefined)
            throw new Error("Missing tilemap key or scale");
        
        this.factory.tilemap(this.tilemapKey, this.tilemapScale);

        // TODO: this.initWeapon();

        // TODO: this.initUI();

        // TODO: this.initPlayer(this.playerSpriteKey);
        if(this.playerSpawn === undefined) throw new Error("Player weapon system must be initialized before initializing the player!");
        this.player = this.factory.animatedSprite(this.playerSpriteKey, LevelLayers.PRIMARY);
        this.player.scale.set(2,2);
        this.player.position.copy(this.playerSpawn)
        this.player.addAI(PlayerController, {tilemap: this.tilemapKey});

        // Need to add physics 
        this.player.addPhysics(new AABB(this.player.position.clone(), this.player.boundary.getHalfSize().clone()))
        this.player.setGroup(PhysicsGroups.PLAYER);

        // this.initViewport();
        if (this.player === undefined) {
            throw new Error("Player must be initialized before setting the viewport to folow the player");
        }
        this.viewport.follow(this.player);
        this.viewport.setZoomLevel(1);
        this.viewport.setBounds(0, 0, 1366, 768);

        // this.subscribeEvents();

        // TODO: Probably want a level transition here
        // See hw3

        // Fire events to start game (e.g. music)

        Input.disableInput();
    }

    public updateScene(deltaT: number) {
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
        switch (event.type) {
            // Default: Throw an error! No unhandled events allowed.
            default: {
                throw new Error(`Unhandled event caught in scene with type ${event.type}`)
            }
        }
    }
}