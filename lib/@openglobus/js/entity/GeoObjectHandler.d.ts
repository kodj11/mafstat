import { TypedArray } from "../utils/shared";
import { EntityCollection } from "./EntityCollection";
import { GeoObject } from "./GeoObject";
import { Planet } from "../scene/Planet";
import { Vec3 } from "../math/Vec3";
import { Vec4 } from "../math/Vec4";
import { Quat } from "../math/Quat";
import { WebGLBufferExt, WebGLTextureExt } from "../webgl/Handler";
import { Object3d } from "../Object3d";
declare class InstanceData {
    isFree: boolean;
    _geoObjectHandler: GeoObjectHandler;
    geoObjects: GeoObject[];
    numInstances: number;
    _texture: WebGLTextureExt | null;
    _textureSrc: string | null;
    _objectSrc?: string;
    _sizeArr: number[] | TypedArray;
    _translateArr: number[] | TypedArray;
    _vertexArr: number[] | TypedArray;
    _positionHighArr: number[] | TypedArray;
    _positionLowArr: number[] | TypedArray;
    _qRotArr: number[] | TypedArray;
    _rgbaArr: number[] | TypedArray;
    _normalsArr: number[] | TypedArray;
    _indicesArr: number[] | TypedArray;
    _pickingColorArr: number[] | TypedArray;
    _visibleArr: number[] | TypedArray;
    _texCoordArr: number[] | TypedArray;
    _sizeBuffer: WebGLBufferExt | null;
    _translateBuffer: WebGLBufferExt | null;
    _vertexBuffer: WebGLBufferExt | null;
    _positionHighBuffer: WebGLBufferExt | null;
    _positionLowBuffer: WebGLBufferExt | null;
    _qRotBuffer: WebGLBufferExt | null;
    _rgbaBuffer: WebGLBufferExt | null;
    _normalsBuffer: WebGLBufferExt | null;
    _indicesBuffer: WebGLBufferExt | null;
    _pickingColorBuffer: WebGLBufferExt | null;
    _visibleBuffer: WebGLBufferExt | null;
    _texCoordBuffer: WebGLBufferExt | null;
    _buffersUpdateCallbacks: Function[];
    _changedBuffers: boolean[];
    constructor(geoObjectHandler: GeoObjectHandler);
    createTexture(image: HTMLCanvasElement | ImageBitmap | ImageData | HTMLImageElement): void;
    clear(): void;
    _deleteBuffers(): void;
    createVertexBuffer(): void;
    createVisibleBuffer(): void;
    createSizeBuffer(): void;
    createTranslateBuffer(): void;
    createTexCoordBuffer(): void;
    createPositionBuffer(): void;
    createRgbaBuffer(): void;
    createQRotBuffer(): void;
    createNormalsBuffer(): void;
    createIndicesBuffer(): void;
    createPickingColorBuffer(): void;
    refresh(): void;
    update(): void;
}
declare class GeoObjectHandler {
    static __counter__: number;
    protected __id: number;
    /**
     * Picking rendering option.
     * @public
     * @type {boolean}
     */
    pickingEnabled: boolean;
    protected _entityCollection: EntityCollection;
    _planet: Planet | null;
    protected _geoObjects: GeoObject[];
    protected _instanceDataMap: Map<string, InstanceData>;
    protected _instanceDataMapValues: InstanceData[];
    protected _dataTagUpdateQueue: InstanceData[];
    constructor(entityCollection: EntityCollection);
    initProgram(): void;
    setRenderNode(renderNode: Planet): void;
    setTextureTag(src: string, tag: string): void;
    setObjectSrc(src: string, tag: string): void;
    _updateInstanceData(object: Object3d, tag: string): void;
    protected _addGeoObjectToArray(geoObject: GeoObject): void;
    _displayPASS(): void;
    drawPicking(): void;
    protected _pickingPASS(): void;
    _loadDataTagTexture(tagData: InstanceData): Promise<void>;
    setQRotArr(tagData: InstanceData, tagDataIndex: number, qRot: Quat): void;
    setVisibility(tagData: InstanceData, tagDataIndex: number, visibility: boolean): void;
    setPositionArr(tagData: InstanceData, tagDataIndex: number, positionHigh: Vec3, positionLow: Vec3): void;
    setRgbaArr(tagData: InstanceData, tagDataIndex: number, rgba: Vec4): void;
    setPickingColorArr(tagData: InstanceData, tagDataIndex: number, color: Vec3): void;
    setScaleArr(tagData: InstanceData, tagDataIndex: number, scale: Vec3): void;
    setTranslateArr(tagData: InstanceData, tagDataIndex: number, translate: Vec3): void;
    protected _updateTag(dataTag: InstanceData): void;
    update(): void;
    _removeAll(): void;
    clear(): void;
    draw(): void;
    add(geoObject: GeoObject): void;
    remove(geoObject: GeoObject): void;
    _clearDataTagQueue(): void;
    _removeGeoObject(geoObject: GeoObject): void;
}
export { GeoObjectHandler, InstanceData };
