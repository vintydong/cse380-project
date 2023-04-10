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

export default class Help extends Scene{
    private helpMenu: Layer;

    private help: Sprite;
    
    public loadScene(): void {
        /** Images/Sprites */
        this.load.image("help", "assets/sprites/help.png");
    }

    public startScene(): void {
        const center = this.viewport.getCenter();

        this.helpMenu = this.addUILayer("helpMenu");
        this.help = this.add.sprite("help", "helpMenu");
        this.help.position.set(center.x, center.y);
        this.help.scale = new Vec2(0.71, 0.71);
        this.help.tweens.add('fadeOut', {
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

        const goBack = this.add.uiElement(UIElementType.BUTTON, "helpMenu", {position: new Vec2(center.x, center.y + 200), text: "Go Back"});
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