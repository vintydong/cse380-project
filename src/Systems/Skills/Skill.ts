import Level from "../../Scenes/Level";
import Scene from "../../Wolfie2D/Scene/Scene";
import Timer from "../../Wolfie2D/Timing/Timer";
import { SkillManager } from "../SkillManager";

/** 
 * Abstract class representing a skill along with its upgrades and effects
 * @author vintydong
 */
export default abstract class Skill {
    protected skill_manager: SkillManager;

    private damage: number;
    private cost: number;
    private cooldown: Timer;

    public constructor(skill_manager: SkillManager){
        this.skill_manager = skill_manager;
    }

    /** Initialize necessary components of a skill */
    public abstract initialize();
    
    /** Defines what should happen when the skill button is pressed including spawning any projectiles/hitboxes */
    public abstract activate(options?: Record<string, any>): void

}