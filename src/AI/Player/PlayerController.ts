import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { Attack, Dash, Dead, Fall, Idle, Jump, Walk } from './PlayerStates';

/**
 * Specify any keybindings needed for the player
 * Keybindings should be added as options under key `input` in main.ts
 */
export enum PlayerControls {
    MOVE_UP = "MOVE_UP",
    MOVE_DOWN = "MOVE_DOWN",
    MOVE_LEFT = "MOVE_LEFT",
    MOVE_RIGHT = "MOVE_RIGHT",
    DASH = "DASH",
    // ATTACKING = "ATTACKING",
    SKILL_ONE = "SKILL_ONE",
    SKILL_TWO = "SKILL_TWO",
    SKILL_THREE = "SKILL_THREE",
    SKILL_FOUR = "SKILL_FOUR",
    SKILL_BOOK = "SKILL_BOOK",
    PAUSE_GAME = "PAUSE_GAME",
}

export enum PlayerStates {
    IDLE = "IDLE",
    WALK = "WALK",
    DASH = "DASH",
    JUMP = "JUMP",
    FALL = "FALL",
    ATTACKING = "ATTACKING",
    DEAD = "DEAD",
}

export enum PlayerAnimations {
    IDLE = "IDLE",
    RUNNING_LEFT = "RUNNING_LEFT",
    RUNNING_RIGHT = "RUNNING_RIGHT",
    ATTACKING_LEFT = "ATTACKING_LEFT",
    ATTACKING_RIGHT = "ATTACKING_RIGHT",
    TAKING_DAMAGE = "TAKING_DAMAGE",
    DEAD = "DEAD",    
}

export default class PlayerController extends StateMachineAI {
    public readonly MAX_SPEED: number = 200;
    public readonly MIN_SPEED: number = 100;

    protected owner: AnimatedSprite;

    protected _health: number;
    protected _maxHealth: number;

    protected _velocity: Vec2;
    protected _speed: number;

    // protected weapon: PlayerParticleSystem;
    protected tilemap: OrthogonalTilemap;

    public initializeAI(owner: AnimatedSprite, options: Record<string, any>) {
        this.owner = owner;

        // this.weapon = options.weapon;

        this.tilemap = this.owner.getScene().getTilemap(options.tilemap) as OrthogonalTilemap;
        this.speed = 200;
        this.velocity = Vec2.ZERO;

        this.health = 100;
        this.maxHealth = 100;

        // Add the different states the player can be in to the PlayerController 
        this.addState(PlayerStates.ATTACKING, new Attack(this, this.owner));
        this.addState(PlayerStates.DASH, new Dash(this, this.owner));
        this.addState(PlayerStates.DEAD, new Dead(this, this.owner));
        this.addState(PlayerStates.FALL, new Fall(this, this.owner));
		this.addState(PlayerStates.IDLE, new Idle(this, this.owner));
        this.addState(PlayerStates.JUMP, new Jump(this, this.owner));
		this.addState(PlayerStates.WALK, new Walk(this, this.owner));

        this.initialize(PlayerStates.IDLE);
    }

    /**
     * Gets the direction the player should move based on input from the keyboard. 
     * @returns a Vec2 indicating the direction the player should move. 
     */
    public get moveDir(): Vec2 {
        let dir: Vec2 = Vec2.ZERO;
        dir.y = (Input.isPressed(PlayerControls.MOVE_UP) ? -1 : 0) + (Input.isPressed(PlayerControls.MOVE_DOWN) ? 1 : 0);
        dir.x = (Input.isPressed(PlayerControls.MOVE_LEFT) ? -1 : 0) + (Input.isPressed(PlayerControls.MOVE_RIGHT) ? 1 : 0);
        return dir.normalize();
    }

    /** 
     * Gets the direction the player should be facing based on the position of the
     * mouse around the player
     * @return a Vec2 representing the direction the player should face.
     */
    public get faceDir(): Vec2 { return this.owner.position.dirTo(Input.getGlobalMousePosition()); }

    /**
     * Gets the rotation of the players sprite based on the direction the player
     * should be facing.
     * @return a number representing how much the player should be rotated
     */
    public get rotation(): number { return Vec2.UP.angleToCCW(this.faceDir); }

    /** Getters and Setters to enable access in PlayerStates */
    public get velocity(): Vec2 { return this._velocity; }
    public set velocity(velocity: Vec2) { this._velocity = velocity; }

    public get speed(): number { return this._speed; }
    public set speed(speed: number) { this._speed = speed; }

    public get maxHealth(): number { return this._maxHealth; }
    public set maxHealth(maxHealth: number) { 
        this._maxHealth = maxHealth; 
        // When the health changes, fire an event up to the scene.
        // this.emitter.fireEvent(HW3Events.HEALTH_CHANGE, {curhp: this.health, maxhp: this.maxHealth});
    }

    public get health(): number { return this._health; }
    public set health(health: number) { 
        this._health = MathUtils.clamp(health, 0, this.maxHealth);
        // When the health changes, fire an event up to the scene.
        // this.emitter.fireEvent(HW3Events.HEALTH_CHANGE, {curhp: this.health, maxhp: this.maxHealth});
        // If the health hit 0, change the state of the player
        if (this.health === 0) { this.changeState(PlayerStates.DEAD); }
    }
}
