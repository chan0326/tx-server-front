"use client";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable, DropArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { EventSourceInput } from '@fullcalendar/core/index.js';
import { useDispatch, useSelector } from 'react-redux';
import { IEvent } from '@/app/component/event/model/event';
import { SaveEvent, deleteEvent, deleteEvents, findEventById } from '@/app/component/event/service/event-service';
import { getEventById } from '@/app/component/event/service/event-slice';
import { NextPage } from 'next';
import { all } from 'axios';

const CalendarPage: NextPage = ({ params }: any) => {
  const dispatch = useDispatch();
  const getEvent: IEvent[] = useSelector(getEventById);

  const [events, setEvents] = useState([
    { title: '출석', id: '1' },
    { title: 'event 2', id: '2' },
    { title: 'event 3', id: '3' },
  ]);
  const [allEvents, setAllEvents] = useState<IEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState<IEvent>({
    title: '',
    start: '',
    end: '',
    allDay: false,
    id: 0,
    userId: params.id,
  });

  useEffect(() => {
    const draggableEl = document.getElementById('draggable-el');
    if (draggableEl && !draggableEl.hasAttribute('data-initialized')) {
      new Draggable(draggableEl, {
        itemSelector: '.fc-event',
        eventData(eventEl) {
          const title = eventEl.getAttribute('title');
          const id = eventEl.getAttribute('data');
          const start = eventEl.getAttribute('start');
          const end = eventEl.getAttribute('end');
          return { title, id, start, end };
        },
      });
      draggableEl.setAttribute('data-initialized', 'true');
    }

    dispatch(findEventById(params.id))
      .then((data: any) => {
        if (Array.isArray(data.payload)) {
          console.log('Fetched events:', data.payload.map((event: IEvent) => event.startTime));
          const eventsWithStart = data.payload.map((event: IEvent) => ({
            ...event,
            start: event.startTime ? new Date(event.startTime).toISOString() : '',
            end: event.endTime ? new Date(event.endTime).toISOString() : '',
          }));
          setAllEvents(eventsWithStart);
        } else {
          console.error('Error: fetched events are not an array:', data.payload);
        }
      })
      .catch((error: any) => {
        console.error('Error fetching events:', error);
      });
  }, [params.id, dispatch]);

  function handleDateClick(arg: { date: Date; allDay: boolean }) {
    const isoString = arg.date.toISOString();
    setNewEvent({ ...newEvent, start: isoString, end: isoString, allDay: arg.allDay, id: new Date().getTime() });
    setShowModal(true);
  }

  function addEvent(data: DropArg) {
    const event = {
      ...newEvent,
      start: data.date.toISOString(),
      end: data.date.toISOString(),
      title: data.draggedEl.innerText,
      allDay: data.allDay,
      id: new Date().getTime(),
    };
    setAllEvents((prevEvents) => [...prevEvents, event]);
    handleSaveEvent(event);
  }

  function handleDeleteModal(data: { event: { id: string } }) {
    setShowDeleteModal(true);
    setIdToDelete(Number(data.event.id));
  }

  function handleDelete() {
    if (idToDelete !== null) {
      handledeleteEvent(idToDelete);
      setAllEvents(allEvents.filter((event) => Number(event.id) !== Number(idToDelete)));
      setShowDeleteModal(false);
      setIdToDelete(null);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewEvent({
      ...newEvent,
      [e.target.name]: e.target.value,
    });
  };

  const handledeleteEvent = (eventId: number) => {
    dispatch(deleteEvent(eventId))
      .then((res: any) => {
        alert('이벤트 삭제 완료');
        console.log('delete event:', res);
      })
      .catch((err: any) => {
        console.log('실패', err);
      });
  };

  const handleSaveEvent = (event: IEvent) => {
    const eventToSave = {
      ...event,
      startTime: event.start ? new Date(event.start) : undefined,
      endTime: event.end ? new Date(event.end) : undefined,
    };

    dispatch(SaveEvent([eventToSave]))
      .then((res: any) => {
        alert('이벤트 저장 완료');
        console.log('Saved event:', res);
      })
      .catch((err: any) => {
        console.log('실패', err);
      });
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const event = {
      ...newEvent,
      startTime: newEvent.start,
      endTime: newEvent.end,
      allDay: false,
    };
    setAllEvents((prevEvents) => [...prevEvents, event]);
    handleSaveEvent(event);
    setShowModal(false);
    setNewEvent({
      title: '',
      start: '',
      end: '',
      allDay: false,
      id: 0,
      userId: params.id,
    });
  }

  

  return (
    <>
      
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="grid grid-cols-10">
          <div className="col-span-8">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'resourceTimelineWeek, dayGridMonth,timeGridWeek',
              }}
              events={allEvents as EventSourceInput}
              nowIndicator={true}
              editable={true}
              droppable={true}
              selectable={true}
              selectMirror={true}
              dateClick={handleDateClick}
              drop={addEvent}
              eventClick={handleDeleteModal}
            />
          </div>
          <div id="draggable-el" className="ml-8 w-full border-2 p-2 rounded-md mt-16 lg:h-1/2 bg-violet-50">
            <h1 className="font-bold text-lg text-center">Drag Event</h1>
            {events.map((event) => (
              <div
                className="fc-event border-2 p-1 m-2 w-full rounded-md ml-auto text-center bg-white"
                title={event.title}
                key={event.id}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>

        <Transition.Root show={showDeleteModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowDeleteModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel
                    className="relative transform overflow-hidden rounded-lg
                   bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                  >
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div
                          className="mx-auto flex h-12 w-12 flex-shrink-0 items-center 
                          justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                        >
                          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                            Delete event
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">Are you sure you want to delete this event?</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 
                        px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={handleDelete}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md 
                        bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 
                        ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setShowDeleteModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        <Transition.Root show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <form onSubmit={handleSubmit}>
                      <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                              Add event
                            </Dialog.Title>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="title"
                                value={newEvent.title}
                                onChange={handleChange}
                                className="border rounded-md p-2 w-full"
                                placeholder="Event Title"
                              />
                            </div>
                            <div className="mt-2">
                              <input
                                type="datetime-local"
                                name="start"
                                value={newEvent.start}
                                onChange={handleChange}
                                className="border rounded-md p-2 w-full"
                              />
                            </div>
                            <div className="mt-2">
                              <input
                                type="datetime-local"
                                name="end"
                                value={newEvent.end}
                                onChange={handleChange}
                                className="border rounded-md p-2 w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 sm:ml-3 sm:w-auto"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={() => setShowModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </main>
    </>
  );
};

export default CalendarPage;
