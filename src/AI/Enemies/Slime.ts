import { CustomGameEvents } from "../../CustomGameEvents";
import Level from "../../Scenes/Level";
import Level2 from "../../Scenes/Level2";
import Spritesheet from "../../Wolfie2D/DataTypes/Spritesheet";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import { BasicEnemyController } from "../BasicEnemyController";
import { Air, EnemyState } from "../demo_enemy/EnemyStates";

enum SlimeAnimations {
    IDLE = "IDLE",
    RUNNING = "RUNNING",
    TAKING_DAMAGE = "TAKING_DAMAGE",
    DEAD = "DEAD",
}

enum SlimeStates {
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

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = this.parent.MAX_SPEED;
        this.owner.animation.playIfNotAlready(SlimeAnimations.RUNNING);
    }

    public update(deltaT: number): void {
        super.update(deltaT);

        // Move in other direction if slime hit a wall
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
        } else if(this.time < 5){
            this.parent.velocity.x = 0;
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
            this.finished(SlimeStates.AIR);
    }

    public onExit(): Record<string, any> {
        return {}
    }
}

class SlimeDead extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        this.owner.animation.playIfNotAlready(SlimeAnimations.DEAD, false);
        this.owner.tweens.play('DEAD');
    }

    public update(deltaT: number): void {
        if(this.owner.alpha == 0){
            this.owner.position = new Vec2(3000, 3000);
            this.owner.visible = false;
        }
    }

    public onExit(): Record<string, any> { return {}; }
}

class SlimeKnockback extends EnemyState {
    private dir: Vec2;
    private timer: number = 10;

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = this.parent.MAX_SPEED;
        this.dir = (this.parent as SlimeController).knockback;
        this.timer = 10;
        console.log("KNOCKBACK")

    }

    public update(deltaT: number): void {
        super.update(deltaT);
        this.owner.move(this.dir.scaled(deltaT));

        this.timer = this.timer - 1;

        if(this.timer < 0){
            if (!this.owner.onGround && (this.owner.onCeiling || this.parent.velocity.y > 0)){
                return this.finished(SlimeStates.AIR);
            }
            else
                this.finished(SlimeStates.GROUND);
        }
    }

    public onExit(): Record<string, any> { return {}; }
}

export class SlimeController extends BasicEnemyController {
    protected override owner: SlimeActor;
    public knockback: Vec2 = Vec2.ZERO;

    public initializeAI(owner: SlimeActor, options: Record<string, any>): void {
        super.initializeAI(owner, options);

        this.velocity = Vec2.ZERO;
        this.MAX_SPEED = 400;
        this.MIN_SPEED = 400;
        this._health = 100;
        this.speed = this.MIN_SPEED

        this.addState(SlimeStates.AIR, new Air(this, this.owner));
        this.addState(SlimeStates.GROUND, new SlimeGround(this, this.owner));
        this.addState(SlimeStates.DEAD, new SlimeDead(this, this.owner));
        this.addState(SlimeStates.KNOCKBACK, new SlimeKnockback(this, this.owner));
        this.addState(SlimeStates.DAMAGED, new SlimeDamage(this, this.owner));

        this.receiver.subscribe(CustomGameEvents.ENEMY_DAMAGE);
        this.initialize(SlimeStates.AIR);
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
                    if(knockback && center){
                        console.log(knockback, center, "lKNOCKBACK");
                        let a = center.dirTo(this.owner.position.clone()).scaleTo(knockback)
                        this.knockback = a;
                        this.changeState(SlimeStates.KNOCKBACK);
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
            this.changeState(SlimeStates.DEAD);
        }
        else
            this.changeState(SlimeStates.DAMAGED);
    }
}

export class SlimeActor extends AnimatedSprite {
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