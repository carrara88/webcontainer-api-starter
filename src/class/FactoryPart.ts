// src/class/FactoryPart.ts
import { IEnvironment } from "./Environment";

export type StatusEvent = (status: string, value: boolean, reason?:any) => void;

export class FactoryPart {

    private status: Map<string, boolean> = new Map();//@var status used to map status booleans
    statusEvents: StatusEvent[] = [];
    environment!: IEnvironment;//@var environment used store parent environmant

    /**
     * used by Environmant on constructor
     * @param environment:IEnvironment parent Environmant
     * @returns void
     */

    constructor() {
        this.addStatusEvent((status: string, value: boolean, reason?:any) => { console.log(this.constructor.name, status, value, reason) });
    }

    public setEnvironment(environment: IEnvironment): this {
        this.environment = environment;
        return this;
    }

    addStatusEvent(statusEvent: StatusEvent) {
        this.statusEvents.push(statusEvent);
    }
    /**
     * used to set a specific object status on status:Map<string, any>
     * return void
     * @param status:string status key
     * @param value:boolean status value
     * @param reason:any status reason
     * @returns any
     */
    protected changeStatus(status: string, value: boolean, reason?:any) {
        this.status.set(status, value);
        this.statusEvents.forEach(callback => {
            callback(status,value,reason);
        });
    }
    /**
     * used to get a specific object status from status:Map<string, any>
     * return false if not found
     * @param status:string status key
     * @returns boolean
     */
    public getStatus(status: string): boolean {
        let currentStatus = this.status.get(status)
        return (currentStatus != undefined) ? currentStatus : false;
    }
    /**
     * used to get status list from status:Map<string, any>
     * return false if not found
     * @returns `${key}:${currentStatus}`[]
     */
    public listStatus(): string[] {
        let list: string[] = [];
        this.status.forEach((currentStatus: boolean, key: string) => {
            list.push(`${key}:${currentStatus}`);
        })
        console.log(list)
        return list;
    }
}