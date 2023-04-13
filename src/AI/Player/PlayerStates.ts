import { GameEvents } from "../../GameEvents";
import State from "../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import PlayerController, { PlayerAnimations, PlayerControls, PlayerStates } from "./PlayerController";

/**
 * An abstract state for the PlayerController 
 */
export abstract class PlayerState extends State {
    protected parent: PlayerController;
    protected owner: AnimatedSprite;
    protected gravity: number;

    public constructor(parent: PlayerController, owner: AnimatedSprite) {
        super(parent);
        this.owner = owner;
        this.gravity = 1300;
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
        // Update dash timer
        this.parent.dashTimer.update(deltaT);

        // Do not update the direction the sprite is facing if DASHING
        if (this instanceof Dash) { return; }

        // This updates the direction the player sprite is facing (left or right)
        let direction = this.parent.moveDir;
        if (direction.x !== 0) {
            this.owner.invertX = MathUtils.sign(direction.x) < 0;
            this.parent.facing = MathUtils.sign(direction.x) < 0? "left" : "right"
        }
    }

    public abstract onExit(): Record<string, any>;
}

export class Attack extends PlayerState {
    public onEnter(options: Record<string, any>): void {
        this.emitter.fireEvent(GameEvents.SKILL_1_FIRED, {direction: this.parent.facing});
        this.owner.animation.play(PlayerAnimations.ATTACKING);
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {
        let dir = this.parent.moveDir;
        if (!dir.isZero() && dir.y === 0)
            this.finished(PlayerStates.WALK);
        else if (Input.isJustPressed(PlayerControls.MOVE_UP))
            this.finished(PlayerStates.JUMP);
        else if (Input.isJustPressed(PlayerControls.DASH) && this.parent.dashTimer.isStopped())
            this.finished(PlayerStates.DASH);
        else if (Input.isJustPressed(PlayerControls.SKILL_ONE))
            this.finished(PlayerStates.ATTACKING);

        // Go idle after animation finishes
        if (!this.owner.animation.isPlaying(PlayerAnimations.ATTACKING)) {
            this.finished(PlayerStates.IDLE);
        }
    }
    
    public onExit(): Record<string, any> { 
        this.owner.animation.stop();
        return {};
     }
}

export class Dash extends PlayerState {
    private timestepsLeft: number;
    private direction: string;

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = this.parent.MAX_SPEED;
        this.parent.velocity.y = 0;
        this.timestepsLeft =  15;
        this.direction = this.parent.facing;
        this.owner.animation.play(PlayerAnimations.DASH);
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {
        super.update(deltaT);
        let dx = (this.direction == "left") ? -1 : 1
    
        // this.parent.velocity.y += this.gravity * deltaT;
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
        this.parent.dashTimer.start();
        return {};
    }
}

export class Dead extends PlayerState {
    public onEnter(options: Record<string, any>): void {
        this.owner.animation.play(PlayerAnimations.DEAD);
    }

    // Ignore all events from the rest of the game
    public handleInput(event: GameEvent): void { }

    // Empty update method - if the player is dead, don't update anything
    public update(deltaT: number): void { }

    public onExit(): Record<string, any> { return {}; }
}

export class Fall extends PlayerState {
    public onEnter(options: Record<string, any>): void {
        this.parent.velocity.y = 0;
        this.owner.animation.play(PlayerAnimations.FALLING);
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {
        super.update(deltaT);
        if (this.owner.onGround) {
            // TODO: If we want fall damage or not
            // this.parent.health -= Math.floor(this.parent.velocity.y / 200);
            this.parent.airDash = true;
            this.finished(PlayerStates.IDLE);
        } 
        else if (Input.isPressed(PlayerControls.DASH) && this.parent.dashTimer.isStopped() && this.parent.airDash){
            this.parent.airDash = false;
            this.finished(PlayerStates.DASH);

        }
        else {
            let dir = this.parent.moveDir;
            this.parent.velocity.x += dir.x * this.parent.speed / 3.5 - 0.3 * this.parent.velocity.x;
            this.parent.velocity.y += this.gravity * deltaT;
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
    }

    public onExit(): Record<string, any> { 
        this.owner.animation.stop();
        return {};
     }
}

export class Idle extends PlayerState {
    public onEnter(options: Record<string, any>): void {        
        this.parent.speed = this.parent.MIN_SPEED;
        this.parent.velocity.x = 0;
        this.parent.velocity.y = 0;
        this.owner.animation.play(PlayerAnimations.IDLE);
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {
        super.update(deltaT);
        let dir = this.parent.moveDir;

        if (!dir.isZero() && dir.y === 0)
            this.finished(PlayerStates.WALK);
        else if (Input.isJustPressed(PlayerControls.MOVE_UP))
            this.finished(PlayerStates.JUMP);
        else if (Input.isJustPressed(PlayerControls.DASH) && this.parent.dashTimer.isStopped())
            this.finished(PlayerStates.DASH);
        else if (Input.isJustPressed(PlayerControls.SKILL_ONE))
            this.finished(PlayerStates.ATTACKING);
        else if (!this.owner.onGround && this.parent.velocity.y > 0)
            this.finished(PlayerStates.FALL);
        else {
            this.parent.velocity.y += this.gravity * deltaT;
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {};
    }
}

export class Jump extends PlayerState {
    private shortjump: boolean;
    
    public onEnter(options: Record<string, any>): void {
        this.parent.velocity.y = -700;
        this.owner.animation.playIfNotAlready(PlayerAnimations.JUMPING);
    }
    
    public handleInput(event: GameEvent): void { }
    
    public update(deltaT: number): void {
        // Maybe implement short jump vs long jump
        // console.log("Long press?", Input.isPressed(PlayerControls.MOVE_UP));
        // console.log("short press?", Input.isJustPressed(PlayerControls.MOVE_UP));
        super.update(deltaT);
        if (this.owner.onGround) {
			this.finished(PlayerStates.IDLE);
		} 
        else if (this.owner.onCeiling || this.parent.velocity.y >= 0){
            this.finished(PlayerStates.FALL);
		}
        else if (Input.isPressed(PlayerControls.MOVE_DOWN)) {
            this.finished(PlayerStates.FALL);
        }
        else if (Input.isPressed(PlayerControls.DASH) && this.parent.dashTimer.isStopped() && this.parent.airDash){
            this.parent.airDash = false;
            this.finished(PlayerStates.DASH);
        }
        else {
            let dir = this.parent.moveDir;
            this.parent.velocity.x += dir.x * this.parent.speed / 3.5 - 0.3 * this.parent.velocity.x;
            this.parent.velocity.y += this.gravity * deltaT;
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
    }

    public onExit(): Record<string, any> { 
        this.owner.animation.stop();
        return {};
     }
}

export class Walk extends PlayerState {
    public onEnter(options: Record<string, any>): void {        
        this.parent.speed = this.parent.MIN_SPEED;
        this.owner.animation.play(PlayerAnimations.RUNNING);
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {
        super.update(deltaT);
        let dir = this.parent.moveDir;

        if (dir.isZero())
            this.finished(PlayerStates.IDLE)
        else if (Input.isJustPressed(PlayerControls.MOVE_UP))
            this.finished(PlayerStates.JUMP)
        else if (Input.isJustPressed(PlayerControls.DASH) && this.parent.dashTimer.isStopped())
            this.finished(PlayerStates.DASH);
        else if (Input.isJustPressed(PlayerControls.SKILL_ONE))
            this.finished(PlayerStates.ATTACKING);
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