import Level from "../../Scenes/Level";
import Scene from "../../Wolfie2D/Scene/Scene";
import Timer from "../../Wolfie2D/Timing/Timer";
import { SkillManager } from "../SkillManager";

export interface SkillAttributes {
    level: number,
    damage: number,
    cooldown: number,
    cost: number,
    description: string,
}

/** 
 * Abstract class representing a skill along with its upgrades and effects
 * @author vintydong
 */
export default abstract class Skill {
    protected skill_manager: SkillManager;

    public spriteKey: string;

    protected level: number;
    protected damage: number[];
    protected cooldown: Timer[];
    protected cost: number[];
    protected description: string[];

    public constructor(skill_manager: SkillManager, damage, cooldown, cost, description, spriteKey){
        this.skill_manager = skill_manager;

        this.level = 0;
        this.damage = damage;
        this.cooldown = cooldown;
        this.cost = cost;
        this.description = description;
        this.spriteKey = spriteKey;
        // this.initialize();
    }

    /** Initialize necessary components of a skill */
    public abstract initialize();
    
    /** Defines what should happen when the skill button is pressed including spawning any projectiles/hitboxes */
    public abstract activate(options?: Record<string, any>): void

    /** Returns the cooldown of this Skill
     * 
     * true if the skill can now be activated; false otherwise
     */
    public getCooldown(): boolean { return this.cooldown[this.level].isStopped() }

    public getAttributes(): SkillAttributes {
        let level = this.level;
        let cd = this.cooldown[level] || this.cooldown[0];

        return {
            level: level + 1,
            damage: this.damage[level] || this.damage[0],
            cooldown: cd.length(),
            cost: this.cost[level] || this.cost[0],
            description: this.description[level] || this.description[0],
        }
    }

    /**
     * Updates the level of this skill if possible
     * @returns true on success, false on failure
     * @param level The amount to change the level of this skill by (usually -1 or +1)
     */
    public changeLevel(level: number): boolean {
        let final = this.level + 1 + level;
        if(final < 1 || final > 3)
            return false;

        this.level = final - 1;
        return true;
    }

}