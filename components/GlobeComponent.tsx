'use client'

import { useEffect, useRef, useState } from 'react'
import "../css/og.css"

interface BillboardData {
  src: string;
  size: [number, number];
  offset: [number, number];
}

interface PointData {
  name: string;
  lon: number;
  lat: number;
  billboard: BillboardData;
}

export default function GlobeComponent() {
  const globeRef = useRef<HTMLDivElement>(null)
  const [globe, setGlobe] = useState<any>(null)
  

  useEffect(() => {
    let isMounted = true

    const initGlobe = async () => {
      if (!globeRef.current || globe) return

      const { Globe, RgbTerrain, XYZ, Entity, LonLat, wgs84, Vector, control } = await import("@/lib/@openglobus/og.esm.js")
      let points = [];

      try {
          const response = await fetch('https://raw.githubusercontent.com/kodj11/maf_comp/refs/heads/main/points.json');
          const pointsData = await response.json();

          points = pointsData.map((point: PointData) => {
              const coords = new LonLat(point.lon, point.lat);
              return new Entity({
                  'name': point.name,
                  'lonlat': coords,
                  'billboard': {
                      'src': point.billboard.src,
                      'size': point.billboard.size,
                      'offset': point.billboard.offset,
                      'alignedAxis': wgs84.lonLatToCartesian(coords).normalize()
                  }
              });
          });
      } catch (error) {
          console.error('Ошибка при загрузке точек:', error);
      }

      let pointLayer = new Vector("pointLayer", {
          'clampToGround': true,
          'entities': points,
          'async': false,
          'nodeCapacity': points.length
      });
      let osm = new XYZ("OpenStreetMap", {
        isBaseLayer: true,
        url: "//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        visibility: true,
        attribution: 'Data @ OpenStreetMap contributors, ODbL'
    });

      if (isMounted) {
        const newGlobe = new Globe({
          target: globeRef.current,
          name: "Earth",
          terrain: new RgbTerrain(),
          layers: [osm, pointLayer],
          resourcesSrc: "../lib/@openglobus/res",
          fontsSrc: "../lib/@openglobus/res/fonts"
        })
        
        setGlobe(newGlobe)
      }
    }

    initGlobe()

    return () => {
      isMounted = false
      if (globe && typeof globe.destroy === 'function') {
        globe.destroy()
      }
    }
  }, [globe])

  return <div ref={globeRef} style={{ width: '100%', height: '100%' }} />
}