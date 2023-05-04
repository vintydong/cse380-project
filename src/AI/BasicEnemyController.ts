import Level from "../Scenes/Level";
import StateMachineAI from "../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";

export abstract class BasicEnemyController extends StateMachineAI {
    protected override owner: AnimatedSprite;
    protected tilemap: OrthogonalTilemap;

    /** 
     * Attributes for the SlimeBoss
     */
    public MAX_SPEED = 200;
    public MIN_SPEED = 100;

    protected _maxHealth: number = 100;
    protected _health: number = 100;
    protected _speed: number = 100;
    protected _velocity: Vec2;
    protected _gravity: number = 1000;
    protected _facing: number = Math.round(Math.random());

    public get maxHealth(): number { return this._maxHealth }
    public set maxHealth(maxHealth: number) { this._maxHealth = maxHealth; }

    public get health(): number { return this._health; }
    public set health(health: number) { this._health = health; }

    public get speed(): number { return this._speed; }
    public set speed(speed: number) { this._speed = speed; }

    public get velocity(): Vec2 { return this._velocity; }
    public set velocity(velocity: Vec2) { this._velocity = velocity; }

    public get gravity(): number { return this._gravity; }
    public set gravity(gravity: number) { this._gravity = gravity; }

    public get facing(): number { return this._facing; }
    public set facing(facing: number) { this._facing = facing; }

    public initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.tilemap = this.owner.getScene().getTilemap(options.tilemap) as OrthogonalTilemap;
    }

    public activate(options: Record<string, any>): void { }

    public update(deltaT: number): void {
        super.update(deltaT);
    }

    /**
     * @param event the game event
     */
    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            default: {
                super.handleEvent(event);
                break;
            }
        }
    }
}