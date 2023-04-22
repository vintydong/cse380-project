import { CustomGameEvents } from "../../CustomGameEvents";
import Level from "../../Scenes/Level";
import GoapAction from "../../Wolfie2D/AI/Goap/GoapAction";
import StateMachineGoapAI from "../../Wolfie2D/AI/Goap/StateMachineGoapAI";
import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import Spritesheet from "../../Wolfie2D/DataTypes/Spritesheet";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import Timer from "../../Wolfie2D/Timing/Timer";

export const BOSS_GOAL = "KILL_PLAYER";

/** 
 * An abstract GOAP action for a boss
*/
export abstract class BossAction extends GoapAction {
    protected parent: BossBehavior;
    protected actor: BossController;

    protected _target: Vec2;
    protected _path: NavigationPath;

    public constructor(parent: BossBehavior, actor: BossController) {
        super(parent, actor);
        this._target = null;
    }

    public onEnter(options: Record<string, any>): void {
        let scene = this.actor.getScene() as Level;

        this._target = scene.getPlayer().position.clone();
        this.path = this.actor.getPath(this.actor.position, this._target);
    }

    public update(deltaT: number): void {
        if(!this.actor.onGround) {
            this.actor.velocity.y += this.actor.gravity * deltaT;
            this.actor.move(this.actor.velocity.scaled(deltaT));
        }

        if (this.target !== null && this.path !== null && !this.path.isDone()) {
            if (this.actor.atTarget(this.target)) {
                this.performAction(this.target);
            } else {
                this.actor.moveOnPath(this.actor.speed*deltaT*10, this.path)
            }
        } else {
            this.finished();
        }
    }

    public abstract performAction(target: Vec2): void;

    public onExit(): Record<string, any> {
        this.target = null;
        this.path = null;
        return {};
    }

    public handleInput(event: GameEvent): void {
        switch (event.type) {
            default: {
                throw new Error(`Unhandled event caught in NPCAction! Event type: ${event.type}`);
            }
        }
    }

    public get target(): Vec2 | null { return this._target; }
    protected set target(target: Vec2 | null) { this._target = target; }

    protected set path(path: NavigationPath | null) { this._path = path; }
    protected get path(): NavigationPath | null { return this._path; }
}

/** 
 * An abstract GOAP AI for a boss
*/
export abstract class BossBehavior extends StateMachineGoapAI<BossAction> {
    protected override owner: BossController;

    public initializeAI(owner: BossController, options: Record<string, any>): void {
        this.owner = owner;
    }

    public activate(options: Record<string, any>): void {}

    /**
     * @param event the game event
     */
    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            default: {
                super.handleEvent(event);
                break;
            }
        }
    }
}

/** 
 * A class representing a boss
*/
export class BossController extends AnimatedSprite {
    protected scene: Level;
    protected invulTimer: Timer;

    public _maxHealth: number = 10;
    public _health: number = 10;
    public _speed: number = 200;
    public _velocity: Vec2;
    public gravity: number = 1000;

    
    public constructor(sheet: Spritesheet) {
        super(sheet);
        this.invulTimer = new Timer(1000);
    }

    /** Returns true if this sprite is < 25 units from the target */
    public atTarget(target: Vec2): boolean {
        return target.distanceSqTo(this.position) < 625;
    }

    public getPath(to: Vec2, from: Vec2): NavigationPath { 
        let stack = new Stack<Vec2>();
        stack.push(to);
        let path = new NavigationPath(stack);
        return path;
    }

    public get maxHealth(): number { return this.maxHealth }
    public set maxHealth(maxHealth: number) { this.maxHealth = maxHealth; }

    public get health(): number { return this.health; }
    public set health(health: number) { 
        this.health = health; 
        if (this.health <= 0) {
            this.emitter.fireEvent(CustomGameEvents.BOSS_KILLED, {id: this.id});
        }
    }

    public get speed(): number { return this._speed; }
    public set speed(speed: number) { this._speed = speed; }

    public get velocity(): Vec2 { return this._velocity; }
    public set velocity(velocity: Vec2) { this._velocity = velocity; }


}