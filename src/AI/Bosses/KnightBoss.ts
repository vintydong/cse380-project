import { CustomGameEvents } from "../../CustomGameEvents";
import { PhysicsGroups } from "../../Physics";
import Level, { LevelLayers } from "../../Scenes/Level";
import Level2 from "../../Scenes/Level2";
import Melee, { MeleeBehavior } from "../../Systems/Skills/Melee";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Spritesheet from "../../Wolfie2D/DataTypes/Spritesheet";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Input from "../../Wolfie2D/Input/Input";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Timer from "../../Wolfie2D/Timing/Timer";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { BasicEnemyController } from "../BasicEnemyController";
import { Air, Dead, EnemyState, Ground } from "../demo_enemy/EnemyStates";

enum KnightAnimations {
    IDLE = "IDLE",
    RUNNING = "RUNNING",
    TAKING_DAMAGE = "TAKING_DAMAGE",
    DEAD = "DEAD",
}

enum KnightBossStates {
    GROUND = "GROUND",
    AIR = "AIR",
    DEAD = "DEAD",
    KNOCKBACK = "KNOCKBACK",
    DAMAGED = "DAMAGED",
    ATTACKING = "ATTACKING"
}

class KnightGround extends EnemyState {
    private dir: number = null;
    private time: number = 0;

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = 500;
        this.owner.animation.playIfNotAlready(KnightAnimations.RUNNING);
    }

    public update(deltaT: number): void {
        super.update(deltaT);

        // Move in other direction once collided with wall
        if(this.owner.onWall){
            this.parent.velocity.mult(new Vec2(-1, 1));
            this.parent.facing = (this.parent.facing + 1) % 2
        }

        this.owner.move(this.parent.velocity.scaled(deltaT));

        this.time -= 1;

        if(this.time < 0){
            this.time = 100;
            this.dir = (Math.random() - 0.5) * this.parent.speed;
            this.parent.facing = this.dir > 0 ? 1 : 0
            this.parent.velocity.x = this.dir;
        } 
        else if(this.time < 5){
            this.parent.velocity.x = 0;
        }
    }
    
    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

class KnightDamage extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        this.owner.animation.playIfNotAlready(KnightAnimations.TAKING_DAMAGE);
    }
    
    public update(deltaT: number): void {
        if(!this.owner.animation.isPlaying(KnightAnimations.TAKING_DAMAGE))
            this.finished(KnightBossStates.AIR);
    }

    public onExit(): Record<string, any> {
        return {}
    }
}

class KnightDead extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        this.owner.animation.playIfNotAlready(KnightAnimations.DEAD, false);
        this.owner.tweens.play('DEAD');
    }

    public update(deltaT: number): void {
        if(this.owner.alpha == 0){
            this.owner.position = new Vec2(3000, 3000);
            this.owner.visible = false;
        }
    }

    public onExit(): Record<string, any> {
        return {}
    }
}

class KnightKnockback extends EnemyState {
    private dir: Vec2;
    private timer: number = 10;

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = this.parent.MAX_SPEED;
        this.dir = (this.parent as KnightBossController).knockback;
        this.timer = 10;
    }

    public update(deltaT: number): void {
        super.update(deltaT);
        this.owner.move(this.dir.scaled(deltaT));

        this.timer = this.timer - 1;

        if(this.timer < 0){
            if (!this.owner.onGround && (this.owner.onCeiling || this.parent.velocity.y > 0)){
                return this.finished(KnightBossStates.AIR);
            }
            else
                this.finished(KnightBossStates.GROUND);
        }
    }

    public onExit(): Record<string, any> {
        return {};
    }
}

class KnightAttack extends EnemyState {
    protected override parent: KnightBossController

    public onEnter(options: Record<string, any>): void {
        this.owner.animation.playIfNotAlready(KnightAnimations.RUNNING);
    }

    public update(deltaT: number): void {
        super.update(deltaT);

        if (this.owner.getScene().getViewport().includes(this.owner)) {
            console.log("knight firing slash")
            let player = this.parent.target.position
            let curPos = this.owner.position.clone()
            this.parent.slash.activate({spawn: curPos, direction: curPos.dirTo(player)})
        }

        this.finished(KnightBossStates.AIR)
    }

    public onExit(): Record<string, any> {
        this.parent.cooldown.start();
        this.owner.animation.stop();
        return {};
    }
}

export class KnightSlash{
    private actor: KnightBossActor
    private controller: KnightBossController
    private hitbox: Sprite
    private damage: number;

    // public static readonly KNIGHT_SLASH_KEY = "KNIGHT_SLASH_KEY"

    public constructor(controller: KnightBossController, actor: KnightBossActor) {
        this.actor = actor;
        this.controller = controller;
        this.damage = 10;
        this.initialize();
    }

    private initialize(){
        let scene = this.actor.getScene();
        this.hitbox = scene.add.sprite(Melee.MELEE_SPRITE_KEY, LevelLayers.PRIMARY)
        this.hitbox.addAI(KnightProjectileAI);
        this.hitbox.addPhysics();
        this.hitbox.setGroup(PhysicsGroups.NPC);
        this.hitbox.setTrigger(PhysicsGroups.PLAYER, "KNIGHT_SLASH_HIT", null);
    }

    public activate(options?: Record<string, any>) {
        console.log("goes here");
        const { spawn, direction } = options;
        
        // Bring this projectile to life
        if (!this.hitbox.visible){
            console.log("goes here again");
            this.hitbox.visible = true;
            this.hitbox.position = spawn;
            this.hitbox.setAIActive(true, {direction: direction, damage: this.damage});
        }
    }

    /** Getters and Setters */
    public getHitbox(): Sprite { return this.hitbox; }
}

export class KnightProjectile{
    private actor: KnightBossActor
    private controller: KnightBossController
    private hitbox: AnimatedSprite
    private damage: number;

    public constructor(controller: KnightBossController, actor: KnightBossActor) {
        this.actor = actor;
        this.controller = controller;
        this.damage = 10;
        // this.initialize();
    }
}

export class KnightBossController extends BasicEnemyController {
    protected override owner: KnightBossActor;
    public knockback: Vec2 = Vec2.ZERO;
    protected _target: AnimatedSprite;
    protected _cooldown: Timer;
    protected _slash: KnightSlash;
    protected _projectile: KnightProjectile;

    public initializeAI(owner: KnightBossActor, options: Record<string, any>): void {
        super.initializeAI(owner, options);

        this._target = this.owner.getScene().getPlayer();
        this._projectile = new KnightProjectile(this, this.owner);
        this._slash = new KnightSlash(this, this.owner);
        this._cooldown = new Timer(2000);

        this.velocity = Vec2.ZERO;
        this.MAX_SPEED = 500;
        this.MIN_SPEED = 500;
        this._health = 150;
        this.speed = this.MIN_SPEED

        this.addState(KnightBossStates.AIR, new Air(this, this.owner));
        this.addState(KnightBossStates.GROUND, new KnightGround(this, this.owner));
        this.addState(KnightBossStates.DEAD, new KnightDead(this, this.owner));
        this.addState(KnightBossStates.KNOCKBACK, new KnightKnockback(this, this.owner));
        this.addState(KnightBossStates.DAMAGED, new KnightDamage(this, this.owner));
        this.addState(KnightBossStates.ATTACKING, new KnightAttack(this, this.owner));

        this.receiver.subscribe(CustomGameEvents.ENEMY_DAMAGE);
        this.initialize(KnightBossStates.ATTACKING);
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
                let knockback = event.data.get('knockback');
                let center = event.data.get('center') as Vec2;
                // console.log("KnightBOSS: ENEMY HIT", id, dmg, this.owner.id);
                if (id === this.owner.id) {
                    // this.owner.position = new Vec2(3000, 3000);
                    // this.owner.visible = false;
                    if(knockback && center){
                        let a = center.dirTo(this.owner.position.clone()).scaleTo(knockback)
                        this.knockback = a;
                        this.changeState(KnightBossStates.KNOCKBACK);
                        this.owner.animation.playIfNotAlready(KnightAnimations.TAKING_DAMAGE);
                    }
                    else
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
        this.health = this.health - damage;
        if(this.health <= 0){
            this.changeState(KnightBossStates.DEAD);
        }
        else
            this.changeState(KnightBossStates.DAMAGED);
    }

    /** Getters and Setters to enable access in PlayerStates */
    public get target(): AnimatedSprite { return this._target; }
    public set target(target: AnimatedSprite) { this._target = target; }

    public get slash(): KnightSlash { return this._slash; }
    public set slash(slash: KnightSlash) { this._slash = slash; }

    public get projectile(): KnightProjectile { return this._projectile; }
    public set projectile(projectile: KnightProjectile) { this._projectile = projectile; }

    public get cooldown(): Timer { return this._cooldown; }
    public set cooldown(cooldown: Timer) { this._cooldown = cooldown; }
}

export class KnightBossActor extends AnimatedSprite {
    protected scene: Level

    // Key for the navmesh to use to build paths
    protected _navkey: string;

    constructor(spritesheet: Spritesheet){
        super(spritesheet);
        this.tweens.add('DEAD', {
            startDelay: 500,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.OUT_IN_SINE
                }
            ],
        })
    }

    public override setScene(scene: Level): void { this.scene = scene; }
    public override getScene(): Level { return this.scene; }

    public get navkey(): string { return this._navkey; }
    public set navkey(navkey: string) { this._navkey = navkey; }
}

export class KnightProjectileAI implements AI {
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
        this.receiver.subscribe("KNIGHT_PROJECTILE_HIT");

        this.currentXSpeed = 50;
        this.currentYSpeed = 50;
        this.speedIncrement = 100;
        this.minXSpeed = 100;
        this.maxXSpeed = 300;
        this.minYSpeed = 100;
        this.maxYSpeed = 300;

        this.activate(options);
    }

    public destroy(): void {
        
    }

    public activate(options: Record<string, any>): void {
        console.log(options);
        if (options) {
            this.damage = options.damage;
            this.direction = options.direction;
            this.currentXSpeed = 50;
            this.currentYSpeed = 50;
        }
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            case "KNIGHT_PROJECTILE_HIT":
                // console.log(event.data);
                let id = event.data.get('other');
                if(id === this.owner.id){
                    console.log("Player hit with Knight projectile", event.data);
                    this.emitter.fireEvent(CustomGameEvents.PLAYER_ENEMY_PROJECTILE_COLLISION, {node: event.data.get('node'), damage: this.damage});
                    this.owner.position.copy(new Vec2(500, 0));
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
                this.owner.position.copy(new Vec2(500, 0));
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
            let value = new Vec2(this.currentXSpeed * 30, this.currentYSpeed * 30);
            this.owner.move(value.scaled(deltaT));
        }
    }    
}