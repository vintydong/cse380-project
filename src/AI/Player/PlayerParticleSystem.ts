import Particle from "../../Wolfie2D/Nodes/Graphics/Particle";
import ParticleSystem from "../../Wolfie2D/Rendering/Animations/ParticleSystem";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import RandUtils from "../../Wolfie2D/Utils/RandUtils";

export default class PlayerParticleSystem extends ParticleSystem {
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
        particle.vel = RandUtils.randVec(100, 200, -32, 32);
        particle.vel.y = Math.cos(0) * 700;
        particle.color = new Color(75, 0, 130);

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

    update(deltaT: number) {
        // Exit if the system isn't currently running
        if (!this.systemRunning) {
            return;
        }
        // Stop the system if our timer is up
        if (this.systemLifetime.isStopped()) {
            this.stopSystem();
        }
        else {
            for (let i = 0; i < this.particlesToRender; i++) {
                let particle = this.particlePool[i];

                
                // If a particle is in use, decrease it's age and update it's velocity, if it has one
                if (particle.inUse) {
                    particle.decrementAge(deltaT * 1000);

                    if (particle.age <= 0) {
                        particle.setParticleInactive();
                    }

                    particle.vel.y = Math.cos(50 * (this.lifetime - particle.age)) * 700;
                    
                    let dy = particle.position.y - this.sourcePoint.y;
                    // if(dy > 5){
                    //     // particle.position.y = this.sourcePoint.y + 5
                    //     particle.vel.y = -particle.vel.y;
                    // }
                    // else if(dy < -5){
                    //     // particle.position.y = this.sourcePoint.y - 5;
                    //     particle.vel.y = -particle.vel.y;
                    // }
                    

                    console.log(particle.id , particle.vel.x,  particle.vel.y);
                    particle.move(particle.vel.scaled(deltaT));
                }
                else {
                    // Set the particle to active
                    particle.setParticleActive(this.lifetime, this.sourcePoint.clone());

                    // Update particle color, mass, and alpha
                    particle.color = this.color;
                    particle.alpha = 1;
                    particle.mass = this.particleMass;
                    
                    // Give particle tween animations
                    this.setParticleAnimation(particle);

                    particle.tweens.play("active");
                }
            }
            // Update the amount of particles that can be rendered based on the particles per frame, clamping if we go over the total number
            // of particles in our pool
            this.particlesToRender = MathUtils.clamp(this.particlesToRender+this.particlesPerFrame, 0, this.particlePool.length);
        }
    }

}