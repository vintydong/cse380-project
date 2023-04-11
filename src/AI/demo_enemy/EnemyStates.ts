import State from "../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import PlayerController, { PlayerAnimations, PlayerControls, PlayerStates } from "../Player/PlayerController";
import demoEnemyController from "./demoEnemyController";

/**
 * An abstract state for the PlayerController 
 */
export abstract class EnemyState extends State {
    protected parent: demoEnemyController;
    protected owner: AnimatedSprite;
    protected gravity: number;

    public constructor(parent: demoEnemyController, owner: AnimatedSprite) {
        super(parent);
        this.owner = owner;
        this.gravity = 1000;
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
                throw new Error(`Unhandled event in PlayerState of type ${event.type}`);
            }
        }
    }

    public update(deltaT: number): void {
        // This updates the direction the player sprite is facing (left or right)
        let direction = this.parent.moveDir;
        // if (direction.x !== 0) {
        //     this.owner.invertX = MathUtils.sign(direction.x) < 0;
        // }
    }

    public abstract onExit(): Record<string, any>;
}

export class Attack extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        options.key
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void { }

    public onExit(): Record<string, any> { return {}; }
}

export class Dash extends EnemyState {
    private timestepsLeft: number;

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = this.parent.MAX_SPEED;
        this.timestepsLeft = 10;
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {
        super.update(deltaT);
        let moveDir = this.parent.moveDir;
        let faceDir = this.parent.faceDir;

        // Dash in direction of movement or cursor, normalized to 1/-1 so fixed distance
        let dx = moveDir.isZero() ? faceDir.x : moveDir.x;
        dx = dx > 0 ? 1 : -1

        this.owner.animation.playIfNotAlready(dx < 0 ? PlayerAnimations.RUNNING_LEFT : PlayerAnimations.RUNNING_RIGHT);
        
        this.parent.velocity.y += this.gravity * deltaT;
        this.parent.velocity.x = dx * 2 * this.parent.speed
        this.owner.move(this.parent.velocity.scaled(deltaT));
        
        if(this.timestepsLeft > 0){
            this.timestepsLeft--
            return;
        }

        if (Input.isJustPressed(PlayerControls.MOVE_UP))
            this.finished(PlayerStates.JUMP)
        else if (!this.owner.onGround && this.parent.velocity.y !== 0) {
            this.finished(PlayerStates.FALL);
        }
        else
            this.finished(PlayerStates.IDLE)
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

export class Dead extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        
    }

    // Ignore all events from the rest of the game
    public handleInput(event: GameEvent): void { }

    // Empty update method - if the player is dead, don't update anything
    public update(deltaT: number): void { }

    public onExit(): Record<string, any> { return {}; }
}

export class Fall extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        this.parent.velocity.y = 0;
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {
        if (this.owner.onGround) {
            // TODO: If we want fall damage or not
            // this.parent.health -= Math.floor(this.parent.velocity.y / 200);
            console.log("On Ground")
            this.finished(PlayerStates.IDLE);
        } 
        else if (Input.isPressed(PlayerControls.DASH))
            this.finished(PlayerStates.DASH);
        else {
            let dir = this.parent.moveDir;
            this.parent.velocity.x += dir.x * this.parent.speed / 3.5 - 0.3 * this.parent.velocity.x;
            this.parent.velocity.y += this.gravity * deltaT;
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
    }

    public onExit(): Record<string, any> { return {}; }
}

export class Idle extends EnemyState {
    private dir: number = null;
    private time: number = 100;

    public onEnter(options: Record<string, any>): void {
        this.owner.animation.play(PlayerAnimations.IDLE);
        this.parent.speed = this.parent.MIN_SPEED;
        // this.parent.velocity.x = 0;
        // this.parent.velocity.y = 0;
        console.log("Enter IDLE");
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {
        super.update(deltaT);
        // console.log(this.owner.onGround, this.parent.velocity);
        // if (!this.owner.onGround && this.owner.position.y > 0)
        if(this.dir && this.time > 0){
            this.owner.move(this.parent.velocity.scaled(deltaT));
            this.time -= 1;
        }
        else{
            this.time = 100;
            this.dir = (Math.random() - 0.5) * 40;
            this.parent.velocity.x = this.dir;
        }

        // if (!dir.isZero() && dir.y === 0)
        //     this.finished(PlayerStates.WALK);
        // else if (Input.isJustPressed(PlayerControls.MOVE_UP))
        //     this.finished(PlayerStates.JUMP);
        // else if (Input.isJustPressed(PlayerControls.DASH))
        //     this.finished(PlayerStates.DASH);
        
        // else {
        //     this.parent.velocity.y += this.gravity * deltaT;
        //     this.owner.move(this.parent.velocity.scaled(deltaT));
        // }
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

export class Jump extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        this.parent.velocity.y = -400;
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {
        super.update(deltaT);
        if (this.owner.onGround) {
			this.finished(PlayerStates.IDLE);
		} 
        else if(this.owner.onCeiling || this.parent.velocity.y >= 0){
            this.finished(PlayerStates.FALL);
		}
        else {
            let dir = this.parent.moveDir;
            this.parent.velocity.x += dir.x * this.parent.speed/3.5 - 0.3*this.parent.velocity.x;
            this.parent.velocity.y += this.gravity*deltaT;
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
    }

    public onExit(): Record<string, any> { return {}; }
}

export class Walk extends EnemyState {
    public onEnter(options: Record<string, any>): void {
        this.parent.speed = this.parent.MIN_SPEED;
        let dir = this.parent.moveDir;
        this.owner.animation.playIfNotAlready(dir.x < 0 ? PlayerAnimations.RUNNING_LEFT : PlayerAnimations.RUNNING_RIGHT);
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {
        super.update(deltaT);
        let dir = this.parent.moveDir;

        if (dir.isZero())
            this.finished(PlayerStates.IDLE)
        else if (Input.isJustPressed(PlayerControls.MOVE_UP))
            this.finished(PlayerStates.JUMP)
        else if (Input.isJustPressed(PlayerControls.DASH))
            this.finished(PlayerStates.DASH);
        else if (!this.owner.onGround && this.parent.velocity.y !== 0) {
            this.finished(PlayerStates.FALL);
        } else {
            // Update the vertical velocity of the player
            this.parent.velocity.y += this.gravity * deltaT;
            this.parent.velocity.x = dir.x * this.parent.speed
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}