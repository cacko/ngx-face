import { Injectable } from '@angular/core';
import { AbstractControl, } from '@angular/forms';
import * as faceapi from 'face-api.js';
import { FileInput } from 'ngx-custom-material-file-input';



@Injectable({
  providedIn: 'root'
})
export class FaceService {

  constructor() { }

  async detectFacesValidator(control: AbstractControl) {
    const input = control.value as FileInput;
    if (!faceapi.nets.ssdMobilenetv1.isLoaded) {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models');
    }
    if (input.files.length) {
      const file = input.files[0];
      const url = URL.createObjectURL(file);
      const det = await faceapi.detectAllFaces(await faceapi.fetchImage(url));
      return det.length ? null : { face: "There are no faces on this photo" };
    }
    return null;
  }

  private dataURLtoBlob(dataurl: string) {
    var arr = dataurl.split(','), mime = 'image/png',
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }


  detectFaces(image: string) {
    return (async () => {
      if (!faceapi.nets.ssdMobilenetv1.isLoaded) {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models');
      }
      const input = await faceapi.bufferToImage(this.dataURLtoBlob(image));
      return faceapi.detectAllFaces(input).run();
    })();

  }

}
