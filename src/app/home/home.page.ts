import { Component, ViewChild, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// import { NavController, LoadingController } from '@ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController } from '@ionic/angular';
import { CropperComponent } from 'angular-cropperjs';
import PureCnn from '../model/model';
import { LAYER_CONV, LAYER_FULLY_CONNECTED } from '../util/constant';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import ImageProcess from '../praproses/ImageProcess';
export interface Item { nama: string; url: string; }
// import { FileTransfer } from '@ionic-native/file-transfer';
// import { File } from '@ionic-native/file';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('angularCropper') public angularCropper: CropperComponent
  bobotSelected: string;
  cropperOptions: any;
  myphoto: any = null;
  croppedImage: string;
  scaleValX = 1;
  scaleValY = 1;
  model: any;
  model_test: any;
  confidence: string;
  klas: string;
  private itemsCollection: AngularFirestoreCollection<Item>;
  items: Observable<Item[]>;
  labels: any[];
  arrKemungkinan: any[];
  range: number;
  img: HTMLImageElement;
  pixelData: ImageData;
  ctx: CanvasRenderingContext2D;
  constructor(private afs: AngularFirestore,
    public http: HttpClient,
    public actionSheet: ActionSheetController,
    private camera: Camera,
    private storage: Storage
  ) {
    this.itemsCollection = afs.collection<Item>('items');
    this.items = this.itemsCollection.valueChanges();
    this.arrKemungkinan = [];
    this.myphoto = "assets/1.png";
    // this.myphoto="";
    this.confidence = "";
    this.model_test = 'assets/model.json';
    this.model = undefined;
    this.cropperOptions = {
      dragMode: 'crop',
      aspectRatio: 1,
      autoCrop: false,
      movable: true,
      zoomable: true,
      scalable: true,
      autoCropArea: 0.8
    };
  }
  async sheet() {
    const actionSheet = await this.actionSheet.create({
      header: 'Ambil Gambar',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close',
          handler: () => {

          }
        },
        {
          text: 'Kamera',
          role: 'destructive',
          icon: 'camera',
          handler: () => this.takePhoto()
        },
        {
          text: 'Gallery',
          icon: 'image',
          handler: () => this.getImageInGalery()
        }]
    });
    await actionSheet.present();
  }
  takePhoto() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      this.myphoto = "data:image/jpeg;base64," + imageData;
    }, (err) => {
      // Handle error
    });
  }
  save() {
    let croppedImgB64Str: any = this.angularCropper.cropper.getCroppedCanvas({ width: 226, height: 226 }).toDataURL('image/jpeg', (100 / 100));
    console.log(this.angularCropper.cropper.getImageData());
    this.croppedImage = croppedImgB64Str;
    this.imagePredict();


  }
  reset() {
    this.angularCropper.cropper.reset();
  }
  clear() {
    this.angularCropper.cropper.clear();
  }
  rotate(deg) {
    this.angularCropper.cropper.rotate(deg);
  }
  zoom(zoomIn: boolean) {
    let factor = zoomIn ? 0.1 : -0.1;
    this.angularCropper.cropper.zoom(factor);
  }
  scaleX() {
    this.scaleValX = this.scaleValX * -1;
    this.angularCropper.cropper.scaleX(this.scaleValX);
  }
  enable() {
    this.angularCropper.cropper.enable();
  }
  disable() {
    this.angularCropper.cropper.disable();
  }
  scaleY() {
    this.scaleValY = this.scaleValY * -1;
    this.angularCropper.cropper.scaleY(this.scaleValY);
  }
  move(x, y) {
    this.angularCropper.cropper.move(x, y);
  }

  getImageInGalery() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      saveToPhotoAlbum: false
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      this.myphoto = "data:image/jpeg;base64," + imageData;
    }, (err) => {
      // Handle error
    });
  }

  cropImage() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      saveToPhotoAlbum: false,
      allowEdit: true,
      targetWidth: 300,
      targetHeight: 300
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      this.croppedImage = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      // Handle error
    });
  }
  imagePredict() {
    this.img = new Image();
    this.img.onload = () => {
      let canvas = <HTMLCanvasElement>document.getElementById('myCanvas');
      this.ctx = canvas.getContext('2d');
      this.ctx.drawImage(this.img, 0, 0, canvas.width, canvas.height);
      this.pixelData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
    this.img.src = this.croppedImage;
  }
  predict(){
    this.img = new Image();
    this.img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      this.ctx = canvas.getContext('2d');

      this.ctx.drawImage(this.img, 0, 0, 64,64);
      this.pixelData = this.ctx.getImageData(0,0,64,64);
      let improc = new ImageProcess(this.pixelData);
      improc.threshold(this.range);
      improc.sharpen(0, this.ctx);
      improc.contrastStretching();
      this.p(improc.pixels);
    };
    this.img.src = this.croppedImage;
  }
  p(inputImageData) {
    // const inputImageData = this.getImage();
    // this.imagePredict();
    if (this.model === undefined) return;

    const result = this.model.predict([inputImageData]);
    console.log(result);
    let guess = 0;
    let max = 0;
    let kemiripan = [];
    for (let i = 0; i < 10; ++i) {
      kemiripan.push({
        data: result[0].get_value_by_coordinate(0, 0, i),
        label: this.labels[i]
      });
      if (result[0].get_value_by_coordinate(0, 0, i) > max) {
        max = result[0].get_value_by_coordinate(0, 0, i);
        guess = i;
      }
    }
    kemiripan.sort((a, b) => (a["data"] < b["data"] ? -1 : 1));

    // this.klas = ( max > 0.866667 ) ? String(guess) : String(max);

    this.confidence = String(Math.min(100, Math.floor(1000 * (max)) / 10.0)) + "% dengan " + String(this.labels[guess]);
    let akurasi1 = Math.min(100, Math.floor(1000 * kemiripan[kemiripan.length - 2].data)) / 10.0;
    let akurasi2 = Math.min(100, Math.floor(1000 * kemiripan[kemiripan.length - 3].data)) / 10.0;
    if (akurasi1 > 30) {
      this.arrKemungkinan[0] = kemiripan[kemiripan.length - 2].label + " dengan akurasi " + String(akurasi1) + " %";
      this.arrKemungkinan[1] = kemiripan[kemiripan.length - 3].label + " dengan akurasi " + String(akurasi2) + " %";
    }
  }

  loadModelFromJson(model_json) {
    this.model = new PureCnn();

    if (model_json.momentum !== undefined) this.model.set_momentum(model_json.momentum);
    this.labels = model_json.labels
    if (model_json.l2 !== undefined) this.model.set_l2(model_json.l2);
    if (model_json.learning_rate !== undefined) this.model.set_learning_rate(model_json.learning_rate);

    for (let layer_index = 0; layer_index < model_json.layers.length; ++layer_index) {
      let layerDesc = model_json.layers[layer_index];
      this.model.add_layer(layerDesc);
    }
    for (let layerIndex = 0; layerIndex < model_json.layers.length; ++layerIndex) {
      let layerDesc = model_json.layers[layerIndex];

      switch (model_json.layers[layerIndex].type) {
        case LAYER_CONV:
          this.model.layers[layerIndex].set_params(layerDesc.weight, layerDesc.biases);
          break;
        case LAYER_FULLY_CONNECTED:
          this.model.layers[layerIndex].set_params(layerDesc.weight, layerDesc.biases);
          break;
        default:
          break;
      }
    }
  }

  async readJson(model) {
    // const res = await fetch(model,{mode: 'no-cors'});
    this.http.get(model).subscribe((data) => {

      console.log(data);
      this.loadModelFromJson(data);
    });
    // const data = await res.json();
  }

  onChange(event) {
    console.log(event);
    try {

      this.readJson(this.bobotSelected);


      //   const url = 'https://api.example.com';
      //   const params = {};
      //   const headers = {};

      //   const response = await this.http.get(url, params, headers);

      //   console.log(response.status);
      //   console.log(JSON.parse(response.data)); // JSON data returned by server
      //   console.log(response.headers);

    } catch (error) {
      console.log(error);
    }

  }
  changeThreshold(event) {

    this.img.onload = () => {
      let canvas = <HTMLCanvasElement>document.getElementById('myCanvas');
      this.ctx = canvas.getContext('2d');

      this.ctx.drawImage(this.img, 0, 0, canvas.width, canvas.height);
      this.pixelData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
      // this.predict(pixelData);
      let improc = new ImageProcess(this.pixelData);
      improc.threshold(this.range);
      improc.sharpen(0, this.ctx);
      improc.contrastStretching();
      this.ctx.putImageData(improc.pixels, 0, 0);
      // this.pixelData=improc.pixels;
    };
    this.img.src = this.croppedImage;


  }
  ngOnInit() {
    this.readJson(this.model_test);
  }
  // uploadImage(){
  //    //Show loading
  //    let loader = this.loadingCtrl.create({
  //      content: "Uploading..."
  //    });
  //    loader.present();

  //    //create file transfer object
  //    const fileTransfer: FileTransferObject = this.transfer.create();

  //    //random int
  //    var random = Math.floor(Math.random() * 100);

  //    //option transfer
  //    let options: FileUploadOptions = {
  //      fileKey: 'photo',
  //      fileName: "myImage_" + random + ".jpg",
  //      chunkedMode: false,
  //      httpMethod: 'post',
  //      mimeType: "image/jpeg",
  //      headers: {}
  //    }

  //    //file transfer action
  //      .then((data) => {
  //        alert("Success");
  //        loader.dismiss();
  //      }, (err) => {
  //        console.log(err);
  //        alert("Error");
  //        loader.dismiss();
  //      });
  //  }
}
