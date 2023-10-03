import { z } from "zod";
import fs from "fs";
import exifr from "exifr";
import csv from "csvtojson";
import path from "path";
import type { Athlete, Image } from "~/types";

const captionSchema = z.object({
  FirstName: z.string(),
  LastName: z.string(),
  Rank: z.string(),
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
  const iptc = await exifr.parse(data, { iptc: true });
  const valitatedIptc = await iptcSchema.safeParseAsync(iptc);
  if (!valitatedIptc.success) {
    return null;
  }
  const parsedCaption = await parseIptcCaption(valitatedIptc.data.Caption);
  const title = valitatedIptc.data.ObjectName;
  const timestamp = valitatedIptc.data.Headline;
  const windSpeed = getWindSpeedFromCaption(parsedCaption);
  const athletes = getAthletesFromCaption(parsedCaption);
  return {
    filename: path.parse(file).base,
    title,
    timestamp:
      timestamp == "" || timestamp == "0" ? 0 : new Date(`1970-01-01T${timestamp}Z`).getTime(),
    athletes,
    windSpeed,
  };
}

export async function parseIptcCaption(caption: string) {
  const parsedCsv = await csv({
    delimiter: ";",
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
    (item) => item.Rank == "" && item.Windspeed && item.Windspeed != ""
  );
  return windData && windData.Windspeed != undefined
    ? windData.Windspeed
    : null;
}

export function getAthletesFromCaption(
  captionEntries: CaptionEntry[]
): Athlete[] {
  return captionEntries
    .filter((item) => item.Rank != "" && !isNaN(Number(item.Rank)))
    .map((item) => {
      return {
        rank: Number(item.Rank),
        firstname: item.FirstName,
        lastname: item.LastName,
        time: item.Time,
        reactionTime: item.React && item.React.Time ? item.React.Time : null,
      };
    });
}
