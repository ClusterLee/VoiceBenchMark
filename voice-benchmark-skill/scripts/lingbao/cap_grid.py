#!/usr/bin/env python3
"""截屏并叠加坐标网格，方便人眼直读 tap 坐标。

用法:
  cap_grid.py <input.png> <output.png> [step=100]

输入: adb screencap -p 拉下来的原始 PNG（横屏 2400×1080）
输出: 叠加坐标网格的 PNG
  - 每 step 像素一条浅色细线
  - 每 200 像素一条加粗线 + 坐标标签
  - 左上角写明分辨率
"""
import sys
from PIL import Image, ImageDraw, ImageFont

def main():
    if len(sys.argv) < 3:
        print("usage: cap_grid.py <input.png> <output.png> [step=100]", file=sys.stderr)
        sys.exit(2)

    src = sys.argv[1]
    dst = sys.argv[2]
    step = int(sys.argv[3]) if len(sys.argv) > 3 else 100

    img = Image.open(src).convert("RGB")
    W, H = img.size
    draw = ImageDraw.Draw(img, "RGBA")

    # 字体
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
        font_big = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
    except Exception:
        font = ImageFont.load_default()
        font_big = font

    LIGHT = (255, 0, 0, 60)    # 细网格半透明红
    HEAVY = (255, 0, 0, 180)   # 粗网格不透明红
    LABEL_BG = (0, 0, 0, 200)
    LABEL_FG = (255, 255, 0)

    # 垂直线 (X 轴)
    for x in range(0, W + 1, step):
        is_heavy = (x % 200 == 0)
        draw.line([(x, 0), (x, H)], fill=HEAVY if is_heavy else LIGHT,
                  width=2 if is_heavy else 1)
        if is_heavy and x < W:
            # 顶部坐标标签
            draw.rectangle([x + 2, 2, x + 70, 30], fill=LABEL_BG)
            draw.text((x + 6, 4), f"x={x}", fill=LABEL_FG, font=font)
            # 底部坐标标签
            draw.rectangle([x + 2, H - 30, x + 70, H - 2], fill=LABEL_BG)
            draw.text((x + 6, H - 28), f"x={x}", fill=LABEL_FG, font=font)

    # 水平线 (Y 轴)
    for y in range(0, H + 1, step):
        is_heavy = (y % 200 == 0)
        draw.line([(0, y), (W, y)], fill=HEAVY if is_heavy else LIGHT,
                  width=2 if is_heavy else 1)
        if is_heavy and y < H:
            # 左侧坐标标签
            draw.rectangle([2, y + 2, 90, y + 30], fill=LABEL_BG)
            draw.text((6, y + 4), f"y={y}", fill=LABEL_FG, font=font)
            # 右侧坐标标签
            draw.rectangle([W - 90, y + 2, W - 2, y + 30], fill=LABEL_BG)
            draw.text((W - 86, y + 4), f"y={y}", fill=LABEL_FG, font=font)

    # 标题
    title = f"{W}x{H} grid={step}px (heavy=200px)"
    draw.rectangle([W // 2 - 200, 2, W // 2 + 200, 36], fill=(0, 0, 0, 220))
    draw.text((W // 2 - 195, 4), title, fill=(0, 255, 255), font=font_big)

    img.save(dst, "PNG", optimize=True)
    print(f"OK {W}x{H} -> {dst}")

if __name__ == "__main__":
    main()
