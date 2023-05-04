import { CustomGameEvents } from "../../CustomGameEvents";
import { PhysicsGroups } from "../../Physics";
import Level, { LevelLayers } from "../../Scenes/Level";
import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Timer from "../../Wolfie2D/Timing/Timer";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { BasicEnemyController } from "../BasicEnemyController";
import { EnemyState } from "../demo_enemy/EnemyStates";

enum TalonAnimations {
    IDLE = "IDLE",
    RUNNING = "RUNNING",
    TAKING_DAMAGE = "TAKING_DAMAGE",
    DEAD = "DEAD",
}

enum TalonStates {
    AIR = "AIR",
    ATTACKING = "ATTACKING",
    TAKING_DAMAGE = "TAKING_DAMAGE",
    DEAD = "DEAD",
}

/**
 * Classes that represents the Talon enemy
 * @author HenryLam
 */
class TalonAir extends EnemyState {
    protected override parent: TalonController;
    protected shouldIAttack: boolean;

    public onEnter(options: Record<string, any>): void {
        this.owner.animation.play(TalonAnimations.RUNNING);
    }

    public update(deltaT: number): void {
        super.update(deltaT);

        if (this.parent.cooldown.isStopped()) {
            this.shouldIAttack = (Math.round(Math.random()) === 0) ? false : true;
            if (this.shouldIAttack) this.finished(TalonStates.ATTACKING)
            else this.parent.cooldown.start()
        }

        if (this.owner.getScene().getViewport().includes(this.owner)) {
            let player = this.parent.target.position
            // console.log(this.owner.id, this.owner.position.x, this.owner.position.y)

            // Update x velocities
            let xdir = (player.x < this.owner.position.x) ? "left" : "right"
            this.parent.velocity.x = (xdir === "left") ? (-1 * this.parent.MIN_SPEED) : (this.parent.MIN_SPEED)
            this.parent.facing = (xdir === "left") ? 0 : 1
    
            // Update y velocities
            let ydir = (player.y < this.owner.position.y) ? "up" : "down"
            this.parent.velocity.y = (ydir === "up") ? (-1 * this.parent.MIN_SPEED) : (this.parent.MIN_SPEED)
        }

        this.owner.move(this.parent.velocity.scaled(deltaT));
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

class TalonAttacking extends EnemyState {
    protected override parent: TalonController

    public onEnter(options: Record<string, any>): void {
        this.owner.animation.playIfNotAlready(TalonAnimations.RUNNING);
    }

    public update(deltaT: number): void {
        super.update(deltaT);

        if (this.owner.getScene().getViewport().includes(this.owner)) {
            console.log("talon firing attack")
            let player = this.parent.target.position
            let curPos = this.owner.position.clone()
            this.parent.projectile.activate({spawn: curPos, direction: curPos.dirTo(player)})
        }

        this.finished(TalonStates.AIR)
    }

    public onExit(): Record<string, any> {
        this.parent.cooldown.start();
        this.owner.animation.stop();
        return {};
    }
}

class TalonTakingDamage extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        this.owner.animation.play(TalonAnimations.TAKING_DAMAGE);
    }

    public update(deltaT: number): void {
        // Leave state when animation finishes playing
        // If enemy tanks too much from i-frames, reduce animation time
        if (!this.owner.animation.isPlaying(TalonAnimations.TAKING_DAMAGE)){
            this.finished(TalonStates.AIR);
        }
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

class TalonDead extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        this.owner.animation.play(TalonAnimations.DEAD);
    }

    public update(deltaT: number): void { 
        if (!this.owner.animation.isPlaying(TalonAnimations.DEAD)){
            this.deathCleanup()
        }
    }
    
    public deathCleanup(): void {
        this.owner.position = new Vec2(3000, 3000);
        this.owner.visible = false;
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

export class TalonController extends BasicEnemyController {
    protected override owner: TalonActor;
    protected _projectile: TalonProjectile
    protected _target: AnimatedSprite;
    protected _cooldown: Timer;

    public initializeAI(owner: TalonActor, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this._projectile = new TalonProjectile(this, this.owner);
        this._target = this.owner.getScene().getPlayer();
        this._cooldown = new Timer(2000);
        
        this.health = 50;
        this.MIN_SPEED = 50;
        this.MAX_SPEED = 100;
        this.velocity = Vec2.ZERO;
        this.speed = this.MIN_SPEED;


        this.addState(TalonStates.AIR, new TalonAir(this, this.owner));
        this.addState(TalonStates.ATTACKING, new TalonAttacking(this, this.owner));
        this.addState(TalonStates.TAKING_DAMAGE, new TalonTakingDamage(this, this.owner));
        this.addState(TalonStates.DEAD, new TalonDead(this, this.owner));

        this.receiver.subscribe(CustomGameEvents.ENEMY_DAMAGE);

        this.initialize(TalonStates.AIR);
        console.log(this);
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
            case CustomGameEvents.ENEMY_DAMAGE:
                let id = event.data.get('node');
                let dmg = event.data.get('damage')
                // console.log("TALON: ENEMY HIT", id, dmg, this.owner.id, this.health);
                if (id === this.owner.id) {
                    this.takeDamage(dmg);
                }
                break;
            default: {
                super.handleEvent(event);
                break;
            }
        }
    }

    public takeDamage(damage: number){
        this.health -= damage;
        if(this.health <= 0){
            this.changeState(TalonStates.DEAD)
        }
        else {
            this.changeState(TalonStates.TAKING_DAMAGE)
        }
    }

    /** Getters and Setters to enable access in PlayerStates */
    public get target(): AnimatedSprite { return this._target; }
    public set target(target: AnimatedSprite) { this._target = target; }

    public get projectile(): TalonProjectile { return this._projectile; }
    public set projectile(projectile: TalonProjectile) { this._projectile = projectile; }

    public get cooldown(): Timer { return this._cooldown; }
    public set cooldown(cooldown: Timer) { this._cooldown = cooldown; }
}

export class TalonActor extends AnimatedSprite {
    protected scene: Level

    // Key for the navmesh to use to build paths
    protected _navkey: string;

    public override setScene(scene: Level): void { this.scene = scene; }
    public override getScene(): Level { return this.scene; }

    public get navkey(): string { return this._navkey; }
    public set navkey(navkey: string) { this._navkey = navkey; }
}

export class TalonProjectile {
    private actor: TalonActor
    private controller: TalonController
    private hitbox: AnimatedSprite
    private damage: number;
    
    public static readonly TALON_PROJECTILE_KEY = "TALON_PROJECTILE_KEY"
    public static readonly TALON_PROJECTILE_PATH = "assets/spritesheets/Enemies/Talon_Projectile.json"

    public constructor(controller: TalonController, actor: TalonActor) {
        this.actor = actor;
        this.controller = controller;
        this.damage = 10;
        this.initialize();
    }

    private initialize(){
        let scene = this.actor.getScene();
        
        // Add projectile to scene
        this.hitbox = scene.add.animatedSprite(TalonProjectile.TALON_PROJECTILE_KEY, LevelLayers.PRIMARY)
        this.hitbox.scale = new Vec2(1, 1);
        this.hitbox.visible = false;

        // Add AI
        this.hitbox.addAI(TalonProjectileAI);

        // Add physics
        this.hitbox.addPhysics();
        this.hitbox.setGroup(PhysicsGroups.NPC);
        this.hitbox.setTrigger(PhysicsGroups.PLAYER, "TALON_PROJECTILE_HIT", null);
    }

    public activate(options?: Record<string, any>) {
        const { spawn, direction } = options;
        
        // Bring this projectile to life
        if (!this.hitbox.visible){
            this.hitbox.visible = true;
            this.hitbox.position = spawn;
            this.hitbox.setAIActive(true, {direction: direction, damage: this.damage});
        }
    }
}
export class TalonProjectileAI implements AI {
    // The GameNode that owns this behavior
    private owner: AnimatedSprite;
    private receiver: Receiver;
    private emitter: Emitter;

    // The direction to fire the projectile
    private direction: Vec2;

    // The current horizontal and vertical speed of the projectile
    private currentXSpeed: number;
    private currentYSpeed: number;

    // How much to increase the speed of the projectile by each frame
    private speedIncrement: number;

    // Upper and lower bounds on the speeds of the projectile
    private minXSpeed: number;
    private maxXSpeed: number;
    private minYSpeed: number;
    private maxYSpeed: number;

    private damage: number;

    public initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;

        this.emitter = new Emitter();
        this.receiver = new Receiver();
        this.receiver.subscribe("TALON_PROJECTILE_HIT");

        this.currentXSpeed = 50;
        this.currentYSpeed = 50;
        this.speedIncrement = 100;
        this.minXSpeed = 100;
        this.maxXSpeed = 500;
        this.minYSpeed = 100;
        this.maxYSpeed = 500;

        this.activate(options);
    }

    public destroy(): void {
        
    }

    public activate(options: Record<string, any>): void {
        console.log(options);
        if (options) {
            this.damage = options.damage;
            this.direction = options.direction;
        }
        this.owner.animation.play("ACTIVE");
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            case "TALON_PROJECTILE_HIT":
                // console.log(event.data);
                let id = event.data.get('other');
                if(id === this.owner.id){
                    console.log("Player hit with Talon projectile", event.data);
                    this.emitter.fireEvent(CustomGameEvents.PLAYER_ENEMY_PROJECTILE_COLLISION, {node: event.data.get('node'), damage: this.damage});
                    this.owner.position.copy(Vec2.ZERO);
                    this.owner._velocity.copy(Vec2.ZERO);
                    this.owner.visible = false;
                }
                break;
            default: {
                throw new Error("Unhandled event caught in MeleeBehavior! Event type: " + event.type);
            }
        }
    }

    public update(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        // Update projectile behavior if visible
        if (this.owner.visible) {
            // Despawn if collided with environment
            if (this.owner.onWall || this.owner.onCeiling || this.owner.onGround) {
                this.owner.position.copy(Vec2.ZERO);
                this.owner._velocity.copy(Vec2.ZERO);
                this.owner.visible = false;
            }

            // Increment the speeds
            this.currentXSpeed += this.speedIncrement * deltaT;
            this.currentYSpeed += this.speedIncrement * deltaT;

            // Clamp the speeds if need be
            this.currentXSpeed = MathUtils.clamp(this.currentXSpeed, this.minXSpeed, this.maxXSpeed);
            this.currentYSpeed = MathUtils.clamp(this.currentYSpeed, this.minYSpeed, this.maxYSpeed);

            // Move projectile towards target
            let value = new Vec2(this.currentXSpeed * this.direction.x, this.currentYSpeed * this.direction.y);
            this.owner.move(value.scaled(deltaT));
        }
    }    
}