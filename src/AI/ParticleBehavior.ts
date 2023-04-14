import AI from "../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import Receiver from "../Wolfie2D/Events/Receiver";
import Graphic from "../Wolfie2D/Nodes/Graphic";
import MathUtils from "../Wolfie2D/Utils/MathUtils";

export default class ParticleBehavior implements AI {
    // The GameNode that owns this behavior
    private owner: Graphic;
    private receiver: Receiver;

    // The direction to fire the bubble
    private direction: string;

    // The current horizontal and vertical speed of the bubble
    private currentXSpeed: number;
    private currentYSpeed: number;

    // How much to increase the speed of the bubble by each frame
    private xSpeedIncrement: number;

    // Upper and lower bounds on the horizontal speed of the bubble
    private minXSpeed: number;
    private maxXSpeed: number;

    public initializeAI(owner: Graphic, options: Record<string, any>): void {
        this.owner = owner;

        this.receiver = new Receiver();
        this.receiver.subscribe('ENEMY_HIT');

        this.currentXSpeed = 50;
        this.xSpeedIncrement = 0;
        this.minXSpeed = 75;
        this.maxXSpeed = 100;

        this.activate(options);
    }

    public destroy(): void {
        
    }

    public activate(options: Record<string, any>): void {
        // console.log(options);
        if (options) {
            this.direction = options.direction;
        }
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            case 'ENEMY_HIT':
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
        // Only update the bubble if it's visible
        if (this.owner.visible) {
            // Increment the speeds
            this.currentXSpeed += this.xSpeedIncrement * deltaT;

            // Clamp the speeds if need be
            this.currentXSpeed= MathUtils.clamp(this.currentXSpeed, this.minXSpeed, this.maxXSpeed)

            // Update position of the bubble - Scale up and move left
            let value = (this.direction == "left") ? Vec2.LEFT.scale(this.currentXSpeed* deltaT) : Vec2.RIGHT.scale(this.currentXSpeed* deltaT);
            this.owner.position.add(value);
        }
    }    
}


