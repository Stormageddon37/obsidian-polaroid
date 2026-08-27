# Polaroid

An Obsidian plugin that transforms embedded images into polaroid-style frames with handwritten captions.

## Features

- Polaroid frame styling with drop shadow
- Handwritten captions derived from image alt text or filename
- Slight random rotation for a scattered-on-desk look
- Hover effect that lifts and straightens the polaroid
- Push-pin decoration on embedded notes

## Usage

Embed an image normally in your note:

```
![[photo.png]]
```

The caption is generated from the filename (stripped of extension, dashes/underscores become spaces, title-cased). To set a custom caption, use alt text:

```
![[photo.png|My vacation photo]]
```

## Font

This plugin bundles the [Caveat](https://fonts.google.com/specimen/Caveat) font (OFL license) for handwritten-style captions. See `fonts/OFL.txt` for the font license.
