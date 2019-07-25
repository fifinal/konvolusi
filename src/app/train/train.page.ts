import { Component, OnInit } from '@angular/core';
import { ACTIVATION_SOFTMAX, LAYER_CONV, LAYER_FULLY_CONNECTED, LAYER_INPUT, LAYER_MAXPOOL } from '../util/constant';
import PureCnn from '../model/model';
// import {LayerComponent} from '../layer/layer.component';

@Component({
  selector: 'app-train',
  templateUrl: './train.page.html',
  styleUrls: ['./train.page.scss'],
})
export class TrainPage implements OnInit {
  public daun1: any;
  public btn: string;

  public labelDaun1: string;
  public labelDaun2: string;
  public labelDaun3: string;
  public labelDaun4: string;
  public labelDaun5: string;
  public labelDaun6: string;
  public labelDaun7: string;
  public labelDaun8: string;
  public labelDaun9: string;
  public labelDaun10: string;

  public input: number;
  public trainData: any[];
  public validasiData: any[];
  public labels: any[];
  public datas: any[];

  public trainNum: number;
  public example_seen: number;
  public forward_time: any;
  public backward_time: any;
  public mini_batch_loss: any;
  public train_accuracy: any;

  public mini_batch_size: any;
  public iter: any;
  public epoch: any;
  public running: boolean;
  public paused: boolean;
  public testing: boolean;
  public timeoutID: boolean;

  public model: any;
  public jsonObject: any;
  constructor() {
    this.btn = "Train";
    this.trainNum = 0;
    this.mini_batch_size = 20;

    this.iter = 0;
    this.epoch = 0;
    this.example_seen = 0;

    this.running = false;
    this.paused = false;
    this.testing = false;
    this.timeoutID = false;

    this.trainData = new Array();  // new Image/ img src 
    this.validasiData = new Array();  // new Image/ img src 
    this.input = 226;

    this.forward_time = 0;
    this.backward_time = 0;

    this.model = undefined;

    this.datas = new Array(10);
  }

  init() {

  }

  initialize_network() {
    this.model = new PureCnn(this.mini_batch_size);
    this.model.add_layer({
      name: "image",
      type: LAYER_INPUT,
      width: this.input,
      height: this.input,
      depth: 3
    });
    this.model.add_layer({
      name: "conv1",
      type: LAYER_CONV,
      units: 10,
      kernel_width: 5,
      kernel_height: 5,
      pool_stride_x: 1,
      pool_stride_y: 1,
      padding: false
    });
    this.model.add_layer({
      name: "pool1",
      type: LAYER_MAXPOOL,
      pool_width: 2,
      pool_height: 2,
      pool_stride_x: 2,
      pool_stride_y: 2
    });
    this.model.add_layer({
      name: "conv2",
      type: LAYER_CONV,
      units: 20,
      kernel_width: 5,
      kernel_height: 5,
      pool_stride_x: 1,
      pool_stride_y: 1,
      padding: false
    });
    this.model.add_layer({
      name: "pool2",
      type: LAYER_MAXPOOL,
      pool_width: 2,
      pool_height: 2,
      pool_stride_x: 2,
      pool_stride_y: 2
    });
    this.model.add_layer({ name: "out", type: LAYER_FULLY_CONNECTED, units: 10, activation: ACTIVATION_SOFTMAX });

    this.model.set_learning_rate(0.01);
    this.model.set_momentum(0.9);
    this.model.set_l2(0.0);
  }

  train() {
    if (this.model === undefined) return;
    if (!this.running) return;

    this.timeoutID = false;

    if (this.iter < this.trainData.length) {
      let train_image_batch = []; //batch untuk train gambar sebanyak mini_batch_size
      let train_label_batch = []; // batch untuk label

      for (let i = 0; (i < this.mini_batch_size && this.iter < this.trainData.length); ++i, ++this.iter) {
        // i : (0 sampai 19) --- this.iter : (0 sampai train_num atau 50000) 
        train_image_batch[i] = this.trainData[this.iter].image;
        train_label_batch[i] = this.trainData[this.iter].label;
      }

      this.example_seen += this.mini_batch_size; //menjumlahkan gambar yg ditraining  
      // ===== Method utama untuk train data ======
      // ===== train model dengan batch size 20 atau train data setiap 20 gambar
      console.log(new Date());
      this.model.train(train_image_batch, train_label_batch);
      console.log(this.iter);

      this.forward_time = String(Math.floor(10 * this.model.forward_time) / 10.0);
      this.backward_time = String(Math.floor(10 * this.model.backward_time) / 10.0);
      if (this.forward_time.indexOf(".") === -1) this.forward_time += ".0";
      if (this.backward_time.indexOf(".") === -1) this.backward_time += ".0";

      //  ===== tampilan UI =====
      let accuracy = this.validate_accuracy();
      this.mini_batch_loss = (Math.floor(1000.0 * this.model.training_error) / 1000.0) + "";
      this.train_accuracy = (Math.floor(1000.0 * accuracy) / 10.0) + "%";
      //  =======================

      this.epoch++;
      if (!this.paused) {
        this.timeoutID = true;
        setTimeout(() => {
          this.train();
        }, 50);
      }
      else console.log("Pausing after iteration " + this.iter);
    }
    else {
      this.running = this.paused = false;
      this.iter = 0;
      this.save_model();
      this.btn = "Keep Training";
      this.train_accuracy = (Math.floor(1000.0 * this.validate_accuracy()) / 10.0) + "%";
    }
  }

  validate_accuracy() {
    let correct = 0;
    let image_data_list = [];
    let image_label_list = [];

    for (let i = 0; i < 100; i += 10) {
      for (let j = 0; j < 10; j++) { // pengulangan untuk mengisi data yg akan diprediksi
        let validate_image_index = Math.floor(Math.random() * this.validasiData.length); //0 sampai panjang validasidata

        for (let rand = 0; rand < 1; rand++) {
          image_data_list[j + rand] = this.validasiData[validate_image_index].image;
          image_label_list[j + rand] = this.validasiData[validate_image_index].label;
        }
      }

      let results = this.model.predict(image_data_list);

      for (let m = 0; m < 10; m++) {
        let guess = 0, max_value = 0;
        for (let c = 0; c < results[m].shape.depth; c++) { // mencari nilai tertinggi dr output
          let c_sum = 0;
          for (let rand = 0; rand < 1; rand++) {
            c_sum += results[m + rand].get_value_by_coordinate(0, 0, c);
          }

          if (c_sum > max_value) {  //jika nilai tertinggi didapat maka index tsb diambil
            max_value = c_sum;
            guess = c;
          }
        }
        if (guess === image_label_list[m]) correct++; //jika nilai tertinggi = label
      }
    }
    return correct / 100;
  }


  layer_dict(layer, i) {
    switch (layer.type) {
      case LAYER_INPUT:
        return {
          name: layer.name,
          type: layer.type,
          width: layer.output_shape.width,
          height: layer.output_shape.height,
          depth: layer.output_shape.depth
        };
        break;
      case LAYER_CONV:
        let weightConv = new Array(layer.units);
        for (let j = 0; j < layer.units; j++) {
          weightConv = layer.kernel[j].get_value();
        }
        return {
          name: layer.name,
          type: layer.type,
          units: layer.units,
          weight: weightConv,
          kernel_width: layer.kernel_width,
          kernel_height: layer.kernel_height,
          kernel_stride_x: layer.kernel_stride_x,
          kernel_stride_y: layer.kernel_stride_y,
          pad_x: layer.pad_x,
          pad_y: layer.pad_y,
          biases: layer.biases
        }
        break;
      case LAYER_MAXPOOL:
        return {
          name: layer.name,
          type: layer.type,
          pool_width: layer.pool_width,
          pool_height: layer.pool_height,
          pool_stride_x: layer.pool_stride_x,
          pool_stride_y: layer.pool_stride_y
        }
        break;
      case LAYER_FULLY_CONNECTED:
        let weightFC = new Array(layer.units);
        for (let j = 0; j < layer.units; j++) {
          weightFC = layer.weight[j].get_value();
        }
        return {
          name: layer.name,
          type: layer.type,
          units: layer.units,
          weight: weightFC,
          activation: layer.activation,
          biases: layer.biases,
        }
        break;
    }
  }

  save_model() {
    const model_dict = {
      labels: this.datas,
      layers: this.model.layers.map((layer, i) => this.layer_dict(layer, i)),
      example_seen: this.example_seen,
      mini_batch_size: this.mini_batch_size,
      momentum: this.model.momentum,
      learning_rate: this.model.learning_rate,
      l2: this.model.l2,
    }
    setTimeout(() => this.jsonObject = model_dict, 1000);
  }

  randomTrainData() {
    let arr = [];
    while (this.trainData.length !== 0) {
      let randIndex = Math.floor(Math.random() * this.trainData.length);
      arr.push(this.trainData[randIndex]);
      this.trainData.splice(randIndex, 1);
    }
    this.trainData = arr;
  }
  upload() {

  }

  loadImage(e: any, n: number) {
    switch (n) {
      case 0: this.datas[n] = this.labelDaun1;
        break;
      case 1: this.datas[n] = this.labelDaun2;
        break;
      case 2: this.datas[n] = this.labelDaun3;
        break;
      case 3: this.datas[n] = this.labelDaun4;
        break;
      case 4: this.datas[n] = this.labelDaun5;
        break;
      case 5: this.datas[n] = this.labelDaun6;
        break;
      case 6: this.datas[n] = this.labelDaun7;
        break;
      case 7: this.datas[n] = this.labelDaun8;
        break;
      case 8: this.datas[n] = this.labelDaun9;
        break;
      case 9: this.datas[n] = this.labelDaun10;
        break;

    }
    let progress = 0;
    // 1. ambil gambar dr input user
    let filesImage: FileList = e.target.files;
    // 2. setiap gambar dibuat canvas  
    for (let i = 0; i < filesImage.length; i++) {

      const fileReader: FileReader = new FileReader();

      fileReader.onload = (data: any) => {
        const img = new Image(this.input, this.input);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = this.input;
          canvas.height = this.input;
          let ctx = canvas.getContext('2d');

          ctx.drawImage(img, 0, 0, this.input, this.input);
          let pixelData = ctx.getImageData(0, 0, this.input, this.input);
          if (i >= Math.floor(filesImage.length * (4 / 5))) {
            this.validasiData.push({ label: n, image: pixelData });
          } else {
            this.trainData.push({ label: n, image: pixelData });
          }
          // ctx.putImageData(pixelData,0,0);

          // let gambar=canvas.toDataURL("image/jpeg",1);
          // const a = document.createElement('a');
          // a.setAttribute('href', gambar);
          // a.setAttribute('download', this.labelDaun1+i);
          // a.innerHTML=this.labelDaun1+i;
          // a.click();
          // document.body.append(a);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          progress += Math.ceil(100 / 30);
          if (progress >= 99) { }
        }
        img.src = data.target.result;
      };
      fileReader.readAsDataURL(filesImage[i]);
    }
  }

  download() {
    const fileContents = JSON.stringify(this.jsonObject, null, 2);
    let fileName = "model.json";
    let file = 'data:text/json;charset=utf-8,' + encodeURIComponent(fileContents);

    const a = document.createElement('a');
    a.setAttribute('href', file);
    a.setAttribute('download', fileName);
    a.click();
  }

  button_click(n: number) {
    this.randomTrainData();
    this.btn = "Training";
    switch (n) {
      case 1: {
        if (
          !this.running &&
          !this.testing &&
          this.model !== undefined) {

          this.running = true;
          this.paused = false;
          this.btn = "Pause";
          this.train();
          // this.save_model();

        }
        else if (this.running && !this.paused) {
          this.paused = true;
          this.btn = "Resume";
          this.save_model();
        }
        else if (this.running && this.paused && !this.testing) {
          this.paused = false;
          this.btn = "Pause";

          if (this.timeoutID === false) {
            this.train();
            this.save_model();
          }
        }
        break;
      }
      default:
        break;
    }
  }

  onTrainImageLoad(i, e) {
    // let files=e.target.files;
  }
  save(filename, data) {

    if (!data) {
      alert('error : No data')
      return;
    }

    if (typeof data === "object") {
      data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], { type: 'text/json' }),
      e = document.createEvent('MouseEvents'),
      a = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
  }
  ngOnInit() {
    // this.init();
    // this.createContext()
    this.initialize_network(); // model jaringan disimpan di properti model

  }
}
