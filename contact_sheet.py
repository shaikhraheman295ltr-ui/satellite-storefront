from PIL import Image, ImageDraw
import os

files = [f for f in os.listdir('public/images') if f.endswith('.webp') and f[0].isdigit()]
files.sort(key=lambda f: int(f.split('.')[0]))
thumb_w, thumb_h = 320, 320
cols = 5
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * thumb_w, rows * (thumb_h + 26)), '#111')
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    p = os.path.join('public/images', f)
    src = Image.open(p)
    im = src.convert('RGB')
    im.thumbnail((thumb_w - 8, thumb_h - 34))
    x = (i % cols) * thumb_w
    y = (i // cols) * (thumb_h + 26)
    ox = x + (thumb_w - im.width) // 2
    oy = y + (thumb_h - 26 - im.height) // 2
    sheet.paste(im, (ox, oy))
    d.text((x + 6, y + thumb_h - 22), f'{f}  {src.size[0]}x{src.size[1]}', fill='#fff')
sheet.save('qa/contact-sheet.jpg', quality=85)
print('saved', sheet.size, len(files))
