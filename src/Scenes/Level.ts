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

export const LevelLayers = {
    PRIMARY: "PRIMARY",
    UI: "UI"
} as const;

export type LevelLayer = typeof LevelLayers[keyof typeof LevelLayers]

export default abstract class Level extends Scene {
    public factory: CustomFactoryManager

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
        super(viewport, sceneManager, renderingManager, {...options});

        this.factory = new CustomFactoryManager(this, this.tilemaps);
    }

    public startScene(): void {
        this.initialize();

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

    /** Common initializations between all levels */
    protected initialize() {
        // Things to initialize
        // this.initLayers();
        // this.initTilemaps();
        // this.initWeapon();
        // this.initUI();
        // this.initPlayer(this.playerSpriteKey);

        // this.initViewport();
        // this.subscribeEvents();
        
        throw new Error("Method not implemented.");
    }
}