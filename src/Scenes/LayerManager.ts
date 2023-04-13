/**
 * Manages Pause, Controls, Help, and Level Transition Layers for Level and MainMenu
 */

import { MenuEvents } from "../CustomGameEvents";
import CustomFactoryManager from "../Factory/CustomFactoryManager";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import { TweenableProperties } from "../Wolfie2D/Nodes/GameNode";
import Layer from "../Wolfie2D/Scene/Layer"
import UILayer from "../Wolfie2D/Scene/Layers/UILayer";
import Scene from "../Wolfie2D/Scene/Scene";
import Color from "../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../Wolfie2D/Utils/EaseFunctions";
import Level from "./Level";

export const LevelUILayers = {
    PAUSE: "PAUSE",
    CONTROLS: "CONTROLS",
    HELP: "HELP",
    TRANSITION: "TRANSITION",
} as const;

export type LevelUILayer = typeof LevelUILayers[keyof typeof LevelUILayers]

/** Manages the "hidden" UI layers in a Level such as pause menu, controls, help, etc. */
export class LayerManager {
    /** The level that will use this LayerManager */
    private scene: Level;

    public static readonly PAUSE_SPRITE_KEY = "PAUSE_MENU";
    public static readonly PAUSE_SPRITE_PATH = "assets/sprites/menus/escMenu.png/";

    private pauseLayer: UILayer;
    private controlLayer: UILayer;
    private helpLayer: UILayer;
    private transitionLayer: Layer;

    public constructor(scene: Level){
        this.scene = scene;

        this.pauseLayer = scene.addUILayer(LevelUILayers.PAUSE);
        this.controlLayer = scene.addUILayer(LevelUILayers.CONTROLS);
        this.helpLayer = scene.addUILayer(LevelUILayers.HELP);
        this.transitionLayer = scene.addUILayer(LevelUILayers.TRANSITION);

        this.initPauseLayer();

        this.disablePauseLayer();
        this.disableControlLayer();
        this.disableHelpLayer();
        // this.initControlLayer();
        // this.initHelplayer();
        // this.initTransitionLayer();
    }

    public isPaused(): boolean {
        return true;
    }

    public togglePauseLayer(){
        // this.pauseLayer.enable();
    }

    public enablePauseLayer(){
        this.pauseLayer.enable();
    }

    public enableControlLayer(){
        this.pauseLayer.enable();
    }

    public enableHelpLayer(){
        this.pauseLayer.enable();
    }

    public disablePauseLayer(){
        this.pauseLayer.disable();
    }

    public disableControlLayer(){
        this.pauseLayer.disable();
    }

    public disableHelpLayer(){
        this.pauseLayer.disable();
    }

    private initPauseLayer() {
        //INITIALIZE PAUSE MENU
        let escMenu = this.scene.add.sprite(LayerManager.PAUSE_SPRITE_KEY, LevelUILayers.PAUSE);
        
        // INITIALIZE SPRITE FOR THE PAUSE MENU
        let center = this.scene.getViewport().getCenter();
        escMenu.position.set(center.x, center.y);
        escMenu.scale = new Vec2(0.71, 0.71);
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

        this.pauseLayer.disable();

        const escMenuButtonProps = {
            size: new Vec2(150, 50),
            borderWidth: 2,
            borderColor: Color.WHITE,
            backgroundColor: Color.WHITE,
            textColor: Color.BLACK,
            fontSize: 14,
        };

        const resume = this.scene.factory.addButton(LevelUILayers.PAUSE, new Vec2(center.x, center.y), "Resume", {...escMenuButtonProps, onClickEventId: MenuEvents.RESUME});
        const newGame = this.scene.factory.addButton(LevelUILayers.PAUSE, new Vec2(center.x, center.y), "Restart", {...escMenuButtonProps, onClickEventId: MenuEvents.RESTART});
        const controls = this.scene.factory.addButton(LevelUILayers.PAUSE, new Vec2(center.x, center.y), "Controls", {...escMenuButtonProps, onClickEventId: MenuEvents.CONTROLS});
        const help = this.scene.factory.addButton(LevelUILayers.PAUSE, new Vec2(center.x, center.y), "Help", {...escMenuButtonProps, onClickEventId: MenuEvents.HELP});
        const exit = this.scene.factory.addButton(LevelUILayers.PAUSE, new Vec2(center.x, center.y), "Exit Game", {...escMenuButtonProps, onClickEventId: MenuEvents.EXIT});
    }
    
    private initControlLayer() {
        throw new Error("Method not implemented.");
    }
    private initHelplayer() {
        throw new Error("Method not implemented.");
    }
    private initTransitionLayer() {
        throw new Error("Method not implemented.");
    }

}