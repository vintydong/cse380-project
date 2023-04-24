import BasicAttack from "../../AI/BasicAttackBehavior";
import ParticleBehavior from "../../AI/ParticleBehavior";
import PlayerParticleSystem from "../../AI/Player/PlayerParticleSystem";
import { CustomGameEvents } from "../../CustomGameEvents";
import { PhysicsGroups } from "../../Physics";
import { LevelLayers } from "../../Scenes/Level";
import BasicAttackShaderType from "../../Shaders/BasicAttackShaderType";
import ParticleShaderType from "../../Shaders/ParticleShaderType";
import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Circle from "../../Wolfie2D/DataTypes/Shapes/Circle";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Particle from "../../Wolfie2D/Nodes/Graphics/Particle";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { SkillManager } from "../SkillManager";
import Skill from "./Skill";

/**
 * A class that represents a melee attack that can be used by the player
 * @author vintydong
 */
export default class Slash extends Skill {
    private weaponParticles: PlayerParticleSystem;

    public constructor(skill_manager: SkillManager) {
        super(skill_manager);

        this.initialize();
    }

    public initialize() {
        let scene = this.skill_manager.getScene();
        // Init particle system of 50 particles
        const particle_size = 5;
        this.weaponParticles = new PlayerParticleSystem(50, Vec2.ZERO, 2000, particle_size, 0, 50);
        this.weaponParticles.initializePool(scene, LevelLayers.PRIMARY);

        let pool = this.weaponParticles.getPool();

        for (let i = 0; i < this.weaponParticles.getPool().length; i++) {
            pool[i].useCustomShader(ParticleShaderType.KEY);
            pool[i].visible = false;
            pool[i].color = Color.BLUE;

            // Give the particles AI
            pool[i].addAI(SlashBehavior);

            // Give the particles a collider
            let collider = new Circle(Vec2.ZERO, particle_size*particle_size);
            pool[i].setCollisionShape(collider);
            pool[i].addPhysics();
            pool[i].setGroup(PhysicsGroups.WEAPON);
            pool[i].setTrigger(PhysicsGroups.NPC, CustomGameEvents.ENEMY_HIT, null);
        }
    }

    public activate(options?: Record<string, any>) {
        const { direction } = options;
       // Find the first visible particle
       // this.weaponParticles.startSystem(2000, 0, this.skill_manager.getPlayer().position.clone());
       let particle: Particle = this.weaponParticles.getPool().find((bubble: Particle) => { return !bubble.visible });
       if (particle) {
           // Bring this bubble to life
           particle.visible = true;
           particle.position = this.skill_manager.getPlayer().position.clone();
           particle.setAIActive(true, { direction: direction });
       }
    }
}

/**
 * A class that represents the behavior of the ranged attack
 */
export class SlashBehavior implements AI {
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
        this.receiver.subscribe(CustomGameEvents.ENEMY_HIT);

        this.currentXSpeed = 50;
        this.xSpeedIncrement = 20;
        this.minXSpeed = 75;
        this.maxXSpeed = 150;

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
        switch (event.type) {
            case CustomGameEvents.ENEMY_HIT:
                let id = event.data.get('other');
                if (id === this.owner.id) {
                    this.owner.position.copy(Vec2.ZERO);
                    this.owner._velocity.copy(Vec2.ZERO);
                    this.owner.visible = false;
                }
                break;
            default: {
                throw new Error("Unhandled event caught in SlashBehavior! Event type: " + event.type);
            }
        }
    }

    public update(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
        // Only update the particle if it's visible
        if (this.owner.visible) {
            // Increment the speeds
            this.currentXSpeed += this.xSpeedIncrement * deltaT;

            // Clamp the speeds if need be
            this.currentXSpeed = MathUtils.clamp(this.currentXSpeed, this.minXSpeed, this.maxXSpeed)

            // Update position of the particle - Scale up and move left
            let value = (this.direction == "left") ? Vec2.LEFT.scale(this.currentXSpeed * deltaT) : Vec2.RIGHT.scale(this.currentXSpeed * deltaT);
            this.owner.position.add(value);
        }
    }
}