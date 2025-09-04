/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response, NextFunction } from "express";

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime(); // request start time
  const chunks: Buffer[] = [];

  // Monkey patch res.write
  const originalWrite = res.write;
  res.write = function (chunk: any, encoding?: BufferEncoding | ((error: Error | null | undefined) => void), callback?: (error: Error | null | undefined) => void): boolean {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return originalWrite.call(res, chunk, encoding as BufferEncoding, callback);
  };

  // Monkey patch res.end
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: BufferEncoding | ((error: Error | null | undefined) => void), callback?: any): Response {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const body = Buffer.concat(chunks).toString("utf8");
    const diff = process.hrtime(startTime);
    const responseTime = diff[0] * 1e3 + diff[1] / 1e6; // ms

    // Metrics
    const metrics = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      requestSize: req.socket.bytesRead,   // bytes in
      responseSize: Buffer.byteLength(body), // bytes out
      responseTime: `${responseTime.toFixed(2)} ms`,
    };

    // eslint-disable-next-line no-console
    console.log("📊 API Metrics:", metrics);

    return originalEnd.call(res, chunk, encoding as BufferEncoding, callback);
  };

  next();
};
