import { z } from 'zod';
import * as fs from 'fs';
import * as exifr from 'exifr';
import * as csv from 'csvtojson';
import * as path from 'path';
import { Athlete, TrackEvent, Image } from './image.entity';
import sizeOf from 'image-size';

const captionSchema = z.object({
  FirstName: z.string(),
  LastName: z.string(),
  Rank: z.string(),
  Bib: z.string(),
  Lane: z.string(),
  Nat: z.string(),
  Time: z.string(),
  Windspeed: z.string().optional(),
  React: z
    .object({
      Time: z.string(),
    })
    .optional(),
});

type CaptionEntry = z.infer<typeof captionSchema>;

const iptcSchema = z.object({
  Headline: z.string(), // Time of start
  Caption: z.string().min(1), // Results, Reaction time, Wind speed as csv
  ObjectName: z.string().min(1), // Title
});

export async function parseIptcFromFile(file: string): Promise<Image | null> {
  const data = fs.readFileSync(file);
  const lastModified = fs.statSync(file).mtime;
  const iptc = await exifr.parse(data, { iptc: true });
  const valitatedIptc = await iptcSchema.safeParseAsync(iptc);
  if (!valitatedIptc.success) {
    return null;
  }
  const parsedCaption = await parseIptcCaption(valitatedIptc.data.Caption);
  const title = valitatedIptc.data.ObjectName.trim();
  const timestamp = valitatedIptc.data.Headline;
  const windSpeed = getWindSpeedFromCaption(parsedCaption);
  const athletes = getAthletesFromCaption(parsedCaption);
  const event = getEventFromTitle(title);
  const { width, height } = sizeOf(file);
  return {
    lastModified,
    filename: path.parse(file).base,
    eventId: path.basename(path.dirname(file)),
    title,
    timestamp:
      timestamp == '' || timestamp == '0'
        ? 0
        : new Date(`1970-01-01T${timestamp}Z`).getTime() - 3600000,
    athletes,
    windSpeed,
    event,
    width,
    height,
  };
}

export async function parseIptcCaption(caption: string) {
  const parsedCsv = await csv({
    delimiter: ';',
  }).fromString(caption);
  return parsedCsv
    .map((item) => {
      return captionSchema.safeParse(item);
    })
    .filter((item) => item.success)
    .map((item) => {
      if (item.success) {
        return item.data;
      }
      // This should never happen
      return null;
    }) as CaptionEntry[];
}

export function getWindSpeedFromCaption(captionEntries: CaptionEntry[]) {
  const windData = captionEntries.find(
    (item) => item.Rank == '' && item.Windspeed && item.Windspeed != '',
  );
  return windData && windData.Windspeed != undefined
    ? windData.Windspeed
    : null;
}

export function getAthletesFromCaption(
  captionEntries: CaptionEntry[],
): Athlete[] {
  return captionEntries
    .filter(
      (item) =>
        item.Rank != '' &&
        !isNaN(Number(item.Rank)) &&
        !isNaN(Number(item.Lane)) &&
        !isNaN(Number(item.Bib)),
    )
    .map((item) => {
      return {
        rank: Number(item.Rank),
        lane: Number(item.Lane),
        bib: Number(item.Bib),
        nationality:
          item.Nat.length == 0
            ? null
            : item.Nat.split('|').length > 1
              ? item.Nat.split('|')[1].trim()
              : item.Nat.trim(),
        firstname: item.FirstName,
        lastname: item.LastName,
        time: item.Time,
        reactionTime: item.React && item.React.Time ? item.React.Time : null,
      };
    });
}

export function getEventFromTitle(title: string): TrackEvent | null {
  const regex = /(\d+\s?x?\d+\s?m)/g;
  const matches = title.match(regex);
  if (matches) {
    let event = matches[0];
    const relay = event.includes('x');
    if (relay) {
      const relayCount = Number(event.split('x')[0]);
      const relaySingleDistance = relay
        ? Number(event.split('x')[1].replace('m', ''))
        : 0;
      const relayDistance = relayCount * relaySingleDistance;
      return {
        event,
        relay: relayCount,
        distance: relayDistance,
      };
    }
    const distance = Number(event.replace('m', ''));
    if (isHurdlesEvent(title)) {
      event += 'H';
    }
    if (isSteeplechaseEvent(title)) {
      event += 'SC';
    }
    return {
      event,
      relay: null,
      distance: distance,
    };
  }
  return null;
}

export function isHurdlesEvent(title: string): boolean {
  title = title.toLowerCase();
  return title.includes('hürden') || title.includes('hurdles');
}

export function isSteeplechaseEvent(title: string): boolean {
  title = title.toLowerCase();
  return title.includes('steeplechase') || title.includes('hindernis');
}
