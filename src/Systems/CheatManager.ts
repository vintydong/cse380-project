export default class CheatManager {
    private static instance: CheatManager;

    private infiniteHP: boolean = false;
    private infiniteSkills: boolean = false;
    private infiniteDamage: boolean = false;
    private unlockAllLevels: boolean = false;

    /**
     * Singleton
     * 
     * Returns the current instance of this class or a new instance if none exist
     * @returns CheatManager
     */
    public static getInstance(): CheatManager {
        if (!this.instance) {
            this.instance = new CheatManager();
        }

        return this.instance;
    }

    /**
     * Sets the cheat code for infinite HP
     * @param active true to set this cheat code active, false inactive
     */
    public setInfiniteHP(active: boolean): void { this.infiniteHP = active }

    public getInfiniteHP(): boolean { return this.infiniteHP }

    public toggleInfiniteHP(): void { this.infiniteHP = !this.infiniteHP }

    /**
     * Sets the cheat code for infinite HP
     * @param active true to set this cheat code active, false inactive
     */
    public setInfiniteSkills(active: boolean): void { this.infiniteSkills = active }

    public getInfiniteSkills(): boolean { return this.infiniteSkills }

    public toggleInfiniteSkills(): void { this.infiniteSkills = !this.infiniteSkills }


    /**
         * Sets the cheat code for infinite HP
         * @param active true to set this cheat code active, false inactive
         */
    public setInfiniteDamage(active: boolean): void { this.infiniteDamage = active }

    public getInfiniteDamage(): boolean { return this.infiniteDamage }

    public toggleInfiniteDamage(): void { this.infiniteDamage = !this.infiniteDamage }

    /**
     * Sets the cheat code for infinite HP
     * @param active true to set this cheat code active, false inactive
     */
    public setUnlockAllLevels(active: boolean): void { this.unlockAllLevels = active }

    public getUnlockAllLevels(): boolean { return this.unlockAllLevels }

    public toggleUnlockAllLevels(): void { this.unlockAllLevels = !this.unlockAllLevels }

}