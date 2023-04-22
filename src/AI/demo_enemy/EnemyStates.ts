import State from "../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { BasicEnemyController } from "../BasicEnemyController";
import PlayerController, { PlayerAnimations, PlayerControls, PlayerStates } from "../Player/PlayerController";
import demoEnemyController, { demoEnemyAnimations } from "./demoEnemyController";

export enum EnemyStates {
    GROUND = "GROUND",
    AIR = "AIR",
    DEAD = "DEAD",
}

/**
 * An abstract state for the PlayerController 
 */
export abstract class EnemyState extends State {
    protected parent: BasicEnemyController;
    protected owner: AnimatedSprite;

    public constructor(parent: BasicEnemyController, owner: AnimatedSprite) {
        super(parent);
        this.owner = owner;
    }

    public abstract onEnter(options: Record<string, any>): void;

    /**
     * Handle game events from the parent.
     * @param event the game event
     */
    public handleInput(event: GameEvent): void {
        switch (event.type) {
            // Default - throw an error
            default: {
                throw new Error(`Unhandled event in EnemeyState of type ${event.type}`);
            }
        }
    }

    public update(deltaT: number): void {
        // This updates the direction the player sprite is facing (left or right)
        // if (direction.x !== 0) {
        //     this.owner.invertX = MathUtils.sign(direction.x) < 0;
        // }
    }

    public abstract onExit(): Record<string, any>;
}

export class Dead extends EnemyState {
    public onEnter(options: Record<string, any>): void { }

    // Ignore all events from the rest of the game
    public handleInput(event: GameEvent): void { }

    // Empty update method - if the player is dead, don't update anything
    public update(deltaT: number): void { }

    public onExit(): Record<string, any> { return {}; }
}

export class Air extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        this.parent.velocity.y = 0;
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {
        if (this.owner.onGround) {
            this.finished(EnemyStates.GROUND);
        }
        else {
            this.parent.velocity.y += this.parent.gravity * deltaT;
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
    }

    public onExit(): Record<string, any> { return {}; }
}

export class Ground extends EnemyState {
    private dir: number = null;
    private time: number = 100;

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = this.parent.MIN_SPEED;
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {
        super.update(deltaT);
        console.log(this.parent.velocity.x, this.parent.velocity.y, this.time);
        if (this.dir && this.time > 0) {
            this.owner.move(this.parent.velocity.scaled(deltaT));
            this.time -= 1;
        }
        else {
            this.time = 100;
            this.dir = (Math.random() - 0.5) * 40;
            this.parent.velocity.x = this.dir;
        }
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}