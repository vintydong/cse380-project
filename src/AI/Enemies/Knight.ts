import { CustomGameEvents } from "../../CustomGameEvents";
import { PhysicsGroups } from "../../Physics";
import Level, { LevelLayers } from "../../Scenes/Level";
import Level3 from "../../Scenes/Level3";
import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Spritesheet from "../../Wolfie2D/DataTypes/Spritesheet";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Receiver from "../../Wolfie2D/Events/Receiver";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../Wolfie2D/Timing/Timer";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { BasicEnemyController } from "../BasicEnemyController";
import { Air, EnemyState } from "../demo_enemy/EnemyStates";

enum KnightAnimations {
    IDLE = "IDLE",
    RUNNING = "RUNNING",
    TAKING_DAMAGE = "TAKING_DAMAGE",
    DEAD = "DEAD",
}

enum KnightStates {
    GROUND = "GROUND",
    AIR = "AIR",
    DEAD = "DEAD",
    KNOCKBACK = "KNOCKBACK",
    DAMAGED = "DAMAGED",
    ATTACK = "ATTACK"
}

class KnightGround extends EnemyState{
    private dir: number = null;
    private time: number = 0;

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = this.parent.MAX_SPEED;
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
            this.finished(KnightStates.AIR);
    }

    public onExit(): Record<string, any> {
        return {};
    }
}

class KnightDead extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        this.owner.animation.playIfNotAlready(KnightAnimations.DEAD, false);
        this.owner.tweens.play('DEAD');
        this.owner.disablePhysics();
    }

    public update(deltaT: number): void {
        if(this.owner.alpha == 0){
            this.owner.position = new Vec2(3000, 3000);
            this.owner.visible = false;
        }
    }

    public onExit(): Record<string, any> { 
        return {}; 
    }
}

// class KnightAttack extends EnemyState{
//     protected override parent: KnightController

//     public onEnter(options: Record<string, any>): void {
//         this.owner.animation.playIfNotAlready(KnightAnimations.RUNNING);
//     }

//     public update(deltaT: number): void {
//         super.update(deltaT);

//         if (this.parent.target.positionX - 100 <= this.owner.positionX) {
//             console.log("knight firing attack")
//             let player = this.parent.target.position
//             let curPos = this.owner.position.clone()
//             this.parent.slash.activate({spawn: curPos, direction: curPos.dirTo(player)})
//         }

//         this.finished(KnightStates.AIR)
//     }

//     public onExit(): Record<string, any> {
//         this.parent.cooldown.start();
//         this.owner.animation.stop();
//         return {};
//     }

// }

class KnightKnockback extends EnemyState {
    private dir: Vec2;
    private timer: number = 10;

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = this.parent.MAX_SPEED;
        this.dir = (this.parent as KnightController).knockback;
        this.timer = 10;
        console.log("KNOCKBACK")

    }

    public update(deltaT: number): void {
        super.update(deltaT);
        this.owner.move(this.dir.scaled(deltaT));

        this.timer = this.timer - 1;

        if(this.timer < 0){
            if (!this.owner.onGround && (this.owner.onCeiling || this.parent.velocity.y > 0)){
                return this.finished(KnightStates.AIR);
            }
            else
                this.finished(KnightStates.GROUND);
        }
    }

    public onExit(): Record<string, any> { 
        return {}; 
    }
}

// export class KnightSlash {
//     private actor: KnightActor
//     private controller: KnightController
//     private hitbox: AnimatedSprite
//     private damage: number;

//     public static readonly KNIGHT_SLASH_KEY = "KNIGHT_SLASH_KEY"
//     public static readonly KNIGHT_SLASH_PATH = "assets/spritesheets/Enemies/Talon/Talon_Projectile.json"

//     public constructor(controller: KnightController, actor: KnightActor) {
//         this.actor = actor;
//         this.controller = controller;
//         this.damage = 10;
//         this.initialize();
//     }

//     private initialize(){
//         let scene = this.actor.getScene();
        
//         // Add projectile to scene
//         this.hitbox = scene.add.animatedSprite(KnightSlash.KNIGHT_SLASH_PATH, LevelLayers.PRIMARY)
//         this.hitbox.scale = new Vec2(1, 1);
//         this.hitbox.visible = false;

//         // Add AI
//         this.hitbox.addAI(KnightSlashAI);

//         // Add physics
//         this.hitbox.addPhysics();
//         this.hitbox.setGroup(PhysicsGroups.NPC);
//         this.hitbox.setTrigger(PhysicsGroups.PLAYER, "KNIGHT_SLASH_HIT", null);
//     }

//     public activate(options?: Record<string, any>) {
//         const { spawn, direction } = options;
        
//         // Bring this projectile to life
//         if (!this.hitbox.visible){
//             this.hitbox.visible = true;
//             this.hitbox.position = spawn;
//             this.hitbox.setAIActive(true, {direction: direction, damage: this.damage});
//         }
//     }

//     public getHitbox(): AnimatedSprite { return this.hitbox; }
// }

// export class KnightSlashAI implements AI {
//     // The GameNode that owns this behavior
//     private owner: AnimatedSprite;
//     private receiver: Receiver;
//     private emitter: Emitter;

//     // The direction to fire the projectile
//     private direction: Vec2;

//     // The current horizontal and vertical speed of the projectile
//     private currentXSpeed: number;
//     private currentYSpeed: number;

//     // How much to increase the speed of the projectile by each frame
//     private speedIncrement: number;

//     // Upper and lower bounds on the speeds of the projectile
//     private minXSpeed: number;
//     private maxXSpeed: number;
//     private minYSpeed: number;
//     private maxYSpeed: number;

//     private damage: number;

//     public initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
//         this.owner = owner;

//         this.emitter = new Emitter();
//         this.receiver = new Receiver();
//         this.receiver.subscribe("KNIGHT_SLASH_HIT");

//         this.currentXSpeed = 50;
//         this.currentYSpeed = 50;
//         this.speedIncrement = 100;
//         this.minXSpeed = 100;
//         this.maxXSpeed = 300;
//         this.minYSpeed = 100;
//         this.maxYSpeed = 300;

//         this.activate(options);
//     }

//     public destroy(): void {
        
//     }

//     public activate(options: Record<string, any>): void {
//         console.log(options);
//         if (options) {
//             this.damage = options.damage;
//             this.direction = options.direction;
//             this.currentXSpeed = 50;
//             this.currentYSpeed = 50;
//         }
//         this.owner.animation.play("ACTIVE");
//     }

//     public handleEvent(event: GameEvent): void {
//         switch(event.type) {
//             case "KNIGHT_SLASH_HIT":
//                 // console.log(event.data);
//                 let id = event.data.get('other');
//                 if(id === this.owner.id){
//                     console.log("Player hit with Knight slash", event.data);
//                     this.emitter.fireEvent(CustomGameEvents.PLAYER_ENEMY_PROJECTILE_COLLISION, {node: event.data.get('node'), damage: this.damage});
//                     this.owner.position.copy(new Vec2(500, 0));
//                     this.owner._velocity.copy(Vec2.ZERO);
//                     this.owner.visible = false;
//                 }
//                 break;
//             default: {
//                 throw new Error("Unhandled event caught in MeleeBehavior! Event type: " + event.type);
//             }
//         }
//     }

//     public update(deltaT: number): void {
//         while (this.receiver.hasNextEvent()) {
//             this.handleEvent(this.receiver.getNextEvent());
//         }

//         // Update projectile behavior if visible
//         if (this.owner.visible) {
//             // Despawn if collided with environment
//             if (this.owner.onWall || this.owner.onCeiling || this.owner.onGround) {
//                 this.owner.position.copy(new Vec2(500, 0));
//                 this.owner._velocity.copy(Vec2.ZERO);
//                 this.owner.visible = false;
//             }

//             // Increment the speeds
//             this.currentXSpeed += this.speedIncrement * deltaT;
//             this.currentYSpeed += this.speedIncrement * deltaT;

//             // Clamp the speeds if need be
//             this.currentXSpeed = MathUtils.clamp(this.currentXSpeed, this.minXSpeed, this.maxXSpeed);
//             this.currentYSpeed = MathUtils.clamp(this.currentYSpeed, this.minYSpeed, this.maxYSpeed);

//             // Move projectile towards target
//             let value = new Vec2(this.currentXSpeed * this.direction.x, this.currentYSpeed * this.direction.y);
//             this.owner.move(value.scaled(deltaT));
//         }
//     }    
// }

export class KnightController extends BasicEnemyController {
    protected override owner: KnightActor;
    public knockback: Vec2 = Vec2.ZERO;
    // protected _attack: KnightSlash
    // protected _target: AnimatedSprite;
    // protected _cooldown: Timer;

    public initializeAI(owner: KnightActor, options: Record<string, any>): void {
        super.initializeAI(owner, options);

        // this._attack = new KnightSlash(this, this.owner);
        // this._target = this.owner.getScene().getPlayer();
        // this._cooldown = new Timer(3000);

        this.velocity = Vec2.ZERO;
        this.MAX_SPEED = 400;
        this.MIN_SPEED = 400;
        this._health = 35;
        this.speed = this.MIN_SPEED

        this.addState(KnightStates.AIR, new Air(this, this.owner));
        this.addState(KnightStates.GROUND, new KnightGround(this, this.owner));
        this.addState(KnightStates.DEAD, new KnightDead(this, this.owner));
        this.addState(KnightStates.KNOCKBACK, new KnightKnockback(this, this.owner));
        this.addState(KnightStates.DAMAGED, new KnightDamage(this, this.owner));
        // this.addState(KnightStates.ATTACK, new KnightAttack(this, this.owner));

        this.receiver.subscribe(CustomGameEvents.ENEMY_DAMAGE);
        this.initialize(KnightStates.AIR);
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
                if (id === this.owner.id) {
                    if(knockback && center){
                        console.log(knockback, center, "lKNOCKBACK");
                        let a = center.dirTo(this.owner.position.clone()).scaleTo(knockback)
                        this.knockback = a;
                        this.changeState(KnightStates.KNOCKBACK);
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
            this.changeState(KnightStates.DEAD);
        }
        else
            this.changeState(KnightStates.DAMAGED);
    }

    // public get target(): AnimatedSprite { return this._target; }
    // public set target(target: AnimatedSprite) { this._target = target; }

    // public get slash(): KnightSlash { return this.slash; }
    // public set slash(slash: KnightSlash) { this.slash = slash; }

    // public get cooldown(): Timer { return this._cooldown; }
    // public set cooldown(cooldown: Timer) { this._cooldown = cooldown; }
}

export class KnightActor extends AnimatedSprite {
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