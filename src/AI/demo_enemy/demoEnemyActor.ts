import Level from "../../Scenes/Level";
import Spritesheet from "../../Wolfie2D/DataTypes/Spritesheet";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";

export default class demoEnemyActor extends AnimatedSprite {
    protected scene: Level

    // Key for the navmesh to use to build paths
    protected _navkey: string;

    public override setScene(scene: Level): void { this.scene = scene; }
    public override getScene(): Level { return this.scene; }

    public get navkey(): string { return this._navkey; }
    public set navkey(navkey: string) { this._navkey = navkey; }
}