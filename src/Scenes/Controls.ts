import CustomFactoryManager from "../Factory/CustomFactoryManager";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import { TweenableProperties } from "../Wolfie2D/Nodes/GameNode";
import Sprite from "../Wolfie2D/Nodes/Sprites/Sprite";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../Wolfie2D/Scene/Layer";
import Scene from "../Wolfie2D/Scene/Scene";
import Color from "../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../Wolfie2D/Utils/EaseFunctions";
import MainMenu from "./MainMenu";

export default class Controls extends Scene{
    private controlMenu: Layer;

    private controls: Sprite;
    
    public loadScene(): void {
        /** Images/Sprites */
        this.load.image("controls", "assets/sprites/controls.png");
    }

    public startScene(): void {
        const center = this.viewport.getCenter();

        this.controlMenu = this.addUILayer("controlMenu");
        this.controls = this.add.sprite("controls", "controlMenu");
        this.controls.position.set(center.x, center.y);
        this.controls.scale = new Vec2(0.71, 0.71);
        this.controls.tweens.add('fadeOut', {
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

        const goBack = this.add.uiElement(UIElementType.BUTTON, "controlMenu", {position: new Vec2(center.x, center.y + 200), text: "Go Back"});
        goBack.size.set(200, 50);
        goBack.borderWidth = 2;
        goBack.borderColor = Color.WHITE;
        goBack.backgroundColor = Color.TRANSPARENT;
        goBack.onClickEventId = "goBack";

        this.receiver.subscribe("goBack");
    }

    public updateScene(){
        while(this.receiver.hasNextEvent()){
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    public handleEvent(event: GameEvent): void {
        switch(event.type) {
            //Click to go to main menu
            case "goBack":
                this.sceneManager.changeToScene(MainMenu);
                break;

            default:
                throw new Error(`Event handler not implemented for event type ${event.type}`)
        }
    }
}