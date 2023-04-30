// @ignorePage

export default class EaseFunctions {

    // SINE
    static easeInSine(x: number): number {
        return 1 - Math.cos((x * Math.PI) / 2); 
    }
    
    static easeOutSine(x: number): number {
        return Math.sin((x * Math.PI) / 2);
    }

    static easeInOutSine(x: number): number {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    }

    static easeOutInSine(x: number): number {
        return x < 0.5 ? -Math.cos(Math.PI*(x + 0.5))/2 : -Math.cos(Math.PI*(x - 0.5))/2 + 1;
    }

    // QUAD
    static easeInQuad(x: number): number {
        return x * x;
    }

    static easeOutQuad(x: number): number {
        return 1 - (1 - x) * (1 - x);
    }
    
    static easeInOutQuad(x: number): number {
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }

    static easeOutInQuad(x: number): number {
        return x < 0.5 ? this.easeOutIn_OutPow(x, 2) : this.easeOutIn_InPow(x, 2);
    }

    // QUINT
    static easeInQuint(x: number): number {
        return x * x * x * x * x;
    }

    static easeOutQuint(x: number): number {
        return 1 - Math.pow(1 - x, 5);
    }

    static easeInOutQuint(x: number): number {
        return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;    
    }

    // CIRC
    static easeInCirc(x: number): number {
        return 1 - Math.sqrt(1 - Math.pow(x, 2));
    }

    static easeOutCirc(x: number): number {
        return Math.sqrt(1 - Math.pow(x - 1, 2));
    }
    
    static easeInOutCirc(x: number): number {
        return x < 0.5
          ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
          : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
    }

    // ELASTIC
    static easeInElastic(x: number): number {
        const c4 = (2 * Math.PI) / 3;
        
        return x === 0
          ? 0
          : x === 1
          ? 1
          : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
    }

    static easeOutElastic(x: number): number {
        const c4 = (2 * Math.PI) / 3;
        
        return x === 0
          ? 0
          : x === 1
          ? 1
          : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }
    
    static easeInOutElastic(x: number): number {
        const c5 = (2 * Math.PI) / 4.5;
        
        return x === 0
          ? 0
          : x === 1
          ? 1
          : x < 0.5
          ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
          : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
    }

    private static easeOutIn_OutPow(x: number, pow: number): number {
        return 0.5 - Math.pow(-2 * x + 1, pow) / 2;
    }

    private static easeOutIn_InPow(x: number, pow: number): number {
        return 0.5 + Math.pow(2 * x - 1, pow) / 2;
    }
}

export enum EaseFunctionType {
    // SINE
    IN_OUT_SINE = "easeInOutSine",
    OUT_IN_SINE = "easeOutInSine",
    IN_SINE = "easeInSine",
    OUT_SINE = "easeOutSine",

    // QUAD
    IN_OUT_QUAD = "easeInOutQuad",
    OUT_IN_QUAD = "easeOutInQuad",
    IN_QUAD = "easeInQuad",
    OUT_QUAD = "easeOutQuad",

    // QUINT
    IN_OUT_QUINT = "easeInOutQuint",
    IN_QUINT = "easeInQuint",
    OUT_QUINT = "easeOutQuint",

    // CIRC
    IN_OUT_CIRC = "easeInOutCirc",
    IN_CIRC = "easeInCirc",
    OUT_CIRC = "easeOutCirc",

    // ELASTIC
    IN_OUT_ELASTIC = "easeInOutElastic",
    IN_ELASTIC = "easeInElastic",
    OUT_ELASTIC = "easeOutElastic"
}