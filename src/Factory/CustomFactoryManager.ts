import Level, { LevelLayer } from "../Scenes/Level";
import Vec2 from "../Wolfie2D/DataTypes/Vec2";
import Graphic from "../Wolfie2D/Nodes/Graphic";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Sprite from "../Wolfie2D/Nodes/Sprites/Sprite";
import Tilemap from "../Wolfie2D/Nodes/Tilemap";
import UIElement from "../Wolfie2D/Nodes/UIElement";
import { UIElementType } from "../Wolfie2D/Nodes/UIElements/UIElementTypes";
import FactoryManager from "../Wolfie2D/Scene/Factories/FactoryManager";

export default class CustomFactoryManager extends FactoryManager {
    public constructor(scene: Level, tilemaps: Tilemap[]){
        super(scene, tilemaps);
    }

    // Probably don't need this
    // public addAnimatedSprite(key: string, layer: LevelLayer): AnimatedSprite {
    //     return null;
    // }

    public addButton(layer: LevelLayer, position: Vec2, text?: string){
        return super.uiElement(UIElementType.BUTTON, layer, {position, text})
    }

    // public addUIElement(type: string, layer: LevelLayer, options?: Record<string, any>): UIElement{
    //     return super.uiElement(type, layer, options);
    // }

    public graphic(type: string, layer: LevelLayer, options?: Record<string, any>): Graphic {
        return super.graphic(type, layer, options);
    }

    public sprite(key: string, layer: LevelLayer): Sprite {
        return super.sprite(key, layer);
    }
}