import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

const fileSizeMax = 1 * 1024 * 1024
const widthHeightMax = 512
const defaultWidthHeightRatio = 1
const defaultQualityRatio = 0.5

@Injectable({
  providedIn: 'root'
})
export class CompressImageService {
  compress(file: File): Observable<File> {
    const imageType = file.type || 'image/jpg' || 'image/jpeg' || 'image/png' || 'image/gif' || 'image/apng' || 'image/avif' || 'image/svg+xml' || 'image/webp'
    const reader = new FileReader()
    reader.readAsDataURL(file)

    return Observable.create(observer => {
      reader.onload = ev => {
        const img = this.createImage(ev)
        const imgWH = img.width > img.height ? img.width : img.height
        let withHeightRatio = (imgWH > widthHeightMax) ? widthHeightMax/imgWH : defaultWidthHeightRatio
        let qualityRatio = (file.size > fileSizeMax) ? fileSizeMax/file.size : defaultQualityRatio
        img.onload = () => { 
          const elem = document.createElement('canvas')
          elem.width = img.width * withHeightRatio
          elem.height = img.height * withHeightRatio
          const ctx = <CanvasRenderingContext2D>elem.getContext('2d')
          ctx.drawImage(img, 0, 0, elem.width, elem.height)
          ctx.canvas.toBlob(
            blob => { 
              observer.next(new File(
                [blob],
                file.name,
                {
                  type: imageType,
                  lastModified: Date.now(),
                }
              ))
            },
            imageType,
            qualityRatio,
          )
        }
      }
      reader.onerror = error => observer.error(error)
    })
  }

  private createImage(ev) {
    let imageContent = ev.target.result
    const img = new Image()
    img.src = imageContent
    return img
  }
}