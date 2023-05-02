import { CustomGameEvents } from "../../CustomGameEvents";
import { PhysicsGroups } from "../../Physics";
import { LevelLayers } from "../../Scenes/Level";
import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Timer from "../../Wolfie2D/Timing/Timer";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import { SkillManager } from "../SkillManager";
import Skill from "./Skill";

/**
 * A class that represents a Repel attack that can be used by the player
 * @author HenryLam
 */
export default class Repel extends Skill {
    private hitbox: Sprite;
    public static readonly REPEL_SPRITE_KEY = "REPEL_SPRITE_KEY";
    public static readonly REPEL_SPRITE_PATH = "assets/sprites/attacks/repel.png";

    public constructor(skill_manager: SkillManager) {
        super(skill_manager);

        this.initialize();
        this.damage = 10;
        this.cooldown = new Timer(500);
    }

    public initialize(){
        let scene = this.skill_manager.getScene();
        
        this.hitbox = scene.add.sprite(Repel.REPEL_SPRITE_KEY, LevelLayers.PRIMARY)
        console.log("PRIMARY")
        this.hitbox.scale = new Vec2(3,3);
        this.hitbox.visible = false;

        this.hitbox.addAI(RepelBehavior);

        this.hitbox.addPhysics();
        this.hitbox.setGroup(PhysicsGroups.WEAPON);
        this.hitbox.setTrigger(PhysicsGroups.NPC, CustomGameEvents.ENEMY_HIT, null);

        // Add tween to particle
        this.hitbox.tweens.add("expand", {
            startDelay: 0,
            duration: 400,
            effects: [
                {
                    property: "alpha",
                    start: 1,
                    end: 0.5,
                    ease: EaseFunctionType.OUT_CIRC
                },
                {
                    property: "scaleX",
                    start: 1,
                    end: 10,
                    ease: EaseFunctionType.OUT_CIRC
                },
                {
                    property: "scaleY",
                    start: 1,
                    end: 10,
                    ease: EaseFunctionType.OUT_CIRC
                }
            ],
        });
        this.hitbox.tweens.add("fadeout", {
            startDelay: 400,
            duration: 200,
            effects: [
                {
                    property: "alpha",
                    start: 0.5,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_SINE
                },
            ],
            onEnd: 'REPEL_ATTACK_END',
        });
    }

    public activate(options?: Record<string, any>) {
        const { direction } = options;
        // Bring this basic attack to life
        this.hitbox.visible = true;
        this.hitbox.alpha = 1;
        this.hitbox.position = this.skill_manager.getPlayer().position.clone();
        this.hitbox.scale = new Vec2(3,3);
        this.hitbox.collisionShape.halfSize.copy(new Vec2(32, 32))

        this.cooldown.start();

        this.hitbox.setAIActive(true, {direction: direction, damage: this.damage});
        console.log(this.hitbox.collisionShape)
        this.hitbox.tweens.play("expand");
        this.hitbox.tweens.play("fadeout");
    }
}

/**
 * A class that represents the behavior of the Repel attack
 * @author HenryLam
 */
export class RepelBehavior implements AI {
    // The GameNode that owns this behavior
    private owner: Sprite;
    private receiver: Receiver;
    private emitter: Emitter;

    // The direction to fire the bubble
    private direction: string;
    private damage: number;

    public initializeAI(owner: Sprite, options: Record<string, any>): void {
        this.owner = owner;

        this.emitter = new Emitter();
        this.receiver = new Receiver();
        this.receiver.subscribe(CustomGameEvents.ENEMY_HIT);
        this.receiver.subscribe('REPEL_ATTACK_END');

        this.activate(options);
    }

    public destroy(): void {
        
    }

    public activate(options: Record<string, any>): void {
        console.log(options);
        if (options) {
            this.damage = options.damage || 10;
            this.direction = options.direction;
        }
        // this.owner.invertX = (this.direction == "left") ? true : false;
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            case 'REPEL_ATTACK_END':
                this.owner.position.copy(Vec2.ZERO);
                this.owner._velocity.copy(Vec2.ZERO);
                this.owner.visible = false;
                break;
            case CustomGameEvents.ENEMY_HIT:
                let id = event.data.get('other');
                if(id === this.owner.id){
                    console.log("Hit an enemy with Repel", event.data);
                    this.emitter.fireEvent(CustomGameEvents.ENEMY_DAMAGE, {node: event.data.get('node'), damage: this.damage, knockback: 2000});
                }
                break;
            default: {
                throw new Error("Unhandled event caught in RepelBehavior! Event type: " + event.type);
            }
        }
    }

    public update(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        // Update bounding box as it expands
        if (this.owner.visible){
            this.owner.collisionShape = this.owner.boundary.clone()
        }
    }    
}


