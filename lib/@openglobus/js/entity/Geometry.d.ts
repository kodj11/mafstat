import { Entity } from "./Entity";
import { Extent } from "../Extent";
import { GeometryHandler } from "./GeometryHandler";
import { NumberArray4, Vec4 } from "../math/Vec4";
import { NumberArray2 } from "../math/Vec2";
import { NumberArray3 } from "../math/Vec3";
export declare enum GeometryTypeEnum {
    POINT = 1,
    LINESTRING = 2,
    POLYGON = 3,
    MULTIPOLYGON = 4,
    MULTILINESTRING = 5
}
export type CoordinatesType = NumberArray2 | NumberArray3;
export type IPointCoordinates = CoordinatesType;
export type ILineStringCoordinates = CoordinatesType[];
export type IPolygonCoordinates = CoordinatesType[][];
export type IMultiLineStringCoordinates = ILineStringCoordinates[];
export type IMultiPolygonCoordinates = IPolygonCoordinates[];
export type IGeometryCoordinates = IPointCoordinates | IPolygonCoordinates | IMultiPolygonCoordinates | ILineStringCoordinates | IMultiLineStringCoordinates;
export type GeometryTypeToCoordinates = {
    POINT: IPointCoordinates;
    LINESTRING: ILineStringCoordinates;
    POLYGON: IPolygonCoordinates;
    MULTIPOLYGON: IMultiPolygonCoordinates;
    MULTILINESTRING: IMultiLineStringCoordinates;
};
interface IGeometry<T extends keyof typeof GeometryTypeEnum = keyof typeof GeometryTypeEnum> {
    type: T;
    coordinates: GeometryTypeToCoordinates[T];
}
export interface IGeometryStyle {
    fillColor?: string | NumberArray4 | Vec4;
    lineColor?: string | NumberArray4 | Vec4;
    strokeColor?: string | NumberArray4 | Vec4;
    lineWidth?: number;
    strokeWidth?: number;
}
interface IGeometryStyleInternal {
    fillColor: Vec4;
    lineColor: Vec4;
    strokeColor: Vec4;
    lineWidth: number;
    strokeWidth: number;
}
export interface IGeometryParams<T extends keyof typeof GeometryTypeEnum = keyof typeof GeometryTypeEnum> {
    type?: T;
    coordinates?: GeometryTypeToCoordinates[T];
    style?: IGeometryStyle;
    visibility?: boolean;
}
declare class Geometry {
    static __counter__: number;
    __id: number;
    /**
     * Entity instance that holds this geometry.
     * @public
     * @type {Entity}
     */
    _entity: Entity | null;
    _handler: GeometryHandler | null;
    _handlerIndex: number;
    _polyVerticesHighMerc: number[];
    _polyVerticesLowMerc: number[];
    _polyVerticesLength: number;
    _polyIndexesLength: number;
    _polyVerticesHandlerIndex: number;
    _polyIndexesHandlerIndex: number;
    _lineVerticesHighMerc: number[];
    _lineVerticesLowMerc: number[];
    _lineVerticesLength: number;
    _lineOrdersLength: number;
    _lineIndexesLength: number;
    _lineColorsLength: number;
    _lineThicknessLength: number;
    _lineVerticesHandlerIndex: number;
    _lineOrdersHandlerIndex: number;
    _lineIndexesHandlerIndex: number;
    _lineThicknessHandlerIndex: number;
    _lineColorsHandlerIndex: number;
    protected _type: GeometryTypeEnum;
    _coordinates: IGeometryCoordinates;
    protected _extent: Extent;
    _style: IGeometryStyleInternal;
    protected _visibility: boolean;
    _pickingReady: boolean;
    constructor(options?: IGeometryParams);
    get id(): number;
    get type(): number;
    static getType(typeStr: keyof typeof GeometryTypeEnum): GeometryTypeEnum;
    /**
     * Returns geometry extent.
     @static
     @param {IGeometry} geometryObj - GeoJSON style geometry feature.
     @param {IGeometryCoordinates} outCoordinates - Geometry feature coordinates clone.
     @returns {Extent} -
     */
    static getExtent(geometryObj: IGeometry, outCoordinates: IGeometryCoordinates): Extent;
    /**
     * @todo ASAP need test for this method
     * @param geoJson
     * @returns {Geometry}
     */
    setGeometry(geoJson: IGeometry): Geometry;
    setFillColor(r: number, g: number, b: number, a?: number): Geometry;
    overlaps(extent: Extent): boolean;
    setFillColor4v(rgba: Vec4): Geometry;
    setStrokeColor(r: number, g: number, b: number, a?: number): Geometry;
    setLineColor(r: number, g: number, b: number, a?: number): Geometry;
    setStrokeColor4v(rgba: Vec4): Geometry;
    setLineColor4v(rgba: Vec4): Geometry;
    setStrokeOpacity(opacity: number): Geometry;
    setLineOpacity(opacity: number): Geometry;
    setStrokeWidth(width: number): Geometry;
    bringToFront(): Geometry;
    setLineWidth(width: number): Geometry;
    setFillOpacity(opacity: number): Geometry;
    setVisibility(visibility: boolean): Geometry;
    getVisibility(): boolean;
    remove(): void;
    getExtent(): Extent;
    getType(): number;
}
export { Geometry };
