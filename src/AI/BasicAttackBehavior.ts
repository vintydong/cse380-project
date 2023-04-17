import AI from "../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import Receiver from "../Wolfie2D/Events/Receiver";
import Graphic from "../Wolfie2D/Nodes/Graphic";
import MathUtils from "../Wolfie2D/Utils/MathUtils";

/**
 * A class that represents the behavior of the bubbles in the HW2Scene
 * @author HenryLam
 */
export default class BasicAttack implements AI {
    // The GameNode that owns this behavior
    private owner: Graphic;
    private receiver: Receiver;

    // The direction to fire the bubble
    private direction: string;

    public initializeAI(owner: Graphic, options: Record<string, any>): void {
        this.owner = owner;

        this.receiver = new Receiver();
        // this.receiver.subscribe(HW2Events.PLAYER_BUBBLE_COLLISION);
        this.receiver.subscribe('ENEMY_HIT');

        this.activate(options);
    }

    public destroy(): void {
        
    }

    public activate(options: Record<string, any>): void {
        console.log(options);
        if (options) {
            this.direction = options.direction;
        }
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            case 'ENEMY_HIT':
                // console.log(event.data);
                let id = event.data.get('other');
                if(id === this.owner.id){
                    this.owner.position.copy(Vec2.ZERO);
                    this.owner._velocity.copy(Vec2.ZERO);
                    this.owner.visible = false;
                }
                break;
            // case GameEvents.ENEMY_BUBBLE_COLLISION: {
            //     this.handleEnemyBubbleCollision(event);
            //     break;
            // }
            default: {
                throw new Error("Unhandled event caught in BubbleBehavior! Event type: " + event.type);
            }
        }
    }

    public update(deltaT: number): void {   
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    protected handlePlayerBubbleCollision(event: GameEvent): void {
        let id = event.data.get("basicAttackId");
        if (id === this.owner.id) {
            this.owner.position.copy(Vec2.ZERO);
        }
    }
    
}


