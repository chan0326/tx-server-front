export interface IEvent{
    title?: string, 
    allDay?: boolean, 
    endTime?: Date | string,
    id?: number,
    userId?: number,
    startTime?: Date | string,
    start?: Date | string,
    end?: Date | string,
    array?: IEvent[],
    json?:IEvent
}