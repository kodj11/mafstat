import { Control, IControlParams } from "./Control";
import { Dialog } from '../ui/Dialog';
import { Slider } from "../ui/Slider";
import { ToggleButton } from "../ui/ToggleButton";
import { View } from '../ui/View';
import { AtmosphereParameters } from "../shaders/atmos";
interface IAtmosphereConfigParams extends IControlParams {
}
/**
 * Helps to set up atmosphere parameters.
 */
export declare class AtmosphereConfig extends Control {
    protected _toggleBtn: ToggleButton;
    protected _dialog: Dialog<null>;
    protected _panel: View<null>;
    $maxOpacity: HTMLElement | null;
    $minOpacity: HTMLElement | null;
    $rayleight: HTMLElement | null;
    $mie: HTMLElement | null;
    $height: HTMLElement | null;
    $bottomRadius: HTMLElement | null;
    $mieScatteringCoefficient: HTMLElement | null;
    $mieExtinctionCoefficient: HTMLElement | null;
    $rayleighScatteringCoefficientA: HTMLElement | null;
    $rayleighScatteringCoefficientB: HTMLElement | null;
    $rayleighScatteringCoefficientC: HTMLElement | null;
    $ozoneAbsorptionCoefficientA: HTMLElement | null;
    $ozoneAbsorptionCoefficientB: HTMLElement | null;
    $ozoneAbsorptionCoefficientC: HTMLElement | null;
    $sunAngularRadius: HTMLElement | null;
    $sunIntensity: HTMLElement | null;
    $groundAlbedo: HTMLElement | null;
    $ozoneDensityHeight: HTMLElement | null;
    $ozoneDensityWide: HTMLElement | null;
    protected _maxOpacity: Slider;
    protected _minOpacity: Slider;
    protected _rayleight: Slider;
    protected _mie: Slider;
    protected _height: Slider;
    protected _bottomRadius: Slider;
    protected _mieScatteringCoefficient: Slider;
    protected _mieExtinctionCoefficient: Slider;
    protected _rayleighScatteringCoefficientA: Slider;
    protected _rayleighScatteringCoefficientB: Slider;
    protected _rayleighScatteringCoefficientC: Slider;
    protected _ozoneAbsorptionCoefficientA: Slider;
    protected _ozoneAbsorptionCoefficientB: Slider;
    protected _ozoneAbsorptionCoefficientC: Slider;
    protected _sunAngularRadius: Slider;
    protected _sunIntensity: Slider;
    protected _groundAlbedo: Slider;
    protected _ozoneDensityHeight: Slider;
    protected _ozoneDensityWide: Slider;
    protected _parameters: AtmosphereParameters;
    constructor(options?: IAtmosphereConfigParams);
    oninit(): void;
    protected _update(): void;
}
export {};
