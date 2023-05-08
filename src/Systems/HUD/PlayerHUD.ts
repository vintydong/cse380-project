import PlayerController from "../../AI/Player/PlayerController";
import Level, { LevelLayer, LevelLayers } from "../../Scenes/Level";
import Updateable from "../../Wolfie2D/DataTypes/Interfaces/Updateable";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import Color from "../../Wolfie2D/Utils/Color";

/**
 * A UI component representing the player's hp, resource, etc.
 * @author vintydong
 */
export default class PlayerHUD implements Updateable {
    private static readonly SPRITE_POS = new Vec2(0, 3000);
    private static readonly abilityBarCenter = new Vec2(150, 735);
    private static readonly abilityBarSize = new Vec2(300, 50);

    private static readonly abilityBarPadding = 15;
    private static readonly abilitySquareSize = 40;
    private static readonly abilityBarStart = new Vec2(PlayerHUD.abilityBarCenter.x - PlayerHUD.abilityBarSize.x / 2, PlayerHUD.abilityBarCenter.y - PlayerHUD.abilityBarSize.y / 2);

    private scene: Level;
    private layer: LevelLayer;

    private owner: PlayerController;

    /** The actual healthbar (the part with color) */
    protected healthBar: Label;
    /** The healthbars background (the part with the border) */
    protected healthBarBg: Label;

    protected abilityHUD: [Sprite, Sprite, Sprite, Sprite];
    protected abilityIcons: {[key: string]: Sprite};

    public constructor(scene: Level, owner: PlayerController, layer: LevelLayer){
        this.scene = scene;
        this.owner = owner;
        this.layer = layer;

        this.abilityIcons = {};

        this.initPlayerHealth();
        this.initPlayerAbility();
    }

    private initPlayerHealth() {
        let hpSize = new Vec2(200, 25);

        this.healthBar = this.scene.factory.addLabel(LevelLayers.UI, new Vec2(125, 60), "");
        this.healthBar.size = hpSize.clone();
        this.healthBar.backgroundColor = Color.GREEN;

        // HealthBar Border
        this.healthBarBg = this.scene.factory.addLabel(LevelLayers.UI, new Vec2(125, 60), "");
        this.healthBarBg.size = hpSize.clone();
        this.healthBarBg.borderWidth = 1;
        this.healthBarBg.borderColor = Color.BLACK;
        this.healthBarBg.backgroundColor = Color.TRANSPARENT;

        // Resource Bar
        // this.resourceBar = this.factory.addLabel(LevelLayers.UI, new Vec2(125, 105), "");
        // this.resourceBar.size = new Vec2(200, 25);
        // this.resourceBar.backgroundColor = Color.BLACK;
        // this.resourceBar.borderColor = Color.MAGENTA;
    }

    private initPlayerAbility() {
        // Ability Bar
        let abilityBar = this.scene.factory.addLabel(LevelLayers.UI, PlayerHUD.abilityBarCenter, "");
        abilityBar.size = PlayerHUD.abilityBarSize;
        abilityBar.backgroundColor = Color.TRANSPARENT;
        // abilityBar.borderColor = Color.MAGENTA

        // const abilityLabel = ['', 'U', 'I', 'O', 'P'];
        this.updateHUD();
    }

    /** Called when the abilities in the HUD need to be updated */
    public updateHUD() {
        // First move all skill sprites off screen
        for(let key in this.abilityIcons){
            let sprite = this.abilityIcons[key];
            sprite.position = PlayerHUD.SPRITE_POS;
        }

        let skill_manager = this.scene.getSkillManager();
        let activeSkills = skill_manager.getActiveSkills();

        for (let i = 0; i < 4; i++) {
            let skill = activeSkills[i];
            let squarePos = new Vec2(PlayerHUD.abilityBarStart.x + PlayerHUD.abilitySquareSize * (i+1) + PlayerHUD.abilityBarPadding * i, PlayerHUD.abilityBarCenter.y)
            let square = this.scene.factory.addLabel(LevelLayers.UI, squarePos, '')
            square.size = new Vec2(PlayerHUD.abilitySquareSize, PlayerHUD.abilitySquareSize);
            // square.backgroundColor = new Color(115, 115, 115);
            square.borderColor = Color.BLACK;

            if(!skill) continue;

            let ability = null;
            if(this.abilityIcons[skill.iconKey]){
                ability = this.abilityIcons[skill.iconKey];
                ability.position = squarePos;
            } else {
                ability = this.scene.factory.addSprite(skill.iconKey, LevelLayers.UI);
                ability.position = squarePos;
                ability.size = new Vec2(16, 16);
                ability.scale = new Vec2(2.5, 2.5);

                this.abilityIcons[skill.iconKey] = ability;
            }
        }
    }

    public update(deltaT: number): void {
        let unit = this.healthBarBg.size.x / this.owner.maxHealth;

        // console.log(this.healthBar.size.x, this.healthBarBg.size.x - unit * (this.owner.maxHealth - this.owner.health));
        // console.log(this.healthBar.position.x, this.healthBar.position.y);

        if(this.owner.health <= 0) {
            this.healthBar.size.set(0, this.healthBarBg.size.y);
            return;
        }

        let currentHealth = this.owner.health;
        let maxHealth = this.owner.maxHealth;

		this.healthBar.size.set(this.healthBarBg.size.x - unit * (this.owner.maxHealth - this.owner.health), this.healthBarBg.size.y);
		this.healthBar.position.set(this.healthBarBg.position.x - (unit / 2) * (this.owner.maxHealth - this.owner.health), this.healthBarBg.position.y);
		// this.healthBar.backgroundColor = Color.RED;
        this.healthBar.backgroundColor = currentHealth < maxHealth * 1 / 4 ? Color.RED : currentHealth < maxHealth * 3 / 4 ? Color.YELLOW : Color.GREEN;

        // Update ability bar with CDs
        let skill_manager = this.scene.getSkillManager();
        let activeSkills = skill_manager.getActiveSkills();
        for (let skill of activeSkills){
            if(!skill) continue;

            let abilityIcon = this.abilityIcons[skill.iconKey];
            if(!abilityIcon) continue;
            let cd = skill.getCooldownTime();
            if(cd > 0){
                abilityIcon.alpha = 0.2;
            } else {
                abilityIcon.alpha = 1;
            }
        }
    }
}