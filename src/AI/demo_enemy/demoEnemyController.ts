import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import { PlayerControls, PlayerStates } from "../Player/PlayerController";
import { Attack, Dash, Dead, Fall, Idle, Jump, Walk } from "./EnemyStates";
import demoEnemyActor from "./demoEnemyActor";

export enum EnemyAnimations {
    IDLE = "IDLE",
    RUNNING_LEFT = "RUNNING_LEFT",
    RUNNING_RIGHT = "RUNNING_RIGHT",
    TAKING_DAMAGE = "TAKING_DAMAGE",
    DEAD = "DEAD",    
}

export default class demoEnemyController extends StateMachineAI  {

    protected override owner: demoEnemyActor;
    protected tilemap: OrthogonalTilemap;

    /** 
     * Attributes for the Eneemy
     */
    public MAX_SPEED = 200;
    public MIN_SPEED = 100;

    protected _maxHealth: number = 10;
    protected _health: number = 10;
    protected _speed: number = 200;
    protected _velocity: Vec2;

    public get maxHealth(): number { return this._maxHealth }
    public set maxHealth(maxHealth: number) { 
        this._maxHealth = maxHealth; 
    }

    public get health(): number { return this._health; }
    public set health(health: number) { 
        this._health = health; 
    }

    public get speed(): number { return this._speed; }
    public set speed(speed: number) { this._speed = speed; }

    public initializeAI(owner: demoEnemyActor, options: Record<string, any>): void {
        this.owner = owner;

        this.tilemap = this.owner.getScene().getTilemap(options.tilemap) as OrthogonalTilemap;
        this.speed = 200;
        this.velocity = Vec2.ZERO;
        // this.receiver.subscribe(ItemEvent.LASERGUN_FIRED);

        this.addState(PlayerStates.ATTACKING, new Attack(this, this.owner));
        this.addState(PlayerStates.DASH, new Dash(this, this.owner));
        this.addState(PlayerStates.DEAD, new Dead(this, this.owner));
        this.addState(PlayerStates.FALL, new Fall(this, this.owner));
		this.addState(PlayerStates.IDLE, new Idle(this, this.owner));
        this.addState(PlayerStates.JUMP, new Jump(this, this.owner));
		this.addState(PlayerStates.WALK, new Walk(this, this.owner));

        this.receiver.subscribe('ENEMY_HIT');
        this.initialize(PlayerStates.FALL);
    }

    public activate(options: Record<string, any>): void {}

    public update(deltaT: number): void {
        super.update(deltaT);
    }

    /**
     * @param event the game event
     */
    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            // case ItemEvent.LASERGUN_FIRED: {
            //     console.log("Catching and handling lasergun fired event!!!");
            //     this.handleLasergunFired(event.data.get("actorId"), event.data.get("to"), event.data.get("from"));
            //     break;
            // }
            case 'ENEMY_HIT':
                // console.log(event.data);
                let id = event.data.get('node');
                if(id === this.owner.id){
                    this.owner.position = new Vec2(3000,3000);
                    this.owner.visible = false;
                }
                break;
            default: {
                super.handleEvent(event);
                break;
            }
        }
    }

    protected handleLasergunFired(actorId: number, to: Vec2, from: Vec2): void {
        // if (actorId !== this.owner.id) {
        //     this.owner.health -= this.owner.collisionShape.getBoundingRect().intersectSegment(to, from) ? 1 : 0;
        // }
    }

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
    
}