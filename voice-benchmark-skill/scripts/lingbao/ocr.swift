// ocr.swift — macOS Vision Framework 中文 OCR
//
// 用法:
//   swift ocr.swift <image.png>                            # 全图 accurate
//   swift ocr.swift <image.png> --fast                     # 全图 fast
//   swift ocr.swift <image.png> --roi <y1> <y2>            # 仅 OCR 这一行像素带 (y1..y2)，accurate
//   swift ocr.swift <image.png> --roi <y1> <y2> --fast     # ROI + fast
//
// 输出: 每行 "x1,y1,x2,y2\tTEXT"  bbox 是 *原图* 绝对像素坐标（即使裁剪了 ROI）
//
import Foundation
import Vision
import AppKit

let args = CommandLine.arguments
guard args.count >= 2 else {
    print("usage: ocr.swift <image> [--roi <y1> <y2>] [--fast]")
    exit(1)
}
let path = args[1]

// 解析参数
var roiY1: Int? = nil
var roiY2: Int? = nil
var fastMode = false
var i = 2
while i < args.count {
    let a = args[i]
    if a == "--roi" && i + 2 < args.count {
        roiY1 = Int(args[i+1])
        roiY2 = Int(args[i+2])
        i += 3
    } else if a == "--fast" {
        fastMode = true
        i += 1
    } else {
        i += 1
    }
}

guard let img = NSImage(contentsOfFile: path),
      let fullCg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    print("ERROR: cannot load \(path)")
    exit(2)
}
let fullW = CGFloat(fullCg.width)
let fullH = CGFloat(fullCg.height)

// ROI 裁剪
var cg: CGImage = fullCg
var W = fullW
var H = fullH
var roiYOffset: Int = 0
if let y1 = roiY1, let y2 = roiY2, y1 >= 0, y2 > y1, y2 <= Int(fullH) {
    let cropRect = CGRect(x: 0, y: y1, width: Int(fullW), height: y2 - y1)
    if let cropped = fullCg.cropping(to: cropRect) {
        cg = cropped
        W = CGFloat(cropped.width)
        H = CGFloat(cropped.height)
        roiYOffset = y1
    }
}

let req = VNRecognizeTextRequest { (r, e) in
    guard let obs = r.results as? [VNRecognizedTextObservation] else { return }
    for o in obs {
        guard let top = o.topCandidates(1).first else { continue }
        // Vision 坐标系：原点左下，归一化 [0,1]
        // 转换为图像绝对像素，原点左上
        let bb = o.boundingBox
        let x1 = Int(bb.minX * W)
        let x2 = Int(bb.maxX * W)
        let y1Local = Int((1 - bb.maxY) * H)
        let y2Local = Int((1 - bb.minY) * H)
        // ROI 偏移恢复到原图坐标
        let y1 = y1Local + roiYOffset
        let y2 = y2Local + roiYOffset
        print("\(x1),\(y1),\(x2),\(y2)\t\(top.string)")
    }
}
req.recognitionLanguages = ["zh-Hans", "en-US"]
req.recognitionLevel = fastMode ? .fast : .accurate
req.usesLanguageCorrection = !fastMode

let handler = VNImageRequestHandler(cgImage: cg, options: [:])
do {
    try handler.perform([req])
} catch {
    print("ERROR: \(error)")
    exit(3)
}
