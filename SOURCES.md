# Source Documentation

This document pertains to the implementation of sources which can be added to ADX Level Browser.

Sources are REST-ful HTTP APIs providing to ADX Level Browser the ability to search levels and download their individual components.

## Object Definitions

The only object/structure that needs a definition is the `Song` (will soon be referred to as `Level`) object. The bare minimum needed to conform to the `Song` interface are the following string values: `id`, `title`, and `artist`. See the full interface definition [here](./src/types/index.ts).

## Required Interface

If you want to host a source for your levels, make sure your API adheres to the interface described below. It is inspired by the API of [Majdata.net](https://majdata.net).

- `/list?page={page}&search={search}`
  - `{page}` is optional, but when provided must be an integer.
    - If `{page}` is not provided, returns **all levels**  without pagination.
    - If `{page}` is provided, but is past the last "page index" containing any songs (implementation-defined), return an **empty array.**
  - `{search}` is optional, but when provided, should filter `Song` objects by their `title`, `artist`, or `designer`.
  - **Returns:** a JSON array of Song objects.
- `/{id}/track`
  - `{id}` is the value of the `id` field of a `Song` object.
  - **Returns:** an MP3 file containing the song's audio track.
- `/{id}/image`
  - `{id}` is the value of the `id` field of a `Song` object.
  - **Returns:** a PNG or JPEG file containing the song's background image.
- `/{id}/chart`
  - `{id}` is the value of the `id` field of a `Song` object.
  - **Returns:** a plaintext file containing the song's [simai](https://w.atwiki.jp/simai/) chart data.
- `/{id}/video`
  - `{id}` is the value of the `id` field of a `Song` object.
  - **Returns:** an MP4 file containing the song's background video.
