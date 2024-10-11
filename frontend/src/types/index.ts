/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Athlete {
  bib: number;
  firstname: string;
  lane: number;
  lastname: string;
  nationality: string;
  rank: number;
  reactionTime: string;
  time: string;
}

export interface Event {
  /** @format date-time */
  createdAt: string;
  /** @format date-time */
  date: string;
  id: string;
  name: string;
  location: string;
  /** @format date-time */
  updatedAt: string;
}

export interface Image {
  athletes: Athlete[];
  event: TrackEvent;
  eventId: string;
  filename: string;
  timestamp: number;
  title: string;
  windSpeed: string;
  width: number;
  height: number;
}

export interface TrackEvent {
  distance: number;
  event: string;
  relay: number;
}
