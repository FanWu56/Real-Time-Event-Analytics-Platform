import { randomUUID } from "crypto"
import { EventInput } from "../schemas/eventSchema"

export type StoredEvent = {
  id: string;
  projectId: string;
  eventName: string;
  userId?: string;
  properties: Record<string, unknown>;
  timestamp: string;
  receivedAt: string;
}

const events : StoredEvent[] = []


export function addEvent(input : EventInput, projectId: string){
    const now = new Date().toString()

    const event : StoredEvent = {
        id : randomUUID(),
        projectId : projectId,
        eventName : input.eventName,
        userId : input.userId,
        properties : input.properties,
        timestamp : input.timestamp ?? now,
        receivedAt : now
    }
 
    events.push(event)
    return event
}


export function getEventsByProject(projectId : string){
     const some_event = events.filter((event)=>projectId === event.projectId)
     return some_event
}


export function getEvents(){
   return events
}