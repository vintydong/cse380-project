import { BasicEnemyController } from "../../AI/BasicEnemyController";
import Level, { LevelLayer } from "../../Scenes/Level";
import Updateable from "../../Wolfie2D/DataTypes/Interfaces/Updateable";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import Color from "../../Wolfie2D/Utils/Color";
import { LevelUILayer } from "../LayerManager";

/**
 * A UI component representing the boss's HP
 * @author vintydong
 */
export default class BossHUD implements Updateable {
    private scene: Level;
    private layer: string;

    private owner: BasicEnemyController;

    /** The actual healthbar (the part with color) */
    protected healthBar: Label;
    /** The healthbars background (the part with the border) */
    protected healthBarBg: Label;

    public constructor(scene: Level, owner: BasicEnemyController, layer: LevelLayer){
        this.scene = scene;
        this.owner = owner;
        console.log("BOSS HP:", owner);
        this.layer = layer;

        let viewportWidth = scene.getViewport().getHalfSize().x * 2;
        let viewportCenter = scene.getViewport().getCenter();

        let hpSize = new Vec2(viewportWidth - 10, 10);

        let topViewport = new Vec2(viewportWidth/2, 10);

        this.healthBar = this.scene.factory.addLabel(layer, topViewport.clone(), "");
        this.healthBar.size = hpSize.clone();
        this.healthBar.backgroundColor = Color.RED;

        this.healthBarBg = this.scene.factory.addLabel(layer, topViewport.clone(), "");
        this.healthBarBg.size = hpSize.clone();
        this.healthBarBg.backgroundColor = Color.TRANSPARENT;
        this.healthBarBg.borderColor = Color.BLACK;
        this.healthBarBg.borderWidth = 1;
    }

    public update(deltaT: number): void {
        let unit = this.healthBarBg.size.x / this.owner.maxHealth;

        // console.log(this.healthBar.size.x, this.healthBarBg.size.x - unit * (this.owner.maxHealth - this.owner.health));
        // console.log(this.healthBar.position.x, this.healthBar.position.y);

        if(this.owner.health <= 0) {
            this.healthBar.size.set(0, this.healthBarBg.size.y);
            return;
        }

		this.healthBar.size.set(this.healthBarBg.size.x - unit * (this.owner.maxHealth - this.owner.health), this.healthBarBg.size.y);
		this.healthBar.position.set(this.healthBarBg.position.x - (unit / 2) * (this.owner.maxHealth - this.owner.health), this.healthBarBg.position.y);
		this.healthBar.backgroundColor = Color.RED;
    }
}