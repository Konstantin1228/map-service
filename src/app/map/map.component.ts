import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import Map from 'ol/Map';
import View from 'ol/View';
import Overlay from 'ol/Overlay';
import LayerGroup from 'ol/layer/Group';
import { transform } from 'ol/proj';
import { MapService } from './map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  constructor(private MapService: MapService) { }
  map!: Map

  isModalWindowActive: boolean = false
  isPopupActive: boolean = false
  currentPosition: number[] = []

  @ViewChild("menu") menu!: ElementRef
  @ViewChild("modalWindow") modalWindow!: ElementRef
  @ViewChild("popup") popup!: ElementRef

  popupData = { title: "", speed: 0, well: 0, latitude: 0, longitude: 0 }
  formData = { title: null, speed: null, well: null }

  setLayer(layer: string) {
    this.map.getLayers().getArray()[0].getLayersArray().forEach(el =>
      el.setVisible(el.get("title") === layer)
    )
  }

  addTarget(formEvent: NgForm) {
    if (formEvent.invalid) return

    const { title, speed, well } = formEvent.control.value
    let isUniqueName = true
    const vectorsLayers = this.map.getLayers()
    const vectorsLength = vectorsLayers.getLength()

    vectorsLayers.forEach((el, idx) => {
      const vectorName = el.get("title");
      if (vectorsLength === idx + 1 && vectorName === title) {
        formEvent.form.controls['title'].setErrors({ 'incorrectTitle': "Имя должно быть уникальным!", })
        isUniqueName = false
        return
      }
    })

    if (!isUniqueName) return
    formEvent.reset()
    this.isModalWindowActive = false
    // this.menu.nativeElement.style.display = "none"

    const newMarker = this.MapService.createNewVectorLayer({
      vectorPosition: this.currentPosition,
      title, speed, well,
      longitude: this.popupData.longitude, latitude: this.popupData.latitude
    })

    this.map.addLayer(newMarker)
  }

  contextMenu(e: MouseEvent) {
    e.preventDefault()
    const { pageX, pageY } = e

    this.currentPosition = this.map.getEventCoordinate(e)

    const point = this.map.getCoordinateFromPixel([pageX, pageY])
    const lonlat = transform(point, 'EPSG:3857', 'EPSG:4326')
    this.popupData.longitude = lonlat[0];
    this.popupData.latitude = lonlat[1];

    this.menu.nativeElement.style.display = "block"
    this.menu.nativeElement.style.top = pageY + "px"
    this.menu.nativeElement.style.left = pageX + "px"

    this.isModalWindowActive = false
  }

  activePopup() {
    this.menu.nativeElement.style.display = "none"
    this.isModalWindowActive = !this.isModalWindowActive
  }

  disappearContext() {
    this.menu.nativeElement.style.display = "none"
    this.isModalWindowActive = false
  }

  ngAfterViewInit() {
    const overlay = new Overlay({
      element: this.popup.nativeElement,
    });

    const layers = this.MapService.getDefaultLayers()

    this.map = new Map({
      layers: [
        new LayerGroup({
          layers
        })
      ],
      overlays: [overlay],
      target: 'map',
      view: new View({
        center: [0, 0],
        zoom: 2,
        maxZoom: 18,
        minZoom: 3
      }),
    });

    this.map.on("pointermove", (evt) => {
      const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        const title = layer.get("title")
        const speed = layer.get("speed")
        const well = layer.get("well")
        const longitude = layer.get("longitude")
        const latitude = layer.get("latitude")

        this.popupData = { title, speed, well, longitude, latitude }

        overlay.setPosition(evt.coordinate)
        return true
      })

      if (!feature) {
        overlay.setPosition(undefined)
      }
    })
  }
}
