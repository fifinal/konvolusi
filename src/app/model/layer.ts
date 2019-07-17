import {ACTIVATION_LINEAR} from "../util/constant";

class Layer {
	public name: any;
	public units: any;
	public activation: any;
	public next_layer: any;
	public pre_layer: any;
	public input_shape: any;

    constructor(name, units) {
        this.name = name;
        this.units = units;
        this.activation = ACTIVATION_LINEAR;
    }

    is_last_layer() {
        return this.next_layer === undefined;
    }

    set_input_layer(input_layer) {
        this.pre_layer = input_layer;
        this.input_shape = input_layer.output_shape;
    }

    set_output_layer(output_layer) {
        this.next_layer = output_layer;
    }

    batch_update() {
    }
}

interface LayerDict{
    name:string;
    type:string;
}
export{Layer,LayerDict};