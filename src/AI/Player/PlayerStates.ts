import State from "../../Wolfie2D/DataTypes/State/State";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import PlayerController from "./PlayerController";

/**
 * An abstract state for the PlayerController 
 */
export abstract class PlayerState extends State {
    protected parent: PlayerController;
	protected owner: AnimatedSprite;
	protected gravity: number;

	public constructor(parent: PlayerController, owner: AnimatedSprite){
		super(parent);
		this.owner = owner;
        this.gravity = 500;
	}

    public abstract onEnter(options: Record<string, any>): void;

    /**
     * Handle game events from the parent.
     * @param event the game event
     */
	public handleInput(event: GameEvent): void {
        switch(event.type) {
            // Default - throw an error
            default: {
                throw new Error(`Unhandled event in PlayerState of type ${event.type}`);
            }
        }
	}

	public update(deltaT: number): void {
        // This updates the direction the player sprite is facing (left or right)
        let direction = this.parent.moveDir;
		if(direction.x !== 0){
			this.owner.invertX = MathUtils.sign(direction.x) < 0;
		}
    }

    public abstract onExit(): Record<string, any>;
}

export class Attack extends PlayerState {
    public onEnter(options: Record<string, any>): void {
        
    }

    // Ignore all events from the rest of the game
    public handleInput(event: GameEvent): void { }

    // Empty update method - if the player is dead, don't update anything
    public update(deltaT: number): void {}

    public onExit(): Record<string, any> { return {}; }
}

export class Dead extends PlayerState {
    public onEnter(options: Record<string, any>): void {
        
    }

    // Ignore all events from the rest of the game
    public handleInput(event: GameEvent): void { }

    // Empty update method - if the player is dead, don't update anything
    public update(deltaT: number): void {}

    public onExit(): Record<string, any> { return {}; }
}

export class Fall extends PlayerState {
    public onEnter(options: Record<string, any>): void {
        
    }

    // Ignore all events from the rest of the game
    public handleInput(event: GameEvent): void { }

    // Empty update method - if the player is dead, don't update anything
    public update(deltaT: number): void {}

    public onExit(): Record<string, any> { return {}; }
}

export class Idle extends PlayerState {
    public onEnter(options: Record<string, any>): void {
        
    }

    // Ignore all events from the rest of the game
    public handleInput(event: GameEvent): void { }

    // Empty update method - if the player is dead, don't update anything
    public update(deltaT: number): void {}

    public onExit(): Record<string, any> { return {}; }
}

export class Jump extends PlayerState {
    public onEnter(options: Record<string, any>): void {
        
    }

    // Ignore all events from the rest of the game
    public handleInput(event: GameEvent): void { }

    // Empty update method - if the player is dead, don't update anything
    public update(deltaT: number): void {}

    public onExit(): Record<string, any> { return {}; }
}

export class Walk extends PlayerState {
    public onEnter(options: Record<string, any>): void {
        
    }

    // Ignore all events from the rest of the game
    public handleInput(event: GameEvent): void { }

    // Empty update method - if the player is dead, don't update anything
    public update(deltaT: number): void {}

    public onExit(): Record<string, any> { return {}; }
}