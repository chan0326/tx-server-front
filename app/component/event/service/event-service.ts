import { createAsyncThunk } from "@reduxjs/toolkit";
import { IEvent } from "../model/event";
import { AddEventAPI, deleteEventAPI, deleteEventsAPI, findEventByIdAPI, saveEventAPI } from "./event-api";



export const AddEvent: any =createAsyncThunk('/event/AddEvent',
    async(event:IEvent, {rejectWithValue})=>  await AddEventAPI(event)
    )

    export const deleteEvents = createAsyncThunk('/event/deleteEvents',
        async (ids: number[]) => await deleteEventsAPI(ids));

export const deleteEvent: any = createAsyncThunk('/event/deleteEvent',
    async (id: number) => await deleteEventAPI(id))

export const SaveEvent: any = createAsyncThunk('/event/SaveEvent',
    async (event: IEvent) => await saveEventAPI(event))


    
    export const findEventById: any = createAsyncThunk(
        'event/findEventById',
        async (id: number) => {
            const data: any = await findEventByIdAPI(id);
            return data
        }
    )