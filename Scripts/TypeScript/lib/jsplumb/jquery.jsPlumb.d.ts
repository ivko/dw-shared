// Type definitions for jsPlumb 1.3.16 jQuery adapter
// Project: http://jsplumb.org
// Definitions by: Steve Shearn <https://github.com/shearnie/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/// <reference path="../jquery/jquery.d.ts"/>

declare var jsPlumb: jsPlumbInstance;

declare var jsPlumbUtil: jsPlumbUtil;

interface jsPlumbInstance {
    revalidate(id: string): void;
    setRenderMode(renderMode: string): string;
    bind(event: string, callback: (e: any, originalEvent?: any) => void ): void;
    unbind(event?: string): void;
    ready(callback: () => void): void;
    importDefaults(defaults: Defaults): void;
    Defaults: Defaults;
    restoreDefaults(): void;
    addClass(el: any, clazz: string): void;
    addEndpoint(ep: string, params?: ConnectParams, referenceParams?: ConnectParams): any;
    removeClass(el: any, clazz: string): void;
    hasClass(el: any, clazz: string): void;
    draggable(el: string, options?: DragOptions): jsPlumbInstance;
    draggable(ids: string[], options?: DragOptions): jsPlumbInstance;
    connect(connection: ConnectParams, referenceParams?: ConnectParams): Connection;
    makeSource(el: string, options: SourceOptions): jsPlumbInstance;
    unmakeSource(id: string): void;
    makeTarget(el: string, options?: TargetOptions): void;
    repaintEverything(): void;
    deleteEveryConnection(params?: any): void;
    detachAllConnections(el: string): void;
    removeAllEndpoints(el: string, recurse?: boolean): jsPlumbInstance;
    removeAllEndpoints(el: Element, recurse?: boolean): jsPlumbInstance;
    select(params?: SelectParams): Connections;
    getConnections(options?: any, flat?: any): any[];
    getAllConnections(): any;
    deleteEndpoint(uuid: string, doNotRepaintAfterwards?: boolean): jsPlumbInstance;
    deleteEndpoint(endpoint: Endpoint, doNotRepaintAfterwards?: boolean): jsPlumbInstance;
    repaint(el: string): jsPlumbInstance;
    repaint(el: Element): jsPlumbInstance;
    getInstance(): jsPlumbInstance;
    getInstance(defaults: Defaults): jsPlumbInstance;
    getInstanceIndex(): number;
    setContainer(elemement: Element): void;
    getContainer(): HTMLElement;
    deleteConnection(connection: Connection, params?: any): void;
    remove(elementId: string): void;
    getEndpoints(el: string): Endpoint[];
    SVG: string;
    CANVAS: string;
    VML: string;
    connectorsInitialized: boolean;
    Connectors: {
        AbstractConnector(params:any): any;
    };
    addGroup(params: any): any;
    addToGroup(groupId: string, el: HTMLElement): void;
    registerConnectorType(connector: any, name: string): void;
    registerConnectionType(typeName: string, settings: Object): void;
    setZoom(zoom: number): boolean;
    addToDragSelection(id: any): void;
    clearDragSelection(): void;
}

interface jsPlumbUtil {
    extend(child, parent): any;
}

interface Defaults {
    Endpoint?: any[];
    PaintStyle?: PaintStyle;
    HoverPaintStyle?: PaintStyle;
    ConnectionsDetachable?: boolean;
    ReattachConnections?: boolean;
    ConnectionOverlays?: any[][];
    Container?: any; // string(selector or id) or element
    DragOptions?: DragOptions;
}

interface PaintStyle {
    strokeStyle: string;
    lineWidth: number;
}

interface ArrowOverlay {
    location: number;
    id: string;
    length: number;
    foldback: number;
}

interface LabelOverlay {
    label: string;
    id: string;
    location: number;
}

interface Connections {
    detach(): void;
    each(callback: (connection: Connection) => void): any;
    length: number;
    removeClass: any;
}

interface ConnectParams {
    parameters?: any;
    source?: any; // string, element or endpoint
    target?: any; // string, element or endpoint
    detachable?: boolean;
    deleteEndpointsOnDetach?: boolean;
    connectorOverlays?: any,
    endPoint?: string;
    anchor?: any;
    uuid?: string;
    uuids?: any[];
    anchors?: any[];
    label?: string;
    type?: string;
}

interface DragOptions {
    containment?: string;
    Container?: string,
    DragOptions?: any,
    grid?: any[],
    stop?: () => void,
    start?: (params: any) => void,
    drag?: (params: any) => void
}

interface SourceOptions {
    parent: string;
    endpoint?: string;
    anchor?: any;
    connector?: any[];
    connectorStyle?: PaintStyle;
}
interface TargetOptions {
    isTarget?: boolean;
    isSource?: boolean;
    connector?: any;
    overlays?: any;
    connectorOverlays?: any;
    maxConnections?: number;
    uniqueEndpoint?: boolean;
    deleteEndpointsOnDetach?: boolean;
    endpoint?: any;
    dropOptions?: DropOptions;
    anchor?: any;
}

interface DropOptions {
    hoverClass: string;
}

interface SelectParams {
    scope?: string;
    source: string;
    target: string;
}

interface Connection {
    setDetachable(detachable: boolean): void;
    setParameter<T>(name: string, value: T): void;
    getOverlay(name: string): any;
    showOverlay(name: string): any;
    hideOverlay(name: string): any;
    endpoints: Endpoint[];
    bind(event: string, callback: any): void;
    id: string;
    setGuid: string;
    sourceId: string;
    targetId: string;
    removeOverlay(name: string): void;
    connector: Connector;
    addClass(className: string): void;
    canvas: HTMLElement;
}

interface Connector {
    _super: any;
    getSegments(): any[];
    setSegments(segs:any[]): void;
    currentConnectionId: string;
    connectionSegments: Array<any>;
    canvas: HTMLElement;
}

interface Endpoint {
    anchor: Anchor; 
}
interface Anchor {
    x: number;
    y: number;
    orientation: number[];
    offsets: number[];
}
