import { CustomGameEvents, MenuEvents } from "../../CustomGameEvents";
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
    protected skillFired: string;

    public constructor(parent: PlayerController, owner: AnimatedSprite) {
        super(parent);
        this.owner = owner;
        this.gravity = 1500;
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

        // This updates player facing
        let dir = this.parent.moveDir;
        if (dir.x !== 0) {
            this.owner.invertX = MathUtils.sign(dir.x) < 0;
            this.parent.facing = MathUtils.sign(dir.x) < 0? "left" : "right"
        }

        // Update player position
        this.parent.velocity.x = dir.x * this.parent.speed
        this.parent.velocity.y += this.gravity * deltaT;
        this.owner.move(this.parent.velocity.scaled(deltaT));

        // Attacking animations
        if (Input.isJustPressed(PlayerControls.SKILL_ONE))
            this.skillFired = CustomGameEvents.SKILL_1_FIRED
        else if (Input.isJustPressed(PlayerControls.SKILL_TWO))
            this.skillFired = CustomGameEvents.SKILL_2_FIRED
        else if (Input.isJustPressed(PlayerControls.SKILL_THREE))
            this.skillFired = CustomGameEvents.SKILL_3_FIRED
        else if (Input.isJustPressed(PlayerControls.SKILL_FOUR))
            this.skillFired = CustomGameEvents.SKILL_4_FIRED
        if (this.skillFired) {
            this.emitter.fireEvent(this.skillFired, {direction: this.parent.facing})
            this.owner.animation.play(PlayerAnimations.ATTACKING)
            this.skillFired = null
        }
    }

    public abstract onExit(): Record<string, any>;
}

export class Ground extends PlayerState {
    private fromGround: boolean;
    
    public onEnter(options: Record<string, any>): void {
        console.log("ground")
        this.fromGround =  (options)? options.fromGround : false
        this.parent.speed = this.parent.MIN_SPEED;
    }

    public handleInput(event: GameEvent): void {}

    public update(deltaT: number): void {
        super.update(deltaT);
        this.parent.velocity.y = 0;

        let dir = this.parent.moveDir;
        if (Input.isJustPressed(PlayerControls.DASH) && this.parent.dashTimer.isStopped()) {
            this.finished(PlayerStates.DASH);
        }
        else if (Input.isJustPressed(PlayerControls.MOVE_UP)) {
            this.parent.velocity.y = -700;
            this.finished(PlayerStates.AIR);
        }
        else if (this.owner.animation.isPlaying(PlayerAnimations.ATTACKING)) { return; }
        else if (this.owner.onGround || this.fromGround) {
            let animation = (dir.x) ? PlayerAnimations.RUNNING : PlayerAnimations.IDLE;
            this.owner.animation.playIfNotAlready(animation, true);
        }
        else {
            this.finished(PlayerStates.AIR);
        }
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {fromGround: this.owner.onGround};
    }
}

export class Air extends PlayerState {
    private jumping: boolean;
    private falling: boolean;
    
    public onEnter(options: Record<string, any>): void {
        // First onGround is inaccurate, we care about subsequent ones
        let animation = (options.fromGround) ? PlayerAnimations.JUMPING : PlayerAnimations.FALLING  
        this.owner.animation.playIfNotAlready(animation)
    }

    public handleInput(event: GameEvent): void {}

    public update(deltaT: number): void {
        super.update(deltaT);

        // Accurately update status with animation played, otherwise transitions are interleaved
        if (this.owner.animation.isPlaying(PlayerAnimations.JUMPING)) {
            this.jumping = true;
            this.falling = false;
        }
        else if (this.owner.animation.isPlaying(PlayerAnimations.FALLING)) {
            this.jumping = false;
            this.falling = true;
        }
        else {
            this.falling = false;
        }

        // Handle inputs
        if (Input.isJustPressed(PlayerControls.MOVE_DOWN) || this.owner.onCeiling) {
            if (Input.isJustPressed(PlayerControls.MOVE_DOWN)) this.parent.velocity.y += 100;
            this.parent.velocity.y += 100
            this.owner.animation.playIfNotAlready(PlayerAnimations.FALLING);
        }
        else if (Input.isJustPressed(PlayerControls.DASH) && this.parent.airDash && this.parent.dashTimer.isStopped()) {
            this.finished(PlayerStates.DASH);
        }
        else if (this.owner.onGround && !this.jumping && !this.falling){
            this.parent.airDash = true;
            this.finished(PlayerStates.GROUND);
        }
        else if (this.owner.animation.isPlaying(PlayerAnimations.ATTACKING)) { return; }
        else if (this.parent.velocity.y >= 0) {
            this.owner.animation.playIfNotAlready(PlayerAnimations.FALLING);
        }
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {fromGround: false};
    }
}

export class Dash extends PlayerState {
    private fromGround: boolean;
    private timestepsLeft: number;
    private direction: string;

    public onEnter(options: Record<string, any>): void {
        if (!options.fromGround) this.parent.airDash = false;
        this.fromGround = options.fromGround;
        this.parent.speed = this.parent.MAX_SPEED;
        this.timestepsLeft = 15;
        this.direction = this.parent.facing;
        this.owner.animation.play(PlayerAnimations.DASH);
        
    }

    public handleInput(event: GameEvent): void {}

    public update(deltaT: number): void {
        super.update(deltaT);
        let xdir = (this.direction == "left") ? -1 : 1
        this.parent.velocity.x = xdir * 2 * this.parent.speed
        this.parent.velocity.y = 0;
        this.owner.move(this.parent.velocity.scaled(deltaT));
        
        // Don't transition states while dashing
        if (this.timestepsLeft-- > 0) { return; }

        // Transition states
        this.finished(PlayerStates.AIR)
        // if (this.fromGround) { this.finished(PlayerStates.GROUND); }
        // else { this.finished(PlayerStates.AIR); }p
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        this.parent.dashTimer.start();
        return {fromGround: this.fromGround};
    }
}

export class Dead extends PlayerState {
    public onEnter(options: Record<string, any>): void {
        this.owner.animation.play(PlayerAnimations.DEAD);
    }

    public handleInput(event: GameEvent): void {}

    public update(deltaT: number): void {}

    public onExit(): Record<string, any> { return {}; }
}

// export class Attack extends PlayerState {
//     private stepLeft: boolean;
//     private skillFired: string;
//     public onEnter(options: Record<string, any>): void {
//         this.stepLeft = true;
//         this.skillFired = options.skillFired;
//         this.owner.animation.play(PlayerAnimations.ATTACKING);
//     }

//     public handleInput(event: GameEvent): void { }

//     public update(deltaT: number): void {
//         let dir = this.parent.moveDir;
//         if (this.stepLeft){
//             this.emitter.fireEvent(this.skillFired, {direction: this.parent.facing});
//             this.stepLeft = false;
//         }
//         else if (Input.isJustPressed(PlayerControls.MOVE_UP))
//             this.finished(PlayerStates.JUMP);
//         else if (Input.isJustPressed(PlayerControls.DASH) && this.parent.dashTimer.isStopped())
//             this.finished(PlayerStates.DASH);

//         // Go idle after animation finishes
//         if (!this.owner.animation.isPlaying(PlayerAnimations.ATTACKING)) {
//             this.finished(PlayerStates.IDLE);
//         }
//     }
    
//     public onExit(): Record<string, any> { 
//         this.owner.animation.stop();
//         return {};
//      }
// }

// export class Dash extends PlayerState {
//     private timestepsLeft: number;
//     private direction: string;
//     private jumpBuffer: boolean;
//     private attackBuffer: boolean;
//     private grounded: boolean;
//     private skillFired: string;

//     public onEnter(options: Record<string, any>): void {
//         this.parent.speed = this.parent.MAX_SPEED;
//         this.parent.velocity.y = 1;
//         this.timestepsLeft =  15;
//         this.direction = this.parent.facing;
//         this.jumpBuffer = false;
//         this.attackBuffer = false;
//         this.grounded = this.owner.onGround;
//         this.skillFired = "";
//         this.owner.animation.play(PlayerAnimations.DASH);
//     }

//     public handleInput(event: GameEvent): void { }

//     public update(deltaT: number): void {
//         super.update(deltaT);
//         let dx = (this.direction == "left") ? -1 : 1
    
//         this.parent.velocity.x = dx * 2 * this.parent.speed
//         this.owner.move(this.parent.velocity.scaled(deltaT));

//         if(Input.isJustPressed(PlayerControls.MOVE_UP)) {
//             this.jumpBuffer = true;
//         }
//         if(Input.isJustPressed(PlayerControls.SKILL_ONE)) {
//             this.attackBuffer = true;
//             this.skillFired = CustomGameEvents.SKILL_1_FIRED
//         }
        
//         if(this.timestepsLeft > 0){
//             this.timestepsLeft--
//             return;
//         }
        
//         if (this.grounded && this.jumpBuffer)
//             this.finished(PlayerStates.JUMP)
//         else if (this.attackBuffer)
//             this.finished(PlayerStates.ATTACKING)
//         else if (!this.owner.onGround && this.parent.velocity.y !== 0) 
//             this.finished(PlayerStates.FALL);
//         else
//             this.finished(PlayerStates.IDLE);
//     }

//     public onExit(): Record<string, any> {
//         this.owner.animation.stop();
//         this.parent.dashTimer.start();
//         return {skillFired: this.skillFired};
//     }
// }

// export class Dead extends PlayerState {
//     public onEnter(options: Record<string, any>): void {
//         this.owner.animation.play(PlayerAnimations.DEAD);
//     }

//     // Ignore all events from the rest of the game
//     public handleInput(event: GameEvent): void { }

//     // Empty update method - if the player is dead, don't update anything
//     public update(deltaT: number): void { }

//     public onExit(): Record<string, any> { return {}; }
// }

// export class Fall extends PlayerState {
//     public onEnter(options: Record<string, any>): void {
//         this.parent.velocity.y = 100;
//         this.owner.animation.play(PlayerAnimations.FALLING);
//     }

//     public handleInput(event: GameEvent): void { }

//     public update(deltaT: number): void {
//         super.update(deltaT);
//         if (this.owner.onGround) {
//             this.parent.airDash = true;
//             this.finished(PlayerStates.IDLE);
//         } 
//         else if (Input.isPressed(PlayerControls.DASH) && this.parent.dashTimer.isStopped() && this.parent.airDash){
//             this.parent.airDash = false;
//             this.finished(PlayerStates.DASH);

//         }
//         else {
//             let dir = this.parent.moveDir;
//             this.parent.velocity.x += dir.x * this.parent.speed / 3.5 - 0.3 * this.parent.velocity.x;
//             this.parent.velocity.y += this.gravity * deltaT;
//             this.owner.move(this.parent.velocity.scaled(deltaT));
//         }
//     }

//     public onExit(): Record<string, any> { 
//         this.owner.animation.stop();
//         return {};
//      }
// }

// export class Idle extends PlayerState {
//     skillFired = "";
//     public onEnter(options: Record<string, any>): void {        
//         this.parent.speed = this.parent.MIN_SPEED;
//         this.parent.velocity.copy(Vec2.ZERO)
//         this.owner.animation.play(PlayerAnimations.IDLE);
//     }

//     public handleInput(event: GameEvent): void { }

//     public update(deltaT: number): void {
//         super.update(deltaT);
//         let dir = this.parent.moveDir;

//         if (!dir.isZero() && dir.y === 0)
//             this.finished(PlayerStates.WALK);
//         else if (Input.isJustPressed(PlayerControls.MOVE_UP))
//             this.finished(PlayerStates.JUMP);
//         else if (Input.isJustPressed(PlayerControls.DASH) && this.parent.dashTimer.isStopped())
//             this.finished(PlayerStates.DASH);
//         else if (Input.isJustPressed(PlayerControls.SKILL_ONE) || Input.isJustPressed(PlayerControls.SKILL_TWO)){
//             if (Input.isJustPressed(PlayerControls.SKILL_ONE)){
//                 this.skillFired = CustomGameEvents.SKILL_1_FIRED
//             }
//             else if (Input.isJustPressed(PlayerControls.SKILL_TWO)){
//                 this.skillFired = CustomGameEvents.SKILL_2_FIRED
//             }
//             this.finished(PlayerStates.ATTACKING);
//         }
//         else if (!this.owner.onGround && this.parent.velocity.y > 0)
//             this.finished(PlayerStates.FALL);
//         else {
//             this.parent.velocity.y += this.gravity * deltaT;
//             this.owner.move(this.parent.velocity.scaled(deltaT));
//         }
//     }

//     public onExit(): Record<string, any> {
//         this.owner.animation.stop();
//         return {skillFired: this.skillFired};
//     }
// }

// export class Jump extends PlayerState {
//     private shortjump: boolean;
//     skillFired = "";
    
//     public onEnter(options: Record<string, any>): void {
//         this.parent.velocity.y = -700;
//         console.log("jumping", this.parent.velocity.y)
//         this.owner.animation.playIfNotAlready(PlayerAnimations.JUMPING);
//     }
    
//     public handleInput(event: GameEvent): void { }
    
//     public update(deltaT: number): void {
//         // Maybe implement short jump vs long jump
//         // console.log("Long press?", Input.isPressed(PlayerControls.MOVE_UP));
//         // console.log("short press?", Input.isJustPressed(PlayerControls.MOVE_UP));
//         super.update(deltaT);
//         if (this.owner.onCeiling || this.parent.velocity.y >= 0){
//             this.finished(PlayerStates.FALL);
// 		}
//         else if (Input.isPressed(PlayerControls.MOVE_DOWN)) {
//             this.finished(PlayerStates.FALL);
//         }
//         else if (Input.isPressed(PlayerControls.DASH) && this.parent.dashTimer.isStopped() && this.parent.airDash){
//             this.parent.airDash = false;
//             this.finished(PlayerStates.DASH);
//         }
//         else if (Input.isJustPressed(PlayerControls.SKILL_ONE) || Input.isJustPressed(PlayerControls.SKILL_TWO)){
//             if (Input.isJustPressed(PlayerControls.SKILL_ONE))
//                 this.skillFired = CustomGameEvents.SKILL_1_FIRED
//             else if (Input.isJustPressed(PlayerControls.SKILL_TWO))
//                 this.skillFired = CustomGameEvents.SKILL_2_FIRED
//             this.finished(PlayerStates.ATTACKING);
//         }
//         else if (this.parent.velocity.y < 0) {
//             let dir = this.parent.moveDir;
//             this.parent.velocity.x += dir.x * this.parent.speed / 3.5 - 0.3 * this.parent.velocity.x;
//             this.parent.velocity.y += this.gravity * deltaT;
//             this.owner.move(this.parent.velocity.scaled(deltaT));
//         }
//         else if (this.owner.onGround){
//             this.finished(PlayerStates.IDLE)
//         }
//     }

//     public onExit(): Record<string, any> { 
//         this.owner.animation.stop();
//         return {skillFired: this.skillFired};
//      }
// }

// export class Walk extends PlayerState {
//     skillFired = "";
//     public onEnter(options: Record<string, any>): void {        
//         this.parent.speed = this.parent.MIN_SPEED;
//         this.owner.animation.play(PlayerAnimations.RUNNING);
//     }

//     public handleInput(event: GameEvent): void { }

//     public update(deltaT: number): void {
//         super.update(deltaT);
//         let dir = this.parent.moveDir;

//         if (dir.isZero())
//             this.finished(PlayerStates.IDLE)
//         else if (Input.isJustPressed(PlayerControls.MOVE_UP))
//             this.finished(PlayerStates.JUMP)
//         else if (Input.isJustPressed(PlayerControls.DASH) && this.parent.dashTimer.isStopped())
//             this.finished(PlayerStates.DASH);
//         else if (Input.isJustPressed(PlayerControls.SKILL_ONE) || Input.isJustPressed(PlayerControls.SKILL_TWO)){
//             if (Input.isJustPressed(PlayerControls.SKILL_ONE)){
//                 this.skillFired = CustomGameEvents.SKILL_1_FIRED
//             }
//             else if (Input.isJustPressed(PlayerControls.SKILL_TWO)){
//                 this.skillFired = CustomGameEvents.SKILL_2_FIRED
//             }
//             this.finished(PlayerStates.ATTACKING);
//         }
//         else if (!this.owner.onGround && this.parent.velocity.y !== 0) {
//             this.finished(PlayerStates.FALL);
//         } else {
//             // Update the vertical velocity of the player
//             this.parent.velocity.y += this.gravity * deltaT;
//             this.parent.velocity.x = dir.x * this.parent.speed
//             this.owner.move(this.parent.velocity.scaled(deltaT));
//         }
//     }

//     public onExit(): Record<string, any> {
//         this.owner.animation.stop();
//         return {skillFired: this.skillFired};
//     }
// }