export class UIBuilder{

    static newAppContainer(domElements:Map<string,HTMLElement>, applicationID:any):HTMLElement {
        let element =  document.createElement('div');
        element.id =  `appContainer-${applicationID}`;
        domElements.set('appContainer', element as HTMLElement);
        return element;
    }

    static newPreview(domElements:Map<string,HTMLElement>, applicationID:any):HTMLElement {
        let element =  document.createElement('div');
        element.id =  `preview-${applicationID}`;
        domElements.set('preview', element as HTMLElement);
        return element;
    }

    static newTerminal(domElements:Map<string,HTMLElement>, applicationID:any):HTMLElement {
        let element =  document.createElement('div');
        element.id =  `terminal-${applicationID}`;
        domElements.set('terminal', element as HTMLElement);
        return element;
    }

    static newFrame(domElements:Map<string,HTMLElement>, applicationID:any, src:string='loading.html'):HTMLIFrameElement {
        let element =  document.createElement('iframe');
        element.id =  `frame-${applicationID}`;
        element.src =  `${src}`;
        domElements.set('frame', element as HTMLElement);
        return element;
    }

    static newEditor(domElements:Map<string,HTMLElement>, applicationID:any, value:string='loading editor...'):HTMLTextAreaElement {
        let element =  document.createElement('textarea');
        element.id =  `editor-${applicationID}`;
        element.value =  `${value}`;
        domElements.set('editor', element as HTMLElement);
        return element;
    }

    static build(domElements: Map<string, any>, applicationID: string,parent: HTMLElement ):any {
        parent = parent ? parent : document.querySelector('body') as HTMLElement;
        let appContainer = UIBuilder.newAppContainer(domElements, applicationID)
        let terminal = UIBuilder.newTerminal(domElements, applicationID)
        let preview = UIBuilder.newPreview(domElements, applicationID)
        let frame = UIBuilder.newFrame(domElements, applicationID, 'loading.html')
        let editor = UIBuilder.newEditor(domElements, applicationID)
  
        appContainer.appendChild(preview);
        appContainer.appendChild(frame);
        appContainer.appendChild(editor);
        appContainer.appendChild(terminal);
        parent.appendChild(appContainer);
        return { appContainer, terminal, preview, frame, editor}
    }

    


}