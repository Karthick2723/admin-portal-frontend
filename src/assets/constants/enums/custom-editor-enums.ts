export enum CustomEditorTemplate {
    LeftSideImg = 1,
    RightSideImg = 2,

    TextArea = 3,
    Image = 4
}

export enum CustomEditorSections {
    LeftSideImg = 1,
    RightSideImg = 2,

    TextArea = 3,
    Image = 4
}

export enum CustomEditorFieldPartitions {
    HalfPartitions = 1, //50*50 -> col-6 , col-6
    HalfOfQuater = 2, //70*30 -> col-8 , col-4
    FirstQuater = 3, //30*70 -> col-4 , col-8
}

export enum CustomEditorImgAlignment {
    Left = 1,
    Right = 2,
    Center = 3
}


export enum CustomEditorImgFieldPartitions {
    SingleImg = 1,
    DoubleImg = 2,
    TripleImg = 3
}

export enum CustomEditorImgResponsive {
    Thumbnail = 1,
    Rounded = 2,
    CutomSize = 3
}

export enum Status {
    OFF = 0,
    RESIZE = 1,
    MOVE = 2
}

export enum ModalType {
    INFO = 'info',
    WARN = 'warn'
}