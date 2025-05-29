// /lib/videoUtils.ts
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import path from 'path'
import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'

// Set ffmpeg path
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath)
}

interface VideoInfo {
  duration: number
  width: number
  height: number
  size: number
}

interface ThumbnailOptions {
  timeOffset?: number // Time in seconds to capture thumbnail
  width?: number
  height?: number
  quality?: number // 1-100
}

/**
 * Generate thumbnail from video file
 */
export async function generateVideoThumbnail(
  videoPath: string,
  outputPath: string,
  options: ThumbnailOptions = {}
): Promise<string> {
  const {
    timeOffset = 1, // Capture at 1 second by default
    width = 320,
    height = 240,
    quality = 80
  } = options

  return new Promise((resolve, reject) => {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    if (!existsSync(outputDir)) {
      mkdir(outputDir, { recursive: true }).catch(reject)
    }

    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timeOffset],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: `${width}x${height}`
      })
      .on('end', () => {
        resolve(outputPath)
      })
      .on('error', (err) => {
        console.error('Error generating thumbnail:', err)
        reject(err)
      })
  })
}

/**
 * Get video information (duration, dimensions, etc.)
 */
export async function getVideoInfo(videoPath: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }

      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video')
      
      if (!videoStream) {
        reject(new Error('No video stream found'))
        return
      }

      resolve({
        duration: metadata.format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        size: metadata.format.size || 0
      })
    })
  })
}

/**
 * Validate video file
 */
export async function validateVideo(
  filePath: string,
  maxDuration: number = 300, // 5 minutes default
  maxSize: number = 50 * 1024 * 1024 // 50MB default
): Promise<{ valid: boolean; error?: string; info?: VideoInfo }> {
  try {
    const info = await getVideoInfo(filePath)

    if (info.duration > maxDuration) {
      return {
        valid: false,
        error: `Video duration (${Math.round(info.duration)}s) exceeds maximum allowed (${maxDuration}s)`
      }
    }

    if (info.size > maxSize) {
      return {
        valid: false,
        error: `Video size (${Math.round(info.size / 1024 / 1024)}MB) exceeds maximum allowed (${Math.round(maxSize / 1024 / 1024)}MB)`
      }
    }

    return { valid: true, info }

  } catch (error) {
    return {
      valid: false,
      error: `Invalid video file: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Compress video (optional - for reducing file size)
 */
export async function compressVideo(
  inputPath: string,
  outputPath: string,
  quality: 'low' | 'medium' | 'high' = 'medium'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const qualitySettings = {
      low: { crf: 28, preset: 'fast' },
      medium: { crf: 23, preset: 'medium' },
      high: { crf: 18, preset: 'slow' }
    }

    const settings = qualitySettings[quality]

    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .addOptions([
        `-crf ${settings.crf}`,
        `-preset ${settings.preset}`,
        '-movflags +faststart' // Optimize for web streaming
      ])
      .output(outputPath)
      .on('end', () => {
        resolve(outputPath)
      })
      .on('error', (err) => {
        console.error('Error compressing video:', err)
        reject(err)
      })
      .run()
  })
}