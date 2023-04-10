export const PhysicsGroups = {
    PLAYER: "PLAYER",
    WEAPON: "WEAPON",
    GROUND: "GROUND",
    DESTRUCTIBLE: "DESTRUCTIBLE",
} as const;

export type PhysicOptions = {
    // The names of the collision groups to add to the physics manager for this scene
    groupNames: string[];
    // The collision map for the different collision groups
    collisions: number[][];
}

/**
 * Collision map between Physics groups
 *              Ground  Player  Weapon  Destructible
 * Ground       0       1       1       0   
 * Player       1       0       0       1
 * Weapon       1       0       0       1
 * Destructible 0       1       1       0
 */
export const PhysicsCollisionMap: PhysicOptions = {
        groupNames: [
            PhysicsGroups.GROUND, 
            PhysicsGroups.PLAYER, 
            PhysicsGroups.WEAPON, 
            PhysicsGroups.DESTRUCTIBLE
        ],
        collisions:
        [
            [0, 1, 1, 0],
            [1, 0, 0, 1],
            [1, 0, 0, 1],
            [0, 1, 1, 0],
        ]
}