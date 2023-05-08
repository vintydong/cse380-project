import { CustomGameEvents } from "../../CustomGameEvents";
import Level from "../../Scenes/Level";
import Level2 from "../../Scenes/Level2";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Spritesheet from "../../Wolfie2D/DataTypes/Spritesheet";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import { BasicEnemyController } from "../BasicEnemyController";
import { Air, Dead, EnemyState, Ground } from "../demo_enemy/EnemyStates";

enum SlimeAnimations {
    IDLE = "IDLE",
    RUNNING = "RUNNING",
    TAKING_DAMAGE = "TAKING_DAMAGE",
    DEAD = "DEAD",
}

enum SlimeBossStates {
    GROUND = "GROUND",
    AIR = "AIR",
    DEAD = "DEAD",
    KNOCKBACK = "KNOCKBACK",
    DAMAGED = "DAMAGED",
}

class SlimeGround extends EnemyState {
    private dir: number = null;
    private time: number = 0;
    private jumping: boolean = false;
    private spawns: number = 0;

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = 750;
        this.owner.animation.playIfNotAlready(SlimeAnimations.RUNNING);
    }

    public update(deltaT: number): void {
        super.update(deltaT);
        this.owner.move(this.parent.velocity.scaled(deltaT));

        if (this.time > 0 && !this.jumping) {
            this.time -= 1;
        }
        
        if (!this.owner.onGround && (this.owner.onCeiling || this.parent.velocity.y > 0)){
            this.jumping = false;
            return this.finished(SlimeBossStates.AIR);
		} else if (this.parent.velocity.y < 0) {
            this.parent.velocity.y += this.parent.gravity * deltaT;
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }

        if (!this.jumping && this.time <= 0) {
            let r = Math.random();
            if (r < .65){
                this.time = 100;
                this.dir = (Math.random() - 0.5) * this.parent.speed;
                this.parent.velocity.x = this.dir;
            }
            else{
                let scene = this.owner.getScene() as Level;
                let player = scene.getPlayer().position.clone();
                let dir = this.owner.position.dirTo(player);

                // Jump away from player after half health
                this.parent.velocity.x = dir.x;
                if(this.parent.health < this.parent.maxHealth/2)
                    this.parent.velocity.x = -dir.x;

                this.parent.velocity.y = -2;
                this.parent.velocity.scaleTo(this.parent.speed);
                this.jumping = true;
            }
            // else if (this.spawns < 2){ // Add attack here: spawn a slime
            //     let scene = this.owner.getScene() as Level;
            //     let player = scene.getPlayer().position.clone();
            //     player.y = player.y - 200;
            //     (scene as Level2).spawnEnemy(player);
            //     this.spawns = this.spawns + 1;
            // }
        }
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

class SlimeDamage extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        this.owner.animation.playIfNotAlready(SlimeAnimations.TAKING_DAMAGE);
    }
    
    public update(deltaT: number): void {
        if(!this.owner.animation.isPlaying(SlimeAnimations.TAKING_DAMAGE))
            this.finished(SlimeBossStates.AIR);
    }

    public onExit(): Record<string, any> {
        return {}
    }
}

class SlimeDead extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        this.owner.animation.playIfNotAlready(SlimeAnimations.DEAD, false);
        this.owner.tweens.play('DEAD');
        this.owner.disablePhysics();
        
        let scene = this.owner.getScene() as Level;
        let player = scene.getPlayer().position.clone();
        player.y = player.y - 300;
        (scene as Level2).spawnEnemy(player);
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

class SlimeKnockback extends EnemyState {
    private dir: Vec2;
    private timer: number = 10;

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = this.parent.MAX_SPEED;
        this.dir = (this.parent as SlimeBossController).knockback;
        this.timer = 10;
    }

    public update(deltaT: number): void {
        super.update(deltaT);
        this.owner.move(this.dir.scaled(deltaT));

        this.timer = this.timer - 1;

        if(this.timer < 0){
            if (!this.owner.onGround && (this.owner.onCeiling || this.parent.velocity.y > 0)){
                return this.finished(SlimeBossStates.AIR);
            }
            else
                this.finished(SlimeBossStates.GROUND);
        }
    }

    public onExit(): Record<string, any> {
        return {};
    }
}

export class SlimeBossController extends BasicEnemyController {
    protected override owner: SlimeBossActor;
    public knockback: Vec2 = Vec2.ZERO;

    public initializeAI(owner: SlimeBossActor, options: Record<string, any>): void {
        super.initializeAI(owner, options);

        this.velocity = Vec2.ZERO;
        this.MAX_SPEED = 1000;
        this.MIN_SPEED = 500;

        if(options.hp) {
            this._maxHealth = options.hp;
            this._health = options.hp;
        } else {
            this._maxHealth = 100;
            this._health = 100;
        }

        this.speed = this.MIN_SPEED

        this.addState(SlimeBossStates.AIR, new Air(this, this.owner));
        this.addState(SlimeBossStates.GROUND, new SlimeGround(this, this.owner));
        this.addState(SlimeBossStates.DEAD, new SlimeDead(this, this.owner));
        this.addState(SlimeBossStates.KNOCKBACK, new SlimeKnockback(this, this.owner));
        this.addState(SlimeBossStates.DAMAGED, new SlimeDamage(this, this.owner));

        this.receiver.subscribe(CustomGameEvents.ENEMY_DAMAGE);
        this.initialize(SlimeBossStates.AIR);
        // console.log(this);
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
                // console.log("SLIMEBOSS: ENEMY HIT", id, dmg, this.owner.id);
                if (id === this.owner.id) {
                    // this.owner.position = new Vec2(3000, 3000);
                    // this.owner.visible = false;
                    if(knockback && center){
                        let a = center.dirTo(this.owner.position.clone()).scaleTo(knockback)
                        this.knockback = a;
                        this.changeState(SlimeBossStates.KNOCKBACK);
                        this.owner.animation.playIfNotAlready(SlimeAnimations.TAKING_DAMAGE);
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
            // this.owner.position = new Vec2(3000, 3000);
            // this.owner.visible = false;
            this.changeState(SlimeBossStates.DEAD);
        }
        else
            this.changeState(SlimeBossStates.DAMAGED);
    }
}

export class SlimeBossActor extends AnimatedSprite {
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