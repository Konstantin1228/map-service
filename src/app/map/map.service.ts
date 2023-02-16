import { Injectable } from '@angular/core';

import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import Vector from 'ol/layer/Vector';
import { Point } from 'ol/geom';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { newVectorLayersProps } from 'src/types';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  defaultLayers = [
    new TileLayer({
      source: new OSM({
        url: 'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=kDDc3ZruCL6UrC8cD4bp',
      }),
      visible: false,
      properties: {
        title: "satellitelMap"
      }
    }),
    new TileLayer({
      source: new OSM(),
      visible: true,
      properties: {
        title: "defaultMap"
      }
    })
  ]

  getDefaultLayers() {
    return this.defaultLayers
  }

  createNewVectorLayer(data: newVectorLayersProps) {
    const { vectorPosition, title, speed, well, longitude, latitude } = data

    return new Vector({
      source: new VectorSource({
        features: [
          new Feature({
            geometry: new Point(vectorPosition)
          })
        ],
      }),
      style: new Style({
        image: new Icon({
          crossOrigin: 'anonymous',
          src: 'https://i.ibb.co/G7rsG7Z/icons8-location-50-2.png',
          rotation: well * 0.0174533,
        }),
      }),
      properties: {
        title: title,
        speed: speed,
        well: well,
        longitude: longitude.toFixed(2),
        latitude: latitude.toFixed(2),
      }
    })
  }
}

