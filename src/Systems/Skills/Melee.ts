import BasicAttack from "../../AI/BasicAttackBehavior";
import { CustomGameEvents } from "../../CustomGameEvents";
import { PhysicsGroups } from "../../Physics";
import { LevelLayers } from "../../Scenes/Level";
import BasicAttackShaderType from "../../Shaders/BasicAttackShaderType";
import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Circle from "../../Wolfie2D/DataTypes/Shapes/Circle";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import { SkillManager } from "../SkillManager";
import Skill from "./Skill";

/**
 * A class that represents a melee attack that can be used by the player
 * @author vintydong
 */
export default class Melee extends Skill {
    private hitbox: Graphic;

    public constructor(skill_manager: SkillManager) {
        super(skill_manager);

        this.initialize();
    }

    public initialize(){
        let scene = this.skill_manager.getScene();
        
        this.hitbox = scene.add.graphic(GraphicType.RECT, LevelLayers.PRIMARY, { position: new Vec2(0, 0), size: new Vec2(75, 100) });

        this.hitbox.useCustomShader(BasicAttackShaderType.KEY);
        this.hitbox.visible = false;
        this.hitbox.color = Color.BLUE;

        this.hitbox.addAI(MeleeBehavior);

        let collider = new Circle(Vec2.ZERO, 25);
        this.hitbox.setCollisionShape(collider);
        this.hitbox.addPhysics();
        this.hitbox.setGroup(PhysicsGroups.WEAPON);
        this.hitbox.setTrigger(PhysicsGroups.NPC, CustomGameEvents.ENEMY_HIT, null);

        // Add tween to particle
        this.hitbox.tweens.add("fadeout", {
            startDelay: 0,
            duration: 200,
            effects: [
                {
                    property: "alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_SINE
                }
            ]
        });
    }

    public activate(options?: Record<string, any>) {
        const { direction } = options;
        // Bring this basic attack to life
        this.hitbox.visible = true;
        this.hitbox.alpha = 1;

        // Calculate basic attack offset from player center
        let newPosition = this.skill_manager.getPlayer().position.clone();
        let xOffset = this.hitbox.boundary.getHalfSize().x
        newPosition.x += (direction == "left") ? -1 * xOffset : xOffset;
        this.hitbox.position = newPosition;

        this.hitbox.setAIActive(true, {direction: direction});
        this.hitbox.tweens.play("fadeout");
    }
}

/**
 * A class that represents the behavior of the melee attack in the HW2Scene
 * @author HenryLam
 */
export class MeleeBehavior implements AI {
    // The GameNode that owns this behavior
    private owner: Graphic;
    private receiver: Receiver;

    // The direction to fire the bubble
    private direction: string;

    public initializeAI(owner: Graphic, options: Record<string, any>): void {
        this.owner = owner;

        this.receiver = new Receiver();
        this.receiver.subscribe(CustomGameEvents.ENEMY_HIT);

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
            case CustomGameEvents.ENEMY_HIT:
                // console.log(event.data);
                let id = event.data.get('other');
                if(id === this.owner.id){
                    this.owner.position.copy(Vec2.ZERO);
                    this.owner._velocity.copy(Vec2.ZERO);
                    this.owner.visible = false;
                }
                break;
            default: {
                throw new Error("Unhandled event caught in MeleeBehavior! Event type: " + event.type);
            }
        }
    }

    public update(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
    }    
}


