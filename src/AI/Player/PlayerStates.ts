import { CustomGameEvent, CustomGameEvents, MenuEvents } from "../../CustomGameEvents";
import Level from "../../Scenes/Level";
import CheatManager from "../../Systems/CheatManager";
import State from "../../Wolfie2D/DataTypes/State/State";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../Wolfie2D/Timing/Timer";
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

    protected static cheatManager: CheatManager = CheatManager.getInstance();

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
        // this.parent.dashTimer.update(deltaT);

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

        let scene = this.owner.getScene() as Level;
        let skill_manager = scene.getSkillManager();

        // Attacking animations
        if (Input.isJustPressed(PlayerControls.SKILL_ONE))
            this.skillFired = CustomGameEvents.SKILL_1_FIRED
        else if (Input.isJustPressed(PlayerControls.SKILL_TWO))
            this.skillFired = CustomGameEvents.SKILL_2_FIRED
        else if (Input.isJustPressed(PlayerControls.SKILL_THREE))
            this.skillFired = CustomGameEvents.SKILL_3_FIRED
        else if (Input.isJustPressed(PlayerControls.SKILL_FOUR))
            this.skillFired = CustomGameEvents.SKILL_4_FIRED
        if (this.skillFired && skill_manager.getSkillCooldownFromEvent(this.skillFired)) {
            this.emitter.fireEvent(this.skillFired, {direction: this.parent.facing})
            this.owner.animation.play(PlayerAnimations.ATTACKING)
            let attackAudio = (this.owner.getScene() as Level).getAttackAudioKey()
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: attackAudio, loop: false, holdReference: false});
            this.skillFired = null
        }
        this.skillFired = null
    }

    public abstract onExit(): Record<string, any>;
}

export class Ground extends PlayerState {
    private fromGround: boolean;
    
    public onEnter(options: Record<string, any>): void {
        this.fromGround =  (options)? options.fromGround : false
        this.parent.speed = this.parent.MIN_SPEED;
    }

    public handleInput(event: GameEvent): void {}

    public update(deltaT: number): void {
        super.update(deltaT);
        this.parent.velocity.y = 0;

        let dir = this.parent.moveDir;
        if (Input.isJustPressed(PlayerControls.DASH) && (this.parent.dashTimer.isStopped() || PlayerState.cheatManager.getInfiniteSkills())) {
            this.finished(PlayerStates.DASH);
        }
        else if (Input.isJustPressed(PlayerControls.MOVE_UP)) {
            this.parent.velocity.y = -700;
            this.finished(PlayerStates.AIR);
        }
        else if (!this.owner.onGround && !this.fromGround){
            this.finished(PlayerStates.AIR);
        }
        else if (this.owner.animation.isPlaying(PlayerAnimations.ATTACKING)) { return; }
        else if (this.owner.onGround || this.fromGround) {
            let animation = (dir.x) ? PlayerAnimations.RUNNING : PlayerAnimations.IDLE;
            this.owner.animation.playIfNotAlready(animation, true);
        }
    }

    public onExit(): Record<string, any> {
        this.owner.animation.stop();
        return {fromGround: this.owner.onGround};
    }
}

export class Air extends PlayerState {
    
    public onEnter(options: Record<string, any>): void {
        // First onGround is inaccurate, we care about subsequent ones
        let animation = (options.fromGround) ? PlayerAnimations.JUMPING : PlayerAnimations.FALLING  
        this.owner.animation.playIfNotAlready(animation)
        if (animation == PlayerAnimations.JUMPING) {
            let jumpAudio = (this.owner.getScene() as Level).getJumpAudioKey()
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: jumpAudio, loop: false, holdReference: false});
        }
    }

    public handleInput(event: GameEvent): void {}

    public update(deltaT: number): void {
        super.update(deltaT);

        // Handle inputs
        if (Input.isJustPressed(PlayerControls.MOVE_DOWN) || this.owner.onCeiling) {
            if (Input.isJustPressed(PlayerControls.MOVE_DOWN)) this.parent.velocity.y += 100;
            this.parent.velocity.y += 100
            this.owner.animation.playIfNotAlready(PlayerAnimations.FALLING);
        }
        else if (Input.isJustPressed(PlayerControls.DASH) && ((this.parent.airDash && this.parent.dashTimer.isStopped()) || PlayerState.cheatManager.getInfiniteSkills())) {
            this.finished(PlayerStates.DASH);
        }
        else if (this.owner.onGround && this.parent.velocity.y >= 0){
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
        this.parent.iFrameTimer.start();
        this.parent.hit = true;
        this.owner.animation.play(PlayerAnimations.DASH);
        let dashAudio = (this.owner.getScene() as Level).getDashAudioKey()
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: dashAudio, loop: false, holdReference: false});
        
    }

    public handleInput(event: GameEvent): void {}

    public update(deltaT: number): void {
        super.update(deltaT);
        let xdir = (this.direction == "left") ? -1 : 1
        this.parent.velocity.x = xdir * 2.5 * this.parent.speed
        this.parent.velocity.y = 0;
        this.owner.move(this.parent.velocity.scaled(deltaT));
        
        // Don't transition states while dashing
        if (this.timestepsLeft-- > 0) { return; }

        // Transition states
        this.finished(PlayerStates.AIR)
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
        let dyingAudio = (this.owner.getScene() as Level).getDyingAudioKey()
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: dyingAudio, loop: false, holdReference: false});
        
        let timer = new Timer(1000, () => this.emitter.fireEvent(CustomGameEvents.LEVEL_FAILED));
        timer.start();
    }

    public handleInput(event: GameEvent): void {}

    public update(deltaT: number): void {}

    public onExit(): Record<string, any> { return {}; }
}

export class Knockback extends PlayerState {
    private direction: string;
    private knocked: boolean;

    public onEnter(options: Record<string, any>): void {
        this.direction = this.parent.facing
        this.parent.speed = this.parent.MAX_SPEED;
        this.parent.velocity.y = 0;
        this.knocked = false;
        
        this.owner.animation.play(PlayerAnimations.TAKING_DAMAGE);
        let hurtAudio = (this.owner.getScene() as Level).getHurtAudioKey();
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: hurtAudio, loop: false, holdReference: false});
    }

    public handleInput(event: GameEvent): void { }

    public update(deltaT: number): void {
        // super.update(deltaT);
        if (!this.knocked) {
            let dx = (this.direction == "left") ? 1 : -1
    
            this.parent.velocity.x = dx * 2000
            this.parent.velocity.y = -750;
            this.owner.move(this.parent.velocity.scale(deltaT));
            this.knocked = true;
        }
        if (!this.owner.animation.isPlaying(PlayerAnimations.TAKING_DAMAGE)) {
            this.finished(PlayerStates.AIR);
        }
    }

    public onExit(): Record<string, any> { 
        this.owner.animation.stop();
        return {}; 
    }
}