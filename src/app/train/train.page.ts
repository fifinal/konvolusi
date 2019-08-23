import { Component, OnInit } from '@angular/core';
import { ACTIVATION_SOFTMAX, LAYER_CONV, LAYER_FULLY_CONNECTED, LAYER_INPUT, LAYER_MAXPOOL } from '../util/constant';
import PureCnn from '../model/model';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Chart } from 'chart.js';
import ImageProcess from '../praproses/ImageProcess';
export interface Item { id: string; name: string; }

// import {LayerComponent} from '../layer/layer.component';

@Component({
  selector: 'app-train',
  templateUrl: './train.page.html',
  styleUrls: ['./train.page.scss'],
})
export class TrainPage implements OnInit {
  private itemsCollection: AngularFirestoreCollection;
  task: AngularFireUploadTask;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  items: Observable<Item[]>;
  public inputModel: any;
  public daun1: any;
  public btn: string;
  public nama_file_bobot: string;
  public labeldaun1: string;
  public labeldaun2: string;
  public labeldaun3: string;
  public labeldaun4: string;
  public labeldaun5: string;
  public labeldaun6: string;
  public labeldaun7: string;
  public labeldaun8: string;
  public labeldaun9: string;
  public labeldaun10: string;

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

  public in: boolean;
  public k1: boolean;
  public p1: boolean;
  public k2: boolean;
  public p2: boolean;
  public f: boolean;

  public model: any;
  public jsonObject: any;
  configAkurasi: { type: string; data: { labels: string[]; datasets: { label: string; data: number[]; fill: boolean; lineTension: number; borderColor: string; borderWidth: number; }[]; }; options: { title: { text: string; display: boolean; }; scales: any }; };
  configLoss: { type: string; data: { labels: any[]; datasets: { label: string; data: any[]; fill: boolean; lineTension: number; borderColor: string; borderWidth: number; }[]; }; options: { title: { text: string; display: boolean; }; scales: any }; };
  constructor(private db: AngularFirestore, private storage: AngularFireStorage) {
    this.in = false;
    this.k1 = false;
    this.p1 = false;
    this.k2 = false;
    this.p2 = false;
    this.f = false;

    this.inputModel = {
      rate: null,
      batch: null,
      inputLayerWidth: null,
      inputLayerHeight: null,
      inputLayerDepth: null,
      convLayerPatchSize: null,
      convLayerOutputs: null,
      poolLayerSize: null,
      convLayerPatchSize2: null,
      convLayerStride2: null,
      convLayerOutputs2: null,
      poolLayerSize2: null,
      poolLayerStride2: null,
      outputLayerCount: null
    }
    this.configAkurasi = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Akurasi',
            data: [],
            fill: false,
            lineTension: 0.2,
            borderColor: "green",
            borderWidth: 1
          }]
      },
      options: {
        title: {
          text: "Line Chart",
          display: true
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    }
    this.configLoss = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Loss',
            data: [],
            fill: false,
            lineTension: 0.2,
            borderColor: "red",
            borderWidth: 1
          }]
      },
      options: {
        title: {
          text: "Line Chart",
          display: true
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    }
    this.nama_file_bobot = "model";
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
    this.input = 64;

    this.forward_time = 0;
    this.backward_time = 0;

    this.model = undefined;

    this.datas = new Array(10);
  }

  initialize_network() {
    this.model = new PureCnn(this.mini_batch_size);
    // this.model.add_layer({
    //   name: "image",
    //   type: LAYER_INPUT,
    //   width: this.input,
    //   height: this.input,
    //   depth: 3
    // });
    // this.model.add_layer({
    //   name: "conv1",
    //   type: LAYER_CONV,
    //   units: 10,
    //   kernel_width: 5,
    //   kernel_height: 5,
    //   pool_stride_x: 1,
    //   pool_stride_y: 1,
    //   padding: false
    // });
    // this.model.add_layer({
    //   name: "pool1",
    //   type: LAYER_MAXPOOL,
    //   pool_width: 2,
    //   pool_height: 2,
    //   pool_stride_x: 2,
    //   pool_stride_y: 2
    // });
    // this.model.add_layer({
    //   name: "conv2",
    //   type: LAYER_CONV,
    //   units: 20,
    //   kernel_width: 3,
    //   kernel_height: 3,
    //   pool_stride_x: 1,
    //   pool_stride_y: 1,
    //   padding: false
    // });
    // this.model.add_layer({
    //   name: "pool2",
    //   type: LAYER_MAXPOOL,
    //   pool_width: 2,
    //   pool_height: 2,
    //   pool_stride_x: 2,
    //   pool_stride_y: 2
    // });
    // this.model.add_layer({ name: "out", type: LAYER_FULLY_CONNECTED, units: 10, activation: ACTIVATION_SOFTMAX });

    // this.model.set_learning_rate(0.01);
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
      this.mini_batch_loss = (Math.floor(1000.0 * this.model.training_error) / 1000.0);
      this.train_accuracy = (Math.floor(1000.0 * accuracy) / 10.0) + "%";
      //  =======================
      this.configAkurasi.data.labels.push(String(this.example_seen / this.mini_batch_size));
      this.configAkurasi.data.datasets[0].data.push((Math.floor(1000.0 * accuracy) / 10.0));

      this.configLoss.data.labels.push(String(this.example_seen / this.mini_batch_size));
      this.configLoss.data.datasets[0].data.push(String(this.mini_batch_loss));

      this.epoch++;
      if (!this.paused && (Math.floor(1000.0 * accuracy) / 10.0) <= 90) {
        // if (!this.paused) {
        this.timeoutID = true;
        setTimeout(() => {
          this.train();
        }, 1000);
      }
      else {
        new Chart('akurasi', this.configAkurasi);
        new Chart('loss', this.configLoss);
        console.log("Pausing after iteration " + this.iter);
        this.save_model();
      }
    }
    else {
      this.running = this.paused = false;
      this.iter = 0;
      new Chart('akurasi', this.configAkurasi);
      new Chart('loss', this.configLoss);
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
        let biasConv = new Array(layer.units);
        for (let j = 0; j < layer.units; j++) {
          weightConv[j] = layer.kernel[j].get_value_array();
          biasConv[j] = layer.biases[j];

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
          biases: biasConv
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
        let biasFC = new Array(layer.units);
        for (let j = 0; j < layer.units; j++) {
          weightFC[j] = layer.weight[j].get_value_array();
          biasFC[j] = layer.biases[j];
        }
        return {
          name: layer.name,
          type: layer.type,
          units: layer.units,
          weight: weightFC,
          activation: layer.activation,
          biases: biasFC,
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
    this.jsonObject = model_dict;
    console.log(model_dict);
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
    this.itemsCollection = this.db.collection('items');
    const id = this.db.createId();
    let metadata = {
      contentType: 'application/json',
    };

    if (this.jsonObject) {
      let blob = new Blob([JSON.stringify(this.jsonObject, undefined, 4)], { type: metadata.contentType });
      const filePath = this.nama_file_bobot + '.json';
      const ref = this.storage.ref(filePath);
      this.task = ref.put(blob, metadata);
      // this.uploadPercent = this.task.percentageChanges();
      // get notified when the download URL is available
      // The file's download URL
      console.log("upload")
      this.task.snapshotChanges().pipe(
        finalize(() => {
          ref.getDownloadURL().toPromise().then((url) => {
            this.itemsCollection.doc(id).set({ nama: this.nama_file_bobot, url: url });
          }).catch(err => { console.log(err) });
        })
      ).subscribe();

    }

  }

  loadImage(e: any, n: number) {
    switch (n) {
      case 0: this.datas[n] = this.labeldaun1;
        break;
      case 1: this.datas[n] = this.labeldaun2;
        break;
      case 2: this.datas[n] = this.labeldaun3;
        break;
      case 3: this.datas[n] = this.labeldaun4;
        break;
      case 4: this.datas[n] = this.labeldaun5;
        break;
      case 5: this.datas[n] = this.labeldaun6;
        break;
      case 6: this.datas[n] = this.labeldaun7;
        break;
      case 7: this.datas[n] = this.labeldaun8;
        break;
      case 8: this.datas[n] = this.labeldaun9;
        break;
      case 9: this.datas[n] = this.labeldaun10;
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
          let sizeDraw = Math.floor(this.input + (this.input / 4));
          ctx.drawImage(img, 0, 0, sizeDraw, sizeDraw);
          let augmentasi = [[0.5, 0.5], [0, 0], [1, 0], [0, 1], [1, 1]];

          for (let a = 0; a < augmentasi.length; a++) {
            let x = Math.floor(augmentasi[a][0] * (this.input / 4));
            let y = Math.floor(augmentasi[a][1] * (this.input / 4));
            let pixelData = ctx.getImageData(x, y, this.input, this.input);
            let improc = new ImageProcess(pixelData);
            // improc.threshold(160);
            improc.sharpen(0, ctx);
            improc.contrastStretching();
            if (i >= Math.floor(filesImage.length * (4 / 5))) {
              this.validasiData.push({ label: n, image: improc.pixels });
            } else {
              this.trainData.push({ label: n, image: improc.pixels });
            }
          }

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
          // this.save_model();
        }
        else if (this.running && this.paused && !this.testing) {
          this.paused = false;
          this.btn = "Pause";

          if (this.timeoutID === false) {
            this.train();
            // this.save_model();
          }
        }
        break;
      }
      default:
        break;
    }
  }

  setRate() {
    if (this.inputModel.rate != null) this.model.set_learning_rate(this.inputModel.rate);
    else alert("tidak boleh kosong")
  }
  setInput() {
    if (this.inputModel.inputLayerWidth != null &&
      this.inputModel.inputLayerHeight != null &&
      this.inputModel.inputLayerDepth != null) {
      this.model.add_layer({
        name: "image",
        type: LAYER_INPUT,
        width: this.inputModel.inputLayerWidth,
        height: this.inputModel.inputLayerHeight,
        depth: this.inputModel.inputLayerDepth
      });
      this.in = true;
    } else { alert("tidak boleh kosong") }
  }
  setBatch() {
    if (this.inputModel.batch != null) this.mini_batch_size = this.inputModel.batch;
    else alert("tidak boleh kosong")

  }
  setConv(no) {
    if (no == 1 &&
      this.inputModel.convLayerPatchSize != null &&
      this.inputModel.convLayerOutputs != null) {
      this.model.add_layer({
        name: "conv1",
        type: LAYER_CONV,
        units: this.inputModel.convLayerOutputs,
        kernel_width: this.inputModel.convLayerPatchSize,
        kernel_height: this.inputModel.convLayerPatchSize,
        pool_stride_x: 1,
        pool_stride_y: 1,
        padding: false
      });
      this.k1 = true;
    }
    else if (no == 2 &&
      this.inputModel.convLayerPatchSize2 != null &&
      this.inputModel.convLayerOutputs2 != null) {
      this.model.add_layer({
        name: "conv2",
        type: LAYER_CONV,
        units: this.inputModel.convLayerOutputs2,
        kernel_width: this.inputModel.convLayerPatchSize2,
        kernel_height: this.inputModel.convLayerPatchSize2,
        pool_stride_x: 1,
        pool_stride_y: 1,
        padding: false
      });
      this.k2 = true;
    } else { alert("tidak boleh kosong") }

  }
  setMaxPool(no) {
    if (no == 1 &&
      this.inputModel.poolLayerSize != null &&
      this.inputModel.poolLayerStride != null) {
      this.model.add_layer({
        name: "pool1",
        type: LAYER_MAXPOOL,
        pool_width: this.inputModel.poolLayerSize,
        pool_height: this.inputModel.poolLayerSize,
        pool_stride_x: this.inputModel.poolLayerStride,
        pool_stride_y: this.inputModel.poolLayerStride
      });
      this.p1 = true;
    }
    else if (no == 2 &&
      this.inputModel.poolLayerSize2 != null &&
      this.inputModel.poolLayerStride2 != null) {
      this.model.add_layer({
        name: "pool2",
        type: LAYER_MAXPOOL,
        pool_width: this.inputModel.poolLayerSize2,
        pool_height: this.inputModel.poolLayerSize2,
        pool_stride_x: this.inputModel.poolLayerStride2,
        pool_stride_y: this.inputModel.poolLayerStride2
      });
      this.p2 = true;
    } else { alert("tidak boleh kosong") }
  }
  setFC() {
    if (this.inputModel.outputLayerCount != null) {
      this.model.add_layer({
        name: "out",
        type: LAYER_FULLY_CONNECTED,
        units: this.inputModel.outputLayerCount,
        activation: ACTIVATION_SOFTMAX
      });
      this.f = true;
    } else { alert("tidak boleh kosong") }
  }
  ngOnInit() {
    this.initialize_network(); // model jaringan disimpan di properti model
  }
}
