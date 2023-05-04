import { CustomGameEvents } from "../../CustomGameEvents";
import { PhysicsGroups } from "../../Physics";
import CheatManager from "../../Systems/CheatManager";
import Level from "../../Scenes/Level";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "../../Wolfie2D/Timing/Timer";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { Ground, Air, Dash, Dead, Knockback } from './PlayerStates';

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
    SKILL_ONE = "SKILL_ONE",
    SKILL_TWO = "SKILL_TWO",
    SKILL_THREE = "SKILL_THREE",
    SKILL_FOUR = "SKILL_FOUR",
    SKILL_BOOK = "SKILL_BOOK",
    PAUSE_GAME = "PAUSE_GAME",
}

export enum PlayerStates {
    GROUND = "GROUND",
    AIR = "AIR",
    DASH = "DASH",
    DEAD = "DEAD",
    KNOCKBACK = "KNOCKBACK"
}

export enum PlayerAnimations {
    IDLE = "IDLE",
    RUNNING = "RUNNING",
    JUMPING = "JUMPING",
    FALLING = "FALLING",
    DASH = "DASH",
    ATTACKING = "ATTACKING",
    TAKING_DAMAGE = "TAKING_DAMAGE",
    DEAD = "DEAD",    
}

export default class PlayerController extends StateMachineAI {
    public readonly MAX_SPEED: number = 200;
    public readonly MIN_SPEED: number = 175;

    protected owner: AnimatedSprite;

    protected _health: number;
    protected _maxHealth: number;

    protected _velocity: Vec2;
    protected _speed: number;

    // protected weapon: PlayerParticleSystem;
    protected _facing: string;
    protected _dashTimer: Timer;
    protected _airDash: boolean;

    protected _iFrameTimer: Timer;
    protected _hit: boolean;

    // protected weapon: PlayerWeapon;
    protected tilemap: OrthogonalTilemap;

    public initializeAI(owner: AnimatedSprite, options: Record<string, any>) {
        this.owner = owner;

        // this.weapon = options.weapon;

        this.tilemap = this.owner.getScene().getTilemap(options.tilemap) as OrthogonalTilemap;
        this.speed = 200;
        this.velocity = Vec2.ZERO;

        this.health = 100;
        this.maxHealth = 100;

        this.dashTimer = new Timer(600);
        this._airDash = true;

        this._iFrameTimer = new Timer(1000, this.handleIFrameTimerEnd, false);

        // Add the different states the player can be in to the PlayerController 
        this.addState(PlayerStates.GROUND, new Ground(this, this.owner));
        this.addState(PlayerStates.AIR, new Air(this, this.owner));
        this.addState(PlayerStates.DASH, new Dash(this, this.owner));
        this.addState(PlayerStates.DEAD, new Dead(this, this.owner));
        this.addState(PlayerStates.KNOCKBACK, new Knockback(this, this.owner));

        this.receiver.subscribe(CustomGameEvents.PLAYER_ENEMY_COLLISION);
        this.receiver.subscribe(CustomGameEvents.PLAYER_ENEMY_PROJECTILE_COLLISION);

        this.initialize(PlayerStates.GROUND);
    }

    public handleEvent(event: GameEvent): void{
        switch (event.type){
            case CustomGameEvents.PLAYER_ENEMY_COLLISION: 
            case CustomGameEvents.PLAYER_ENEMY_PROJECTILE_COLLISION: {
                if (!this._hit){
                    this.handlePlayerCollision(event);
                    if (this.health <= 0){
                        this.changeState(PlayerStates.DEAD);
                    }
                    else {
                        this.changeState(PlayerStates.KNOCKBACK);
                    }
                }
                break;
            }
            default:
                throw new Error(`Event handler not implemented for event type ${event.type}`)
        }
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
    }

    public get health(): number { return this._health; }
    public set health(health: number) { 
        this._health = MathUtils.clamp(health, 0, this.maxHealth);
    }

    public get facing(): string { return this._facing; }
    public set facing(facing: string) { this._facing = facing; }

    public get dashTimer(): Timer { return this._dashTimer; }
    public set dashTimer(Timer: Timer) { this._dashTimer = Timer; }

    public get airDash(): boolean { return this._airDash; }
    public set airDash(airDash: boolean) { this._airDash = airDash; }

    public get iFrameTimer(): Timer { return this._iFrameTimer; }
    public set iFrameTimer(Timer: Timer) { this._iFrameTimer = Timer; }

    public get hit(): boolean { return this._hit; }
    public set hit(flag: boolean) { this._hit = flag; }

    public handlePlayerCollision(event): void{
        let cheatManager = CheatManager.getInstance();
        if (this._iFrameTimer.isStopped && !cheatManager.getInfiniteHP()){
			this.health -= 10;
			this.owner.animation.playIfNotAlready(PlayerAnimations.TAKING_DAMAGE, false);
            this.emitter.fireEvent(CustomGameEvents.UPDATE_HEALTH, {
				currentHealth: this.health,
				maxHealth: this.maxHealth
			});
            let hurtAudio = (this.owner.getScene() as Level).getHurtAudioKey()
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: hurtAudio, loop: false, holdReference: false});
			this._iFrameTimer.start();
			this._hit = true;
		}
    }

    protected handleIFrameTimerEnd = () => {
		this._hit = false;
	}
}
