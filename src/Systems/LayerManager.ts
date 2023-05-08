/**
 * Manages Pause, Controls, Help, and Level Transition Layers for Level and MainMenu
 */

import { CustomGameEvents, MenuEvents } from "../CustomGameEvents";
import Level from "../Scenes/Level";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import { TweenableProperties } from "../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../Wolfie2D/Nodes/Graphics/Rect";
import Button from "../Wolfie2D/Nodes/UIElements/Button";
import Label, { HAlign, VAlign } from "../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../Wolfie2D/Scene/Layer";
import UILayer from "../Wolfie2D/Scene/Layers/UILayer";
import Timer from "../Wolfie2D/Timing/Timer";
import Color from "../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../Wolfie2D/Utils/EaseFunctions";
import CheatManager from "./CheatManager";

export const LevelUILayers = {
    PAUSE: "PAUSE",
    CONTROLS: "CONTROLS",
    HELP: "HELP",
    TRANSITION: "TRANSITION",
} as const;

export type LevelUILayer = typeof LevelUILayers[keyof typeof LevelUILayers]

/** Manages the "hidden" UI layers in a Level such as pause menu, controls, help, etc.
 * @author vintydong
 */
export class LayerManager {
    /** The level that will use this LayerManager */
    private scene: Level;

    public static readonly PAUSE_SPRITE_KEY = "PAUSE_MENU";
    public static readonly PAUSE_SPRITE_PATH = "assets/sprites/menus/esc_menu_2.png";
    
    public static readonly CONTROL_SPRITE_KEY = "CONTROL_MENU";
    public static readonly CONTROL_SPRITE_PATH = "assets/sprites/menus/controls.png";

    public static readonly HELP_SPRITE_KEY = "HELP_MENU";
    public static readonly HELP_SPRITE_PATH = "assets/sprites/menus/help.png";

    private pauseLayer: UILayer;
    private controlLayer: UILayer;
    private helpLayer: UILayer;
    private transitionLayer: Layer;

    // Components for the transition layer
    private transitionScreen: Rect;
    private transitionLabel: Label;
    private endLevelTimer: Timer;
    cheatHPButton: Button;
    cheatSkillsButton: Button;
    cheatDamageButton: Button;

    public constructor(scene: Level){
        this.scene = scene;

        this.pauseLayer = scene.addUILayer(LevelUILayers.PAUSE);
        this.controlLayer = scene.addUILayer(LevelUILayers.CONTROLS);
        this.helpLayer = scene.addUILayer(LevelUILayers.HELP);
        this.transitionLayer = scene.addUILayer(LevelUILayers.TRANSITION);

        this.initPauseLayer();
        this.initControlLayer();
        this.initHelplayer();
        this.initTransitionLayer();

        this.pauseLayer.disable();
        this.controlLayer.disable();
        this.helpLayer.disable();
        // this.transitionLayer.disable();
    }

    public isPaused(): boolean {
        return !this.pauseLayer.isHidden();
    }

    public hidePauseMenu(){
        this.pauseLayer.disable();
        this.controlLayer.disable();
        this.helpLayer.disable();
    }

    public showPauseMenu(){
        this.pauseLayer.enable();
        this.controlLayer.disable();
        this.helpLayer.disable();
    }

    public showControlLayer(){
        this.pauseLayer.disable();
        this.controlLayer.enable();
        this.helpLayer.disable();
    }

    public showHelpLayer(){
        this.pauseLayer.disable();
        this.controlLayer.disable();

        this.updateHelpLayer();

        this.helpLayer.enable();
    }

    updateHelpLayer() {
        let cheatManager = CheatManager.getInstance();
        this.cheatHPButton.borderColor = cheatManager.getInfiniteHP() ? Color.BLACK: Color.WHITE;
        this.cheatHPButton.backgroundColor = cheatManager.getInfiniteHP() ? Color.GRAY: Color.TRANSPARENT;
        this.cheatSkillsButton.borderColor = cheatManager.getInfiniteSkills() ? Color.BLACK: Color.WHITE;
        this.cheatSkillsButton.backgroundColor = cheatManager.getInfiniteSkills() ? Color.GRAY: Color.TRANSPARENT;
        this.cheatDamageButton.borderColor = cheatManager.getInfiniteDamage() ? Color.BLACK: Color.WHITE;
        this.cheatDamageButton.backgroundColor = cheatManager.getInfiniteDamage() ? Color.GRAY: Color.TRANSPARENT;
    }

    public togglePauseLayer(){
        // this.pauseLayer.enable();
    }

    private initPauseLayer() {
        //INITIALIZE PAUSE MENU
        let escMenu = this.scene.add.sprite(LayerManager.PAUSE_SPRITE_KEY, LevelUILayers.PAUSE);
        
        // INITIALIZE SPRITE FOR THE PAUSE MENU
        let center = this.scene.getViewport().getCenter();
        escMenu.position.set(center.x, center.y);
        escMenu.scale = new Vec2(4.5, 6.5);
        escMenu.tweens.add('fadeOut', {
            startDelay: 0,
            duration: 750,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.OUT_IN_SINE
                }
            ]
        });

        const escMenuButtonProps = {
            size: new Vec2(100, 50),
            borderWidth: 0,
            borderColor: Color.TRANSPARENT,
            backgroundColor: new Color(255,255,255,0.2),
            textColor: Color.BLACK,
            fontSize: 20,
        };

        const resume = this.scene.factory.addButton(LevelUILayers.PAUSE, new Vec2(center.x, center.y - 120), "Resume", {...escMenuButtonProps, onClickEventId: MenuEvents.RESUME});
        const newGame = this.scene.factory.addButton(LevelUILayers.PAUSE, new Vec2(center.x, center.y - 60), "Restart", {...escMenuButtonProps, onClickEventId: MenuEvents.RESTART});
        const controls = this.scene.factory.addButton(LevelUILayers.PAUSE, new Vec2(center.x, center.y), "Controls", {...escMenuButtonProps, onClickEventId: MenuEvents.CONTROLS});
        const help = this.scene.factory.addButton(LevelUILayers.PAUSE, new Vec2(center.x, center.y + 60), "Help", {...escMenuButtonProps, onClickEventId: MenuEvents.HELP});
        const exit = this.scene.factory.addButton(LevelUILayers.PAUSE, new Vec2(center.x, center.y + 120), "Exit Game", {...escMenuButtonProps, onClickEventId: MenuEvents.EXIT});
    }
    
    private initControlLayer() {
        let controls = this.scene.add.sprite(LayerManager.CONTROL_SPRITE_KEY, LevelUILayers.CONTROLS);

        let center = this.scene.getViewport().getCenter();
        let bottomY = this.scene.getViewport().getHalfSize().clone().y + center.y;

        controls.position.set(center.x, center.y);
        controls.scale = new Vec2(0.71, 0.71);
        controls.tweens.add('fadeOut', {
            startDelay: 0,
            duration: 750,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.OUT_IN_SINE
                }
            ]
        });

        let goBackButton = this.scene.factory.addButton(LevelUILayers.CONTROLS, new Vec2(center.x, bottomY - 50), "Back", {
            size: new Vec2(150, 50),
            borderWidth: 2,
            borderColor: Color.WHITE,
            backgroundColor: Color.WHITE,
            textColor: Color.BLACK,
            fontSize: 14,
            onClickEventId: MenuEvents.PAUSE
        })
    }

    private initHelplayer() {
        let help = this.scene.add.sprite(LayerManager.HELP_SPRITE_KEY, LevelUILayers.HELP);

        let center = this.scene.getViewport().getCenter();
        let bottomY = this.scene.getViewport().getHalfSize().clone().y + center.y;

        help.position.set(center.x, center.y);
        help.scale = new Vec2(0.71, 0.71);
        help.tweens.add('fadeOut', {
            startDelay: 0,
            duration: 750,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.OUT_IN_SINE
                }
            ]
        });

        let goBackButton = this.scene.factory.addButton(LevelUILayers.HELP, new Vec2(center.x, bottomY - 50), "Back", {
            size: new Vec2(150, 50),
            borderWidth: 2,
            borderColor: Color.WHITE,
            backgroundColor: Color.WHITE,
            textColor: Color.BLACK,
            fontSize: 14,
            onClickEventId: MenuEvents.PAUSE
        })

        let cheatManager = CheatManager.getInstance();

        const cheatHealth = this.scene.add.uiElement(UIElementType.BUTTON, LevelUILayers.HELP, {position: new Vec2(center.x - 300, center.y + 200), text: "No Damage"});
        cheatHealth.size.set(200, 50);
        cheatHealth.borderWidth = 2;
        cheatHealth.borderColor = cheatManager.getInfiniteHP() ? Color.BLACK: Color.WHITE;
        cheatHealth.backgroundColor = cheatManager.getInfiniteHP() ? Color.BLACK: Color.TRANSPARENT;
        cheatHealth.onClickEventId = "cheat_hp";
        this.cheatHPButton = cheatHealth as Button;

        const cheatSkills = this.scene.add.uiElement(UIElementType.BUTTON, LevelUILayers.HELP, {position: new Vec2(center.x, center.y + 200), text: "Infinite Skills"});
        cheatSkills.size.set(200, 50);
        cheatSkills.borderWidth = 2;
        cheatSkills.borderColor = cheatManager.getInfiniteSkills() ? Color.BLACK: Color.WHITE;
        cheatSkills.backgroundColor = cheatManager.getInfiniteSkills() ? Color.BLACK: Color.TRANSPARENT;
        // cheatSkills.onClickEventId = "cheat_skills";
        let note = this.scene.add.uiElement(UIElementType.LABEL, LevelUILayers.HELP, {position: new Vec2(center.x, center.y + 250), text: "Note: Activate in main menu"}) as Label;
        note.textColor = Color.RED;
        note.fontSize = 25;
        
        this.cheatSkillsButton = cheatSkills as Button;

        const cheatDamage = this.scene.add.uiElement(UIElementType.BUTTON, LevelUILayers.HELP, {position: new Vec2(center.x + 300, center.y + 200), text: "One-Shot Enemy"});
        cheatDamage.size.set(200, 50);
        cheatDamage.borderWidth = 2;
        cheatDamage.borderColor = cheatManager.getInfiniteDamage() ? Color.BLACK: Color.WHITE;
        cheatDamage.backgroundColor = cheatManager.getInfiniteDamage() ? Color.BLACK: Color.TRANSPARENT;
        cheatDamage.onClickEventId = "cheat_damage";
        this.cheatDamageButton = cheatDamage as Button;
    }

    private initTransitionLayer() {
        // throw new Error("Method not implemented.");
        let viewport = this.scene.getViewport();
        let viewportCenter = viewport.getCenter();
        let viewportSize = viewport.getHalfSize().clone().scale(2,2);

        this.transitionScreen = this.scene.factory.addGraphic(GraphicType.RECT, LevelUILayers.TRANSITION, viewportCenter.clone(), viewportSize) as Rect;
        this.transitionScreen.color = Color.BLACK;
        this.transitionScreen.alpha = 1;
        this.transitionScreen.scale = new Vec2(1,1);
        
        this.transitionScreen.tweens.add("fadeIn", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 0,
                    end: 1,
                    ease: EaseFunctionType.IN_OUT_QUAD
                },
            ],
            onEnd: CustomGameEvents.LEVEL_NEXT
        });

        this.transitionScreen.tweens.add("fadeOut", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_SINE
                },{
                    property: TweenableProperties.scaleX,
                    start: 1, 
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD,
                },{
                    property: TweenableProperties.scaleY,
                    start: 1, 
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD,
                }
            ],
            onEnd: CustomGameEvents.LEVEL_START
        });

        let viewportTopRight = viewportCenter.clone();
        viewportTopRight.x = viewportTopRight.x + viewportSize.x/2;
        viewportTopRight.y = viewportTopRight.y - viewportSize.y/2;

        this.transitionLabel = this.scene.factory.addLabel(LevelUILayers.TRANSITION, viewportTopRight, "Level Complete")
        this.transitionLabel.size = new Vec2(250, 75);
        this.transitionLabel.setHAlign(HAlign.CENTER);
        this.transitionLabel.setVAlign(VAlign.BOTTOM);
        this.transitionLabel.backgroundColor = new Color(100, 100, 100);
        this.transitionLabel.textColor = Color.WHITE;
        this.transitionLabel.tweens.add("slideIn", {
            startDelay: 0,
            duration: 1500,
            effects: [
                {
                    property: TweenableProperties.posX,
                    start: viewportTopRight.x + 250,
                    end: viewportTopRight.x - 250,
                    ease: EaseFunctionType.OUT_SINE
                }
            ],
            reverseOnComplete: true,
        })
        this.transitionLabel.visible = false;

        this.endLevelTimer = new Timer(3000, () => { this.transitionScreen.tweens.play("fadeIn"); })
    }

    public startLevel(){
        // this.transitionLabel.visible = false;
        this.transitionScreen.tweens.play("fadeOut");
    }

    public endLevel(){
        if(!this.endLevelTimer.hasRun() && this.endLevelTimer.isStopped()){
            console.log("Starting end level timer");
            this.transitionScreen.scale.x = 1;
            this.transitionScreen.scale.y = 1;
            this.transitionLabel.visible = true;
            this.transitionLabel.tweens.play('slideIn')
            this.endLevelTimer.start();
        }
    }

    // /** Sets transition background active if state == true else disables it */
    // public setTransitionLayer(state: boolean) {
    //     state ? this.transitionLayer.enable() : this.transitionLayer.disable();
    // }
    
    // /** Plays fadeIn animation if state == true else fadeOut animation */
    // public playTransition(state: boolean) {
    //     let tweens = this.transitionScreen.tweens;
    //     state ? tweens.play('fadeIn') : tweens.play('fadeOut');
    // }
}