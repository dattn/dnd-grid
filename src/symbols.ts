import { InjectionKey, Ref, ShallowRef } from "vue"
import { Layout, LayoutElement } from "./tools/layout"

export type ComputedCellSize = {
    width: number,
    height: number,
    spacing: number,
}

export type ContainerProvision = {
    layout: Readonly<ShallowRef<Layout>>,
    mode: Readonly<Ref<string>>,
    disabled: Readonly<Ref<boolean>>,
    isResizable: Readonly<Ref<boolean>>,
    isDraggable: Readonly<Ref<boolean>>,
    computedCellSize: Readonly<Ref<ComputedCellSize>>,
    startLayout: () => void,
    stopLayout: () => void,
    getBox: (id: any) => LayoutElement | undefined,
    updateBox: (id: any, data: Partial<LayoutElement>) => Layout,
    canStartDrag: (evt: any) => boolean,
    canStartResize: (evt: any) => boolean,
    addResizeHandles: Readonly<Ref<boolean>>,
}

export const ContainerSymbol = Symbol('DndGridContainer') as InjectionKey<ContainerProvision>