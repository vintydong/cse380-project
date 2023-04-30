import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Particle from "../../Wolfie2D/Nodes/Graphics/Particle";
import ParticleSystem from "../../Wolfie2D/Rendering/Animations/ParticleSystem";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import RandUtils from "../../Wolfie2D/Utils/RandUtils";

export default class PlayerParticleSystem extends ParticleSystem {
    private xAccel = 600;
    private speed = 300;
    private MAX_SPEED = 1400;

    public getPool(): Array<Particle> {
        return this.particlePool;
    }

    /**
     * @returns true if the particle system is running; false otherwise.
     */
    public isSystemRunning(): boolean { return this.systemRunning; }

    /**
     * Sets the animations for a particle in the player's weapon
     * @param particle the particle to give the animation to
     */
    public setParticleAnimation(particle: Particle) {
        // Give the particle a random velocity.
        // particle.vel = RandUtils.randVec(300, 300, 1, 1);
        particle.vel = new Vec2(300, 0);
        particle.color = Color.MAGENTA;

        // Give the particle tweens
        particle.tweens.add("active", {
            startDelay: 0,
            duration: this.lifetime,
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

    public update(deltaT: number): void {
        // Accelerate the particle
        for (let i = 0; i < this.particlesToRender; i++) {
            let particle = this.particlePool[i];
            if (particle.inUse) {
                particle.vel.x = particle.vel.x + this.xAccel * deltaT;
                particle.vel.x = MathUtils.clamp(particle.vel.x, 300, 1400)
            }
        }
        super.update(deltaT);
    }

}